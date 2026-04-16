'use client';

import {
  type User,
  onAuthStateChanged,
  signInAnonymously,
} from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, isFirebaseConfigured } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isFirebaseEnabled: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(isFirebaseConfigured));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      return;
    }

    const firebaseAuth = auth;

    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      async (nextUser) => {
        if (nextUser) {
          setUser(nextUser);
          setIsLoading(false);
          return;
        }

        try {
          await signInAnonymously(firebaseAuth);
        } catch {
          setError('Firebase anonymous sign-in is not enabled yet.');
          setIsLoading(false);
        }
      },
      () => {
        setError('We could not connect to Firebase authentication.');
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, error, isFirebaseEnabled: isFirebaseConfigured }),
    [error, isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
