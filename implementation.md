# CyberXDelta Academy: Stricter AI-Proctoring Implementation Plan

**Goal:** Harden the existing proctored exam platform so that looking away or head movement beyond a set tolerance for more than **10 seconds**, or detection of prohibited objects (phone, book, laptop, etc.), generates an alert and a warning, with an industry-standard evidence, integrity and review pipeline behind it.

**Stack:** React 19 + Vite (frontend), Node.js + Express (backend), `@mediapipe/tasks-vision` (client-side AI).

---

## 1. Design Decisions (settle these first)

### 1.1 "No head movement" is implemented as a tolerance cone plus a time limit
Literal zero movement flags nearly everyone (breathing, blinking, shifting while reading). The industry approach:

| Condition | Rule |
|---|---|
| Head pose outside cone | Yaw > ±25° or pitch > ±20° |
| Eyes off-screen | Gaze blendshape score > 0.6 |
| Soft nudge | Continuously off-screen for 5 s |
| Violation | Continuously off-screen for **10 s** |
| Cumulative rule | Total off-screen time > 60 s per exam raises a flag |

All values live in one config file so they can be tuned after the pilot.

### 1.2 AI flags, humans decide
The client AI is a detector and warning system. The final integrity decision belongs to a human in `AdminProctorCenter`. Auto-termination is an opt-in config (`autoTerminateAt`), off by default.

### 1.3 Accept the limits of browser proctoring
A browser cannot stop a second device or a virtual machine. Mitigations are evidence snapshots, random spot-checks, server-side integrity checks and human review.

---

## 2. Target Architecture

```
Candidate browser
├── PreTestVerification (8-step wizard + consent)
├── ExamEngine
│   ├── useProctoring()      FaceLandmarker + ObjectDetector loop (~5 FPS)
│   ├── useLockdown()        fullscreen / tab / clipboard / monitor checks
│   ├── StrikeManager        strike count, escalation
│   └── WarningModal         blocking acknowledgement UI
└── ProctorClient            signs events (HMAC), sequence numbers, retries

Backend (Express)
├── /session                 create session, issue signed token + event key
├── /session/:id/heartbeat   liveness + server-authoritative timer
├── /session/:id/events      validate seq + HMAC, store event
├── /session/:id/snapshot    upload evidence to object storage
└── /admin/*                 review queue, timeline, decisions, audit log

Storage
├── DB (Postgres/Mongo)      sessions, events, decisions, audit_log
└── Object storage (S3)      encrypted snapshots, signed URLs
```

---

## 3. Phase 1: Detection Core (1 to 1.5 weeks)

### 3.1 Central configuration

`frontend/src/config/proctorConfig.ts`

```ts
export const PROCTOR_CONFIG = {
  gaze: {
    maxYawDeg: 25,
    maxPitchDeg: 20,
    eyeOffScreenScore: 0.6,
    nudgeAfterMs: 5_000,
    violationAfterMs: 10_000,
    cumulativeLimitMs: 60_000,
  },
  object: {
    classes: ['cell phone', 'book', 'laptop', 'remote'] as const,
    minScore: 0.5,
    confirmFrames: 3,        // consecutive detections required
    cooldownMs: 15_000,      // per object class
  },
  face: {
    noFaceAfterMs: 3_000,
    multiFaceConfirmFrames: 3,
  },
  strikes: {
    warnAt: 1,
    flagAt: 3,
    autoTerminateAt: null as number | null, // null = human decides
  },
  inference: { fps: 5 },
  spotCheck: { minIntervalMs: 30_000, maxIntervalMs: 60_000 },
} as const;

export type ProctorConfig = typeof PROCTOR_CONFIG;
```

### 3.2 Migrate FaceDetector to FaceLandmarker
`FaceDetector` only returns a bounding box and a few keypoints, which is not enough for gaze or head pose. `FaceLandmarker` returns landmarks, blendshapes and a facial transformation matrix. Keep `ObjectDetector` for objects.

`frontend/src/proctoring/models.ts`

```ts
import { FilesetResolver, FaceLandmarker, ObjectDetector } from '@mediapipe/tasks-vision';

export async function loadModels() {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm' // or self-host
  );

  const face = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: '/models/face_landmarker.task', delegate: 'GPU' },
    runningMode: 'VIDEO',
    numFaces: 2,                          // needed to detect a second person
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
  });

  const objects = await ObjectDetector.createFromOptions(vision, {
    baseOptions: { modelAssetPath: '/models/efficientdet_lite0.tflite', delegate: 'GPU' },
    runningMode: 'VIDEO',
    scoreThreshold: 0.4,
    maxResults: 8,
  });

  return { face, objects };
}
```

Self-host the model files and WASM (no runtime CDN dependency) so the exam cannot fail because a third party is down.

### 3.3 Head pose and gaze helpers

`frontend/src/proctoring/pose.ts`

```ts
export interface Pose { yaw: number; pitch: number; roll: number }

/** Convert MediaPipe's column-major 4x4 transformation matrix to Euler angles (degrees). */
export function poseFromMatrix(m: number[]): Pose {
  // Normalise columns in case the matrix carries scale
  const c0 = Math.hypot(m[0], m[1], m[2]);
  const c1 = Math.hypot(m[4], m[5], m[6]);
  const c2 = Math.hypot(m[8], m[9], m[10]);
  const r00 = m[0] / c0, r01 = m[4] / c1;
  const r02 = m[8] / c2, r12 = m[9] / c2, r22 = m[10] / c2;

  const toDeg = (r: number) => (r * 180) / Math.PI;
  return {
    yaw: toDeg(Math.asin(Math.max(-1, Math.min(1, r02)))),
    pitch: toDeg(Math.atan2(-r12, r22)),
    roll: toDeg(Math.atan2(-r01, r00)),
  };
}
// NOTE: axis signs can differ by camera mirroring. Verify with a quick manual test
// (turn head left/right/up/down) and flip signs if needed. We only use absolute values.

/** Eyes-off-screen score from blendshapes (0 = looking at screen, 1 = far away). */
export function eyeOffScore(shapes: { categoryName: string; score: number }[]): number {
  const s = (name: string) => shapes.find(b => b.categoryName === name)?.score ?? 0;
  const horizontal = Math.max(
    (s('eyeLookOutLeft') + s('eyeLookInRight')) / 2,
    (s('eyeLookInLeft') + s('eyeLookOutRight')) / 2,
  );
  const up = (s('eyeLookUpLeft') + s('eyeLookUpRight')) / 2;
  const down = (s('eyeLookDownLeft') + s('eyeLookDownRight')) / 2;
  return Math.max(horizontal, up, down);
}
```

### 3.4 The 10-second rule (pure, testable state machine)

`frontend/src/proctoring/gazeMonitor.ts`

```ts
import { PROCTOR_CONFIG as C } from '../config/proctorConfig';

export type GazeResult =
  | { kind: 'ok' }
  | { kind: 'nudge' }
  | { kind: 'violation'; durationMs: number }
  | { kind: 'cumulative'; totalMs: number };

export class GazeMonitor {
  private awaySince: number | null = null;
  private lastTick: number | null = null;
  private nudged = false;
  private violationFired = false;
  private cumulativeMs = 0;
  private cumulativeFlagged = false;

  update(yaw: number, pitch: number, eyeOff: number, now: number): GazeResult {
    const g = C.gaze;
    const off =
      Math.abs(yaw) > g.maxYawDeg ||
      Math.abs(pitch) > g.maxPitchDeg ||
      eyeOff > g.eyeOffScreenScore;

    const dt = this.lastTick == null ? 0 : now - this.lastTick;
    this.lastTick = now;

    if (!off) {
      this.awaySince = null;
      this.nudged = false;
      this.violationFired = false;
      return { kind: 'ok' };
    }

    this.awaySince ??= now;
    this.cumulativeMs += dt;
    const elapsed = now - this.awaySince;

    if (!this.cumulativeFlagged && this.cumulativeMs > g.cumulativeLimitMs) {
      this.cumulativeFlagged = true;
      return { kind: 'cumulative', totalMs: this.cumulativeMs };
    }
    if (elapsed >= g.violationAfterMs && !this.violationFired) {
      this.violationFired = true;   // fires once per away-episode
      return { kind: 'violation', durationMs: elapsed };
    }
    if (elapsed >= g.nudgeAfterMs && !this.nudged) {
      this.nudged = true;
      return { kind: 'nudge' };
    }
    return { kind: 'ok' };
  }

  reset() { this.awaySince = null; this.lastTick = null; this.nudged = false; this.violationFired = false; }
}
```

Unit test this class with fake timestamps (no camera needed). It is the heart of the feature.

### 3.5 Object detection with confirm-frames and cooldown

`frontend/src/proctoring/objectMonitor.ts`

```ts
import { PROCTOR_CONFIG as C } from '../config/proctorConfig';

export class ObjectMonitor {
  private streak = new Map<string, number>();
  private lastFired = new Map<string, number>();

  /** Returns the classes that should raise an alert right now. */
  update(detections: { categoryName: string; score: number }[], now: number): string[] {
    const seen = new Set(
      detections
        .filter(d => (C.object.classes as readonly string[]).includes(d.categoryName)
                  && d.score >= C.object.minScore)
        .map(d => d.categoryName),
    );

    const alerts: string[] = [];
    for (const cls of C.object.classes) {
      if (seen.has(cls)) {
        const n = (this.streak.get(cls) ?? 0) + 1;
        this.streak.set(cls, n);
        const last = this.lastFired.get(cls) ?? -Infinity;
        if (n >= C.object.confirmFrames && now - last > C.object.cooldownMs) {
          this.lastFired.set(cls, now);
          alerts.push(cls);
        }
      } else {
        this.streak.set(cls, 0);
      }
    }
    return alerts;
  }
}
```

### 3.6 The `useProctoring` hook

`frontend/src/proctoring/useProctoring.ts`

```ts
import { useEffect, useRef } from 'react';
import { loadModels } from './models';
import { poseFromMatrix, eyeOffScore } from './pose';
import { GazeMonitor } from './gazeMonitor';
import { ObjectMonitor } from './objectMonitor';
import { PROCTOR_CONFIG as C } from '../config/proctorConfig';

export type ProctorSignal =
  | { type: 'GAZE_NUDGE' }
  | { type: 'LOOKING_AWAY'; durationMs: number; yaw: number; pitch: number }
  | { type: 'CUMULATIVE_AWAY'; totalMs: number }
  | { type: 'OBJECT_DETECTED'; object: string; score: number }
  | { type: 'MULTI_FACE'; count: number }
  | { type: 'NO_FACE'; durationMs: number };

export function useProctoring(
  video: React.RefObject<HTMLVideoElement>,
  enabled: boolean,
  onSignal: (s: ProctorSignal) => void,
) {
  const cb = useRef(onSignal);
  cb.current = onSignal;

  useEffect(() => {
    if (!enabled) return;
    let stop = false;
    let timer: number | undefined;

    (async () => {
      const { face, objects } = await loadModels();
      const gaze = new GazeMonitor();
      const obj = new ObjectMonitor();
      let noFaceSince: number | null = null;
      let noFaceFired = false;
      let multiStreak = 0;
      let lastVideoTime = -1;

      const tick = () => {
        if (stop) return;
        const v = video.current;
        if (v && v.readyState >= 2 && v.currentTime !== lastVideoTime) {
          lastVideoTime = v.currentTime;
          const now = performance.now();

          // ---- Face / pose / gaze
          const f = face.detectForVideo(v, now);
          const faces = f.faceLandmarks.length;

          if (faces === 0) {
            noFaceSince ??= now;
            if (now - noFaceSince > C.face.noFaceAfterMs && !noFaceFired) {
              noFaceFired = true;
              cb.current({ type: 'NO_FACE', durationMs: now - noFaceSince });
            }
          } else {
            noFaceSince = null; noFaceFired = false;
          }

          multiStreak = faces > 1 ? multiStreak + 1 : 0;
          if (multiStreak === C.face.multiFaceConfirmFrames) {
            cb.current({ type: 'MULTI_FACE', count: faces });
          }

          if (faces >= 1 && f.facialTransformationMatrixes?.[0]) {
            const pose = poseFromMatrix(Array.from(f.facialTransformationMatrixes[0].data));
            const eyes = eyeOffScore(f.faceBlendshapes?.[0]?.categories ?? []);
            const r = gaze.update(pose.yaw, pose.pitch, eyes, now);
            if (r.kind === 'nudge') cb.current({ type: 'GAZE_NUDGE' });
            if (r.kind === 'violation')
              cb.current({ type: 'LOOKING_AWAY', durationMs: r.durationMs, yaw: pose.yaw, pitch: pose.pitch });
            if (r.kind === 'cumulative') cb.current({ type: 'CUMULATIVE_AWAY', totalMs: r.totalMs });
          } else if (faces === 0) {
            gaze.reset(); // NO_FACE handles this case
          }

          // ---- Objects
          const o = objects.detectForVideo(v, now);
          const flat = o.detections.map(d => ({
            categoryName: d.categories[0].categoryName,
            score: d.categories[0].score,
          }));
          for (const cls of obj.update(flat, now)) {
            const best = flat.find(x => x.categoryName === cls)!;
            cb.current({ type: 'OBJECT_DETECTED', object: cls, score: best.score });
          }
        }
        timer = window.setTimeout(tick, 1000 / C.inference.fps);
      };
      tick();
    })();

    return () => { stop = true; if (timer) clearTimeout(timer); };
  }, [enabled, video]);
}
```

Performance note: run inference at about 5 FPS. If a low-end machine falls behind, reduce FPS but never skip the checks.

### 3.7 Strike manager and warning modal

Signal-to-event mapping:

| Signal | Event type | Severity | Strike | UI |
|---|---|---|---|---|
| `GAZE_NUDGE` (5 s) | none | INFO | No | Toast: "Please look at the screen" |
| `LOOKING_AWAY` (10 s) | `LOOKING_AWAY` | WARNING | Yes | Blocking modal + sound + snapshot |
| `CUMULATIVE_AWAY` (60 s) | `CUMULATIVE_AWAY` | WARNING | No | Flag session, no modal |
| `OBJECT_DETECTED` | `OBJECT_DETECTED` | CRITICAL | Yes | Blocking modal + sound + snapshot |
| `MULTI_FACE` | `MULTI_FACE` | CRITICAL | Yes | Blocking modal + snapshot |
| `NO_FACE` (3 s) | `NO_FACE` | WARNING | Yes | Blocking modal + snapshot |

`frontend/src/proctoring/strikeManager.ts`

```ts
import { PROCTOR_CONFIG as C } from '../config/proctorConfig';

export function evaluateStrikes(count: number) {
  if (C.strikes.autoTerminateAt && count >= C.strikes.autoTerminateAt) return 'TERMINATE';
  if (count >= C.strikes.flagAt) return 'FLAG_FOR_REVIEW';
  return 'WARN';
}
```

`WarningModal` requirements:
- Blocks the question UI until the candidate clicks **"I understand"** (the acknowledgement is logged as an event).
- Shows what was detected (for example, "Mobile phone detected"), the current strike count (for example, "Warning 2 of 3"), and the rule.
- **Does not pause the timer.** The timer is server-authoritative.
- Plays a short alert sound and is announced via `aria-live="assertive"` for accessibility.
- Queues if several alerts fire together (show the highest severity first).

---

## 4. Phase 2: Browser Lockdown (3 to 4 days)

`frontend/src/proctoring/useLockdown.ts` responsibilities:

| Check | Mechanism | Event |
|---|---|---|
| Force fullscreen | `requestFullscreen()`; listen to `fullscreenchange` | `FULLSCREEN_EXIT` |
| Tab or window switch | `visibilitychange`, `window.blur` | `TAB_SWITCH` (record duration) |
| Clipboard, context menu, print | Block `copy`, `cut`, `paste`, `contextmenu`, `beforeprint`, and shortcuts (Ctrl+C/V/P/S, F12, PrintScreen) inside the exam | `BLOCKED_ACTION` (INFO) |
| Multiple monitors | `window.screen.isExtended` (where supported) | `MULTI_MONITOR` |
| Camera or mic lost | `track.onended`, `track.onmute` | `TRACK_LOST` (CRITICAL) |
| DevTools (heuristic) | Window size delta / timing checks | `DEVTOOLS_SUSPECTED` (INFO only, never proof) |
| Reload or close | `beforeunload` guard; resume from server state | `PAGE_RELOAD` |

Rules:
- Every WARNING-level lockdown event counts as a strike (except INFO).
- Heuristic checks (DevTools) are logged for reviewers but never counted as strikes.
- Show the candidate a clear "Return to fullscreen" overlay rather than silently failing.

---

## 5. Phase 3: Backend Hardening (1 to 1.5 weeks)

Client-side AI can be bypassed by anyone who edits JS in DevTools. The server must not trust the client blindly.

### 5.1 Server-authoritative timer
- On session start, the server stores `startedAt` and `endsAt = startedAt + 30 min`.
- The client displays remaining time from the server value (returned on each heartbeat).
- Submissions after `endsAt + grace (5 s)` are rejected or marked late.

### 5.2 Signed session tokens
- Issue a short-lived JWT (10 to 15 min) bound to `sessionId`, refreshed via heartbeat.
- On session creation, also return a random per-session **event key** used for HMAC signing.
- Enforce **one active session per candidate**; a second login invalidates or flags the first.

### 5.3 Event integrity

```ts
// shared/types.ts
export interface ProctorEvent {
  sessionId: string;
  seq: number;              // strictly increasing, starts at 1
  clientTs: number;         // client timestamp
  type:
    | 'LOOKING_AWAY' | 'CUMULATIVE_AWAY' | 'OBJECT_DETECTED' | 'MULTI_FACE'
    | 'NO_FACE' | 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'MULTI_MONITOR'
    | 'TRACK_LOST' | 'SPOT_CHECK' | 'WARNING_ACKNOWLEDGED';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  details: {
    object?: string; score?: number; durationMs?: number;
    yaw?: number; pitch?: number; count?: number;
  };
  snapshotKey?: string;     // object-storage reference, not Base64
  hmac: string;             // HMAC-SHA256(eventKey, canonical JSON of the above)
}
```

Server validation on `POST /session/:id/events`:
1. Verify JWT and that the session is active.
2. Verify HMAC; reject and flag on mismatch.
3. Verify `seq === lastSeq + 1`; a gap flags `EVENT_GAP` for review.
4. Store `receivedAt` (server time) alongside `clientTs`; flag large clock drift.
5. Rate-limit (for example, 30 events/min/session) and validate the schema (Zod or Joi).

Be honest about the limit: the HMAC key is known to the client, so a determined attacker can still forge events. The value is catching casual tampering, replay and gaps, and combining that with the heartbeat and spot-check rules below.

### 5.4 Heartbeat and tamper signals

| Signal | Rule |
|---|---|
| Heartbeat every 10 s | Missing for >30 s raises `HEARTBEAT_LOST` (flag, no strike) |
| Blocked proctoring calls | Heartbeats arrive but zero events and zero spot-checks for a long window raises `SUSPICIOUS_SILENCE` |
| Seq gaps | Raises `EVENT_GAP` |
| Model load failure | Client reports `PROCTOR_UNAVAILABLE`; session is flagged and can fall back to manual review |

### 5.5 Random spot-check snapshots
- Every 30 to 60 s (randomised), capture a snapshot and upload it as a `SPOT_CHECK` event.
- This makes absence of AI events weak evidence of innocence; reviewers can scan the spot-checks.

### 5.6 Evidence storage
- Snapshots are uploaded to object storage (S3 or equivalent) via a presigned URL, **encrypted at rest**, private bucket.
- The DB stores only `snapshotKey`. Admins receive short-lived signed URLs.
- Compress snapshots to JPEG (~640 px wide, quality ~0.7).
- Optional for high-stakes exams: low-bitrate session recording in chunks.

### 5.7 Endpoint summary

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/session` | Create session with profile and baseline snapshot; returns token, event key, `endsAt` |
| POST | `/api/session/:id/heartbeat` | Liveness, token refresh, remaining time |
| POST | `/api/session/:id/events` | Store a signed proctor event |
| POST | `/api/session/:id/snapshot-url` | Get a presigned upload URL |
| POST | `/api/session/:id/submit` | Finish the exam |
| GET | `/api/admin/sessions` | Review queue with filters |
| GET | `/api/admin/sessions/:id` | Session detail, timeline, signed snapshot URLs |
| POST | `/api/admin/sessions/:id/decision` | Cleared / Reviewed / Rejected with notes |
| GET | `/api/admin/audit` | Admin action log |

### 5.8 Data model (relational sketch)

```
sessions(id, candidate_id, status, started_at, ends_at, submitted_at,
         strike_count, risk_score, last_seq, last_heartbeat_at)
proctor_events(id, session_id, seq, type, severity, details_json,
               client_ts, received_at, snapshot_key, hmac_valid)
decisions(id, session_id, reviewer_id, outcome, reason, created_at)
audit_log(id, actor_id, action, target_type, target_id, created_at, ip)
```

Add indexes on `(session_id, seq)` (unique) and `(status, risk_score)`.

---

## 6. Phase 4: Admin / Proctor Center Upgrades (1 week)

- **Timeline view:** events plotted along the exam duration; click to open the snapshot and metadata.
- **Risk score:** weighted sum used to sort the review queue.

| Event | Weight |
|---|---|
| OBJECT_DETECTED | 25 |
| MULTI_FACE | 25 |
| LOOKING_AWAY | 10 |
| NO_FACE | 10 |
| TAB_SWITCH / FULLSCREEN_EXIT | 8 |
| CUMULATIVE_AWAY | 8 |
| HEARTBEAT_LOST / EVENT_GAP / SUSPICIOUS_SILENCE | 15 |

- **Filters:** severity, event type, strike count, status.
- **Baseline vs evidence:** show the baseline verification photo next to flagged snapshots.
- **Decision workflow:** Cleared, Reviewed (with notes), Rejected (**reason mandatory**). Every decision is written to the audit log.
- **Appeal path:** candidate can contest a decision; evidence is retained until resolved.
- **Role-based access:** `proctor` (review), `admin` (decide, configure), `auditor` (read-only).
- **Review metrics:** percentage of AI flags overturned by humans, used to tune thresholds.

---

## 7. Phase 5: Privacy, Compliance and Fairness (1 week)

Camera and biometric-adjacent data must be handled carefully. India's **DPDP Act 2023** applies; **GDPR** applies if you serve EU candidates. This is an engineering checklist, not legal advice; have counsel review it.

- **Consent screen** before the wizard: what is captured (video-derived snapshots, audio levels, browser events), why, who sees it, and how long it is kept. Log the consent with timestamp and version.
- **Data minimisation:** process video locally; only send snapshots and events, not a continuous stream (unless recording is explicitly enabled and disclosed).
- **Retention:** for example, delete snapshots 90 days after the final decision unless an appeal is open. Implement it as a scheduled job.
- **Security:** TLS everywhere, encryption at rest, least-privilege access, all access logged.
- **Candidate rights:** a route to request access to or deletion of their data.
- **Accessibility accommodations:** candidates with motor conditions, vision needs or assistive devices get an alternate profile (wider tolerance cone, longer thresholds, or live human proctoring). Without this, strict gaze rules can be discriminatory.
- **Published proctoring policy:** a short page listing the rules, thresholds, strike system and appeal process, linked from the consent screen.
- **Fallbacks:** if the camera fails or models cannot load, offer a documented alternative rather than a silent fail.

---

## 8. Delivery Timeline

| Phase | Scope | Effort |
|---|---|---|
| 1. Detection core | FaceLandmarker, config, 10 s gaze rule, object confirm-frames, warning modal, strikes | 1 to 1.5 weeks |
| 2. Lockdown | Fullscreen, tab, clipboard, multi-monitor, track-ended handling | 3 to 4 days |
| 3. Backend hardening | Server timer, tokens, HMAC events, seq gaps, object storage, spot-checks | 1 to 1.5 weeks |
| 4. Admin upgrades | Timeline, risk score, decision workflow, audit log, RBAC | 1 week |
| 5. Compliance and QA | Consent, retention job, accessibility profile, load and false-positive testing | 1 week |

**Total:** roughly 5 to 6 weeks for one developer; less with parallel work on frontend and backend.

---

## 9. Testing Strategy

### 9.1 Unit tests
- `GazeMonitor`: no alert under 5 s, nudge at 5 s, one violation at 10 s, reset when the candidate looks back, cumulative flag at 60 s.
- `ObjectMonitor`: no alert for a single frame, alert after 3 consecutive frames, cooldown respected.
- `poseFromMatrix`: known matrices produce expected angles.
- Server: HMAC failure, seq gap, expired token and late submission are rejected or flagged.

### 9.2 Scripted cheat scenarios

| Scenario | Expected result |
|---|---|
| Phone held up to camera | OBJECT_DETECTED, modal, snapshot |
| Phone on desk, partly visible | Detected or covered by spot-checks |
| Looking at notes beside screen >10 s | LOOKING_AWAY, modal |
| Repeated 8 s glances (x8) | CUMULATIVE_AWAY flag |
| Second person behind candidate | MULTI_FACE, modal |
| Leaving the frame | NO_FACE after 3 s |
| Second monitor | MULTI_MONITOR event |
| Alt-tab, exit fullscreen | TAB_SWITCH, FULLSCREEN_EXIT |
| Blocking network calls | HEARTBEAT_LOST or SUSPICIOUS_SILENCE |
| Editing client JS, forging events | HMAC or seq mismatch flagged |
| Covering the camera | NO_FACE plus flat-image spot-checks |

### 9.3 Pilot (before go-live)
- 20 to 30 real users across laptops, lighting, glasses, head coverings and skin tones.
- Measure false-positive rate per rule; adjust the cone, eye threshold and confirm-frames in `PROCTOR_CONFIG`.
- Verify inference at 5 FPS does not lag the exam on low-end machines.

### 9.4 Production metrics
- Flags per session, strikes per session
- Percentage of flags overturned on review (high means thresholds are too strict)
- Appeal rate and appeal success rate
- Inference FPS and model load failures
- Heartbeat loss rate

---

## 10. Acceptance Criteria

- [ ] Looking away or head outside the tolerance cone for more than 10 s produces a WARNING event, a blocking modal, a strike and a snapshot.
- [ ] A nudge appears at 5 s and disappears when the candidate looks back.
- [ ] A phone, book, laptop or remote confirmed over 3 consecutive frames produces a CRITICAL event, a blocking modal, a strike and a snapshot, with a cooldown to prevent spam.
- [ ] A second face or no face for over 3 s is detected and flagged.
- [ ] The candidate always sees their current strike count.
- [ ] Strike 3 flags the session for priority review; no auto-termination unless explicitly enabled.
- [ ] The timer is server-authoritative; warnings never pause it.
- [ ] All events carry seq numbers and HMACs; gaps and bad signatures are flagged.
- [ ] Snapshots live in encrypted object storage; the DB holds only keys.
- [ ] Admins can review a timeline, see the risk score, and record a decision (with a reason on rejection), all audit-logged.
- [ ] Consent is recorded, retention is enforced, and an accommodation profile exists.
- [ ] Pilot results show an acceptable false-positive rate before launch.

---

## 11. Suggested File Structure

```
frontend/src/
├── config/proctorConfig.ts
├── proctoring/
│   ├── models.ts
│   ├── pose.ts
│   ├── gazeMonitor.ts
│   ├── objectMonitor.ts
│   ├── strikeManager.ts
│   ├── useProctoring.ts
│   ├── useLockdown.ts
│   └── proctorClient.ts        # signing, seq, retry queue
└── components/
    ├── WarningModal.tsx
    ├── StrikeBadge.tsx
    ├── PreTestVerification.tsx  # + consent step
    ├── ExamEngine.tsx           # wires hooks + modal
    └── AdminProctorCenter.tsx   # + timeline, risk score, decisions

backend/src/
├── index.ts
├── routes/{session,events,admin}.ts
├── services/{integrity,storage,risk,retention}.ts
├── middleware/{auth,rateLimit,validate}.ts
└── models.ts
```

---

## 12. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| False positives from strict gaze rules | Tolerance cone, confirm-frames, human final decision, pilot tuning |
| Bias across lighting, skin tone, glasses, disabilities | Pilot diversity, accommodation profile, monitor overturn rates |
| Client tampering | Server timer, HMAC and seq, heartbeat, spot-checks |
| Second device or VM cheating | Cannot be fully prevented in-browser; rely on spot-checks, review, optional recording |
| Low-end machines lag | Adaptive FPS, GPU delegate, lightweight model |
| Privacy or regulatory exposure | Consent, minimisation, retention job, legal review |
| Model or CDN outage during exam | Self-host models, `PROCTOR_UNAVAILABLE` fallback to manual review |
