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
    description: '',
    vendor: '',
  });
  
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (index: number, file: File | null) => {
    const newFiles = [...imageFiles];
    newFiles[index] = file;
    setImageFiles(newFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.name || !formData.price || !formData.description) {
      setSubmitError('Please fill in all required text fields.');
      return;
    }

    const selectedFiles = imageFiles.filter((f): f is File => f !== null);
    if (selectedFiles.length === 0) {
      setSubmitError('Please upload at least one image.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!user) {
        throw new Error('You must be logged in to add products.');
      }

      console.log('Uploading images to Supabase...');
      const uploadPromises = selectedFiles.map(file => uploadProductImage(file, user.uid));
      const imageUrls = await Promise.all(uploadPromises);
      console.log('Images uploaded successfully:', imageUrls);

      await addProduct({
        name: formData.name,
        price: parseFloat(formData.price),
        image: imageUrls[0], // Primary image
        images: imageUrls,    // All images
        description: formData.description,
        vendor: formData.vendor || 'Sensey Admin',
      });

      setFormData({
        name: '',
        price: '',
        description: '',
        vendor: '',
      });
      setImageFiles([null, null, null, null]);
      console.log('Product added successfully!');
    } catch (err: any) {
      console.error('Error:', err);
      setSubmitError(err.message || 'Failed to save product. Check Supabase Storage permissions.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveProduct = async (id: string) => {
    try {
      await removeProduct(id);
    } catch {
      setSubmitError('Failed to remove product.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <section className="bg-white border border-slate-200 rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Panel</h1>
        <p className="text-slate-600 mb-6">Create new products with up to 4 images.</p>
        
        <div className="space-y-3 mb-6 text-sm">
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700">
            {isFirebaseEnabled
              ? 'Cloud sync is active. Products are saved to Firebase and images to Supabase.'
              : 'Running in local mode. Please configure Firebase to save products permanently.'}
          </p>
          {(submitError || error) && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 font-medium">
              ⚠️ {submitError || error}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Premium Leather Bag"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Price ($) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Product Images (Upload 1-4 photos) *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(i, e.target.files?.[0] ?? null)}
                    className="hidden"
                    id={`file-${i}`}
                  />
                  <label
                    htmlFor={`file-${i}`}
                    className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all
                      ${imageFiles[i] ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50'}`}
                  >
                    {imageFiles[i] ? (
                      <div className="text-center p-2">
                        <p className="text-xs font-medium text-green-700 truncate max-w-[150px]">{imageFiles[i]?.name}</p>
                        <span className="text-[10px] text-green-600">Click to change</span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="text-2xl mb-1 block">📸</span>
                        <p className="text-xs text-slate-500">Image {i + 1}</p>
                      </div>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Tell customers about your product..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Vendor Name</label>
              <input
                type="text"
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Your store name"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading || isAuthLoading}
              className="w-full bg-blue-600 text-white py-3.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg transition-all"
            >
              {isSubmitting ? '🚀 Saving Product...' : '📦 Add Product'}
            </button>
          </div>
        </form>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Live Catalog</h2>
          <span className="bg-slate-100 px-3 py-1 rounded-full text-sm font-medium text-slate-600">
            {products.length} Products
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="relative h-48 w-full bg-slate-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.images && product.images.length > 1 && (
                  <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-sm">
                    +{product.images.length - 1} photos
                  </span>
                )}
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-slate-900 truncate">{product.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{product.description}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-blue-600 font-black text-xl">${product.price}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    {product.vendor || 'Unknown'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveProduct(product.id)}
                  className="w-full text-sm font-semibold text-rose-500 hover:text-white hover:bg-rose-500 border border-rose-100 hover:border-rose-500 py-2 rounded-lg transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
