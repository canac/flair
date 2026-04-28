import { useMemo, useState } from "preact/hooks";
import { debounce } from "@std/async/debounce";

type RecipeSearchProps = {
  initialQuery: string;
};

export default function RecipeSearch({ initialQuery }: RecipeSearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const navigateToQuery = useMemo(() =>
    debounce((nextQuery: string) => {
      const url = new URL(globalThis.location.href);
      if (nextQuery) {
        url.searchParams.set("q", nextQuery);
      } else {
        url.searchParams.delete("q");
      }
      globalThis.location.assign(url.toString());
    }, 1000), []);

  return (
    <input
      type="search"
      name="q"
      value={searchQuery}
      onInput={(event) => {
        const nextQuery = (event.target as HTMLInputElement).value;
        setSearchQuery(nextQuery);
        navigateToQuery(nextQuery);
      }}
      placeholder="Search recipes by name..."
    />
  );
}
