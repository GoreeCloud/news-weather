export type TemperatureUnit = "celsius" | "fahrenheit";
export type WindUnit = "kmh" | "mph";
export type PrecipitationUnit = "mm" | "inches";

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function kmhToMph(kmh: number): number {
  return kmh * 0.621371192237334;
}

export function millimetersToInches(mm: number): number {
  return mm / 25.4;
}

export function formatTemperature(celsius: number, unit: TemperatureUnit): string {
  const value = unit === "fahrenheit" ? celsiusToFahrenheit(celsius) : celsius;
  return `${Math.round(value)}°${unit === "fahrenheit" ? "F" : "C"}`;
}

export function formatWind(kmh: number | undefined, unit: WindUnit): string {
  if (kmh === undefined) {
    return "—";
  }

  if (unit === "mph") {
    return `${Math.round(kmhToMph(kmh))} mph`;
  }

  return `${Math.round(kmh)} km/h`;
}

export function formatPrecipitation(
  mm: number | undefined,
  unit: PrecipitationUnit,
): string {
  if (mm === undefined) {
    return "—";
  }

  if (unit === "inches") {
    const inches = millimetersToInches(mm);
    return `${inches.toFixed(inches < 1 ? 2 : 1)} in`;
  }

  return `${mm.toFixed(mm < 10 ? 1 : 0)} mm`;
}
