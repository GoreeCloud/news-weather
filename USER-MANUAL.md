# GoreeCloud News & Weather — User Manual

## Status

Development source manual. No public Development release has been verified yet.

This manual describes the intended and source-level application experience. Runtime behavior must be verified before it is presented as released functionality.

## Primary navigation

The application is designed around:

- **Home**
- **News**
- **Weather**

Search and Settings are supporting actions.

## First use

The current Development source onboarding introduces:

1. What News & Weather does.
2. The user-selected-source news model.
3. Manual weather-location setup.
4. Optional current-location behavior.
5. Privacy-sensitive permissions only when relevant.
6. Optional contextual hints.

Basic use must not require account creation.

## Home

Home is intentionally bounded. The current Development source can present the manual-place weather summary when a forecast is available and can show up to eight recent Feeds headlines when the configured Feeds server advertises `articles:list-v1`. If that capability is unavailable or the server cannot derive an approved user context, Home shows a truthful empty/error state instead of inventing content.

## News

News is intended to show articles from user-selected RSS/Atom sources in chronological order by default. The current Development source now understands the verified Feeds `articles:list-v1` contract and can render returned chronological article summaries with source, publication time, unread, and saved-state labels. Publisher links are limited to HTTP/HTTPS. The default Feeds runtime still requires approved user-context and PostgreSQL wiring before ordinary end-to-end article availability is established.

## Weather

Weather currently supports manual-place lookup through the Open-Meteo Development adapter. The current-condition view includes feels-like temperature, humidity, wind speed, wind direction, precipitation, sunrise, and sunset where available. The entered place text is stored locally; resolved coordinates are transient. Current-device location is not implemented yet and no GPS permission is requested.

The latest successful normalized forecast is cached for up to 24 hours for the same manual place. Cached forecasts are labeled as cached/stale and show freshness information while the app attempts a live refresh.

Up to eight manual places can be saved locally for quick switching. Saved places store normalized place text only. Saving, selecting, or removing a place does not require an account or GPS permission.

## Settings

The current Development Settings surface provides theme, text-size, contextual-hint, temperature-unit, wind-unit, and precipitation-unit controls. Temperature can be shown in Celsius or Fahrenheit, wind in km/h or mph, and precipitation in millimeters or inches. Unit choices are local presentation preferences; cached/provider weather remains normalized internally. Saved weather places are managed directly on Weather.

The current Settings surface can export a small versioned JSON settings file containing local appearance, weather-unit, contextual-hint, active manual-place, and saved-place preferences. It excludes weather cache, onboarding completion, accounts, credentials, telemetry, and provider-resolved coordinates. Import is bounded to 64 KiB and validates the News & Weather schema/version before applying supported values. If an imported active place differs from the current one, the old weather cache is cleared and the app waits for an explicit forecast load rather than contacting the provider automatically.

Additional planned Settings areas include sources, folders, notifications, refresh/cache controls, privacy permissions, and synchronization.

## Offline behavior

Bounded offline news caching remains planned; the current source does not yet persist article summaries for offline use.

The current Development source keeps one bounded last-successful weather snapshot for up to 24 hours and shows explicit cached/stale freshness when a live refresh cannot replace it.

## Accounts

Accounts are optional for basic use. Future account-backed capabilities may synchronize sources, folders, bookmarks, read state, locations, and preferences.

## Current Development boundary

Until a release is verified, build/install instructions and screenshots should not imply that the complete product is available.
