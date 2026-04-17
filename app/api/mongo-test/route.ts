import { NextResponse } from 'next/server';
import { getDB } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    const db = getDB();
    await getDocs(collection(db, '_health_check'));
    
    return NextResponse.json({
      status: 'success',
      message: 'Firebase connection successful',
    });
  } catch (error: any) {
    console.error('[FIREBASE-TEST] Connection failed:', error);
    return NextResponse.json({
      status: 'failed',
      message: error.message,
    }, { status: 500 });
  }
}
