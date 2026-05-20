INSERT INTO categories (name, slug, emoji, color) VALUES
  ('Chendu Special', 'chendu-special', '🎉', '#ec4899')
ON CONFLICT (slug) DO NOTHING;
