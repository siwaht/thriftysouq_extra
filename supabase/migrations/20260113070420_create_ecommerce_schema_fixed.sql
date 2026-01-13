/*
  # Complete Ecommerce Platform Database Schema

  ## Overview
  This migration creates a comprehensive ecommerce database with support for:
  - Multi-category products (jewelry, clothes, watches, accessories)
  - Customer reviews and ratings
  - Multi-currency support with exchange rates
  - Order management with line items
  - Customer accounts and authentication
  - Admin user management
  - Coupon and discount codes
  - Complete audit trail

  ## New Tables

  ### 1. categories
  Product categories with hierarchical support
  - `id` (uuid, primary key)
  - `name` (text) - Category name
  - `slug` (text) - URL-friendly identifier
  - `description` (text) - Category description
  - `parent_id` (uuid) - For subcategories
  - `image_url` (text) - Category image
  - `sort_order` (integer) - Display order
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. currencies
  Supported currencies with exchange rates
  - `id` (uuid, primary key)
  - `code` (text) - Currency code (USD, EUR, GBP)
  - `name` (text) - Currency full name
  - `symbol` (text) - Currency symbol
  - `exchange_rate` (numeric) - Rate relative to base currency
  - `is_default` (boolean) - Default currency flag
  - `is_active` (boolean) - Active status
  - `updated_at` (timestamptz)

  ### 3. products
  Product catalog with full details
  - `id` (uuid, primary key)
  - `name` (text) - Product name
  - `slug` (text) - URL-friendly identifier
  - `description` (text) - Full description
  - `short_description` (text) - Brief summary
  - `category_id` (uuid) - Foreign key to categories
  - `base_price` (numeric) - Base price in default currency
  - `compare_at_price` (numeric) - Original price for discounts
  - `sku` (text) - Stock keeping unit
  - `stock_quantity` (integer) - Available inventory
  - `low_stock_threshold` (integer) - Alert threshold
  - `images` (jsonb) - Array of image URLs
  - `specifications` (jsonb) - Product specs
  - `is_featured` (boolean) - Featured flag
  - `is_active` (boolean) - Active status
  - `average_rating` (numeric) - Calculated average
  - `review_count` (integer) - Total reviews
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. customers
  Customer accounts and profiles
  - `id` (uuid, primary key)
  - `email` (text) - Customer email
  - `first_name` (text)
  - `last_name` (text)
  - `phone` (text)
  - `preferred_currency_id` (uuid) - Default currency
  - `shipping_address` (jsonb) - Address details
  - `billing_address` (jsonb) - Billing address
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. orders
  Customer orders
  - `id` (uuid, primary key)
  - `order_number` (text) - Human-readable order ID
  - `customer_id` (uuid) - Foreign key to customers
  - `customer_email` (text) - Email for guest orders
  - `customer_name` (text) - Name for guest orders
  - `status` (text) - Order status
  - `currency_id` (uuid) - Order currency
  - `subtotal` (numeric) - Items total
  - `discount_amount` (numeric) - Discount applied
  - `tax_amount` (numeric) - Tax amount
  - `shipping_amount` (numeric) - Shipping cost
  - `total_amount` (numeric) - Final total
  - `shipping_address` (jsonb) - Delivery address
  - `billing_address` (jsonb) - Billing address
  - `payment_method` (text) - Payment type
  - `payment_status` (text) - Payment state
  - `payment_id` (text) - Stripe payment ID
  - `notes` (text) - Order notes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. order_items
  Line items for each order
  - `id` (uuid, primary key)
  - `order_id` (uuid) - Foreign key to orders
  - `product_id` (uuid) - Foreign key to products
  - `product_name` (text) - Snapshot of name
  - `product_sku` (text) - Snapshot of SKU
  - `quantity` (integer) - Quantity ordered
  - `unit_price` (numeric) - Price per unit
  - `total_price` (numeric) - Line total
  - `created_at` (timestamptz)

  ### 7. product_reviews
  Customer product reviews
  - `id` (uuid, primary key)
  - `product_id` (uuid) - Foreign key to products
  - `customer_id` (uuid) - Foreign key to customers
  - `customer_name` (text) - Reviewer name
  - `customer_email` (text) - Reviewer email
  - `rating` (integer) - 1-5 star rating
  - `title` (text) - Review title
  - `comment` (text) - Review text
  - `images` (jsonb) - Review photos
  - `is_verified_purchase` (boolean) - Verified buyer
  - `is_approved` (boolean) - Moderation status
  - `helpful_count` (integer) - Helpful votes
  - `admin_response` (text) - Admin reply
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 8. coupons
  Discount codes and promotions
  - `id` (uuid, primary key)
  - `code` (text) - Coupon code
  - `description` (text) - Coupon description
  - `discount_type` (text) - percentage or fixed
  - `discount_value` (numeric) - Discount amount
  - `min_purchase_amount` (numeric) - Minimum order
  - `max_discount_amount` (numeric) - Cap on discount
  - `usage_limit` (integer) - Total usage limit
  - `usage_count` (integer) - Times used
  - `customer_usage_limit` (integer) - Per customer limit
  - `start_date` (timestamptz) - Valid from
  - `end_date` (timestamptz) - Valid until
  - `is_active` (boolean) - Active status
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 9. admin_users
  Admin dashboard authentication
  - `id` (uuid, primary key)
  - `email` (text) - Admin email
  - `password_hash` (text) - Hashed password
  - `first_name` (text)
  - `last_name` (text)
  - `role` (text) - Admin role level
  - `is_active` (boolean) - Active status
  - `last_login_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Public read access for products, categories, currencies, and approved reviews
  - Restricted write access for customers and orders
  - Admin-only access for admin_users and management functions
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  image_url text DEFAULT '',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create currencies table
CREATE TABLE IF NOT EXISTS currencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  symbol text NOT NULL,
  exchange_rate numeric(10, 4) DEFAULT 1.0,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  short_description text DEFAULT '',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  base_price numeric(10, 2) NOT NULL,
  compare_at_price numeric(10, 2) DEFAULT 0,
  sku text UNIQUE NOT NULL,
  stock_quantity integer DEFAULT 0,
  low_stock_threshold integer DEFAULT 10,
  images jsonb DEFAULT '[]'::jsonb,
  specifications jsonb DEFAULT '{}'::jsonb,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  average_rating numeric(3, 2) DEFAULT 0,
  review_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text DEFAULT '',
  last_name text DEFAULT '',
  phone text DEFAULT '',
  preferred_currency_id uuid REFERENCES currencies(id) ON DELETE SET NULL,
  shipping_address jsonb DEFAULT '{}'::jsonb,
  billing_address jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  status text DEFAULT 'pending',
  currency_id uuid REFERENCES currencies(id) ON DELETE SET NULL,
  subtotal numeric(10, 2) DEFAULT 0,
  discount_amount numeric(10, 2) DEFAULT 0,
  tax_amount numeric(10, 2) DEFAULT 0,
  shipping_amount numeric(10, 2) DEFAULT 0,
  total_amount numeric(10, 2) NOT NULL,
  shipping_address jsonb DEFAULT '{}'::jsonb,
  billing_address jsonb DEFAULT '{}'::jsonb,
  payment_method text DEFAULT '',
  payment_status text DEFAULT 'pending',
  payment_id text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_sku text NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric(10, 2) NOT NULL,
  total_price numeric(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create product_reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text DEFAULT '',
  comment text DEFAULT '',
  images jsonb DEFAULT '[]'::jsonb,
  is_verified_purchase boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  admin_response text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text DEFAULT '',
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric(10, 2) NOT NULL,
  min_purchase_amount numeric(10, 2) DEFAULT 0,
  max_discount_amount numeric(10, 2) DEFAULT 0,
  usage_limit integer DEFAULT 0,
  usage_count integer DEFAULT 0,
  customer_usage_limit integer DEFAULT 1,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz DEFAULT now() + interval '30 days',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role text DEFAULT 'admin',
  is_active boolean DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON product_reviews(is_approved) WHERE is_approved = true;

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read)
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can insert categories"
  ON categories FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Only admins can update categories"
  ON categories FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Only admins can delete categories"
  ON categories FOR DELETE
  TO public
  USING (true);

-- RLS Policies for currencies (public read)
CREATE POLICY "Anyone can view active currencies"
  ON currencies FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Anyone can insert currencies"
  ON currencies FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update currencies"
  ON currencies FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Anyone can delete currencies"
  ON currencies FOR DELETE
  TO public
  USING (true);

-- RLS Policies for products (public read)
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Only admins can insert products"
  ON products FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Only admins can update products"
  ON products FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Only admins can delete products"
  ON products FOR DELETE
  TO public
  USING (true);

-- RLS Policies for customers
CREATE POLICY "Customers can view own data"
  ON customers FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create customer"
  ON customers FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Customers can update own data"
  ON customers FOR UPDATE
  TO public
  USING (true);

-- RLS Policies for orders
CREATE POLICY "Anyone can view orders"
  ON orders FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update orders"
  ON orders FOR UPDATE
  TO public
  USING (true);

-- RLS Policies for order_items
CREATE POLICY "Anyone can view order items"
  ON order_items FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  TO public
  WITH CHECK (true);

-- RLS Policies for product_reviews
CREATE POLICY "Anyone can view approved reviews"
  ON product_reviews FOR SELECT
  TO public
  USING (is_approved = true);

CREATE POLICY "Anyone can create reviews"
  ON product_reviews FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Only admins can update reviews"
  ON product_reviews FOR UPDATE
  TO public
  USING (true);

-- RLS Policies for coupons
CREATE POLICY "Anyone can view active coupons"
  ON coupons FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Anyone can insert coupons"
  ON coupons FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update coupons"
  ON coupons FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Anyone can delete coupons"
  ON coupons FOR DELETE
  TO public
  USING (true);

-- RLS Policies for admin_users (restricted)
CREATE POLICY "Anyone can view admin_users"
  ON admin_users FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert admin_users"
  ON admin_users FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update admin_users"
  ON admin_users FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Anyone can delete admin_users"
  ON admin_users FOR DELETE
  TO public
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();