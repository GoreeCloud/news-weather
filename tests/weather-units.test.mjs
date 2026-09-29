import assert from "node:assert/strict";
import { test } from "node:test";
import {
  celsiusToFahrenheit,
  formatPrecipitation,
  formatTemperature,
  formatWind,
  kmhToMph,
  millimetersToInches,
} from "../src/weather-units.ts";

test("temperature conversion and labels preserve metric domain input", () => {
  assert.equal(celsiusToFahrenheit(0), 32);
  assert.equal(celsiusToFahrenheit(100), 212);
  assert.equal(formatTemperature(27.4, "celsius"), "27°C");
  assert.equal(formatTemperature(27.4, "fahrenheit"), "81°F");
});

test("wind conversion formats km/h and mph from normalized km/h", () => {
  assert.ok(Math.abs(kmhToMph(100) - 62.1371192237334) < 1e-10);
  assert.equal(formatWind(11, "kmh"), "11 km/h");
  assert.equal(formatWind(11, "mph"), "7 mph");
  assert.equal(formatWind(undefined, "mph"), "—");
});

test("precipitation conversion formats millimeters and inches", () => {
  assert.equal(millimetersToInches(25.4), 1);
  assert.equal(formatPrecipitation(1.2, "mm"), "1.2 mm");
  assert.equal(formatPrecipitation(25.4, "inches"), "1.0 in");
  assert.equal(formatPrecipitation(2.54, "inches"), "0.10 in");
  assert.equal(formatPrecipitation(undefined, "inches"), "—");
});
