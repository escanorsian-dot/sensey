'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '../auth-context';
import { uploadProductImage } from '../../lib/product-images';
import { useProducts } from '../products-context';

export default function AdminPage() {
  const { products, addProduct, removeProduct, error, isLoading } = useProducts();
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
      let imageUrls: string[] = [];
      
      console.log('Uploading images to Cloudinary...');
      const ownerId = user?.uid || 'admin-local';
      const uploadPromises = selectedFiles.map(file => uploadProductImage(file, ownerId));
      imageUrls = await Promise.all(uploadPromises);

      await addProduct({
        name: formData.name,
        price: parseFloat(formData.price),
        image: imageUrls[0],
        images: imageUrls,
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
      alert('Product added successfully!');
    } catch (err: any) {
      console.error('Error:', err);
      setSubmitError(err.message || 'Failed to save product.');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Admin Dashboard</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Inventory Management & Control</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Side */}
          <div className="lg:col-span-7">
            <div className="space-y-4 mb-8">
              {(submitError || error) && (
                <div className="bg-rose-50 border-2 border-rose-200 text-rose-800 rounded-2xl px-6 py-4 font-black text-sm flex items-center">
                  <span className="mr-3 text-xl">❌</span>
                  {submitError || error}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-slate-900 outline-none transition-all !text-slate-950 font-bold text-lg placeholder:text-slate-300"
                    placeholder="e.g. Vintage Camera"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Price (USD) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-slate-900 outline-none transition-all !text-slate-950 font-bold text-lg placeholder:text-slate-300"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-slate-900 outline-none transition-all !text-slate-950 font-bold text-lg placeholder:text-slate-300"
                  placeholder="Describe the unique features..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Brand/Vendor</label>
                  <input
                    type="text"
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleChange}
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-slate-900 outline-none transition-all !text-slate-950 font-bold text-lg placeholder:text-slate-300"
                    placeholder="Sensey Official"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-slate-950 text-white py-5 rounded-2xl hover:bg-black disabled:opacity-50 font-black text-xl shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95"
                  >
                    {isSubmitting ? 'SAVING...' : '📦 ADD PRODUCT'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Image Side */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <label className="block text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em] text-center lg:text-left">Product Gallery (Max 4)</label>
            <div className="grid grid-cols-2 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="relative aspect-square">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(i, e.target.files?.[0] ?? null)}
                    className="hidden"
                    id={`admin-file-${i}`}
                  />
                  <label
                    htmlFor={`admin-file-${i}`}
                    className={`flex flex-col items-center justify-center h-full w-full border-2 border-dashed rounded-[2rem] cursor-pointer transition-all
                      ${imageFiles[i] ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-900 hover:bg-slate-50'}`}
                  >
                    {imageFiles[i] ? (
                      <div className="text-center p-4">
                        <span className="text-3xl mb-2 block">🖼️</span>
                        <p className="text-[10px] font-black text-emerald-700 truncate max-w-[120px] uppercase tracking-tighter">{imageFiles[i]?.name}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="text-2xl mb-1 block">📸</span>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{i === 0 ? 'Primary' : `Alt ${i}`}</p>
                      </div>
                    )}
                  </label>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[10px] text-slate-400 font-bold text-center italic tracking-wider">
              High resolution JPG/PNG recommended.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-end mb-10 border-b-4 border-slate-900 pb-6">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Live Catalog</h2>
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-black text-slate-900 uppercase tracking-widest">
              {products.length} Items Total
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white border-2 border-slate-50 rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all group relative"
            >
              <div className="relative h-64 w-full bg-slate-100 overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-slate-900 px-4 py-2 rounded-2xl font-black shadow-lg">
                  ${product.price}
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 truncate tracking-tight">{product.name}</h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-2">{product.description}</p>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    {product.vendor || 'Sensey'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(product.id)}
                    className="text-xs font-black text-rose-500 hover:text-rose-700 uppercase tracking-widest"
                  >
                    Delete Item
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
