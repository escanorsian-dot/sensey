import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('[MONGO-TEST] Starting connection test...');
    console.log('[MONGO-TEST] Connection string exists:', !!process.env.MONGODB_CONNECTION_STRING);
    console.log('[MONGO-TEST] Connection string length:', process.env.MONGODB_CONNECTION_STRING?.length || 0);
    
    const start = Date.now();
    await connectDB();
    const duration = Date.now() - start;
    
    return NextResponse.json({
      status: 'success',
      message: 'MongoDB connection successful',
      connectionTime: `${duration}ms`,
      connectionStringConfigured: !!process.env.MONGODB_CONNECTION_STRING,
    });
  } catch (error: any) {
    console.error('[MONGO-TEST] Connection failed:', error);
    return NextResponse.json({
      status: 'failed',
      message: error.message,
      connectionStringConfigured: !!process.env.MONGODB_CONNECTION_STRING,
      error: error.toString(),
    }, { status: 500 });
  }
}
