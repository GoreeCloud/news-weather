# GoreeCloud News & Weather — Implemented Features

This file records verified implementation state and distinguishes source verification from runtime/release acceptance.

## Current verified source state

As of 2026-10-04, authoritative `main` contains the following source-implemented Development foundations:

- TypeScript/Vite application shell with Home, News, and Weather navigation.
- Local Settings surface with system/light/dark theme preferences.
- Persisted weather presentation units: Celsius/Fahrenheit, km/h/mph, and millimeters/inches, while provider/cache models remain normalized in metric units.
- Persisted system/default, large, and extra-large text-size preferences that compose with browser/platform scaling.
- Large-text-safe Settings scrolling within the viewport.
- First-use onboarding with manual weather-location setup and optional contextual hints.
- Local preference persistence with safe fallback when browser storage is unavailable.
- Tauri 2 source configuration and minimal default capability set for planned Android, Linux, and Windows packaging.
- Continuous Linux and Windows Tauri Rust source compilation with native icon derivatives generated from a canonical SVG source.
- GoreeCloud Feeds `0.1.0-dev` capability-handshake client with same-origin/loopback Development endpoint restrictions.
- Explicit refusal to invent article endpoints that are not present in the verified Feeds Development contract.
- Provider-independent GoreeCloud weather domain models.
- Open-Meteo Development adapter for manual-place geocoding, current conditions, hourly forecast, and seven-day forecast.
- Manual-place weather UI with current conditions, precipitation, wind speed and direction, humidity, sunrise/sunset, hourly, and seven-day presentation.
- Provider attribution and third-party notice records.
- Bounded 24-hour last-successful normalized weather cache.
- Same-location cache matching, invalidation when the manual place changes, automatic refresh, and explicit cached/stale presentation.
- Up to eight local saved manual weather places, normalized and deduplicated while storing place text only.
- Versioned local settings export/import for portable appearance, weather-unit, hint, active-place, and saved-place preferences with a 64 KiB import ceiling and explicit exclusion of cache, onboarding state, accounts, credentials, telemetry, and provider coordinates.
- Scoped Content Security Policy allowing only the required Open-Meteo endpoints plus Development loopback Feeds connections.
- Repository/platform governance baseline and Platform Contract 0.4 manifest.
- Current shared design-system target updated to Glaze V1.7 / 1.7.0 with repository-local adoption explicitly still required.

## Verification evidence

- PR #2 source-foundation head `258d847389d6a80d73554a39c4b43772ccc6bc28` passed the Source Foundation workflow before merge.
- PR #3 weather/Feeds adapter head `d5893f1a0cb1d7bf3dc51328f597b4e12b23a5e0` passed Source Foundation workflow run `36544875319` before merge.
- PR #5 weather-cache head `c8946d0024108e5f9d9ac34e3aadd03603adff69` passed Source Foundation workflow run `36545235443` before merge.
- PR #8 provider/cache tests head `5afef4191d8971fd369c24d2dea15a837dce8250` passed Source Foundation run `36546118757` and Unit Tests run `36546118799` before merge.
- PR #9 weather-unit preferences head `55d4f6a7f27e1c9553238359485a2e9dcb151d4e` passed Source Foundation run `36546673081` and Unit Tests run `36546673063` before merge.
- PR #10 text-size accessibility head `f5cbfe1c57e922defa6a956d94d8b6f7c9c3f1d1` passed Source Foundation run `36546996822` and Unit Tests run `36546996814` before merge.
- PR #12 Glaze target head `5187464bf0ab7d8606b08cb75d77576c5e8a9376` passed Source Foundation run `37218196729` and Unit Tests run `37218196727` before merge.
- PR #14 weather-detail head `f0a5d61addb181ae76f8bf95267981ea71948197` passed Source Foundation run `37218354585` and Unit Tests run `37218354578` before merge.
- PR #15 saved-weather-place head `6327fc28fb234219a89ceeffea23acb140bbc2b6` passed Source Foundation run `37218627169` and Unit Tests run `37218627162` before merge.
- PR #17 native-source gate head `257b75eb736748f4746cf0c93c6a4d54bdd31377` passed Source Foundation run `37219968051`, Unit Tests run `37219968052`, and Native Source Compile run `37219968128` before merge.
- PR #21 settings-portability head `b0b4cd2a86c8bbd3a3983f90f0aa52a7ef30cb48` passed Source Foundation run `37220270573`, Unit Tests run `37220270439`, and Native Source Compile run `37220270406` before merge.
- Current authoritative source revision after these milestones is `d00426e197df4bd0cb7fd56759c1c3c994880cc1`.

The Source Foundation workflow verifies repository baseline, strict TypeScript type-checking, web source build, and Rust formatting. Native Source Compile additionally verifies Tauri Rust source compilation on Linux and Windows. These checks do **not** establish installer/package creation, representative native runtime behavior, device acceptance, or release acceptance.

## Not yet verified

Do not describe the following as completed or released:

- GoreeCloud Feeds article retrieval, source management, folders, read state, bookmarks, article search, OPML flows, or news reading UI backed by real article endpoints.
- Live end-to-end Open-Meteo runtime acceptance in a representative browser/native client.
- Current-device location permission or GoreeCloud Location integration.
- Official severe-weather alert integration.
- Android build/compile acceptance; Linux or Windows package/install/runtime acceptance.
- Representative browser runtime/accessibility acceptance.
- Glaze V1.7 downstream consumer acceptance.
- Privacy Shield, Wardveil Security, Everkeep, Manager, Mesh, Identity, Policy, or Observability runtime acceptance.
- GoreeCloud Sync or Notify runtime integration.
- Signed release packaging.
- Release Candidate, Production, or Stable qualification.

Add stronger claims only when the applicable exact-revision evidence exists.
