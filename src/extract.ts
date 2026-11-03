import { parse } from "@lukeed/html";

interface RecipeStructuredData {
  name: string | null;
  description: string | null;
  imageUrl: string | null;
  ingredients: string[];
  instructions: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function* extractRecipeNodes(node: unknown): Generator<Record<string, unknown>> {
  if (Array.isArray(node)) {
    for (const item of node) {
      yield* extractRecipeNodes(item);
    }
    return;
  }

  if (!isRecord(node)) {
    return;
  }

  const type = node["@type"];
  const types = Array.isArray(type) ? type : [type];
  if (types.includes("Recipe")) {
    yield node;
  }
  if (Array.isArray(node["@graph"])) {
    yield* extractRecipeNodes(node["@graph"]);
  }
}

function decodeEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, codePoint: string) => String.fromCodePoint(Number(codePoint)))
    .replace(/&#x([0-9a-f]+);/gi, (_, codePoint: string) =>
      String.fromCodePoint(parseInt(codePoint, 16)),
    );
}

function parseInstructions(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const steps: string[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) {
      continue;
    }

    if (entry["@type"] === "HowToSection") {
      steps.push(...parseInstructions(entry.itemListElement));
    } else if (typeof entry.text === "string") {
      steps.push(entry.text);
    }
  }
  return steps;
}

/**
 * Fetch a recipe page and extract its data, throwing if the request fails
 */
export async function fetchRecipeData(url: string): Promise<RecipeStructuredData> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; Flair/1.0)",
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return extractRecipeData(await res.text());
}

export function extractRecipeData(html: string): RecipeStructuredData {
  const doc = parse(html);

  // Empty scraped strings should fall through to the next source
  /* oxlint-disable typescript/prefer-nullish-coalescing */
  const name =
    doc.find('meta[property="og:title"]')?.getAttr("content") ||
    doc.find("title")?.text.trim() ||
    null;
  const description =
    doc.find('meta[property="og:description"]')?.getAttr("content") ||
    doc.find('meta[name="description"]')?.getAttr("content") ||
    null;
  /* oxlint-enable typescript/prefer-nullish-coalescing */
  const imageUrl = doc.find('meta[property="og:image"]')?.getAttr("content") ?? null;

  const nodes = doc.all('script[type="application/ld+json"]').flatMap((element) => {
    if (!element.text.trim()) {
      return [];
    }

    try {
      return [...extractRecipeNodes(JSON.parse(element.text))];
    } catch {
      // ignore invalid JSON-LD blocks
      return [];
    }
  });

  const recipe = nodes[0];
  const ingredients = Array.isArray(recipe?.recipeIngredient)
    ? recipe.recipeIngredient.filter((item) => typeof item === "string").map(decodeEntities)
    : [];
  const instructions = parseInstructions(recipe?.recipeInstructions).map(decodeEntities);

  return { name, description, imageUrl, ingredients, instructions };
}
