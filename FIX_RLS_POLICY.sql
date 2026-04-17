-- ============================================
-- FIX RLS POLICIES - PASTE THIS IN SUPABASE SQL EDITOR
-- ============================================
-- This fixes the "new row violates row-level security policy" error

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Allow public read access" ON public.products;
DROP POLICY IF EXISTS "Allow public insert access" ON public.products;
DROP POLICY IF EXISTS "Allow users to update own products" ON public.products;
DROP POLICY IF EXISTS "Allow users to delete own products" ON public.products;

-- Create new PERMISSIVE policies (allow all operations)
CREATE POLICY "Enable read for all"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for all"
  ON public.products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for all"
  ON public.products FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for all"
  ON public.products FOR DELETE
  USING (true);

-- Verify policies are created
SELECT policyname, permissive FROM pg_policies WHERE tablename = 'products' ORDER BY policyname;
