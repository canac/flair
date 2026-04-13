import { define } from "@/utils.ts";
import { query, type Recipe } from "@/db.ts";
import "./index.css";

export default define.page(async function Home() {
  const recipes = await query<Recipe>(
    "SELECT id, name, url, image_url FROM recipes ORDER BY created_at DESC",
  );

  return (
    <div class="page">
      <h1 class="page-title">Recipes</h1>
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
