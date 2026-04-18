# Sensey - E-commerce Store

A modern e-commerce website built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Product listing and details
- Shopping cart functionality  
- Checkout with UPI payment
- Submit receipt with UTR verification
- Admin panel for product & payment management

## Pages

- `/` - Home page with featured products
- `/products` - All products listing
- `/products/[id]` - Individual product details
- `/vendor` - Vendor page to add products
- `/cart` - Shopping cart
- `/checkout` - Checkout with UPI payment
- `/submit-receipt` - Submit payment receipt (UTR verification)
- `/admin` - Product & payment management

## Payment Setup

Admin can upload a UPI QR code in the Admin panel. Customers scan it to pay via any UPI app (Google Pay, PhonePe, Paytm, etc.).

After payment, customers must:
1. Enter a valid UTR number (provided by admin after payment)
2. Submit their payment receipt screenshot

Each UTR is valid for 24 hours.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)