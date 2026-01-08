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
    version: "1.0.0",
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

  // ============ COUPONS ============
  {
    name: "list_coupons",
    description: "List all coupons",
    inputSchema: {
      type: "object",
      properties: {
        is_active: { type: "boolean", description: "Filter by active status" },
      },
    },
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
        code: { type: "string" },
        description: { type: "string" },
        discount_type: { type: "string", enum: ["percentage", "fixed"] },
        discount_value: { type: "number" },
        min_purchase_amount: { type: "number" },
        max_discount_amount: { type: "number" },
        usage_limit: { type: "number" },
        start_date: { type: "string" },
        end_date: { type: "string" },
        is_active: { type: "boolean" },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_coupon",
    description: "Delete a coupon",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Coupon ID" },
      },
      required: ["id"],
    },
  },

  // ============ CURRENCIES ============
  {
    name: "list_currencies",
    description: "List all currencies",
    inputSchema: {
      type: "object",
      properties: {},
    },
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
        code: { type: "string" },
        name: { type: "string" },
        symbol: { type: "string" },
        exchange_rate: { type: "number" },
        is_default: { type: "boolean" },
        is_active: { type: "boolean" },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_currency",
    description: "Delete a currency",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Currency ID" },
      },
      required: ["id"],
    },
  },

  // ============ STORE SETTINGS ============
  {
    name: "get_store_settings",
    description: "Get store settings",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "update_store_settings",
    description: "Update store settings",
    inputSchema: {
      type: "object",
      properties: {
        store_name: { type: "string", description: "Store name" },
        store_description: { type: "string", description: "Store description" },
        contact_email: { type: "string", description: "Contact email" },
        contact_phone: { type: "string", description: "Contact phone" },
        logo_url: { type: "string", description: "Logo URL" },
        tax_rate: { type: "number", description: "Default tax rate percentage" },
        default_currency: { type: "string", description: "Default currency code" },
        timezone: { type: "string", description: "Store timezone" },
      },
    },
  },

  // ============ HERO SETTINGS ============
  {
    name: "get_hero_settings",
    description: "Get hero section settings",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "update_hero_settings",
    description: "Update hero section settings",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Hero title" },
        subtitle: { type: "string", description: "Hero subtitle" },
        badge_text: { type: "string", description: "Badge text above title" },
        background_image_url: { type: "string", description: "Background image URL" },
        primary_button_text: { type: "string", description: "Primary button text" },
        primary_button_link: { type: "string", description: "Primary button link" },
        secondary_button_text: { type: "string", description: "Secondary button text" },
        secondary_button_link: { type: "string", description: "Secondary button link" },
        features: { 
          type: "array", 
          description: "Feature highlights array with icon and text",
          items: {
            type: "object",
            properties: {
              icon: { type: "string", description: "Icon name (truck, shield, refresh)" },
              text: { type: "string", description: "Feature text" }
            }
          }
        },
        stats: { 
          type: "array", 
          description: "Stats cards array with value, label, and icon",
          items: {
            type: "object",
            properties: {
              value: { type: "string", description: "Stat value (e.g., 10K+)" },
              label: { type: "string", description: "Stat label" },
              icon: { type: "string", description: "Icon name (users, package, star)" }
            }
          }
        },
        is_active: { type: "boolean", description: "Show hero section" },
      },
    },
  },

  // ============ FOOTER ============
  {
    name: "list_footer_sections",
    description: "List footer sections and links",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "create_footer_section",
    description: "Create a footer section",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Section title" },
        display_order: { type: "number", description: "Display order" },
        is_active: { type: "boolean", description: "Active status" },
      },
      required: ["title"],
    },
  },
  {
    name: "create_footer_link",
    description: "Create a footer link",
    inputSchema: {
      type: "object",
      properties: {
        section_id: { type: "string", description: "Footer section ID" },
        label: { type: "string", description: "Link label" },
        url: { type: "string", description: "Link URL" },
        display_order: { type: "number", description: "Display order" },
        is_active: { type: "boolean", description: "Active status" },
      },
      required: ["section_id", "label", "url"],
    },
  },
  {
    name: "update_footer_link",
    description: "Update a footer link",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Link ID" },
        label: { type: "string" },
        url: { type: "string" },
        display_order: { type: "number" },
        is_active: { type: "boolean" },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_footer_link",
    description: "Delete a footer link",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Link ID" },
      },
      required: ["id"],
    },
  },

  // ============ ANALYTICS & REPORTS ============
  {
    name: "get_dashboard_stats",
    description: "Get dashboard statistics including revenue, orders, products, and ratings",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_sales_report",
    description: "Get sales report for a date range",
    inputSchema: {
      type: "object",
      properties: {
        date_from: { type: "string", description: "Start date (ISO format)" },
        date_to: { type: "string", description: "End date (ISO format)" },
        group_by: { type: "string", enum: ["day", "week", "month"], description: "Group results by period" },
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
        sort_by: { type: "string", enum: ["sales", "revenue", "rating", "reviews"], description: "Sort criteria" },
        limit: { type: "number", description: "Number of products to return" },
      },
    },
  },
  {
    name: "get_low_stock_products",
    description: "Get products with low stock",
    inputSchema: {
      type: "object",
      properties: {
        threshold: { type: "number", description: "Stock threshold (uses product's low_stock_threshold if not provided)" },
      },
    },
  },

  // ============ PAYMENT METHODS ============
  {
    name: "list_payment_methods",
    description: "List all payment methods",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "create_payment_method",
    description: "Create a payment method",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Payment method name" },
        code: { type: "string", description: "Payment method code" },
        description: { type: "string", description: "Description" },
        icon: { type: "string", description: "Icon name" },
        is_active: { type: "boolean", description: "Active status" },
        sort_order: { type: "number", description: "Display order" },
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
        id: { type: "string", description: "Payment method ID" },
        name: { type: "string" },
        code: { type: "string" },
        description: { type: "string" },
        icon: { type: "string" },
        is_active: { type: "boolean" },
        sort_order: { type: "number" },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_payment_method",
    description: "Delete a payment method",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Payment method ID" },
      },
      required: ["id"],
    },
  },

  // ============ ADMIN USERS ============
  {
    name: "list_admin_users",
    description: "List all admin users",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "create_admin_user",
    description: "Create a new admin user",
    inputSchema: {
      type: "object",
      properties: {
        email: { type: "string", description: "Email address" },
        password: { type: "string", description: "Password" },
        first_name: { type: "string", description: "First name" },
        last_name: { type: "string", description: "Last name" },
        role: { type: "string", enum: ["super_admin", "admin", "editor", "viewer"], description: "User role" },
        is_active: { type: "boolean", description: "Active status" },
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
        id: { type: "string", description: "User ID" },
        email: { type: "string" },
        first_name: { type: "string" },
        last_name: { type: "string" },
        role: { type: "string", enum: ["super_admin", "admin", "editor", "viewer"] },
        is_active: { type: "boolean" },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_admin_user",
    description: "Delete an admin user",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "User ID" },
      },
      required: ["id"],
    },
  },

  // ============ PAGES ============
  {
    name: "list_pages",
    description: "List all content pages (About Us, Privacy Policy, etc.)",
    inputSchema: {
      type: "object",
      properties: {
        is_active: { type: "boolean", description: "Filter by active status" },
      },
    },
  },
  {
    name: "get_page",
    description: "Get a page by ID or slug",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Page ID" },
        slug: { type: "string", description: "Page slug" },
      },
    },
  },
  {
    name: "create_page",
    description: "Create a new content page",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "URL slug (e.g., about-us, privacy-policy)" },
        title: { type: "string", description: "Page title" },
        content: { type: "string", description: "Page content (supports # headings, - lists)" },
        is_active: { type: "boolean", description: "Active status" },
      },
      required: ["slug", "title", "content"],
    },
  },
  {
    name: "update_page",
    description: "Update a content page",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Page ID" },
        slug: { type: "string" },
        title: { type: "string" },
        content: { type: "string" },
        is_active: { type: "boolean" },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_page",
    description: "Delete a content page",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Page ID" },
      },
      required: ["id"],
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
        return { content: [{ type: "text", text: `Product updated successfully:\n${JSON.stringify(data, null, 2)}` }] };
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
          .eq("id", args.id)
          .select("id, name, stock_quantity")
          .single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Stock updated:\n${JSON.stringify(data, null, 2)}` }] };
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

        const { data: items, error: itemsError } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", order.id);
        if (itemsError) throw itemsError;

        return { content: [{ type: "text", text: JSON.stringify({ ...order, items }, null, 2) }] };
      }

      case "update_order_status": {
        const { data, error } = await supabase
          .from("orders")
          .update({ status: args.status, updated_at: new Date().toISOString() })
          .eq("id", args.id)
          .select("id, order_number, status")
          .single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Order status updated:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "update_payment_status": {
        const { data, error } = await supabase
          .from("orders")
          .update({ payment_status: args.payment_status, updated_at: new Date().toISOString() })
          .eq("id", args.id)
          .select("id, order_number, payment_status")
          .single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Payment status updated:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "add_order_note": {
        const { data: order } = await supabase.from("orders").select("notes").eq("id", args.id).single();
        const existingNotes = order?.notes || "";
        const timestamp = new Date().toISOString();
        const newNotes = existingNotes ? `${existingNotes}\n\n[${timestamp}] ${args.note}` : `[${timestamp}] ${args.note}`;
        
        const { data, error } = await supabase
          .from("orders")
          .update({ notes: newNotes, updated_at: new Date().toISOString() })
          .eq("id", args.id)
          .select("id, order_number, notes")
          .single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Note added to order:\n${JSON.stringify(data, null, 2)}` }] };
      }

      // ============ CUSTOMERS ============
      case "list_customers": {
        let query = supabase.from("customers").select("*").order("created_at", { ascending: false });
        if (args.search) {
          query = query.or(`email.ilike.%${args.search}%,first_name.ilike.%${args.search}%,last_name.ilike.%${args.search}%`);
        }
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

        const { data: orders } = await supabase
          .from("orders")
          .select("id, order_number, total_amount, status, created_at")
          .eq("customer_id", customer.id)
          .order("created_at", { ascending: false })
          .limit(10);

        return { content: [{ type: "text", text: JSON.stringify({ ...customer, recent_orders: orders }, null, 2) }] };
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
        const { data, error } = await supabase
          .from("product_reviews")
          .update({ is_approved: args.is_approved, updated_at: new Date().toISOString() })
          .eq("id", args.id)
          .select("id, customer_name, is_approved")
          .single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Review ${args.is_approved ? "approved" : "unapproved"}:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "respond_to_review": {
        const { data, error } = await supabase
          .from("product_reviews")
          .update({ admin_response: args.admin_response, updated_at: new Date().toISOString() })
          .eq("id", args.id)
          .select("id, customer_name, admin_response")
          .single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Response added:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "delete_review": {
        const { error } = await supabase.from("product_reviews").delete().eq("id", args.id);
        if (error) throw error;
        return { content: [{ type: "text", text: `Review ${args.id} deleted successfully` }] };
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
        const couponData = { ...args, code: args.code.toUpperCase() };
        const { data, error } = await supabase.from("coupons").insert([couponData]).select().single();
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
        return { content: [{ type: "text", text: `Coupon ${args.id} deleted successfully` }] };
      }

      // ============ CURRENCIES ============
      case "list_currencies": {
        const { data, error } = await supabase.from("currencies").select("*").order("code");
        if (error) throw error;
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "create_currency": {
        if (args.is_default) {
          await supabase.from("currencies").update({ is_default: false }).neq("id", "00000000-0000-0000-0000-000000000000");
        }
        const { data, error } = await supabase.from("currencies").insert([args]).select().single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Currency created:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "update_currency": {
        const { id, ...updates } = args;
        if (updates.is_default) {
          await supabase.from("currencies").update({ is_default: false }).neq("id", id);
        }
        updates.updated_at = new Date().toISOString();
        const { data, error } = await supabase.from("currencies").update(updates).eq("id", id).select().single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Currency updated:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "delete_currency": {
        const { error } = await supabase.from("currencies").delete().eq("id", args.id);
        if (error) throw error;
        return { content: [{ type: "text", text: `Currency ${args.id} deleted successfully` }] };
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
          const { data, error } = await supabase
            .from("store_settings")
            .update({ ...args, updated_at: new Date().toISOString() })
            .eq("id", existing.id)
            .select()
            .single();
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
          const { data, error } = await supabase
            .from("hero_settings")
            .update({ ...args, updated_at: new Date().toISOString() })
            .eq("id", existing.id)
            .select()
            .single();
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
        const { data: sections, error: sectionsError } = await supabase
          .from("footer_sections")
          .select("*")
          .order("display_order");
        if (sectionsError) throw sectionsError;

        const { data: links, error: linksError } = await supabase
          .from("footer_links")
          .select("*")
          .order("display_order");
        if (linksError) throw linksError;

        const result = sections.map(section => ({
          ...section,
          links: links.filter(link => link.section_id === section.id)
        }));
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }

      case "create_footer_section": {
        const { data, error } = await supabase.from("footer_sections").insert([args]).select().single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Footer section created:\n${JSON.stringify(data, null, 2)}` }] };
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
        return { content: [{ type: "text", text: `Footer link ${args.id} deleted successfully` }] };
      }


      // ============ ANALYTICS & REPORTS ============
      case "get_dashboard_stats": {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [products, orders, reviews, customers] = await Promise.all([
          supabase.from("products").select("*"),
          supabase.from("orders").select("*"),
          supabase.from("product_reviews").select("*").eq("is_approved", false),
          supabase.from("customers").select("id"),
        ]);

        const productData = products.data || [];
        const orderData = orders.data || [];

        const stats = {
          total_products: productData.length,
          active_products: productData.filter(p => p.is_active).length,
          low_stock_products: productData.filter(p => p.stock_quantity <= p.low_stock_threshold).length,
          total_orders: orderData.length,
          pending_orders: orderData.filter(o => o.status === "pending").length,
          total_revenue: orderData.reduce((sum, o) => sum + (o.total_amount || 0), 0),
          today_orders: orderData.filter(o => new Date(o.created_at) >= today).length,
          today_revenue: orderData.filter(o => new Date(o.created_at) >= today).reduce((sum, o) => sum + (o.total_amount || 0), 0),
          average_rating: productData.length > 0 ? productData.reduce((sum, p) => sum + (p.average_rating || 0), 0) / productData.length : 0,
          pending_reviews: reviews.data?.length || 0,
          total_customers: customers.data?.length || 0,
        };

        return { content: [{ type: "text", text: JSON.stringify(stats, null, 2) }] };
      }

      case "get_sales_report": {
        const { data, error } = await supabase
          .from("orders")
          .select("id, order_number, total_amount, status, payment_status, created_at")
          .gte("created_at", args.date_from)
          .lte("created_at", args.date_to)
          .order("created_at", { ascending: true });
        if (error) throw error;

        const summary = {
          total_orders: data.length,
          total_revenue: data.reduce((sum, o) => sum + (o.total_amount || 0), 0),
          average_order_value: data.length > 0 ? data.reduce((sum, o) => sum + (o.total_amount || 0), 0) / data.length : 0,
          orders_by_status: data.reduce((acc, o) => {
            acc[o.status] = (acc[o.status] || 0) + 1;
            return acc;
          }, {}),
          orders: data,
        };

        return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
      }

      case "get_top_products": {
        const limit = args.limit || 10;
        let query = supabase.from("products").select("id, name, base_price, stock_quantity, average_rating, review_count, images");
        
        switch (args.sort_by) {
          case "rating":
            query = query.order("average_rating", { ascending: false });
            break;
          case "reviews":
            query = query.order("review_count", { ascending: false });
            break;
          default:
            query = query.order("review_count", { ascending: false });
        }
        
        const { data, error } = await query.limit(limit);
        if (error) throw error;
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "get_low_stock_products": {
        let query = supabase.from("products").select("id, name, sku, stock_quantity, low_stock_threshold, images");
        
        if (args.threshold) {
          query = query.lte("stock_quantity", args.threshold);
        } else {
          const { data: products } = await supabase.from("products").select("*");
          const lowStock = products?.filter(p => p.stock_quantity <= p.low_stock_threshold) || [];
          return { content: [{ type: "text", text: JSON.stringify(lowStock, null, 2) }] };
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
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
        return { content: [{ type: "text", text: `Payment method ${args.id} deleted successfully` }] };
      }


      // ============ ADMIN USERS ============
      case "list_admin_users": {
        const { data, error } = await supabase
          .from("admin_users")
          .select("id, email, first_name, last_name, role, is_active, last_login_at, created_at")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      }

      case "create_admin_user": {
        // Simple hash for demo - in production use proper bcrypt
        const encoder = new TextEncoder();
        const data = encoder.encode(args.password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const password_hash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        const { password, ...userData } = args;
        const { data: result, error } = await supabase
          .from("admin_users")
          .insert([{ ...userData, password_hash }])
          .select("id, email, first_name, last_name, role, is_active")
          .single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Admin user created:\n${JSON.stringify(result, null, 2)}` }] };
      }

      case "update_admin_user": {
        const { id, ...updates } = args;
        updates.updated_at = new Date().toISOString();
        const { data, error } = await supabase
          .from("admin_users")
          .update(updates)
          .eq("id", id)
          .select("id, email, first_name, last_name, role, is_active")
          .single();
        if (error) throw error;
        return { content: [{ type: "text", text: `Admin user updated:\n${JSON.stringify(data, null, 2)}` }] };
      }

      case "delete_admin_user": {
        const { error } = await supabase.from("admin_users").delete().eq("id", args.id);
        if (error) throw error;
        return { content: [{ type: "text", text: `Admin user ${args.id} deleted successfully` }] };
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
        return { content: [{ type: "text", text: `Page ${args.id} deleted successfully` }] };
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
  console.error("ThriftySouq MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
