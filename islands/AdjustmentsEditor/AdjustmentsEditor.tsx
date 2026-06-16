import { useState } from "preact/hooks";
import SubmitButton from "@/islands/SubmitButton/SubmitButton.tsx";
import "./AdjustmentsEditor.css";

type AdjustmentsEditorProps = {
  recipeId: number;
  adjustments: string | null;
};

export default function AdjustmentsEditor(
  { recipeId, adjustments }: AdjustmentsEditorProps,
) {
  const [editing, setEditing] = useState(false);
  const text = adjustments ?? "";
  const adjustmentLines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (editing) {
    return (
      <>
        <h2>Adjustments</h2>
        <form method="POST" action={`/recipes/${recipeId}`} class="edit-form">
          <textarea
            name="adjustments"
            rows={8}
            class="adjustments-textarea"
            defaultValue={text}
          />
          <div class="edit-actions">
            <SubmitButton class="btn-primary">Save</SubmitButton>
            <button
              type="button"
              onClick={() => setEditing(false)}
              class="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </>
    );
  }

  return (
    <>
      <div class="adjustments-header">
        <h2>Adjustments</h2>
        <button
          type="button"
          onClick={() => setEditing(true)}
          class="btn-secondary"
        >
          Edit
        </button>
      </div>
      {adjustmentLines.length > 0
        ? (
          <ul class="checklist">
            {adjustmentLines.map((line, index) => (
              <li key={index}>
                <label>
                  <input type="checkbox" />
                  <span>{line}</span>
                </label>
              </li>
            ))}
          </ul>
        )
        : <p class="adjustments-empty">No adjustments yet.</p>}
    </>
  );
}
