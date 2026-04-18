import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

async function ensureDefaultAdmin() {
  try {
    const db = getDB();
    const adminRef = doc(db, 'admins', 'qwertyu');
    const existing = await getDoc(adminRef);
    
    if (!existing.exists()) {
      console.log('[INIT] Creating default admin user');
      await setDoc(adminRef, {
        username: 'qwertyu',
        password: 'qwertyu',
        createdAt: new Date()
      });
      console.log('[INIT] Default admin created successfully');
    } else {
      console.log('[INIT] Default admin already exists');
    }
  } catch (err) {
    console.error('[INIT] Error ensuring default admin:', err);
    // Don't throw here, allow the login to proceed if possible
  }
}

export async function POST(req: NextRequest) {
  try {
    // Basic check for Firebase config
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.error('[ERROR] Firebase Project ID is missing from environment variables');
    }

    await ensureDefaultAdmin();
    
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('[ERROR] Failed to parse request body:', parseError);
      return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 });
    }

    const { username, password } = body || {};

    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Username and password required' }, { status: 400 });
    }

    console.log('[LOGIN] Attempting admin login for:', username);
    const db = getDB();
    const adminDoc = await getDoc(doc(db, 'admins', username));
    
    if (adminDoc.exists()) {
      const adminData = adminDoc.data();
      if (adminData.password === password) {
        console.log('[LOGIN] Admin login successful:', username);
        return NextResponse.json({ 
          success: true, 
          user: { username: adminData.username, role: 'admin' }
        });
      } else {
        console.warn('[LOGIN] Password mismatch for:', username);
      }
    } else {
      console.warn('[LOGIN] Admin user not found in Firestore:', username);
    }

    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  } catch (error: any) {
    console.error('[ERROR] Admin login failed with exception:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Login failed',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}