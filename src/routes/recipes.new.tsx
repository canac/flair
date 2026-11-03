import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { startTransition, useRef, useState } from "react";
import { requestFormReset } from "react-dom";
import SubmitButton from "@/components/SubmitButton/SubmitButton.tsx";
import { createRecipe, importRecipe, type RecipeDraft } from "@/recipes.ts";
import newRecipeCss from "./recipes.new.css?url";

export const Route = createFileRoute("/recipes/new")({
  head: () => ({
    meta: [{ title: "Flair | New recipe" }],
    links: [{ rel: "stylesheet", href: newRecipeCss }],
  }),
  component: NewRecipe,
});

function NewRecipe() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [draft, setDraft] = useState<RecipeDraft | null>(null);
  const recipeForm = useRef<HTMLFormElement>(null);
  const [existingId, setExistingId] = useState<number | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  return (
    <div className="page page-narrow">
      <h1>New recipe</h1>
      <form
        action={async () => {
          setExistingId(null);
          setImportError(null);
          try {
            const result = await importRecipe({ data: url });
            if ("existingId" in result) {
              setExistingId(result.existingId);
              return;
            }

            startTransition(() => {
              setDraft(result.draft);
              setUrl(result.draft.url);
              if (recipeForm.current) {
                requestFormReset(recipeForm.current);
              }
            });
          } catch (error) {
            setImportError(`Import failed${error instanceof Error ? `: ${error.message}` : ""}`);
          }
        }}
        className="import-form"
      >
        <label htmlFor="recipe-url">URL (optional)</label>
        <div className="import-row">
          <input
            id="recipe-url"
            type="url"
            required
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Paste a recipe URL to import it..."
          />
          <SubmitButton className="btn-secondary">Import</SubmitButton>
        </div>
        {existingId !== null && (
          <p className="import-message">
            This recipe is already saved.{" "}
            <Link to="/recipes/$id" params={{ id: String(existingId) }}>
              View it
            </Link>
          </p>
        )}
        {importError && <p className="import-message import-error">{importError}</p>}
      </form>
      <form
        ref={recipeForm}
        action={async (form) => {
          const field = (name: string) => {
            const value = form.get(name);
            return typeof value === "string" ? value : "";
          };
          const id = await createRecipe({
            data: {
              url,
              name: field("name"),
              description: field("description"),
              imageUrl: draft?.imageUrl ?? "",
              ingredients: field("ingredients"),
              instructions: field("instructions"),
            },
          });
          await navigate({ to: "/recipes/$id", params: { id: String(id) } });
        }}
        className="recipe-form"
      >
        <label>
          Name
          <input name="name" required defaultValue={draft?.name} />
        </label>
        <label>
          Description
          <textarea name="description" rows={3} defaultValue={draft?.description} />
        </label>
        {draft?.imageUrl && <img src={draft.imageUrl} alt="" className="recipe-preview-image" />}
        <label>
          Ingredients
          <textarea
            name="ingredients"
            rows={8}
            placeholder="One per line"
            defaultValue={draft?.ingredients}
          />
        </label>
        <label>
          Instructions
          <textarea
            name="instructions"
            rows={8}
            placeholder="One per line"
            defaultValue={draft?.instructions}
          />
        </label>
        <div className="recipe-form-actions">
          <SubmitButton className="btn-primary">Save</SubmitButton>
          <Link to="/" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
