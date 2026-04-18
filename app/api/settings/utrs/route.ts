import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET() {
  try {
    const db = getDB();
    const settingsDoc = await getDoc(doc(db, 'settings', 'utrs'));
    
    if (settingsDoc.exists()) {
      return NextResponse.json(settingsDoc.data());
    }
    
    return NextResponse.json({ utrs: [] });
  } catch (error: any) {
    console.error('[ERROR] GET /api/settings/utrs failed:', error);
    return NextResponse.json({ utrs: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDB();
    const body = await req.json();
    
    const settingsRef = doc(db, 'settings', 'utrs');
    const existing = await getDoc(settingsRef);
    
    const newUtr = {
      id: Date.now().toString(),
      utr: body.utr,
      createdAt: Date.now(),
    };
    
    if (existing.exists()) {
      const data = existing.data();
      const currentUTRs = data.utrs || [];
      const { setDoc } = await import('firebase/firestore');
      await setDoc(settingsRef, {
        utrs: [...currentUTRs, newUtr],
        updatedAt: new Date(),
      }, { merge: true });
    } else {
      const { setDoc } = await import('firebase/firestore');
      await setDoc(settingsRef, {
        utrs: [newUtr],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    return NextResponse.json({ success: true, utr: newUtr });
  } catch (error: any) {
    console.error('[ERROR] POST /api/settings/utrs failed:', error);
    return NextResponse.json(
      { message: 'Failed to add UTR', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const db = getDB();
    const { searchParams } = new URL(req.url);
    const utrId = searchParams.get('id');
    
    if (!utrId) {
      return NextResponse.json({ message: 'UTR ID required' }, { status: 400 });
    }
    
    const settingsRef = doc(db, 'settings', 'utrs');
    const existing = await getDoc(settingsRef);
    
    if (existing.exists()) {
      const data = existing.data();
      const currentUTRs = data.utrs || [];
      const filtered = currentUTRs.filter((utr: any) => utr.id !== utrId);
      const { updateDoc } = await import('firebase/firestore');
      await updateDoc(settingsRef, {
        utrs: filtered,
        updatedAt: new Date(),
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[ERROR] DELETE /api/settings/utrs failed:', error);
    return NextResponse.json(
      { message: 'Failed to remove UTR', error: error.message },
      { status: 500 }
    );
  }
}