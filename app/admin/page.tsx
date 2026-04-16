'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '../auth-context';
import { uploadProductImage } from '../../lib/product-images';
import { useProducts } from '../products-context';

export default function AdminPage() {
  const { products, addProduct, removeProduct, error, isFirebaseEnabled, isLoading } = useProducts();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
    vendor: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.name || !formData.price || !formData.description) {
      setSubmitError('Please fill in all required fields.');
      return;
    }

    if (!imageFile && !formData.image) {
      setSubmitError('Add an image file or a hosted image URL.');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = formData.image;

      if (imageFile) {
        if (!user) {
          throw new Error('auth-required');
        }

        imageUrl = await uploadProductImage(imageFile, user.uid);
      }

      await addProduct({
        name: formData.name,
        price: parseFloat(formData.price),
        image: imageUrl,
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
      setImageFile(null);
    } catch {
      setSubmitError('We could not add that product yet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveProduct = async (id: string) => {
    try {
      await removeProduct(id);
    } catch {
      setSubmitError('We could not remove that product yet.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <section className="bg-white border border-slate-200 rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Panel</h1>
        <p className="text-slate-600 mb-4">Add products quickly and manage your current catalog.</p>
        <div className="space-y-3 mb-6 text-sm">
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700">
            {isFirebaseEnabled
              ? 'Firebase sync is active. New products, carts, and uploads can persist across devices.'
              : 'Firebase is not configured yet, so this page still uses local browser storage.'}
          </p>
          {(submitError || error) && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
              {submitError || error}
            </p>
          )}
        </div>

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
            <label className="block text-sm font-medium text-slate-700 mb-2">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Image URL</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
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
              disabled={isSubmitting || isLoading || isAuthLoading}
              className="w-full bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 font-semibold"
            >
              {isSubmitting ? 'Saving Product...' : 'Add Product'}
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
                  onClick={() => handleRemoveProduct(product.id)}
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
