import type { WeatherForecast } from "../integrations/weather";

const STORAGE_KEY = "goreecloud.newsweather.weather-cache.v1";

interface StoredWeatherCache {
  readonly query: string;
  readonly forecast: WeatherForecast;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isWeatherForecast(value: unknown): value is WeatherForecast {
  if (!isRecord(value) || !isRecord(value.location) || !isRecord(value.current)) {
    return false;
  }

  return (
    typeof value.providerId === "string" &&
    typeof value.providerLabel === "string" &&
    typeof value.providerAttribution === "string" &&
    typeof value.fetchedAt === "string" &&
    typeof value.location.label === "string" &&
    typeof value.current.time === "string" &&
    typeof value.current.temperatureCelsius === "number" &&
    typeof value.current.weatherCode === "number" &&
    Array.isArray(value.hourly) &&
    Array.isArray(value.daily)
  );
}

export function loadWeatherCache(query: string): WeatherForecast | null {
  const normalized = query.trim();
  if (!normalized) return null;

  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || parsed.query !== normalized || !isWeatherForecast(parsed.forecast)) {
      return null;
    }

    return parsed.forecast;
  } catch {
    return null;
  }
}

export function saveWeatherCache(query: string, forecast: WeatherForecast): void {
  const normalized = query.trim();
  if (!normalized) return;

  const stored: StoredWeatherCache = { query: normalized, forecast };

  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Cache failure must never block normal weather use.
  }
}

export function clearWeatherCache(): void {
  try {
    globalThis.localStorage?.removeItem(STORAGE_KEY);
  } catch {
    // Clearing cache is best-effort in restricted storage environments.
  }
}
