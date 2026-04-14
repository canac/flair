import * as cheerio from "cheerio";

type RecipeStructuredData = {
  name: string | null;
  description: string | null;
  imageUrl: string | null;
  ingredients: string[];
  instructions: string[];
};

function* extractRecipeNodes(
  node: unknown,
): Generator<Record<string, unknown>> {
  if (Array.isArray(node)) {
    for (const item of node) {
      yield* extractRecipeNodes(item);
    }
    return;
  }

  if (!node || typeof node !== "object") {
    return;
  }

  const obj = node as Record<string, unknown>;
  const type = obj["@type"];
  const types = Array.isArray(type) ? type : [type];
  if (types.includes("Recipe")) {
    yield obj;
  }
  if (Array.isArray(obj["@graph"])) {
    yield* extractRecipeNodes(obj["@graph"]);
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
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(
      /&#x([0-9a-f]+);/gi,
      (_, n) => String.fromCodePoint(parseInt(n, 16)),
    );
}

function parseInstructions(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const steps: string[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const obj = entry as Record<string, unknown>;
    if (obj["@type"] === "HowToSection") {
      steps.push(...parseInstructions(obj.itemListElement));
    } else if (typeof obj.text === "string") {
      steps.push(obj.text);
    }
  }
  return steps;
}

export function extractRecipeData(html: string): RecipeStructuredData {
  const $ = cheerio.load(html);

  const name = $('meta[property="og:title"]').attr("content") ||
    $("title").text().trim() || null;
  const description = $('meta[property="og:description"]').attr("content") ||
    $('meta[name="description"]').attr("content") || null;
  const imageUrl = $('meta[property="og:image"]').attr("content") ?? null;

  const nodes: Record<string, unknown>[] = [];
  $('script[type="application/ld+json"]').each((_, element) => {
    const raw = $(element).contents().text();
    if (!raw.trim()) {
      return;
    }

    try {
      nodes.push(...extractRecipeNodes(JSON.parse(raw)));
    } catch {
      // ignore invalid JSON-LD blocks
    }
  });

  const recipe = nodes[0];
  const ingredients = Array.isArray(recipe?.recipeIngredient)
    ? recipe.recipeIngredient
      .filter((item) => typeof item === "string")
      .map(decodeEntities)
    : [];
  const instructions = parseInstructions(recipe?.recipeInstructions)
    .map(decodeEntities);

  return { name, description, imageUrl, ingredients, instructions };
}
