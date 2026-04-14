import { useState } from "preact/hooks";
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
        <h2 class="section-title">Adjustments</h2>
        <form method="POST" action={`/recipes/${recipeId}`} class="edit-form">
          <textarea
            name="adjustments"
            rows={8}
            class="adjustments-textarea"
            value={text}
          />
          <div class="edit-actions">
            <button type="submit" class="btn btn-primary">Save</button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              class="btn btn-secondary"
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
        <h2 class="section-title">Adjustments</h2>
        <button
          type="button"
          onClick={() => setEditing(true)}
          class="btn btn-secondary"
        >
          Edit
        </button>
      </div>
      {adjustmentLines.length > 0
        ? (
          <ul class="adjustments-list">
            {adjustmentLines.map((line, index) => <li key={index}>{line}</li>)}
          </ul>
        )
        : <p class="adjustments-empty">No adjustments yet.</p>}
    </>
  );
}
