'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from './cart-context';
import { useAuth } from './auth-context';

export default function Header() {
  const { state } = useCart();
  const { user, isLoggedIn, logout, sendMessage, unreadCount } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/admin', label: 'Admin' },
    { href: '/vendor', label: 'Sell' },
  ];

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (supportMessage.trim()) {
      sendMessage(supportMessage);
      setSupportMessage('');
      setSupportOpen(false);
      alert('Message sent! We will get back to you soon.');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b header-enter sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-14 md:h-16">
          <Link href="/" className="text-xl md:text-2xl font-bold text-gray-900">
            Sensey
          </Link>

          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className="text-sm lg:text-base text-gray-700 hover:text-gray-900 font-semibold whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
            
            {isLoggedIn && user?.role === 'user' && (
              <div className="relative">
                <button
                  onClick={() => setSupportOpen(!supportOpen)}
                  className="text-sm text-gray-800 hover:text-indigo-600 flex items-center gap-1 font-semibold"
                >
                  <span className="text-base">💬</span>
                  <span className="hidden lg:inline">Support</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {supportOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 animate-slide-up z-50">
                    <h4 className="font-bold text-gray-900 mb-3">Contact Support</h4>
                    <form onSubmit={handleSupportSubmit}>
                      <textarea
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        placeholder="Describe your issue..."
                        className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm mb-3 resize-none text-gray-900"
                        rows={3}
                      />
                      <button
                        type="submit"
                        className="w-full py-2 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700"
                      >
                        Send Message
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            <Link href="/cart" className="text-gray-700 hover:text-gray-900 relative flex items-center font-semibold">
              <span className="text-sm lg:text-base">Cart</span>
              {state.items.length > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                  {state.items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 hidden lg:inline">{user?.username}</span>
                <button
                  onClick={logout}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-medium hover:bg-indigo-200"
              >
                Login
              </Link>
            )}
          </nav>

          <div className="flex items-center md:hidden">
            <Link href="/cart" className="text-gray-700 hover:text-gray-900 relative mr-3">
              <span className="text-lg">🛒</span>
              {state.items.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {state.items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Link>
            
            {isLoggedIn ? (
              <button
                onClick={logout}
                className="text-xs text-rose-600 mr-3 font-medium"
              >
                Logout
              </button>
            ) : (
              <Link href="/login" className="text-sm text-indigo-600 font-medium mr-3">
                Login
              </Link>
            )}
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-gray-900 p-2"
            >
              <span className="text-xl">{mobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 space-y-2">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className="block text-gray-700 hover:text-gray-900 py-2 px-2 rounded-lg hover:bg-gray-50 font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {isLoggedIn && user?.role === 'user' && (
              <button
                onClick={() => setSupportOpen(!supportOpen)}
                className="w-full text-left text-gray-700 py-2 px-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 font-semibold"
              >
                💬 Support
              </button>
            )}
            
            {isLoggedIn && supportOpen && (
              <div className="px-2 pb-2">
                <form onSubmit={handleSupportSubmit}>
                  <textarea
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Describe your issue..."
                    className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm mb-2 resize-none text-gray-900"
                    rows={3}
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 text-white rounded-xl font-semibold text-sm"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}