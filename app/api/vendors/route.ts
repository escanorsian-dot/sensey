import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Username and password required' }, { status: 400 });
    }

    const db = getDB();
    const existingQuery = query(collection(db, 'vendors'), where('username', '==', username));
    const existing = await getDocs(existingQuery);
    
    if (!existing.empty) {
      return NextResponse.json({ success: false, message: 'Vendor already exists' }, { status: 400 });
    }

    await addDoc(collection(db, 'vendors'), {
      username,
      password,
      createdAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[ERROR] Add vendor failed:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = getDB();
    const vendorsRef = collection(db, 'vendors');
    const snapshot = await getDocs(vendorsRef);
    
    const vendors = snapshot.docs.map(doc => ({
      username: doc.id
    }));

    return NextResponse.json({ success: true, vendors });
  } catch (error: any) {
    console.error('[ERROR] Get vendors failed:', error);
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

    const db = getDB();
    await deleteDoc(doc(db, 'vendors', username));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[ERROR] Delete vendor failed:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}