import { ProcessPeriod } from '../config';

export default function getPeriodKey(date: Date, period: ProcessPeriod): number {
  const totalMs = date.getTime();
  let key: number;
  // by hour
  if (period === ProcessPeriod.HOUR) {
    const m = date.getMinutes();
    const s = date.getSeconds();
    const ms = date.getMilliseconds();
    key = totalMs - ms - s * 1000 - m * 60 * 1000;
  }
  // by minute
  else if (period === ProcessPeriod.MINUTE) {
    const ms = date.getMilliseconds();
    const s = date.getSeconds();
    key = totalMs - ms - s * 1000;
  }
  // by second
  else if (period === ProcessPeriod.SECOND) {
    const ms = date.getMilliseconds();
    key = totalMs - ms;
  }
  // unknown
  else {
    throw Error(`unknown period: ${period}`);
  }
  return key;
}
