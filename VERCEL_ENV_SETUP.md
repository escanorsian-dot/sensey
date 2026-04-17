# 🔧 Vercel Environment Variables Setup

Firebase is now OPTIONAL. Your app uses only MongoDB + Cloudinary. Much simpler!

## ✅ What You Need (4 Variables Only)

### Step 1: Open Vercel Dashboard
https://vercel.com/dashboard
→ Click your "sensey" project
→ Click "Settings" tab
→ Click "Environment Variables"

### Step 2: Add These 4 Variables

**MongoDB (Database):**
```
Name: MONGODB_CONNECTION_STRING
Value: mongodb+srv://escanorsian_db_user:pass@cluster0.gqejkmk.mongodb.net/sensey?retryWrites=true&w=majority
```

**Cloudinary (Image Upload):**
```
Name: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
Value: diph0eonq
```

```
Name: CLOUDINARY_API_KEY
Value: 165671614426843
```

```
Name: CLOUDINARY_API_SECRET
Value: 9YbPq6wum3zhRLhcwtsVi1L1Bfk
```

### Step 3: Click "Save"
Vercel auto-redeploys. Wait 2-3 minutes.

### Step 4: Test It
Visit: `https://sensey-blush.vercel.app/api/health`

Should show:
```json
{
  "status": "ok",
  "mongodb": "connected",
  "cloudinary": {
    "cloud_name": "✓",
    "api_key": "✓",
    "api_secret": "✓"
  }
}
```

### Step 5: Try Uploading a Product
Go to `/vendor` page and upload a product!

---

## 🔥 Stack Overview

- **Database:** MongoDB Atlas
- **Images:** Cloudinary
- **Users:** Anonymous (no login needed)
- **Hosting:** Vercel

**That's it!** No Firebase, no complexity. 🚀

