# GoreeCloud News & Weather — Acceptance Evidence

## Principle

Planned, coded, built, and verified are different states.

## Evidence levels

- **Planned** — requirement documented; no implementation claim.
- **Source implemented** — source exists and passes applicable source-level validation.
- **Build verified** — applicable target build completes from the authoritative candidate revision.
- **Representative runtime verified** — capability is exercised in a representative environment/device.
- **Development accepted** — required Development-scope platform, privacy, security, documentation, and integration checks are complete.
- **Stable accepted** — not applicable to the initial release; requires all governing Stable gates.

## 0.1.0 Development evidence

Maintain current evidence for:

- Android, Web, Linux, and Windows builds.
- Home/News/Weather navigation.
- GoreeCloud Feeds RSS/Atom path.
- Source management and chronological ordering.
- Read/unread state, bookmarks, and basic search.
- Manual weather location.
- Weather provider adapter.
- Current/hourly/seven-day forecasts.
- Severe alerts where supported.
- Bounded offline news cache.
- Stale-weather timestamp behavior.
- Theme modes.
- First-use onboarding and contextual-hint controls.
- Accessibility foundations.
- Location-permission behavior.
- Notification opt-in behavior.
- Privacy/data-minimization review.
- Security/trust-boundary review.
- Dependency-license review.

## Truthfulness rules

Do not mark evidence complete when the test ran against a different commit, only a mock was tested but a real provider is claimed, a web build is used to claim native support, source compiles without runtime exercise, a platform integration is only documented, stale evidence is used, or a provider feature is unsupported for the tested location.
