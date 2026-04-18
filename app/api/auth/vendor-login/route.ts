import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    // Check for Firebase config
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      return NextResponse.json({ 
        success: false, 
        message: 'Firebase Configuration Missing' 
      }, { status: 500 });
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
    }

    const { username, password } = body || {};

    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Username and password required' }, { status: 400 });
    }

    console.log('[LOGIN] Attempting vendor login for:', username);
    const db = getDB();
    const vendorsRef = collection(db, 'vendors');
    const q = query(vendorsRef, where('username', '==', username));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const vendorData = snapshot.docs[0].data();
      if (vendorData && vendorData.password === password) {
        console.log('[LOGIN] Vendor login successful:', username);
        return NextResponse.json({ 
          success: true, 
          user: { username: vendorData.username || username, role: 'vendor' }
        });
      } else {
        console.warn('[LOGIN] Vendor password mismatch for:', username);
      }
    } else {
      console.warn('[LOGIN] Vendor not found or not approved:', username);
    }

    return NextResponse.json({ success: false, message: 'Invalid credentials or vendor not approved' }, { status: 401 });
  } catch (error: any) {
    console.error('[ERROR] Vendor login failed:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}