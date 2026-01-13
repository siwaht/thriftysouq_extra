/*
  # Add Footer Management Tables

  1. New Tables
    - `footer_sections`
      - `id` (uuid, primary key)
      - `title` (text) - Section title like "Support", "Company", etc.
      - `display_order` (integer) - Order to display sections
      - `is_active` (boolean) - Whether section is visible
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `footer_links`
      - `id` (uuid, primary key)
      - `section_id` (uuid, foreign key to footer_sections)
      - `label` (text) - Link text
      - `url` (text) - Link URL
      - `display_order` (integer) - Order within section
      - `is_active` (boolean) - Whether link is visible
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Allow public access for all operations
*/

-- Create footer_sections table
CREATE TABLE IF NOT EXISTS footer_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create footer_links table
CREATE TABLE IF NOT EXISTS footer_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid REFERENCES footer_sections(id) ON DELETE CASCADE,
  label text NOT NULL,
  url text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE footer_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_links ENABLE ROW LEVEL SECURITY;

-- Public can read active footer sections
CREATE POLICY "Public can read footer sections"
  ON footer_sections FOR SELECT
  TO public
  USING (true);

-- Public can read active footer links
CREATE POLICY "Public can read footer links"
  ON footer_links FOR SELECT
  TO public
  USING (true);

-- Public can manage footer sections
CREATE POLICY "Public can insert footer sections"
  ON footer_sections FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update footer sections"
  ON footer_sections FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Public can delete footer sections"
  ON footer_sections FOR DELETE
  TO public
  USING (true);

-- Public can manage footer links
CREATE POLICY "Public can insert footer links"
  ON footer_links FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update footer links"
  ON footer_links FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Public can delete footer links"
  ON footer_links FOR DELETE
  TO public
  USING (true);

-- Insert default footer data
INSERT INTO footer_sections (title, display_order, is_active) VALUES
  ('Shop', 1, true),
  ('Company', 2, true),
  ('Support', 3, true),
  ('Legal', 4, true)
ON CONFLICT DO NOTHING;

-- Get section IDs for inserting links
DO $$
DECLARE
  shop_id uuid;
  company_id uuid;
  support_id uuid;
  legal_id uuid;
BEGIN
  SELECT id INTO shop_id FROM footer_sections WHERE title = 'Shop' LIMIT 1;
  SELECT id INTO company_id FROM footer_sections WHERE title = 'Company' LIMIT 1;
  SELECT id INTO support_id FROM footer_sections WHERE title = 'Support' LIMIT 1;
  SELECT id INTO legal_id FROM footer_sections WHERE title = 'Legal' LIMIT 1;

  -- Insert Shop links
  IF shop_id IS NOT NULL THEN
    INSERT INTO footer_links (section_id, label, url, display_order) VALUES
      (shop_id, 'New Arrivals', '/category/new', 1),
      (shop_id, 'Best Sellers', '/category/best-sellers', 2),
      (shop_id, 'Sale', '/category/sale', 3),
      (shop_id, 'Gift Cards', '/gift-cards', 4)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert Company links
  IF company_id IS NOT NULL THEN
    INSERT INTO footer_links (section_id, label, url, display_order) VALUES
      (company_id, 'About Us', '/about', 1),
      (company_id, 'Careers', '/careers', 2),
      (company_id, 'Press', '/press', 3),
      (company_id, 'Blog', '/blog', 4)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert Support links
  IF support_id IS NOT NULL THEN
    INSERT INTO footer_links (section_id, label, url, display_order) VALUES
      (support_id, 'Contact Us', '/contact', 1),
      (support_id, 'Shipping Info', '/shipping', 2),
      (support_id, 'Returns', '/returns', 3),
      (support_id, 'FAQ', '/faq', 4)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert Legal links
  IF legal_id IS NOT NULL THEN
    INSERT INTO footer_links (section_id, label, url, display_order) VALUES
      (legal_id, 'Privacy Policy', '/privacy', 1),
      (legal_id, 'Terms of Service', '/terms', 2),
      (legal_id, 'Cookie Policy', '/cookies', 3),
      (legal_id, 'Accessibility', '/accessibility', 4)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_footer_sections_order ON footer_sections(display_order);
CREATE INDEX IF NOT EXISTS idx_footer_links_section ON footer_links(section_id);
CREATE INDEX IF NOT EXISTS idx_footer_links_order ON footer_links(display_order);