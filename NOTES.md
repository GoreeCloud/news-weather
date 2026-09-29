# GoreeCloud News & Weather — Repository Notes

## Current direction

- Native GoreeCloud-owned implementation.
- Shared TypeScript client direction.
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
- GoreeCloud Feeds runtime integration is not yet implemented here.
- A weather provider is not yet connected.
- Native packaging and representative-device validation remain pending.
- Dependency lockfiles and full native build validation must be established as source dependencies mature.

Do not place secrets, credentials, private infrastructure data, or user data in this file.
