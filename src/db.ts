import { env } from "cloudflare:workers";

export interface Recipe {
  id: number;
  created_at: string;
  url: string;
  name: string | null;
  description: string | null;
  image_url: string | null;
  ingredients: string | null;
  instructions: string | null;
  adjustments: string | null;
  pinned: boolean;
}

export const db = env.DB;

export async function query<T>(sql: string, ...args: unknown[]): Promise<T[]> {
  const { results } = await db
    .prepare(sql)
    .bind(...args)
    .all<T>();
  return results;
}
