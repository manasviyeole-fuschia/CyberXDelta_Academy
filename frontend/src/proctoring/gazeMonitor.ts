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
      this.violationFired = true;
      return { kind: 'violation', durationMs: elapsed };
    }
    if (elapsed >= g.nudgeAfterMs && !this.nudged) {
      this.nudged = true;
      return { kind: 'nudge' };
    }
    return { kind: 'ok' };
  }

  reset() { 
    this.awaySince = null; 
    this.lastTick = null; 
    this.nudged = false; 
    this.violationFired = false; 
  }
}
