import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';

export async function GET() {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('[ERROR] GET /api/products failed:', error);
    return NextResponse.json(
      { message: 'Failed to fetch products', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const productData = {
      name: body.name,
      price: body.price,
      image: body.image || '',
      images: body.images || [],
      description: body.description || '',
      vendor: body.vendor || '',
      owner_id: body.owner_id,
      createdAt: new Date(),
    };

    const docRef = await addDoc(collection(db, 'products'), productData);

    return NextResponse.json({ id: docRef.id, ...productData }, { status: 201 });
  } catch (error: any) {
    console.error('[ERROR] POST /api/products failed:', error);
    return NextResponse.json(
      { message: 'Failed to create product', error: error.message },
      { status: 500 }
    );
  }
}
