/**
 * Strip query params from a recipe URL
 */
export function sanitizeUrl(input: string): string {
  const parsed = new URL(input);
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString();
}
