'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from './cart-context';

export default function Header() {
  const { state } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/submit-receipt', label: 'Receipt' },
    { href: '/admin', label: 'Admin' },
    { href: '/vendor', label: 'Sell' },
  ];

  return (
    <header className="bg-white shadow-sm border-b header-enter sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-14 md:h-16">
          <Link href="/" className="text-xl md:text-2xl font-bold text-gray-900">
            Sensey
          </Link>

          <nav className="hidden md:flex space-x-4 lg:space-x-8">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className="text-sm lg:text-base text-gray-700 hover:text-gray-900 whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/cart" className="text-gray-700 hover:text-gray-900 relative flex items-center">
              <span className="text-sm lg:text-base">Cart</span>
              {state.items.length > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                  {state.items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Link>
          </nav>

          <div className="flex items-center md:hidden">
            <Link href="/cart" className="text-gray-700 hover:text-gray-900 relative mr-4">
              <span className="text-lg">🛒</span>
              {state.items.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {state.items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-gray-900 p-2"
            >
              <span className="text-xl">{mobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className="text-gray-700 hover:text-gray-900 py-2 px-2 rounded-lg hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
