'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { useProducts } from '../../products-context';
import { useCart } from '../../cart-context';

export default function ProductDetail() {
  const params = useParams();
  const { products } = useProducts();
  const { dispatch } = useCart();
  const product = products.find(p => p.id === params.id);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!product) {
    return <div className="text-center py-8">Product not found</div>;
  }

  const allImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const currentImage = allImages[activeImageIndex] || product.image;

  const addToCart = () => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Image Gallery Section */}
        <div className="md:col-span-7 space-y-6">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-slate-100 border border-slate-200 shadow-2xl">
            <Image
              src={currentImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              priority
            />
          </div>
          
          {allImages.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all 
                    ${activeImageIndex === idx ? 'border-blue-600 ring-2 ring-blue-100 shadow-lg' : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'}`}
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

        {/* Product Info Section */}
        <div className="md:col-span-5 flex flex-col justify-center">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">{product.name}</h1>
              {product.vendor && (
                <div className="flex items-center space-x-2">
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Official Vendor</span>
                  <p className="text-slate-500 font-medium text-sm">by <span className="text-slate-900 font-bold underline decoration-slate-200 underline-offset-4">{product.vendor}</span></p>
                </div>
              )}
            </div>

            <div className="h-px bg-slate-100 w-full" />

            <div className="space-y-4">
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                {product.description}
              </p>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-5xl font-black text-emerald-600 tracking-tighter">${product.price}</span>
                <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">USD + Tax</span>
              </div>
              
              <button
                onClick={addToCart}
                className="w-full bg-slate-900 text-white py-6 rounded-3xl hover:bg-black text-xl font-black shadow-2xl transition-all transform hover:-translate-y-2 active:scale-95 group"
              >
                🛒 Add to Cart
              </button>
            </div>

            <div className="pt-4 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              <span>Free Global Shipping</span>
              <span>•</span>
              <span>30-Day Returns</span>
              <span>•</span>
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
