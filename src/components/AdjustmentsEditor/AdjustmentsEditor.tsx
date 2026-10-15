import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import SubmitButton from "@/components/SubmitButton/SubmitButton.tsx";
import { saveAdjustments } from "@/recipes.ts";
import adjustmentsEditorCss from "./AdjustmentsEditor.css?url";

interface AdjustmentsEditorProps {
  recipeId: number;
  adjustments: string | null;
}

export default function AdjustmentsEditor({ recipeId, adjustments }: AdjustmentsEditorProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const text = adjustments ?? "";
  const adjustmentLines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (editing) {
    return (
      <>
        <link rel="stylesheet" href={adjustmentsEditorCss} precedence="default" />
        <h2>Adjustments</h2>
        <form
          action={async (form) => {
            const adjustments = form.get("adjustments");
            if (typeof adjustments !== "string") {
              return;
            }

            await saveAdjustments({ data: { id: recipeId, adjustments } });
            await router.invalidate();
            setEditing(false);
          }}
          className="edit-form"
        >
          <textarea
            name="adjustments"
            rows={8}
            className="adjustments-textarea"
            defaultValue={text}
          />
          <div className="edit-actions">
            <SubmitButton className="btn-primary">Save</SubmitButton>
            <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </>
    );
  }

  return (
    <>
      <link rel="stylesheet" href={adjustmentsEditorCss} precedence="default" />
      <div className="adjustments-header">
        <h2>Adjustments</h2>
        <button type="button" onClick={() => setEditing(true)} className="btn-secondary">
          Edit
        </button>
      </div>
      {adjustmentLines.length > 0 ? (
        <ul className="checklist">
          {adjustmentLines.map((line, index) => (
            <li key={index}>
              <label>
                <input type="checkbox" />
                <span>{line}</span>
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <p className="adjustments-empty">No adjustments yet.</p>
      )}
    </>
  );
}
