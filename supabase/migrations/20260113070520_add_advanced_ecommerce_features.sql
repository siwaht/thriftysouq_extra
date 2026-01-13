/*
  # Advanced Ecommerce Features Migration
  
  ## Overview
  This migration adds comprehensive enterprise features including payment integration,
  webhook management, import/export support, hero customization, and multi-user management.
  
  ## 1. Hero Settings Table
  Stores customizable hero section configuration:
    - `title`, `subtitle`, `badge_text` - Hero content
    - `background_image_url` - Hero background image
    - `primary_button_text/link`, `secondary_button_text/link` - CTA buttons
    - `features` - JSON array of feature highlights
    - `gradient_colors` - JSON object for color scheme
    - `is_active` - Enable/disable specific hero configurations
  
  ## 2. Webhooks Table
  Manages webhook endpoints for external integrations:
    - `name`, `url` - Webhook identification and endpoint
    - `events` - JSON array of subscribed event types
    - `secret_key` - Signing key for verification
    - `is_active` - Enable/disable webhooks
    - `headers` - Custom headers for webhook requests
  
  ## 3. Webhook Logs Table
  Tracks webhook delivery attempts:
    - `webhook_id` - Reference to webhook
    - `event_type` - Type of event triggered
    - `payload` - Event data sent
    - `response_status`, `response_body` - Delivery results
    - `retry_count` - Number of retry attempts
  
  ## 4. Payment Transactions Table
  Records all payment processing activity:
    - `order_id` - Associated order
    - `payment_method` - stripe/paypal/etc
    - `transaction_id` - External payment ID
    - `amount`, `currency` - Transaction details
    - `status` - pending/completed/failed/refunded
    - `metadata` - Additional payment data
  
  ## 5. API Keys Table
  Manages third-party API credentials:
    - `name`, `provider` - API identification
    - `key_public`, `key_secret` - API credentials
    - `environment` - test/production mode
    - `is_active` - Enable/disable keys
  
  ## 6. User Permissions & Roles
  Implements role-based access control:
    - `user_permissions` - Links users to specific permissions
    - `permissions` table - Defines available permissions
    - Roles: super_admin, admin, editor, viewer
  
  ## 7. Activity Logs Table
  Audits all admin actions:
    - `admin_user_id` - User who performed action
    - `action`, `resource_type`, `resource_id` - Action details
    - `changes` - JSON diff of what changed
    - `ip_address`, `user_agent` - Security tracking
  
  ## 8. Store Settings Table
  Central configuration for store:
    - `store_name`, `store_description` - Store identity
    - `contact_email`, `contact_phone` - Contact info
    - `logo_url` - Store branding
    - `tax_rate`, `default_currency` - Financial settings
    - `settings_json` - Flexible configuration storage
  
  ## Security
  - All tables have RLS enabled
  - Public access for admin operations (no auth system)
  - Activity logging for audit trail
*/

-- 1. Hero Settings Table
CREATE TABLE IF NOT EXISTS hero_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Discover Smart Shopping',
  subtitle text NOT NULL DEFAULT 'Curated treasures and premium finds at unbeatable prices.',
  badge_text text NOT NULL DEFAULT '✨ Premium Quality at Thrifty Prices',
  background_image_url text DEFAULT 'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=1920',
  primary_button_text text DEFAULT 'Shop Now',
  primary_button_link text DEFAULT '#products',
  secondary_button_text text DEFAULT 'View Collections',
  secondary_button_link text DEFAULT '#collections',
  features jsonb DEFAULT '[
    {"icon": "truck", "text": "Free Shipping"},
    {"icon": "shield", "text": "Secure Payment"},
    {"icon": "refresh", "text": "Easy Returns"}
  ]'::jsonb,
  gradient_colors jsonb DEFAULT '{
    "from": "emerald-900",
    "via": "teal-900",
    "to": "gray-900"
  }'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Webhooks Table
CREATE TABLE IF NOT EXISTS webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  events jsonb NOT NULL DEFAULT '[]'::jsonb,
  secret_key text NOT NULL,
  is_active boolean DEFAULT true,
  headers jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Webhook Logs Table
CREATE TABLE IF NOT EXISTS webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  response_status integer,
  response_body text,
  retry_count integer DEFAULT 0,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 4. Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  payment_method text NOT NULL,
  transaction_id text NOT NULL UNIQUE,
  amount decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending',
  metadata jsonb DEFAULT '{}'::jsonb,
  error_message text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider text NOT NULL,
  key_public text,
  key_secret text,
  environment text DEFAULT 'test',
  is_active boolean DEFAULT true,
  config jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  resource text NOT NULL,
  action text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 7. User Permissions Table
CREATE TABLE IF NOT EXISTS user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES admin_users(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  granted_by uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(admin_user_id, permission_id)
);

-- 8. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  changes jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- 9. Store Settings Table
CREATE TABLE IF NOT EXISTS store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name text NOT NULL DEFAULT 'My Store',
  store_description text,
  contact_email text,
  contact_phone text,
  logo_url text,
  tax_rate decimal(5,2) DEFAULT 0,
  default_currency text DEFAULT 'USD',
  timezone text DEFAULT 'UTC',
  settings_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 10. Payment Methods Table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  description text DEFAULT '',
  icon text DEFAULT 'credit-card',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default hero settings
INSERT INTO hero_settings (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Insert default store settings
INSERT INTO store_settings (id, store_name) VALUES (gen_random_uuid(), 'Thrifty Store')
ON CONFLICT DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (name, description, resource, action) VALUES
  ('products.view', 'View products', 'products', 'view'),
  ('products.create', 'Create products', 'products', 'create'),
  ('products.edit', 'Edit products', 'products', 'edit'),
  ('products.delete', 'Delete products', 'products', 'delete'),
  ('orders.view', 'View orders', 'orders', 'view'),
  ('orders.edit', 'Edit orders', 'orders', 'edit'),
  ('orders.delete', 'Delete orders', 'orders', 'delete'),
  ('customers.view', 'View customers', 'customers', 'view'),
  ('reviews.view', 'View reviews', 'reviews', 'view'),
  ('reviews.moderate', 'Moderate reviews', 'reviews', 'moderate'),
  ('settings.view', 'View settings', 'settings', 'view'),
  ('settings.edit', 'Edit settings', 'settings', 'edit'),
  ('users.view', 'View admin users', 'users', 'view'),
  ('users.manage', 'Manage admin users', 'users', 'manage'),
  ('webhooks.view', 'View webhooks', 'webhooks', 'view'),
  ('webhooks.manage', 'Manage webhooks', 'webhooks', 'manage'),
  ('payments.view', 'View payments', 'payments', 'view'),
  ('payments.manage', 'Manage payments', 'payments', 'manage')
ON CONFLICT (name) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(is_active);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook ON webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created ON webhook_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(admin_user_id);

-- Enable Row Level Security
ALTER TABLE hero_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hero_settings (public access for admin)
CREATE POLICY "Anyone can view hero settings"
  ON hero_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can manage hero settings"
  ON hero_settings FOR ALL
  TO public
  USING (true);

-- RLS Policies for webhooks (public access for admin)
CREATE POLICY "Anyone can view webhooks"
  ON webhooks FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can manage webhooks"
  ON webhooks FOR ALL
  TO public
  USING (true);

-- RLS Policies for webhook_logs (public access for admin)
CREATE POLICY "Anyone can view webhook logs"
  ON webhook_logs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create webhook logs"
  ON webhook_logs FOR INSERT
  TO public
  WITH CHECK (true);

-- RLS Policies for payment_transactions (public access for admin)
CREATE POLICY "Anyone can view payment transactions"
  ON payment_transactions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create payment transactions"
  ON payment_transactions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update payment transactions"
  ON payment_transactions FOR UPDATE
  TO public
  USING (true);

-- RLS Policies for api_keys (public access for admin)
CREATE POLICY "Anyone can view api keys"
  ON api_keys FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can manage api keys"
  ON api_keys FOR ALL
  TO public
  USING (true);

-- RLS Policies for permissions (public access for admin)
CREATE POLICY "Anyone can view permissions"
  ON permissions FOR SELECT
  TO public
  USING (true);

-- RLS Policies for user_permissions (public access for admin)
CREATE POLICY "Anyone can view user permissions"
  ON user_permissions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can manage user permissions"
  ON user_permissions FOR ALL
  TO public
  USING (true);

-- RLS Policies for activity_logs (public access for admin)
CREATE POLICY "Anyone can view activity logs"
  ON activity_logs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create activity logs"
  ON activity_logs FOR INSERT
  TO public
  WITH CHECK (true);

-- RLS Policies for store_settings (public access for admin)
CREATE POLICY "Anyone can view store settings"
  ON store_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can manage store settings"
  ON store_settings FOR ALL
  TO public
  USING (true);

-- RLS Policies for payment_methods (public access for admin)
CREATE POLICY "Anyone can view payment methods"
  ON payment_methods FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can manage payment methods"
  ON payment_methods FOR ALL
  TO public
  USING (true);