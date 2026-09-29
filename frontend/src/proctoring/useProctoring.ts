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
  video: React.RefObject<HTMLVideoElement | null>,
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
      try {
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
      } catch(e) {
        console.error("useProctoring model load failed", e);
      }
    })();

    return () => { stop = true; if (timer) clearTimeout(timer); };
  }, [enabled, video]);
}
