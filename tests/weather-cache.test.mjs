import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import {
  WEATHER_CACHE_MAX_AGE_MS,
  clearWeatherCache,
  loadWeatherCache,
  saveWeatherCache,
} from "../src/state/weather-cache.ts";

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

function sampleForecast() {
  return {
    providerId: "open-meteo-development",
    providerLabel: "Open-Meteo",
    providerAttribution: "Weather data: Open-Meteo (CC BY 4.0).",
    fetchedAt: new Date().toISOString(),
    location: {
      label: "Jacksonville",
      admin1: "Florida",
      country: "United States",
      timezone: "America/New_York",
    },
    current: {
      time: "2026-09-29T09:00",
      temperatureCelsius: 27.4,
      apparentTemperatureCelsius: 29.1,
      relativeHumidityPercent: 70,
      precipitationMm: 0,
      weatherCode: 2,
      windSpeedKmh: 11,
      windDirectionDegrees: 85,
    },
    hourly: [
      {
        time: "2026-09-29T10:00",
        temperatureCelsius: 28,
        precipitationProbabilityPercent: 15,
        precipitationMm: 0,
        weatherCode: 2,
        windSpeedKmh: 12,
        windDirectionDegrees: 90,
      },
    ],
    daily: [
      {
        date: "2026-09-29",
        weatherCode: 2,
        highCelsius: 30,
        lowCelsius: 22,
        precipitationProbabilityPercent: 30,
        precipitationMm: 1.2,
        sunrise: "2026-09-29T07:18",
        sunset: "2026-09-29T19:14",
      },
    ],
  };
}

beforeEach(() => {
  storage.clear();
});

test("weather cache round-trips only for the same normalized manual-place query", () => {
  const forecast = sampleForecast();
  saveWeatherCache("  Jacksonville   FL  ", forecast);

  const loaded = loadWeatherCache("jacksonville fl");
  assert.ok(loaded);
  assert.deepEqual(loaded.forecast, forecast);
  assert.equal(loadWeatherCache("Tampa FL"), null);
});

test("weather cache rejects malformed persisted payloads", () => {
  storage.setItem("goreecloud.newsweather.weather-cache.v1", JSON.stringify({
    version: 1,
    query: "Jacksonville FL",
    savedAt: new Date().toISOString(),
    forecast: { providerId: "broken" },
  }));

  assert.equal(loadWeatherCache("Jacksonville FL"), null);
  assert.equal(storage.getItem("goreecloud.newsweather.weather-cache.v1"), null);
});

test("weather cache expires after the bounded maximum age", () => {
  const forecast = sampleForecast();
  saveWeatherCache("Jacksonville FL", forecast);

  const key = "goreecloud.newsweather.weather-cache.v1";
  const persisted = JSON.parse(storage.getItem(key));
  persisted.savedAt = new Date(Date.now() - WEATHER_CACHE_MAX_AGE_MS - 1_000).toISOString();
  storage.setItem(key, JSON.stringify(persisted));

  assert.equal(loadWeatherCache("Jacksonville FL"), null);
  assert.equal(storage.getItem(key), null);
});

test("clearing the weather cache is idempotent", () => {
  saveWeatherCache("Jacksonville FL", sampleForecast());
  clearWeatherCache();
  clearWeatherCache();
  assert.equal(loadWeatherCache("Jacksonville FL"), null);
});
