import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export async function GET() {
  try {
    const db = getDB();
    const settingsDoc = await getDoc(doc(db, 'settings', 'payment'));
    
    if (settingsDoc.exists()) {
      return NextResponse.json(settingsDoc.data());
    }
    
    return NextResponse.json({ qrCode: null });
  } catch (error: any) {
    console.error('[ERROR] GET /api/settings/payment failed:', error);
    return NextResponse.json({ qrCode: null });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDB();
    const body = await req.json();
    
    const settingsRef = doc(db, 'settings', 'payment');
    const existing = await getDoc(settingsRef);
    
    if (existing.exists()) {
      await updateDoc(settingsRef, {
        qrCode: body.qrCode,
        updatedAt: new Date(),
      });
    } else {
      await setDoc(settingsRef, {
        qrCode: body.qrCode,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[ERROR] POST /api/settings/payment failed:', error);
    return NextResponse.json(
      { message: 'Failed to save payment settings', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const db = getDB();
    const settingsRef = doc(db, 'settings', 'payment');
    const existing = await getDoc(settingsRef);
    
    if (existing.exists()) {
      await updateDoc(settingsRef, {
        qrCode: null,
        updatedAt: new Date(),
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[ERROR] DELETE /api/settings/payment failed:', error);
    return NextResponse.json(
      { message: 'Failed to delete payment settings', error: error.message },
      { status: 500 }
    );
  }
}