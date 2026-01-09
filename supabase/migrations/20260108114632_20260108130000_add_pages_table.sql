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

-- Insert default pages for a Dubai e-commerce site
-- Using simple slugs that match common footer link patterns
INSERT INTO pages (slug, title, content, is_active) VALUES
('about', 'About ThriftySouq', '# About ThriftySouq

Your trusted marketplace in the UAE for premium quality at thrifty prices.

## Our Story

Founded in Dubai, ThriftySouq was born from a simple idea: everyone deserves access to quality products at fair prices. We''ve built a curated marketplace that brings together the best brands and independent sellers across the UAE and GCC region.

## Our Mission

To provide UAE residents and visitors with access to premium products at competitive prices, backed by exceptional customer service and fast delivery.

## Why Choose Us?

- 100% authentic products
- Same-day delivery in Dubai
- Cash on Delivery available
- 14-day return policy
- Arabic & English customer support
- Secure payment options including Tabby

## Our Location

Dubai Silicon Oasis, Dubai, UAE

Trade License: Dubai DED Licensed', true),

('contact', 'Contact Us', '# Contact Us

We''d love to hear from you! Get in touch with our customer support team.

## Contact Information

- Email: support@thriftysouq.ae
- Phone: +971 4 123 4567
- WhatsApp: +971 50 123 4567

## Business Hours

Sunday - Thursday: 9AM - 6PM GST
Friday - Saturday: Closed

## Our Address

Dubai Silicon Oasis
Dubai, United Arab Emirates

## Response Time

We aim to respond to all inquiries within 24 hours during business days.', true),

('shipping', 'Shipping Information', '# Shipping Information

## Free Shipping on Orders Over AED 200!

### Dubai & Sharjah
Same Day / Next Day Delivery - AED 15

### Abu Dhabi & Northern Emirates
1-2 business days - AED 25

### GCC Countries
3-5 business days - AED 50

### International
5-10 business days - Rates vary by destination

## Order Processing

All orders are processed within 1-2 business days. You''ll receive a tracking number via SMS and email once your order ships.

## Cash on Delivery

COD is available for all UAE orders. A small COD fee of AED 10 applies.

## Tracking Your Order

Once shipped, you''ll receive tracking information via:
- SMS
- Email
- WhatsApp (on request)', true),

('returns', 'Returns & Refunds', '# Returns & Refunds

## 14-Day Return Policy

We stand behind the quality of our products. If you''re not completely satisfied, return your purchase within 14 days for a full refund or exchange.

## Return Conditions

- Items must be in original condition with tags attached
- Returns are free for defective items
- Refunds processed within 5-7 business days
- Original shipping costs are non-refundable
- COD orders refunded via bank transfer

## How to Return

1. Contact our support team via WhatsApp or email
2. Provide your order number
3. We''ll arrange pickup or provide return instructions
4. Refund processed once item is received and inspected

## Exchanges

We offer free exchanges for different sizes or colors, subject to availability.', true),

('faq', 'Frequently Asked Questions', '# Frequently Asked Questions

### How do I track my order?
Once your order ships, you''ll receive a tracking number via SMS and email. You can also track via WhatsApp.

### What payment methods do you accept?
We accept Visa, Mastercard, Apple Pay, Samsung Pay, Tabby (Buy Now Pay Later), and Cash on Delivery (COD) for UAE orders.

### Do you ship internationally?
Yes! We ship to GCC countries and worldwide. International shipping rates vary by destination.

### Are your products authentic?
Absolutely! All our products are 100% authentic and sourced from authorized distributors.

### Is Cash on Delivery available?
Yes, COD is available for all UAE orders. A small COD fee of AED 10 applies.

### How can I change or cancel my order?
Contact us immediately via WhatsApp at +971 50 123 4567. Orders can only be modified before they ship.

### What is your return policy?
We offer a 14-day return policy. Items must be in original condition with tags attached.

### How long does delivery take?
Dubai & Sharjah: Same/Next day. Other Emirates: 1-2 days. GCC: 3-5 days.', true),

('privacy', 'Privacy Policy', '# Privacy Policy

Last updated: January 2026

## Information We Collect

We collect information you provide directly to us, including name, email address, phone number, shipping address, and payment information when you make a purchase.

## How We Use Your Information

We use your information to:
- Process and fulfill your orders
- Communicate with you about your purchases via SMS/WhatsApp/Email
- Improve our services and customer experience
- Send promotional offers (with your consent)

We never sell your personal information to third parties.

## Data Security

We implement industry-standard security measures to protect your personal information. All payment transactions are encrypted using SSL technology and processed through PCI-DSS compliant payment gateways.

## UAE Data Protection

We comply with UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection. Your data is stored securely within the UAE.

## Your Rights

You have the right to:
- Access your personal information
- Correct inaccurate data
- Delete your personal information
- Opt-out of marketing communications

Contact us at privacy@thriftysouq.ae for assistance.', true),

('terms', 'Terms of Service', '# Terms of Service

Last updated: January 2026

## Agreement to Terms

By accessing and using ThriftySouq, you agree to be bound by these Terms of Service and all applicable UAE laws and regulations.

## Use of Service

- You must be at least 18 years old to make purchases
- You agree to provide accurate and complete information
- You are responsible for maintaining the security of your account

## Products and Pricing

- All prices are in UAE Dirhams (AED) and include VAT where applicable
- Prices are subject to change without notice
- We reserve the right to limit quantities
- Product images are for illustration purposes

## Orders and Payment

- Orders are subject to acceptance and availability
- Payment must be received before dispatch (except COD)
- We accept Visa, Mastercard, Apple Pay, and COD

## Intellectual Property

All content on this website is the property of ThriftySouq and protected by UAE and international copyright laws.

## Governing Law

These terms shall be governed by and construed in accordance with the laws of the United Arab Emirates. Any disputes shall be subject to the exclusive jurisdiction of the Dubai Courts.

## Contact

For questions about these terms, contact legal@thriftysouq.ae', true),

('cookies', 'Cookie Policy', '# Cookie Policy

Last updated: January 2026

## What Are Cookies

Cookies are small text files stored on your device when you visit our website. They help us provide you with a better experience.

## How We Use Cookies

We use cookies to:
- Remember your preferences and settings
- Keep you signed in to your account
- Understand how you use our website
- Improve our services

## Types of Cookies We Use

### Essential Cookies
Required for the website to function properly. Cannot be disabled.

### Analytics Cookies
Help us understand how visitors interact with our website.

### Marketing Cookies
Used to deliver relevant advertisements and track campaign performance.

## Managing Cookies

You can control cookies through your browser settings. Note that disabling certain cookies may affect website functionality.

## Contact

For questions about our cookie policy, contact privacy@thriftysouq.ae', true),

('accessibility', 'Accessibility Statement', '# Accessibility Statement

ThriftySouq is committed to ensuring digital accessibility for people with disabilities.

## Our Commitment

We strive to ensure that our website is accessible to all users, regardless of ability or technology.

## Accessibility Features

- Keyboard navigation support
- Screen reader compatibility
- Clear and consistent navigation
- Sufficient color contrast
- Resizable text
- Alternative text for images

## Feedback

We welcome your feedback on the accessibility of our website. Please contact us if you encounter any barriers:

- Email: accessibility@thriftysouq.ae
- Phone: +971 4 123 4567

## Continuous Improvement

We are continuously working to improve the accessibility of our website and services.', true)

ON CONFLICT (slug) DO NOTHING;
