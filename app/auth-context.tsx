'use client';

import { createContext, useContext, useState, useEffect, useMemo } from 'react';

interface User {
  uid?: string;
  username: string;
  role: 'admin' | 'user';
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
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, password: string) => Promise<boolean>;
  supportMessages: SupportMessage[];
  sendMessage: (message: string) => Promise<void>;
  adminReply: (messageId: string, reply: string) => Promise<void>;
  markAsRead: () => void;
  unreadCount: number;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [lastRead, setLastRead] = useState<number>(0);

  const ADMIN_USERNAME = 'qwertyu';
  const ADMIN_PASSWORD = 'qwertyu';

  useEffect(() => {
    const stored = localStorage.getItem('sensey_user');
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        if (userData.isLoggedIn) {
          setUser({ username: userData.username, role: userData.role });
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    const storedMessages = localStorage.getItem('sensey_support_messages');
    if (storedMessages) {
      setSupportMessages(JSON.parse(storedMessages));
    }

    const storedLastRead = localStorage.getItem('sensey_support_last_read');
    if (storedLastRead) {
      setLastRead(parseInt(storedLastRead));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const userData = { username: 'admin', role: 'admin' as const, isLoggedIn: true };
      localStorage.setItem('sensey_user', JSON.stringify(userData));
      setUser({ username: 'admin', role: 'admin' });
      return true;
    }

    const users = JSON.parse(localStorage.getItem('sensey_users') || '[]');
    const foundUser = users.find((u: any) => u.username === username && u.password === password);

    if (foundUser) {
      const userData = { username: foundUser.username, role: 'user' as const, isLoggedIn: true };
      localStorage.setItem('sensey_user', JSON.stringify(userData));
      setUser({ username: foundUser.username, role: 'user' });
      return true;
    }

    return false;
  };

  const logout = () => {
    localStorage.removeItem('sensey_user');
    setUser(null);
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('sensey_users') || '[]');

    if (users.find((u: any) => u.username === username)) {
      return false;
    }

    users.push({ username, password });
    localStorage.setItem('sensey_users', JSON.stringify(users));

    const userData = { username, role: 'user' as const, isLoggedIn: true };
    localStorage.setItem('sensey_user', JSON.stringify(userData));
    setUser({ username, role: 'user' });
    return true;
  };

  const sendMessage = async (message: string) => {
    const newMessage: SupportMessage = {
      id: Date.now().toString(),
      username: user?.username || 'guest',
      message,
      timestamp: Date.now(),
    };

    const updated = [...supportMessages, newMessage];
    setSupportMessages(updated);
    localStorage.setItem('sensey_support_messages', JSON.stringify(updated));
  };

  const adminReply = async (messageId: string, reply: string) => {
    const updated = supportMessages.map((msg) =>
      msg.id === messageId ? { ...msg, reply } : msg
    );
    setSupportMessages(updated);
    localStorage.setItem('sensey_support_messages', JSON.stringify(updated));
  };

  const markAsRead = () => {
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
      markAsRead,
      unreadCount,
      isFirebaseEnabled: false,
    }),
    [user, supportMessages, unreadCount]
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