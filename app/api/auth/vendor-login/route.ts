import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
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

    const db = getDB();
    const vendorsRef = collection(db, 'vendors');
    const q = query(vendorsRef, where('username', '==', username));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const vendorData = snapshot.docs[0].data();
      if (vendorData.password === password) {
        console.log('[LOGIN] Vendor login successful:', username);
        return NextResponse.json({ 
          success: true, 
          user: { username: vendorData.username, role: 'vendor' }
        });
      }
    }

    console.log('[LOGIN] Invalid vendor credentials for:', username);
    return NextResponse.json({ success: false, message: 'Invalid credentials or vendor not approved' }, { status: 401 });
  } catch (error: any) {
    console.error('[ERROR] Vendor login failed:', error);
    return NextResponse.json({ success: false, message: error.message || 'Login failed' }, { status: 500 });
  }
}