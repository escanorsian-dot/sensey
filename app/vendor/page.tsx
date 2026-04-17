'use client';

import { useState } from 'react';
import { useAuth } from '../auth-context';
import { uploadProductImage } from '../../lib/product-images';
import { useProducts } from '../products-context';


export default function VendorPage() {
  const { addProduct, error, isLoading } = useProducts();
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
      let imageUrls: string[] = [];
      
      console.log('Uploading images to Cloudinary...');
      const ownerId = user?.uid || 'anonymous-local';
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

      setFormData({
        name: '',
        price: '',
        description: '',
        vendor: '',
      });
      setImageFiles([null, null, null, null]);
      alert('Product published successfully!');
    } catch (err: any) {
      console.error('Error:', err);
      setSubmitError(err.message || 'Error saving product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-black mb-8 text-center text-slate-900 tracking-tighter">List Your Item</h1>
      
      <div className="space-y-3 mb-8 text-sm text-center">
        {(error || authError || submitError) && (
          <p className="rounded-2xl border-2 border-rose-200 bg-rose-50 px-6 py-4 text-rose-800 font-bold shadow-md">
            ❌ {submitError || authError || error}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-10 rounded-[2.5rem] border-2 border-slate-100 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-xs font-black text-slate-500 mb-3 uppercase tracking-[0.2em]">Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-slate-900 outline-none transition-all text-black !text-slate-950 font-bold text-lg placeholder:text-slate-300"
              placeholder="e.g. Premium Leather Bag"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 mb-3 uppercase tracking-[0.2em]">Price ($) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-slate-900 outline-none transition-all text-black !text-slate-950 font-bold text-lg placeholder:text-slate-300"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-500 mb-4 uppercase tracking-[0.2em]">Product Gallery (1 Required)</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                  className={`flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-[2rem] cursor-pointer transition-all
                    ${imageFiles[i] ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-900 hover:bg-slate-50'}`}
                >
                  {imageFiles[i] ? (
                    <div className="text-center p-2">
                      <span className="text-2xl mb-1 block">✅</span>
                      <p className="text-[10px] font-black text-emerald-700 truncate max-w-[80px] uppercase">Ready</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-2xl mb-1 block">📸</span>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{i === 0 ? 'Main' : `+${i}`}</p>
                    </div>
                  )}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-500 mb-3 uppercase tracking-[0.2em]">Detailed Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-slate-900 outline-none transition-all text-black !text-slate-950 font-bold text-lg placeholder:text-slate-300"
            placeholder="What makes this product special?"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-500 mb-3 uppercase tracking-[0.2em]">Brand / Shop Name</label>
          <input
            type="text"
            name="vendor"
            value={formData.vendor}
            onChange={handleChange}
            className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-slate-900 outline-none transition-all text-black !text-slate-950 font-bold text-lg placeholder:text-slate-300"
            placeholder="e.g. Sensey Official"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-slate-950 text-white py-6 rounded-[2rem] hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed font-black text-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all transform hover:-translate-y-2 active:scale-95"
        >
          {isSubmitting ? '📤 PUBLISHING...' : '🚀 PUBLISH PRODUCT'}
        </button>
      </form>
    </div>
  );
}
