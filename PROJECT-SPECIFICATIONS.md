# GoreeCloud News & Weather — Project Specifications

## Document Control

| Field | Value |
|---|---|
| Project | GoreeCloud News & Weather |
| Installed application name | News & Weather |
| Repository | GoreeCloud/news-weather |
| Document type | Project Specification |
| Status | Active development specification |
| Specification version | v0.1 |
| Initial development target | 0.1.0 Development |
| Current implementation state | Repository initialized for documentation; application implementation is not yet verified |
| Supported target platforms | Android, Web, Linux, Windows |
| Candidate application identifier | com.goreecloud.newsweather |
| Authoritative record | Yes — this repository-local PROJECT-SPECIFICATIONS.md |
| Owner | GoreeCloud |
| Classification | Public repository content |
| Established | 2026-09-29 |

## 1. Product Purpose

I want to build **GoreeCloud News & Weather** as a simple, privacy-focused application for Android, the web, Linux, and Windows.

My goal is to provide the news and weather information I actually want without advertising, sponsored content, unnecessary recommendations, engagement tricks, clutter, or unrelated information.

I want the application to feel like a utility rather than a media platform designed to keep me scrolling.

The governing product principle is:

> **Information without manipulation. Weather without clutter. News without advertising. Privacy without requiring an account.**

## 2. Product Direction

I will treat **GoreeCloud News & Weather** as its own user-facing GoreeCloud application while reusing the existing **GoreeCloud Feeds** platform for news retrieval, processing, storage, and synchronization.

I do not want to create another RSS or feed-processing backend when GoreeCloud Feeds already exists for that purpose.

GoreeCloud Feeds provides the intended architectural foundation for:

- RSS and Atom retrieval.
- Feed normalization.
- Article processing.
- Deduplication.
- PostgreSQL-backed persistence.
- Search.
- Feed health.
- Synchronization.
- Versioned HTTP/JSON client and server contracts.
- Web-client development.

News & Weather will therefore consume the GoreeCloud Feeds platform rather than duplicate its responsibilities.

Weather will be a separate application capability with its own clean provider architecture.

## 3. Product Identity

My preferred canonical product name is:

**GoreeCloud News & Weather**

The shorter installed application and launcher name will be:

**News & Weather**

This preserves GoreeCloud ownership identity in documentation, websites, repositories, application metadata, and other ownership-sensitive contexts while keeping the installed application name concise.

Candidate application identifier:

**com.goreecloud.newsweather**

The final identifier remains subject to the normal GoreeCloud naming and application-governance process.

## 4. Core Experience

The application will have three primary surfaces:

### 4.1 Home

Home will give me a small overview of what matters right now.

It may contain:

- Current temperature.
- Current weather condition.
- Important active weather alerts.
- Today's high and low.
- A small precipitation indication when useful.
- Approximately six to ten recent headlines from my selected sources.

Home must not become an endlessly scrolling dashboard.

Its purpose is to answer two simple questions:

**What is happening?**

**What is the weather?**

### 4.2 News

News will provide a clean chronological reading experience.

It will support:

- RSS.
- Atom.
- Source subscriptions.
- OPML import.
- OPML export.
- Folders.
- Categories.
- Read and unread state.
- Bookmarks.
- Search.
- Source filtering.
- Date filtering where useful.
- Offline reading where technically practical.

The default news ordering will be chronological.

I do not want an opaque ranking algorithm deciding which articles I should see first. If I want technology, science, local news, world news, sports, or another category, I will subscribe to sources covering those subjects.

### 4.3 Weather

Weather will provide the information I commonly need without becoming an overloaded meteorological dashboard.

It will include:

- Current conditions.
- Feels-like temperature where available.
- Today's forecast.
- Hourly forecast.
- Seven-day forecast.
- Precipitation probability.
- Expected precipitation.
- Wind speed.
- Wind direction.
- Humidity where useful.
- Sunrise and sunset where useful.
- Official severe-weather alerts.

More advanced weather information may be added later only when it provides a meaningful product benefit.

## 5. No-Ads and No-Bloat Requirement

The absence of advertising and clutter is a product requirement, not merely a visual preference.

> GoreeCloud News & Weather must not contain advertising, sponsored placement, engagement-maximizing ranking, mandatory accounts, unnecessary telemetry, autoplaying media, promotional modules, or unrelated information surfaces. Every permanent interface element must directly support reading selected news, checking weather, managing sources or locations, searching, saving, or configuring the application.

The application must not include:

- Advertisements.
- Sponsored articles.
- Sponsored search results.
- Affiliate content.
- Promotional cards.
- Trending-for-engagement sections.
- Celebrity-news modules unless I explicitly subscribe to them.
- Stock tickers that I did not request.
- Sports scores that I did not request.
- Video autoplay.
- Infinite recommendation feeds.
- Engagement scores.
- For You pages.
- Artificial urgency.
- Clickbait notifications.
- You might also like modules.
- Generic recommendations.
- Forced account creation.

If a permanent element cannot justify why it belongs in a news-and-weather application, it should not be there.

## 6. News Architecture

GoreeCloud Feeds will be the authoritative news backend.

~~~text
News & Weather
      │
      └── GoreeCloud Feeds
              │
              ├── RSS
              ├── Atom
              ├── retrieval
              ├── parsing
              ├── normalization
              ├── deduplication
              ├── persistence
              ├── search
              └── synchronization
~~~

Articles should remain closely associated with their original sources.

A normal article item should show only useful information such as:

- Headline.
- Source.
- Publication time.
- Optional thumbnail.
- Short feed-provided summary where appropriate.
- Read or unread state.
- Bookmark state.

When a feed provides usable article content, the application may offer a clean reading view.

When it does not, the application may open the original publisher page.

The product will not be built around unrestricted article scraping or paywall circumvention.

## 7. News Philosophy

News & Weather will be fundamentally different from an engagement-driven social feed.

I will retrieve information that I explicitly choose to follow.

I do not want the application continuously guessing what will keep me looking at the screen.

Preferred model:

~~~text
I choose source
      ↓
Source publishes article
      ↓
GoreeCloud Feeds retrieves article
      ↓
News & Weather presents article
~~~

The product intentionally rejects an engagement-maximizing model such as:

~~~text
Platform observes behavior
      ↓
Platform creates behavioral profile
      ↓
Algorithm predicts engagement
      ↓
Content is ranked to maximize attention
~~~

## 8. Weather Architecture

Weather providers will remain behind a GoreeCloud-controlled abstraction.

~~~text
External Weather Provider
          ↓
GoreeCloud Weather Adapter
          ↓
Normalized GoreeCloud Weather Model
          ↓
News & Weather
~~~

The user interface, application database, and internal application logic must not be tightly coupled to one provider's proprietary schema.

The provider layer must make it practical to replace or add providers without redesigning the application.

Potential providers may include:

- U.S. National Weather Service for supported U.S. weather capabilities.
- Open-Meteo where appropriate.
- Additional providers later when justified.

Provider selection must remain replaceable rather than permanently hard-coded into the product architecture.

## 9. Location and Privacy

Location behavior must be privacy-first.

Manual location entry will be fully supported.

I should be able to enter:

- City.
- ZIP code.
- Postal code.
- Saved location.
- Another supported place identifier.

GPS permission must not be required merely to use Weather.

**Use my current location** will be an explicit user action.

If I enable current-location weather, the application should request only the permissions necessary for that feature.

Checking the weather must not silently create a detailed location-history database.

Precise coordinates should be retained only where genuinely required.

Where practical, saved weather locations should use a less-sensitive representation such as a named place or normalized forecast location rather than indefinitely retaining unnecessary precise movement data.

Where an approved GoreeCloud Location contract exists, News & Weather should integrate with it rather than create an unrelated location subsystem.

## 10. Accounts and Local-Only Use

A GoreeCloud account must not be required for basic use.

The application should remain useful in a local-only mode.

An account may later enhance the product through features such as:

- Synchronizing feed subscriptions.
- Synchronizing folders.
- Synchronizing bookmarks.
- Synchronizing read state.
- Synchronizing saved locations.
- Synchronizing preferences across devices.

These features must enhance the product rather than become prerequisites for checking a forecast or reading an RSS feed.

## 11. Notifications

Notifications must remain conservative.

Weather notifications should primarily cover meaningful severe-weather alerts after I explicitly enable them.

News notifications may be offered for sources that I explicitly select.

The application must not use notifications such as:

- You haven't opened News & Weather today.
- Here are stories you may have missed.
- This article is trending.
- Come back and see what's new.
- Generic engagement reminders.

Notifications should communicate useful information rather than attempt to create an engagement habit.

## 12. Cross-Platform Architecture

The product will target:

- Android.
- Web.
- Linux.
- Windows.

The preferred client architecture is a shared TypeScript application:

~~~text
Shared TypeScript Application
          │
          ├── Web
          │
          ├── Windows through Tauri
          │
          ├── Linux through Tauri
          │
          └── Android through Tauri
~~~

This direction is intended to maximize shared application code while retaining platform-specific integration where necessary.

It also aligns with the existing TypeScript client direction in GoreeCloud Feeds.

Flutter remains a possible future alternative, but adopting it would introduce Dart and Flutter as another major application stack. Unless Flutter later provides a substantial product advantage, the preference is to minimize unnecessary technology diversity.

## 13. Backend Responsibility Boundaries

Responsibilities will remain separated.

~~~text
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
~~~

News & Weather owns the user experience.

GoreeCloud Feeds owns feed processing.

The weather adapter owns external weather-provider normalization.

These responsibilities should not be unnecessarily mixed together.

## 14. GoreeCloud Platform Integration

Where architecturally applicable, News & Weather should participate in the existing GoreeCloud platform instead of independently rebuilding platform capabilities.

The application must evaluate integration with:

- Glaze UI.
- GoreeCloud Privacy Shield.
- Wardveil Security.
- GoreeCloud Location.
- GoreeCloud Identity.
- GoreeCloud Notify.
- GoreeCloud Sync.
- Everkeep.
- GoreeCloud Application Foundation.
- GoreeCloud Manager.
- GoreeCloud Mesh.
- GoreeCloud Policy.
- GoreeCloud Observability.
- Other approved GoreeCloud platform contracts where appropriate.

Integration must remain bounded and contract-driven.

News & Weather must not directly manipulate another GoreeCloud product's private database.

A platform integration must not be treated as implemented merely because it appears in this specification. Each integration requires implementation and verification evidence before being represented as current functionality.

## 15. User Interface

The interface should feel calm.

I prefer substantial empty space over filling every available area with information.

Primary navigation may be:

~~~text
Home     News     Weather
~~~

Search and Settings should remain available as normal actions.

The application should respect:

- Light theme.
- Dark theme.
- System theme.
- Font scaling.
- Screen readers.
- Keyboard navigation.
- Touch.
- Mouse.
- Reduced-motion preferences.
- High-contrast needs where supported.

Glaze UI should provide the shared GoreeCloud visual and interaction language.

## 16. Offline Behavior

The application should remain useful when connectivity is temporarily unavailable.

For News:

- Cache a bounded number of previously retrieved articles.
- Preserve relevant reading state locally.
- Keep offline behavior bounded and privacy-conscious.

For Weather:

- Keep the latest successfully retrieved forecast visible.
- Clearly indicate when it was last updated.
- Never imply that stale weather information is current.

Example:

~~~text
Last updated 42 minutes ago
~~~

## 17. Search

News search should primarily search:

- Retrieved article titles.
- Article text that GoreeCloud legitimately stores.
- Feed names.
- Categories.
- Tags where available.

The application does not need an unrelated general-purpose internet search engine.

If broader web search becomes useful, it should integrate with GoreeCloud Search rather than silently turning News & Weather into another search product.

## 18. Settings

Settings should remain understandable.

Useful settings include:

- News sources.
- Feed folders.
- Saved locations.
- Default weather location.
- Temperature units.
- Wind units.
- Precipitation units.
- Notification preferences.
- Theme.
- Text size.
- Data refresh interval.
- Offline-cache limits.
- Privacy permissions.
- Synchronization preferences.
- Import and export.

The product should not accumulate hundreds of low-value toggles merely to appear powerful.

## 19. First Development Release — 0.1.0 Development

The first Development release is intentionally small.

Target scope:

- Home.
- News.
- Weather.
- RSS and Atom through GoreeCloud Feeds.
- Source management.
- Basic folders.
- Chronological news.
- Read and unread state.
- Bookmarks.
- Basic search.
- Manual weather locations.
- One working weather-provider path.
- Current conditions.
- Hourly forecast.
- Seven-day forecast.
- Severe-weather alerts where supported.
- Basic offline cache.
- Light, dark, and system themes.
- Glaze UI integration.
- Accessibility foundations.
- Android build.
- Web build.
- Linux build.
- Windows build.

The following do not block the first useful Development release:

- AI summaries.
- Recommendation algorithms.
- Weather radar.
- Social comments.
- Article reactions.
- Video-news feeds.
- Personalized discovery.
- Home-screen widgets.
- Multi-provider weather switching.
- Full account synchronization.
- Advanced weather charts.
- Advanced analytics.

These capabilities may be added later only when they provide a clear benefit.

## 20. Repository Boundary

News & Weather has its own application repository:

**GoreeCloud/news-weather**

GoreeCloud Feeds remains its own product family and server authority.

~~~text
GoreeCloud News & Weather
        │
        ├── News
        │    └── GoreeCloud Feeds API
        │           ├── RSS / Atom
        │           ├── normalization
        │           ├── deduplication
        │           ├── storage
        │           └── synchronization
        │
        └── Weather
             └── GoreeCloud Weather Adapter
                    ├── provider 1
                    ├── provider 2
                    └── future providers
~~~

This repository owns:

- Application lifecycle.
- Android package.
- Web application.
- Linux package.
- Windows package.
- User interface.
- Release process.
- Weather implementation.
- Application documentation.

It must not rebuild GoreeCloud Feeds inside this repository.

## 21. Privacy Requirements

The application should follow these privacy requirements:

- No mandatory account for basic use.
- No advertising or ad profiling.
- No unnecessary telemetry.
- No hidden engagement profiling.
- No silent location-history creation.
- Explicit user action before current-location access.
- Least-privilege location permissions.
- Data minimization for saved locations.
- Local-only use where practical.
- Clear synchronization controls.
- Clear import and export.
- Clear handling of cached news and weather data.
- No direct access to another GoreeCloud product's private database.

## 22. Security Requirements

Security requirements include:

- Use approved GoreeCloud platform security contracts where applicable.
- Keep provider credentials and API secrets out of client-visible code where exposure would be unsafe.
- Validate and normalize external feed and weather-provider data.
- Treat retrieved article content and remote HTML as untrusted input.
- Avoid arbitrary script execution in reading views.
- Apply least privilege to platform integrations.
- Keep authentication optional for basic local use and bounded when enabled.
- Preserve clear authority boundaries between News & Weather, GoreeCloud Feeds, weather providers, and other platform systems.
- Do not treat a configured integration as secure or complete without implementation and validation evidence.

## 23. Data and Storage Requirements

The application may maintain bounded local state for:

- Source configuration.
- Feed folders.
- Read and unread state.
- Bookmarks.
- Saved locations.
- Preferences.
- Offline article cache.
- Latest successful weather forecast.
- Synchronization state when enabled.

Authoritative feed retrieval, normalization, deduplication, persistence, search, and synchronization remain responsibilities of GoreeCloud Feeds.

Weather-provider responses should be normalized through the GoreeCloud weather adapter before becoming application-domain data.

Retention should be bounded according to feature need, privacy, offline usefulness, and synchronization requirements.

## 24. Accessibility Requirements

Accessibility is a first-release foundation rather than a later cosmetic enhancement.

The application should support, where applicable:

- Semantic controls.
- Screen-reader labels and navigation.
- Keyboard navigation.
- Logical focus order.
- Sufficient contrast.
- Text scaling.
- Reduced motion.
- Touch target sizing.
- Non-color-only status communication.
- Accessible loading, empty, error, and alert states.

## 25. Performance Expectations

The application should feel immediate and utility-like.

Performance work should prioritize:

- Fast launch.
- Smooth navigation.
- Responsive scrolling.
- Efficient chronological article lists.
- Bounded caches.
- Avoidance of unnecessary background work.
- Efficient network refreshes.
- Graceful offline behavior.
- Minimal UI blocking during feed or weather refreshes.

## 26. Onboarding

Because permissions, privacy, sources, and locations materially affect first use, onboarding should remain concise and functional.

Where applicable, onboarding should:

- Explain the product's no-ads and user-selected-source model.
- Allow manual weather-location setup without GPS.
- Explain current-location permission only when that feature is requested.
- Help add or import initial news sources.
- Explain optional accounts and synchronization without making them mandatory.
- Reflect current navigation and settings.
- Remain skippable where setup is not required.
- Be updated whenever material product, permission, navigation, default, or setup changes make existing onboarding inaccurate.

## 27. Testing and Acceptance

No capability is considered implemented or verified solely because it appears in this specification.

For the 0.1.0 Development target, acceptance should include evidence appropriate to each platform and capability, including:

- Successful builds for Android, Web, Linux, and Windows.
- Functional Home, News, and Weather navigation.
- Verified GoreeCloud Feeds integration for RSS and Atom.
- Verified source management and chronological ordering.
- Verified read/unread state, bookmarks, and basic search.
- Verified manual weather-location flow.
- Verified weather-provider normalization path.
- Verified current, hourly, and seven-day forecasts.
- Verified severe-weather alerts where the selected provider and location support them.
- Verified bounded offline cache.
- Verified stale-weather timestamp behavior.
- Verified light, dark, and system themes.
- Accessibility checks on representative interfaces.
- Privacy and permission review.
- Representative-device or representative-environment testing rather than source-level success alone.

Production or Stable status requires separate acceptance evidence and must not be inferred from a successful Development build.

## 28. Explicit Non-Goals

The product is not intended to become:

- An advertising platform.
- A sponsored-content platform.
- A generalized social feed.
- An engagement-ranking engine.
- A paywall-circumvention system.
- A giant unrelated internet search engine.
- A behavioral profiling system.
- A mandatory-account service.
- A collection of unrelated widgets and promotional surfaces.

## 29. Long-Term Principle

I want GoreeCloud News & Weather to remain intentionally boring in the best possible way.

I want to open it, immediately see the weather, read the news sources I chose, and leave.

I do not want the application competing for my attention.

I do not want advertising determining the interface.

I do not want an algorithm deciding that outrage, sensationalism, controversy, or endless scrolling will increase engagement.

I want **information without manipulation**.

I want **weather without clutter**.

I want **news without advertising**.

I want **privacy without requiring an account**.

I want **cross-platform access without maintaining four unrelated applications**.

I want GoreeCloud News & Weather to provide exactly what its name promises—and nothing unnecessary.

## 30. Current-State Boundary

As of 2026-09-29, this document defines the approved product direction and planned requirements for GoreeCloud News & Weather.

The repository was verified to exist before this specification was created. Application source code and runtime functionality were not present or verified at that point.

Nothing in this specification should be interpreted as evidence that a described feature, integration, platform build, provider path, security control, or release state has already been implemented.
