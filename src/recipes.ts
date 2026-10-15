import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { db, query, type Recipe } from "@/db.ts";
import { extractRecipeData } from "@/extract.ts";
import { sanitizeUrl } from "@/utils.ts";

export const listRecipes = createServerFn()
  .validator((search: string) => search)
  .handler(({ data: search }) =>
    search
      ? query<Pick<Recipe, "id" | "name" | "url" | "image_url">>(
          "SELECT id, name, url, image_url FROM recipes WHERE name LIKE ?1 OR description LIKE ?1 OR ingredients LIKE ?1 OR instructions LIKE ?1 OR adjustments LIKE ?1 ORDER BY pinned_at IS NULL, pinned_at DESC, created_at DESC",
          `%${search}%`,
        )
      : query<Pick<Recipe, "id" | "name" | "url" | "image_url">>(
          "SELECT id, name, url, image_url FROM recipes ORDER BY pinned_at IS NULL, pinned_at DESC, created_at DESC",
        ),
  );

export const getRecipe = createServerFn()
  .validator((id: number) => id)
  .handler(async ({ data: id }) => {
    const [recipe] = await query<Omit<Recipe, "pinned"> & { pinned: number }>(
      "SELECT id, url, name, description, image_url, ingredients, instructions, adjustments, pinned_at IS NOT NULL AS pinned FROM recipes WHERE id = ?",
      id,
    );
    if (!recipe) {
      throw notFound();
    }
    return { ...recipe, pinned: Boolean(recipe.pinned) };
  });

/**
 * Save the recipe at a URL, or find the existing one, and return its id
 */
export const addRecipe = createServerFn({ method: "POST" })
  .validator((url: string) => sanitizeUrl(url))
  .handler(async ({ data: recipeUrl }) => {
    const existing = await db
      .prepare("SELECT id FROM recipes WHERE url = ?")
      .bind(recipeUrl)
      .first<{ id: number }>();
    if (existing) {
      return existing.id;
    }

    const res = await fetch(recipeUrl);
    const { name, description, imageUrl, ingredients, instructions } = extractRecipeData(
      await res.text(),
    );

    const { meta } = await db
      .prepare(
        "INSERT INTO recipes (url, name, description, image_url, ingredients, instructions) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .bind(recipeUrl, name, description, imageUrl, ingredients.join("\n"), instructions.join("\n"))
      .run();
    return meta.last_row_id;
  });

export const togglePin = createServerFn({ method: "POST" })
  .validator((id: number) => id)
  .handler(async ({ data: id }) => {
    await db
      .prepare(
        "UPDATE recipes SET pinned_at = CASE WHEN pinned_at IS NULL THEN CURRENT_TIMESTAMP ELSE NULL END WHERE id = ?",
      )
      .bind(id)
      .run();
  });

export const saveAdjustments = createServerFn({ method: "POST" })
  .validator((input: { id: number; adjustments: string }) => input)
  .handler(async ({ data: { id, adjustments } }) => {
    await db.prepare("UPDATE recipes SET adjustments = ? WHERE id = ?").bind(adjustments, id).run();
  });
