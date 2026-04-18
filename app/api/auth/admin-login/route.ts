import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Username and password required' }, { status: 400 });
    }

    const db = getDB();
    const adminDoc = await getDoc(doc(db, 'admins', username));
    
    if (adminDoc.exists()) {
      const adminData = adminDoc.data();
      if (adminData.password === password) {
        return NextResponse.json({ 
          success: true, 
          user: { username: adminData.username, role: 'admin' }
        });
      }
    }

    const defaultAdmin = await getDoc(doc(db, 'admins', 'qwertyu'));
    if (defaultAdmin.exists()) {
      const defaultData = defaultAdmin.data();
      if (username === defaultData.username && defaultData.password === password) {
        return NextResponse.json({ 
          success: true, 
          user: { username: defaultData.username, role: 'admin' }
        });
      }
    }

    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  } catch (error: any) {
    console.error('[ERROR] Admin login failed:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}