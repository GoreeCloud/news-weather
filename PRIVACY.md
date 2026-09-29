# GoreeCloud News & Weather — Privacy Model

Privacy is a product requirement.

## Core commitments

Basic news and weather use must not require a GoreeCloud account.

The product must not introduce:

- Advertising or advertising identifiers.
- Sponsored placement.
- Behavioral engagement profiling.
- Unnecessary telemetry.
- Silent location history.
- Forced cloud synchronization.
- Generic recommendation tracking.

## Location

Manual weather locations must be fully supported.

Current-location weather must require an explicit user action. The implementation must explain why permission is needed, request only necessary precision, avoid retaining precise coordinates longer than necessary, and prefer normalized named/forecast locations for saved places where practical.

Where an approved GoreeCloud Location contract exists, use it rather than creating an unrelated location subsystem.

## Local data

The product may retain bounded local state needed for useful operation, including source configuration, folders, read state, bookmarks, preferences, saved locations, onboarding/hint state, bounded article cache, and the latest successful weather snapshot.

## Weather freshness

Cached weather must include clear freshness context and must never be presented as current when stale.

## Accounts and synchronization

Account use remains optional for basic use. When synchronization is enabled, the user should be able to understand which data categories are synchronized.

## Notifications

No engagement reminders. Weather alerts should focus on meaningful severe weather after explicit enablement. News notifications should be limited to clearly selected sources.

## Observability

Diagnostics must be privacy-bounded and data-minimized. GoreeCloud Observability must not silently become behavioral analytics.

These are implementation requirements, not claims of completed controls.
