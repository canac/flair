import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import SearchBox from "@/components/SearchBox/SearchBox.tsx";
import { listRecipes } from "@/recipes.ts";
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
  const { q: search } = Route.useSearch();
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="home-header">
        <h1>Recipes</h1>
        <Link to="/recipes/new" className="btn-primary">
          Add recipe
        </Link>
      </div>
      <SearchBox
        className="search-form"
        defaultValue={search}
        onSearch={(query) => void navigate({ to: "/", search: { q: query || undefined } })}
      />
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
