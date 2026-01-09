-- Add stats column to hero_settings table for dynamic stats cards
ALTER TABLE hero_settings 
ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '[
  {"value": "10K+", "label": "Happy Customers", "icon": "users"},
  {"value": "500+", "label": "Products", "icon": "package"},
  {"value": "4.9", "label": "Rating", "icon": "star"}
]'::jsonb;

-- Update existing records to have default stats if null
UPDATE hero_settings 
SET stats = '[
  {"value": "10K+", "label": "Happy Customers", "icon": "users"},
  {"value": "500+", "label": "Products", "icon": "package"},
  {"value": "4.9", "label": "Rating", "icon": "star"}
]'::jsonb
WHERE stats IS NULL;
