INSERT INTO categories (name, slug, emoji, color) VALUES
  ('Tech',         'tech',         '💻', '#3b82f6'),
  ('Networking',   'networking',   '🤝', '#7c3aed'),
  ('Cultural',     'cultural',     '🎭', '#f97316'),
  ('Music',        'music',        '🎵', '#f43f5e'),
  ('Creative',     'creative',     '🎨', '#10b981'),
  ('Food & Drink', 'food-drink',   '🍜', '#f59e0b')
ON CONFLICT (slug) DO NOTHING;
