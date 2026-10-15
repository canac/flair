import * as cheerio from "cheerio/slim";

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

export function extractRecipeData(html: string): RecipeStructuredData {
  const $ = cheerio.load(html);

  // Empty scraped strings should fall through to the next source
  /* oxlint-disable typescript/prefer-nullish-coalescing */
  const name = $('meta[property="og:title"]').attr("content") || $("title").text().trim() || null;
  const description =
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="description"]').attr("content") ||
    null;
  /* oxlint-enable typescript/prefer-nullish-coalescing */
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
    ? recipe.recipeIngredient.filter((item) => typeof item === "string").map(decodeEntities)
    : [];
  const instructions = parseInstructions(recipe?.recipeInstructions).map(decodeEntities);

  return { name, description, imageUrl, ingredients, instructions };
}
