import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkFormToken, createFormToken, looksLikeSpam } from "../src/lib/spam";

describe("contact form spam checks", () => {
  it("accepts a token after a few seconds and rejects fast, old, missing or forged ones", () => {
    const now = Date.now();
    const token = createFormToken(now);
    assert.equal(checkFormToken(token, now + 10_000), "ok");
    assert.equal(checkFormToken(token, now + 500), "fast");
    assert.equal(checkFormToken(token, now + 2 * 24 * 60 * 60 * 1000), "expired");
    assert.equal(checkFormToken("", now), "missing");
    assert.equal(checkFormToken(`${now - 60_000}.forged`, now), "missing");
    assert.equal(checkFormToken(token.replace(/^\d+/, String(now - 60_000)), now), "missing");
  });
  it("flags link-heavy messages and links in the name", () => {
    assert.equal(looksLikeSpam("გამარჯობა, მაინტერესებს სამზარეულოს ავეჯი.", "ნინო"), false);
    assert.equal(looksLikeSpam("See https://example.com for the plan", "Nino"), false);
    assert.equal(looksLikeSpam("http://a.com http://b.com www.c.com", "Bot"), true);
    assert.equal(looksLikeSpam('<a href="x">cheap</a>', "Bot"), true);
    assert.equal(looksLikeSpam("hello there friend", "www.spam.com"), true);
  });
});
