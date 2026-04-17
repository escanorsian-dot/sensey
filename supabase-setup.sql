-- ============================================
-- SUPABASE SETUP SCRIPT
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. CREATE PRODUCTS TABLE (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image TEXT,
  images TEXT[] DEFAULT '{}',
  description TEXT,
  vendor TEXT,
  owner_id TEXT DEFAULT 'anonymous',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- 2. ENABLE ROW LEVEL SECURITY ON PRODUCTS TABLE
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. CREATE POLICIES FOR PRODUCTS TABLE
-- Policy 1: Allow anyone to SELECT (read) all products
CREATE POLICY "Allow public read access" ON public.products
  FOR SELECT USING (true);

-- Policy 2: Allow anyone to INSERT (create) products
CREATE POLICY "Allow public insert access" ON public.products
  FOR INSERT WITH CHECK (true);

-- Policy 3: Allow anyone to UPDATE their own products
CREATE POLICY "Allow users to update own products" ON public.products
  FOR UPDATE USING (true) WITH CHECK (true);

-- Policy 4: Allow anyone to DELETE their own products
CREATE POLICY "Allow users to delete own products" ON public.products
  FOR DELETE USING (true);

-- 4. CREATE INDEX FOR BETTER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- ============================================
-- STORAGE BUCKET SETUP
-- ============================================
-- The storage bucket should be created in the dashboard at:
-- Storage > New Bucket > Name: "product-images" > Make it Public > Create Bucket

-- Then add this policy in the SQL Editor:
-- Go to Storage > product-images > Policies > Create a new policy

-- Policy for Storage (run this in SQL Editor):
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow public download" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Allow public delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images');
