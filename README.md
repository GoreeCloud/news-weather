# GoreeCloud News & Weather

**GoreeCloud News & Weather** is a planned privacy-focused news and weather application for Android, the web, Linux, and Windows.

The installed application name is **News & Weather**.

The product is designed as a utility: selected news sources, useful weather information, conservative notifications, local-first operation where practical, and no advertising or engagement-maximizing feed.

## Current status

This repository is in **Development initialization**.

The product specification and repository governance baseline are being established before application implementation. Repository documentation is not evidence that Android, web, Linux, Windows, news, weather, synchronization, or GoreeCloud platform integrations are implemented.

The initial target release is **0.1.0 Development**.

## Product principles

- No advertising or sponsored placement.
- No engagement-maximizing ranking.
- No mandatory account for basic use.
- No unnecessary telemetry.
- No autoplaying promotional media.
- No generic recommendation feed.
- Chronological news by default.
- Manual weather locations fully supported.
- Current-location access only after explicit user action.
- Clear stale-weather timestamps.
- Calm, accessible, utility-oriented interface.

## Primary surfaces

- **Home** — current weather, important alerts, daily high/low, and a bounded set of recent headlines.
- **News** — chronological reading from sources selected by the user.
- **Weather** — current conditions, hourly forecast, seven-day forecast, precipitation, wind, and severe-weather alerts where supported.

## Architecture

News & Weather owns the user experience. News processing remains the responsibility of **GoreeCloud Feeds**.

```text
News & Weather
      │
      └── GoreeCloud Feeds
              ├── RSS / Atom
              ├── retrieval
              ├── normalization
              ├── deduplication
              ├── persistence
              ├── search
              └── synchronization
```

Weather uses a provider abstraction:

```text
External Weather Provider
          ↓
GoreeCloud Weather Adapter
          ↓
Normalized GoreeCloud Weather Model
          ↓
News & Weather
```

The preferred shared-client direction is **TypeScript** with **Tauri** for supported desktop and Android targets where appropriate. No framework or dependency is considered implemented until it exists in source and is verified.

## Documentation

- [PROJECT-SPECIFICATIONS.md](PROJECT-SPECIFICATIONS.md) — authoritative product and technical requirements.
- [PROJECT-RECORD.md](PROJECT-RECORD.md) — significant project history and evidence.
- [IMPLEMENTED-FEATURES.md](IMPLEMENTED-FEATURES.md) — verified implementation only.
- [PLANNED-FEATURES.md](PLANNED-FEATURES.md) — planned capability scope.
- [CHANGELOGS.md](CHANGELOGS.md) — release-oriented changes.
- [PRIVACY.md](PRIVACY.md) — privacy model.
- [SECURITY.md](SECURITY.md) — security expectations.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — architecture boundaries.
- [docs/PLATFORM-INTEGRATIONS.md](docs/PLATFORM-INTEGRATIONS.md) — platform-system applicability.
- [docs/DEVELOPMENT-PLAN-0.1.0.md](docs/DEVELOPMENT-PLAN-0.1.0.md) — first Development implementation plan.
- [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md) — evidence and acceptance model.

## License

Unless superseded by an accepted project-specific licensing decision, this repository uses the GoreeCloud default license:

**GNU Affero General Public License v3.0 or later — AGPL-3.0-or-later**

See [LICENSE](LICENSE).

## Repository identity

- Repository: `GoreeCloud/news-weather`
- Canonical product name: **GoreeCloud News & Weather**
- Installed name: **News & Weather**
- Candidate application identifier: `com.goreecloud.newsweather`
