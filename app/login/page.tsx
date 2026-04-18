'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../auth-context';
import Link from 'next/link';

interface LoginCredentials {
  username: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'user' | 'vendor'>('user');
  const [formData, setFormData] = useState<LoginCredentials & { confirmPassword?: string }>({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!isLogin && formData.confirmPassword !== formData.password) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (isLogin) {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        router.push('/');
      } else {
        setError(result.message || 'Invalid credentials');
      }
    } else {
      const result = await register(formData.username, formData.password);
      if (result.success) {
        router.push('/');
      } else {
        setError(result.message || 'Registration failed');
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl font-black text-gray-900">Sensey</Link>
          <p className="text-gray-500 mt-2">{isLogin ? 'Welcome back!' : 'Create your account'}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
          {!isLogin && (
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-700 mb-2">I am a:</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('user')}
                  className={`flex-1 py-2 px-4 rounded-xl font-semibold text-sm transition-all ${
                    userType === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                  }`}
                >
                  🛒 Customer
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('vendor')}
                  className={`flex-1 py-2 px-4 rounded-xl font-semibold text-sm transition-all ${
                    userType === 'vendor'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                  }`}
                >
                  🏪 Vendor
                </button>
              </div>
              {userType === 'vendor' && (
                <p className="text-xs text-amber-600 mt-2 text-center">
                  Note: Vendor accounts require admin approval
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="w-full p-3 md:p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-gray-900"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full p-3 md:p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-gray-900"
                placeholder="Enter password"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required={!isLogin}
                  className="w-full p-3 md:p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-gray-900"
                  placeholder="Confirm password"
                />
              </div>
            )}

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 font-semibold text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 md:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all transform hover:-translate-y-1 active:scale-95"
            >
              {isLoading ? '⏳' : isLogin ? '🔐 Login' : '✨ Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
            </button>
          </div>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-gray-500 hover:text-gray-700">← Back to Store</Link>
        </p>
      </div>
    </div>
  );
}