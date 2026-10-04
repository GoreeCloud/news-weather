export interface NewsArticleSummary {
  readonly id: string;
  readonly title: string;
  readonly sourceName: string;
  readonly publishedAt: string;
  readonly unread: boolean;
  readonly bookmarked: boolean;
  readonly thumbnailUrl?: string;
  readonly summary?: string;
  readonly url?: string;
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

interface ArticleResponse {
  readonly id: string;
  readonly feed_id: string;
  readonly feed_title: string;
  readonly url: string;
  readonly title: string;
  readonly author: string;
  readonly published_at: string | null;
  readonly summary: string;
  readonly language: string;
  readonly read: boolean;
  readonly saved: boolean;
  readonly favorite: boolean;
}

interface ArticleListResponse {
  readonly articles: readonly ArticleResponse[];
}

export const ARTICLE_LIST_CAPABILITY = "articles:list-v1";
const CAPABILITIES_PATH = "api/v1/capabilities";
const ARTICLES_PATH = "api/v1/articles";
const MAX_ARTICLE_LIST_LIMIT = 100;
const STATUS_CACHE_MS = 30_000;
const ARTICLE_CACHE_MS = 30_000;

const capabilityKeys = new Set([
  "product",
  "api_version",
  "protocol_version",
  "lifecycle",
  "capabilities",
]);

const articleKeys = new Set([
  "id",
  "feed_id",
  "feed_title",
  "url",
  "title",
  "author",
  "published_at",
  "summary",
  "language",
  "read",
  "saved",
  "favorite",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  expected: ReadonlySet<string>,
): boolean {
  const keys = Object.keys(value);
  return keys.length === expected.size && keys.every((key) => expected.has(key));
}

function parseCapabilities(value: unknown): CapabilityResponse {
  if (!isRecord(value) || !hasExactKeys(value, capabilityKeys)) {
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
    throw new Error(
      "GoreeCloud Feeds capability contract does not match the supported Development protocol.",
    );
  }

  return {
    product: "GoreeCloud Feeds Server",
    api_version: "v1",
    protocol_version: "0.1.0-dev",
    lifecycle: "development",
    capabilities,
  };
}

function requireString(
  value: Record<string, unknown>,
  key: string,
): string {
  const field = value[key];
  if (typeof field !== "string") {
    throw new Error(`GoreeCloud Feeds article field ${key} must be a string.`);
  }
  return field;
}

function requireBoolean(
  value: Record<string, unknown>,
  key: string,
): boolean {
  const field = value[key];
  if (typeof field !== "boolean") {
    throw new Error(`GoreeCloud Feeds article field ${key} must be a boolean.`);
  }
  return field;
}

function safeArticleUrl(value: string): string {
  if (!value) return "";
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("GoreeCloud Feeds article URL is invalid.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("GoreeCloud Feeds article URL must use HTTP or HTTPS.");
  }
  return url.toString();
}

function parseArticle(value: unknown): ArticleResponse {
  if (!isRecord(value) || !hasExactKeys(value, articleKeys)) {
    throw new Error("GoreeCloud Feeds returned an invalid article summary.");
  }

  const id = requireString(value, "id");
  const feedId = requireString(value, "feed_id");
  if (!id.trim() || !feedId.trim()) {
    throw new Error("GoreeCloud Feeds article identifiers must not be blank.");
  }

  const publishedAt = value.published_at;
  if (publishedAt !== null && typeof publishedAt !== "string") {
    throw new Error("GoreeCloud Feeds article publication time is invalid.");
  }
  if (
    typeof publishedAt === "string" &&
    (!publishedAt.trim() || Number.isNaN(Date.parse(publishedAt)))
  ) {
    throw new Error("GoreeCloud Feeds article publication time is invalid.");
  }

  return {
    id,
    feed_id: feedId,
    feed_title: requireString(value, "feed_title"),
    url: safeArticleUrl(requireString(value, "url")),
    title: requireString(value, "title"),
    author: requireString(value, "author"),
    published_at: publishedAt,
    summary: requireString(value, "summary"),
    language: requireString(value, "language"),
    read: requireBoolean(value, "read"),
    saved: requireBoolean(value, "saved"),
    favorite: requireBoolean(value, "favorite"),
  };
}

function parseArticleList(value: unknown): ArticleListResponse {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, new Set(["articles"])) ||
    !Array.isArray(value.articles)
  ) {
    throw new Error("GoreeCloud Feeds returned an invalid article-list response.");
  }

  if (value.articles.length > MAX_ARTICLE_LIST_LIMIT) {
    throw new Error("GoreeCloud Feeds article-list response exceeds the supported bound.");
  }

  return {
    articles: value.articles.map(parseArticle),
  };
}

function isLoopbackHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname === "::1"
  );
}

function resolveDevelopmentBaseUrl(configured: string): URL {
  const runtimeOrigin = globalThis.location?.origin ?? "http://localhost";
  const base = new URL(
    configured.endsWith("/") ? configured : `${configured}/`,
    runtimeOrigin,
  );
  const current = new URL(runtimeOrigin);

  const sameOrigin = base.origin === current.origin;
  const loopbackHttp =
    (base.protocol === "http:" || base.protocol === "https:") &&
    isLoopbackHost(base.hostname);

  if (!sameOrigin && !loopbackHttp) {
    throw new Error(
      "This Development source foundation only allows GoreeCloud Feeds through the same origin or a loopback development endpoint.",
    );
  }

  if (base.username || base.password) {
    throw new Error("The GoreeCloud Feeds Development endpoint must not embed credentials.");
  }

  return base;
}

async function fetchJson(endpoint: URL, credentials: RequestCredentials): Promise<unknown> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), 5_000);

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      credentials,
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      redirect: "error",
      referrerPolicy: "no-referrer",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `GoreeCloud Feeds request failed with HTTP ${response.status}.`,
      );
    }

    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    if (!contentType.startsWith("application/json")) {
      throw new Error("GoreeCloud Feeds response must use application/json.");
    }

    return await response.json();
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

function mapArticle(article: ArticleResponse): NewsArticleSummary {
  return {
    id: article.id,
    title: article.title,
    sourceName: article.feed_title,
    publishedAt: article.published_at ?? "",
    unread: !article.read,
    bookmarked: article.saved,
    summary: article.summary || undefined,
    url: article.url || undefined,
  };
}

export class DevelopmentFeedsClient implements FeedsClient {
  readonly #baseUrl: URL;
  #cachedStatus: { readonly value: NewsFeedStatus; readonly expiresAt: number } | null = null;
  #articleCache = new Map<
    number,
    { readonly value: readonly NewsArticleSummary[]; readonly expiresAt: number }
  >();

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
      const capabilityResponse = parseCapabilities(
        await fetchJson(endpoint, "omit"),
      );
      const value: NewsFeedStatus = {
        connected: true,
        message: "GoreeCloud Feeds Development capability contract verified.",
        apiVersion: capabilityResponse.api_version,
        protocolVersion: capabilityResponse.protocol_version,
        capabilities: capabilityResponse.capabilities,
      };
      this.#cachedStatus = { value, expiresAt: now + STATUS_CACHE_MS };
      return value;
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

  async listRecentArticles(limit: number): Promise<readonly NewsArticleSummary[]> {
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_ARTICLE_LIST_LIMIT) {
      throw new Error("News article limit must be an integer between 1 and 100.");
    }

    const status = await this.getStatus();
    if (
      !status.connected ||
      !status.capabilities?.includes(ARTICLE_LIST_CAPABILITY)
    ) {
      return [];
    }

    const now = Date.now();
    const cached = this.#articleCache.get(limit);
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }

    const endpoint = new URL(ARTICLES_PATH, this.#baseUrl);
    endpoint.searchParams.set("limit", String(limit));
    const response = parseArticleList(await fetchJson(endpoint, "include"));
    const value = response.articles.map(mapArticle);
    this.#articleCache.set(limit, {
      value,
      expiresAt: now + ARTICLE_CACHE_MS,
    });
    return value;
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
      error instanceof Error
        ? error.message
        : "The configured GoreeCloud Feeds endpoint is invalid.";

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
