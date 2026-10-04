const COMPASS_POINTS = [
  "N", "NNE", "NE", "ENE",
  "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW",
  "W", "WNW", "NW", "NNW",
] as const;

export function formatWindDirection(degrees: number | undefined): string {
  if (degrees === undefined || !Number.isFinite(degrees)) {
    return "—";
  }

  const normalized = ((degrees % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % COMPASS_POINTS.length;
  const compass = COMPASS_POINTS[index] ?? "N";
  return `${compass} · ${Math.round(normalized)}°`;
}

export function formatForecastLocalTime(value: string | undefined): string {
  if (!value) {
    return "—";
  }

  const time = value.includes("T") ? value.split("T")[1] : value;
  if (!time) {
    return value;
  }

  const [hourText, minuteText] = time.split(":");
  const hour = Number(hourText);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    return value;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minuteText ?? "00"} ${suffix}`;
}
