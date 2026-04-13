import { type Client, createClient, type InStatement } from "@libsql/client";

export type Recipe = {
  id: number;
  url: string;
  name: string | null;
  image_url: string | null;
  adjustments: string | null;
  created_at: string;
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
    clientPromise = client.execute(`
      CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        name TEXT,
        image_url TEXT,
        adjustments TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).then(() => client);
  }
  return clientPromise;
}

export async function query<T>(statement: InStatement): Promise<T[]> {
  const client = await connect();
  const result = await client.execute(statement);
  return result.rows as unknown as T[];
}
