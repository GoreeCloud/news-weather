# GoreeCloud News & Weather — Architecture

## Status

Planned Development architecture. This document is not evidence of implementation.

## Responsibility model

```text
                    GoreeCloud News & Weather
                              │
                ┌─────────────┴─────────────┐
                │                           │
              News                       Weather
                │                           │
                ▼                           ▼
       GoreeCloud Feeds          Weather Provider Adapter
                │                           │
          Go + PostgreSQL           Provider APIs
                │
        RSS / Atom Sources
```

### News & Weather owns

Application shell, Home/News/Weather interfaces, local preferences, saved-location presentation, bounded offline cache, user-facing search/filter controls, platform packaging, permissions UX, onboarding/contextual guidance, and weather presentation.

### GoreeCloud Feeds owns

RSS/Atom retrieval, parsing, normalization, deduplication, persistence, feed health, search, synchronization, and versioned news contracts.

News & Weather must consume approved Feeds contracts rather than recreate its backend.

### Weather adapter owns

Provider request translation, provider-specific authentication where required, response parsing, normalized weather-domain mapping, capability mapping, error translation, and alert normalization.

The app-domain model must not mirror a proprietary provider schema.

## Client direction

```text
Shared TypeScript Application
          │
          ├── Web
          ├── Windows through Tauri
          ├── Linux through Tauri
          └── Android through Tauri
```

Platform-specific code should exist only where platform behavior genuinely differs.

## Failure behavior

- Feeds unavailable → preserve cached readable content and show refresh failure.
- Weather provider unavailable → show last successful forecast with timestamp/stale state.
- Location unavailable → retain manual-location path.
- Identity unavailable → local-only use remains available.
- Sync unavailable → local state remains usable and clearly unsynchronized.
- Notifications unavailable → core news/weather remain usable.

## Integration boundary

Another GoreeCloud product's private database is not an integration API. Cross-product behavior must use an approved contract, API, protocol, or shared platform interface.
