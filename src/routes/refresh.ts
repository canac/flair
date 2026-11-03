import { createFileRoute } from "@tanstack/react-router";
import { db, query } from "@/db.ts";
import { fetchRecipeData } from "@/extract.ts";

export const Route = createFileRoute("/refresh")({
  server: {
    handlers: {
      async POST() {
        const recipes = await query<{ id: number; url: string }>(
          "SELECT id, url FROM recipes WHERE url LIKE 'http%'",
        );

        const results: string[] = [];
        for (const { id, url } of recipes) {
          try {
            const { name, description, imageUrl, ingredients, instructions } =
              await fetchRecipeData(url);
            await db
              .prepare(
                "UPDATE recipes SET name = ?, description = ?, image_url = ?, ingredients = ?, instructions = ? WHERE id = ?",
              )
              .bind(
                name,
                description,
                imageUrl,
                ingredients.join("\n"),
                instructions.join("\n"),
                id,
              )
              .run();
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
    },
  },
});
