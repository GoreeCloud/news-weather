import { PRODUCT, type Route, type ThemePreference } from "./config/product";
import { UnavailableFeedsClient } from "./integrations/feeds";
import { UnavailableWeatherProvider } from "./integrations/weather";
import {
  loadPreferences,
  savePreferences,
  type Preferences,
} from "./state/preferences";

const feedsClient = new UnavailableFeedsClient();
const weatherProvider = new UnavailableWeatherProvider();

interface RuntimeState {
  route: Route;
  settingsOpen: boolean;
  preferences: Preferences;
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
          Choose your news sources later through GoreeCloud Feeds. For weather,
          you can start with a manual location—location permission is not required.
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
      <p>News will stay chronological by default. Weather can use a manual location without GPS.</p>
      <button class="icon-button" id="dismiss-hints" aria-label="Turn off contextual hints">×</button>
    </aside>
  `;
}

function homeView(state: RuntimeState): string {
  const location = state.preferences.manualWeatherLocation.trim();
  const locationText = location ? escapeHtml(location) : "Choose a location";

  return `
    <section class="page" aria-labelledby="home-title">
      <header class="page-heading">
        <div>
          <p class="eyebrow">Overview</p>
          <h1 id="home-title">Right now</h1>
        </div>
        <p class="quiet">Development source foundation</p>
      </header>

      <div class="home-grid">
        <article class="weather-card glass-card">
          <div class="card-heading">
            <div>
              <p class="eyebrow">Weather</p>
              <h2>${locationText}</h2>
            </div>
            <span class="status-dot waiting" aria-label="Provider not connected"></span>
          </div>
          <div class="weather-placeholder" aria-live="polite">
            <strong>—°</strong>
            <span>Weather provider not connected</span>
          </div>
          <p class="quiet">No stale or fabricated forecast is shown.</p>
        </article>

        <article class="headline-card glass-card">
          <div class="card-heading">
            <div>
              <p class="eyebrow">News</p>
              <h2>Recent headlines</h2>
            </div>
            <span class="count-badge">0</span>
          </div>
          <div class="empty-state compact">
            <strong>No feed data yet</strong>
            <p>GoreeCloud Feeds integration is the next news implementation slice.</p>
          </div>
        </article>
      </div>
    </section>
  `;
}

function newsView(): string {
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
        <h2>Your sources will appear here</h2>
        <p>
          This source foundation does not fabricate sample headlines.
          GoreeCloud Feeds will provide RSS/Atom retrieval, normalization,
          deduplication, search, and synchronization.
        </p>
      </div>
    </section>
  `;
}

function weatherView(state: RuntimeState): string {
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
        <p class="quiet">Current-location permission is optional and is not requested by this source foundation.</p>
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
          <button class="button primary" type="submit">Save location</button>
        </form>
      </article>

      <div class="empty-state glass-card">
        <div class="empty-icon" aria-hidden="true">☼</div>
        <h2>Forecast provider not connected</h2>
        <p>
          The provider adapter boundary exists in source, but no live provider
          is configured. The app will never label missing or stale data as current.
        </p>
      </div>
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

        <label class="check-row">
          <input id="hints-setting" type="checkbox" ${state.preferences.hintsEnabled ? "checked" : ""} />
          <span>Contextual hints</span>
        </label>

        <div class="settings-note">
          <strong>Privacy default</strong>
          <p>No account, location permission, telemetry, or notification permission is required by this shell.</p>
        </div>

        <button class="button secondary" id="replay-onboarding">Replay first-use setup</button>
      </section>
    </div>
  `;
}

export function createNewsWeatherApp(root: HTMLElement): void {
  const state: RuntimeState = {
    route: "home",
    settingsOpen: false,
    preferences: loadPreferences(),
  };

  applyTheme(state.preferences.theme);

  async function render(): Promise<void> {
    const [feedsStatus, weatherStatus] = await Promise.all([
      feedsClient.getStatus(),
      weatherProvider.getStatus(),
    ]);

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
            <button class="button ghost" id="search-action" disabled aria-disabled="true" title="Search activates when GoreeCloud Feeds is connected">Search</button>
            <button class="icon-button" id="settings-action" aria-label="Open settings">⚙</button>
          </div>
        </header>

        <div class="provider-strip" aria-label="Development provider status">
          <span>News: ${escapeHtml(feedsStatus.connected ? "connected" : "not connected")}</span>
          <span>Weather: ${escapeHtml(weatherStatus.connected ? "connected" : "not connected")}</span>
          <span>Glaze target: ${PRODUCT.glazeUiTarget}</span>
        </div>

        ${onboarding(state)}
        ${hint(state)}

        <main>
          ${state.route === "home" ? homeView(state) : state.route === "news" ? newsView() : weatherView(state)}
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

      updatePreferences({
        ...state.preferences,
        onboardingComplete: true,
        manualWeatherLocation: location,
        hintsEnabled: hints,
      });
      void render();
    });

    root.querySelector<HTMLButtonElement>("#dismiss-hints")?.addEventListener("click", () => {
      updatePreferences({ ...state.preferences, hintsEnabled: false });
      void render();
    });

    root.querySelector<HTMLFormElement>("#weather-location-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const location =
        root.querySelector<HTMLInputElement>("#weather-location")?.value.trim().slice(0, 160) ?? "";
      updatePreferences({ ...state.preferences, manualWeatherLocation: location });
      void render();
    });
  }

  void render();
}
