import assert from "node:assert/strict";
import { test } from "node:test";
import {
  formatForecastLocalTime,
  formatWindDirection,
} from "../src/weather-display.ts";

test("wind direction uses a bounded compass label plus normalized degrees", () => {
  assert.equal(formatWindDirection(0), "N · 0°");
  assert.equal(formatWindDirection(44), "NE · 44°");
  assert.equal(formatWindDirection(90), "E · 90°");
  assert.equal(formatWindDirection(181), "S · 181°");
  assert.equal(formatWindDirection(270), "W · 270°");
  assert.equal(formatWindDirection(360), "N · 0°");
  assert.equal(formatWindDirection(-90), "W · 270°");
  assert.equal(formatWindDirection(undefined), "—");
});

test("provider-local ISO times are displayed without timezone reinterpretation", () => {
  assert.equal(formatForecastLocalTime("2026-10-04T07:12"), "7:12 AM");
  assert.equal(formatForecastLocalTime("2026-10-04T12:00"), "12:00 PM");
  assert.equal(formatForecastLocalTime("2026-10-04T19:03"), "7:03 PM");
  assert.equal(formatForecastLocalTime(undefined), "—");
});
