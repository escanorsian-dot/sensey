'use client';

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getDB, isBrowser } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';

interface User {
  uid?: string;
  username: string;
  role: 'admin' | 'vendor' | 'user';
}

interface SupportMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
  reply?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string; role?: string }>;
  logout: () => void;
  register: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  supportMessages: SupportMessage[];
  sendMessage: (message: string) => Promise<void>;
  adminReply: (messageId: string, reply: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  markAsRead: () => void;
  unreadCount: number;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [lastRead, setLastRead] = useState<number>(0);

  const loadUserFromStorage = useCallback(() => {
    if (!isBrowser()) return;
    try {
      const stored = localStorage.getItem('sensey_user');
      if (stored) {
        const userData = JSON.parse(stored);
        if (userData && userData.isLoggedIn) {
          setUser({ username: userData.username, role: userData.role });
          return;
        }
      }
      setUser(null);
    } catch (e) {
      console.error('Error parsing user data:', e);
      setUser(null);
    }
  }, []);

  const loadSupportMessages = useCallback(async () => {
    if (!isBrowser()) return;
    try {
      const db = getDB();
      const messagesRef = collection(db, 'support_messages');
      const q = query(messagesRef, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      
      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          username: data.username || '',
          message: data.message || '',
          reply: data.reply || undefined,
          timestamp: data.timestamp?.toDate?.()?.getTime() || Date.now()
        };
      });
      
      setSupportMessages(messages);

      const storedLastRead = localStorage.getItem('sensey_support_last_read');
      if (storedLastRead) {
        setLastRead(parseInt(storedLastRead));
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }, []);

  useEffect(() => {
    loadUserFromStorage();
    loadSupportMessages();

    if (isBrowser()) {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'sensey_user') {
          loadUserFromStorage();
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [loadUserFromStorage, loadSupportMessages]);

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string; role?: string }> => {
    if (!isBrowser()) return { success: false, message: 'Cannot login on server' };
    try {
      const db = getDB();
      
      const adminDoc = await getDoc(doc(db, 'admins', username));
      if (adminDoc.exists() && adminDoc.data().password === password) {
        const userData = { username, role: 'admin' as const, isLoggedIn: true };
        localStorage.setItem('sensey_user', JSON.stringify(userData));
        setUser({ username, role: 'admin' });
        return { success: true, role: 'admin' };
      }

      const vendorsRef = collection(db, 'vendors');
      const vendorQuery = query(vendorsRef, where('username', '==', username));
      const vendorSnapshot = await getDocs(vendorQuery);
      
      if (!vendorSnapshot.empty) {
        const vendorData = vendorSnapshot.docs[0].data();
        if (vendorData.password === password) {
          const userData = { username, role: 'vendor' as const, isLoggedIn: true };
          localStorage.setItem('sensey_user', JSON.stringify(userData));
          setUser({ username, role: 'vendor' });
          return { success: true, role: 'vendor' };
        }
      }

      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('username', '==', username));
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userDataDoc = userSnapshot.docs[0].data();
        if (userDataDoc.password === password) {
          const userData = { username, role: 'user' as const, isLoggedIn: true };
          localStorage.setItem('sensey_user', JSON.stringify(userData));
          setUser({ username, role: 'user' });
          return { success: true, role: 'user' };
        }
      }

      return { success: false, message: 'Invalid username or password' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'Login failed' };
    }
  };

  const logout = () => {
    if (!isBrowser()) return;
    localStorage.removeItem('sensey_user');
    setUser(null);
    window.location.href = '/';
  };

  const register = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    if (!isBrowser()) return { success: false, message: 'Cannot register on server' };
    try {
      const db = getDB();
      const usersRef = collection(db, 'users');
      const userQuery = query(usersRef, where('username', '==', username));
      const existing = await getDocs(userQuery);

      if (!existing.empty) {
        return { success: false, message: 'Username already exists' };
      }

      await setDoc(doc(db, 'users', username), { username, password, createdAt: new Date() });

      const userData = { username, role: 'user' as const, isLoggedIn: true };
      localStorage.setItem('sensey_user', JSON.stringify(userData));
      setUser({ username, role: 'user' });
      return { success: true };
    } catch (err) {
      console.error('Register error:', err);
      return { success: false, message: 'Registration failed' };
    }
  };

  const sendMessage = async (message: string) => {
    if (!isBrowser()) return;
    try {
      const db = getDB();
      const messagesRef = collection(db, 'support_messages');
      
      await addDoc(messagesRef, {
        username: user?.username || 'guest',
        message,
        timestamp: new Date(),
        reply: null
      });

      await loadSupportMessages();
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  const adminReply = async (messageId: string, reply: string) => {
    if (!isBrowser()) return;
    try {
      const db = getDB();
      await updateDoc(doc(db, 'support_messages', messageId), {
        reply,
        repliedAt: new Date()
      });
      await loadSupportMessages();
    } catch (err) {
      console.error('Reply error:', err);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const db = getDB();
      await deleteDoc(doc(db, 'support_messages', messageId));
      await loadSupportMessages();
    } catch (err) {
      console.error('Delete message error:', err);
    }
  };

  const markAsRead = () => {
    if (!isBrowser()) return;
    setLastRead(Date.now());
    localStorage.setItem('sensey_support_last_read', Date.now().toString());
  };

  const unreadCount = supportMessages.filter((msg) => msg.timestamp > lastRead && msg.username !== 'admin').length;

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: !!user,
      isLoading: false,
      error: null,
      login,
      logout,
      register,
      supportMessages,
      sendMessage,
      adminReply,
      deleteMessage,
      markAsRead,
      unreadCount,
      refreshUser: loadUserFromStorage
    }),
    [user, supportMessages, unreadCount, loadUserFromStorage]
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