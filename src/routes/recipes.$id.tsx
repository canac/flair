import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useOptimistic, useRef } from "react";
import AdjustmentsEditor from "@/components/AdjustmentsEditor/AdjustmentsEditor.tsx";
import SubmitButton from "@/components/SubmitButton/SubmitButton.tsx";
import { deleteRecipe, getRecipe, togglePin } from "@/recipes.ts";
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
  const navigate = useNavigate();
  const deleteDialog = useRef<HTMLDialogElement>(null);
  const [pinned, setOptimisticPinned] = useOptimistic(recipe.pinned);
  const ingredients = parseList(recipe.ingredients);
  const instructions = parseList(recipe.instructions);

  return (
    <div className="page page-narrow">
      <div className="recipe-toolbar">
        <h1 style={{ viewTransitionName: `vt-title-${recipe.id}` }}>
          {recipe.url ? (
            <a
              href={recipe.url}
              target="_blank"
              rel="noopener noreferrer"
              className="recipe-title-link"
            >
              {recipe.name ?? recipe.url}
            </a>
          ) : (
            recipe.name
          )}
        </h1>
        <form
          action={async () => {
            setOptimisticPinned(!pinned);
            await togglePin({ data: recipe.id });
            await router.invalidate();
          }}
        >
          <button
            type="submit"
            className="pin-button"
            aria-label={pinned ? "Unpin recipe" : "Pin recipe"}
            title={pinned ? "Unpin recipe" : "Pin recipe"}
          >
            <span className={`pin-icon ${pinned ? "filled" : ""}`} />
          </button>
        </form>
      </div>
      {recipe.image_url &&
        (recipe.url ? (
          <a href={recipe.url} target="_blank" rel="noopener noreferrer">
            <img
              src={recipe.image_url}
              alt=""
              className="recipe-hero-image"
              style={{ viewTransitionName: `vt-img-${recipe.id}` }}
            />
          </a>
        ) : (
          <img
            src={recipe.image_url}
            alt=""
            className="recipe-hero-image"
            style={{ viewTransitionName: `vt-img-${recipe.id}` }}
          />
        ))}
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
      <button
        type="button"
        className="btn-danger delete-recipe-button"
        onClick={() => deleteDialog.current?.showModal()}
      >
        Delete recipe
      </button>
      <dialog ref={deleteDialog} className="delete-dialog" closedby="any">
        <form
          action={async () => {
            await deleteRecipe({ data: recipe.id });
            await navigate({ to: "/" });
          }}
        >
          <h2>Delete this recipe?</h2>
          <p>Are you sure you want to permanently delete this recipe?</p>
          <div className="delete-dialog-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => deleteDialog.current?.close()}
            >
              Cancel
            </button>
            <SubmitButton className="btn-danger">Delete</SubmitButton>
          </div>
        </form>
      </dialog>
    </div>
  );
}
