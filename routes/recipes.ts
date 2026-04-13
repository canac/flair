import * as cheerio from "cheerio";
import { define } from "../utils.ts";
import { connect } from "../db.ts";

/**
 * Strip query params from a recipe URL
 */
export function sanitizeUrl(input: string): string {
  const parsed = new URL(input);
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString();
}

export const handler = define.handlers({
  async POST(ctx) {
    const form = await ctx.req.formData();
    const url = form.get("url");
    if (typeof url !== "string" || !url) {
      return new Response("Missing URL", { status: 400 });
    }
    const recipeUrl = sanitizeUrl(url);

    const res = await fetch(recipeUrl);
    const $ = cheerio.load(await res.text());

    const name = $('meta[property="og:title"]').attr("content") ||
      $("title").text().trim() || null;
    const imageUrl = $('meta[property="og:image"]').attr("content") ?? null;

    await (await connect()).execute({
      sql: "INSERT INTO recipes (url, name, image_url) VALUES (?, ?, ?)",
      args: [recipeUrl, name, imageUrl],
    });

    return new Response(null, {
      status: 303,
      headers: { Location: "/" },
    });
  },
});
