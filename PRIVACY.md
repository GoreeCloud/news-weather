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

The current Development source can retain up to eight saved manual-place strings locally for quick access. Saved-place values are normalized and deduplicated; provider-resolved latitude/longitude are not stored in the saved-place list.

Current-location weather must require an explicit user action. The implementation must explain why permission is needed, request only necessary precision, avoid retaining precise coordinates longer than necessary, and prefer normalized named/forecast locations for saved places where practical.

Where an approved GoreeCloud Location contract exists, use it rather than creating an unrelated location subsystem.

## News server context

The current Development News client does not send or accept a client-controlled Feeds user identifier. It requests article content only when the configured Feeds server advertises `articles:list-v1`; the Feeds server remains responsible for deriving authenticated or approved local user context.

Capability discovery omits credentials. User-scoped article requests may include the runtime's first-party credentials when the server advertises the capability. Requests use no-store behavior, reject redirects, apply no-referrer policy, and accept only HTTP/HTTPS publisher URLs from the validated article contract.

The default Feeds runtime still lacks an accepted user-context resolver and PostgreSQL runtime wiring, so these source controls are not a claim of deployed article availability.

## Local data

The product may retain bounded local state needed for useful operation, including source configuration, folders, read state, bookmarks, preferences, saved locations, onboarding/hint state, bounded article cache, and the latest successful weather snapshot.

## Weather freshness

The current Development source keeps at most one last-successful normalized weather snapshot for the saved manual-place query, bounded to 24 hours. Changing or clearing the manual place invalidates that cache. Cached weather is explicitly identified as cached/stale and retains its last-update context while a live refresh is attempted.

The Open-Meteo Development adapter persists the user's active place text and bounded saved-place text list, not the precise coordinates returned by geocoding. Resolved coordinates are used transiently for the forecast request.

## Local settings portability

The current Development source supports user-initiated settings export/import without an account or cloud dependency.

The portable settings document may include:

- theme and text-size preference;
- contextual-hint preference;
- weather presentation units;
- active manual weather place text; and
- saved manual-place text.

It excludes weather cache, onboarding completion state, accounts, credentials, telemetry, and provider-resolved coordinates. Imports are bounded to 64 KiB and must match the supported versioned schema. Changing the active manual place through import invalidates the previous weather cache and does not itself trigger a provider request.

## Accounts and synchronization

Account use remains optional for basic use. When synchronization is enabled, the user should be able to understand which data categories are synchronized.

## Notifications

No engagement reminders. Weather alerts should focus on meaningful severe weather after explicit enablement. News notifications should be limited to clearly selected sources.

## Observability

Diagnostics must be privacy-bounded and data-minimized. GoreeCloud Observability must not silently become behavioral analytics.

These are implementation requirements, not claims of completed controls.
