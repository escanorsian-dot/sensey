import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/firebase';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Username and password required' }, { status: 400 });
    }

    const db = getDB();
    const usersRef = collection(db, 'users');

    const existingQuery = query(usersRef, where('username', '==', username));
    const existing = await getDocs(existingQuery);

    if (!existing.empty) {
      return NextResponse.json({ success: false, message: 'Username already exists' }, { status: 400 });
    }

    await setDoc(doc(db, 'users', username), {
      username,
      password,
      createdAt: new Date()
    });

    return NextResponse.json({ success: true, username });
  } catch (error: any) {
    console.error('[ERROR] Registration failed:', error);
    return NextResponse.json({ success: false, message: error.message || 'Registration failed' }, { status: 500 });
  }
}