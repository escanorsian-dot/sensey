import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Product } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    console.log('[DEBUG] Connecting to MongoDB...');
    await connectDB();
    console.log('[DEBUG] Connected! Fetching products...');

    const products = await Product.find({}).sort({ createdAt: -1 });
    console.log('[DEBUG] Found', products.length, 'products');

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('[ERROR] GET /api/products failed:', error);
    return NextResponse.json(
      { 
        message: 'Failed to fetch products', 
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : 'Check server logs'
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('[DEBUG] Connecting to MongoDB...');
    await connectDB();
    console.log('[DEBUG] Connected! Creating product...');

    const body = await req.json();
    console.log('[DEBUG] Product data:', { name: body.name, price: body.price });

    const product = new Product({
      name: body.name,
      price: body.price,
      image: body.image,
      images: body.images || [],
      description: body.description,
      vendor: body.vendor,
      owner_id: body.owner_id,
    });

    await product.save();
    console.log('[DEBUG] Product saved successfully:', product._id);

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('[ERROR] POST /api/products failed:', error);
    return NextResponse.json(
      { 
        message: 'Failed to create product', 
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : 'Check server logs'
      },
      { status: 500 }
    );
  }
}
