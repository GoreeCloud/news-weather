export interface NewsArticleSummary {
  readonly id: string;
  readonly title: string;
  readonly sourceName: string;
  readonly publishedAt: string;
  readonly unread: boolean;
  readonly bookmarked: boolean;
  readonly thumbnailUrl?: string;
  readonly summary?: string;
}

export interface NewsFeedStatus {
  readonly connected: boolean;
  readonly message: string;
  readonly apiVersion?: string;
  readonly protocolVersion?: string;
  readonly capabilities?: readonly string[];
}

export interface FeedsClient {
  getStatus(): Promise<NewsFeedStatus>;
  listRecentArticles(limit: number): Promise<readonly NewsArticleSummary[]>;
}

interface CapabilityResponse {
  readonly product: "GoreeCloud Feeds Server";
  readonly api_version: "v1";
  readonly protocol_version: "0.1.0-dev";
  readonly lifecycle: "development";
  readonly capabilities: readonly string[];
}

const CAPABILITIES_PATH = "api/v1/capabilities";
const STATUS_CACHE_MS = 30_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseCapabilities(value: unknown): CapabilityResponse {
  if (!isRecord(value)) {
    throw new Error("GoreeCloud Feeds returned an invalid capability response.");
  }

  const capabilities = value.capabilities;
  if (
    value.product !== "GoreeCloud Feeds Server" ||
    value.api_version !== "v1" ||
    value.protocol_version !== "0.1.0-dev" ||
    value.lifecycle !== "development" ||
    !Array.isArray(capabilities) ||
    !capabilities.every((item) => typeof item === "string")
  ) {
    throw new Error("GoreeCloud Feeds capability contract does not match the supported Development protocol.");
  }

  return {
    product: "GoreeCloud Feeds Server",
    api_version: "v1",
    protocol_version: "0.1.0-dev",
    lifecycle: "development",
    capabilities,
  };
}

function isLoopbackHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]" || hostname === "::1";
}

function resolveDevelopmentBaseUrl(configured: string): URL {
  const runtimeOrigin = globalThis.location?.origin ?? "http://localhost";
  const base = new URL(configured.endsWith("/") ? configured : `${configured}/`, runtimeOrigin);
  const current = new URL(runtimeOrigin);

  const sameOrigin = base.origin === current.origin;
  const loopbackHttp =
    (base.protocol === "http:" || base.protocol === "https:") && isLoopbackHost(base.hostname);

  if (!sameOrigin && !loopbackHttp) {
    throw new Error(
      "This Development source foundation only allows GoreeCloud Feeds through the same origin or a loopback development endpoint.",
    );
  }

  return base;
}

export class DevelopmentFeedsClient implements FeedsClient {
  readonly #baseUrl: URL;
  #cachedStatus: { readonly value: NewsFeedStatus; readonly expiresAt: number } | null = null;

  constructor(baseUrl: string) {
    this.#baseUrl = resolveDevelopmentBaseUrl(baseUrl);
  }

  async getStatus(): Promise<NewsFeedStatus> {
    const now = Date.now();
    if (this.#cachedStatus && this.#cachedStatus.expiresAt > now) {
      return this.#cachedStatus.value;
    }

    try {
      const endpoint = new URL(CAPABILITIES_PATH, this.#baseUrl);
      const controller = new AbortController();
      const timeout = globalThis.setTimeout(() => controller.abort(), 5_000);

      try {
        const response = await fetch(endpoint, {
          method: "GET",
          credentials: "omit",
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`GoreeCloud Feeds capability request failed with HTTP ${response.status}.`);
        }

        const capabilityResponse = parseCapabilities(await response.json());
        const value: NewsFeedStatus = {
          connected: true,
          message: "GoreeCloud Feeds Development capability contract verified.",
          apiVersion: capabilityResponse.api_version,
          protocolVersion: capabilityResponse.protocol_version,
          capabilities: capabilityResponse.capabilities,
        };
        this.#cachedStatus = { value, expiresAt: now + STATUS_CACHE_MS };
        return value;
      } finally {
        globalThis.clearTimeout(timeout);
      }
    } catch (error) {
      const value: NewsFeedStatus = {
        connected: false,
        message:
          error instanceof Error
            ? error.message
            : "GoreeCloud Feeds capability status could not be verified.",
      };
      this.#cachedStatus = { value, expiresAt: now + 5_000 };
      return value;
    }
  }

  async listRecentArticles(_limit: number): Promise<readonly NewsArticleSummary[]> {
    // The verified 0.1.0-dev protocol currently defines capability negotiation
    // only. Article endpoints must not be invented ahead of protocol authority.
    return [];
  }
}

export class UnavailableFeedsClient implements FeedsClient {
  async getStatus(): Promise<NewsFeedStatus> {
    return {
      connected: false,
      message:
        "Set VITE_GOREECLOUD_FEEDS_BASE_URL to a same-origin or loopback Development endpoint to verify the Feeds 0.1.0-dev capability contract.",
    };
  }

  async listRecentArticles(_limit: number): Promise<readonly NewsArticleSummary[]> {
    return [];
  }
}

export function createFeedsClient(): FeedsClient {
  const configured = import.meta.env.VITE_GOREECLOUD_FEEDS_BASE_URL?.trim();
  if (!configured) {
    return new UnavailableFeedsClient();
  }

  try {
    return new DevelopmentFeedsClient(configured);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The configured GoreeCloud Feeds endpoint is invalid.";

    return {
      async getStatus() {
        return { connected: false, message };
      },
      async listRecentArticles() {
        return [];
      },
    };
  }
}
