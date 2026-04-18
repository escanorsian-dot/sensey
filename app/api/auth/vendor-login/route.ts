import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

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
        return NextResponse.json({ 
          success: true, 
          user: { username: vendorData.username, role: 'vendor' }
        });
      }
    }

    return NextResponse.json({ success: false, message: 'Invalid credentials or vendor not approved' }, { status: 401 });
  } catch (error: any) {
    console.error('[ERROR] Vendor login failed:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}