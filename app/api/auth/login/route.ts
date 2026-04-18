import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Username and password required' }, { status: 400 });
    }

    const db = getDB();

    const adminDoc = await getDoc(doc(db, 'admins', username));
    if (adminDoc.exists() && adminDoc.data().password === password) {
      return NextResponse.json({ success: true, role: 'admin', username });
    }

    const vendorsRef = collection(db, 'vendors');
    const vendorQuery = query(vendorsRef, where('username', '==', username));
    const vendorSnapshot = await getDocs(vendorQuery);
    
    if (!vendorSnapshot.empty) {
      const vendorData = vendorSnapshot.docs[0].data();
      if (vendorData.password === password) {
        return NextResponse.json({ success: true, role: 'vendor', username });
      }
    }

    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('username', '==', username));
    const userSnapshot = await getDocs(userQuery);
    
    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data();
      if (userData.password === password) {
        return NextResponse.json({ success: true, role: 'user', username });
      }
    }

    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  } catch (error: any) {
    console.error('[ERROR] Login failed:', error);
    return NextResponse.json({ success: false, message: error.message || 'Login failed' }, { status: 500 });
  }
}