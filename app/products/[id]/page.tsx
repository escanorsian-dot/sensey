'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useProducts } from '../../products-context';
import { useCart } from '../../cart-context';

export default function ProductDetail() {
  const params = useParams();
  const { products } = useProducts();
  const { dispatch } = useCart();
  const product = products.find(p => p.id === params.id);

  if (!product) {
    return <div className="text-center py-8">Product not found</div>;
  }

  const addToCart = () => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Image
            src={product.image}
            alt={product.name}
            width={500}
            height={400}
            className="w-full h-96 object-cover rounded-lg"
          />
        </div>
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg shadow-slate-300/40 p-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">{product.name}</h1>
          {product.vendor && (
            <p className="text-slate-700 mb-2">Sold by: {product.vendor}</p>
          )}
          <p className="text-slate-700 mb-6">{product.description}</p>
          <p className="text-4xl font-extrabold text-emerald-700 mb-6">${product.price}</p>
          <button
            onClick={addToCart}
            className="bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 text-lg font-semibold"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
