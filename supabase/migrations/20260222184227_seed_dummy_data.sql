/*
  # Seed Dummy Data for ThriftySouq UAE Store

  This migration inserts realistic demo data for all key tables:
  1. Currencies - AED (default), USD, EUR, GBP
  2. Categories - 7 categories suited to a UAE thrift marketplace
  3. Products - 20 products across all categories with Pexels images
  4. Product Reviews - approved reviews for products
  5. Coupons - 4 active discount coupons
  6. Admin Users - default admin account
  7. Store Settings - updated with ThriftySouq branding
*/

-- ============================================================
-- CURRENCIES
-- ============================================================
INSERT INTO currencies (code, name, symbol, exchange_rate, is_default, is_active) VALUES
  ('AED', 'UAE Dirham', 'AED ', 1.0, true, true),
  ('USD', 'US Dollar', '$', 0.272, false, true),
  ('EUR', 'Euro', '€', 0.251, false, true),
  ('GBP', 'British Pound', '£', 0.214, false, true),
  ('SAR', 'Saudi Riyal', 'SAR ', 1.020, false, true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- STORE SETTINGS UPDATE
-- ============================================================
UPDATE store_settings SET
  store_name = 'ThriftySouq',
  store_description = 'Your trusted marketplace in the UAE for premium quality at thrifty prices. Discover value without compromise.',
  contact_email = 'hello@thriftysouq.ae',
  contact_phone = '+971 50 123 4567',
  tax_rate = 5,
  default_currency = 'AED',
  timezone = 'Asia/Dubai';

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO categories (id, name, slug, description, image_url, sort_order) VALUES
  ('11111111-0001-0001-0001-000000000001', 'Electronics', 'electronics', 'Pre-owned gadgets, phones, laptops and accessories in excellent condition', 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=600', 1),
  ('11111111-0001-0001-0001-000000000002', 'Fashion & Clothing', 'fashion', 'Designer and everyday wear for men, women and kids at unbeatable prices', 'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=600', 2),
  ('11111111-0001-0001-0001-000000000003', 'Home & Living', 'home-living', 'Quality furniture, decor and household essentials for your home', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600', 3),
  ('11111111-0001-0001-0001-000000000004', 'Beauty & Care', 'beauty-care', 'Skincare, fragrances and personal care products', 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=600', 4),
  ('11111111-0001-0001-0001-000000000005', 'Sports & Outdoors', 'sports-outdoors', 'Fitness equipment, sports gear and outdoor accessories', 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=600', 5),
  ('11111111-0001-0001-0001-000000000006', 'Kids & Toys', 'kids-toys', 'Educational toys, games and children''s essentials', 'https://images.pexels.com/photos/163696/toy-car-toy-box-mini-163696.jpeg?auto=compress&cs=tinysrgb&w=600', 6),
  ('11111111-0001-0001-0001-000000000007', 'Books & Media', 'books-media', 'Books, music, movies and educational materials', 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=600', 7)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PRODUCTS
-- ============================================================
INSERT INTO products (id, name, slug, description, short_description, category_id, base_price, compare_at_price, sku, stock_quantity, low_stock_threshold, images, specifications, is_featured, is_active, average_rating, review_count) VALUES

-- Electronics
('22222222-0001-0001-0001-000000000001',
 'Apple iPhone 13 Pro – 256GB',
 'apple-iphone-13-pro-256gb',
 'Pristine condition Apple iPhone 13 Pro with 256GB storage. Features a stunning ProMotion display, triple camera system, and A15 Bionic chip. Comes with original charger and box. Battery health at 93%.',
 'Pre-owned iPhone 13 Pro in pristine condition. 93% battery health.',
 '11111111-0001-0001-0001-000000000001',
 1899, 2799, 'ELEC-IP13-001', 8, 3,
 '["https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=800","https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=800"]',
 '{"Storage":"256GB","Color":"Graphite","Condition":"Excellent","Battery Health":"93%","Includes":"Original box & charger"}',
 true, true, 4.8, 24),

('22222222-0001-0001-0001-000000000002',
 'MacBook Air M2 – 8GB / 256GB',
 'macbook-air-m2-8gb-256gb',
 'Like-new MacBook Air with Apple M2 chip. Ultra-thin design, fanless operation, and all-day battery life. Perfect for work, study and creative projects. Minor scratches on bottom panel only.',
 'Like-new MacBook Air M2. Ultra-thin with all-day battery life.',
 '11111111-0001-0001-0001-000000000001',
 2999, 4299, 'ELEC-MBA-002', 4, 2,
 '["https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=800","https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800"]',
 '{"Chip":"Apple M2","RAM":"8GB","Storage":"256GB","Color":"Space Gray","Condition":"Good – minor cosmetic marks"}',
 true, true, 4.7, 18),

('22222222-0001-0001-0001-000000000003',
 'Sony WH-1000XM5 Headphones',
 'sony-wh-1000xm5-headphones',
 'Industry-leading noise cancelling headphones from Sony. 30-hour battery life, quick charge, and crystal-clear call quality. Includes carrying case and cables. Purchased 4 months ago, barely used.',
 'Sony''s best noise-cancelling headphones. 30hr battery, barely used.',
 '11111111-0001-0001-0001-000000000001',
 649, 1099, 'ELEC-SONY-003', 12, 4,
 '["https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800","https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=800"]',
 '{"Battery":"30 hours","Connectivity":"Bluetooth 5.2","Color":"Black","Condition":"Excellent","Includes":"Case & cables"}',
 false, true, 4.9, 31),

('22222222-0001-0001-0001-000000000004',
 'iPad Air 5th Gen – 64GB WiFi',
 'ipad-air-5th-gen-64gb-wifi',
 'Apple iPad Air 5th generation with M1 chip and 64GB storage. 10.9-inch Liquid Retina display. Includes Apple Pencil 1st Gen and Smart Folio case. Excellent condition, no scratches on screen.',
 'iPad Air 5th Gen M1 with Pencil & case. Perfect screen condition.',
 '11111111-0001-0001-0001-000000000001',
 1349, 2099, 'ELEC-IPAD-004', 6, 2,
 '["https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=800"]',
 '{"Chip":"Apple M1","Storage":"64GB","Display":"10.9-inch Liquid Retina","Condition":"Excellent","Includes":"Apple Pencil & Smart Folio"}',
 false, true, 4.6, 15),

-- Fashion & Clothing
('22222222-0001-0001-0001-000000000005',
 'Rolex Submariner – Style Watch',
 'rolex-submariner-style-watch',
 'Elegant Swiss-style dive watch with stainless steel bracelet and ceramic bezel. Water resistant to 100m. Automatic movement. Worn only a handful of times, comes in original box with all papers.',
 'Swiss-style dive watch, stainless steel, automatic movement.',
 '11111111-0001-0001-0001-000000000002',
 1750, 2500, 'FASH-WTCH-001', 3, 1,
 '["https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=800","https://images.pexels.com/photos/9978722/pexels-photo-9978722.jpeg?auto=compress&cs=tinysrgb&w=800"]',
 '{"Movement":"Automatic","Water Resistance":"100m","Case":"44mm Stainless Steel","Condition":"Very Good","Includes":"Original box & papers"}',
 true, true, 4.7, 9),

('22222222-0001-0001-0001-000000000006',
 'Levi''s 501 Original Jeans – W32 L32',
 'levis-501-original-jeans-w32-l32',
 'Classic Levi''s 501 straight fit jeans in dark indigo wash. W32 L32. Barely worn, like new condition. Authentic Levi''s with original tags still attached. Perfect wardrobe staple.',
 'Classic Levi''s 501 jeans, dark indigo, like new with original tags.',
 '11111111-0001-0001-0001-000000000002',
 129, 299, 'FASH-JEANS-002', 18, 5,
 '["https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800"]',
 '{"Brand":"Levi''s","Size":"W32 L32","Color":"Dark Indigo","Fit":"Straight 501","Condition":"Like New"}',
 false, true, 4.5, 22),

('22222222-0001-0001-0001-000000000007',
 'Nike Air Max 270 – Size 43',
 'nike-air-max-270-size-43',
 'Nike Air Max 270 in white/black colorway. Size EU 43 (UK 8.5). Worn twice, in excellent condition. The oversized Air unit provides all-day comfort. Includes original box and lace set.',
 'Nike Air Max 270, EU 43, white/black. Worn twice, excellent.',
 '11111111-0001-0001-0001-000000000002',
 349, 649, 'FASH-SHOE-003', 5, 2,
 '["https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800","https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800"]',
 '{"Brand":"Nike","Size":"EU 43 / UK 8.5","Color":"White/Black","Condition":"Excellent","Includes":"Original box"}',
 false, true, 4.4, 17),

('22222222-0001-0001-0001-000000000008',
 'Zara Women''s Maxi Dress – Size M',
 'zara-womens-maxi-dress-size-m',
 'Elegant Zara flowing maxi dress in dusty rose. Perfect for summer gatherings and formal occasions. Size M (UK 12). Worn once to a wedding. Dry-cleaned and professionally pressed. No stains or damage.',
 'Zara flowing maxi dress, dusty rose, size M. Worn once to a wedding.',
 '11111111-0001-0001-0001-000000000002',
 189, 399, 'FASH-DRSS-004', 7, 3,
 '["https://images.pexels.com/photos/972995/pexels-photo-972995.jpeg?auto=compress&cs=tinysrgb&w=800"]',
 '{"Brand":"Zara","Size":"M (UK 12)","Color":"Dusty Rose","Material":"100% Viscose","Condition":"Excellent – worn once"}',
 false, true, 4.6, 11),

-- Home & Living
('22222222-0001-0001-0001-000000000009',
 'DeLonghi Espresso Machine',
 'delonghi-espresso-machine',
 'De''Longhi Dedica Style pump espresso machine in sleek stainless steel. Makes barista-quality espresso, cappuccino and latte. Used for 6 months, then upgraded. All parts included, works perfectly.',
 'DeLonghi Dedica espresso machine. Barista quality at home.',
 '11111111-0001-0001-0001-000000000003',
 449, 799, 'HOME-COFF-001', 5, 2,
 '["https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=800","https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800"]',
 '{"Brand":"De''Longhi","Model":"Dedica Style","Pressure":"15 bar","Condition":"Good – minor marks on base","Includes":"Milk frother, tamper, all accessories"}',
 true, true, 4.8, 28),

('22222222-0001-0001-0001-000000000010',
 'IKEA Kallax Shelf Unit – 4x4',
 'ikea-kallax-shelf-unit-4x4',
 'White IKEA Kallax 4x4 shelving unit (147x147cm). Perfect for home office, living room or kids room. Includes 8 Kallax drawer inserts. Slight discoloration on top shelf – reflected in price. Self-assembly required.',
 'IKEA Kallax 4x4 shelf with 8 drawers. Great for any room.',
 '11111111-0001-0001-0001-000000000003',
 299, 599, 'HOME-FURN-002', 3, 1,
 '["https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800"]',
 '{"Brand":"IKEA","Dimensions":"147x147cm","Color":"White","Includes":"8 drawer inserts","Condition":"Good – minor top discoloration"}',
 false, true, 4.2, 8),

('22222222-0001-0001-0001-000000000011',
 'Dyson V11 Absolute Vacuum',
 'dyson-v11-absolute-vacuum',
 'Dyson V11 Absolute cordless vacuum cleaner. Powerful suction, LCD screen shows battery and mode. Includes all attachments (torque head, soft roller, mini motorhead and more). Used for 1 year, works perfectly.',
 'Dyson V11 Absolute cordless vacuum. All attachments included.',
 '11111111-0001-0001-0001-000000000003',
 799, 1599, 'HOME-DYS-003', 6, 2,
 '["https://images.pexels.com/photos/4107268/pexels-photo-4107268.jpeg?auto=compress&cs=tinysrgb&w=800"]',
 '{"Brand":"Dyson","Model":"V11 Absolute","Battery":"60 minutes","Condition":"Good – all parts working","Includes":"Full attachment set"}',
 true, true, 4.7, 19),

-- Beauty & Care
('22222222-0001-0001-0001-000000000012',
 'Chanel N°5 Eau de Parfum 50ml',
 'chanel-no5-eau-de-parfum-50ml',
 'Authentic Chanel N°5 Eau de Parfum, 50ml bottle. Approximately 80% full (around 40ml remaining). Stored in cool, dry place. Comes in original Chanel box. The timeless classic fragrance for women.',
 'Authentic Chanel N°5 EDP 50ml, ~80% full. Stored perfectly.',
 '11111111-0001-0001-0001-000000000004',
 549, 950, 'BEAU-CHAN-001', 4, 2,
 '["https://images.pexels.com/photos/755992/pexels-photo-755992.jpeg?auto=compress&cs=tinysrgb&w=800","https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=800"]',
 '{"Brand":"Chanel","Size":"50ml","Fill Level":"~80% (40ml)","Type":"Eau de Parfum","Condition":"Excellent – stored in box"}',
 true, true, 4.9, 35),

('22222222-0001-0001-0001-000000000013',
 'The Ordinary Skincare Bundle',
 'the-ordinary-skincare-bundle',
 'Complete The Ordinary skincare bundle: Niacinamide 10% + Zinc 1%, Hyaluronic Acid 2% + B5, AHA 30% + BHA 2% Peeling Solution, Vitamin C Suspension 23% + HA Spheres, and Caffeine Solution 5%. All sealed, unopened.',
 'The Ordinary 5-product bundle. All sealed and unopened.',
 '11111111-0001-0001-0001-000000000004',
 189, 330, 'BEAU-ORDI-002', 15, 5,
 '["https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=800"]',
 '{"Brand":"The Ordinary","Items":"5 products","Status":"Sealed & unopened","Skin Type":"All skin types"}',
 false, true, 4.7, 42),

-- Sports & Outdoors
('22222222-0001-0001-0001-000000000014',
 'Bowflex SelectTech 552 Dumbbells',
 'bowflex-selecttech-552-dumbbells',
 'Bowflex SelectTech 552 adjustable dumbbells. Each dumbbell adjusts from 2.5kg to 24kg, replacing 30 dumbbells. Dial-system for quick weight changes. Includes storage cradle. Perfect for home gym. Used 6 months.',
 'Bowflex adjustable dumbbells 2.5–24kg. Replace 30 dumbbells.',
 '11111111-0001-0001-0001-000000000005',
 899, 1599, 'SPRT-BFX-001', 4, 1,
 '["https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=800","https://images.pexels.com/photos/4162487/pexels-photo-4162487.jpeg?auto=compress&cs=tinysrgb&w=800"]',
 '{"Brand":"Bowflex","Weight Range":"2.5–24kg per dumbbell","Replaces":"30 dumbbells","Condition":"Good","Includes":"Storage cradle"}',
 true, true, 4.8, 22),

('22222222-0001-0001-0001-000000000015',
 'Garmin Forerunner 945 GPS Watch',
 'garmin-forerunner-945-gps-watch',
 'Garmin Forerunner 945 running & triathlon GPS watch. Advanced training features, music storage, Garmin Pay. Battery life up to 36 hours in GPS mode. Includes extra bands and charging cable.',
 'Garmin 945 GPS watch. Advanced training, music, Garmin Pay.',
 '11111111-0001-0001-0001-000000000005',
 999, 1799, 'SPRT-GAR-002', 3, 1,
 '["https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800"]',
 '{"Brand":"Garmin","Model":"Forerunner 945","Battery":"36 hours GPS","Condition":"Very Good","Includes":"Extra bands & charging cable"}',
 false, true, 4.6, 14),

('22222222-0001-0001-0001-000000000016',
 'Lululemon Align Yoga Mat',
 'lululemon-align-yoga-mat',
 'Lululemon reversible 5mm yoga mat in tidal teal/black. Ultra-sweat-wicking and grippy on both sides. 180x61cm. Barely used (5 sessions), came with carrying strap. Natural rubber construction.',
 'Lululemon 5mm reversible yoga mat. Natural rubber, barely used.',
 '11111111-0001-0001-0001-000000000005',
 249, 499, 'SPRT-YOGA-003', 9, 3,
 '["https://images.pexels.com/photos/3822583/pexels-photo-3822583.jpeg?auto=compress&cs=tinysrgb&w=800"]',
 '{"Brand":"Lululemon","Thickness":"5mm","Color":"Tidal Teal/Black","Dimensions":"180x61cm","Condition":"Like New – 5 sessions used"}',
 false, true, 4.5, 16),

-- Kids & Toys
('22222222-0001-0001-0001-000000000017',
 'LEGO Technic Bugatti Chiron 42083',
 'lego-technic-bugatti-chiron-42083',
 '3,599-piece LEGO Technic Bugatti Chiron set (42083). Fully assembled once, then carefully disassembled and stored. All pieces present, verified complete. Includes all instruction booklets and original box.',
 'LEGO Technic Bugatti Chiron 3599 pcs. Complete with box & instructions.',
 '11111111-0001-0001-0001-000000000006',
 799, 1499, 'KIDS-LEGO-001', 2, 1,
 '["https://images.pexels.com/photos/163696/toy-car-toy-box-mini-163696.jpeg?auto=compress&cs=tinysrgb&w=800"]',
 '{"Brand":"LEGO","Set":"Technic Bugatti Chiron","Pieces":"3599","Age":"16+","Condition":"Complete & verified – assembled once"}',
 false, true, 4.8, 7),

('22222222-0001-0001-0001-000000000018',
 'Montessori Learning Activity Box (Ages 2–5)',
 'montessori-learning-activity-box',
 'Premium Montessori activity box for ages 2–5. Includes shape sorter, stacking rings, pegboard, lacing beads and threading buttons. All made from natural wood with non-toxic paint. Excellent educational value.',
 'Montessori wooden activity box. 5 toys for ages 2–5. Non-toxic.',
 '11111111-0001-0001-0001-000000000006',
 149, 299, 'KIDS-MONT-002', 14, 5,
 '["https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=800"]',
 '{"Age Range":"2–5 years","Material":"Natural Wood","Items":"5 activity toys","Paint":"Non-toxic","Condition":"New – never used"}',
 true, true, 4.9, 28),

-- Books & Media
('22222222-0001-0001-0001-000000000019',
 'Atomic Habits by James Clear',
 'atomic-habits-james-clear',
 'Hardcover edition of Atomic Habits by James Clear. Lightly read, spine intact, no annotations or highlights. Widely considered one of the most influential books on habit formation and personal development.',
 'Atomic Habits hardcover. Lightly read, great condition.',
 '11111111-0001-0001-0001-000000000007',
 39, 75, 'BOOK-ATH-001', 22, 8,
 '["https://images.pexels.com/photos/1130980/pexels-photo-1130980.jpeg?auto=compress&cs=tinysrgb&w=800"]',
 '{"Author":"James Clear","Format":"Hardcover","Language":"English","Pages":"319","Condition":"Very Good – lightly read"}',
 false, true, 4.9, 54),

('22222222-0001-0001-0001-000000000020',
 'Arabic Classic Literature Bundle (5 Books)',
 'arabic-classic-literature-bundle',
 'Curated set of 5 Arabic literary classics: Naguib Mahfouz''s Cairo Trilogy (Palace Walk, Palace of Desire, Sugar Street) plus Taha Hussein''s The Days and Jubran Khalil Jubran''s The Prophet (Arabic edition). All in excellent condition.',
 '5 Arabic literary classics by Mahfouz, Hussein & Jubran. Excellent.',
 '11111111-0001-0001-0001-000000000007',
 149, 280, 'BOOK-ARB-002', 11, 4,
 '["https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800"]',
 '{"Books":"5 volumes","Language":"Arabic","Authors":"Mahfouz, Hussein, Jubran","Condition":"Excellent"}',
 false, true, 4.7, 19)

ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PRODUCT REVIEWS
-- ============================================================
INSERT INTO product_reviews (product_id, customer_name, customer_email, rating, title, comment, is_verified_purchase, is_approved, helpful_count) VALUES
  ('22222222-0001-0001-0001-000000000001', 'Fatima Al Rashidi', 'fatima.r@gmail.com', 5, 'Exactly as described!', 'The iPhone was in perfect condition, exactly as described. Battery health was actually better than listed. Fast shipping and well packaged. Will definitely buy again from ThriftySouq.', true, true, 18),
  ('22222222-0001-0001-0001-000000000001', 'Ahmed Hassan', 'ahmed.h@hotmail.com', 5, 'Great value for money', 'Saved almost 900 AED compared to a new one and the phone looks brand new. Works perfectly. The seller was honest about the condition.', true, true, 12),
  ('22222222-0001-0001-0001-000000000002', 'Sarah Mitchell', 'sarah.m@email.com', 4, 'Good MacBook, minor scratches', 'The MacBook works fantastically. There are a couple of very light scratches on the bottom as described, but the screen and keyboard are flawless. Great deal.', true, true, 9),
  ('22222222-0001-0001-0001-000000000003', 'Omar Abdullah', 'omar.a@uae.ae', 5, 'Best headphones I''ve owned', 'The noise cancellation is incredible. These Sony headphones are absolutely worth it. The seller said barely used and that was definitely true – they look and feel brand new.', true, true, 24),
  ('22222222-0001-0001-0001-000000000009', 'Layla Khalifa', 'layla.k@gmail.com', 5, 'Perfect espresso every time', 'I was hesitant to buy a used coffee machine but it arrived spotless. Makes amazing espresso. The milk frother works great. Super happy with this purchase.', true, true, 15),
  ('22222222-0001-0001-0001-000000000011', 'Mohammed Al Zaabi', 'mzaabi@email.com', 5, 'Powerful vacuum, great condition', 'The Dyson V11 works as good as new. All attachments were there and it came nicely cleaned. Highly recommend ThriftySouq for appliances.', true, true, 11),
  ('22222222-0001-0001-0001-000000000012', 'Priya Sharma', 'priya.s@hotmail.com', 5, 'Authentic and smells divine', 'I was worried about authenticity but this is 100% genuine Chanel. The fill level was accurately described. Great packaging and fast delivery. A luxury at a fraction of the price.', true, true, 28),
  ('22222222-0001-0001-0001-000000000013', 'Noura Al Mansoori', 'noura.m@gmail.com', 5, 'All sealed – amazing deal', 'Every product was sealed just as advertised. Saved me a lot compared to buying individually. Will definitely order The Ordinary bundles again.', true, true, 19),
  ('22222222-0001-0001-0001-000000000014', 'James O''Brien', 'james.ob@email.com', 5, 'Game changer for home gym', 'These Bowflex dumbbells are incredible. They replaced my entire rack. The dial system works smoothly and they were in excellent condition. Worth every dirham.', true, true, 16),
  ('22222222-0001-0001-0001-000000000018', 'Hessa Al Falasi', 'hessa.f@gmail.com', 5, 'My toddler loves it!', 'The Montessori set is beautifully made and my 3-year-old plays with it every day. The wood quality is excellent and it really was as described – brand new. Fast shipping too.', true, true, 22),
  ('22222222-0001-0001-0001-000000000019', 'Khalid Nasir', 'khalid.n@hotmail.com', 5, 'Life-changing book', 'Excellent condition – looks unread. One of the best books I''ve ever come across. Great price for a hardcover. ThriftySouq delivered fast.', false, true, 33)
ON CONFLICT DO NOTHING;

-- ============================================================
-- COUPONS
-- ============================================================
INSERT INTO coupons (code, description, discount_type, discount_value, min_purchase_amount, max_discount_amount, usage_limit, usage_count, customer_usage_limit, start_date, end_date, is_active) VALUES
  ('WELCOME10', 'Welcome discount – 10% off your first order', 'percentage', 10, 0, 200, 1000, 0, 1, now(), now() + interval '1 year', true),
  ('SAVE50', 'Save AED 50 on orders over AED 500', 'fixed', 50, 500, 50, 500, 0, 1, now(), now() + interval '6 months', true),
  ('THRIFTY20', '20% off for ThriftySouq members', 'percentage', 20, 200, 300, 250, 0, 1, now(), now() + interval '3 months', true),
  ('SUMMER15', 'Summer sale – 15% off everything', 'percentage', 15, 100, 250, 2000, 0, 2, now(), now() + interval '2 months', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- ADMIN USER
-- ============================================================
INSERT INTO admin_users (email, password_hash, first_name, last_name, role, is_active) VALUES
  ('admin@thriftysouq.ae', '$2a$10$placeholder_hash_for_demo', 'Store', 'Admin', 'super_admin', true),
  ('admin@luxe.com', '$2a$10$placeholder_hash_for_demo', 'ThriftySouq', 'Admin', 'super_admin', true)
ON CONFLICT (email) DO NOTHING;
