# Sensey - E-commerce Website

A modern e-commerce website built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Product listing and details
- Shopping cart functionality
- Checkout process
- **Vendor dashboard** - Vendors can add their own products
- Responsive design

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Pages

- `/` - Home page with featured products
- `/products` - All products listing
- `/products/[id]` - Individual product details
- `/vendor` - **NEW:** Vendor page to add products
- `/cart` - Shopping cart
- `/checkout` - Checkout form

## For Vendors

Vendors can add their products by visiting `/vendor` and filling out the form. Products are stored locally and will appear in the main product listings.

## Payment Integration

The checkout form is currently a demo. To add real payments:

1. Sign up for a Stripe account
2. Install Stripe CLI and get API keys
3. Replace the demo payment logic with actual Stripe integration

## Technologies Used

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Context API for state management
- Local Storage for data persistence

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
