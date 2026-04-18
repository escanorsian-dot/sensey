import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let initialized = false;

export function getFirebaseApp(): FirebaseApp {
  if (!initialized) {
    initialized = true;
    
    const missingKeys = Object.entries(firebaseConfig)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingKeys.length > 0 && typeof window !== 'undefined') {
      console.warn('[FIREBASE] Missing configuration keys:', missingKeys.join(', '));
    }

    try {
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }
    } catch (err) {
      console.error('[FIREBASE] Initialization error:', err);
      // Fallback to avoid immediate crash
      app = undefined;
    }
  }
  return app!;
}

export function getDB(): Firestore {
  if (!db) {
    const firebaseApp = getFirebaseApp();
    if (!firebaseApp) {
      throw new Error('Firebase app not initialized. Check your environment variables.');
    }
    db = getFirestore(firebaseApp);
  }
  return db;
}

export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}