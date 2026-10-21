// Charting requires strictly increasing Unix-second timestamps.
// Keep the last quote for repeated timestamps without changing its price or volume.
export function normalizeChartPoints<T extends { time: number | string }>(points: readonly T[]): (T & { time: number })[] {
  const byTime = new Map<number, T & { time: number }>();
  for (const point of points) {
    let time = typeof point.time === 'number' ? point.time : Number(point.time);
    if (!Number.isFinite(time)) time = Date.parse(String(point.time)) / 1000;
    if (time > 1000000000000) time /= 1000;
    time = Math.floor(time);
    if (!Number.isFinite(time) || time <= 0) continue;
    byTime.set(time, { ...point, time });
  }
  return [...byTime.values()].sort((a,b) => a.time - b.time);
}
