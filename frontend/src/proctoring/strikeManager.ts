import { PROCTOR_CONFIG as C } from '../config/proctorConfig';

export function evaluateStrikes(count: number) {
  if (C.strikes.autoTerminateAt !== null && count >= C.strikes.autoTerminateAt) return 'TERMINATE';
  if (count >= C.strikes.flagAt) return 'FLAG_FOR_REVIEW';
  return 'WARN';
}
