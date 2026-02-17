# ThriftySouq MCP Server v2.0

Full AI agent control over the ThriftySouq e-commerce platform via Model Context Protocol.

## Setup

```bash
cd mcp-server
npm install
```

Create `.env` from `.env.example`:
```
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-role-key
```

## MCP Configuration

Add to `.kiro/settings/mcp.json`:
```json
{
  "mcpServers": {
    "thriftysouq": {
      "command": "node",
      "args": ["mcp-server/index.js"],
      "env": {
        "SUPABASE_URL": "your-url",
        "SUPABASE_SERVICE_KEY": "your-key"
      }
    }
  }
}
```

## Available Tools (60+)

### Products (8 tools)
- `list_products` - List/filter/search products
- `get_product` - Get product by ID or slug
- `create_product` - Create new product
- `update_product` - Update product fields
- `delete_product` - Delete a product
- `update_stock` - Update stock quantity
- `bulk_update_products` - Batch update multiple products
- `search_products_advanced` - Advanced search with price/rating/stock filters

### Categories (4 tools)
- `list_categories`, `create_category`, `update_category`, `delete_category`

### Orders (7 tools)
- `list_orders` - List/filter orders
- `get_order` - Get order with items
- `create_order` - Create manual order
- `update_order_status` - Update status
- `update_payment_status` - Update payment
- `cancel_order` - Cancel with stock restore
- `add_order_note` - Add timestamped note

### Customers (4 tools)
- `list_customers`, `get_customer`, `create_customer`, `update_customer`

### Reviews (5 tools)
- `list_reviews`, `create_review`, `approve_review`, `respond_to_review`, `delete_review`

### Coupons (4 tools)
- `list_coupons`, `create_coupon`, `update_coupon`, `delete_coupon`

### Currencies (4 tools)
- `list_currencies`, `create_currency`, `update_currency`, `delete_currency`

### Store Settings (2 tools)
- `get_store_settings`, `update_store_settings`

### Hero Settings (2 tools)
- `get_hero_settings`, `update_hero_settings`

### Footer (7 tools)
- `list_footer_sections`, `create_footer_section`, `update_footer_section`, `delete_footer_section`
- `create_footer_link`, `update_footer_link`, `delete_footer_link`

### Pages (5 tools)
- `list_pages`, `get_page`, `create_page`, `update_page`, `delete_page`

### Payment Methods (4 tools)
- `list_payment_methods`, `create_payment_method`, `update_payment_method`, `delete_payment_method`

### Admin Users (4 tools)
- `list_admin_users`, `create_admin_user`, `update_admin_user`, `delete_admin_user`

### Analytics (7 tools)
- `get_dashboard_stats` - Revenue, orders, products, ratings
- `get_sales_report` - Date range sales with grouping
- `get_top_products` - By sales, revenue, rating, reviews
- `get_low_stock_products` - Stock alerts
- `get_revenue_by_category` - Category revenue breakdown
- `get_customer_insights` - Top spenders, customer analytics
- `get_inventory_report` - Full inventory with stock values

### Site Management (4 tools)
- `get_site_health` - Database connectivity, table counts
- `get_full_site_config` - Complete site config in one call
- `seed_demo_data` - Seed categories, products, currencies, pages
- `execute_sql` - Read-only SQL queries for custom reporting
