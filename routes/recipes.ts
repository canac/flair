import { define } from "@/utils.ts";
import { connect } from "@/db.ts";
import { extractRecipeData } from "@/extract.ts";

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

    const client = await connect();
    const existing = await client.execute({
      sql: "SELECT id FROM recipes WHERE url = ?",
      args: [recipeUrl],
    });
    const existingRow = existing.rows[0];
    if (existingRow) {
      return new Response(null, {
        status: 303,
        headers: { Location: `/recipes/${existingRow.id}` },
      });
    }

    const res = await fetch(recipeUrl);
    const { name, imageUrl, ingredients, instructions } = extractRecipeData(
      await res.text(),
    );

    const result = await client.execute({
      sql:
        "INSERT INTO recipes (url, name, image_url, ingredients, instructions) VALUES (?, ?, ?, ?, ?)",
      args: [
        recipeUrl,
        name,
        imageUrl,
        ingredients.join("\n"),
        instructions.join("\n"),
      ],
    });

    return new Response(null, {
      status: 303,
      headers: { Location: `/recipes/${result.lastInsertRowid}` },
    });
  },
});
