import type { TextSizePreference, ThemePreference } from "../config/product";
import type {
  PrecipitationUnit,
  TemperatureUnit,
  WindUnit,
} from "../weather-units";

const STORAGE_KEY = "goreecloud.newsweather.preferences.v1";
export const MAX_SAVED_WEATHER_LOCATIONS = 8;

export interface Preferences {
  readonly onboardingComplete: boolean;
  readonly hintsEnabled: boolean;
  readonly manualWeatherLocation: string;
  readonly savedWeatherLocations: readonly string[];
  readonly theme: ThemePreference;
  readonly textSize: TextSizePreference;
  readonly temperatureUnit: TemperatureUnit;
  readonly windUnit: WindUnit;
  readonly precipitationUnit: PrecipitationUnit;
}

export const DEFAULT_PREFERENCES: Preferences = Object.freeze({
  onboardingComplete: false,
  hintsEnabled: true,
  manualWeatherLocation: "",
  savedWeatherLocations: [],
  theme: "system",
  textSize: "system",
  temperatureUnit: "celsius",
  windUnit: "kmh",
  precipitationUnit: "mm",
});

function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

function isTextSizePreference(value: unknown): value is TextSizePreference {
  return value === "system" || value === "large" || value === "extra-large";
}

function isTemperatureUnit(value: unknown): value is TemperatureUnit {
  return value === "celsius" || value === "fahrenheit";
}

function isWindUnit(value: unknown): value is WindUnit {
  return value === "kmh" || value === "mph";
}

function isPrecipitationUnit(value: unknown): value is PrecipitationUnit {
  return value === "mm" || value === "inches";
}

export function normalizeWeatherLocation(value: string): string {
  return value.trim().replaceAll(/\s+/g, " ").slice(0, 160);
}

export function normalizeSavedWeatherLocations(value: unknown): readonly string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const result: string[] = [];
  const seen = new Set<string>();

  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }

    const normalized = normalizeWeatherLocation(item);
    if (!normalized) {
      continue;
    }

    const key = normalized.toLocaleLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(normalized);

    if (result.length >= MAX_SAVED_WEATHER_LOCATIONS) {
      break;
    }
  }

  return result;
}

export function addSavedWeatherLocation(
  locations: readonly string[],
  location: string,
): readonly string[] {
  return normalizeSavedWeatherLocations([...locations, location]);
}

export function removeSavedWeatherLocation(
  locations: readonly string[],
  index: number,
): readonly string[] {
  if (!Number.isInteger(index) || index < 0 || index >= locations.length) {
    return normalizeSavedWeatherLocations(locations);
  }

  return normalizeSavedWeatherLocations(locations.filter((_, itemIndex) => itemIndex !== index));
}

export function loadPreferences(): Preferences {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PREFERENCES;
    }

    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return {
      onboardingComplete: parsed.onboardingComplete === true,
      hintsEnabled: parsed.hintsEnabled !== false,
      manualWeatherLocation:
        typeof parsed.manualWeatherLocation === "string"
          ? normalizeWeatherLocation(parsed.manualWeatherLocation)
          : "",
      savedWeatherLocations: normalizeSavedWeatherLocations(parsed.savedWeatherLocations),
      theme: isThemePreference(parsed.theme) ? parsed.theme : "system",
      textSize: isTextSizePreference(parsed.textSize) ? parsed.textSize : "system",
      temperatureUnit: isTemperatureUnit(parsed.temperatureUnit)
        ? parsed.temperatureUnit
        : "celsius",
      windUnit: isWindUnit(parsed.windUnit) ? parsed.windUnit : "kmh",
      precipitationUnit: isPrecipitationUnit(parsed.precipitationUnit)
        ? parsed.precipitationUnit
        : "mm",
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(preferences: Preferences): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Local storage can be unavailable in privacy-restricted environments.
    // The application remains usable with in-memory defaults.
  }
}
