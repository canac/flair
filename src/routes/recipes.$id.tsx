import { createFileRoute, useRouter } from "@tanstack/react-router";
import AdjustmentsEditor from "@/components/AdjustmentsEditor/AdjustmentsEditor.tsx";
import { getRecipe, togglePin } from "@/recipes.ts";
import recipeCss from "./recipes.$id.css?url";

export const Route = createFileRoute("/recipes/$id")({
  loader: ({ params }) => getRecipe({ data: Number(params.id) }),
  head: ({ loaderData }) => ({
    meta: [{ title: `Flair | ${loaderData?.name ?? loaderData?.url}` }],
    links: [{ rel: "stylesheet", href: recipeCss }],
  }),
  component: RecipePage,
});

function parseList(value: string | null): string[] {
  if (!value) {
    return [];
  }
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);
}

function RecipePage() {
  const recipe = Route.useLoaderData();
  const router = useRouter();
  const ingredients = parseList(recipe.ingredients);
  const instructions = parseList(recipe.instructions);

  return (
    <div className="page page-narrow">
      <div className="recipe-toolbar">
        <h1 style={{ viewTransitionName: `vt-title-${recipe.id}` }}>
          <a
            href={recipe.url}
            target="_blank"
            rel="noopener noreferrer"
            className="recipe-title-link"
          >
            {recipe.name ?? recipe.url}
          </a>
        </h1>
        <form
          action={async () => {
            await togglePin({ data: recipe.id });
            await router.invalidate();
          }}
        >
          <button
            type="submit"
            className="pin-button"
            aria-label={recipe.pinned ? "Unpin recipe" : "Pin recipe"}
            title={recipe.pinned ? "Unpin recipe" : "Pin recipe"}
          >
            <span className={`pin-icon ${recipe.pinned ? "filled" : ""}`} />
          </button>
        </form>
      </div>
      {recipe.image_url && (
        <a href={recipe.url} target="_blank" rel="noopener noreferrer">
          <img
            src={recipe.image_url}
            alt=""
            className="recipe-hero-image"
            style={{ viewTransitionName: `vt-img-${recipe.id}` }}
          />
        </a>
      )}
      {recipe.description && <p className="recipe-description">{recipe.description}</p>}
      {ingredients.length > 0 && (
        <>
          <h2>Ingredients</h2>
          <ul className="checklist">
            {ingredients.map((ingredient, index) => (
              <li key={index}>
                <label>
                  <input type="checkbox" />
                  <span>{ingredient}</span>
                </label>
              </li>
            ))}
          </ul>
        </>
      )}
      {instructions.length > 0 && (
        <>
          <h2>Instructions</h2>
          <ol className="checklist">
            {instructions.map((step, index) => (
              <li key={index}>
                <label>
                  <input type="checkbox" />
                  <span>{step}</span>
                </label>
              </li>
            ))}
          </ol>
        </>
      )}
      <AdjustmentsEditor recipeId={recipe.id} adjustments={recipe.adjustments} />
    </div>
  );
}
