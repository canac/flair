import { page } from "fresh";
import { connect, query, type Recipe } from "@/db.ts";
import { define } from "@/utils.ts";
import { invariant } from "@/invariant.ts";
import AdjustmentsEditor from "@/islands/AdjustmentsEditor/AdjustmentsEditor.tsx";
import "./[id].css";

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
    <div class="page-narrow">
      <a href="/" class="back-link">&larr; Back to recipes</a>
      <h1 class="recipe-title">
        <a
          href={recipe.url}
          target="_blank"
          rel="noopener noreferrer"
          class="recipe-title-link"
        >
          {recipe.name ?? recipe.url}
        </a>
      </h1>
      {recipe.image_url && (
        <img src={recipe.image_url} alt="" class="recipe-hero-image" />
      )}
      <h2 class="section-title">Adjustments</h2>
      <AdjustmentsEditor
        recipeId={recipe.id}
        adjustments={recipe.adjustments}
      />
    </div>
  );
});
