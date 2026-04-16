'use client';

import Link from 'next/link';
import { useCart } from './cart-context';

export default function Header() {
  const { state } = useCart();

  return (
    <header className="bg-white shadow-sm border-b header-enter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Sensey
          </Link>
          <nav className="flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-gray-900">
              Home
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-gray-900">
              Products
            </Link>
            <Link href="/admin" className="text-gray-700 hover:text-gray-900">
              Admin
            </Link>
            <Link href="/vendor" className="text-gray-700 hover:text-gray-900">
              Sell Product
            </Link>
            <Link href="/cart" className="text-gray-700 hover:text-gray-900 relative">
              Cart
              {state.items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {state.items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
