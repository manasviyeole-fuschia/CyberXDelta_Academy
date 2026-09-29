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
