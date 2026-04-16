'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useProducts } from '../products-context';

export default function ProductsPage() {
  const { products } = useProducts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-center text-slate-900 mb-8">Our Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-grid">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-lg shadow-slate-300/40 border border-slate-200 overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              width={300}
              height={200}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-bold text-slate-900 mb-2">{product.name}</h2>
              {product.vendor && (
                <p className="text-sm text-slate-600 mb-1">by {product.vendor}</p>
              )}
              <p className="text-slate-700 mb-4">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-extrabold text-emerald-700">${product.price}</span>
                <Link
                  href={`/products/${product.id}`}
                  className="bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
