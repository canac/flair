import { define } from "../utils.ts";
import { query, type Recipe } from "../db.ts";

export default define.page(async function Home() {
  const recipes = await query<Recipe>(
    "SELECT id, name, url, image_url FROM recipes ORDER BY created_at DESC",
  );

  return (
    <div class="px-4 py-8 mx-auto max-w-screen-md">
      <h1 class="text-4xl font-bold my-4">Recipes</h1>
      <form method="POST" action="/recipes" class="flex gap-2 my-6">
        <input
          type="url"
          name="url"
          required
          placeholder="https://..."
          class="border-2 border-gray-500 rounded-sm px-2 py-1 flex-1"
        />
        <button
          type="submit"
          class="border-2 border-gray-500 rounded-sm px-2 py-1 bg-white hover:bg-gray-200"
        >
          Add
        </button>
      </form>
      <ul class="flex flex-col gap-4">
        {recipes.map((recipe) => (
          <li class="flex gap-4 items-center">
            {recipe.image_url && (
              <img
                src={recipe.image_url}
                alt=""
                width={80}
                height={80}
                style={{ objectFit: "cover" }}
              />
            )}
            <a href={`/recipes/${recipe.id}`}>{recipe.name ?? recipe.url}</a>
          </li>
        ))}
      </ul>
    </div>
  );
});
