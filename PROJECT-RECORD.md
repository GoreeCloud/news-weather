# GoreeCloud News & Weather — Project Record

## Document Control

| Field | Value |
|---|---|
| Project | GoreeCloud News & Weather |
| Repository | GoreeCloud/news-weather |
| Document type | Project Record |
| Status | Active |
| Version | v0.1 |
| Authoritative record | Yes — repository-local PROJECT-RECORD.md |
| Owner | GoreeCloud |
| Classification | Public repository content |
| Established | 2026-09-29 |

## Purpose

This file preserves significant project history, governance events, architectural transitions, repository events, major implementation milestones, validation evidence, and other changes needed to understand how GoreeCloud News & Weather evolved.

It is not a release changelog. Routine user-facing release changes should be recorded in the repository changelog when that file is established.

## 2026-09-29 — Initial Project Specification Established

### Event

The initial authoritative repository-local product specification for **GoreeCloud News & Weather** was established in PROJECT-SPECIFICATIONS.md.

### Verified Repository State

Before the initial specification was written:

- Repository: **GoreeCloud/news-weather**
- GitHub owner: **GoreeCloud**
- Default branch: **main**
- Visibility: **public**
- Archived: **no**
- Repository size reported by GitHub: **0**
- Application implementation was not present or verified.

### Product Direction Established

The initial specification established the following direction:

- Canonical product name: **GoreeCloud News & Weather**.
- Installed application name: **News & Weather**.
- Candidate Android/application identifier: **com.goreecloud.newsweather**.
- Target platforms: Android, Web, Linux, and Windows.
- Preferred shared-client direction: TypeScript with Tauri for desktop and Android targets where technically appropriate.
- News authority: GoreeCloud Feeds.
- Weather direction: provider-agnostic GoreeCloud weather adapter and normalized internal weather model.
- Primary product surfaces: Home, News, and Weather.
- Core product posture: no advertising, no sponsored placement, no engagement-maximizing ranking, no forced account, no unnecessary telemetry, and no unrelated information surfaces.
- Privacy posture: manual location fully supported; current-location access is explicit and permission-bounded.
- Default news ordering: chronological.
- First Development target: **0.1.0 Development**.

### Architecture Boundary Established

The project specification separated responsibility among:

- **GoreeCloud News & Weather** — user experience and application behavior.
- **GoreeCloud Feeds** — RSS/Atom retrieval, normalization, deduplication, persistence, search, and synchronization.
- **Weather Provider Adapter** — external-provider normalization.
- Applicable GoreeCloud platform systems — bounded, contract-driven integrations rather than direct private-database manipulation.

### Current-State Note

This milestone records product direction and repository documentation initialization.

It does **not** establish that the application, platform integrations, weather provider path, builds, release artifacts, or runtime functionality have been implemented or verified.

## 2026-09-29 — Development Source Foundation and Weather Path Integrated

### Event

The first executable Development source foundation and the first bounded manual-place weather path were integrated into authoritative `main`.

### Source Foundation

PR #2 merged the TypeScript/Vite and Tauri 2 source foundation. Its exact candidate head `258d847389d6a80d73554a39c4b43772ccc6bc28` passed the Source Foundation workflow before merge.

The merged foundation established:

- Home, News, and Weather navigation.
- Settings and local preference persistence.
- First-use onboarding and optional contextual hints.
- System, light, and dark theme handling.
- Tauri 2 source configuration and minimal capability permissions.
- Platform Contract 0.4 repository manifest.

### Development Feeds and Weather Adapter

PR #3 merged the first provider/integration tranche. Exact head `d5893f1a0cb1d7bf3dc51328f597b4e12b23a5e0` passed Source Foundation workflow run `36544875319`.

The tranche established:

- GoreeCloud Feeds `0.1.0-dev` capability negotiation without inventing unsupported article endpoints.
- Provider-independent GoreeCloud weather-domain models.
- Open-Meteo Development manual-place geocoding and weather adapter.
- Current, hourly, and seven-day weather source/UI foundations.
- Scoped network Content Security Policy.
- Provider attribution and third-party notices.
- Privacy boundary that persists the user's place text while keeping resolved coordinates transient.

### Bounded Offline Weather Cache

PR #5 merged a bounded last-successful weather cache. Exact head `c8946d0024108e5f9d9ac34e3aadd03603adff69` passed Source Foundation workflow run `36545235443`.

The cache:

- stores one normalized forecast snapshot;
- is matched to the same manual-place query;
- expires after 24 hours;
- is invalidated when the manual place changes or is cleared;
- is presented explicitly as cached/stale;
- remains visible when a live refresh fails.

Authoritative `main` after this milestone is `97718fa0ccb9b0a25ef0f592dbf48cf698ea0993`.

### Verification Boundary

The Source Foundation workflow verifies repository baseline, strict TypeScript checking, web source build, and Rust formatting.

This milestone does **not** establish representative browser runtime acceptance, live Open-Meteo endpoint acceptance, Android/Linux/Windows build or device acceptance, GoreeCloud platform-system acceptance, signed release artifacts, Production status, Release Candidate status, or Stable qualification.

