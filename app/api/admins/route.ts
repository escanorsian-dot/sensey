import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Username and password required' }, { status: 400 });
    }

    const db = getDB();
    const existingDoc = await getDoc(doc(db, 'admins', username));
    
    if (existingDoc.exists()) {
      return NextResponse.json({ success: false, message: 'Admin already exists' }, { status: 400 });
    }

    await setDoc(doc(db, 'admins', username), {
      username,
      password,
      createdAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[ERROR] Add admin failed:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = getDB();
    const adminsRef = collection(db, 'admins');
    const snapshot = await getDocs(adminsRef);
    
    const admins = snapshot.docs.map(doc => ({
      username: doc.id
    }));

    return NextResponse.json({ success: true, admins });
  } catch (error: any) {
    console.error('[ERROR] Get admins failed:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ success: false, message: 'Username required' }, { status: 400 });
    }

    if (username === 'qwertyu') {
      return NextResponse.json({ success: false, message: 'Cannot delete default admin' }, { status: 400 });
    }

    const db = getDB();
    await deleteDoc(doc(db, 'admins', username));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[ERROR] Delete admin failed:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}