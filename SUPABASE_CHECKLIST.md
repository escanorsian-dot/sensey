# Supabase Connection Checklist ✅

Use this checklist to verify your Supabase connection is working:

## Prerequisites
- [ ] You have a Supabase account and a project created
- [ ] You have the project URL and anon key ready

## Environment Setup
- [ ] Updated `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Updated `.env.local` with `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Restarted the dev server (`npm run dev`)

## Database Setup
- [ ] Created `products` table in Supabase SQL Editor
- [ ] Enabled Row Level Security (RLS) on `products` table
- [ ] Created all 4 RLS policies for products table:
  - [ ] "Allow public read access" (SELECT)
  - [ ] "Allow public insert access" (INSERT)
  - [ ] "Allow users to update own products" (UPDATE)
  - [ ] "Allow users to delete own products" (DELETE)
- [ ] Verified table fields: id, name, price, image, images, description, vendor, owner_id, created_at, updated_at

## Storage Setup
- [ ] Created `product-images` bucket in Storage
- [ ] Made the bucket **Public** (not private)
- [ ] Created storage policies in SQL Editor:
  - [ ] "Allow public uploads" (INSERT)
  - [ ] "Allow public download" (SELECT)
  - [ ] "Allow public delete" (DELETE)

## Testing
1. **Test Connection:**
   - Open browser console (F12)
   - Check for Supabase connection message: "Connected to Supabase Project: https://your-project.supabase.co"

2. **Test Product Listing:**
   - Go to http://localhost:3000/products
   - Should display products (at least the sample)
   - Check console for any errors

3. **Test Product Upload:**
   - Go to http://localhost:3000/vendor
   - Fill in product details
   - Upload at least one image
   - Click "PUBLISH PRODUCT"
   - Should show success message

4. **Verify in Supabase:**
   - Go to Supabase dashboard
   - Check **Table Editor > products** to see new product
   - Check **Storage > product-images** to see uploaded image file

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Invalid API key" | Check `.env.local` has correct URL and anon key. Restart server. |
| "Table 'products' not found" | Run SQL from `supabase-setup.sql` in Supabase SQL Editor |
| "Permission denied" on upload | Make sure `product-images` bucket is Public, not Private |
| "Failed to save product" | Check RLS policies exist on products table |
| Images upload but don't appear | Verify storage policies were created correctly |

## Browser Console Messages to Look For

✅ **Good:**
- "Connected to Supabase Project: https://qzvzzagzwwzulybljisb.supabase.co"
- Product data being fetched successfully
- Image URLs working

❌ **Bad:**
- "Not connected to Supabase" or undefined URL
- "SUPABASE_ERROR" or permission errors
- Failed to fetch from 'products' table
- Storage upload errors (403, 401)

## Environment Variables Reference

Your `.env.local` should look like:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qzvzzagzwwzulybljisb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

❌ **DO NOT** commit this to Git—it's already in `.gitignore`

## Still Not Working?

1. Check browser console (F12 → Console) for error messages
2. Go to Supabase Dashboard → Logs to see API errors
3. Verify the exact error message and search the Supabase docs
4. Make sure all 4 RLS policies are created (not just some of them)
5. Verify storage bucket is exactly named `product-images` (lowercase, no spaces)

---

**Last Resort:** Delete the bucket and table, run the SQL setup script again from scratch.
