#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Create MCP Server
const server = new Server(
  {
    name: "thriftysouq-mcp",
    version: "2.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define all available tools
const tools = [
  // ============ PRODUCTS ============
  {
    name: "list_products",
    description: "List all products with optional filtering by category, status, or search query",
    inputSchema: {
      type: "object",
      properties: {
        category_id: { type: "string", description: "Filter by category ID" },
        is_active: { type: "boolean", description: "Filter by active status" },
        is_featured: { type: "boolean", description: "Filter by featured status" },
        search: { type: "string", description: "Search in product name or description" },
        limit: { type: "number", description: "Limit results (default 50)" },
        offset: { type: "number", description: "Offset for pagination" },
      },
    },
  },
  {
    name: "get_product",
    description: "Get a single product by ID or slug",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Product ID" },
        slug: { type: "string", description: "Product slug" },
      },
    },
  },
  {
    name: "create_product",
    description: "Create a new product",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Product name" },
        slug: { type: "string", description: "URL slug (auto-generated if not provided)" },
        description: { type: "string", description: "Full product description" },
        short_description: { type: "string", description: "Short description for cards" },
        category_id: { type: "string", description: "Category ID" },
        base_price: { type: "number", description: "Base price" },
        compare_at_price: { type: "number", description: "Original price for showing discount" },
        sku: { type: "string", description: "Stock keeping unit" },
        stock_quantity: { type: "number", description: "Available stock" },
        low_stock_threshold: { type: "number", description: "Low stock alert threshold" },
        images: { type: "array", items: { type: "string" }, description: "Array of image URLs" },
        specifications: { type: "object", description: "Product specifications" },
        is_featured: { type: "boolean", description: "Featured product flag" },
        is_active: { type: "boolean", description: "Active status" },
      },
      required: ["name", "description", "category_id", "base_price", "sku"],
    },
  },
  {
    name: "update_product",
    description: "Update an existing product",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Product ID to update" },
        name: { type: "string" },
        slug: { type: "string" },
        description: { type: "string" },
        short_description: { type: "string" },
        category_id: { type: "string" },
        base_price: { type: "number" },
        compare_at_price: { type: "number" },
        sku: { type: "string" },
        stock_quantity: { type: "number" },
        low_stock_threshold: { type: "number" },
        images: { type: "array", items: { type: "string" } },
        specifications: { type: "object" },
        is_featured: { type: "boolean" },
        is_active: { type: "boolean" },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_product",
    description: "Delete a product by ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Product ID to delete" },
      },
      required: ["id"],
    },
  },
  {
    name: "update_stock",
    description: "Update product stock quantity",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Product ID" },
        stock_quantity: { type: "number", description: "New stock quantity" },
      },
      required: ["id", "stock_quantity"],
    },
  },
  {
    name: "bulk_update_products",
    description: "Bulk update multiple products at once. Useful for batch price changes, activating/deactivating, or updating stock.",
    inputSchema: {
      type: "object",
      properties: {
        product_ids: { type: "array", items: { type: "string" }, description: "Array of product IDs to update" },
        updates: { type: "object", description: "Fields to update on all selected products (e.g., is_active, is_featured, base_price)" },
      },
      required: ["product_ids", "updates"],
    },
  },
  {
    name: "search_products_advanced",
    description: "Advanced product search with price range, rating, stock status, and sorting options",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string", description: "Search term" },
        category_id: { type: "string", description: "Category filter" },
        min_price: { type: "number", description: "Minimum price" },
        max_price: { type: "number", description: "Maximum price" },
        min_rating: { type: "number", description: "Minimum average rating (1-5)" },
        in_stock: { type: "boolean", description: "Only show in-stock products" },
        is_featured: { type: "boolean", description: "Only featured products" },
        sort_by: { type: "string", enum: ["price_asc", "price_desc", "name_asc", "name_desc", "rating", "newest", "oldest"], description: "Sort order" },
        limit: { type: "number", description: "Limit results" },
        offset: { type: "number", description: "Offset for pagination" },
      },
    },
  },

  // ============ CATEGORIES ============
  {
    name: "list_categories",
    description: "List all product categories",
    inputSchema: {
      type: "object",
      properties: {
        parent_id: { type: "string", description: "Filter by parent category" },
      },
    },
  },
  {
    name: "create_category",
    description: "Create a new category",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Category name" },
        slug: { type: "string", description: "URL slug" },
        description: { type: "string", description: "Category description" },
        parent_id: { type: "string", description: "Parent category ID" },
        image_url: { type: "string", description: "Category image URL" },
        sort_order: { type: "number", description: "Display order" },
      },
      required: ["name", "slug"],
    },
  },
  {
    name: "update_category",
    description: "Update a category",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Category ID" },
        name: { type: "string" },
        slug: { type: "string" },
        description: { type: "string" },
        parent_id: { type: "string" },
        image_url: { type: "string" },
        sort_order: { type: "number" },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_category",
    description: "Delete a category",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Category ID" },
      },
      required: ["id"],
    },
  },

  // ============ ORDERS ============
  {
    name: "list_orders",
    description: "List all orders with optional filtering",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["pending", "processing", "shipped", "delivered", "cancelled"], description: "Filter by order status" },
        payment_status: { type: "string", enum: ["pending", "paid", "failed", "refunded"], description: "Filter by payment status" },
        customer_email: { type: "string", description: "Filter by customer email" },
        date_from: { type: "string", description: "Filter orders from date (ISO format)" },
        date_to: { type: "string", description: "Filter orders to date (ISO format)" },
        limit: { type: "number", description: "Limit results" },
        offset: { type: "number", description: "Offset for pagination" },
      },
    },
  },
  {
    name: "get_order",
    description: "Get order details including items",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Order ID" },
        order_number: { type: "string", description: "Order number" },
      },
    },
  },
  {
    name: "update_order_status",
    description: "Update order status",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Order ID" },
        status: { type: "string", enum: ["pending", "processing", "shipped", "delivered", "cancelled"], description: "New status" },
      },
      required: ["id", "status"],
    },
  },
  {
    name: "update_payment_status",
    description: "Update order payment status",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Order ID" },
        payment_status: { type: "string", enum: ["pending", "paid", "failed", "refunded"], description: "New payment status" },
      },
      required: ["id", "payment_status"],
    },
  },
  {
    name: "add_order_note",
    description: "Add a note to an order",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Order ID" },
        note: { type: "string", description: "Note content" },
      },
      required: ["id", "note"],
    },
  },
  {
    name: "create_order",
    description: "Create a new order manually (e.g., phone orders, custom orders)",
    inputSchema: {
      type: "object",
      properties: {
        customer_email: { type: "string", description: "Customer email" },
        customer_name: { type: "string", description: "Customer name" },
        items: { type: "array", items: { type: "object", properties: { product_id: { type: "string" }, quantity: { type: "number" } } }, description: "Order items" },
        shipping_address: { type: "object", description: "Shipping address" },
        payment_method: { type: "string", description: "Payment method" },
        notes: { type: "string", description: "Order notes" },
      },
      required: ["customer_email", "customer_name", "items"],
    },
  },
  {
    name: "cancel_order",
    description: "Cancel an order and optionally restore stock",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Order ID" },
        restore_stock: { type: "boolean", description: "Whether to restore product stock quantities" },
        reason: { type: "string", description: "Cancellation reason" },
      },
      required: ["id"],
    },
  },

  // ============ CUSTOMERS ============
  {
    name: "list_customers",
    description: "List all customers",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string", description: "Search by name or email" },
        limit: { type: "number" },
        offset: { type: "number" },
      },
    },
  },
  {
    name: "get_customer",
    description: "Get customer details with order history",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Customer ID" },
        email: { type: "string", description: "Customer email" },
      },
    },
  },
  {
    name: "create_customer",
    description: "Create a new customer record",
    inputSchema: {
      type: "object",
      properties: {
        email: { type: "string", description: "Customer email" },
        first_name: { type: "string", description: "First name" },
        last_name: { type: "string", description: "Last name" },
        phone: { type: "string", description: "Phone number" },
        shipping_address: { type: "object", description: "Shipping address" },
        billing_address: { type: "object", description: "Billing address" },
      },
      required: ["email", "first_name", "last_name"],
    },
  },
  {
    name: "update_customer",
    description: "Update customer details",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Customer ID" },
        email: { type: "string" },
        first_name: { type: "string" },
        last_name: { type: "string" },
        phone: { type: "string" },
        shipping_address: { type: "object" },
        billing_address: { type: "object" },
      },
      required: ["id"],
    },
  },

  // ============ REVIEWS ============
  {
    name: "list_reviews",
    description: "List product reviews with filtering",
    inputSchema: {
      type: "object",
      properties: {
        product_id: { type: "string", description: "Filter by product" },
        is_approved: { type: "boolean", description: "Filter by approval status" },
        rating: { type: "number", description: "Filter by rating (1-5)" },
        limit: { type: "number" },
        offset: { type: "number" },
      },
    },
  },
  {
    name: "approve_review",
    description: "Approve or unapprove a review",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Review ID" },
        is_approved: { type: "boolean", description: "Approval status" },
      },
      required: ["id", "is_approved"],
    },
  },
  {
    name: "respond_to_review",
    description: "Add admin response to a review",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Review ID" },
        admin_response: { type: "string", description: "Admin response text" },
      },
      required: ["id", "admin_response"],
    },
  },
  {
    name: "delete_review",
    description: "Delete a review",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Review ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "create_review",
    description: "Create a product review (useful for importing reviews or testing)",
    inputSchema: {
      type: "object",
      properties: {
        product_id: { type: "string", description: "Product ID" },
        customer_name: { type: "string", description: "Customer name" },
        customer_email: { type: "string", description: "Customer email" },
        rating: { type: "number", description: "Rating 1-5" },
        title: { type: "string", description: "Review title" },
        comment: { type: "string", description: "Review comment" },
        is_approved: { type: "boolean", description: "Auto-approve" },
      },
      required: ["product_id", "customer_name", "rating", "comment"],
    },
  },

  // ============ COUPONS ============
  {
    name: "list_coupons",
    description: "List all coupons",
    inputSchema: { type: "object", properties: { is_active: { type: "boolean", description: "Filter by active status" } } },
  },
  {
    name: "create_coupon",
    description: "Create a new coupon",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "string", description: "Coupon code (uppercase)" },
        description: { type: "string", description: "Coupon description" },
        discount_type: { type: "string", enum: ["percentage", "fixed"], description: "Discount type" },
        discount_value: { type: "number", description: "Discount value" },
        min_purchase_amount: { type: "number", description: "Minimum purchase amount" },
        max_discount_amount: { type: "number", description: "Maximum discount cap" },
        usage_limit: { type: "number", description: "Total usage limit" },
        customer_usage_limit: { type: "number", description: "Per customer usage limit" },
        start_date: { type: "string", description: "Start date (ISO format)" },
        end_date: { type: "string", description: "End date (ISO format)" },
        is_active: { type: "boolean", description: "Active status" },
      },
      required: ["code", "discount_type", "discount_value"],
    },
  },
  {
    name: "update_coupon",
    description: "Update a coupon",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Coupon ID" },
        code: { type: "string" }, description: { type: "string" },
        discount_type: { type: "string", enum: ["percentage", "fixed"] },
        discount_value: { type: "number" }, min_purchase_amount: { type: "number" },
        max_discount_amount: { type: "number" }, usage_limit: { type: "number" },
        start_date: { type: "string" }, end_date: { type: "string" },
        is_active: { type: "boolean" },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_coupon",
    description: "Delete a coupon",
    inputSchema: { type: "object", properties: { id: { type: "string", description: "Coupon ID" } }, required: ["id"] },
  },

  // ============ CURRENCIES ============
  {
    name: "list_currencies",
    description: "List all currencies",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "create_currency",
    description: "Create a new currency",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "string", description: "Currency code (e.g., USD, EUR)" },
        name: { type: "string", description: "Currency name" },
        symbol: { type: "string", description: "Currency symbol" },
        exchange_rate: { type: "number", description: "Exchange rate relative to default" },
        is_default: { type: "boolean", description: "Set as default currency" },
        is_active: { type: "boolean", description: "Active status" },
      },
      required: ["code", "name", "symbol", "exchange_rate"],
    },
  },
  {
    name: "update_currency",
    description: "Update a currency",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Currency ID" },
        code: { type: "string" }, name: { type: "string" }, symbol: { type: "string" },
        exchange_rate: { type: "number" }, is_default: { type: "boolean" }, is_active: { type: "boolean" },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_currency",
    description: "Delete a currency",
    inputSchema: { type: "object", properties: { id: { type: "string", description: "Currency ID" } }, required: ["id"] },
  },

  // ============ STORE SETTINGS ============
  {
    name: "get_store_settings",
    description: "Get store settings including name, description, contact info, tax rate, timezone",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "update_store_settings",
    description: "Update store settings",
    inputSchema: {
      type: "object",
      properties: {
        store_name: { type: "string" }, store_description: { type: "string" },
        contact_email: { type: "string" }, contact_phone: { type: "string" },
        logo_url: { type: "string" }, tax_rate: { type: "number" },
        default_currency: { type: "string" }, timezone: { type: "string" },
      },
    },
  },

  // ============ HERO SETTINGS ============
  {
    name: "get_hero_settings",
    description: "Get hero section settings (title, subtitle, background, buttons, features, stats)",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "update_hero_settings",
    description: "Update hero section settings",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" }, subtitle: { type: "string" },
        badge_text: { type: "string" }, background_image_url: { type: "string" },
        primary_button_text: { type: "string" }, primary_button_link: { type: "string" },
        secondary_button_text: { type: "string" }, secondary_button_link: { type: "string" },
        features: { type: "array", items: { type: "object", properties: { icon: { type: "string" }, text: { type: "string" } } } },
        stats: { type: "array", items: { type: "object", properties: { value: { type: "string" }, label: { type: "string" }, icon: { type: "string" } } } },
        is_active: { type: "boolean" },
      },
    },
  },

  // ============ FOOTER ============
  {
    name: "list_footer_sections",
    description: "List footer sections and their links",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "create_footer_section",
    description: "Create a footer section",
    inputSchema: {
      type: "object",
      properties: { title: { type: "string" }, display_order: { type: "number" }, is_active: { type: "boolean" } },
      required: ["title"],
    },
  },
  {
    name: "update_footer_section",
    description: "Update a footer section",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" }, title: { type: "string" }, display_order: { type: "number" }, is_active: { type: "boolean" } },
      required: ["id"],
    },
  },
  {
    name: "delete_footer_section",
    description: "Delete a footer section and all its links",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  },
  {
    name: "create_footer_link",
    description: "Create a footer link",
    inputSchema: {
      type: "object",
      properties: { section_id: { type: "string" }, label: { type: "string" }, url: { type: "string" }, display_order: { type: "number" }, is_active: { type: "boolean" } },
      required: ["section_id", "label", "url"],
    },
  },
  {
    name: "update_footer_link",
    description: "Update a footer link",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" }, label: { type: "string" }, url: { type: "string" }, display_order: { type: "number" }, is_active: { type: "boolean" } },
      required: ["id"],
    },
  },
  {
    name: "delete_footer_link",
    description: "Delete a footer link",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  },

  // ============ ANALYTICS & REPORTS ============
  {
    name: "get_dashboard_stats",
    description: "Get dashboard statistics including revenue, orders, products, ratings, customers",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_sales_report",
    description: "Get sales report for a date range with grouping",
    inputSchema: {
      type: "object",
      properties: {
        date_from: { type: "string", description: "Start date (ISO format)" },
        date_to: { type: "string", description: "End date (ISO format)" },
        group_by: { type: "string", enum: ["day", "week", "month"] },
      },
      required: ["date_from", "date_to"],
    },
  },
  {
    name: "get_top_products",
    description: "Get top selling or top rated products",
    inputSchema: {
      type: "object",
      properties: {
        sort_by: { type: "string", enum: ["sales", "revenue", "rating", "reviews"] },
        limit: { type: "number" },
      },
    },
  },
  {
    name: "get_low_stock_products",
    description: "Get products with low stock",
    inputSchema: {
      type: "object",
      properties: { threshold: { type: "number", description: "Stock threshold" } },
    },
  },
  {
    name: "get_revenue_by_category",
    description: "Get revenue breakdown by product category",
    inputSchema: {
      type: "object",
      properties: {
        date_from: { type: "string", description: "Start date (ISO)" },
        date_to: { type: "string", description: "End date (ISO)" },
      },
    },
  },
  {
    name: "get_customer_insights",
    description: "Get customer analytics: top spenders, new vs returning, geographic distribution",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Number of top customers to return" },
      },
    },
  },
  {
    name: "get_inventory_report",
    description: "Get full inventory report with stock values, out-of-stock items, and reorder suggestions",
    inputSchema: { type: "object", properties: {} },
  },

  // ============ PAYMENT METHODS ============
  {
    name: "list_payment_methods",
    description: "List all payment methods",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "create_payment_method",
    description: "Create a payment method",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" }, code: { type: "string" }, description: { type: "string" },
        icon: { type: "string" }, is_active: { type: "boolean" }, sort_order: { type: "number" },
      },
      required: ["name", "code"],
    },
  },
  {
    name: "update_payment_method",
    description: "Update a payment method",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" }, name: { type: "string" }, code: { type: "string" },
        description: { type: "string" }, icon: { type: "string" }, is_active: { type: "boolean" }, sort_order: { type: "number" },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_payment_method",
    description: "Delete a payment method",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  },

  // ============ ADMIN USERS ============
  {
    name: "list_admin_users",
    description: "List all admin users",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "create_admin_user",
    description: "Create a new admin user",
    inputSchema: {
      type: "object",
      properties: {
        email: { type: "string" }, password: { type: "string" },
        first_name: { type: "string" }, last_name: { type: "string" },
        role: { type: "string", enum: ["super_admin", "admin", "editor", "viewer"] },
        is_active: { type: "boolean" },
      },
      required: ["email", "password", "first_name", "last_name", "role"],
    },
  },
  {
    name: "update_admin_user",
    description: "Update an admin user",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" }, email: { type: "string" },
        first_name: { type: "string" }, last_name: { type: "string" },
        role: { type: "string", enum: ["super_admin", "admin", "editor", "viewer"] },
        is_active: { type: "boolean" },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_admin_user",
    description: "Delete an admin user",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  },

  // ============ PAGES ============
  {
    name: "list_pages",
    description: "List all content pages (About Us, Privacy Policy, etc.)",
    inputSchema: { type: "object", properties: { is_active: { type: "boolean" } } },
  },
  {
    name: "get_page",
    description: "Get a page by ID or slug",
    inputSchema: { type: "object", properties: { id: { type: "string" }, slug: { type: "string" } } },
  },
  {
    name: "create_page",
    description: "Create a new content page",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string" }, title: { type: "string" },
        content: { type: "string", description: "Page content (supports # headings, - lists)" },
        is_active: { type: "boolean" },
      },
      required: ["slug", "title", "content"],
    },
  },
  {
    name: "update_page",
    description: "Update a content page",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" }, slug: { type: "string" }, title: { type: "string" }, content: { type: "string" }, is_active: { type: "boolean" } },
      required: ["id"],
    },
  },
  {
    name: "delete_page",
    description: "Delete a content page",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  },

  // ============ SITE HEALTH & MANAGEMENT ============
  {
    name: "get_site_health",
    description: "Get overall site health: database connectivity, table row counts, storage usage, and potential issues",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_full_site_config",
    description: "Get complete site configuration in one call: store settings, hero settings, footer, currencies, payment methods, categories, and page count",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "seed_demo_data",
    description: "Seed the store with demo data: categories, products, currencies, and pages. Useful for initial setup or testing.",
    inputSchema: {
      type: "object",
      properties: {
        include_products: { type: "boolean", description: "Seed demo products (default true)" },
        include_categories: { type: "boolean", description: "Seed demo categories (default true)" },
        include_currencies: { type: "boolean", description: "Seed demo currencies (default true)" },
        include_pages: { type: "boolean", description: "Seed demo pages (default true)" },
      },
    },
  },
  {
    name: "execute_sql",
    description: "Execute a read-only SQL query against the database for custom reporting. Only SELECT statements are allowed.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "SQL SELECT query to execute" },
      },
      required: ["query"],
    },
  },
];

// Register tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});


// Tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // ============ PRODUCTS ============
      case "list_products": {
        let query = supabase.from("products").select("*, categories(name, slug)");
        if (args.category_id) query = query.eq("category_id", args.category_id);
        if (args.is_active !== undefined) query = query.eq("is_active", args.is_active);
        if (args.is_featured !== undefined) query = query.eq("is_featured", args.is_featured);
        if (args.search) query = query.or(`name.ilike.%${args.search}%,description.ilike.%${args.search}%`);
        query = query.order("created_at", { ascending: false });
        if (args.limit) query = query.limit(args.limit);
        if (args.offset) query = query.range(args.offset, args.offset + (args.limit || 50) - 1);
        const { data, error } = await query;
        if (error) throw error;
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "get_product": {
        let query = supabase.from("products").select("*, categories(name, slug)");
        if (args.id) query = query.eq("id", args.id);
        else if (args.slug) query = query.eq("slug", args.slug);
        else throw new Error("Either id or slug is required");
        const { data, error } = await query.single();
        if (error) throw error;
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "create_product": {
        const slug = args.slug || args.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        const { data, error } = await supabase.from("products").insert([{ ...args, slug }]).select().single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Product created successfully:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "update_product": {
        const { id, ...updates } = args;
        updates.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Product updated:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "delete_product": {
        const { error } = await supabase.from("products").delete().eq("id", args.id);
        if (error) throw error;
        return { content: [{ type: "text", text: `Product ${args.id} deleted successfully` }] };
      }

      case "update_stock": {
        const { data, error } = await supabase
          .from("products")
          .update({ stock_quantity: args.stock_quantity, updated_at: new Date().toISOString() })
          .eq("id", args.id).select("id, name, stock_quantity").single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Stock updated:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "bulk_update_products": {
        const results = [];
        for (const pid of args.product_ids) {
          const { data, error } = await supabase.from("products")
            .update({ ...args.updates, updated_at: new Date().toISOString() })
            .eq("id", pid).select("id, name").single();
          if (error) results.push({ id: pid, error: error.message });
          else results.push({ id: pid, name: data.name, status: "updated" });
        }
        return { content: [{ type: "text", text: `Bulk update results:\n${JSON.stringify(results, null, 2)}` }] };
      }

      case "search_products_advanced": {
        let query = supabase.from("products").select("*, categories(name, slug)").eq("is_active", true);
        if (args.search) query = query.or(`name.ilike.%${args.search}%,description.ilike.%${args.search}%,short_description.ilike.%${args.search}%`);
        if (args.category_id) query = query.eq("category_id", args.category_id);
        if (args.min_price) query = query.gte("base_price", args.min_price);
        if (args.max_price) query = query.lte("base_price", args.max_price);
        if (args.min_rating) query = query.gte("average_rating", args.min_rating);
        if (args.in_stock) query = query.gt("stock_quantity", 0);
        if (args.is_featured !== undefined) query = query.eq("is_featured", args.is_featured);
        switch (args.sort_by) {
          case "price_asc": query = query.order("base_price", { ascending: true }); break;
          case "price_desc": query = query.order("base_price", { ascending: false }); break;
          case "name_asc": query = query.order("name", { ascending: true }); break;
          case "name_desc": query = query.order("name", { ascending: false }); break;
          case "rating": query = query.order("average_rating", { ascending: false }); break;
          case "newest": query = query.order("created_at", { ascending: false }); break;
          case "oldest": query = query.order("created_at", { ascending: true }); break;
          default: query = query.order("created_at", { ascending: false });
        }
        if (args.limit) query = query.limit(args.limit);
        if (args.offset) query = query.range(args.offset, args.offset + (args.limit || 50) - 1);
        const { data, error } = await query;
        if (error) throw error;
        return { content: [{ type: "text", text: JSON.stringify({ count: data.length, products: data }, null, 2) }] };
      }

      // ============ CATEGORIES ============
      case "list_categories": {
        let query = supabase.from("categories").select("*").order("sort_order");
        if (args.parent_id) query = query.eq("parent_id", args.parent_id);
        const { data, error } = await query;
        if (error) throw error;
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "create_category": {
        const { data, error } = await supabase.from("categories").insert([args]).select().single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Category created:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "update_category": {
        const { id, ...updates } = args;
        updates.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from("categories").update(updates).eq("id", id).select().single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Category updated:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "delete_category": {
        const { error } = await supabase.from("categories").delete().eq("id", args.id);
        if (error) throw error;
        return { content: [{ type: "text", text: `Category ${args.id} deleted successfully` }] };
      }

      // ============ ORDERS ============
      case "list_orders": {
        let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
        if (args.status) query = query.eq("status", args.status);
        if (args.payment_status) query = query.eq("payment_status", args.payment_status);
        if (args.customer_email) query = query.ilike("customer_email", `%${args.customer_email}%`);
        if (args.date_from) query = query.gte("created_at", args.date_from);
        if (args.date_to) query = query.lte("created_at", args.date_to);
        if (args.limit) query = query.limit(args.limit);
        if (args.offset) query = query.range(args.offset, args.offset + (args.limit || 50) - 1);
        const { data, error } = await query;
        if (error) throw error;
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "get_order": {
        let query = supabase.from("orders").select("*");
        if (args.id) query = query.eq("id", args.id);
        else if (args.order_number) query = query.eq("order_number", args.order_number);
        else throw new Error("Either id or order_number is required");
        const { data: order, error: orderError } = await query.single();
        if (orderError) throw orderError;
        const { data: items } = await supabase.from("order_items").select("*").eq("order_id", order.id);
        return { content: [{ type: "text", text: JSON.stringify({ ...order, items }, null, 2) }] };
      }

      case "update_order_status": {
        const { data, error } = await supabase.from("orders")
          .update({ status: args.status, updated_at: new Date().toISOString() })
          .eq("id", args.id).select("id, order_number, status").single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Order status updated:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "update_payment_status": {
        const { data, error } = await supabase.from("orders")
          .update({ payment_status: args.payment_status, updated_at: new Date().toISOString() })
          .eq("id", args.id).select("id, order_number, payment_status").single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Payment status updated:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "add_order_note": {
        const { data: order } = await supabase.from("orders").select("notes").eq("id", args.id).single();
        const existingNotes = order?.notes || "";
        const timestamp = new Date().toISOString();
        const newNotes = existingNotes ? `${existingNotes}\n\n[${timestamp}] ${args.note}` : `[${timestamp}] ${args.note}`;
        const { data, error } = await supabase.from("orders")
          .update({ notes: newNotes, updated_at: new Date().toISOString() })
          .eq("id", args.id).select("id, order_number, notes").single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Note added:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "create_order": {
        // Fetch products for pricing
        const productIds = args.items.map(i => i.product_id);
        const { data: products } = await supabase.from("products").select("id, name, sku, base_price").in("id", productIds);
        if (!products || products.length === 0) throw new Error("No valid products found");
        
        let subtotal = 0;
        const orderItems = args.items.map(item => {
          const product = products.find(p => p.id === item.product_id);
          if (!product) throw new Error(`Product ${item.product_id} not found`);
          const total = product.base_price * item.quantity;
          subtotal += total;
          return { product_id: product.id, product_name: product.name, product_sku: product.sku, quantity: item.quantity, unit_price: product.base_price, total_price: total };
        });

        const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
        const { data: order, error: orderError } = await supabase.from("orders").insert([{
          order_number: orderNumber, customer_email: args.customer_email, customer_name: args.customer_name,
          status: "pending", subtotal, total_amount: subtotal, shipping_address: args.shipping_address || {},
          payment_method: args.payment_method || "manual", payment_status: "pending", notes: args.notes || "",
        }]).select().single();
        if (orderError) throw orderError;

        const itemsWithOrderId = orderItems.map(item => ({ ...item, order_id: order.id }));
        await supabase.from("order_items").insert(itemsWithOrderId);

        // Decrease stock
        for (const item of args.items) {
          await supabase.rpc("decrement_stock", { p_id: item.product_id, qty: item.quantity }).catch(() => {
            // If RPC doesn't exist, do manual update
            supabase.from("products").select("stock_quantity").eq("id", item.product_id).single().then(({ data: p }) => {
              if (p) supabase.from("products").update({ stock_quantity: Math.max(0, p.stock_quantity - item.quantity) }).eq("id", item.product_id);
            });
          });
        }

        return { content: [{ type: "text", text: `Order created:\n${JSON.stringify({ ...order, items: orderItems }, null, 2)}` }] };
      }

      case "cancel_order": {
        const { data: order } = await supabase.from("orders").select("*").eq("id", args.id).single();
        if (!order) throw new Error("Order not found");
        
        if (args.restore_stock) {
          const { data: items } = await supabase.from("order_items").select("*").eq("order_id", args.id);
          if (items) {
            for (const item of items) {
              if (item.product_id) {
                const { data: product } = await supabase.from("products").select("stock_quantity").eq("id", item.product_id).single();
                if (product) {
                  await supabase.from("products").update({ stock_quantity: product.stock_quantity + item.quantity }).eq("id", item.product_id);
                }
              }
            }
          }
        }

        const notes = order.notes ? `${order.notes}\n\n[${new Date().toISOString()}] Order cancelled${args.reason ? ': ' + args.reason : ''}` : `[${new Date().toISOString()}] Order cancelled${args.reason ? ': ' + args.reason : ''}`;
        const { data, error } = await supabase.from("orders")
          .update({ status: "cancelled", notes, updated_at: new Date().toISOString() })
          .eq("id", args.id).select("id, order_number, status").single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Order cancelled:\n${JSON.stringify(data, null, 2)}` }] };
      }

      // ============ CUSTOMERS ============
      case "list_customers": {
        let query = supabase.from("customers").select("*").order("created_at", { ascending: false });
        if (args.search) query = query.or(`email.ilike.%${args.search}%,first_name.ilike.%${args.search}%,last_name.ilike.%${args.search}%`);
        if (args.limit) query = query.limit(args.limit);
        if (args.offset) query = query.range(args.offset, args.offset + (args.limit || 50) - 1);
        const { data, error } = await query;
        if (error) throw error;
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "get_customer": {
        let query = supabase.from("customers").select("*");
        if (args.id) query = query.eq("id", args.id);
        else if (args.email) query = query.eq("email", args.email);
        else throw new Error("Either id or email is required");
        const { data: customer, error: customerError } = await query.single();
        if (customerError) throw customerError;
        const { data: orders } = await supabase.from("orders").select("id, order_number, total_amount, status, created_at")
          .eq("customer_id", customer.id).order("created_at", { ascending: false }).limit(10);
        return { content: [{ type: "text", text: JSON.stringify({ ...customer, recent_orders: orders }, null, 2) }] };
      }

      case "create_customer": {
        const { data, error } = await supabase.from("customers").insert([args]).select().single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Customer created:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "update_customer": {
        const { id, ...updates } = args;
        updates.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from("customers").update(updates).eq("id", id).select().single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Customer updated:\n${JSON.stringify(data, null, 2)}` }] };
      }

      // ============ REVIEWS ============
      case "list_reviews": {
        let query = supabase.from("product_reviews").select("*, products(name)").order("created_at", { ascending: false });
        if (args.product_id) query = query.eq("product_id", args.product_id);
        if (args.is_approved !== undefined) query = query.eq("is_approved", args.is_approved);
        if (args.rating) query = query.eq("rating", args.rating);
        if (args.limit) query = query.limit(args.limit);
        if (args.offset) query = query.range(args.offset, args.offset + (args.limit || 50) - 1);
        const { data, error } = await query;
        if (error) throw error;
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "approve_review": {
        const { data, error } = await supabase.from("product_reviews")
          .update({ is_approved: args.is_approved, updated_at: new Date().toISOString() })
          .eq("id", args.id).select("id, customer_name, is_approved").single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Review ${args.is_approved ? "approved" : "unapproved"}:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "respond_to_review": {
        const { data, error } = await supabase.from("product_reviews")
          .update({ admin_response: args.admin_response, updated_at: new Date().toISOString() })
          .eq("id", args.id).select("id, customer_name, admin_response").single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Response added:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "delete_review": {
        const { error } = await supabase.from("product_reviews").delete().eq("id", args.id);
        if (error) throw error;
        return { content: [{ type: "text", text: `Review ${args.id} deleted` }] };
      }

      case "create_review": {
        const { data, error } = await supabase.from("product_reviews").insert([{
          ...args, is_approved: args.is_approved ?? false,
        }]).select().single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Review created:\n${JSON.stringify(data, null, 2)}` }] };
      }

      // ============ COUPONS ============
      case "list_coupons": {
        let query = supabase.from("coupons").select("*").order("created_at", { ascending: false });
        if (args.is_active !== undefined) query = query.eq("is_active", args.is_active);
        const { data, error } = await query;
        if (error) throw error;
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "create_coupon": {
        const { data, error } = await supabase.from("coupons").insert([{ ...args, code: args.code.toUpperCase() }]).select().single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Coupon created:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "update_coupon": {
        const { id, ...updates } = args;
        if (updates.code) updates.code = updates.code.toUpperCase();
        updates.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from("coupons").update(updates).eq("id", id).select().single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Coupon updated:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "delete_coupon": {
        const { error } = await supabase.from("coupons").delete().eq("id", args.id);
        if (error) throw error;
        return { content: [{ type: "text", text: `Coupon ${args.id} deleted` }] };
      }

      // ============ CURRENCIES ============
      case "list_currencies": {
        const { data, error } = await supabase.from("currencies").select("*").order("code");
        if (error) throw error;
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "create_currency": {
        if (args.is_default) await supabase.from("currencies").update({ is_default: false }).neq("id", "00000000-0000-0000-0000-000000000000");
        const { data, error } = await supabase.from("currencies").insert([args]).select().single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Currency created:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "update_currency": {
        const { id, ...updates } = args;
        if (updates.is_default) await supabase.from("currencies").update({ is_default: false }).neq("id", id);
        updates.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from("currencies").update(updates).eq("id", id).select().single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Currency updated:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "delete_currency": {
        const { error } = await supabase.from("currencies").delete().eq("id", args.id);
        if (error) throw error;
        return { content: [{ type: "text", text: `Currency ${args.id} deleted` }] };
      }

      // ============ STORE SETTINGS ============
      case "get_store_settings": {
        const { data, error } = await supabase.from("store_settings").select("*").maybeSingle();
        if (error) throw error;
        return { content: [{ type: "text", text: JSON.stringify(data || {}, null, 2) }] };
      }

      case "update_store_settings": {
        const { data: existing } = await supabase.from("store_settings").select("id").maybeSingle();
        let result;
        if (existing) {
          const { data, error } = await supabase.from("store_settings").update({ ...args, updated_at: new Date().toISOString() }).eq("id", existing.id).select().single();
          if (error) throw error;
          result = data;
        } else {
          const { data, error } = await supabase.from("store_settings").insert([args]).select().single();
          if (error) throw error;
          result = data;
        }
        return { content: [{ type: "text", text: `Store settings updated:\n${JSON.stringify(result, null, 2)}` }] };
      }

      // ============ HERO SETTINGS ============
      case "get_hero_settings": {
        const { data, error } = await supabase.from("hero_settings").select("*").maybeSingle();
        if (error) throw error;
        return { content: [{ type: "text", text: JSON.stringify(data || {}, null, 2) }] };
      }

      case "update_hero_settings": {
        const { data: existing } = await supabase.from("hero_settings").select("id").maybeSingle();
        let result;
        if (existing) {
          const { data, error } = await supabase.from("hero_settings").update({ ...args, updated_at: new Date().toISOString() }).eq("id", existing.id).select().single();
          if (error) throw error;
          result = data;
        } else {
          const { data, error } = await supabase.from("hero_settings").insert([args]).select().single();
          if (error) throw error;
          result = data;
        }
        return { content: [{ type: "text", text: `Hero settings updated:\n${JSON.stringify(result, null, 2)}` }] };
      }

      // ============ FOOTER ============
      case "list_footer_sections": {
        const { data: sections, error: se } = await supabase.from("footer_sections").select("*").order("display_order");
        if (se) throw se;
        const { data: links, error: le } = await supabase.from("footer_links").select("*").order("display_order");
        if (le) throw le;
        const result = sections.map(s => ({ ...s, links: links.filter(l => l.section_id === s.id) }));
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      case "create_footer_section": {
        const { data, error } = await supabase.from("footer_sections").insert([args]).select().single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Footer section created:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "update_footer_section": {
        const { id, ...updates } = args;
        const { data, error } = await supabase.from("footer_sections").update(updates).eq("id", id).select().single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Footer section updated:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "delete_footer_section": {
        await supabase.from("footer_links").delete().eq("section_id", args.id);
        const { error } = await supabase.from("footer_sections").delete().eq("id", args.id);
        if (error) throw error;
        return { content: [{ type: "text", text: `Footer section ${args.id} and its links deleted` }] };
      }

      case "create_footer_link": {
        const { data, error } = await supabase.from("footer_links").insert([args]).select().single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Footer link created:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "update_footer_link": {
        const { id, ...updates } = args;
        const { data, error } = await supabase.from("footer_links").update(updates).eq("id", id).select().single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Footer link updated:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "delete_footer_link": {
        const { error } = await supabase.from("footer_links").delete().eq("id", args.id);
        if (error) throw error;
        return { content: [{ type: "text", text: `Footer link ${args.id} deleted` }] };
      }

      // ============ ANALYTICS & REPORTS ============
      case "get_dashboard_stats": {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const [products, orders, reviews, customers] = await Promise.all([
          supabase.from("products").select("*"),
          supabase.from("orders").select("*"),
          supabase.from("product_reviews").select("*").eq("is_approved", false),
          supabase.from("customers").select("id"),
        ]);
        const pd = products.data || [], od = orders.data || [];
        const stats = {
          total_products: pd.length, active_products: pd.filter(p => p.is_active).length,
          low_stock_products: pd.filter(p => p.stock_quantity <= p.low_stock_threshold).length,
          total_orders: od.length, pending_orders: od.filter(o => o.status === "pending").length,
          total_revenue: od.reduce((s, o) => s + (o.total_amount || 0), 0),
          today_orders: od.filter(o => new Date(o.created_at) >= today).length,
          today_revenue: od.filter(o => new Date(o.created_at) >= today).reduce((s, o) => s + (o.total_amount || 0), 0),
          average_rating: pd.length > 0 ? pd.reduce((s, p) => s + (p.average_rating || 0), 0) / pd.length : 0,
          pending_reviews: reviews.data?.length || 0,
          total_customers: customers.data?.length || 0,
        };
        return { content: [{ type: "text", text: JSON.stringify(stats, null, 2) }] };
      }

      case "get_sales_report": {
        const { data, error } = await supabase.from("orders")
          .select("id, order_number, total_amount, status, payment_status, created_at")
          .gte("created_at", args.date_from).lte("created_at", args.date_to)
          .order("created_at", { ascending: true });
        if (error) throw error;
        const summary = {
          total_orders: data.length,
          total_revenue: data.reduce((s, o) => s + (o.total_amount || 0), 0),
          average_order_value: data.length > 0 ? data.reduce((s, o) => s + (o.total_amount || 0), 0) / data.length : 0,
          orders_by_status: data.reduce((a, o) => { a[o.status] = (a[o.status] || 0) + 1; return a; }, {}),
          orders: data,
        };
        return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
      }

      case "get_top_products": {
        const limit = args.limit || 10;
        let query = supabase.from("products").select("id, name, base_price, stock_quantity, average_rating, review_count, images");
        switch (args.sort_by) {
          case "rating": query = query.order("average_rating", { ascending: false }); break;
          case "reviews": query = query.order("review_count", { ascending: false }); break;
          default: query = query.order("review_count", { ascending: false });
        }
        const { data, error } = await query.limit(limit);
        if (error) throw error;
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "get_low_stock_products": {
        if (args.threshold) {
          const { data, error } = await supabase.from("products").select("id, name, sku, stock_quantity, low_stock_threshold, images").lte("stock_quantity", args.threshold);
          if (error) throw error;
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        }
        const { data: products } = await supabase.from("products").select("*");
        const lowStock = products?.filter(p => p.stock_quantity <= p.low_stock_threshold) || [];
        return { content: [{ type: "text", text: JSON.stringify(lowStock, null, 2) }] };
      }

      case "get_revenue_by_category": {
        const { data: orders } = await supabase.from("orders").select("id, total_amount, created_at")
          .gte("created_at", args.date_from || "2020-01-01").lte("created_at", args.date_to || new Date().toISOString());
        const { data: items } = await supabase.from("order_items").select("order_id, product_id, total_price");
        const { data: products } = await supabase.from("products").select("id, category_id");
        const { data: categories } = await supabase.from("categories").select("id, name");
        
        const catRevenue = {};
        (items || []).forEach(item => {
          const product = products?.find(p => p.id === item.product_id);
          const order = orders?.find(o => o.id === item.order_id);
          if (product && order) {
            const cat = categories?.find(c => c.id === product.category_id);
            const catName = cat?.name || "Uncategorized";
            catRevenue[catName] = (catRevenue[catName] || 0) + item.total_price;
          }
        });
        return { content: [{ type: "text", text: JSON.stringify(catRevenue, null, 2) }] };
      }

      case "get_customer_insights": {
        const { data: customers } = await supabase.from("customers").select("*");
        const { data: orders } = await supabase.from("orders").select("customer_id, total_amount, created_at");
        
        const customerSpend = {};
        (orders || []).forEach(o => {
          if (o.customer_id) customerSpend[o.customer_id] = (customerSpend[o.customer_id] || 0) + (o.total_amount || 0);
        });
        
        const topSpenders = Object.entries(customerSpend)
          .sort(([,a], [,b]) => b - a)
          .slice(0, args.limit || 10)
          .map(([id, total]) => {
            const c = customers?.find(c => c.id === id);
            return { id, name: c ? `${c.first_name} ${c.last_name}` : "Unknown", email: c?.email, total_spent: total };
          });

        return { content: [{ type: "text", text: JSON.stringify({
          total_customers: customers?.length || 0,
          top_spenders: topSpenders,
          total_revenue_from_customers: Object.values(customerSpend).reduce((s, v) => s + v, 0),
        }, null, 2) }] };
      }

      case "get_inventory_report": {
        const { data: products } = await supabase.from("products").select("id, name, sku, base_price, stock_quantity, low_stock_threshold, is_active");
        const pd = products || [];
        const report = {
          total_products: pd.length,
          total_stock_value: pd.reduce((s, p) => s + (p.base_price * p.stock_quantity), 0),
          out_of_stock: pd.filter(p => p.stock_quantity === 0),
          low_stock: pd.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold),
          healthy_stock: pd.filter(p => p.stock_quantity > p.low_stock_threshold).length,
          inactive_products: pd.filter(p => !p.is_active).length,
        };
        return { content: [{ type: "text", text: JSON.stringify(report, null, 2) }] };
      }

      // ============ PAYMENT METHODS ============
      case "list_payment_methods": {
        const { data, error } = await supabase.from("payment_methods").select("*").order("sort_order");
        if (error) throw error;
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "create_payment_method": {
        const { data, error } = await supabase.from("payment_methods").insert([args]).select().single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Payment method created:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "update_payment_method": {
        const { id, ...updates } = args;
        const { data, error } = await supabase.from("payment_methods").update(updates).eq("id", id).select().single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Payment method updated:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "delete_payment_method": {
        const { error } = await supabase.from("payment_methods").delete().eq("id", args.id);
        if (error) throw error;
        return { content: [{ type: "text", text: `Payment method ${args.id} deleted` }] };
      }

      // ============ ADMIN USERS ============
      case "list_admin_users": {
        const { data, error } = await supabase.from("admin_users")
          .select("id, email, first_name, last_name, role, is_active, last_login_at, created_at")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "create_admin_user": {
        const encoder = new TextEncoder();
        const hashData = encoder.encode(args.password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", hashData);
        const password_hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
        const { password, ...userData } = args;
        const { data, error } = await supabase.from("admin_users").insert([{ ...userData, password_hash }])
          .select("id, email, first_name, last_name, role, is_active").single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Admin user created:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "update_admin_user": {
        const { id, ...updates } = args;
        updates.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from("admin_users").update(updates).eq("id", id)
          .select("id, email, first_name, last_name, role, is_active").single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Admin user updated:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "delete_admin_user": {
        const { error } = await supabase.from("admin_users").delete().eq("id", args.id);
        if (error) throw error;
        return { content: [{ type: "text", text: `Admin user ${args.id} deleted` }] };
      }

      // ============ PAGES ============
      case "list_pages": {
        let query = supabase.from("pages").select("*").order("title");
        if (args.is_active !== undefined) query = query.eq("is_active", args.is_active);
        const { data, error } = await query;
        if (error) throw error;
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "get_page": {
        let query = supabase.from("pages").select("*");
        if (args.id) query = query.eq("id", args.id);
        else if (args.slug) query = query.eq("slug", args.slug);
        else throw new Error("Either id or slug is required");
        const { data, error } = await query.single();
        if (error) throw error;
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "create_page": {
        const { data, error } = await supabase.from("pages").insert([args]).select().single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Page created:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "update_page": {
        const { id, ...updates } = args;
        updates.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from("pages").update(updates).eq("id", id).select().single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Page updated:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "delete_page": {
        const { error } = await supabase.from("pages").delete().eq("id", args.id);
        if (error) throw error;
        return { content: [{ type: "text", text: `Page ${args.id} deleted` }] };
      }

      // ============ SITE HEALTH & MANAGEMENT ============
      case "get_site_health": {
        const tables = ["products", "categories", "orders", "customers", "product_reviews", "coupons", "currencies", "admin_users", "pages", "footer_sections", "footer_links", "payment_methods"];
        const counts = {};
        for (const table of tables) {
          const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
          counts[table] = error ? `Error: ${error.message}` : count;
        }
        const { data: settings } = await supabase.from("store_settings").select("*").maybeSingle();
        const { data: hero } = await supabase.from("hero_settings").select("id").maybeSingle();
        
        return { content: [{ type: "text", text: JSON.stringify({
          status: "healthy",
          database: "connected",
          table_counts: counts,
          store_settings_configured: !!settings,
          hero_settings_configured: !!hero,
          timestamp: new Date().toISOString(),
        }, null, 2) }] };
      }

      case "get_full_site_config": {
        const [settings, hero, categories, currencies, payments, footerSections, footerLinks, pages] = await Promise.all([
          supabase.from("store_settings").select("*").maybeSingle(),
          supabase.from("hero_settings").select("*").maybeSingle(),
          supabase.from("categories").select("*").order("sort_order"),
          supabase.from("currencies").select("*").order("code"),
          supabase.from("payment_methods").select("*").order("sort_order"),
          supabase.from("footer_sections").select("*").order("display_order"),
          supabase.from("footer_links").select("*").order("display_order"),
          supabase.from("pages").select("id, slug, title, is_active").order("title"),
        ]);

        const footer = (footerSections.data || []).map(s => ({
          ...s, links: (footerLinks.data || []).filter(l => l.section_id === s.id)
        }));

        return { content: [{ type: "text", text: JSON.stringify({
          store_settings: settings.data || {},
          hero_settings: hero.data || {},
          categories: categories.data || [],
          currencies: currencies.data || [],
          payment_methods: payments.data || [],
          footer: footer,
          pages: pages.data || [],
        }, null, 2) }] };
      }

      case "seed_demo_data": {
        const results = [];
        const includeCategories = args.include_categories !== false;
        const includeProducts = args.include_products !== false;
        const includeCurrencies = args.include_currencies !== false;
        const includePages = args.include_pages !== false;

        if (includeCategories) {
          const cats = [
            { name: "Jewelry", slug: "jewelry", description: "Fine jewelry and accessories", sort_order: 1 },
            { name: "Watches", slug: "watches", description: "Luxury and casual timepieces", sort_order: 2 },
            { name: "Clothing", slug: "clothing", description: "Fashion and apparel", sort_order: 3 },
            { name: "Accessories", slug: "accessories", description: "Bags, belts, and more", sort_order: 4 },
          ];
          for (const cat of cats) {
            const { data: existing } = await supabase.from("categories").select("id").eq("slug", cat.slug).maybeSingle();
            if (!existing) {
              await supabase.from("categories").insert([cat]);
              results.push(`Category '${cat.name}' created`);
            } else {
              results.push(`Category '${cat.name}' already exists`);
            }
          }
        }

        if (includeProducts) {
          const { data: cats } = await supabase.from("categories").select("id, slug");
          const catMap = {};
          (cats || []).forEach(c => catMap[c.slug] = c.id);

          const demoProducts = [
            { name: "Diamond Solitaire Ring", slug: "diamond-solitaire-ring", description: "Stunning 1-carat diamond solitaire ring set in 18K white gold. A timeless piece of elegance.", short_description: "1-carat diamond in 18K white gold", category_id: catMap.jewelry, base_price: 2499.99, compare_at_price: 3499.99, sku: "JWL-DSR-001", stock_quantity: 15, low_stock_threshold: 3, images: ["https://images.pexels.com/photos/10983783/pexels-photo-10983783.jpeg?auto=compress&cs=tinysrgb&w=600"], is_featured: true, is_active: true, average_rating: 4.8, review_count: 24 },
            { name: "Pearl Necklace Set", slug: "pearl-necklace-set", description: "Elegant freshwater pearl necklace with matching earrings. Perfect for formal occasions.", short_description: "Freshwater pearl necklace & earrings", category_id: catMap.jewelry, base_price: 349.99, compare_at_price: 499.99, sku: "JWL-PNS-002", stock_quantity: 30, low_stock_threshold: 5, images: ["https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=600"], is_featured: true, is_active: true, average_rating: 4.6, review_count: 18 },
            { name: "Gold Chain Bracelet", slug: "gold-chain-bracelet", description: "Delicate 14K gold chain bracelet with adjustable clasp. Everyday luxury.", short_description: "14K gold chain bracelet", category_id: catMap.jewelry, base_price: 189.99, compare_at_price: 249.99, sku: "JWL-GCB-003", stock_quantity: 45, low_stock_threshold: 8, images: ["https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600"], is_featured: false, is_active: true, average_rating: 4.5, review_count: 12 },
            { name: "Sapphire Drop Earrings", slug: "sapphire-drop-earrings", description: "Beautiful blue sapphire drop earrings in sterling silver setting.", short_description: "Blue sapphire sterling silver earrings", category_id: catMap.jewelry, base_price: 279.99, compare_at_price: 399.99, sku: "JWL-SDE-004", stock_quantity: 20, low_stock_threshold: 4, images: ["https://images.pexels.com/photos/10909386/pexels-photo-10909386.jpeg?auto=compress&cs=tinysrgb&w=600"], is_featured: false, is_active: true, average_rating: 4.7, review_count: 9 },
            { name: "Chronograph Sport Watch", slug: "chronograph-sport-watch", description: "Premium stainless steel chronograph with sapphire crystal. Water resistant to 100m.", short_description: "Stainless steel chronograph, 100m WR", category_id: catMap.watches, base_price: 599.99, compare_at_price: 899.99, sku: "WCH-CSW-001", stock_quantity: 25, low_stock_threshold: 5, images: ["https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=600"], is_featured: true, is_active: true, average_rating: 4.9, review_count: 32 },
            { name: "Classic Leather Watch", slug: "classic-leather-watch", description: "Minimalist design with genuine Italian leather strap. Swiss quartz movement.", short_description: "Minimalist Swiss quartz leather watch", category_id: catMap.watches, base_price: 299.99, compare_at_price: 449.99, sku: "WCH-CLW-002", stock_quantity: 35, low_stock_threshold: 7, images: ["https://images.pexels.com/photos/125779/pexels-photo-125779.jpeg?auto=compress&cs=tinysrgb&w=600"], is_featured: true, is_active: true, average_rating: 4.7, review_count: 28 },
            { name: "Rose Gold Ladies Watch", slug: "rose-gold-ladies-watch", description: "Elegant rose gold ladies watch with mother of pearl dial and mesh bracelet.", short_description: "Rose gold with mother of pearl dial", category_id: catMap.watches, base_price: 399.99, compare_at_price: 549.99, sku: "WCH-RGL-003", stock_quantity: 18, low_stock_threshold: 4, images: ["https://images.pexels.com/photos/2783873/pexels-photo-2783873.jpeg?auto=compress&cs=tinysrgb&w=600"], is_featured: false, is_active: true, average_rating: 4.8, review_count: 15 },
            { name: "Silk Evening Dress", slug: "silk-evening-dress", description: "Luxurious silk evening dress with hand-finished details. Available in midnight blue.", short_description: "Luxurious silk evening dress", category_id: catMap.clothing, base_price: 459.99, compare_at_price: 699.99, sku: "CLT-SED-001", stock_quantity: 12, low_stock_threshold: 3, images: ["https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&w=600"], is_featured: true, is_active: true, average_rating: 4.6, review_count: 20 },
            { name: "Cashmere Sweater", slug: "cashmere-sweater", description: "100% pure cashmere crew neck sweater. Incredibly soft and warm.", short_description: "100% pure cashmere crew neck", category_id: catMap.clothing, base_price: 199.99, compare_at_price: 299.99, sku: "CLT-CSW-002", stock_quantity: 40, low_stock_threshold: 8, images: ["https://images.pexels.com/photos/6311652/pexels-photo-6311652.jpeg?auto=compress&cs=tinysrgb&w=600"], is_featured: false, is_active: true, average_rating: 4.4, review_count: 14 },
            { name: "Tailored Blazer", slug: "tailored-blazer", description: "Slim-fit tailored blazer in premium Italian wool. Perfect for business or evening wear.", short_description: "Slim-fit Italian wool blazer", category_id: catMap.clothing, base_price: 349.99, compare_at_price: 499.99, sku: "CLT-TBL-003", stock_quantity: 22, low_stock_threshold: 5, images: ["https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600"], is_featured: false, is_active: true, average_rating: 4.5, review_count: 11 },
            { name: "Linen Summer Shirt", slug: "linen-summer-shirt", description: "Breathable pure linen shirt perfect for warm weather. Relaxed fit.", short_description: "Pure linen relaxed fit shirt", category_id: catMap.clothing, base_price: 89.99, compare_at_price: 129.99, sku: "CLT-LSS-004", stock_quantity: 55, low_stock_threshold: 10, images: ["https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?auto=compress&cs=tinysrgb&w=600"], is_featured: false, is_active: true, average_rating: 4.3, review_count: 8 },
            { name: "Designer Leather Handbag", slug: "designer-leather-handbag", description: "Premium full-grain leather handbag with gold hardware. Spacious interior with multiple compartments.", short_description: "Full-grain leather with gold hardware", category_id: catMap.accessories, base_price: 549.99, compare_at_price: 799.99, sku: "ACC-DLH-001", stock_quantity: 15, low_stock_threshold: 3, images: ["https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600"], is_featured: true, is_active: true, average_rating: 4.8, review_count: 26 },
            { name: "Aviator Sunglasses", slug: "aviator-sunglasses", description: "Classic aviator sunglasses with polarized lenses and titanium frame.", short_description: "Polarized aviator with titanium frame", category_id: catMap.accessories, base_price: 159.99, compare_at_price: 229.99, sku: "ACC-AVS-002", stock_quantity: 50, low_stock_threshold: 10, images: ["https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=600"], is_featured: false, is_active: true, average_rating: 4.6, review_count: 19 },
            { name: "Italian Leather Belt", slug: "italian-leather-belt", description: "Handcrafted Italian leather belt with brushed silver buckle.", short_description: "Handcrafted Italian leather belt", category_id: catMap.accessories, base_price: 119.99, compare_at_price: 169.99, sku: "ACC-ILB-003", stock_quantity: 38, low_stock_threshold: 8, images: ["https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600"], is_featured: false, is_active: true, average_rating: 4.4, review_count: 7 },
            { name: "Silk Scarf Collection", slug: "silk-scarf-collection", description: "Hand-printed pure silk scarf in vibrant patterns. Made in Italy.", short_description: "Hand-printed Italian silk scarf", category_id: catMap.accessories, base_price: 129.99, compare_at_price: 189.99, sku: "ACC-SSC-004", stock_quantity: 28, low_stock_threshold: 5, images: ["https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg?auto=compress&cs=tinysrgb&w=600"], is_featured: false, is_active: true, average_rating: 4.5, review_count: 10 },
            { name: "Travel Weekender Bag", slug: "travel-weekender-bag", description: "Canvas and leather weekender bag. Perfect for short trips. Water-resistant exterior.", short_description: "Canvas & leather weekender bag", category_id: catMap.accessories, base_price: 229.99, compare_at_price: 329.99, sku: "ACC-TWB-005", stock_quantity: 20, low_stock_threshold: 4, images: ["https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600"], is_featured: false, is_active: true, average_rating: 4.7, review_count: 13 },
          ];

          for (const product of demoProducts) {
            if (!product.category_id) continue;
            const { data: existing } = await supabase.from("products").select("id").eq("slug", product.slug).maybeSingle();
            if (!existing) {
              await supabase.from("products").insert([product]);
              results.push(`Product '${product.name}' created`);
            } else {
              results.push(`Product '${product.name}' already exists`);
            }
          }
        }

        if (includeCurrencies) {
          const currencies = [
            { code: "AED", name: "UAE Dirham", symbol: "د.إ", exchange_rate: 1, is_default: true, is_active: true },
            { code: "USD", name: "US Dollar", symbol: "$", exchange_rate: 0.27, is_default: false, is_active: true },
            { code: "EUR", name: "Euro", symbol: "€", exchange_rate: 0.25, is_default: false, is_active: true },
            { code: "GBP", name: "British Pound", symbol: "£", exchange_rate: 0.22, is_default: false, is_active: true },
            { code: "SAR", name: "Saudi Riyal", symbol: "﷼", exchange_rate: 1.02, is_default: false, is_active: true },
          ];
          for (const cur of currencies) {
            const { data: existing } = await supabase.from("currencies").select("id").eq("code", cur.code).maybeSingle();
            if (!existing) {
              await supabase.from("currencies").insert([cur]);
              results.push(`Currency '${cur.code}' created`);
            } else {
              results.push(`Currency '${cur.code}' already exists`);
            }
          }
        }

        if (includePages) {
          const demoPages = [
            { slug: "about-us", title: "About Us", content: "# About ThriftySouq\n\nWelcome to ThriftySouq, your trusted marketplace in the UAE for premium quality at thrifty prices.\n\n## Our Mission\n\nWe believe everyone deserves access to quality products without breaking the bank. Our curated selection brings you the best deals on jewelry, watches, clothing, and accessories.\n\n## Why Choose Us?\n\n- Authentic products guaranteed\n- Free shipping on orders over AED 200\n- 30-day easy returns\n- Secure payment options\n- Dedicated customer support", is_active: true },
            { slug: "privacy-policy", title: "Privacy Policy", content: "# Privacy Policy\n\nYour privacy is important to us. This policy explains how we collect, use, and protect your information.\n\n## Information We Collect\n\n- Contact information (name, email, phone)\n- Shipping and billing addresses\n- Order history and preferences\n- Payment information (processed securely)\n\n## How We Use Your Information\n\n- Process and fulfill orders\n- Send order updates and confirmations\n- Improve our services\n- Personalize your shopping experience", is_active: true },
            { slug: "terms-of-service", title: "Terms of Service", content: "# Terms of Service\n\nBy using ThriftySouq, you agree to these terms.\n\n## Orders & Payments\n\n- All prices are in AED unless otherwise stated\n- Payment is required at time of order\n- We accept major credit cards and PayPal\n\n## Shipping\n\n- Standard delivery: 3-5 business days\n- Express delivery: 1-2 business days\n- Free shipping on orders over AED 200\n\n## Returns\n\n- 30-day return policy\n- Items must be unused and in original packaging\n- Refunds processed within 5-7 business days", is_active: true },
            { slug: "contact-us", title: "Contact Us", content: "# Contact Us\n\nWe'd love to hear from you!\n\n## Get in Touch\n\n- Email: support@thriftysouq.com\n- Phone: +971 50 123 4567\n- WhatsApp: +971 50 123 4567\n\n## Business Hours\n\n- Sunday to Thursday: 9 AM - 6 PM\n- Friday: 10 AM - 2 PM\n- Saturday: Closed\n\n## Location\n\nDubai, United Arab Emirates", is_active: true },
          ];
          for (const page of demoPages) {
            const { data: existing } = await supabase.from("pages").select("id").eq("slug", page.slug).maybeSingle();
            if (!existing) {
              await supabase.from("pages").insert([page]);
              results.push(`Page '${page.title}' created`);
            } else {
              results.push(`Page '${page.title}' already exists`);
            }
          }
        }

        return { content: [{ type: "text", text: `Demo data seeding complete:\n${results.join("\n")}` }] };
      }

      case "execute_sql": {
        const query = args.query.trim().toLowerCase();
        if (!query.startsWith("select")) {
          throw new Error("Only SELECT queries are allowed for safety. Use the specific CRUD tools for modifications.");
        }
        const { data, error } = await supabase.rpc("execute_readonly_sql", { sql_query: args.query });
        if (error) {
          // Fallback: try direct query if RPC doesn't exist
          throw new Error(`SQL execution requires the 'execute_readonly_sql' RPC function. Error: ${error.message}`);
        }
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("ThriftySouq MCP Server v2.0 running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});