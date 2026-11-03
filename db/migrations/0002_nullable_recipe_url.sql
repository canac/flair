-- void:allow-destructive
-- Rebuild the table because SQLite can't drop NOT NULL from url in place
CREATE TABLE recipes_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  url TEXT,
  name TEXT,
  description TEXT,
  image_url TEXT,
  ingredients TEXT,
  instructions TEXT,
  adjustments TEXT,
  pinned_at TEXT
);

INSERT INTO recipes_new (id, created_at, url, name, description, image_url, ingredients, instructions, adjustments, pinned_at)
SELECT id, created_at, url, name, description, image_url, ingredients, instructions, adjustments, pinned_at FROM recipes;

DROP TABLE recipes;

ALTER TABLE recipes_new RENAME TO recipes;

CREATE UNIQUE INDEX recipes_url_unique ON recipes (url);
