-- Create pages table for storing editable content pages
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_active ON pages(is_active);

-- Enable RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Allow public to read active pages
CREATE POLICY "Public can read active pages"
  ON pages FOR SELECT
  TO public
  USING (is_active = true);

-- Allow public to manage pages
CREATE POLICY "Public can insert pages"
  ON pages FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update pages"
  ON pages FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Public can delete pages"
  ON pages FOR DELETE
  TO public
  USING (true);

-- Insert default pages
INSERT INTO pages (slug, title, content, is_active) VALUES
('about', 'About Us', '# About Us

Welcome to our store!', true),

('contact', 'Contact Us', '# Contact Us

Get in touch with us!', true),

('shipping', 'Shipping Information', '# Shipping Information

Fast and reliable shipping.', true),

('returns', 'Returns & Refunds', '# Returns & Refunds

Easy returns within 14 days.', true),

('faq', 'Frequently Asked Questions', '# FAQ

Find answers to common questions.', true),

('privacy', 'Privacy Policy', '# Privacy Policy

Your privacy is important to us.', true),

('terms', 'Terms of Service', '# Terms of Service

Read our terms and conditions.', true),

('cookies', 'Cookie Policy', '# Cookie Policy

Learn about our cookie usage.', true),

('accessibility', 'Accessibility', '# Accessibility

We are committed to accessibility.', true)

ON CONFLICT (slug) DO NOTHING;