import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { DevelopmentFeedsClient } from "../src/integrations/feeds.ts";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function jsonResponse(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return payload;
    },
  };
}

test("Feeds client accepts the verified 0.1.0-dev capability contract", async () => {
  let calls = 0;
  globalThis.fetch = async (input) => {
    calls += 1;
    const url = input instanceof URL ? input : new URL(String(input));
    assert.equal(url.href, "http://localhost:8080/api/v1/capabilities");
    return jsonResponse({
      product: "GoreeCloud Feeds Server",
      api_version: "v1",
      protocol_version: "0.1.0-dev",
      lifecycle: "development",
      capabilities: [],
    });
  };

  const client = new DevelopmentFeedsClient("http://localhost:8080/");
  const first = await client.getStatus();
  const second = await client.getStatus();

  assert.equal(first.connected, true);
  assert.equal(first.apiVersion, "v1");
  assert.equal(first.protocolVersion, "0.1.0-dev");
  assert.equal(second.connected, true);
  assert.equal(calls, 1, "status response should be cached briefly");
  assert.deepEqual(await client.listRecentArticles(10), []);
});

test("Feeds client fails closed on an incompatible capability contract", async () => {
  globalThis.fetch = async () =>
    jsonResponse({
      product: "GoreeCloud Feeds Server",
      api_version: "v1",
      protocol_version: "2.0.0",
      lifecycle: "development",
      capabilities: [],
    });

  const client = new DevelopmentFeedsClient("http://127.0.0.1:8080/");
  const status = await client.getStatus();

  assert.equal(status.connected, false);
  assert.match(status.message, /does not match/);
});

test("Feeds Development endpoint rejects non-loopback cross-origin configuration", () => {
  assert.throws(
    () => new DevelopmentFeedsClient("https://example.com/"),
    /same origin or a loopback development endpoint/,
  );
});
