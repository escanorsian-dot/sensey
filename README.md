# Sensey - E-commerce Website

A modern e-commerce website built with Next.js, TypeScript, Tailwind CSS, and Supabase for real-time database and image storage.

## Features

- Product listing and details
- Shopping cart functionality
- Checkout flow placeholder
- Vendor dashboard for adding products
- Supabase database for products and real-time sync
- Image storage on Supabase
- Responsive design

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. **Set up Supabase** (Required):
   - Create a [Supabase](https://supabase.com) account and project
   - Copy `.env.example` to `.env.local` and add your Supabase credentials:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
     ```
   - Follow the [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) guide to:
     - Create the `products` table
     - Set up Row Level Security policies
     - Create the `product-images` storage bucket
   - See [SUPABASE_CHECKLIST.md](./SUPABASE_CHECKLIST.md) to verify everything is configured correctly

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Supabase Setup

The app requires Supabase for:
- **Database**: Storing product information in a `products` table
- **Storage**: Storing product images in a `product-images` bucket
- **Real-time sync**: Live updates when products are added/removed

👉 **See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions**

### Required Supabase Components

✅ **Products Table** with fields:
- id, name, price, image, images[], description, vendor, owner_id, created_at, updated_at

✅ **Row Level Security Policies** (4 total):
- Public read access
- Public insert access
- User update permissions
- User delete permissions

✅ **Product Images Storage Bucket**:
- Bucket name: `product-images`
- Access level: Public
- With appropriate upload, download, and delete policies

## Pages

- `/` - Home page with featured products
- `/products` - All products listing
- `/products/[id]` - Individual product details
- `/vendor` - Vendor page to add products
- `/cart` - Shopping cart
- `/checkout` - Checkout form
- `/admin` - Product management panel

## Payment Integration

The checkout form is currently a demo. To add real payments:

1. Sign up for a Stripe account
2. Add a backend order flow
3. Replace the demo payment logic with actual Stripe integration

## Technologies Used

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase (Database & Storage)
- Context API for app state

## Deploy on Vercel

The easiest way to deploy this app is on Vercel. After the environment variables are set, redeploy the site so Supabase is available in production.

---

**Having issues?** Check [SUPABASE_CHECKLIST.md](./SUPABASE_CHECKLIST.md) for troubleshooting.
