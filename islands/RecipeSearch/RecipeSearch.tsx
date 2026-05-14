type RecipeSearchProps = {
  initialQuery: string;
};

export default function RecipeSearch({ initialQuery }: RecipeSearchProps) {
  return (
    <form method="GET">
      <input
        type="search"
        name="q"
        defaultValue={initialQuery}
        placeholder="Search recipes by name..."
      />
    </form>
  );
}
