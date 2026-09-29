# GoreeCloud News & Weather — 0.1.0 Development Plan

## Objective

Deliver the first useful Development release without allowing the product to expand into an advertising, recommendation, or engagement platform.

## Phase 0 — Repository baseline

Establish authoritative project docs, README, changelog, security/privacy records, feature-state separation, architecture, platform integration evaluation, license, and acceptance model.

**Exit:** repository records are internally consistent and planned state is clearly separated from implemented state.

## Phase 1 — Shared application foundation

- Shared TypeScript workspace.
- Web target.
- Tauri targets for Windows/Linux.
- Android Tauri target after toolchain verification.
- App identity/configuration.
- Glaze UI foundation.
- Home/News/Weather navigation shell.
- Settings/local preferences.
- First-use onboarding and contextual-hint state.
- Accessibility foundations.
- Unit/lint/build CI.

**Exit:** minimal shell builds on supported Development targets and navigates among empty states.

## Phase 2 — News vertical

- Consume current versioned GoreeCloud Feeds contract.
- Source management.
- Chronological article list.
- Article metadata.
- Read/unread state.
- Bookmarks.
- Folders/categories.
- Search/filtering.
- OPML import/export.
- Bounded offline cache.
- Legitimate clean-reading/original-publisher behavior.

**Exit:** representative Development environment presents real user-selected feeds through GoreeCloud Feeds.

## Phase 3 — Weather vertical

- Normalized weather-domain model.
- Provider adapter interface.
- One provider path.
- Manual location.
- Explicit current-location action.
- GoreeCloud Location integration when approved contract exists.
- Current/hourly/seven-day forecast.
- Precipitation, wind, humidity, sunrise/sunset where available.
- Severe alerts where supported.
- Last-successful forecast cache and stale presentation.

**Exit:** real weather data works through one normalized provider path with clear failure/staleness behavior.

## Phase 4 — Home, settings, offline, notifications

Compose bounded Home, complete units/settings, privacy controls, conservative notifications, and offline behavior.

**Exit:** Home answers “What is happening?” and “What is the weather?” without infinite scrolling or unrelated content.

## Phase 5 — GoreeCloud platform integration

Evaluate and implement every applicable Integral Platform System and separately governed Location/Notify/Sync/Application Foundation contracts.

**Exit:** every required system has explicit applicability and evidence state.

## Phase 6 — 0.1.0 Development acceptance

- Android/Web/Linux/Windows builds.
- Representative runtime validation.
- Clean-install onboarding.
- Permission-flow validation.
- Accessibility pass.
- Offline/stale-weather validation.
- Security/privacy review.
- Dependency-license review.
- Changelog and feature-state reconciliation.

**Exit:** Development release evidence exists. It must not be called Stable.

## Explicitly deferred

AI summaries, recommendation ranking, radar, social features, video feeds, personalized discovery, home-screen widgets, multi-provider switching, full account sync, advanced charts, and advanced analytics.
