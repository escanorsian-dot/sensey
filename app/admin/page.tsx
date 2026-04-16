'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useProducts } from '../products-context';

export default function AdminPage() {
  const { products, addProduct, removeProduct } = useProducts();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
    vendor: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.image || !formData.description) {
      alert('Please fill in all required fields.');
      return;
    }

    addProduct({
      name: formData.name,
      price: parseFloat(formData.price),
      image: formData.image,
      description: formData.description,
      vendor: formData.vendor || 'Sensey Admin',
    });

    setFormData({
      name: '',
      price: '',
      image: '',
      description: '',
      vendor: '',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <section className="bg-white border border-slate-200 rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Panel</h1>
        <p className="text-slate-600 mb-6">Add products quickly and manage your current catalog.</p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Price *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="0.00"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Image URL *</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              required
              className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="https://example.com/product-image.jpg"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Write product details here"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Vendor Name</label>
            <input
              type="text"
              name="vendor"
              value={formData.vendor}
              onChange={handleChange}
              className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Your store name"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 font-semibold"
            >
              Add Product
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Current Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden"
            >
              <Image
                src={product.image}
                alt={product.name}
                width={320}
                height={220}
                className="w-full h-44 object-cover"
              />
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
                <p className="text-sm text-slate-600">{product.description}</p>
                <p className="text-emerald-700 text-xl font-extrabold">${product.price}</p>
                <p className="text-sm text-slate-600">Vendor: {product.vendor || 'Unknown'}</p>
                <button
                  type="button"
                  onClick={() => removeProduct(product.id)}
                  className="w-full mt-3 bg-rose-600 text-white py-2 rounded-lg hover:bg-rose-700"
                >
                  Remove Product
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
