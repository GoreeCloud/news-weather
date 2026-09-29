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
