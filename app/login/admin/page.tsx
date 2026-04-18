'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../auth-context';

export default function AdminLoginPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user?.role === 'admin') {
      router.replace('/admin');
    }
  }, [isLoggedIn, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('sensey_user', JSON.stringify({ username: data.user.username, role: 'admin', isLoggedIn: true }));
        window.location.replace('/admin');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    }

    setIsLoading(false);
  };

  if (isLoggedIn && user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Redirecting to Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl font-black text-white">Sensey</Link>
          <p className="text-slate-300 mt-2">Admin Portal</p>
        </div>

        <div className="bg-slate-800/80 rounded-3xl p-6 md:p-8 border border-slate-600">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚙️</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Admin Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="w-full p-3 md:p-4 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full p-3 md:p-4 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter password"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 rounded-xl p-3 text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 md:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all transform hover:-translate-y-1 active:scale-95"
            >
              {isLoading ? '⏳' : '🔐 Login'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6">
          <Link href="/login" className="text-slate-300 hover:text-white font-medium">← Back to Main Login</Link>
        </p>
      </div>
    </div>
  );
}