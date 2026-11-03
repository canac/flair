import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { db, query, type Recipe } from "@/db.ts";
import { fetchRecipeData } from "@/extract.ts";
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

export interface RecipeDraft {
  url: string;
  name: string;
  description: string;
  imageUrl: string;
  ingredients: string;
  instructions: string;
}

async function findRecipeIdByUrl(url: string): Promise<number | null> {
  const existing = await db
    .prepare("SELECT id FROM recipes WHERE url = ?")
    .bind(url)
    .first<{ id: number }>();
  return existing?.id ?? null;
}

/**
 * Scrape the recipe at a URL without saving it, or return the id of the recipe already saved with
 * that URL
 */
export const importRecipe = createServerFn({ method: "POST" })
  .validator((url: string) => sanitizeUrl(url))
  .handler(async ({ data: url }): Promise<{ existingId: number } | { draft: RecipeDraft }> => {
    const existingId = await findRecipeIdByUrl(url);
    if (existingId !== null) {
      return { existingId };
    }

    const { name, description, imageUrl, ingredients, instructions } = await fetchRecipeData(url);
    return {
      draft: {
        url,
        name: name ?? "",
        description: description ?? "",
        imageUrl: imageUrl ?? "",
        ingredients: ingredients.join("\n"),
        instructions: instructions.join("\n"),
      },
    };
  });

/**
 * Save a recipe, or find the existing one with the same URL, and return its id
 */
export const createRecipe = createServerFn({ method: "POST" })
  .validator((draft: RecipeDraft) => {
    const name = draft.name.trim();
    if (!name) {
      throw new Error("Recipe name is required");
    }

    /* oxlint-disable typescript/prefer-nullish-coalescing */
    return {
      url: draft.url.trim() ? sanitizeUrl(draft.url.trim()) : null,
      name,
      description: draft.description.trim() || null,
      imageUrl: draft.imageUrl.trim() || null,
      ingredients: draft.ingredients.trim() || null,
      instructions: draft.instructions.trim() || null,
    };
    /* oxlint-enable typescript/prefer-nullish-coalescing */
  })
  .handler(async ({ data: { url, name, description, imageUrl, ingredients, instructions } }) => {
    const existingId = url === null ? null : await findRecipeIdByUrl(url);
    if (existingId !== null) {
      return existingId;
    }

    const { meta } = await db
      .prepare(
        "INSERT INTO recipes (url, name, description, image_url, ingredients, instructions) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .bind(url, name, description, imageUrl, ingredients, instructions)
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

export const deleteRecipe = createServerFn({ method: "POST" })
  .validator((id: number) => id)
  .handler(async ({ data: id }) => {
    await db.prepare("DELETE FROM recipes WHERE id = ?").bind(id).run();
  });
