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
      setSubmitError('Please fill in the required text fields.');
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
        throw new Error('auth-required');
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
        vendor: formData.vendor || 'Anonymous Vendor',
      });

      setFormData({
        name: '',
        price: '',
        description: '',
        vendor: '',
      });
      setImageFiles([null, null, null, null]);
    } catch (err: any) {
      console.error('Error:', err);
      setSubmitError(err.message || 'We could not save your product yet. Check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-slate-900">Add Your Product</h1>
      
      <div className="space-y-3 mb-8 text-sm text-center">
        <div className={`rounded-xl border px-4 py-3 font-medium transition-colors
          ${isFirebaseEnabled && isSupabaseConfigured 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
          {isFirebaseEnabled && isSupabaseConfigured
            ? '✅ Cloud sync active. Products will be live instantly!'
            : '⚠️ Setup in progress. Check Firebase/Supabase configuration.'}
        </div>
        {(error || authError || submitError) && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800 font-semibold shadow-sm">
            ❌ {submitError || authError || error}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl border border-slate-100 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g. Vintage Camera"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Price ($) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Product Images (Upload up to 4) *</label>
          <div className="grid grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(i, e.target.files?.[0] ?? null)}
                  className="hidden"
                  id={`vendor-file-${i}`}
                />
                <label
                  htmlFor={`vendor-file-${i}`}
                  className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all
                    ${imageFiles[i] ? 'border-green-500 bg-green-50 shadow-inner' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}`}
                >
                  {imageFiles[i] ? (
                    <div className="text-center p-3">
                      <p className="text-xs font-bold text-green-700 truncate max-w-[120px]">{imageFiles[i]?.name}</p>
                      <span className="text-[10px] text-green-500 font-bold uppercase mt-1 block">Uploaded</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-3xl mb-1 block">🖼️</span>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Photo {i + 1}</p>
                    </div>
                  )}
                </label>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400 text-center font-medium">PNG, JPG, or WEBP supported. Max 5MB each.</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={5}
            className="w-full p-4 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
            placeholder="Tell us why customers will love this product..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Vendor / Shop Name</label>
          <input
            type="text"
            name="vendor"
            value={formData.vendor}
            onChange={handleChange}
            className="w-full p-4 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
            placeholder="Your Business Name"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isLoading || isAuthLoading}
          className="w-full bg-slate-900 text-white py-5 rounded-2xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed font-black text-xl shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95"
        >
          {isSubmitting ? '📤 Saving to Cloud...' : '✨ Publish Product'}
        </button>
      </form>
    </div>
  );
}
