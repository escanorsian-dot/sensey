import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

export async function GET() {
  try {
    const db = getDB();
    const messagesRef = collection(db, 'support_messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.getTime() || Date.now()
    }));

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    console.error('[ERROR] Get messages failed:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { username, message } = await req.json();

    if (!username || !message) {
      return NextResponse.json({ success: false, message: 'Username and message required' }, { status: 400 });
    }

    const db = getDB();
    const messagesRef = collection(db, 'support_messages');
    
    await addDoc(messagesRef, {
      username,
      message,
      timestamp: new Date(),
      reply: null
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[ERROR] Send message failed:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get('id');

    if (!messageId) {
      return NextResponse.json({ success: false, message: 'Message ID required' }, { status: 400 });
    }

    const db = getDB();
    await deleteDoc(doc(db, 'support_messages', messageId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[ERROR] Delete message failed:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}