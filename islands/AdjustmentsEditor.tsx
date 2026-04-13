import { useState } from "preact/hooks";

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
      <form
        method="POST"
        action={`/recipes/${recipeId}`}
        class="flex flex-col gap-2"
      >
        <textarea
          name="adjustments"
          rows={8}
          class="border-2 border-gray-500 rounded-sm px-2 py-1 w-full"
          value={text}
        />
        <div class="flex gap-2">
          <button
            type="submit"
            class="border-2 border-gray-500 rounded-sm px-2 py-1 bg-white hover:bg-gray-200"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            class="border-2 border-gray-500 rounded-sm px-2 py-1 bg-white hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <>
      {adjustmentLines.length > 0
        ? (
          <ul class="list-disc pl-6 flex flex-col gap-1">
            {adjustmentLines.map((line, index) => <li key={index}>{line}</li>)}
          </ul>
        )
        : <p class="text-gray-500 italic">No adjustments yet.</p>}
      <button
        type="button"
        onClick={() => setEditing(true)}
        class="inline-block mt-4 border-2 border-gray-500 rounded-sm px-2 py-1 bg-white hover:bg-gray-200"
      >
        Edit
      </button>
    </>
  );
}
