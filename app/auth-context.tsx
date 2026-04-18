'use client';

import { createContext, useContext, useState, useEffect, useMemo } from 'react';

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
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  register: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  supportMessages: SupportMessage[];
  sendMessage: (message: string) => Promise<void>;
  adminReply: (messageId: string, reply: string) => Promise<void>;
  markAsRead: () => void;
  unreadCount: number;
  adminUsers: Array<{ username: string; password: string }>;
  vendorUsers: Array<{ username: string; password: string }>;
  addAdminUser: (username: string, password: string) => Promise<void>;
  removeAdminUser: (username: string) => Promise<void>;
  addVendorUser: (username: string, password: string) => Promise<void>;
  removeVendorUser: (username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [lastRead, setLastRead] = useState<number>(0);
  const [adminUsers, setAdminUsers] = useState<Array<{ username: string; password: string }>>([]);
  const [vendorUsers, setVendorUsers] = useState<Array<{ username: string; password: string }>>([]);

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

    const storedAdmins = localStorage.getItem('sensey_admin_users');
    if (storedAdmins) {
      setAdminUsers(JSON.parse(storedAdmins));
    } else {
      const defaultAdmin = { username: 'qwertyu', password: 'qwertyu' };
      setAdminUsers([defaultAdmin]);
      localStorage.setItem('sensey_admin_users', JSON.stringify([defaultAdmin]));
    }

    const storedVendors = localStorage.getItem('sensey_vendor_users');
    if (storedVendors) {
      setVendorUsers(JSON.parse(storedVendors));
    }
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const admins = JSON.parse(localStorage.getItem('sensey_admin_users') || '[]');
    const vendorUsersData = JSON.parse(localStorage.getItem('sensey_vendor_users') || '[]');
    const regularUsers = JSON.parse(localStorage.getItem('sensey_users') || '[]');

    const admin = admins.find((u: any) => u.username === username && u.password === password);
    if (admin) {
      const userData = { username: admin.username, role: 'admin' as const, isLoggedIn: true };
      localStorage.setItem('sensey_user', JSON.stringify(userData));
      setUser({ username: admin.username, role: 'admin' });
      return { success: true };
    }

    const vendor = vendorUsersData.find((u: any) => u.username === username && u.password === password);
    if (vendor) {
      const userData = { username: vendor.username, role: 'vendor' as const, isLoggedIn: true };
      localStorage.setItem('sensey_user', JSON.stringify(userData));
      setUser({ username: vendor.username, role: 'vendor' });
      return { success: true };
    }

    const foundUser = regularUsers.find((u: any) => u.username === username && u.password === password);
    if (foundUser) {
      const userData = { username: foundUser.username, role: 'user' as const, isLoggedIn: true };
      localStorage.setItem('sensey_user', JSON.stringify(userData));
      setUser({ username: foundUser.username, role: 'user' });
      return { success: true };
    }

    return { success: false, message: 'Invalid username or password' };
  };

  const logout = () => {
    localStorage.removeItem('sensey_user');
    setUser(null);
  };

  const register = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const regularUsers = JSON.parse(localStorage.getItem('sensey_users') || '[]');

    if (regularUsers.find((u: any) => u.username === username)) {
      return { success: false, message: 'Username already exists' };
    }

    regularUsers.push({ username, password });
    localStorage.setItem('sensey_users', JSON.stringify(regularUsers));

    const userData = { username, role: 'user' as const, isLoggedIn: true };
    localStorage.setItem('sensey_user', JSON.stringify(userData));
    setUser({ username, role: 'user' });
    return { success: true };
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

  const addAdminUser = async (username: string, password: string) => {
    const updated = [...adminUsers, { username, password }];
    setAdminUsers(updated);
    localStorage.setItem('sensey_admin_users', JSON.stringify(updated));
  };

  const removeAdminUser = async (username: string) => {
    if (username === 'qwertyu') return;
    const updated = adminUsers.filter(u => u.username !== username);
    setAdminUsers(updated);
    localStorage.setItem('sensey_admin_users', JSON.stringify(updated));
  };

  const addVendorUser = async (username: string, password: string) => {
    const updated = [...vendorUsers, { username, password }];
    setVendorUsers(updated);
    localStorage.setItem('sensey_vendor_users', JSON.stringify(updated));
  };

  const removeVendorUser = async (username: string) => {
    const updated = vendorUsers.filter(u => u.username !== username);
    setVendorUsers(updated);
    localStorage.setItem('sensey_vendor_users', JSON.stringify(updated));
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
      adminUsers,
      vendorUsers,
      addAdminUser,
      removeAdminUser,
      addVendorUser,
      removeVendorUser,
    }),
    [user, supportMessages, unreadCount, adminUsers, vendorUsers]
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