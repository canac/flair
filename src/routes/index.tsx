import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import SubmitButton from "@/components/SubmitButton/SubmitButton.tsx";
import { addRecipe, listRecipes } from "@/recipes.ts";
import indexCss from "./index.css?url";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: typeof search.q === "string" && search.q.trim() ? search.q.trim() : undefined,
  }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: ({ deps }) => listRecipes({ data: deps.q ?? "" }),
  head: () => ({
    meta: [{ title: "Flair | Recipes" }],
    links: [{ rel: "stylesheet", href: indexCss }],
  }),
  component: Home,
});

function Home() {
  const recipes = Route.useLoaderData();
  const { q } = Route.useSearch();
  const navigate = useNavigate();

  return (
    <div className="page">
      <h1>Recipes</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const query = new FormData(event.currentTarget).get("q");
          void navigate({ to: "/", search: { q: typeof query === "string" ? query : undefined } });
        }}
      >
        <input type="search" name="q" defaultValue={q} placeholder="Search recipes by name..." />
      </form>
      <form
        action={async (form) => {
          const url = form.get("url");
          if (typeof url !== "string") {
            return;
          }

          const id = await addRecipe({ data: url });
          await navigate({ to: "/recipes/$id", params: { id: String(id) } });
        }}
        className="add-form"
      >
        <input type="url" name="url" required placeholder="Paste a recipe URL..." />
        <SubmitButton className="btn-primary">Add</SubmitButton>
      </form>
      <ul className="recipe-grid">
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            <Link to="/recipes/$id" params={{ id: String(recipe.id) }} className="recipe-card">
              {recipe.image_url ? (
                <img
                  src={recipe.image_url}
                  alt=""
                  className="recipe-card-image"
                  style={{ viewTransitionName: `vt-img-${recipe.id}` }}
                />
              ) : (
                <div className="recipe-card-image-placeholder" />
              )}
              <div className="recipe-card-body">
                <div
                  className="recipe-card-title"
                  style={{ viewTransitionName: `vt-title-${recipe.id}` }}
                >
                  {recipe.name ?? recipe.url}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
