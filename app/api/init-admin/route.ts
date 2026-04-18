import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function POST() {
  try {
    const db = getDB();
    const adminRef = doc(db, 'admins', 'qwertyu');
    const existing = await getDoc(adminRef);
    
    if (!existing.exists()) {
      await setDoc(adminRef, {
        username: 'qwertyu',
        password: 'qwertyu',
        createdAt: new Date()
      });
      return NextResponse.json({ success: true, message: 'Default admin created' });
    }
    
    return NextResponse.json({ success: true, message: 'Default admin already exists' });
  } catch (error: any) {
    console.error('[ERROR] Init admin failed:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}