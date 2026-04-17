import { NextResponse } from 'next/server';
import { getDB } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    const db = getDB();
    await getDocs(collection(db, '_health'));
    
    return NextResponse.json({
      status: 'ok',
      firebase: 'connected',
      cloudinary: {
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? '✓' : '✗',
        api_key: process.env.CLOUDINARY_API_KEY ? '✓' : '✗',
        api_secret: process.env.CLOUDINARY_API_SECRET ? '✓' : '✗',
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      firebase: 'failed to connect'
    }, { status: 500 });
  }
}
