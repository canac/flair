import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useId, useState } from "react";
import { listRecipes } from "@/recipes.ts";
import searchBoxCss from "./SearchBox.css?url";

type Result = Awaited<ReturnType<typeof listRecipes>>[number];

export default function SearchBox({
  className,
  defaultValue,
  onSearch,
}: {
  className?: string;
  defaultValue?: string;
  onSearch: (query: string) => void;
}) {
  const navigate = useNavigate();
  const listboxId = useId();
  const [query, setQuery] = useState(defaultValue ?? "");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const trimmed = query.trim();
    let stale = false;
    const timeout = setTimeout(async () => {
      if (!trimmed) {
        return;
      }
      const matches = await listRecipes({ data: trimmed });
      if (!stale) {
        setResults(matches.slice(0, 5));
        setActiveIndex(-1);
      }
    }, 150);
    return () => {
      stale = true;
      clearTimeout(timeout);
    };
  }, [query]);

  const expanded = open && query.trim() !== "" && results.length > 0;

  return (
    <form
      className={className ? `search-box ${className}` : "search-box"}
      onSubmit={(event) => {
        event.preventDefault();
        setOpen(false);
        onSearch(query.trim());
      }}
    >
      <link rel="stylesheet" href={searchBoxCss} precedence="default" />
      <input
        type="search"
        name="q"
        value={query}
        placeholder="Search recipes by name..."
        autoComplete="off"
        role="combobox"
        aria-expanded={expanded}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          expanded && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined
        }
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            if (expanded) {
              event.preventDefault();
            }
            setOpen(false);
          } else if (!expanded) {
            if (event.key === "ArrowDown") {
              setOpen(true);
            }
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) => (index + 1) % results.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => (index <= 0 ? results.length : index) - 1);
          } else if (event.key === "Enter" && results[activeIndex]) {
            event.preventDefault();
            setOpen(false);
            void navigate({
              to: "/recipes/$id",
              params: { id: String(results[activeIndex].id) },
            });
          }
        }}
      />
      {expanded && (
        <ul id={listboxId} role="listbox" className="search-dropdown">
          {results.map((recipe, index) => (
            <li
              key={recipe.id}
              id={`${listboxId}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
            >
              <Link
                to="/recipes/$id"
                params={{ id: String(recipe.id) }}
                className="search-option"
                tabIndex={-1}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => setOpen(false)}
              >
                {recipe.image_url ? (
                  <img src={recipe.image_url} alt="" className="search-option-image" />
                ) : (
                  <div className="search-option-image search-option-image-placeholder" />
                )}
                <span className="search-option-name">{recipe.name ?? recipe.url}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
