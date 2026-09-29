import { PROCTOR_CONFIG as C } from '../config/proctorConfig';

export class ObjectMonitor {
  private streak = new Map<string, number>();
  private lastFired = new Map<string, number>();

  /** Returns the classes that should raise an alert right now. */
  update(detections: { categoryName: string; score: number }[], now: number): string[] {
    const seen = new Set(
      detections
        .filter(d => (C.object.classes as readonly string[]).includes(d.categoryName as any)
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
