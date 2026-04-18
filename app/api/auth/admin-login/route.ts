import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

async function ensureDefaultAdmin() {
  const db = getDB();
  const adminRef = doc(db, 'admins', 'qwertyu');
  const existing = await getDoc(adminRef);
  
  if (!existing.exists()) {
    await setDoc(adminRef, {
      username: 'qwertyu',
      password: 'qwertyu',
      createdAt: new Date()
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDefaultAdmin();
    
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

    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  } catch (error: any) {
    console.error('[ERROR] Admin login failed:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}