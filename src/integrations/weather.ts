export interface WeatherLocation {
  readonly label: string;
  readonly country?: string;
  readonly admin1?: string;
  readonly timezone?: string;
}

interface WeatherLocationCandidate extends WeatherLocation {
  readonly latitude: number;
  readonly longitude: number;
}

export interface CurrentConditions {
  readonly time: string;
  readonly temperatureCelsius: number;
  readonly apparentTemperatureCelsius?: number;
  readonly relativeHumidityPercent?: number;
  readonly precipitationMm?: number;
  readonly weatherCode: number;
  readonly windSpeedKmh?: number;
  readonly windDirectionDegrees?: number;
}

export interface HourlyForecastPoint {
  readonly time: string;
  readonly temperatureCelsius: number;
  readonly precipitationProbabilityPercent?: number;
  readonly precipitationMm?: number;
  readonly weatherCode: number;
  readonly windSpeedKmh?: number;
  readonly windDirectionDegrees?: number;
}

export interface DailyForecast {
  readonly date: string;
  readonly weatherCode: number;
  readonly highCelsius: number;
  readonly lowCelsius: number;
  readonly precipitationProbabilityPercent?: number;
  readonly precipitationMm?: number;
  readonly sunrise?: string;
  readonly sunset?: string;
}

export interface WeatherForecast {
  readonly providerId: string;
  readonly providerLabel: string;
  readonly providerAttribution: string;
  readonly fetchedAt: string;
  readonly location: WeatherLocation;
  readonly current: CurrentConditions;
  readonly hourly: readonly HourlyForecastPoint[];
  readonly daily: readonly DailyForecast[];
}

export interface WeatherProviderStatus {
  readonly configured: boolean;
  readonly message: string;
}

export interface WeatherProvider {
  readonly id: string;
  readonly label: string;
  readonly attribution: string;
  getStatus(): Promise<WeatherProviderStatus>;
  getForecastForQuery(query: string): Promise<WeatherForecast>;
}

const OPEN_METEO_GEOCODING_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";
const OPEN_METEO_FORECAST_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
const REQUEST_TIMEOUT_MS = 10_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredNumber(record: Record<string, unknown>, key: string): number {
  const value = record[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Weather provider response is missing numeric field ${key}.`);
  }
  return value;
}

function optionalNumber(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function requiredString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Weather provider response is missing string field ${key}.`);
  }
  return value;
}

function stringArray(record: Record<string, unknown>, key: string): readonly string[] {
  const value = record[key];
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error(`Weather provider response is missing string array ${key}.`);
  }
  return value;
}

function numberArray(record: Record<string, unknown>, key: string): readonly number[] {
  const value = record[key];
  if (
    !Array.isArray(value) ||
    !value.every((item) => typeof item === "number" && Number.isFinite(item))
  ) {
    throw new Error(`Weather provider response is missing numeric array ${key}.`);
  }
  return value;
}

function optionalNumberArray(record: Record<string, unknown>, key: string): readonly (number | null)[] {
  const value = record[key];
  if (
    !Array.isArray(value) ||
    !value.every(
      (item) => item === null || (typeof item === "number" && Number.isFinite(item)),
    )
  ) {
    return [];
  }
  return value;
}

async function fetchJson(url: URL): Promise<unknown> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "omit",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Weather provider request failed with HTTP ${response.status}.`);
    }

    return await response.json();
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

function parseLocationCandidate(value: unknown): WeatherLocationCandidate | null {
  if (!isRecord(value)) {
    return null;
  }

  const name = value.name;
  const latitude = value.latitude;
  const longitude = value.longitude;
  if (
    typeof name !== "string" ||
    typeof latitude !== "number" ||
    !Number.isFinite(latitude) ||
    typeof longitude !== "number" ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  return {
    label: name,
    latitude,
    longitude,
    ...(typeof value.country === "string" ? { country: value.country } : {}),
    ...(typeof value.admin1 === "string" ? { admin1: value.admin1 } : {}),
    ...(typeof value.timezone === "string" ? { timezone: value.timezone } : {}),
  };
}

function compactLocation(location: WeatherLocationCandidate): WeatherLocation {
  return {
    label: location.label,
    ...(location.country ? { country: location.country } : {}),
    ...(location.admin1 ? { admin1: location.admin1 } : {}),
    ...(location.timezone ? { timezone: location.timezone } : {}),
  };
}

function parseForecast(
  value: unknown,
  candidate: WeatherLocationCandidate,
): Omit<WeatherForecast, "providerId" | "providerLabel" | "providerAttribution" | "fetchedAt"> {
  if (!isRecord(value)) {
    throw new Error("Weather provider returned an invalid forecast response.");
  }

  const currentRaw = value.current;
  const hourlyRaw = value.hourly;
  const dailyRaw = value.daily;
  if (!isRecord(currentRaw) || !isRecord(hourlyRaw) || !isRecord(dailyRaw)) {
    throw new Error("Weather provider forecast is missing current, hourly, or daily data.");
  }

  const apparentTemperature = optionalNumber(currentRaw, "apparent_temperature");
  const relativeHumidity = optionalNumber(currentRaw, "relative_humidity_2m");
  const currentPrecipitation = optionalNumber(currentRaw, "precipitation");
  const currentWindSpeed = optionalNumber(currentRaw, "wind_speed_10m");
  const currentWindDirection = optionalNumber(currentRaw, "wind_direction_10m");

  const current: CurrentConditions = {
    time: requiredString(currentRaw, "time"),
    temperatureCelsius: requiredNumber(currentRaw, "temperature_2m"),
    weatherCode: requiredNumber(currentRaw, "weather_code"),
    ...(apparentTemperature !== undefined
      ? { apparentTemperatureCelsius: apparentTemperature }
      : {}),
    ...(relativeHumidity !== undefined
      ? { relativeHumidityPercent: relativeHumidity }
      : {}),
    ...(currentPrecipitation !== undefined
      ? { precipitationMm: currentPrecipitation }
      : {}),
    ...(currentWindSpeed !== undefined ? { windSpeedKmh: currentWindSpeed } : {}),
    ...(currentWindDirection !== undefined
      ? { windDirectionDegrees: currentWindDirection }
      : {}),
  };

  const hourlyTimes = stringArray(hourlyRaw, "time");
  const hourlyTemperature = numberArray(hourlyRaw, "temperature_2m");
  const hourlyWeatherCode = numberArray(hourlyRaw, "weather_code");
  const hourlyPrecipitationProbability = optionalNumberArray(hourlyRaw, "precipitation_probability");
  const hourlyPrecipitation = optionalNumberArray(hourlyRaw, "precipitation");
  const hourlyWindSpeed = optionalNumberArray(hourlyRaw, "wind_speed_10m");
  const hourlyWindDirection = optionalNumberArray(hourlyRaw, "wind_direction_10m");

  const hourlyLength = Math.min(
    hourlyTimes.length,
    hourlyTemperature.length,
    hourlyWeatherCode.length,
  );
  const hourly: HourlyForecastPoint[] = [];
  for (let index = 0; index < hourlyLength; index += 1) {
    const time = hourlyTimes[index];
    const temperature = hourlyTemperature[index];
    const weatherCode = hourlyWeatherCode[index];
    if (time === undefined || temperature === undefined || weatherCode === undefined) {
      continue;
    }

    const precipitationProbability = hourlyPrecipitationProbability[index];
    const precipitation = hourlyPrecipitation[index];
    const windSpeed = hourlyWindSpeed[index];
    const windDirection = hourlyWindDirection[index];

    hourly.push({
      time,
      temperatureCelsius: temperature,
      weatherCode,
      ...(typeof precipitationProbability === "number"
        ? { precipitationProbabilityPercent: precipitationProbability }
        : {}),
      ...(typeof precipitation === "number" ? { precipitationMm: precipitation } : {}),
      ...(typeof windSpeed === "number" ? { windSpeedKmh: windSpeed } : {}),
      ...(typeof windDirection === "number" ? { windDirectionDegrees: windDirection } : {}),
    });
  }

  const dailyTimes = stringArray(dailyRaw, "time");
  const dailyCodes = numberArray(dailyRaw, "weather_code");
  const dailyHigh = numberArray(dailyRaw, "temperature_2m_max");
  const dailyLow = numberArray(dailyRaw, "temperature_2m_min");
  const dailyPrecipitationProbability = optionalNumberArray(
    dailyRaw,
    "precipitation_probability_max",
  );
  const dailyPrecipitation = optionalNumberArray(dailyRaw, "precipitation_sum");
  const sunrise = Array.isArray(dailyRaw.sunrise)
    ? dailyRaw.sunrise.filter((item): item is string => typeof item === "string")
    : [];
  const sunset = Array.isArray(dailyRaw.sunset)
    ? dailyRaw.sunset.filter((item): item is string => typeof item === "string")
    : [];

  const dailyLength = Math.min(
    dailyTimes.length,
    dailyCodes.length,
    dailyHigh.length,
    dailyLow.length,
  );
  const daily: DailyForecast[] = [];
  for (let index = 0; index < dailyLength; index += 1) {
    const date = dailyTimes[index];
    const code = dailyCodes[index];
    const high = dailyHigh[index];
    const low = dailyLow[index];
    if (date === undefined || code === undefined || high === undefined || low === undefined) {
      continue;
    }

    const probability = dailyPrecipitationProbability[index];
    const precipitation = dailyPrecipitation[index];
    const sunriseValue = sunrise[index];
    const sunsetValue = sunset[index];

    daily.push({
      date,
      weatherCode: code,
      highCelsius: high,
      lowCelsius: low,
      ...(typeof probability === "number" ? { precipitationProbabilityPercent: probability } : {}),
      ...(typeof precipitation === "number" ? { precipitationMm: precipitation } : {}),
      ...(sunriseValue ? { sunrise: sunriseValue } : {}),
      ...(sunsetValue ? { sunset: sunsetValue } : {}),
    });
  }

  return {
    location: compactLocation(candidate),
    current,
    hourly,
    daily,
  };
}

export function weatherCodeDescription(code: number): string {
  if (code === 0) return "Clear";
  if (code === 1) return "Mostly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 85 && code <= 86) return "Snow showers";
  if (code >= 95 && code <= 99) return "Thunderstorm";
  return "Weather";
}

export class OpenMeteoWeatherProvider implements WeatherProvider {
  readonly id = "open-meteo-development";
  readonly label = "Open-Meteo";
  readonly attribution = "Weather data: Open-Meteo (CC BY 4.0). Location search: GeoNames via Open-Meteo.";

  async getStatus(): Promise<WeatherProviderStatus> {
    return {
      configured: true,
      message:
        "Open-Meteo Development adapter configured. A network request is made only after a manual location is supplied.",
    };
  }

  async getForecastForQuery(query: string): Promise<WeatherForecast> {
    const normalizedQuery = query.trim().slice(0, 160);
    if (normalizedQuery.length < 2) {
      throw new Error("Enter at least two characters for the weather location.");
    }

    const geocodingUrl = new URL(OPEN_METEO_GEOCODING_ENDPOINT);
    geocodingUrl.searchParams.set("name", normalizedQuery);
    geocodingUrl.searchParams.set("count", "5");
    geocodingUrl.searchParams.set("language", "en");
    geocodingUrl.searchParams.set("format", "json");

    const geocoding = await fetchJson(geocodingUrl);
    if (!isRecord(geocoding) || !Array.isArray(geocoding.results)) {
      throw new Error("Weather location search returned no usable results.");
    }

    const candidate = geocoding.results
      .map(parseLocationCandidate)
      .find((item): item is WeatherLocationCandidate => item !== null);

    if (!candidate) {
      throw new Error("No matching weather location was found.");
    }

    const forecastUrl = new URL(OPEN_METEO_FORECAST_ENDPOINT);
    forecastUrl.searchParams.set("latitude", String(candidate.latitude));
    forecastUrl.searchParams.set("longitude", String(candidate.longitude));
    forecastUrl.searchParams.set("timezone", "auto");
    forecastUrl.searchParams.set("forecast_days", "7");
    forecastUrl.searchParams.set(
      "current",
      [
        "temperature_2m",
        "apparent_temperature",
        "relative_humidity_2m",
        "precipitation",
        "weather_code",
        "wind_speed_10m",
        "wind_direction_10m",
      ].join(","),
    );
    forecastUrl.searchParams.set(
      "hourly",
      [
        "temperature_2m",
        "precipitation_probability",
        "precipitation",
        "weather_code",
        "wind_speed_10m",
        "wind_direction_10m",
      ].join(","),
    );
    forecastUrl.searchParams.set(
      "daily",
      [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_sum",
        "precipitation_probability_max",
        "sunrise",
        "sunset",
      ].join(","),
    );

    const parsed = parseForecast(await fetchJson(forecastUrl), candidate);
    return {
      providerId: this.id,
      providerLabel: this.label,
      providerAttribution: this.attribution,
      fetchedAt: new Date().toISOString(),
      ...parsed,
    };
  }
}
