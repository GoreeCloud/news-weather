import assert from "node:assert/strict";
import { test } from "node:test";
import {
  MAX_LOCAL_NEWS_SEARCH_QUERY_LENGTH,
  normalizeLocalNewsSearchQuery,
  searchLocalNewsArticles,
} from "../src/news-search.ts";

function article(id, title, sourceName, summary = "") {
  return {
    id,
    title,
    sourceName,
    publishedAt: "2026-10-04T16:00:00Z",
    unread: true,
    bookmarked: false,
    summary,
    url: `https://example.test/${id}`,
  };
}

const articles = [
  article("1", "PostgreSQL runtime wiring lands", "GoreeCloud Engineering", "Development database startup is now available."),
  article("2", "Weekend weather outlook", "Local Forecast", "Rain possible on Sunday."),
  article("3", "Privacy-focused RSS readers", "Reader Notes", "A comparison of quiet feed tools."),
];

test("local news search matches title, source, and summary without reordering", () => {
  assert.deepEqual(
    searchLocalNewsArticles(articles, "goreecloud runtime").map((item) => item.id),
    ["1"],
  );
  assert.deepEqual(
    searchLocalNewsArticles(articles, "forecast rain").map((item) => item.id),
    ["2"],
  );
  assert.deepEqual(
    searchLocalNewsArticles(articles, "privacy rss").map((item) => item.id),
    ["3"],
  );
});

test("local news search is case-insensitive and requires every term", () => {
  assert.deepEqual(
    searchLocalNewsArticles(articles, "POSTGRESQL GOREecloud").map((item) => item.id),
    ["1"],
  );
  assert.deepEqual(searchLocalNewsArticles(articles, "privacy rain"), []);
});

test("local news search normalizes whitespace and bounds query length", () => {
  assert.equal(normalizeLocalNewsSearchQuery("  privacy    rss  "), "privacy rss");
  assert.equal(
    normalizeLocalNewsSearchQuery("x".repeat(MAX_LOCAL_NEWS_SEARCH_QUERY_LENGTH + 20)).length,
    MAX_LOCAL_NEWS_SEARCH_QUERY_LENGTH,
  );
});

test("local news search returns no results for blank queries", () => {
  assert.deepEqual(searchLocalNewsArticles(articles, "   "), []);
});

test("local news search validates result bounds", () => {
  assert.throws(() => searchLocalNewsArticles(articles, "news", 0), /between 1 and 50/);
  assert.throws(() => searchLocalNewsArticles(articles, "news", 51), /between 1 and 50/);
  assert.throws(() => searchLocalNewsArticles(articles, "news", 1.5), /between 1 and 50/);
});
