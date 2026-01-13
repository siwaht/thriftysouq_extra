/*
  # Create Product Images Storage Bucket

  1. Storage Setup
    - Creates 'product-images' bucket for storing product photos
    - Enables public access for reading images
    - Allows public to upload images
  
  2. Security Policies
    - Public read access - Anyone can view product images
    - Public upload - Anyone can upload images
    - Public delete - Anyone can delete images
*/

-- Create the product-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to product images
CREATE POLICY "Public read access for product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Allow public to upload product images
CREATE POLICY "Public can upload product images"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'product-images');

-- Allow public to update product images
CREATE POLICY "Public can update product images"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'product-images');

-- Allow public to delete product images
CREATE POLICY "Public can delete product images"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'product-images');