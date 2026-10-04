import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ARTICLE_LIST_CAPABILITY,
  DevelopmentFeedsClient,
} from "../src/integrations/feeds.ts";

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function capabilityResponse(capabilities = []) {
  return {
    product: "GoreeCloud Feeds Server",
    api_version: "v1",
    protocol_version: "0.1.0-dev",
    lifecycle: "development",
    capabilities,
  };
}

function articleResponse(overrides = {}) {
  return {
    id: "article-1",
    feed_id: "feed-1",
    feed_title: "Example Feed",
    url: "https://example.test/articles/1",
    title: "Article One",
    author: "Example Author",
    published_at: "2026-10-04T16:00:00Z",
    summary: "Summary",
    language: "en",
    read: false,
    saved: true,
    favorite: false,
    ...overrides,
  };
}

test("Feeds client fetches articles only when capability is advertised", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), init });
    if (String(input).includes("/capabilities")) {
      return jsonResponse(capabilityResponse([ARTICLE_LIST_CAPABILITY]));
    }
    return jsonResponse({ articles: [articleResponse()] });
  };

  try {
    const client = new DevelopmentFeedsClient("http://127.0.0.1:8080/");
    const articles = await client.listRecentArticles(25);

    assert.equal(calls.length, 2);
    assert.equal(calls[0].init.credentials, "omit");
    assert.equal(calls[1].url, "http://127.0.0.1:8080/api/v1/articles?limit=25");
    assert.equal(calls[1].init.credentials, "include");
    assert.equal(calls[1].init.cache, "no-store");
    assert.equal(calls[1].init.redirect, "error");
    assert.equal(calls[1].init.referrerPolicy, "no-referrer");
    assert.deepEqual(articles, [
      {
        id: "article-1",
        title: "Article One",
        sourceName: "Example Feed",
        publishedAt: "2026-10-04T16:00:00Z",
        unread: true,
        bookmarked: true,
        summary: "Summary",
        url: "https://example.test/articles/1",
      },
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Feeds client does not call article endpoint without capability", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return jsonResponse(capabilityResponse([]));
  };

  try {
    const client = new DevelopmentFeedsClient("http://127.0.0.1:8080/");
    assert.deepEqual(await client.listRecentArticles(50), []);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Feeds client rejects unsafe or malformed article contract values", async () => {
  const originalFetch = globalThis.fetch;
  const responses = [
    articleResponse({ url: "javascript:alert(1)" }),
    { ...articleResponse(), unexpected: true },
    articleResponse({ published_at: "not-a-date" }),
  ];
  let articleIndex = 0;

  globalThis.fetch = async (input) => {
    if (String(input).includes("/capabilities")) {
      return jsonResponse(capabilityResponse([ARTICLE_LIST_CAPABILITY]));
    }
    return jsonResponse({ articles: [responses[articleIndex++]] });
  };

  try {
    for (let index = 0; index < responses.length; index++) {
      const client = new DevelopmentFeedsClient("http://127.0.0.1:8080/");
      await assert.rejects(client.listRecentArticles(10));
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Feeds client validates article request bounds before network use", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("fetch must not be called");
  };

  try {
    const client = new DevelopmentFeedsClient("http://127.0.0.1:8080/");
    await assert.rejects(client.listRecentArticles(0), /between 1 and 100/);
    await assert.rejects(client.listRecentArticles(101), /between 1 and 100/);
    await assert.rejects(client.listRecentArticles(1.5), /between 1 and 100/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
