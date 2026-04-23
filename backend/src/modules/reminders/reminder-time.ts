import { DateTime } from "luxon";

/** Next daily occurrence at local clock time (not yet passed today in zone). */
export function computeNextTriggerUtc(params: {
  timezone: string;
  localHour: number;
  localMinute: number;
}): Date {
  const zone = params.timezone;
  const now = DateTime.now().setZone(zone);
  let candidate = now.set({
    hour: params.localHour,
    minute: params.localMinute,
    second: 0,
    millisecond: 0,
  });
  if (candidate <= now) {
    candidate = candidate.plus({ days: 1 });
  }
  return candidate.toUTC().toJSDate();
}

/** After a fire, schedule the same local time on the next calendar day. */
export function computeNextTriggerAfterFire(params: {
  timezone: string;
  localHour: number;
  localMinute: number;
  firedAt: Date;
}): Date {
  const zone = params.timezone;
  const fired = DateTime.fromJSDate(params.firedAt).setZone(zone);
  return fired
    .plus({ days: 1 })
    .set({
      hour: params.localHour,
      minute: params.localMinute,
      second: 0,
      millisecond: 0,
    })
    .toUTC()
    .toJSDate();
}
