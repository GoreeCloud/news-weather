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

## 2026-09-29 — Provider Tests, Weather Units, and Text-Size Accessibility Integrated

### Provider and Cache Contract Tests

PR #8 added deterministic Node 24 unit coverage for the current Development provider boundaries. Exact head `5afef4191d8971fd369c24d2dea15a837dce8250` passed:

- Source Foundation run `36546118757`.
- Unit Tests run `36546118799`.

The tests cover bounded weather-cache behavior, Open-Meteo normalization and coordinate-minimization boundaries, GoreeCloud Feeds `0.1.0-dev` capability compatibility, and fail-closed Development endpoint restrictions.

### Weather Presentation Units

PR #9 added local presentation-unit preferences while preserving metric normalization in provider and cache models. Exact head `55d4f6a7f27e1c9553238359485a2e9dcb151d4e` passed:

- Source Foundation run `36546673081`.
- Unit Tests run `36546673063`.

Implemented preferences include:

- Celsius or Fahrenheit.
- km/h or mph.
- Millimeters or inches.
- Legacy-safe defaults for existing preference records.
- Deterministic conversion tests.

The merged authoritative revision for this milestone is `a0b374714ccf0fb6e1eb85b9156cbd3c8278b414`.

### Text-Size Accessibility

PR #10 added local text-size personalization that builds on browser/platform scaling instead of replacing it. Exact head `f5cbfe1c57e922defa6a956d94d8b6f7c9c3f1d1` passed:

- Source Foundation run `36546996822`.
- Unit Tests run `36546996814`.

Implemented choices are system/default, large, and extra large. The Settings dialog is viewport-bounded and scrollable so increased text size does not make controls unreachable.

The merged authoritative revision for this milestone is `63aa9b8b27f71692e5a713ac37cc33baaac4e9a5`.

### Verification Boundary

These milestones strengthen source correctness and accessibility foundations. They do not establish representative rendered accessibility acceptance, assistive-technology acceptance, native-device acceptance, Glaze UI downstream acceptance, Production, Release Candidate, or Stable qualification.

## 2026-10-04 — Glaze Target, Weather Details, and Saved Places Advanced

### Glaze V1.7 Target

PR #12 updated the News & Weather shared design-system target from the superseded GLAZE UI V1.6 baseline to **Glaze V1.7 / 1.7.0**. Exact head `5187464bf0ab7d8606b08cb75d77576c5e8a9376` passed:

- Source Foundation run `37218196729`.
- Unit Tests run `37218196727`.

The repository remains adoption-required. This target update does not establish downstream rendered, accessibility, representative-platform, performance, privacy/security, rollback, release, or product acceptance.

### Weather Detail Completeness

PR #14 added wind-direction presentation plus today's sunrise and sunset using weather data already present in the normalized provider model. It also centralized provider-local time formatting and added deterministic direction/time tests.

Exact head `f0a5d61addb181ae76f8bf95267981ea71948197` passed:

- Source Foundation run `37218354585`.
- Unit Tests run `37218354578`.

Merged revision: `3659a791055cc80d6bf2b2aa2d7386f2ce278ad3`.

### Saved Manual Weather Places

PR #15 added a bounded local saved-place model and UI.

The implementation:

- stores at most eight manual-place strings;
- normalizes whitespace and deduplicates case-insensitively;
- stores place text only, not provider-resolved coordinates;
- supports save, quick switch, and remove actions;
- preserves account-optional and GPS-free basic weather use;
- retains existing weather-cache invalidation behavior when the active place changes.

Exact head `6327fc28fb234219a89ceeffea23acb140bbc2b6` passed:

- Source Foundation run `37218627169`.
- Unit Tests run `37218627162`.

Merged authoritative revision: `d70a8b001a52a4b0c3ac62307e5e0c96ed9a9ea1`.

### Continuing Boundaries

These milestones do not establish live-provider representative runtime acceptance, current-device location, official severe-weather alerts, GoreeCloud Feeds article endpoints, Glaze consumer acceptance, native build/device acceptance, signed release artifacts, Production, Release Candidate, or Stable qualification.

## 2026-10-04 — Native Source Compile Gate and Local Settings Portability

### Linux and Windows Native Source Compilation

PR #17 strengthened the native source gate after the first compiler run exposed missing Tauri icon derivatives.

The accepted implementation:

- keeps `src-tauri/icons/icon.svg` as the canonical source asset;
- generates PNG/ICO/ICNS and other required derivatives through Tauri's icon generator before native Development build activity;
- excludes generated icon derivatives from source control;
- compiles Tauri Rust source on Linux and Windows in CI.

Exact head `257b75eb736748f4746cf0c93c6a4d54bdd31377` passed:

- Source Foundation run `37219968051`.
- Unit Tests run `37219968052`.
- Native Source Compile run `37219968128`, including successful Linux and Windows `cargo check --all-targets`.

Merged revision: `cc407038811ed80f62dcfc2e9a172d3c0bbe3af9`.

This establishes host source-compilation evidence only. It does not establish Linux/Windows package creation, installation, representative runtime acceptance, Android compilation, signing, release, Production, or Stable qualification.

### Privacy-Bounded Settings Portability

PR #21 added local versioned settings import/export.

Portable state is limited to presentation preferences, contextual-hint preference, weather units, the active manual-place string, and saved manual-place strings. Export deliberately excludes weather cache, onboarding completion, accounts, credentials, telemetry, and provider-resolved coordinates.

Import is bounded to 64 KiB, validates schema/version, normalizes saved places, preserves current onboarding completion, and clears the old weather cache if the active place changes without automatically making a provider request.

Exact head `b0b4cd2a86c8bbd3a3983f90f0aa52a7ef30cb48` passed:

- Source Foundation run `37220270573`.
- Unit Tests run `37220270439`.
- Native Source Compile run `37220270406`.

Merged authoritative revision: `d00426e197df4bd0cb7fd56759c1c3c994880cc1`.

### Dependency Blockers Recorded

- News & Weather issue #19 records that GoreeCloud Feeds article/source/search network contracts are required before the News surface can retrieve real articles.
- News & Weather issue #20 records that an approved one-shot current-location consumer contract is required before News & Weather may request current-device location.

Manual weather use remains available without GPS or an account while those dependencies remain open.

## 2026-10-04 — GoreeCloud Feeds Article Contract Consumed

### Upstream Contract

GoreeCloud Feeds established a bounded Development article-list contract on authoritative Feeds `main` at revision `56729b8a2aa7bbded7501b7a4aeac94a5b3df9ca`.

The contract defines `GET /api/v1/articles`, capability `articles:list-v1`, a 1..100 item bound, explicit 400/401/503 behavior, and server-derived authenticated or approved local user context without any client-supplied user identifier.

### News & Weather Client Integration

PR #24 added capability-gated consumption of that contract.

The News & Weather source:

- requests article summaries only when Feeds advertises `articles:list-v1`;
- validates exact response fields and bounded result size;
- rejects non-HTTP/HTTPS article URLs;
- validates publication timestamps when present;
- keeps capability discovery credential-free;
- allows first-party runtime credentials only on the user-scoped article request;
- applies no-store, redirect refusal, no-referrer, and bounded request timeout behavior;
- shows up to eight recent headlines on Home;
- shows returned chronological summaries on News;
- exposes source, publication time, unread state, and saved state;
- preserves truthful unavailable/empty/error states when the capability or runtime user context is unavailable.

Exact head `88a13979b93b14dd3c63daa275eb9edee0b4d1bc` passed:

- Source Foundation run `37222481694`.
- Unit Tests run `37222481718`.
- Native Source Compile run `37222481699`.

Merged authoritative revision: `45144738ebf88ab692189c161434ef28a38beda9`.

### Continuing Boundary

This milestone establishes source-level client support for the published Feeds article contract. It does not establish that the default Feeds runtime currently advertises article listing or has accepted authenticated/local-only user-context and PostgreSQL wiring. Source management, folders, OPML, search, write-state synchronization, full offline publisher/article content, representative runtime acceptance, release, Production, Release Candidate, and Stable qualification remain open.

## 2026-10-04 — Bounded Offline News Summary Cache

### Event

PR #26 added a bounded local fallback for already-validated GoreeCloud Feeds article summaries.

The cache:

- stores at most 50 article summaries;
- expires after 24 hours;
- deduplicates by article ID;
- retains bounded title, source name, publication time, unread/saved state, optional summary, and optional validated HTTP/HTTPS publisher URL;
- does not retain Feeds credentials, client-supplied user identifiers, full publisher article bodies, provider coordinates, or Feeds private-database internals;
- rejects structurally unexpected fields, malformed dates, unsafe URLs, invalid article state, malformed cache envelopes, and expired records;
- clears stale cached headlines when a successful live request returns an empty article list;
- remains optional when local storage is unavailable.

When the Feeds article capability is absent or a live article request fails, a still-valid cache may remain visible with an explicit cached-news age and stale/unavailable message. Live results replace the fallback cache.

Exact head `c0dfb2435b526994629eebbe7f4880574dd7dc0d` passed:

- Source Foundation run `37223081314`.
- Unit Tests run `37223081276`.
- Native Source Compile run `37223081278`.

Merged authoritative revision: `959c261bac1178fea1de40e53a8915cb44ab5b6a`.

### Verification Boundary

This milestone establishes source-level bounded article-summary persistence and fallback behavior. It does not establish full offline publisher/article reading, deployed Feeds article availability, representative browser/native runtime acceptance, release, Production, Release Candidate, or Stable qualification.

