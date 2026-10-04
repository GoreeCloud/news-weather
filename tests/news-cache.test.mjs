import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import {
  MAX_CACHED_NEWS_ARTICLES,
  NEWS_CACHE_MAX_AGE_MS,
  clearNewsCache,
  loadNewsCache,
  normalizeCachedNewsArticles,
  saveNewsCache,
} from "../src/state/news-cache.ts";

class MemoryStorage {
  #values = new Map();

  getItem(key) {
    return this.#values.has(key) ? this.#values.get(key) : null;
  }

  setItem(key, value) {
    this.#values.set(key, String(value));
  }

  removeItem(key) {
    this.#values.delete(key);
  }

  clear() {
    this.#values.clear();
  }
}

const storage = new MemoryStorage();
Object.defineProperty(globalThis, "localStorage", {
  value: storage,
  configurable: true,
});

function article(index = 1, overrides = {}) {
  return {
    id: `article-${index}`,
    title: `Article ${index}`,
    sourceName: "Example Feed",
    publishedAt: "2026-10-04T16:00:00Z",
    unread: true,
    bookmarked: false,
    summary: "Summary",
    url: `https://example.test/articles/${index}`,
    ...overrides,
  };
}

beforeEach(() => {
  storage.clear();
});

test("news cache round-trips validated article summaries", () => {
  const saved = saveNewsCache([article(1), article(2)]);
  assert.ok(saved);

  const loaded = loadNewsCache();
  assert.ok(loaded);
  assert.deepEqual(loaded.articles, [article(1), article(2)]);
  assert.equal(typeof loaded.savedAt, "string");
});

test("news cache remains bounded and deduplicates article ids", () => {
  const input = [
    article(1),
    article(1, { title: "Duplicate" }),
    ...Array.from({ length: MAX_CACHED_NEWS_ARTICLES + 10 }, (_, index) =>
      article(index + 2),
    ),
  ];

  const normalized = normalizeCachedNewsArticles(input);
  assert.equal(normalized.length, MAX_CACHED_NEWS_ARTICLES);
  assert.equal(normalized[0].title, "Article 1");
});

test("news cache rejects unsafe URLs and malformed persisted values", () => {
  assert.deepEqual(
    normalizeCachedNewsArticles([
      article(1, { url: "javascript:alert(1)" }),
      article(2, { publishedAt: "not-a-date" }),
      article(3, { unread: "yes" }),
    ]),
    [],
  );

  storage.setItem(
    "goreecloud.newsweather.news-cache.v1",
    JSON.stringify({
      version: 1,
      savedAt: new Date().toISOString(),
      articles: [article(1), { ...article(2), unexpected: true }],
    }),
  );

  assert.equal(loadNewsCache(), null);
  assert.equal(storage.getItem("goreecloud.newsweather.news-cache.v1"), null);
});

test("news cache expires after the bounded maximum age", () => {
  saveNewsCache([article(1)]);
  const key = "goreecloud.newsweather.news-cache.v1";
  const persisted = JSON.parse(storage.getItem(key));
  persisted.savedAt = new Date(
    Date.now() - NEWS_CACHE_MAX_AGE_MS - 1_000,
  ).toISOString();
  storage.setItem(key, JSON.stringify(persisted));

  assert.equal(loadNewsCache(), null);
  assert.equal(storage.getItem(key), null);
});

test("saving an empty list clears stale cached headlines", () => {
  saveNewsCache([article(1)]);
  assert.ok(loadNewsCache());

  assert.equal(saveNewsCache([]), null);
  assert.equal(loadNewsCache(), null);
});

test("clearing news cache is idempotent", () => {
  saveNewsCache([article(1)]);
  clearNewsCache();
  clearNewsCache();
  assert.equal(loadNewsCache(), null);
});
