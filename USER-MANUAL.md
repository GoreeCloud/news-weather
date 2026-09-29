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

Home is intentionally bounded. The current Development source can present the manual-place weather summary when a forecast is available. News remains an empty, truthful state because the verified GoreeCloud Feeds 0.1.0-dev protocol does not yet expose article endpoints.

## News

News is intended to show articles from user-selected RSS/Atom sources in chronological order by default. The current source can verify the GoreeCloud Feeds Development capability contract, but article retrieval and reading are not yet available.

## Weather

Weather currently supports manual-place lookup through the Open-Meteo Development adapter. The entered place text is stored locally; resolved coordinates are transient. Current-device location is not implemented yet and no GPS permission is requested.

The latest successful normalized forecast is cached for up to 24 hours for the same manual place. Cached forecasts are labeled as cached/stale and show freshness information while the app attempts a live refresh.

## Settings

Settings are intended to cover sources, folders, locations, units, notifications, theme, text size, refresh/cache behavior, privacy permissions, synchronization, import/export, and contextual-hint controls.

## Offline behavior

Previously cached news may remain readable within configured limits.

The current Development source keeps one bounded last-successful weather snapshot for up to 24 hours and shows explicit cached/stale freshness when a live refresh cannot replace it.

## Accounts

Accounts are optional for basic use. Future account-backed capabilities may synchronize sources, folders, bookmarks, read state, locations, and preferences.

## Current Development boundary

Until a release is verified, build/install instructions and screenshots should not imply that the complete product is available.
