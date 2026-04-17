'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useProducts } from './products-context';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function Home() {
  const { products } = useProducts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-10 md:mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
            <span>✨</span> Welcome to our store
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-4">
            Discover Amazing
            <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Products</span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto">
            Shop the best products at unbeatable prices. Quality guaranteed with easy returns.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 animate-scale-in">
            <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
              <span className="text-6xl">📦</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No products available</h2>
            <p className="text-gray-500">Check back soon for new arrivals!</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 animate-slide-in">Featured Products</h2>
              <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold animate-slide-in">
                {products.length} items
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 stagger-grid">
              {products.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
                      <span className="text-indigo-600 font-bold text-sm">{formatCurrency(product.price)}</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    {product.vendor && (
                      <p className="text-sm text-gray-500 mb-2">by {product.vendor}</p>
                    )}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white bg-indigo-600 px-4 py-2 rounded-full group-hover:bg-indigo-700 transition-colors">
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <div className="bg-white rounded-3xl p-8 shadow-lg text-center hover-lift">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚚</span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Free Shipping</h3>
            <p className="text-sm text-gray-500">On all orders above ₹499</p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-lg text-center hover-lift">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔒</span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Secure Payments</h3>
            <p className="text-sm text-gray-500">100% secure transactions</p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-lg text-center hover-lift">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">↩️</span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Easy Returns</h3>
            <p className="text-sm text-gray-500">30-day return policy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
