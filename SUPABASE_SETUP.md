# Supabase Connection Setup Guide for Sensey

This guide will help you properly connect your Sensey e-commerce website to Supabase for product database and image storage.

## Step 1: Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and log in to your project
2. Navigate to **Settings > API** (or **Project Settings > API**)
3. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Public Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 2: Update Your Environment Variables

Edit `.env.local` in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**⚠️ Important:** These variables are prefixed with `NEXT_PUBLIC_` which means they're public and visible in the browser. Never put your service role key or database password here—only the anonymous key.

## Step 3: Create the Products Table

1. Open your Supabase project dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the contents of `supabase-setup.sql` from this repository
5. Click **Run**

This will create:
- ✅ A `products` table with all required fields
- ✅ Row-level security policies for public access
- ✅ Database indexes for performance

## Step 4: Create the Product Images Storage Bucket

1. In Supabase, go to **Storage** (left sidebar)
2. Click **Create a new bucket**
3. Name it: `product-images` (exactly)
4. **Enable Public** (toggle it on)
5. Click **Create bucket**

## Step 5: Set Storage Policies (Important!)

The storage bucket needs permission policies to allow uploads. Go back to the **SQL Editor** and run:

```sql
-- Allow public uploads to product-images
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow public download" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Allow public delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images');
```

## Step 6: Test the Connection

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000/vendor to test the connection
3. Try uploading a product with an image

## Troubleshooting

### Error: "Invalid API key" or "Invalid URL"
- Check that your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct in `.env.local`
- Make sure you're using the **Anon Public Key**, not the Service Role Key
- Restart your dev server after updating `.env.local`

### Error: "Table 'products' not found"
- Run the SQL script from `supabase-setup.sql` in your Supabase SQL Editor
- Make sure the table was created successfully

### Error: "Failed to upload image" or "Permission denied"
- Make sure the `product-images` bucket is **Public**
- Run the storage policy SQL commands above
- Check that the bucket name is exactly `product-images` (lowercase, no spaces)

### Images upload but products don't save
- Check Row Level Security policies on the `products` table
- Make sure all policies from `supabase-setup.sql` are created
- Look at the browser console for specific error messages

### "Supabase Error: relation 'public.products' does not exist"
- The products table hasn't been created yet
- Run the SQL from `supabase-setup.sql` in the Supabase SQL Editor

## What Each Part Does

### Products Table
- Stores product information: name, price, description, images
- Linked to the vendor/owner who created it
- Includes timestamps for tracking when products were added/updated

### Product Images Storage
- Stores actual image files separately from the database
- Public access allows fast downloads
- Images are organized by owner ID for easy management

## Next Steps

After getting Supabase connected, you can:
- Add products through `/vendor` page
- Manage products through `/admin` page  
- View products on `/products` page

---

**Questions?** Check the browser console (F12 → Console tab) for detailed error messages from Supabase.
