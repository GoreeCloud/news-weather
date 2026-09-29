# GoreeCloud News & Weather — Third-Party Notices

This file records external services and data sources that require explicit notice or attribution in the current Development source.

## Open-Meteo

**Role:** Development weather-provider adapter and location geocoding path.

- Service: Open-Meteo
- Forecast endpoint family: `api.open-meteo.com`
- Geocoding endpoint family: `geocoding-api.open-meteo.com`
- Weather data licence: CC BY 4.0 according to Open-Meteo's current published terms.
- Open-Meteo server source: open source under AGPLv3 according to Open-Meteo.
- Free hosted API: limited to non-commercial use under Open-Meteo's current terms; production/commercial use requires an appropriate licensed endpoint or self-hosted deployment.
- Attribution: required.
- Geocoding data: based on GeoNames; attribution is surfaced in the application.

This provider is intentionally isolated behind the GoreeCloud weather-provider interface. It is not a permanent product-schema dependency.

## GoreeCloud Feeds

**Role:** First-party authoritative news backend.

News & Weather consumes the versioned GoreeCloud Feeds protocol and does not duplicate feed retrieval, parsing, normalization, deduplication, persistence, search, or synchronization.

The currently verified Feeds Development protocol version is `0.1.0-dev`; its current machine-readable contract exposes capability negotiation only.

## Dependency notices

JavaScript/Rust dependency licensing must be reviewed and reconciled before a Development release artifact is distributed. This source-level notice does not substitute for a generated dependency/SBOM review.
