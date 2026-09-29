import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
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
    theme: "dark",
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
    }),
  );

  const preferences = loadPreferences();
  assert.equal(preferences.temperatureUnit, "celsius");
  assert.equal(preferences.windUnit, "kmh");
  assert.equal(preferences.precipitationUnit, "mm");
});
