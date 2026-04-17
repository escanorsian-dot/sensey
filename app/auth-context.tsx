'use client';

import { createContext, useContext, useMemo, useState } from 'react';

interface User {
  uid: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isFirebaseEnabled: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user] = useState<User | null>({ uid: 'anonymous' });
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const value = useMemo(
    () => ({ user, isLoading, error, isFirebaseEnabled: false }),
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
