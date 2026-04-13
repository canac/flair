import { page } from "fresh";
import { connect, query, type Recipe } from "@/db.ts";
import { define } from "@/utils.ts";
import { invariant } from "@/invariant.ts";
import AdjustmentsEditor from "@/islands/AdjustmentsEditor.tsx";

export const handler = define.handlers({
  async GET(ctx) {
    invariant(typeof ctx.params.id === "string");

    const [recipe] = await query<Recipe>({
      sql:
        "SELECT id, url, name, image_url, adjustments FROM recipes WHERE id = ?",
      args: [ctx.params.id],
    });
    if (!recipe) {
      return new Response("Not found", { status: 404 });
    }

    return page({ recipe });
  },
  async POST(ctx) {
    invariant(typeof ctx.params.id === "string");

    const form = await ctx.req.formData();
    const adjustments = form.get("adjustments");
    if (typeof adjustments !== "string") {
      return new Response("Missing adjustments", { status: 400 });
    }

    const db = await connect();
    await db.execute({
      sql: "UPDATE recipes SET adjustments = ? WHERE id = ?",
      args: [adjustments, ctx.params.id],
    });
    return new Response(null, {
      status: 303,
      headers: { Location: `/recipes/${ctx.params.id}` },
    });
  },
});

export default define.page<typeof handler>(function RecipePage({ data }) {
  const { recipe } = data;

  return (
    <div class="px-4 py-8 mx-auto max-w-screen-md">
      <header class="flex items-center justify-between my-4">
        <a href="/" class="text-blue-600 hover:underline">&larr; Back</a>
        <h1 class="text-2xl font-bold">Recipe</h1>
      </header>

      <h2 class="text-3xl font-bold my-4">
        {recipe.name ?? recipe.url}
      </h2>

      {recipe.image_url && (
        <img
          src={recipe.image_url}
          alt=""
          class="my-4"
          style={{ maxWidth: "100%", objectFit: "cover" }}
        />
      )}

      <h3 class="text-xl font-semibold mt-6 mb-2">Adjustments</h3>
      <AdjustmentsEditor
        recipeId={recipe.id}
        adjustments={recipe.adjustments}
      />
    </div>
  );
});
