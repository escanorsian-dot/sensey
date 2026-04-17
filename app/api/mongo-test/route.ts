import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    const testRef = collection(db, '_health_check');
    await getDocs(testRef);
    
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
