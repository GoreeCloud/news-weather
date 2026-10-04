import {
  PRODUCT,
  type Route,
  type TextSizePreference,
  type ThemePreference,
} from "./config/product";
import {
  ARTICLE_LIST_CAPABILITY,
  createFeedsClient,
  type NewsArticleSummary,
  type NewsFeedStatus,
} from "./integrations/feeds";
import {
  MAX_LOCAL_NEWS_SEARCH_QUERY_LENGTH,
  normalizeLocalNewsSearchQuery,
  searchLocalNewsArticles,
} from "./news-search";
import {
  OpenMeteoWeatherProvider,
  weatherCodeDescription,
  type WeatherForecast,
} from "./integrations/weather";
import {
  MAX_SAVED_WEATHER_LOCATIONS,
  addSavedWeatherLocation,
  loadPreferences,
  normalizeWeatherLocation,
  removeSavedWeatherLocation,
  savePreferences,
  type Preferences,
} from "./state/preferences";
import {
  clearNewsCache,
  loadNewsCache,
  saveNewsCache,
} from "./state/news-cache";
import {
  clearWeatherCache,
  loadWeatherCache,
  saveWeatherCache,
} from "./state/weather-cache";
import {
  SETTINGS_IMPORT_MAX_BYTES,
  mergeImportedSettings,
  parseSettingsTransfer,
  serializeSettingsTransfer,
} from "./state/settings-transfer";
import {
  formatPrecipitation,
  formatTemperature,
  formatWind,
} from "./weather-units";
import {
  formatForecastLocalTime,
  formatWindDirection,
} from "./weather-display";

const feedsClient = createFeedsClient();
const weatherProvider = new OpenMeteoWeatherProvider();

interface WeatherRuntimeState {
  loading: boolean;
  error: string | null;
  forecast: WeatherForecast | null;
  cached: boolean;
}

interface RuntimeState {
  route: Route;
  settingsOpen: boolean;
  searchOpen: boolean;
  searchQuery: string;
  preferences: Preferences;
  weather: WeatherRuntimeState;
  feedsStatus: NewsFeedStatus | null;
  articles: readonly NewsArticleSummary[];
  newsError: string | null;
  newsCached: boolean;
  newsCacheSavedAt: string | null;
  settingsMessage: string | null;
  settingsMessageError: boolean;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function routeLabel(route: Route): string {
  switch (route) {
    case "home":
      return "Home";
    case "news":
      return "News";
    case "weather":
      return "Weather";
  }
}

function applyTheme(theme: ThemePreference): void {
  document.documentElement.dataset.theme = theme;
}

function applyTextSize(textSize: TextSizePreference): void {
  document.documentElement.dataset.textSize = textSize;
}

function temperature(value: number, preferences: Preferences): string {
  return formatTemperature(value, preferences.temperatureUnit);
}

function percentage(value: number | undefined): string {
  return value === undefined ? "—" : `${Math.round(value)}%`;
}

function wind(value: number | undefined, preferences: Preferences): string {
  return formatWind(value, preferences.windUnit);
}

function precipitation(value: number | undefined, preferences: Preferences): string {
  return formatPrecipitation(value, preferences.precipitationUnit);
}

function formatLocation(forecast: WeatherForecast): string {
  const values = [
    forecast.location.label,
    forecast.location.admin1,
    forecast.location.country,
  ].filter((value, index, all): value is string => {
    return typeof value === "string" && value.length > 0 && all.indexOf(value) === index;
  });

  return values.join(", ");
}

function formatFreshness(iso: string, cached: boolean): string {
  const date = new Date(iso);
  if (Number.isNaN(date.valueOf())) {
    return cached ? "Cached forecast · update time unavailable" : "Updated recently";
  }

  const ageMinutes = Math.max(0, Math.floor((Date.now() - date.valueOf()) / 60_000));
  const age =
    ageMinutes < 1
      ? "just now"
      : ageMinutes < 60
        ? `${ageMinutes} minute${ageMinutes === 1 ? "" : "s"} ago`
        : `${Math.floor(ageMinutes / 60)} hour${Math.floor(ageMinutes / 60) === 1 ? "" : "s"} ago`;

  return `${cached ? "Cached forecast · " : ""}Last updated ${age}`;
}

function dateLabel(value: string): string {
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.valueOf())) return value;
  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function articleTimeLabel(value: string): string {
  if (!value) return "Publication time unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "Publication time unavailable";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function cacheAgeLabel(value: string | null): string {
  if (!value) return "saved time unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "saved time unavailable";

  const ageMinutes = Math.max(0, Math.floor((Date.now() - date.valueOf()) / 60_000));
  if (ageMinutes < 1) return "saved just now";
  if (ageMinutes < 60) {
    return `saved ${ageMinutes} minute${ageMinutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(ageMinutes / 60);
  return `saved ${hours} hour${hours === 1 ? "" : "s"} ago`;
}

function newsCacheNotice(state: RuntimeState): string {
  if (!state.newsCached || state.articles.length === 0) return "";

  const reason = state.newsError
    ? "Live Feeds refresh failed; these headlines may be out of date."
    : "Live Feeds article listing is not currently available.";

  return `
    <p class="cache-banner" role="status">
      Cached news · ${escapeHtml(cacheAgeLabel(state.newsCacheSavedAt))}. ${escapeHtml(reason)}
    </p>
  `;
}

function articleLink(article: NewsArticleSummary): string {
  if (!article.url) {
    return `<span class="headline-title">${escapeHtml(article.title || "Untitled article")}</span>`;
  }
  return `<a class="headline-title" href="${escapeHtml(article.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(article.title || "Untitled article")}</a>`;
}

function headlineList(
  articles: readonly NewsArticleSummary[],
  limit: number,
): string {
  return articles
    .slice(0, limit)
    .map(
      (article) => `
        <article class="headline-row">
          <div class="headline-copy">
            ${articleLink(article)}
            <p>
              ${escapeHtml(article.sourceName || "Unknown source")}
              <span aria-hidden="true"> · </span>
              ${escapeHtml(articleTimeLabel(article.publishedAt))}
            </p>
          </div>
          <div class="headline-status" aria-label="Article state">
            ${article.unread ? '<span class="state-badge">Unread</span>' : ""}
            ${article.bookmarked ? '<span class="state-badge">Saved</span>' : ""}
          </div>
        </article>
      `,
    )
    .join("");
}

function localSearchResults(state: RuntimeState, query: string): string {
  const normalized = normalizeLocalNewsSearchQuery(query);

  if (state.articles.length === 0) {
    return `
      <div class="search-empty">
        <strong>No recent headlines to search</strong>
        <p>Search becomes useful after live or cached article summaries are available.</p>
      </div>
    `;
  }

  if (!normalized) {
    return `
      <div class="search-empty">
        <strong>Search recent headlines</strong>
        <p>Matches title, source, and loaded summary text locally on this device.</p>
      </div>
    `;
  }

  const results = searchLocalNewsArticles(state.articles, normalized);
  if (results.length === 0) {
    return `
      <div class="search-empty">
        <strong>No matches</strong>
        <p>No loaded or cached headline summary matches “${escapeHtml(normalized)}”.</p>
      </div>
    `;
  }

  return `
    <div class="search-result-heading">
      <p class="quiet">${results.length} match${results.length === 1 ? "" : "es"} · local recent summaries only</p>
    </div>
    ${state.newsCached ? newsCacheNotice(state) : ""}
    <div class="article-list search-result-list">
      ${headlineList(results, results.length)}
    </div>
  `;
}

function searchPanel(state: RuntimeState): string {
  if (!state.searchOpen) return "";

  return `
    <div class="scrim" id="search-scrim">
      <section class="settings-panel search-panel" role="dialog" aria-modal="true" aria-labelledby="search-title">
        <div class="settings-header">
          <div>
            <p class="eyebrow">Local recent news</p>
            <h2 id="search-title">Search</h2>
          </div>
          <button class="icon-button" id="close-search" aria-label="Close search">×</button>
        </div>

        <form id="news-search-form" class="search-form">
          <label class="field">
            <span>Title, source, or summary</span>
            <input
              id="news-search-query"
              type="search"
              maxlength="${MAX_LOCAL_NEWS_SEARCH_QUERY_LENGTH}"
              autocomplete="off"
              spellcheck="false"
              value="${escapeHtml(state.searchQuery)}"
              placeholder="Search recent headlines"
            />
          </label>
          <button class="button primary" type="submit">Search</button>
        </form>

        <p class="quiet search-privacy-note">
          Search runs only against article summaries already loaded or cached by News & Weather.
          The query is not sent to GoreeCloud Feeds, publishers, or another provider.
        </p>

        <div id="news-search-results" class="search-results" aria-live="polite">
          ${localSearchResults(state, state.searchQuery)}
        </div>
      </section>
    </div>
  `;
}

function sameWeatherLocation(left: string, right: string): boolean {
  return normalizeWeatherLocation(left).localeCompare(
    normalizeWeatherLocation(right),
    undefined,
    { sensitivity: "accent" },
  ) === 0;
}

function navigation(state: RuntimeState): string {
  const routes: readonly Route[] = ["home", "news", "weather"];
  return routes
    .map(
      (route) => `
        <button
          class="nav-item"
          data-route="${route}"
          aria-current="${state.route === route ? "page" : "false"}"
        >
          <span class="nav-icon" aria-hidden="true">${route === "home" ? "⌂" : route === "news" ? "▤" : "☼"}</span>
          <span>${routeLabel(route)}</span>
        </button>
      `,
    )
    .join("");
}

function onboarding(state: RuntimeState): string {
  if (state.preferences.onboardingComplete) {
    return "";
  }

  const location = escapeHtml(state.preferences.manualWeatherLocation);

  return `
    <section class="onboarding" aria-labelledby="onboarding-title">
      <div>
        <p class="eyebrow">First use</p>
        <h2 id="onboarding-title">News and weather, without the noise.</h2>
        <p>
          News will come from sources you choose through GoreeCloud Feeds.
          Weather can start with a manual place—GPS permission is not required.
        </p>
      </div>

      <label class="field">
        <span>Weather location</span>
        <input
          id="onboarding-location"
          type="text"
          maxlength="160"
          autocomplete="address-level2"
          placeholder="City, ZIP, postal code, or place"
          value="${location}"
        />
        <small>
          Development weather uses Open-Meteo. Saving a place sends that text to
          its geocoding API and the resolved coordinates to its forecast API.
          This app stores the place text, not those precise coordinates.
        </small>
      </label>

      <label class="check-row">
        <input
          id="onboarding-hints"
          type="checkbox"
          ${state.preferences.hintsEnabled ? "checked" : ""}
        />
        <span>Show contextual hints while I learn the app</span>
      </label>

      <div class="onboarding-actions">
        <button class="button primary" id="finish-onboarding">Continue</button>
        <p class="quiet">No account is required for basic use.</p>
      </div>
    </section>
  `;
}

function hint(state: RuntimeState): string {
  if (!state.preferences.hintsEnabled || !state.preferences.onboardingComplete) {
    return "";
  }

  return `
    <aside class="hint" aria-label="Contextual hint">
      <span aria-hidden="true">✦</span>
      <p>News stays chronological by default. Weather can use a manual place without GPS.</p>
      <button class="icon-button" id="dismiss-hints" aria-label="Turn off contextual hints">×</button>
    </aside>
  `;
}

function homeWeatherCard(state: RuntimeState): string {
  const forecast = state.weather.forecast;
  const enteredLocation = state.preferences.manualWeatherLocation.trim();
  const locationText = forecast
    ? formatLocation(forecast)
    : enteredLocation
      ? escapeHtml(enteredLocation)
      : "Choose a location";

  if (forecast) {
    const today = forecast.daily[0];
    return `
      <article class="weather-card glass-card">
        <div class="card-heading">
          <div>
            <p class="eyebrow">Weather</p>
            <h2>${escapeHtml(locationText)}</h2>
          </div>
          <span
            class="status-dot ${state.weather.cached ? "cached" : "ready"}"
            aria-label="${state.weather.cached ? "Cached forecast loaded" : "Fresh forecast loaded"}"
          ></span>
        </div>
        <div class="weather-current" aria-live="polite">
          <strong>${temperature(forecast.current.temperatureCelsius, state.preferences)}</strong>
          <div>
            <span>${escapeHtml(weatherCodeDescription(forecast.current.weatherCode))}</span>
            <p>
              ${today ? `High ${temperature(today.highCelsius, state.preferences)} · Low ${temperature(today.lowCelsius, state.preferences)}` : ""}
            </p>
          </div>
        </div>
        <div class="weather-quick">
          <span>Precipitation ${percentage(today?.precipitationProbabilityPercent)}</span>
          <span>${formatFreshness(forecast.fetchedAt, state.weather.cached)}</span>
        </div>
      </article>
    `;
  }

  const message = state.weather.loading
    ? "Loading forecast…"
    : state.weather.error
      ? escapeHtml(state.weather.error)
      : enteredLocation
        ? "Forecast has not been loaded yet."
        : "Add a manual location to load weather.";

  return `
    <article class="weather-card glass-card">
      <div class="card-heading">
        <div>
          <p class="eyebrow">Weather</p>
          <h2>${escapeHtml(locationText)}</h2>
        </div>
        <span class="status-dot waiting" aria-label="Forecast unavailable"></span>
      </div>
      <div class="weather-placeholder" aria-live="polite">
        <strong>—°</strong>
        <span>${message}</span>
      </div>
      <p class="quiet">Missing data is never presented as a current forecast.</p>
    </article>
  `;
}

function homeView(state: RuntimeState): string {
  return `
    <section class="page" aria-labelledby="home-title">
      <header class="page-heading">
        <div>
          <p class="eyebrow">Overview</p>
          <h1 id="home-title">Right now</h1>
        </div>
        <p class="quiet">0.1.0 Development</p>
      </header>

      <div class="home-grid">
        ${homeWeatherCard(state)}

        <article class="headline-card glass-card">
          <div class="card-heading">
            <div>
              <p class="eyebrow">News</p>
              <h2>Recent headlines</h2>
            </div>
            <span class="count-badge">${Math.min(state.articles.length, 8)}</span>
          </div>
          ${state.articles.length
            ? `${newsCacheNotice(state)}<div class="headline-list">${headlineList(state.articles, 8)}</div>`
            : `
              <div class="empty-state compact">
                <strong>
                  ${state.newsError
                    ? "News is temporarily unavailable"
                    : state.feedsStatus?.capabilities?.includes(ARTICLE_LIST_CAPABILITY)
                      ? "No recent articles"
                      : state.feedsStatus?.connected
                        ? "Article listing is not enabled"
                        : "No feed connection yet"}
                </strong>
                <p>
                  ${escapeHtml(
                    state.newsError ??
                      (state.feedsStatus?.connected
                        ? "GoreeCloud Feeds must advertise the bounded articles:list-v1 capability before News & Weather requests article content."
                        : state.feedsStatus?.message ?? "GoreeCloud Feeds status has not been checked."),
                  )}
                </p>
              </div>
            `}
        </article>
      </div>
    </section>
  `;
}

function newsView(state: RuntimeState): string {
  const status = state.feedsStatus;
  const canList = status?.capabilities?.includes(ARTICLE_LIST_CAPABILITY) ?? false;

  return `
    <section class="page" aria-labelledby="news-title">
      <header class="page-heading">
        <div>
          <p class="eyebrow">Chronological by default</p>
          <h1 id="news-title">News</h1>
        </div>
        ${state.articles.length ? `<p class="quiet">${state.articles.length} recent article${state.articles.length === 1 ? "" : "s"}</p>` : ""}
      </header>

      ${state.articles.length
        ? `
          ${newsCacheNotice(state)}
          <div class="article-list glass-card">
            ${headlineList(state.articles, state.articles.length)}
          </div>
        `
        : `
          <div class="empty-state glass-card">
            <div class="empty-icon" aria-hidden="true">▤</div>
            <h2>
              ${state.newsError
                ? "News is temporarily unavailable"
                : canList
                  ? "No recent articles"
                  : status?.connected
                    ? "Article listing is not enabled"
                    : "Connect GoreeCloud Feeds"}
            </h2>
            <p>
              ${escapeHtml(
                state.newsError ??
                  (status?.connected
                    ? canList
                      ? "The server-derived article contract is available, but this user currently has no returned articles."
                      : "News & Weather will request articles only when GoreeCloud Feeds advertises articles:list-v1. User context remains server-owned."
                    : status?.message ?? "GoreeCloud Feeds is not configured."),
              )}
            </p>
          </div>
        `}
    </section>
  `;
}

function currentWeatherPanel(
  forecast: WeatherForecast,
  cached: boolean,
  preferences: Preferences,
): string {
  const current = forecast.current;
  const today = forecast.daily[0];
  return `
    <article class="glass-card current-detail-card">
      <div>
        <p class="eyebrow">Current conditions</p>
        <h2>${escapeHtml(formatLocation(forecast))}</h2>
        <p class="condition-line">${escapeHtml(weatherCodeDescription(current.weatherCode))}</p>
      </div>
      <strong class="detail-temperature">${temperature(current.temperatureCelsius, preferences)}</strong>
      <div class="metric-grid">
        <div><span>Feels like</span><strong>${current.apparentTemperatureCelsius === undefined ? "—" : temperature(current.apparentTemperatureCelsius, preferences)}</strong></div>
        <div><span>Humidity</span><strong>${percentage(current.relativeHumidityPercent)}</strong></div>
        <div><span>Wind speed</span><strong>${wind(current.windSpeedKmh, preferences)}</strong></div>
        <div><span>Wind direction</span><strong>${escapeHtml(formatWindDirection(current.windDirectionDegrees))}</strong></div>
        <div><span>Precipitation</span><strong>${precipitation(current.precipitationMm, preferences)}</strong></div>
        <div><span>Sunrise</span><strong>${escapeHtml(formatForecastLocalTime(today?.sunrise))}</strong></div>
        <div><span>Sunset</span><strong>${escapeHtml(formatForecastLocalTime(today?.sunset))}</strong></div>
      </div>
      <p class="quiet">${escapeHtml(formatFreshness(forecast.fetchedAt, cached))}</p>
    </article>
  `;
}

function hourlyPanel(forecast: WeatherForecast, preferences: Preferences): string {
  const startIndex = Math.max(
    0,
    forecast.hourly.findIndex((point) => point.time >= forecast.current.time),
  );
  const points = forecast.hourly.slice(startIndex, startIndex + 12);

  return `
    <section class="forecast-section" aria-labelledby="hourly-title">
      <div class="section-heading">
        <h2 id="hourly-title">Next 12 hours</h2>
      </div>
      <div class="hourly-strip">
        ${points
          .map(
            (point) => `
              <article class="hour-card">
                <span>${escapeHtml(formatForecastLocalTime(point.time))}</span>
                <strong>${temperature(point.temperatureCelsius, preferences)}</strong>
                <small>${escapeHtml(weatherCodeDescription(point.weatherCode))}</small>
                <small>${percentage(point.precipitationProbabilityPercent)} precip.</small>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function dailyPanel(forecast: WeatherForecast, preferences: Preferences): string {
  return `
    <section class="forecast-section" aria-labelledby="daily-title">
      <div class="section-heading">
        <h2 id="daily-title">Seven days</h2>
      </div>
      <div class="daily-list">
        ${forecast.daily
          .map(
            (day) => `
              <article class="day-row">
                <div>
                  <strong>${escapeHtml(dateLabel(day.date))}</strong>
                  <span>${escapeHtml(weatherCodeDescription(day.weatherCode))}</span>
                </div>
                <span class="day-precip">${percentage(day.precipitationProbabilityPercent)} · ${precipitation(day.precipitationMm, preferences)}</span>
                <span class="day-temps"><strong>${temperature(day.highCelsius, preferences)}</strong> ${temperature(day.lowCelsius, preferences)}</span>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function savedLocationsPanel(state: RuntimeState): string {
  const current = normalizeWeatherLocation(state.preferences.manualWeatherLocation);
  const saved = state.preferences.savedWeatherLocations;
  const currentIsSaved = saved.some((location) => sameWeatherLocation(location, current));
  const atLimit = saved.length >= MAX_SAVED_WEATHER_LOCATIONS;

  return `
    <section class="saved-locations" aria-labelledby="saved-locations-title">
      <div class="saved-locations-heading">
        <div>
          <p class="eyebrow">Saved places</p>
          <h3 id="saved-locations-title">Quick access</h3>
        </div>
        <button
          class="button secondary compact"
          id="save-current-location"
          type="button"
          ${!current || currentIsSaved || atLimit ? "disabled" : ""}
          title="${currentIsSaved ? "This place is already saved" : atLimit ? "Saved-place limit reached" : "Save the current manual place"}"
        >
          ☆ ${currentIsSaved ? "Saved" : atLimit ? "Limit reached" : "Save current"}
        </button>
      </div>
      <p class="quiet">
        Stores place text only on this device. ${saved.length}/${MAX_SAVED_WEATHER_LOCATIONS} saved.
      </p>
      ${saved.length
        ? `
          <div class="saved-location-list">
            ${saved
              .map(
                (location, index) => `
                  <div class="saved-location-row">
                    <button
                      class="saved-location-select"
                      type="button"
                      data-saved-location-index="${index}"
                      aria-label="Load weather for ${escapeHtml(location)}"
                    >
                      <span aria-hidden="true">⌖</span>
                      <span>${escapeHtml(location)}</span>
                    </button>
                    <button
                      class="icon-button compact"
                      type="button"
                      data-remove-saved-location-index="${index}"
                      aria-label="Remove saved place ${escapeHtml(location)}"
                      title="Remove saved place"
                    >
                      ×
                    </button>
                  </div>
                `,
              )
              .join("")}
          </div>
        `
        : '<p class="saved-location-empty">No saved places yet.</p>'}
    </section>
  `;
}

function weatherView(state: RuntimeState): string {
  const forecast = state.weather.forecast;

  return `
    <section class="page" aria-labelledby="weather-title">
      <header class="page-heading">
        <div>
          <p class="eyebrow">Manual location supported</p>
          <h1 id="weather-title">Weather</h1>
        </div>
      </header>

      <article class="glass-card location-card">
        <h2>Forecast location</h2>
        <p class="quiet">
          GPS permission is not requested. This Development provider sends your entered place to
          Open-Meteo for geocoding and forecast retrieval; precise resolved coordinates are kept transient.
        </p>
        <form id="weather-location-form" class="location-form">
          <label class="field">
            <span>City, ZIP, postal code, or place</span>
            <input
              id="weather-location"
              type="text"
              maxlength="160"
              autocomplete="address-level2"
              value="${escapeHtml(state.preferences.manualWeatherLocation)}"
              placeholder="Enter a location"
            />
          </label>
          <button class="button primary" type="submit" ${state.weather.loading ? "disabled" : ""}>
            ${state.weather.loading ? "Loading…" : "Load forecast"}
          </button>
        </form>
        ${state.weather.error ? `<p class="error-message" role="alert">${escapeHtml(state.weather.error)}${state.weather.cached && forecast ? " Showing the last cached forecast." : ""}</p>` : ""}
        ${savedLocationsPanel(state)}
      </article>

      ${forecast
        ? `
          <div class="weather-detail-stack">
            ${state.weather.cached ? '<p class="cache-banner" role="status">Offline cache · Refreshing will replace this snapshot when the provider is reachable.</p>' : ""}
            ${currentWeatherPanel(forecast, state.weather.cached, state.preferences)}
            ${hourlyPanel(forecast, state.preferences)}
            ${dailyPanel(forecast, state.preferences)}
            <p class="attribution">
              Weather data: Open-Meteo (CC BY 4.0). Location search: GeoNames via Open-Meteo.
            </p>
          </div>
        `
        : `
          <div class="empty-state glass-card">
            <div class="empty-icon" aria-hidden="true">☼</div>
            <h2>${state.weather.loading ? "Loading forecast" : "No forecast loaded"}</h2>
            <p>
              ${state.weather.loading
                ? "Resolving the manual location and requesting the normalized seven-day forecast."
                : "Enter a manual location above. Weather data will appear only after a successful provider response."}
            </p>
          </div>
        `}
    </section>
  `;
}

function settingsPanel(state: RuntimeState): string {
  if (!state.settingsOpen) {
    return "";
  }

  return `
    <div class="scrim" id="settings-scrim">
      <section class="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div class="settings-header">
          <div>
            <p class="eyebrow">Preferences</p>
            <h2 id="settings-title">Settings</h2>
          </div>
          <button class="icon-button" id="close-settings" aria-label="Close settings">×</button>
        </div>

        <label class="field">
          <span>Theme</span>
          <select id="theme-setting">
            <option value="system" ${state.preferences.theme === "system" ? "selected" : ""}>System</option>
            <option value="light" ${state.preferences.theme === "light" ? "selected" : ""}>Light</option>
            <option value="dark" ${state.preferences.theme === "dark" ? "selected" : ""}>Dark</option>
          </select>
        </label>

        <label class="field">
          <span>Text size</span>
          <select id="text-size-setting">
            <option value="system" ${state.preferences.textSize === "system" ? "selected" : ""}>System / default</option>
            <option value="large" ${state.preferences.textSize === "large" ? "selected" : ""}>Large</option>
            <option value="extra-large" ${state.preferences.textSize === "extra-large" ? "selected" : ""}>Extra large</option>
          </select>
          <small>Builds on your browser or platform text scale instead of replacing it.</small>
        </label>

        <div class="settings-section" aria-labelledby="weather-units-title">
          <div>
            <p class="eyebrow">Weather</p>
            <h3 id="weather-units-title">Units</h3>
          </div>

          <div class="settings-grid">
            <label class="field">
              <span>Temperature</span>
              <select id="temperature-unit-setting">
                <option value="celsius" ${state.preferences.temperatureUnit === "celsius" ? "selected" : ""}>Celsius (°C)</option>
                <option value="fahrenheit" ${state.preferences.temperatureUnit === "fahrenheit" ? "selected" : ""}>Fahrenheit (°F)</option>
              </select>
            </label>

            <label class="field">
              <span>Wind</span>
              <select id="wind-unit-setting">
                <option value="kmh" ${state.preferences.windUnit === "kmh" ? "selected" : ""}>Kilometers/hour</option>
                <option value="mph" ${state.preferences.windUnit === "mph" ? "selected" : ""}>Miles/hour</option>
              </select>
            </label>

            <label class="field">
              <span>Precipitation</span>
              <select id="precipitation-unit-setting">
                <option value="mm" ${state.preferences.precipitationUnit === "mm" ? "selected" : ""}>Millimeters</option>
                <option value="inches" ${state.preferences.precipitationUnit === "inches" ? "selected" : ""}>Inches</option>
              </select>
            </label>
          </div>
        </div>

        <label class="check-row">
          <input id="hints-setting" type="checkbox" ${state.preferences.hintsEnabled ? "checked" : ""} />
          <span>Contextual hints</span>
        </label>

        <div class="settings-note">
          <strong>Privacy default</strong>
          <p>
            No account, GPS permission, telemetry, or notification permission is required.
            Manual weather lookup contacts the configured Development weather provider only after you submit a place.
          </p>
        </div>

        <div class="settings-section" aria-labelledby="settings-portability-title">
          <div>
            <p class="eyebrow">Portability</p>
            <h3 id="settings-portability-title">Import & export</h3>
          </div>
          <p class="quiet">
            Export includes your local appearance, weather units, manual place, and saved-place text.
            It excludes weather cache, onboarding state, accounts, credentials, and provider coordinates.
          </p>
          <div class="settings-actions">
            <button class="button secondary" id="export-settings" type="button">⇩ Export settings</button>
            <button class="button secondary" id="import-settings-action" type="button">⇧ Import settings</button>
            <input
              id="settings-import-file"
              class="visually-hidden"
              type="file"
              accept="application/json,.json"
              aria-label="Choose News & Weather settings file"
            />
          </div>
          ${state.settingsMessage
            ? `<p class="settings-message ${state.settingsMessageError ? "error" : ""}" role="${state.settingsMessageError ? "alert" : "status"}">${escapeHtml(state.settingsMessage)}</p>`
            : ""}
        </div>

        <button class="button secondary" id="replay-onboarding">Replay first-use setup</button>
      </section>
    </div>
  `;
}

export function createNewsWeatherApp(root: HTMLElement): void {
  const preferences = loadPreferences();
  const cachedWeather = loadWeatherCache(preferences.manualWeatherLocation);
  const cachedNews = loadNewsCache();

  const state: RuntimeState = {
    route: "home",
    settingsOpen: false,
    searchOpen: false,
    searchQuery: "",
    preferences,
    weather: {
      loading: false,
      error: null,
      forecast: cachedWeather?.forecast ?? null,
      cached: cachedWeather !== null,
    },
    feedsStatus: null,
    articles: cachedNews?.articles ?? [],
    newsError: null,
    newsCached: cachedNews !== null,
    newsCacheSavedAt: cachedNews?.savedAt ?? null,
    settingsMessage: null,
    settingsMessageError: false,
  };

  let weatherRequestSequence = 0;
  applyTheme(state.preferences.theme);
  applyTextSize(state.preferences.textSize);

  async function render(): Promise<void> {
    const [feedsStatus, weatherStatus] = await Promise.all([
      feedsClient.getStatus(),
      weatherProvider.getStatus(),
    ]);
    state.feedsStatus = feedsStatus;

    if (feedsStatus.capabilities?.includes(ARTICLE_LIST_CAPABILITY)) {
      try {
        const liveArticles = await feedsClient.listRecentArticles(50);
        state.articles = liveArticles;
        state.newsError = null;
        state.newsCached = false;
        state.newsCacheSavedAt = null;

        if (liveArticles.length > 0) {
          saveNewsCache(liveArticles);
        } else {
          clearNewsCache();
        }
      } catch (error) {
        state.newsError =
          error instanceof Error ? error.message : "Recent news could not be loaded.";
        const fallback = loadNewsCache();
        state.articles = fallback?.articles ?? [];
        state.newsCached = fallback !== null;
        state.newsCacheSavedAt = fallback?.savedAt ?? null;
      }
    } else {
      const fallback = loadNewsCache();
      state.articles = fallback?.articles ?? [];
      state.newsError = null;
      state.newsCached = fallback !== null;
      state.newsCacheSavedAt = fallback?.savedAt ?? null;
    }

    root.innerHTML = `
      <div class="app-shell">
        <header class="topbar">
          <div class="brand">
            <div class="brand-mark" aria-hidden="true">G</div>
            <div>
              <strong>${PRODUCT.installedName}</strong>
              <span>${PRODUCT.lifecycle} · ${PRODUCT.version}</span>
            </div>
          </div>

          <div class="topbar-actions">
            <button
              class="icon-button"
              id="search-action"
              aria-label="Search recent news"
              title="Search recent loaded and cached headlines on this device"
            >
              <span aria-hidden="true">⌕</span>
            </button>
            <button class="icon-button" id="settings-action" aria-label="Open settings">⚙</button>
          </div>
        </header>

        <div class="provider-strip" aria-label="Development provider status">
          <span title="${escapeHtml(feedsStatus.message)}">
            Feeds: ${feedsStatus.connected ? "contract verified" : "not connected"}
          </span>
          <span title="${escapeHtml(weatherStatus.message)}">
            Weather: ${weatherStatus.configured ? "Open-Meteo Development" : "not configured"}
          </span>
          <span>Glaze target: ${PRODUCT.glazeUiTarget}</span>
        </div>

        ${onboarding(state)}
        ${hint(state)}

        <main>
          ${state.route === "home" ? homeView(state) : state.route === "news" ? newsView(state) : weatherView(state)}
        </main>

        <nav class="bottom-nav" aria-label="Primary">
          ${navigation(state)}
        </nav>

        ${searchPanel(state)}
        ${settingsPanel(state)}
      </div>
    `;

    wireEvents();
  }

  function updatePreferences(next: Preferences): void {
    state.preferences = next;
    savePreferences(next);
    applyTheme(next.theme);
    applyTextSize(next.textSize);
  }

  async function refreshWeather(query: string): Promise<void> {
    const normalized = query.trim().slice(0, 160);
    const requestId = ++weatherRequestSequence;

    if (!normalized) {
      clearWeatherCache();
      state.weather = { loading: false, error: null, forecast: null, cached: false };
      await render();
      return;
    }

    state.weather = {
      loading: true,
      error: null,
      forecast: state.weather.forecast,
      cached: state.weather.cached,
    };
    await render();

    try {
      const forecast = await weatherProvider.getForecastForQuery(normalized);
      if (requestId !== weatherRequestSequence) return;
      saveWeatherCache(normalized, forecast);
      state.weather = { loading: false, error: null, forecast, cached: false };
    } catch (error) {
      if (requestId !== weatherRequestSequence) return;
      state.weather = {
        loading: false,
        error: error instanceof Error ? error.message : "Weather could not be loaded.",
        forecast: state.weather.forecast,
        cached: state.weather.cached,
      };
    }

    await render();
  }

  function wireEvents(): void {
    root.querySelector<HTMLButtonElement>("#search-action")?.addEventListener("click", () => {
      state.settingsOpen = false;
      state.searchOpen = true;
      void render().then(() => {
        root.querySelector<HTMLInputElement>("#news-search-query")?.focus();
      });
    });

    root.querySelector<HTMLButtonElement>("#close-search")?.addEventListener("click", () => {
      state.searchOpen = false;
      void render();
    });

    root.querySelector<HTMLElement>("#search-scrim")?.addEventListener("click", (event) => {
      if (event.target === event.currentTarget) {
        state.searchOpen = false;
        void render();
      }
    });

    root.querySelector<HTMLFormElement>("#news-search-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = root.querySelector<HTMLInputElement>("#news-search-query");
      const query = normalizeLocalNewsSearchQuery(input?.value ?? "");
      state.searchQuery = query;
      if (input) input.value = query;

      const results = root.querySelector<HTMLElement>("#news-search-results");
      if (results) {
        results.innerHTML = localSearchResults(state, query);
      }
    });

    root.querySelectorAll<HTMLButtonElement>("[data-route]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextRoute = button.dataset.route;
        if (nextRoute === "home" || nextRoute === "news" || nextRoute === "weather") {
          state.route = nextRoute;
          void render();
        }
      });
    });

    root.querySelector<HTMLButtonElement>("#settings-action")?.addEventListener("click", () => {
      state.searchOpen = false;
      state.settingsOpen = true;
      state.settingsMessage = null;
      state.settingsMessageError = false;
      void render();
    });

    root.querySelector<HTMLButtonElement>("#close-settings")?.addEventListener("click", () => {
      state.settingsOpen = false;
      void render();
    });

    root.querySelector<HTMLElement>("#settings-scrim")?.addEventListener("click", (event) => {
      if (event.target === event.currentTarget) {
        state.settingsOpen = false;
        void render();
      }
    });

    root.querySelector<HTMLSelectElement>("#theme-setting")?.addEventListener("change", (event) => {
      const value = (event.currentTarget as HTMLSelectElement).value;
      if (value === "system" || value === "light" || value === "dark") {
        updatePreferences({ ...state.preferences, theme: value });
        void render();
      }
    });

    root
      .querySelector<HTMLSelectElement>("#text-size-setting")
      ?.addEventListener("change", (event) => {
        const value = (event.currentTarget as HTMLSelectElement).value;
        if (value === "system" || value === "large" || value === "extra-large") {
          updatePreferences({ ...state.preferences, textSize: value });
          void render();
        }
      });

    root
      .querySelector<HTMLSelectElement>("#temperature-unit-setting")
      ?.addEventListener("change", (event) => {
        const value = (event.currentTarget as HTMLSelectElement).value;
        if (value === "celsius" || value === "fahrenheit") {
          updatePreferences({ ...state.preferences, temperatureUnit: value });
          void render();
        }
      });

    root
      .querySelector<HTMLSelectElement>("#wind-unit-setting")
      ?.addEventListener("change", (event) => {
        const value = (event.currentTarget as HTMLSelectElement).value;
        if (value === "kmh" || value === "mph") {
          updatePreferences({ ...state.preferences, windUnit: value });
          void render();
        }
      });

    root
      .querySelector<HTMLSelectElement>("#precipitation-unit-setting")
      ?.addEventListener("change", (event) => {
        const value = (event.currentTarget as HTMLSelectElement).value;
        if (value === "mm" || value === "inches") {
          updatePreferences({ ...state.preferences, precipitationUnit: value });
          void render();
        }
      });

    root.querySelector<HTMLInputElement>("#hints-setting")?.addEventListener("change", (event) => {
      updatePreferences({
        ...state.preferences,
        hintsEnabled: (event.currentTarget as HTMLInputElement).checked,
      });
      void render();
    });

    root.querySelector<HTMLButtonElement>("#export-settings")?.addEventListener("click", () => {
      try {
        const blob = new Blob([serializeSettingsTransfer(state.preferences)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        const date = new Date().toISOString().slice(0, 10);
        anchor.href = url;
        anchor.download = `goreecloud-news-weather-settings-${date}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
        state.settingsMessage = "Settings export created locally.";
        state.settingsMessageError = false;
      } catch {
        state.settingsMessage = "Settings export could not be created.";
        state.settingsMessageError = true;
      }
      void render();
    });

    root.querySelector<HTMLButtonElement>("#import-settings-action")?.addEventListener("click", () => {
      root.querySelector<HTMLInputElement>("#settings-import-file")?.click();
    });

    root.querySelector<HTMLInputElement>("#settings-import-file")?.addEventListener("change", (event) => {
      const input = event.currentTarget as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;

      if (file.size > SETTINGS_IMPORT_MAX_BYTES) {
        state.settingsMessage = "Settings import exceeds the 64 KiB safety limit.";
        state.settingsMessageError = true;
        input.value = "";
        void render();
        return;
      }

      void file.text().then((text) => {
        try {
          const imported = parseSettingsTransfer(text);
          const next = mergeImportedSettings(state.preferences, imported);
          const locationChanged = !sameWeatherLocation(
            next.manualWeatherLocation,
            state.preferences.manualWeatherLocation,
          );

          if (locationChanged) {
            clearWeatherCache();
            state.weather = {
              loading: false,
              error: null,
              forecast: null,
              cached: false,
            };
          }

          updatePreferences(next);
          state.settingsMessage = locationChanged
            ? "Settings imported. Load the forecast to refresh the imported place."
            : "Settings imported.";
          state.settingsMessageError = false;
        } catch (error) {
          state.settingsMessage =
            error instanceof Error ? error.message : "Settings import failed.";
          state.settingsMessageError = true;
        }

        input.value = "";
        void render();
      });
    });

    root.querySelector<HTMLButtonElement>("#replay-onboarding")?.addEventListener("click", () => {
      state.settingsOpen = false;
      updatePreferences({ ...state.preferences, onboardingComplete: false });
      void render();
    });

    root.querySelector<HTMLButtonElement>("#finish-onboarding")?.addEventListener("click", () => {
      const location =
        normalizeWeatherLocation(root.querySelector<HTMLInputElement>("#onboarding-location")?.value ?? "");
      const hints =
        root.querySelector<HTMLInputElement>("#onboarding-hints")?.checked ?? true;
      const changed = !sameWeatherLocation(location, state.preferences.manualWeatherLocation);

      if (changed) {
        clearWeatherCache();
        state.weather = { loading: false, error: null, forecast: null, cached: false };
      }

      updatePreferences({
        ...state.preferences,
        onboardingComplete: true,
        manualWeatherLocation: location,
        hintsEnabled: hints,
      });

      if (location) {
        void refreshWeather(location);
      } else {
        void render();
      }
    });

    root.querySelector<HTMLButtonElement>("#dismiss-hints")?.addEventListener("click", () => {
      updatePreferences({ ...state.preferences, hintsEnabled: false });
      void render();
    });

    root.querySelector<HTMLFormElement>("#weather-location-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const location =
        normalizeWeatherLocation(root.querySelector<HTMLInputElement>("#weather-location")?.value ?? "");
      const changed = !sameWeatherLocation(location, state.preferences.manualWeatherLocation);

      if (changed) {
        clearWeatherCache();
        state.weather = { loading: false, error: null, forecast: null, cached: false };
      }

      updatePreferences({ ...state.preferences, manualWeatherLocation: location });
      void refreshWeather(location);
    });

    root.querySelector<HTMLButtonElement>("#save-current-location")?.addEventListener("click", () => {
      const location = normalizeWeatherLocation(state.preferences.manualWeatherLocation);
      if (!location) return;

      updatePreferences({
        ...state.preferences,
        savedWeatherLocations: addSavedWeatherLocation(
          state.preferences.savedWeatherLocations,
          location,
        ),
      });
      void render();
    });

    root.querySelectorAll<HTMLButtonElement>("[data-saved-location-index]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.savedLocationIndex);
        const location = state.preferences.savedWeatherLocations[index];
        if (!location) return;

        if (!sameWeatherLocation(location, state.preferences.manualWeatherLocation)) {
          clearWeatherCache();
          state.weather = { loading: false, error: null, forecast: null, cached: false };
        }

        updatePreferences({ ...state.preferences, manualWeatherLocation: location });
        void refreshWeather(location);
      });
    });

    root
      .querySelectorAll<HTMLButtonElement>("[data-remove-saved-location-index]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const index = Number(button.dataset.removeSavedLocationIndex);
          updatePreferences({
            ...state.preferences,
            savedWeatherLocations: removeSavedWeatherLocation(
              state.preferences.savedWeatherLocations,
              index,
            ),
          });
          void render();
        });
      });
  }

  void render().then(() => {
    if (state.preferences.onboardingComplete && state.preferences.manualWeatherLocation.trim()) {
      void refreshWeather(state.preferences.manualWeatherLocation);
    }
  });
}
