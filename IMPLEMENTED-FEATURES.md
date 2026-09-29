# GoreeCloud News & Weather — Implemented Features

This file records verified implementation state and distinguishes source verification from runtime/release acceptance.

## Current verified source state

As of 2026-09-29, authoritative `main` contains the following source-implemented Development foundations:

- TypeScript/Vite application shell with Home, News, and Weather navigation.
- Local Settings surface with system/light/dark theme preferences.
- Persisted weather presentation units: Celsius/Fahrenheit, km/h/mph, and millimeters/inches, while provider/cache models remain normalized in metric units.
- Persisted system/default, large, and extra-large text-size preferences that compose with browser/platform scaling.
- Large-text-safe Settings scrolling within the viewport.
- First-use onboarding with manual weather-location setup and optional contextual hints.
- Local preference persistence with safe fallback when browser storage is unavailable.
- Tauri 2 source configuration and minimal default capability set for planned Android, Linux, and Windows packaging.
- GoreeCloud Feeds `0.1.0-dev` capability-handshake client with same-origin/loopback Development endpoint restrictions.
- Explicit refusal to invent article endpoints that are not present in the verified Feeds Development contract.
- Provider-independent GoreeCloud weather domain models.
- Open-Meteo Development adapter for manual-place geocoding, current conditions, hourly forecast, and seven-day forecast.
- Manual-place weather UI with current conditions, precipitation, wind, humidity, hourly and daily presentation.
- Provider attribution and third-party notice records.
- Bounded 24-hour last-successful normalized weather cache.
- Same-location cache matching, invalidation when the manual place changes, automatic refresh, and explicit cached/stale presentation.
- Scoped Content Security Policy allowing only the required Open-Meteo endpoints plus Development loopback Feeds connections.
- Repository/platform governance baseline and Platform Contract 0.4 manifest.

## Verification evidence

- PR #2 source-foundation head `258d847389d6a80d73554a39c4b43772ccc6bc28` passed the Source Foundation workflow before merge.
- PR #3 weather/Feeds adapter head `d5893f1a0cb1d7bf3dc51328f597b4e12b23a5e0` passed Source Foundation workflow run `36544875319` before merge.
- PR #5 weather-cache head `c8946d0024108e5f9d9ac34e3aadd03603adff69` passed Source Foundation workflow run `36545235443` before merge.
- PR #8 provider/cache tests head `5afef4191d8971fd369c24d2dea15a837dce8250` passed Source Foundation run `36546118757` and Unit Tests run `36546118799` before merge.
- PR #9 weather-unit preferences head `55d4f6a7f27e1c9553238359485a2e9dcb151d4e` passed Source Foundation run `36546673081` and Unit Tests run `36546673063` before merge.
- PR #10 text-size accessibility head `f5cbfe1c57e922defa6a956d94d8b6f7c9c3f1d1` passed Source Foundation run `36546996822` and Unit Tests run `36546996814` before merge.
- Current authoritative source revision after these milestones is `63aa9b8b27f71692e5a713ac37cc33baaac4e9a5`.

The Source Foundation workflow verifies repository baseline, strict TypeScript type-checking, web source build, and Rust formatting. It does **not** establish live-provider runtime acceptance or native target acceptance.

## Not yet verified

Do not describe the following as completed or released:

- GoreeCloud Feeds article retrieval, source management, folders, read state, bookmarks, article search, OPML flows, or news reading UI backed by real article endpoints.
- Live end-to-end Open-Meteo runtime acceptance in a representative browser/native client.
- Current-device location permission or GoreeCloud Location integration.
- Official severe-weather alert integration.
- Android, Linux, or Windows native build/install/runtime acceptance.
- Representative browser runtime/accessibility acceptance.
- Glaze UI downstream consumer acceptance.
- Privacy Shield, Wardveil Security, Everkeep, Manager, Mesh, Identity, Policy, or Observability runtime acceptance.
- GoreeCloud Sync or Notify runtime integration.
- Signed release packaging.
- Release Candidate, Production, or Stable qualification.

Add stronger claims only when the applicable exact-revision evidence exists.
