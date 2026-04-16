'use client';

import { useState } from 'react';
import { useAuth } from '../auth-context';
import { uploadProductImage } from '../../lib/product-images';
import { useProducts } from '../products-context';
import { isSupabaseConfigured } from '../../lib/supabase';

export default function VendorPage() {
  const { addProduct, error, isFirebaseEnabled, isLoading } = useProducts();
  const { user, error: authError, isLoading: isAuthLoading } = useAuth();
  
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
      setSubmitError('Please fill in the required text fields.');
      return;
    }

    if (!imageFile && !formData.image) {
      setSubmitError('Add an image file or an image URL.');
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
        vendor: formData.vendor || 'Anonymous Vendor',
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
      setSubmitError('We could not save your product yet. Check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Add Your Product</h1>
      <div className="space-y-3 mb-6 text-sm">
        <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-700">
          {isFirebaseEnabled && isSupabaseConfigured
            ? 'Cloud sync enabled. Products stored in Firebase and images in Supabase.'
            : isFirebaseEnabled
            ? 'Firebase sync enabled. Images will use URLs unless Supabase is configured.'
            : 'Running in local mode. Setup Firebase and Supabase to go live.'}
        </p>
        {(error || authError || submitError) && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
            {submitError || authError || error}
          </p>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Product Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg"
            placeholder="Enter product name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Price *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full p-3 border rounded-lg"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="w-full p-3 border rounded-lg"
          />
          <p className="mt-2 text-sm text-slate-500">
            {isSupabaseConfigured 
              ? 'Images will be uploaded to Supabase Storage.' 
              : 'Supabase not configured. Please use an Image URL below instead.'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Image URL</label>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full p-3 border rounded-lg"
            placeholder="Describe your product"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Vendor Name (optional)</label>
          <input
            type="text"
            name="vendor"
            value={formData.vendor}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            placeholder="Your business name"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isLoading || isAuthLoading}
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60 text-lg font-semibold"
        >
          {isSubmitting ? 'Saving Product...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}
