import { type Client, createClient } from "@libsql/client";

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
