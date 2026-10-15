import { expect, test } from "vitest";
import { sanitizeUrl } from "./utils.ts";

test("sanitizeUrl strips query params", () => {
  expect(sanitizeUrl("https://example.com/recipe?utm_source=foo&ref=bar")).toBe(
    "https://example.com/recipe",
  );
});

test("sanitizeUrl strips hash fragment", () => {
  expect(sanitizeUrl("https://example.com/recipe#section")).toBe("https://example.com/recipe");
});

test("sanitizeUrl strips both query and hash", () => {
  expect(sanitizeUrl("https://example.com/recipe?x=1#top")).toBe("https://example.com/recipe");
});

test("sanitizeUrl preserves path and trailing slash", () => {
  expect(sanitizeUrl("https://example.com/recipes/pasta/?x=1")).toBe(
    "https://example.com/recipes/pasta/",
  );
});

test("sanitizeUrl leaves clean url unchanged", () => {
  expect(sanitizeUrl("https://example.com/recipe")).toBe("https://example.com/recipe");
});
