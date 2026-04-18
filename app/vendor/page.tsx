'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../auth-context';
import { uploadProductImage } from '../../lib/product-images';
import { useProducts } from '../products-context';

export default function VendorPage() {
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const stored = localStorage.getItem('sensey_user');
    if (!stored) {
      window.location.href = '/login';
      return;
    }
    try {
      const userData = JSON.parse(stored);
      if (!userData.isLoggedIn || (userData.role !== 'vendor' && userData.role !== 'admin')) {
        window.location.href = '/login';
        return;
      }
    } catch (e) {
      window.location.href = '/login';
      return;
    }
    setIsChecking(false);
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Checking authorization...</p>
        </div>
      </div>
    );
  }

  const { addProduct, error: productError, isLoading } = { addProduct: async (_: any) => {}, error: null, isLoading: false };
  
  const router = { push: () => {} };
  
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
      let imageUrls: string[] = [];
      
      const ownerId = 'vendor';
      const uploadPromises = selectedFiles.map(file => uploadProductImage(file, ownerId));
      imageUrls = await Promise.all(uploadPromises);

      await addProduct({
        name: formData.name,
        price: parseFloat(formData.price),
        image: imageUrls[0],
        images: imageUrls,
        description: formData.description,
        vendor: formData.vendor || 'Anonymous Vendor',
      });

      setFormData({ name: '', price: '', description: '', vendor: '' });
      setImageFiles([null, null, null, null]);
    } catch (err: any) {
      setSubmitError(err.message || 'Error saving product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button 
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold transition-all hover:-translate-x-1"
        >
          <span className="text-xl">←</span> Back to Store
        </button>

        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
            <span>🚀</span> Start Selling
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">List Your Item</h1>
          <p className="text-gray-500 mt-2">Upload your product and start selling today</p>
        </div>
        
        <div className="space-y-3 mb-6">
          {(productError || submitError) && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-6 py-4 font-semibold flex items-center gap-3 animate-slide-up">
              <span className="text-xl">❌</span>
              {submitError || productError}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 md:p-10 rounded-3xl border border-slate-100 shadow-xl animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 md:p-4 bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold placeholder:text-gray-300 text-gray-900"
                placeholder="e.g. Premium Leather Bag"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full p-3 md:p-4 bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold placeholder:text-gray-300 text-gray-900"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Product Gallery (1 Required)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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
                    className={`flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-xl md:rounded-2xl cursor-pointer transition-all hover-lift ${
                      imageFiles[i] ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-indigo-500 hover:bg-indigo-50'
                    }`}
                  >
                    {imageFiles[i] ? (
                      <div className="text-center p-2">
                        <span className="text-xl md:text-2xl block">✅</span>
                        <p className="text-[10px] font-bold text-emerald-700 truncate max-w-[80px] uppercase mt-1">Ready</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="text-xl md:text-2xl block">📸</span>
                        <p className="text-[10px] font-bold text-gray-400 mt-1">{i === 0 ? 'Main' : `+${i}`}</p>
                      </div>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Detailed Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full p-3 md:p-4 bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold placeholder:text-gray-300 text-gray-900"
              placeholder="What makes this product special?"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Brand / Shop Name</label>
            <input
              type="text"
              name="vendor"
              value={formData.vendor}
              onChange={handleChange}
              className="w-full p-3 md:p-4 bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold placeholder:text-gray-300 text-gray-900"
              placeholder="e.g. Sensey Official"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 md:py-5 rounded-xl md:rounded-2xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1 active:scale-95"
          >
            {isSubmitting ? '📤 PUBLISHING...' : '🚀 PUBLISH PRODUCT'}
          </button>
        </form>

        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">Tips for better sales</p>
              <p className="text-sm text-gray-500">Use high-quality images with 1:1 square ratio (e.g., 500x500) for best display results!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
