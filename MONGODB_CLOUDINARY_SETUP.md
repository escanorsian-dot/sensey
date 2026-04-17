# MongoDB + Cloudinary Deployment Guide

## ✅ What's Done

Your Sensey website has been successfully migrated from Supabase to MongoDB + Cloudinary!

### Changes Made:
- **Database**: Switched from Supabase PostgreSQL → MongoDB
- **Image Hosting**: Switched from Supabase Storage → Cloudinary
- **API Routes**: Created `/api/products` endpoints for CRUD operations
- **Context**: Updated products context to use new MongoDB backend

### Files Changed:
- `lib/mongodb.ts` - MongoDB connection and schema
- `lib/cloudinary.ts` - Cloudinary upload handler
- `app/api/products/route.ts` - Get/Create products API
- `app/api/products/[id]/route.ts` - Delete product API
- `app/products-context.tsx` - Updated to use MongoDB
- `.env.local` - Added MongoDB and Cloudinary credentials

---

## 📋 Vercel Environment Variables Setup

You need to add these environment variables to Vercel for your production deployment:

### 1. Go to Vercel Dashboard
- Navigate to your Sensey project
- Click **Settings**
- Select **Environment Variables**

### 2. Add These Variables:

```
MONGODB_CONNECTION_STRING=mongodb+srv://escanorsian_db_user:pass@cluster0.gqejkmk.mongodb.net/sensey?retryWrites=true&w=majority

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=diph0eonq

CLOUDINARY_API_KEY=165671614426843

CLOUDINARY_API_SECRET=9YbPq6wum3zhRLhcwtsVi1L1Bfk

NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDtJWE_T0_urf-uGiUuXaXQx7BSs1mb3NE

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sensey-f4a66.firebaseapp.com

NEXT_PUBLIC_FIREBASE_PROJECT_ID=sensey-f4a66

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sensey-f4a66.firebasestorage.app

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=293158395552

NEXT_PUBLIC_FIREBASE_APP_ID=1:293158395552:web:0bc8c6ef6a192c7ddef3c5
```

### 3. Click "Save" and Wait for Redeployment
Vercel will automatically redeploy your site with the new environment variables.

---

## 🧪 Testing Locally

Your dev server is already running and tested:

```bash
# Start dev server
npm run dev

# Test API
curl http://localhost:3000/api/products
```

Returns: `[]` (empty array - ready for products!)

---

## 🎯 Next Steps

1. ✅ Add environment variables to Vercel (complete the steps above)
2. Wait for Vercel to redeploy
3. Go to `https://your-domain.vercel.app/vendor` to add products
4. Products will now be stored in MongoDB + images in Cloudinary

---

## 🔗 Quick Links

- **MongoDB Atlas**: https://cloud.mongodb.com/
- **Cloudinary Dashboard**: https://cloudinary.com/console/
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repository**: https://github.com/escanorsian-dot/sensey

---

## ⚠️ Important Notes

- MongoDB password must NOT expire - check MongoDB Atlas
- Cloudinary account must remain active
- Keep environment variables secure (never commit to GitHub)
- All old Supabase data is preserved if you need it later

---

Done! Your site is now using MongoDB + Cloudinary. 🚀
