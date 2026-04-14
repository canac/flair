import { type Client, createClient, type InStatement } from "@libsql/client";

export type Recipe = {
  id: number;
  created_at: string;
  url: string;
  name: string | null;
  image_url: string | null;
  ingredients: string | null;
  instructions: string | null;
  adjustments: string | null;
};

let clientPromise: Promise<Client> | null = null;

export function connect(): Promise<Client> {
  if (!clientPromise) {
    const url = Deno.env.get("TURSO_URL");
    const authToken = Deno.env.get("TURSO_AUTH_TOKEN");

    if (!url) {
      throw new Error("TURSO_URL is not set");
    }

    const client = createClient({ url, authToken });
    clientPromise = client.batch([
      `CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        url TEXT NOT NULL,
        name TEXT,
        image_url TEXT,
        ingredients TEXT,
        instructions TEXT,
        adjustments TEXT
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS recipes_url_unique ON recipes (url)`,
    ]).then(() => client);
  }
  return clientPromise;
}

export async function query<T>(statement: InStatement): Promise<T[]> {
  const client = await connect();
  const result = await client.execute(statement);
  return result.rows as unknown as T[];
}
