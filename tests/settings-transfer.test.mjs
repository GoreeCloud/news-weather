import assert from "node:assert/strict";
import { test } from "node:test";
import {
  SETTINGS_IMPORT_MAX_BYTES,
  SETTINGS_TRANSFER_SCHEMA,
  SETTINGS_TRANSFER_VERSION,
  buildSettingsTransfer,
  mergeImportedSettings,
  parseSettingsTransfer,
  serializeSettingsTransfer,
} from "../src/state/settings-transfer.ts";
import { DEFAULT_PREFERENCES } from "../src/state/preferences.ts";

const samplePreferences = {
  ...DEFAULT_PREFERENCES,
  onboardingComplete: true,
  hintsEnabled: false,
  manualWeatherLocation: "  Jacksonville,   FL ",
  savedWeatherLocations: ["Jacksonville, FL", "Birmingham, AL"],
  theme: "dark",
  textSize: "large",
  temperatureUnit: "fahrenheit",
  windUnit: "mph",
  precipitationUnit: "inches",
};

test("settings export excludes device/session state and normalizes portable preferences", () => {
  const doc = buildSettingsTransfer(
    samplePreferences,
    "2026-10-04T12:00:00.000Z",
  );

  assert.equal(doc.schema, SETTINGS_TRANSFER_SCHEMA);
  assert.equal(doc.version, SETTINGS_TRANSFER_VERSION);
  assert.equal(doc.exportedAt, "2026-10-04T12:00:00.000Z");
  assert.equal("onboardingComplete" in doc.preferences, false);
  assert.equal(doc.preferences.manualWeatherLocation, "Jacksonville, FL");
  assert.deepEqual(doc.preferences.savedWeatherLocations, [
    "Jacksonville, FL",
    "Birmingham, AL",
  ]);
});

test("settings export round-trips supported values", () => {
  const serialized = serializeSettingsTransfer(samplePreferences);
  const parsed = parseSettingsTransfer(serialized);

  assert.equal(parsed.theme, "dark");
  assert.equal(parsed.textSize, "large");
  assert.equal(parsed.temperatureUnit, "fahrenheit");
  assert.equal(parsed.windUnit, "mph");
  assert.equal(parsed.precipitationUnit, "inches");
  assert.equal(parsed.hintsEnabled, false);
  assert.equal(parsed.manualWeatherLocation, "Jacksonville, FL");
});

test("settings import falls back safely for invalid optional values", () => {
  const parsed = parseSettingsTransfer(JSON.stringify({
    schema: SETTINGS_TRANSFER_SCHEMA,
    version: SETTINGS_TRANSFER_VERSION,
    exportedAt: "2026-10-04T12:00:00.000Z",
    preferences: {
      hintsEnabled: "yes",
      manualWeatherLocation: " Birmingham,   AL ",
      savedWeatherLocations: [" Birmingham, AL ", "BIRMINGHAM, AL"],
      theme: "neon",
      textSize: "huge",
      temperatureUnit: "kelvin",
      windUnit: "knots",
      precipitationUnit: "feet",
    },
  }));

  assert.equal(parsed.hintsEnabled, DEFAULT_PREFERENCES.hintsEnabled);
  assert.equal(parsed.manualWeatherLocation, "Birmingham, AL");
  assert.deepEqual(parsed.savedWeatherLocations, ["Birmingham, AL"]);
  assert.equal(parsed.theme, DEFAULT_PREFERENCES.theme);
  assert.equal(parsed.textSize, DEFAULT_PREFERENCES.textSize);
  assert.equal(parsed.temperatureUnit, DEFAULT_PREFERENCES.temperatureUnit);
  assert.equal(parsed.windUnit, DEFAULT_PREFERENCES.windUnit);
  assert.equal(parsed.precipitationUnit, DEFAULT_PREFERENCES.precipitationUnit);
});

test("settings import rejects unknown schema/version and oversized input", () => {
  assert.throws(
    () => parseSettingsTransfer(JSON.stringify({
      schema: "other",
      version: 1,
      preferences: {},
    })),
    /supported News & Weather schema/,
  );

  assert.throws(
    () => parseSettingsTransfer(JSON.stringify({
      schema: SETTINGS_TRANSFER_SCHEMA,
      version: 2,
      preferences: {},
    })),
    /supported News & Weather schema/,
  );

  assert.throws(
    () => parseSettingsTransfer("x".repeat(SETTINGS_IMPORT_MAX_BYTES + 1)),
    /64 KiB safety limit/,
  );
});

test("settings import preserves onboarding completion state", () => {
  const imported = parseSettingsTransfer(serializeSettingsTransfer({
    ...samplePreferences,
    onboardingComplete: false,
  }));

  const merged = mergeImportedSettings(
    { ...samplePreferences, onboardingComplete: true },
    imported,
  );

  assert.equal(merged.onboardingComplete, true);
  assert.equal(merged.theme, "dark");
});
