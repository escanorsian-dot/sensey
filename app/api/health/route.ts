import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  try {
    const mongoTest = await connectDB();
    
    return NextResponse.json({
      status: 'ok',
      mongodb: mongoTest ? 'connected' : 'disconnected',
      cloudinary: {
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? '✓' : '✗',
        api_key: process.env.CLOUDINARY_API_KEY ? '✓' : '✗',
        api_secret: process.env.CLOUDINARY_API_SECRET ? '✓' : '✗',
      },
      firebase: {
        api_key: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓' : '✗',
        project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✓' : '✗',
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      mongodb: 'failed to connect'
    }, { status: 500 });
  }
}
