'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts } from '../../products-context';
import { useCart } from '../../cart-context';

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const { products } = useProducts();
  const { dispatch } = useCart();
  const product = products.find(p => p.id === params.id);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-3xl shadow-xl max-w-md mx-4">
          <span className="text-6xl block mb-4">🔍</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-500 mb-6">This product may have been removed or doesn't exist.</p>
          <Link href="/products" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const allImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const currentImage = allImages[activeImageIndex] || product.image;

  const addToCart = () => {
    dispatch({ type: 'ADD_ITEM', payload: product });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold transition-all hover:-translate-x-1"
        >
          <span className="text-xl">←</span> Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 animate-fade-in">
          <div className="md:col-span-7 space-y-6">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-slate-100 border border-slate-200 shadow-2xl group">
              <Image
                src={currentImage}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
            </div>
            
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 transform
                      ${activeImageIndex === idx ? 'border-indigo-600 ring-2 ring-indigo-100 shadow-lg scale-105' : 'border-slate-200 hover:border-indigo-300 opacity-70 hover:opacity-100'}`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} gallery ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-5 flex flex-col justify-center">
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-xl space-y-6 md:space-y-8 animate-slide-up">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">In Stock</span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">{product.name}</h1>
                {product.vendor && (
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Official Vendor</span>
                    <p className="text-gray-500 font-medium text-sm">by <span className="text-gray-900 font-bold">{product.vendor}</span></p>
                  </div>
                )}
              </div>

              <div className="h-px bg-slate-100 w-full" />

              <div className="space-y-4">
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="space-y-6 pt-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-4xl lg:text-5xl font-black text-indigo-600 tracking-tighter">₹{product.price.toLocaleString('en-IN')}</span>
                  <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">INR</span>
                </div>
                
                <button
                  onClick={addToCart}
                  className={`w-full py-5 md:py-6 rounded-2xl md:rounded-3xl text-lg md:text-xl font-black shadow-xl transition-all transform hover:-translate-y-2 active:scale-95 group flex items-center justify-center gap-3 ${
                    addedToCart 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-900 text-white hover:bg-black'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <span className="text-2xl">✅</span> Added to Cart!
                    </>
                  ) : (
                    <>
                      <span className="text-2xl group-hover:scale-110 transition-transform">🛒</span> Add to Cart
                    </>
                  )}
                </button>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <span className="flex items-center gap-1"><span>🚚</span> Free Shipping</span>
                <span className="flex items-center gap-1"><span>↩️</span> 30-Day Returns</span>
                <span className="flex items-center gap-1"><span>🔒</span> Secure</span>
              </div>
            </div>

            <div className="mt-6 bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Fast Delivery</p>
                  <p className="text-sm text-gray-500">Get it delivered to your doorstep</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
