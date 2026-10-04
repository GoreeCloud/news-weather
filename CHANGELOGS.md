# GoreeCloud News & Weather — Changelog

This repository is in Development. No user-facing release is verified.

## Unreleased

### Added
- Authoritative project specification and project record.
- Repository documentation baseline and planned/implemented feature-state separation.
- Privacy, security, architecture, platform-integration, and 0.1.0 Development acceptance records.
- AGPL-3.0-or-later default license baseline.
- TypeScript/Vite application shell with Home, News, Weather, Settings, onboarding, contextual hints, themes, and local preferences.
- Tauri 2 source configuration with a minimal application capability set.
- GoreeCloud Feeds 0.1.0-dev capability-handshake client.
- Capability-gated GoreeCloud Feeds `articles:list-v1` client with strict bounded parsing and chronological Home/News article presentation.
- Bounded 24-hour offline news-summary cache capped at 50 validated article summaries, with stale labeling, malformed-cache rejection, and live-result replacement.
- Provider-independent weather-domain model and Open-Meteo Development adapter.
- Manual-place current, hourly, and seven-day weather presentation with provider attribution.
- Bounded 24-hour last-successful weather cache with explicit cached/stale presentation and location-change invalidation.
- Development source CI covering repository verification, strict TypeScript checking, web build, and Rust formatting.
- Local weather-unit preferences for Celsius/Fahrenheit, km/h/mph, and millimeters/inches, with legacy-safe defaults and presentation-only conversion.
- Local system/default, large, and extra-large text-size preferences that build on browser/platform scaling, plus viewport-bounded Settings scrolling for large text.
- Current Glaze target updated to Glaze V1.7 / 1.7.0 with explicit adoption-required status.
- Wind-direction, sunrise, and sunset presentation using already-normalized weather data.
- Up to eight local saved manual weather places with normalization, deduplication, quick switching, removal, and place-text-only storage.
- Linux and Windows Tauri source compilation CI, including reproducible platform icon generation from the canonical SVG development icon.
- Privacy-bounded versioned settings export/import with strict schema validation, a 64 KiB import ceiling, and cache-safe manual-place changes.

## 0.1.0 Development

**Status:** Planned. No release artifact is verified.

Scope is defined in `PROJECT-SPECIFICATIONS.md` and `PLANNED-FEATURES.md`.
