# 🔧 Vercel Environment Variables Setup

The "Failed to create product" error happens because environment variables are not set in Vercel.

## ✅ Step-by-Step Setup

### 1. Go to Vercel Dashboard
https://vercel.com/dashboard

### 2. Select Your Sensey Project
Click on your "sensey" project

### 3. Go to Settings → Environment Variables
- Click **Settings** tab
- Click **Environment Variables** (left sidebar)

### 4. Add These Variables

**Copy each one and paste into Vercel:**

#### MongoDB (Database)
```
Name: MONGODB_CONNECTION_STRING
Value: mongodb+srv://escanorsian_db_user:pass@cluster0.gqejkmk.mongodb.net/sensey?retryWrites=true&w=majority
```

#### Cloudinary (Image Upload)
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

#### Firebase (Authentication)
```
Name: NEXT_PUBLIC_FIREBASE_API_KEY
Value: AIzaSyDtJWE_T0_urf-uGiUuXaXQx7BSs1mb3NE
```

```
Name: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
Value: sensey-f4a66.firebaseapp.com
```

```
Name: NEXT_PUBLIC_FIREBASE_PROJECT_ID
Value: sensey-f4a66
```

```
Name: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
Value: sensey-f4a66.firebasestorage.app
```

```
Name: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
Value: 293158395552
```

```
Name: NEXT_PUBLIC_FIREBASE_APP_ID
Value: 1:293158395552:web:0bc8c6ef6a192c7ddef3c5
```

### 5. Click "Save"
Vercel will automatically redeploy your site with these variables.

### 6. Wait for Deployment
You'll see a "Building..." status. Wait 2-3 minutes for it to complete.

### 7. Test Your Setup
After deployment completes:

1. Open your Vercel URL: https://sensey-blush.vercel.app/
2. Go to `/api/health` to verify all services are connected
3. Go to `/vendor` and try uploading a product

## ✅ Verification Checklist

Visit: `https://your-domain.vercel.app/api/health`

You should see:
```json
{
  "status": "ok",
  "mongodb": "connected",
  "cloudinary": {
    "cloud_name": "✓",
    "api_key": "✓",
    "api_secret": "✓"
  },
  "firebase": {
    "api_key": "✓",
    "project_id": "✓"
  }
}
```

If anything shows `✗`, that env var is missing.

## 🆘 Troubleshooting

**Still seeing "Failed to create product"?**
1. Check browser console (F12) for error details
2. Visit `/api/health` to see which service is not connected
3. Verify env variables were saved in Vercel
4. Wait for Vercel redeployment to complete (check "Deployments" tab)

**MongoDB connection failed?**
- Check MongoDB Atlas is running
- Verify password in connection string (no special characters need escaping in Vercel)
- Make sure IP whitelist allows all IPs (0.0.0.0/0)

**Cloudinary upload failed?**
- Verify cloud name and API keys are correct
- Check Cloudinary account is active

---

**Done!** Your site should work now. 🚀
