import { PRODUCT, type Route, type ThemePreference } from "./config/product";
import {
  createFeedsClient,
  type NewsFeedStatus,
} from "./integrations/feeds";
import {
  OpenMeteoWeatherProvider,
  weatherCodeDescription,
  type WeatherForecast,
} from "./integrations/weather";
import {
  loadPreferences,
  savePreferences,
  type Preferences,
} from "./state/preferences";
import {
  clearWeatherCache,
  loadWeatherCache,
  saveWeatherCache,
} from "./state/weather-cache";
import {
  formatPrecipitation,
  formatTemperature,
  formatWind,
} from "./weather-units";

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
  preferences: Preferences;
  weather: WeatherRuntimeState;
  feedsStatus: NewsFeedStatus | null;
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

function hourLabel(value: string): string {
  const time = value.split("T")[1];
  if (!time) return value;
  const [hourText, minuteText] = time.split(":");
  const hour = Number(hourText);
  if (!Number.isFinite(hour)) return time;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minuteText ?? "00"} ${suffix}`;
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
            <span class="count-badge">0</span>
          </div>
          <div class="empty-state compact">
            <strong>
              ${state.feedsStatus?.connected ? "Feeds contract verified" : "No feed connection yet"}
            </strong>
            <p>
              ${escapeHtml(
                state.feedsStatus?.connected
                  ? "The current Feeds 0.1.0-dev protocol exposes capability negotiation but not article endpoints yet."
                  : state.feedsStatus?.message ?? "GoreeCloud Feeds status has not been checked.",
              )}
            </p>
          </div>
        </article>
      </div>
    </section>
  `;
}

function newsView(state: RuntimeState): string {
  const status = state.feedsStatus;

  return `
    <section class="page" aria-labelledby="news-title">
      <header class="page-heading">
        <div>
          <p class="eyebrow">Chronological by default</p>
          <h1 id="news-title">News</h1>
        </div>
      </header>

      <div class="empty-state glass-card">
        <div class="empty-icon" aria-hidden="true">▤</div>
        <h2>${status?.connected ? "Feeds Development contract verified" : "Connect GoreeCloud Feeds"}</h2>
        <p>
          ${escapeHtml(
            status?.connected
              ? "The verified Feeds protocol currently provides capability negotiation only. News & Weather will not invent article endpoints before GoreeCloud Feeds publishes them."
              : status?.message ?? "GoreeCloud Feeds is not configured.",
          )}
        </p>
      </div>
    </section>
  `;
}

function currentWeatherPanel(
  forecast: WeatherForecast,
  cached: boolean,
  preferences: Preferences,
): string {
  const current = forecast.current;
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
        <div><span>Wind</span><strong>${wind(current.windSpeedKmh, preferences)}</strong></div>
        <div><span>Precipitation</span><strong>${precipitation(current.precipitationMm, preferences)}</strong></div>
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
                <span>${escapeHtml(hourLabel(point.time))}</span>
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

        <button class="button secondary" id="replay-onboarding">Replay first-use setup</button>
      </section>
    </div>
  `;
}

export function createNewsWeatherApp(root: HTMLElement): void {
  const preferences = loadPreferences();
  const cachedWeather = loadWeatherCache(preferences.manualWeatherLocation);

  const state: RuntimeState = {
    route: "home",
    settingsOpen: false,
    preferences,
    weather: {
      loading: false,
      error: null,
      forecast: cachedWeather?.forecast ?? null,
      cached: cachedWeather !== null,
    },
    feedsStatus: null,
  };

  let weatherRequestSequence = 0;
  applyTheme(state.preferences.theme);

  async function render(): Promise<void> {
    const [feedsStatus, weatherStatus] = await Promise.all([
      feedsClient.getStatus(),
      weatherProvider.getStatus(),
    ]);
    state.feedsStatus = feedsStatus;

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
              class="button ghost"
              id="search-action"
              disabled
              aria-disabled="true"
              title="Search activates after GoreeCloud Feeds publishes and exposes article search endpoints"
            >
              Search
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

        ${settingsPanel(state)}
      </div>
    `;

    wireEvents();
  }

  function updatePreferences(next: Preferences): void {
    state.preferences = next;
    savePreferences(next);
    applyTheme(next.theme);
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
      state.settingsOpen = true;
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

    root.querySelector<HTMLButtonElement>("#replay-onboarding")?.addEventListener("click", () => {
      state.settingsOpen = false;
      updatePreferences({ ...state.preferences, onboardingComplete: false });
      void render();
    });

    root.querySelector<HTMLButtonElement>("#finish-onboarding")?.addEventListener("click", () => {
      const location =
        root.querySelector<HTMLInputElement>("#onboarding-location")?.value.trim().slice(0, 160) ?? "";
      const hints =
        root.querySelector<HTMLInputElement>("#onboarding-hints")?.checked ?? true;
      const changed = location.localeCompare(state.preferences.manualWeatherLocation, undefined, {
        sensitivity: "accent",
      }) !== 0;

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
        root.querySelector<HTMLInputElement>("#weather-location")?.value.trim().slice(0, 160) ?? "";
      const changed = location.localeCompare(state.preferences.manualWeatherLocation, undefined, {
        sensitivity: "accent",
      }) !== 0;

      if (changed) {
        clearWeatherCache();
        state.weather = { loading: false, error: null, forecast: null, cached: false };
      }

      updatePreferences({ ...state.preferences, manualWeatherLocation: location });
      void refreshWeather(location);
    });
  }

  void render().then(() => {
    if (state.preferences.onboardingComplete && state.preferences.manualWeatherLocation.trim()) {
      void refreshWeather(state.preferences.manualWeatherLocation);
    }
  });
}
