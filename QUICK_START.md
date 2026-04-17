# 🚀 Sensey Supabase Connection - Quick Start

Your Sensey e-commerce site is now configured to connect with Supabase! Here's what you need to do:

## ⚡ Quick Setup (5 minutes)

### Step 1: Add Your Supabase Keys to `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://qzvzzagzwwzulybljisb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get these from: Supabase Dashboard → Settings → API

### Step 2: Run SQL Setup in Supabase Dashboard

1. Go to your Supabase project
2. Click **SQL Editor** → **New Query**
3. Copy everything from `supabase-setup.sql` (in your repo)
4. Paste and click **Run**

✅ This creates:
- `products` table
- Row Level Security policies
- Database indexes

### Step 3: Create Storage Bucket

1. Go to **Storage** tab
2. Click **Create a new bucket**
3. Name: `product-images` (exactly this)
4. **Enable Public** ✓
5. Click **Create bucket**

### Step 4: Verify Everything

Your dev server is already running! Open:
- http://localhost:3000 - Browse products
- http://localhost:3000/vendor - Add a product
- http://localhost:3000/admin - Manage products

## 📚 Detailed Guides

- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Full step-by-step setup guide
- **[SUPABASE_CHECKLIST.md](./SUPABASE_CHECKLIST.md)** - Use this to verify everything works

## 🔍 Common Issues

### "Invalid API key" Error
→ Check your `.env.local` has correct keys from Supabase Dashboard
→ Restart dev server: `npm run dev`

### "Table 'products' not found"
→ Run the SQL from `supabase-setup.sql` in Supabase SQL Editor

### "Permission denied" on Upload
→ Make sure `product-images` bucket is **Public**
→ Run the storage policies from `supabase-setup.sql`

### Nothing's working?
→ Open browser console (F12 → Console)
→ Look for "Connected to Supabase Project" message
→ Check for any error messages

## 📋 What Each File Does

| File | Purpose |
|------|---------|
| `.env.local` | Stores your Supabase URL & API key (keep private!) |
| `supabase-setup.sql` | SQL to create database table & policies |
| `lib/supabase.ts` | Connects your app to Supabase |
| `lib/product-images.ts` | Handles image uploads to storage |
| `app/products-context.tsx` | Manages products from database |

## ✨ Features Now Available

✅ Add products with images  
✅ Real-time product updates  
✅ View all products  
✅ Delete products  
✅ Image storage with Supabase  
✅ Vendor dashboard  
✅ Admin panel  

## 🚀 Next Steps

1. **Test it**: Go to http://localhost:3000/vendor and add a product
2. **Check Supabase**: See your product appear in Dashboard → Table Editor
3. **Deploy**: When ready, deploy to Vercel and set env variables there

---

**App Status:** ✅ Ready to connect to Supabase!
**Dev Server:** ✅ Running on http://localhost:3000
**Need Help?** See SUPABASE_CHECKLIST.md or SUPABASE_SETUP.md
