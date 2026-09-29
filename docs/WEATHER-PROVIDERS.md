# GoreeCloud News & Weather — Weather Providers

## Architecture rule

The application consumes a GoreeCloud-owned normalized weather model.

Provider-specific request parameters and response schemas remain inside provider adapters.

```text
Provider API
    ↓
Provider adapter
    ↓
GoreeCloud weather model
    ↓
Home / Weather UI
```

## Current Development provider — Open-Meteo

The first Development path uses Open-Meteo for:

- manual-place geocoding;
- current conditions;
- hourly forecast;
- seven-day forecast;
- precipitation;
- wind;
- humidity;
- sunrise and sunset inputs where available.

The application sends a manually entered place query to the Open-Meteo geocoding endpoint. The adapter then uses the resolved coordinates transiently for the forecast request.

The application preference store retains the user's place text. It does not persist the resolved latitude/longitude from this adapter.

### Provider status

This is a **Development provider**, not a permanent hard-coded product authority.

Open-Meteo's free hosted API is governed by its current non-commercial terms and requires attribution. Before a distributed or commercial release relies on hosted Open-Meteo infrastructure, GoreeCloud must verify the applicable licence/plan or use an approved self-hosted/provider alternative.

### Attribution

The UI must display:

- Open-Meteo attribution for weather data; and
- GeoNames attribution for location search through Open-Meteo.

## Future providers

Additional adapters may be added, including U.S. National Weather Service capabilities where appropriate.

Adding a provider must not require changes to Home/Weather domain models beyond genuinely new GoreeCloud capabilities.
