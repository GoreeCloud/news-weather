import type { ThemePreference } from "../config/product";
import type {
  PrecipitationUnit,
  TemperatureUnit,
  WindUnit,
} from "../weather-units";

const STORAGE_KEY = "goreecloud.newsweather.preferences.v1";

export interface Preferences {
  readonly onboardingComplete: boolean;
  readonly hintsEnabled: boolean;
  readonly manualWeatherLocation: string;
  readonly theme: ThemePreference;
  readonly temperatureUnit: TemperatureUnit;
  readonly windUnit: WindUnit;
  readonly precipitationUnit: PrecipitationUnit;
}

export const DEFAULT_PREFERENCES: Preferences = Object.freeze({
  onboardingComplete: false,
  hintsEnabled: true,
  manualWeatherLocation: "",
  theme: "system",
  temperatureUnit: "celsius",
  windUnit: "kmh",
  precipitationUnit: "mm",
});

function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
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
          ? parsed.manualWeatherLocation.slice(0, 160)
          : "",
      theme: isThemePreference(parsed.theme) ? parsed.theme : "system",
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
