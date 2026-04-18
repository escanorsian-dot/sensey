'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useProducts } from '../products-context';
import { useCart } from '../cart-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function AddToCartButton({ product, onAdd }: { product: any; onAdd: () => void }) {
  const [isAdding, setIsAdding] = useState(false);
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    onAdd();
    setTimeout(() => setIsAdding(false), 1000);
  };
  
  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition-all transform hover:scale-110 ${
        isAdding ? 'bg-emerald-500 scale-110' : 'bg-amber-400 hover:bg-amber-500'
      }`}
      title="Add to cart"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </button>
  );
}

export default function ProductsPage() {
  const { products } = useProducts();
  const { dispatch } = useCart();
  const router = useRouter();

  const handleAddToCart = (product: any) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold transition-all hover:-translate-x-1"
        >
          <span className="text-xl">←</span> Back
        </button>

        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold mb-4 animate-bounce-soft">
            <span>✨</span> New Arrivals
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">Our Products</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Discover amazing products at unbeatable prices. Quality guaranteed!
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
              <span className="text-6xl">📦</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No products available</h2>
            <p className="text-gray-500">Check back soon for new arrivals!</p>
          </div>
        ) : (
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
                  <h2 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {product.name}
                  </h2>
                  {product.vendor && (
                    <p className="text-sm text-gray-500 mb-2">by {product.vendor}</p>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/products/${product.id}`}
                      className="text-xs font-semibold text-white bg-indigo-600 px-4 py-2 rounded-full group-hover:bg-indigo-700 transition-colors"
                    >
                      View Details →
                    </Link>
                    <AddToCartButton product={product} onAdd={() => handleAddToCart(product)} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 text-center hover-lift">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚚</span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Free Shipping</h3>
            <p className="text-sm text-gray-500">On all orders above ₹499</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 text-center hover-lift">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔒</span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Secure Payments</h3>
            <p className="text-sm text-gray-500">100% secure transactions</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 text-center hover-lift">
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
