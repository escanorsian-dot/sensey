'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../cart-context';
import { useRouter } from 'next/navigation';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CartPage() {
  const { state, dispatch } = useCart();
  const router = useRouter();

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch({ type: 'REMOVE_ITEM', payload: id });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    }
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-10 md:p-14 rounded-3xl shadow-2xl max-w-md w-full animate-scale-in">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
            <span className="text-5xl">🛒</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything yet!</p>
          <Link href="/products" className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            <span>✨</span> Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold transition-all hover:-translate-x-1"
        >
          <span className="text-xl">←</span> Back
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Shopping Cart</h1>
            <p className="text-gray-500 mt-1">{state.items.length} {state.items.length === 1 ? 'item' : 'items'}</p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-semibold text-gray-600">Updated</span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {state.items.map((item, index) => (
            <div 
              key={item.id} 
              className="bg-white rounded-2xl md:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 md:p-6 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-md group">
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-gray-900 text-base md:text-lg truncate">{item.name}</h2>
                  {item.vendor && (
                    <p className="text-xs md:text-sm text-gray-500">{item.vendor}</p>
                  )}
                  <p className="text-lg md:text-xl font-black text-indigo-600 mt-1">{formatCurrency(item.price)}</p>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 md:w-10 md:h-10 bg-slate-100 hover:bg-indigo-100 text-gray-700 hover:text-indigo-600 rounded-xl font-bold transition-all flex items-center justify-center hover:scale-110 active:scale-95"
                  >
                    -
                  </button>
                  <span className="w-8 md:w-10 text-center font-bold text-lg">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 md:w-10 md:h-10 bg-slate-100 hover:bg-indigo-100 text-gray-700 hover:text-indigo-600 rounded-xl font-bold transition-all flex items-center justify-center hover:scale-110 active:scale-95"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <p className="font-black text-gray-900 text-lg md:text-xl">{formatCurrency(item.price * item.quantity)}</p>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="w-10 h-10 md:w-12 md:h-12 bg-rose-100 hover:bg-rose-200 text-rose-600 hover:text-rose-700 rounded-xl transition-all flex items-center justify-center hover:scale-110 active:scale-95"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 font-medium">Subtotal ({state.items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
            <span className="text-xl font-bold text-gray-700">{formatCurrency(state.total)}</span>
          </div>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <span className="text-gray-500 font-medium">Shipping</span>
            <span className="text-emerald-600 font-bold">FREE</span>
          </div>
          <div className="flex items-center justify-between mb-8">
            <span className="text-xl md:text-2xl font-black text-gray-900">Total</span>
            <span className="text-2xl md:text-3xl font-black text-indigo-600">{formatCurrency(state.total)}</span>
          </div>
          
          <Link
            href="/checkout"
            className="block w-full py-4 md:py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg md:text-xl text-center shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:scale-95"
          >
            🚀 Proceed to Checkout
          </Link>
          
          <Link
            href="/products"
            className="block w-full py-3 mt-3 text-gray-500 hover:text-gray-700 font-medium text-center transition-colors"
          >
            ← Continue Shopping
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-md text-center hover-lift">
            <span className="text-2xl block mb-2">🚚</span>
            <p className="font-bold text-gray-900 text-sm">Free Shipping</p>
            <p className="text-xs text-gray-500 mt-1">On orders above ₹499</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-md text-center hover-lift">
            <span className="text-2xl block mb-2">🔒</span>
            <p className="font-bold text-gray-900 text-sm">Secure Payment</p>
            <p className="text-xs text-gray-500 mt-1">100% protected</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-md text-center hover-lift">
            <span className="text-2xl block mb-2">↩️</span>
            <p className="font-bold text-gray-900 text-sm">Easy Returns</p>
            <p className="text-xs text-gray-500 mt-1">30 day policy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
