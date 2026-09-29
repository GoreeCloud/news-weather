export const MAX_SAVED_WEATHER_LOCATIONS = 8;
export const MAX_WEATHER_LOCATION_LENGTH = 160;

export function normalizeWeatherLocation(value: string): string {
  return value.trim().replaceAll(/\s+/g, " ").slice(0, MAX_WEATHER_LOCATION_LENGTH);
}

function locationKey(value: string): string {
  return normalizeWeatherLocation(value).toLocaleLowerCase("en-US");
}

export function sanitizeSavedWeatherLocations(value: unknown): readonly string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const locations: string[] = [];
  const keys = new Set<string>();

  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }

    const normalized = normalizeWeatherLocation(item);
    const key = locationKey(normalized);
    if (!normalized || keys.has(key)) {
      continue;
    }

    locations.push(normalized);
    keys.add(key);

    if (locations.length >= MAX_SAVED_WEATHER_LOCATIONS) {
      break;
    }
  }

  return locations;
}

export function addSavedWeatherLocation(
  current: readonly string[],
  location: string,
): readonly string[] {
  const normalized = normalizeWeatherLocation(location);
  if (!normalized) {
    return sanitizeSavedWeatherLocations(current);
  }

  const key = locationKey(normalized);
  const withoutDuplicate = sanitizeSavedWeatherLocations(current).filter(
    (item) => locationKey(item) !== key,
  );

  return [normalized, ...withoutDuplicate].slice(0, MAX_SAVED_WEATHER_LOCATIONS);
}

export function removeSavedWeatherLocation(
  current: readonly string[],
  index: number,
): readonly string[] {
  const normalized = sanitizeSavedWeatherLocations(current);
  if (!Number.isInteger(index) || index < 0 || index >= normalized.length) {
    return normalized;
  }

  return normalized.filter((_item, itemIndex) => itemIndex !== index);
}

export function isSavedWeatherLocation(
  current: readonly string[],
  location: string,
): boolean {
  const key = locationKey(location);
  return Boolean(key) && sanitizeSavedWeatherLocations(current).some(
    (item) => locationKey(item) === key,
  );
}
