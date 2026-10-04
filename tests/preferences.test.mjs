import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import {
  DEFAULT_PREFERENCES,
  MAX_SAVED_WEATHER_LOCATIONS,
  addSavedWeatherLocation,
  loadPreferences,
  normalizeSavedWeatherLocations,
  removeSavedWeatherLocation,
  savePreferences,
} from "../src/state/preferences.ts";

class MemoryStorage {
  #values = new Map();

  getItem(key) {
    return this.#values.has(key) ? this.#values.get(key) : null;
  }

  setItem(key, value) {
    this.#values.set(key, String(value));
  }

  removeItem(key) {
    this.#values.delete(key);
  }

  clear() {
    this.#values.clear();
  }
}

const storage = new MemoryStorage();

Object.defineProperty(globalThis, "localStorage", {
  value: storage,
  configurable: true,
});

beforeEach(() => {
  storage.clear();
});

test("legacy preferences migrate safely to metric weather-unit defaults", () => {
  storage.setItem(
    "goreecloud.newsweather.preferences.v1",
    JSON.stringify({
      onboardingComplete: true,
      hintsEnabled: false,
      manualWeatherLocation: "Jacksonville, FL",
      theme: "dark",
    }),
  );

  assert.deepEqual(loadPreferences(), {
    onboardingComplete: true,
    hintsEnabled: false,
    manualWeatherLocation: "Jacksonville, FL",
    savedWeatherLocations: [],
    theme: "dark",
    textSize: "system",
    temperatureUnit: "celsius",
    windUnit: "kmh",
    precipitationUnit: "mm",
  });
});

test("weather unit choices persist with other preferences", () => {
  const preferences = {
    ...DEFAULT_PREFERENCES,
    onboardingComplete: true,
    manualWeatherLocation: "Jacksonville, FL",
    temperatureUnit: "fahrenheit",
    windUnit: "mph",
    precipitationUnit: "inches",
  };

  savePreferences(preferences);
  assert.deepEqual(loadPreferences(), preferences);
});

test("invalid persisted unit values fail back to supported defaults", () => {
  storage.setItem(
    "goreecloud.newsweather.preferences.v1",
    JSON.stringify({
      temperatureUnit: "kelvin",
      windUnit: "knots",
      precipitationUnit: "feet",
      textSize: "giant",
    }),
  );

  const preferences = loadPreferences();
  assert.equal(preferences.temperatureUnit, "celsius");
  assert.equal(preferences.windUnit, "kmh");
  assert.equal(preferences.precipitationUnit, "mm");
  assert.equal(preferences.textSize, "system");
});

test("text-size preference persists alongside weather presentation settings", () => {
  const preferences = {
    ...DEFAULT_PREFERENCES,
    textSize: "extra-large",
    temperatureUnit: "fahrenheit",
  };

  savePreferences(preferences);
  assert.equal(loadPreferences().textSize, "extra-large");
});

test("saved weather places normalize, deduplicate, and remain bounded", () => {
  const many = [
    "  Jacksonville,   FL ",
    "jacksonville, fl",
    "Birmingham, AL",
    "Atlanta, GA",
    "Nashville, TN",
    "Orlando, FL",
    "Tampa, FL",
    "Miami, FL",
    "Savannah, GA",
    "Charleston, SC",
    42,
    "",
  ];

  const normalized = normalizeSavedWeatherLocations(many);
  assert.deepEqual(normalized.slice(0, 2), ["Jacksonville, FL", "Birmingham, AL"]);
  assert.equal(normalized.length, MAX_SAVED_WEATHER_LOCATIONS);
});

test("saved weather place helpers add idempotently and remove by index", () => {
  let locations = [];
  locations = addSavedWeatherLocation(locations, "Jacksonville, FL");
  locations = addSavedWeatherLocation(locations, " jacksonville,   fl ");
  locations = addSavedWeatherLocation(locations, "Birmingham, AL");

  assert.deepEqual(locations, ["Jacksonville, FL", "Birmingham, AL"]);
  assert.deepEqual(removeSavedWeatherLocation(locations, 0), ["Birmingham, AL"]);
  assert.deepEqual(removeSavedWeatherLocation(locations, 99), locations);
});

test("persisted saved weather places discard invalid entries safely", () => {
  storage.setItem(
    "goreecloud.newsweather.preferences.v1",
    JSON.stringify({
      savedWeatherLocations: ["  Jacksonville, FL ", null, "JACKSONVILLE, FL", "Birmingham, AL"],
    }),
  );

  assert.deepEqual(loadPreferences().savedWeatherLocations, [
    "Jacksonville, FL",
    "Birmingham, AL",
  ]);
});
