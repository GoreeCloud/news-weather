# GoreeCloud News & Weather — Repository Notes

## Current direction

- Native GoreeCloud-owned implementation.
- Shared TypeScript/Vite client foundation implemented in source.
- Tauri 2 target for Windows, Linux, and Android where supported.
- Web target from the same frontend foundation.
- GoreeCloud Feeds remains the news-processing authority.
- Weather remains provider-abstracted.
- GLAZE UI V1.6 / 1.6.0 is the current consumer target.
- Platform Contract 0.4 is the current platform-manifest target.
- AGPL-3.0-or-later is the current default license baseline.

## Current known boundaries

- GoreeCloud Application Foundation does not yet provide a usable implementation contract.
- News & Weather has not completed Glaze consumer acceptance.
- GoreeCloud Feeds 0.1.0-dev capability negotiation is implemented in source, but its verified protocol does not yet expose article endpoints.
- The Open-Meteo manual-place Development adapter is implemented in source with attribution and a bounded 24-hour last-successful forecast cache; representative live-provider runtime acceptance remains open.
- Native packaging and representative-device validation remain pending.
- Dependency lockfiles and full native build validation must be established as source dependencies mature.

Do not place secrets, credentials, private infrastructure data, or user data in this file.
