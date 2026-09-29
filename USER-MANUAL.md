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

The application should introduce:

1. What News & Weather does.
2. The user-selected-source news model.
3. Manual weather-location setup.
4. Optional current-location behavior.
5. Privacy-sensitive permissions only when relevant.
6. Optional contextual hints.

Basic use must not require account creation.

## Home

Home is intentionally bounded. It is intended to show a weather summary, important alerts, and a small set of recent headlines from selected sources.

## News

News is intended to show articles from user-selected RSS/Atom sources in chronological order by default.

## Weather

Weather supports manual locations. Current-location weather is optional and requires an explicit user action.

Cached forecasts must show freshness information.

## Settings

Settings are intended to cover sources, folders, locations, units, notifications, theme, text size, refresh/cache behavior, privacy permissions, synchronization, import/export, and contextual-hint controls.

## Offline behavior

Previously cached news may remain readable within configured limits.

The latest successful weather forecast may remain visible while offline, but must show when it was last updated.

## Accounts

Accounts are optional for basic use. Future account-backed capabilities may synchronize sources, folders, bookmarks, read state, locations, and preferences.

## Current Development boundary

Until a release is verified, build/install instructions and screenshots should not imply that the complete product is available.
