import { assertEquals } from "jsr:@std/assert@^1";
import { sanitizeUrl } from "./recipes.ts";

Deno.test("sanitizeUrl strips query params", () => {
  assertEquals(
    sanitizeUrl("https://example.com/recipe?utm_source=foo&ref=bar"),
    "https://example.com/recipe",
  );
});

Deno.test("sanitizeUrl strips hash fragment", () => {
  assertEquals(
    sanitizeUrl("https://example.com/recipe#section"),
    "https://example.com/recipe",
  );
});

Deno.test("sanitizeUrl strips both query and hash", () => {
  assertEquals(
    sanitizeUrl("https://example.com/recipe?x=1#top"),
    "https://example.com/recipe",
  );
});

Deno.test("sanitizeUrl preserves path and trailing slash", () => {
  assertEquals(
    sanitizeUrl("https://example.com/recipes/pasta/?x=1"),
    "https://example.com/recipes/pasta/",
  );
});

Deno.test("sanitizeUrl leaves clean url unchanged", () => {
  assertEquals(
    sanitizeUrl("https://example.com/recipe"),
    "https://example.com/recipe",
  );
});
