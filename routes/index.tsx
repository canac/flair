import { define } from "@/utils.ts";
import { query, type Recipe } from "@/db.ts";
import RecipeSearch from "@/islands/RecipeSearch/RecipeSearch.tsx";
import "./index.css";

export default define.page(async function Home(ctx) {
  const searchQuery = ctx.url.searchParams.get("q")?.trim() ?? "";
  const recipes = searchQuery
    ? await query<Recipe>({
      sql:
        "SELECT id, name, url, image_url FROM recipes WHERE name LIKE ? ORDER BY created_at DESC",
      args: [`%${searchQuery}%`],
    })
    : await query<Recipe>(
      "SELECT id, name, url, image_url FROM recipes ORDER BY created_at DESC",
    );

  return (
    <div class="page">
      <h1 class="page-title">Recipes</h1>
      <div class="search-form">
        <RecipeSearch initialQuery={searchQuery} />
      </div>
      <form method="POST" action="/recipes" class="add-form">
        <input
          type="url"
          name="url"
          required
          placeholder="Paste a recipe URL..."
          class="url-input"
        />
        <button type="submit" class="btn btn-primary">Add</button>
      </form>
      <ul class="recipe-grid">
        {recipes.map((recipe) => (
          <li>
            <a href={`/recipes/${recipe.id}`} class="recipe-card">
              {recipe.image_url
                ? (
                  <img
                    src={recipe.image_url}
                    alt=""
                    class="recipe-card-image"
                  />
                )
                : <div class="recipe-card-image-placeholder" />}
              <div class="recipe-card-body">
                <div class="recipe-card-title">
                  {recipe.name ?? recipe.url}
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
});
