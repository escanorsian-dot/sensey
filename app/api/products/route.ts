import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Product } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const products = await Product.find({}).sort({ createdAt: -1 });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'Failed to fetch products', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

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

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { message: 'Failed to create product', error: error.message },
      { status: 500 }
    );
  }
}
