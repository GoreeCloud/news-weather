import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  OpenMeteoWeatherProvider,
  weatherCodeDescription,
} from "../src/integrations/weather.ts";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function jsonResponse(payload) {
  return {
    ok: true,
    status: 200,
    async json() {
      return payload;
    },
  };
}

test("Open-Meteo adapter normalizes provider responses and keeps coordinates out of app location state", async () => {
  const requested = [];

  globalThis.fetch = async (input) => {
    const url = input instanceof URL ? input : new URL(String(input));
    requested.push(url);

    if (url.hostname === "geocoding-api.open-meteo.com") {
      return jsonResponse({
        results: [
          {
            name: "Jacksonville",
            latitude: 30.3322,
            longitude: -81.6557,
            country: "United States",
            admin1: "Florida",
            timezone: "America/New_York",
          },
        ],
      });
    }

    assert.equal(url.hostname, "api.open-meteo.com");
    return jsonResponse({
      current: {
        time: "2026-09-29T09:00",
        temperature_2m: 27.4,
        apparent_temperature: 29.1,
        relative_humidity_2m: 70,
        precipitation: 0,
        weather_code: 2,
        wind_speed_10m: 11,
        wind_direction_10m: 85,
      },
      hourly: {
        time: ["2026-09-29T10:00"],
        temperature_2m: [28],
        precipitation_probability: [15],
        precipitation: [0],
        weather_code: [2],
        wind_speed_10m: [12],
        wind_direction_10m: [90],
      },
      daily: {
        time: ["2026-09-29"],
        weather_code: [2],
        temperature_2m_max: [30],
        temperature_2m_min: [22],
        precipitation_probability_max: [30],
        precipitation_sum: [1.2],
        sunrise: ["2026-09-29T07:18"],
        sunset: ["2026-09-29T19:14"],
      },
    });
  };

  const provider = new OpenMeteoWeatherProvider();
  const forecast = await provider.getForecastForQuery("Jacksonville, FL");

  assert.equal(requested.length, 2);
  assert.equal(requested[0].hostname, "geocoding-api.open-meteo.com");
  assert.equal(requested[0].searchParams.get("name"), "Jacksonville, FL");
  assert.equal(requested[1].searchParams.get("latitude"), "30.3322");
  assert.equal(requested[1].searchParams.get("longitude"), "-81.6557");

  assert.deepEqual(forecast.location, {
    label: "Jacksonville",
    country: "United States",
    admin1: "Florida",
    timezone: "America/New_York",
  });
  assert.equal("latitude" in forecast.location, false);
  assert.equal("longitude" in forecast.location, false);
  assert.equal(forecast.current.temperatureCelsius, 27.4);
  assert.equal(forecast.current.weatherCode, 2);
  assert.equal(forecast.hourly[0].precipitationProbabilityPercent, 15);
  assert.equal(forecast.daily[0].highCelsius, 30);
  assert.match(forecast.providerAttribution, /Open-Meteo/);
});

test("Open-Meteo adapter rejects unusable manual-place queries before network access", async () => {
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    throw new Error("must not be called");
  };

  const provider = new OpenMeteoWeatherProvider();
  await assert.rejects(provider.getForecastForQuery(" "), /at least two characters/);
  assert.equal(called, false);
});

test("weather-code descriptions remain bounded and understandable", () => {
  assert.equal(weatherCodeDescription(0), "Clear");
  assert.equal(weatherCodeDescription(63), "Rain");
  assert.equal(weatherCodeDescription(95), "Thunderstorm");
  assert.equal(weatherCodeDescription(500), "Weather");
});
