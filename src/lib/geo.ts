// Normalize longitude into the range [-180, 180)
export function normalizeLongitude(value: number): number {
  if (!isFinite(value)) return value;
  let v = value;
  v = ((v + 180) % 360 + 360) % 360 - 180;
  // treat -180 as 180 (optional) — keep as -180
  return v;
}

// Normalize latitude into the range [-90, 90]
export function normalizeLatitude(value: number): number {
  if (!isFinite(value)) return value;
  // Clamp latitude to [-90, 90]
  if (value > 90) return 90;
  if (value < -90) return -90;
  return value;
}

export default { normalizeLongitude, normalizeLatitude };
