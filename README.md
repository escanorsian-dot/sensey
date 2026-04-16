# Sensey - E-commerce Website

A modern e-commerce website built with Next.js, TypeScript, Tailwind CSS, and Firebase-ready cloud sync.

## Features

- Product listing and details
- Shopping cart functionality
- Checkout flow placeholder
- Vendor dashboard for adding products
- Firebase-ready carts, products, and image uploads
- Responsive design

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env.local` and add your Firebase web app values.

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Setup

The app can run in two modes:

- With Firebase configured: carts sync per user, products live in Firestore, and image uploads go to Firebase Storage.
- Without Firebase configured: the app falls back to local browser storage so the UI still works.

### Required environment variables

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Firebase products to enable

- Authentication: enable `Anonymous`
- Firestore Database
- Storage

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
- Firebase Auth, Firestore, and Storage
- Context API for app state

## Deploy on Vercel

The easiest way to deploy this app is on Vercel. After the environment variables are set, redeploy the site so Firebase is available in production.
