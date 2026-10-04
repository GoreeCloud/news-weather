import type { NewsArticleSummary } from "../integrations/feeds";

const STORAGE_KEY = "goreecloud.newsweather.news-cache.v1";
const CACHE_VERSION = 1;
const MAX_CACHE_AGE_MS = 24 * 60 * 60 * 1000;
export const MAX_CACHED_NEWS_ARTICLES = 50;

interface NewsCacheRecord {
  readonly version: 1;
  readonly savedAt: string;
  readonly articles: readonly NewsArticleSummary[];
}

export interface LoadedNewsCache {
  readonly articles: readonly NewsArticleSummary[];
  readonly savedAt: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafeHttpUrl(value: string): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeArticle(value: unknown): NewsArticleSummary | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    !value.id.trim() ||
    typeof value.title !== "string" ||
    typeof value.sourceName !== "string" ||
    typeof value.publishedAt !== "string" ||
    typeof value.unread !== "boolean" ||
    typeof value.bookmarked !== "boolean"
  ) {
    return null;
  }

  if (
    value.publishedAt &&
    Number.isNaN(Date.parse(value.publishedAt))
  ) {
    return null;
  }

  if (
    value.summary !== undefined &&
    typeof value.summary !== "string"
  ) {
    return null;
  }

  if (
    value.url !== undefined &&
    (typeof value.url !== "string" || !isSafeHttpUrl(value.url))
  ) {
    return null;
  }

  return {
    id: value.id.trim().slice(0, 512),
    title: value.title.slice(0, 2_000),
    sourceName: value.sourceName.slice(0, 512),
    publishedAt: value.publishedAt,
    unread: value.unread,
    bookmarked: value.bookmarked,
    ...(typeof value.summary === "string"
      ? { summary: value.summary.slice(0, 8_000) }
      : {}),
    ...(typeof value.url === "string" && value.url
      ? { url: value.url }
      : {}),
  };
}

export function normalizeCachedNewsArticles(
  value: unknown,
): readonly NewsArticleSummary[] {
  if (!Array.isArray(value)) return [];

  const result: NewsArticleSummary[] = [];
  const seen = new Set<string>();

  for (const item of value) {
    const article = normalizeArticle(item);
    if (!article) continue;

    const key = article.id.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(article);

    if (result.length >= MAX_CACHED_NEWS_ARTICLES) break;
  }

  return result;
}

export function loadNewsCache(): LoadedNewsCache | null {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (
      !isRecord(parsed) ||
      parsed.version !== CACHE_VERSION ||
      typeof parsed.savedAt !== "string" ||
      !Array.isArray(parsed.articles)
    ) {
      clearNewsCache();
      return null;
    }

    const savedAt = new Date(parsed.savedAt);
    if (
      !Number.isFinite(savedAt.valueOf()) ||
      Date.now() - savedAt.valueOf() > MAX_CACHE_AGE_MS
    ) {
      clearNewsCache();
      return null;
    }

    const articles = normalizeCachedNewsArticles(parsed.articles);
    if (articles.length !== parsed.articles.length) {
      clearNewsCache();
      return null;
    }

    return {
      articles,
      savedAt: parsed.savedAt,
    };
  } catch {
    clearNewsCache();
    return null;
  }
}

export function saveNewsCache(
  articles: readonly NewsArticleSummary[],
): LoadedNewsCache | null {
  const normalized = normalizeCachedNewsArticles(articles);
  if (normalized.length === 0) {
    clearNewsCache();
    return null;
  }

  const record: NewsCacheRecord = {
    version: CACHE_VERSION,
    savedAt: new Date().toISOString(),
    articles: normalized,
  };

  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    return null;
  }

  return {
    articles: normalized,
    savedAt: record.savedAt,
  };
}

export function clearNewsCache(): void {
  try {
    globalThis.localStorage?.removeItem(STORAGE_KEY);
  } catch {
    // Offline headline persistence is optional.
  }
}

export const NEWS_CACHE_MAX_AGE_MS = MAX_CACHE_AGE_MS;
