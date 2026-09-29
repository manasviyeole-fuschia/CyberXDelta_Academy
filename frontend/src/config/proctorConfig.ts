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
    autoTerminateAt: 3,
  },
  inference: { fps: 5 },
  spotCheck: { minIntervalMs: 30_000, maxIntervalMs: 60_000 },
} as const;

export type ProctorConfig = typeof PROCTOR_CONFIG;
