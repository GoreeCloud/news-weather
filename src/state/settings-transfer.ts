import {
  DEFAULT_PREFERENCES,
  normalizeSavedWeatherLocations,
  normalizeWeatherLocation,
  type Preferences,
} from "./preferences.ts";
import type { TextSizePreference, ThemePreference } from "../config/product";
import type {
  PrecipitationUnit,
  TemperatureUnit,
  WindUnit,
} from "../weather-units";

export const SETTINGS_TRANSFER_SCHEMA = "goreecloud.newsweather.settings";
export const SETTINGS_TRANSFER_VERSION = 1;
export const SETTINGS_IMPORT_MAX_BYTES = 64 * 1024;

export interface TransferablePreferences {
  readonly hintsEnabled: boolean;
  readonly manualWeatherLocation: string;
  readonly savedWeatherLocations: readonly string[];
  readonly theme: ThemePreference;
  readonly textSize: TextSizePreference;
  readonly temperatureUnit: TemperatureUnit;
  readonly windUnit: WindUnit;
  readonly precipitationUnit: PrecipitationUnit;
}

export interface SettingsTransferDocument {
  readonly schema: typeof SETTINGS_TRANSFER_SCHEMA;
  readonly version: typeof SETTINGS_TRANSFER_VERSION;
  readonly exportedAt: string;
  readonly preferences: TransferablePreferences;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTheme(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

function isTextSize(value: unknown): value is TextSizePreference {
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

export function buildSettingsTransfer(
  preferences: Preferences,
  exportedAt = new Date().toISOString(),
): SettingsTransferDocument {
  return {
    schema: SETTINGS_TRANSFER_SCHEMA,
    version: SETTINGS_TRANSFER_VERSION,
    exportedAt,
    preferences: {
      hintsEnabled: preferences.hintsEnabled,
      manualWeatherLocation: normalizeWeatherLocation(preferences.manualWeatherLocation),
      savedWeatherLocations: normalizeSavedWeatherLocations(
        preferences.savedWeatherLocations,
      ),
      theme: preferences.theme,
      textSize: preferences.textSize,
      temperatureUnit: preferences.temperatureUnit,
      windUnit: preferences.windUnit,
      precipitationUnit: preferences.precipitationUnit,
    },
  };
}

export function serializeSettingsTransfer(preferences: Preferences): string {
  return JSON.stringify(buildSettingsTransfer(preferences), null, 2) + "\n";
}

export function parseSettingsTransfer(text: string): TransferablePreferences {
  if (new TextEncoder().encode(text).byteLength > SETTINGS_IMPORT_MAX_BYTES) {
    throw new Error("Settings import exceeds the 64 KiB safety limit.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Settings import is not valid JSON.");
  }

  if (
    !isRecord(parsed) ||
    parsed.schema !== SETTINGS_TRANSFER_SCHEMA ||
    parsed.version !== SETTINGS_TRANSFER_VERSION ||
    !isRecord(parsed.preferences)
  ) {
    throw new Error("Settings import does not match the supported News & Weather schema.");
  }

  const value = parsed.preferences;
  return {
    hintsEnabled:
      typeof value.hintsEnabled === "boolean"
        ? value.hintsEnabled
        : DEFAULT_PREFERENCES.hintsEnabled,
    manualWeatherLocation:
      typeof value.manualWeatherLocation === "string"
        ? normalizeWeatherLocation(value.manualWeatherLocation)
        : "",
    savedWeatherLocations: normalizeSavedWeatherLocations(
      value.savedWeatherLocations,
    ),
    theme: isTheme(value.theme) ? value.theme : DEFAULT_PREFERENCES.theme,
    textSize: isTextSize(value.textSize)
      ? value.textSize
      : DEFAULT_PREFERENCES.textSize,
    temperatureUnit: isTemperatureUnit(value.temperatureUnit)
      ? value.temperatureUnit
      : DEFAULT_PREFERENCES.temperatureUnit,
    windUnit: isWindUnit(value.windUnit)
      ? value.windUnit
      : DEFAULT_PREFERENCES.windUnit,
    precipitationUnit: isPrecipitationUnit(value.precipitationUnit)
      ? value.precipitationUnit
      : DEFAULT_PREFERENCES.precipitationUnit,
  };
}

export function mergeImportedSettings(
  current: Preferences,
  imported: TransferablePreferences,
): Preferences {
  return {
    ...current,
    ...imported,
    onboardingComplete: current.onboardingComplete,
  };
}
