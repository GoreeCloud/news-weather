import type {
  CurrentConditions,
  DailyForecast,
  HourlyForecastPoint,
  WeatherForecast,
  WeatherLocation,
} from "../integrations/weather";

const STORAGE_KEY = "goreecloud.newsweather.weather-cache.v1";
const CACHE_VERSION = 1;
const MAX_CACHE_AGE_MS = 24 * 60 * 60 * 1000;

interface WeatherCacheRecord {
  readonly version: 1;
  readonly query: string;
  readonly savedAt: string;
  readonly forecast: WeatherForecast;
}

export interface LoadedWeatherCache {
  readonly forecast: WeatherForecast;
  readonly savedAt: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isOptionalNumber(value: unknown): value is number | undefined {
  return value === undefined || isFiniteNumber(value);
}

function isLocation(value: unknown): value is WeatherLocation {
  if (!isRecord(value) || typeof value.label !== "string") {
    return false;
  }

  return (
    (value.country === undefined || typeof value.country === "string") &&
    (value.admin1 === undefined || typeof value.admin1 === "string") &&
    (value.timezone === undefined || typeof value.timezone === "string")
  );
}

function isCurrentConditions(value: unknown): value is CurrentConditions {
  if (
    !isRecord(value) ||
    typeof value.time !== "string" ||
    !isFiniteNumber(value.temperatureCelsius) ||
    !isFiniteNumber(value.weatherCode)
  ) {
    return false;
  }

  return (
    isOptionalNumber(value.apparentTemperatureCelsius) &&
    isOptionalNumber(value.relativeHumidityPercent) &&
    isOptionalNumber(value.precipitationMm) &&
    isOptionalNumber(value.windSpeedKmh) &&
    isOptionalNumber(value.windDirectionDegrees)
  );
}

function isHourlyPoint(value: unknown): value is HourlyForecastPoint {
  if (
    !isRecord(value) ||
    typeof value.time !== "string" ||
    !isFiniteNumber(value.temperatureCelsius) ||
    !isFiniteNumber(value.weatherCode)
  ) {
    return false;
  }

  return (
    isOptionalNumber(value.precipitationProbabilityPercent) &&
    isOptionalNumber(value.precipitationMm) &&
    isOptionalNumber(value.windSpeedKmh) &&
    isOptionalNumber(value.windDirectionDegrees)
  );
}

function isDailyForecast(value: unknown): value is DailyForecast {
  if (
    !isRecord(value) ||
    typeof value.date !== "string" ||
    !isFiniteNumber(value.weatherCode) ||
    !isFiniteNumber(value.highCelsius) ||
    !isFiniteNumber(value.lowCelsius)
  ) {
    return false;
  }

  return (
    isOptionalNumber(value.precipitationProbabilityPercent) &&
    isOptionalNumber(value.precipitationMm) &&
    (value.sunrise === undefined || typeof value.sunrise === "string") &&
    (value.sunset === undefined || typeof value.sunset === "string")
  );
}

function isWeatherForecast(value: unknown): value is WeatherForecast {
  if (
    !isRecord(value) ||
    typeof value.providerId !== "string" ||
    typeof value.providerLabel !== "string" ||
    typeof value.providerAttribution !== "string" ||
    typeof value.fetchedAt !== "string" ||
    !isLocation(value.location) ||
    !isCurrentConditions(value.current) ||
    !Array.isArray(value.hourly) ||
    !value.hourly.every(isHourlyPoint) ||
    !Array.isArray(value.daily) ||
    !value.daily.every(isDailyForecast)
  ) {
    return false;
  }

  return Number.isFinite(new Date(value.fetchedAt).valueOf());
}

function normalizeQuery(value: string): string {
  return value.trim().replaceAll(/\s+/g, " ").toLocaleLowerCase();
}

export function loadWeatherCache(query: string): LoadedWeatherCache | null {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) {
    return null;
  }

  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (
      !isRecord(parsed) ||
      parsed.version !== CACHE_VERSION ||
      typeof parsed.query !== "string" ||
      typeof parsed.savedAt !== "string" ||
      !isWeatherForecast(parsed.forecast)
    ) {
      clearWeatherCache();
      return null;
    }

    const savedAt = new Date(parsed.savedAt);
    if (!Number.isFinite(savedAt.valueOf()) || Date.now() - savedAt.valueOf() > MAX_CACHE_AGE_MS) {
      clearWeatherCache();
      return null;
    }

    if (normalizeQuery(parsed.query) !== normalizedQuery) {
      return null;
    }

    return {
      forecast: parsed.forecast,
      savedAt: parsed.savedAt,
    };
  } catch {
    clearWeatherCache();
    return null;
  }
}

export function saveWeatherCache(query: string, forecast: WeatherForecast): void {
  const normalizedQuery = query.trim().replaceAll(/\s+/g, " ");
  if (!normalizedQuery || !isWeatherForecast(forecast)) {
    return;
  }

  const record: WeatherCacheRecord = {
    version: CACHE_VERSION,
    query: normalizedQuery,
    savedAt: new Date().toISOString(),
    forecast,
  };

  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Cache persistence is optional. The live forecast remains usable in memory.
  }
}

export function clearWeatherCache(): void {
  try {
    globalThis.localStorage?.removeItem(STORAGE_KEY);
  } catch {
    // Storage may be unavailable or restricted.
  }
}

export const WEATHER_CACHE_MAX_AGE_MS = MAX_CACHE_AGE_MS;
