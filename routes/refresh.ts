import { define } from "@/utils.ts";
import { connect, query, type Recipe } from "@/db.ts";
import { extractRecipeData } from "@/extract.ts";

export const handler = define.handlers({
  async POST() {
    const recipes = await query<Pick<Recipe, "id" | "url">>(
      "SELECT id, url FROM recipes WHERE url LIKE 'http%'",
    );
    const client = await connect();

    const results: string[] = [];
    for (const { id, url } of recipes) {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          results.push(`${url}: HTTP ${res.status}`);
          continue;
        }

        const { name, imageUrl, ingredients, instructions } = extractRecipeData(
          await res.text(),
        );
        await client.execute({
          sql:
            "UPDATE recipes SET name = ?, image_url = ?, ingredients = ?, instructions = ? WHERE id = ?",
          args: [
            name,
            imageUrl,
            ingredients.join("\n"),
            instructions.join("\n"),
            id,
          ],
        });
        results.push(
          `${url}: ${ingredients.length} ingredients, ${instructions.length} instructions`,
        );
      } catch (error) {
        if (error instanceof Error) {
          results.push(`${url}: ${error.message}`);
        }
      }
    }

    return new Response(results.join("\n"), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
});
