# How Sensey Connects to Supabase

This diagram shows how your Sensey app communicates with Supabase:

```
┌─────────────────────────────────────────────────────────────┐
│                    SENSEY APP (Next.js)                      │
│  http://localhost:3000                                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  /vendor page    │         │  /admin page     │          │
│  │  (Add products)  │         │  (Manage list)   │          │
│  └──────┬───────────┘         └────────┬─────────┘          │
│         │                              │                    │
│         └──────────────┬───────────────┘                    │
│                        │                                    │
│         ┌──────────────▼──────────────┐                    │
│         │  products-context.tsx       │                    │
│         │  (Data management layer)    │                    │
│         └──────────────┬──────────────┘                    │
│                        │                                    │
│         ┌──────────────▼──────────────┐                    │
│         │  lib/supabase.ts            │                    │
│         │  (Connection setup)         │                    │
│         └──────────────┬──────────────┘                    │
│                        │                                    │
│         ┌──────────────▼──────────────┐                    │
│         │  lib/product-images.ts      │                    │
│         │  (Image upload handler)     │                    │
│         └──────────────┬──────────────┘                    │
│                        │                                    │
└────────────────────────┼────────────────────────────────────┘
                         │
                   ✅ .env.local has keys
                         │
                ┌────────▼─────────────────────┐
                │                              │
        ┌───────▼──────┐          ┌───────────▼───┐
        │ SUPABASE API │          │ SUPABASE      │
        │              │          │ STORAGE       │
        ├──────────────┤          ├───────────────┤
        │              │          │               │
        │  Database    │          │ Buckets:      │
        │  ├─products  │          │ ├─product-    │
        │  │  ├─id     │          │ │  images     │
        │  │  ├─name   │          │ │  └─user/    │
        │  │  ├─price  │          │ │     date-   │
        │  │  ├─image  │          │ │     img.jpg │
        │  │  ├─images │          │ └─            │
        │  │  ├─vendor │          │               │
        │  │  └─...    │          │               │
        │  │           │          │               │
        │  RLS         │          │  Public       │
        │  Policies ✓  │          │  Access ✓     │
        │              │          │               │
        └──────────────┘          └───────────────┘
```

## Data Flow Examples

### Example 1: Adding a Product

```
1. User fills form on /vendor
   ├─ Product name
   ├─ Price
   ├─ Images (uploads to browser memory)
   └─ Description

2. User clicks "PUBLISH PRODUCT"
   │
3. Images are uploaded to Supabase Storage
   ├─ File path: `{owner_id}/{timestamp}-{filename}`
   ├─ Stored in: `product-images` bucket
   └─ Returns: Public URL

4. Product data sent to Supabase Database
   ├─ INSERT into `products` table
   ├─ Fields: name, price, description, image URLs, vendor
   └─ Auto-fields: id, created_at, owner_id

5. Real-time subscription triggers
   ├─ All connected clients notified
   └─ Products list updates automatically

6. Success message shown to user ✅
```

### Example 2: Viewing Products

```
1. User visits /products or /admin
   │
2. App queries Supabase Database
   ├─ SELECT * FROM products
   └─ ORDER BY created_at DESC

3. Supabase checks RLS policies
   ├─ Policy: "Allow public read access" ✓
   └─ Returns all products

4. Image URLs displayed
   ├─ Fetched from storage: supabase.co/storage/v1/object/...
   └─ User sees product thumbnails

5. Real-time subscription active
   ├─ Listens for: INSERT, UPDATE, DELETE
   └─ Auto-updates when others add products
```

## Environment Configuration

Your `.env.local` file is the bridge:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qzvzzagzwwzulybljisb.supabase.co
                          ↓
                    Project URL
                    
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                              ↓
                    Public API Key (read-only for now)
```

**Why "NEXT_PUBLIC_"?**
- These are safe to expose in the browser (they're public anyway)
- Never put your **Service Role Key** or database password here
- The anonymous key has restricted permissions via RLS policies

## Security: Row Level Security (RLS)

```
User Action              → RLS Policy Check        → Result
────────────────────────────────────────────────────────────
SELECT all products      → "Allow public read"     → ✅ Allowed
INSERT new product       → "Allow public insert"   → ✅ Allowed
UPDATE product           → "Allow users to update" → ✅ Allowed
DELETE own product       → "Allow users to delete" → ✅ Allowed
DELETE other's product   → RLS blocks it           → ❌ Denied
```

## File Purpose Summary

| File | What it does |
|------|-------------|
| **lib/supabase.ts** | Creates Supabase client with your keys |
| **lib/product-images.ts** | Uploads image files to storage, returns public URLs |
| **app/products-context.tsx** | React Context that manages product state & Supabase queries |
| **app/vendor/page.tsx** | Form for vendors to add products |
| **app/admin/page.tsx** | Dashboard to view and manage products |
| **.env.local** | Your Supabase credentials (KEEP PRIVATE!) |
| **supabase-setup.sql** | SQL to set up database & policies |

## Troubleshooting Connection Issues

### Is the app connecting to Supabase?

Check browser console (F12):
- ✅ Should see: `"Connected to Supabase Project: https://your-project.supabase.co"`
- ❌ If missing: Check `.env.local` has correct keys

### Are tables being queried?

In browser console:
- ✅ Look for product data logs
- ❌ If error: Run `supabase-setup.sql` to create table

### Are images uploading?

Check Supabase Storage:
1. Go to Storage tab
2. Open `product-images` bucket
3. Should see files like: `anonymous/1704067200000-photo.jpg`

### Is real-time working?

Add a product in one tab, it should appear in another tab automatically!

---

**Summary:** Your app talks to Supabase via HTTPS using the URL and key in `.env.local`. RLS policies control what data users can access. Images go to Storage, product info goes to Database.
