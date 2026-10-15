CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  url TEXT NOT NULL,
  name TEXT,
  description TEXT,
  image_url TEXT,
  ingredients TEXT,
  instructions TEXT,
  adjustments TEXT,
  pinned_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS recipes_url_unique ON recipes (url);
