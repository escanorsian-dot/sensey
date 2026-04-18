'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LoginCredentials {
  username: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<LoginCredentials & { confirmPassword?: string }>({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const ADMIN_USERNAME = 'qwertyu';
  const ADMIN_PASSWORD = 'qwertyu';

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
      if (formData.username === ADMIN_USERNAME && formData.password === ADMIN_PASSWORD) {
        localStorage.setItem('sensey_user', JSON.stringify({ username: 'admin', role: 'admin', isLoggedIn: true }));
        router.push('/admin');
        return;
      }

      const users = JSON.parse(localStorage.getItem('sensey_users') || '[]');
      const user = users.find((u: any) => u.username === formData.username && u.password === formData.password);
      
      if (user) {
        localStorage.setItem('sensey_user', JSON.stringify({ username: user.username, role: 'user', isLoggedIn: true }));
        router.push('/');
        return;
      }

      setError('Invalid username or password');
    } else {
      const users = JSON.parse(localStorage.getItem('sensey_users') || '[]');
      
      if (users.find((u: any) => u.username === formData.username)) {
        setError('Username already exists');
        setIsLoading(false);
        return;
      }

      const newUser = { username: formData.username, password: formData.password };
      users.push(newUser);
      localStorage.setItem('sensey_users', JSON.stringify(users));
      
      localStorage.setItem('sensey_user', JSON.stringify({ username: newUser.username, role: 'user', isLoggedIn: true }));
      router.push('/');
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

          <div className="mt-4 p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-gray-500 text-center">
              Admin: username <strong>qwertyu</strong>, password <strong>qwertyu</strong>
            </p>
          </div>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-gray-500 hover:text-gray-700">← Back to Store</Link>
        </p>
      </div>
    </div>
  );
}