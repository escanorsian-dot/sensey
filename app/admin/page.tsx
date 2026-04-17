'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '../auth-context';
import { uploadProductImage } from '../../lib/product-images';
import { useProducts } from '../products-context';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AdminPage() {
  const { products, addProduct, removeProduct, error, isLoading } = useProducts();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    vendor: '',
  });
  
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'payments'>('products');

  const [paymentQR, setPaymentQR] = useState<string | null>(null);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [isUploadingQR, setIsUploadingQR] = useState(false);
  const [qrMessage, setQrMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedQR = localStorage.getItem('sensey_payment_qr');
    if (storedQR) setPaymentQR(storedQR);
  }, []);

  const handleQRChange = (file: File | null) => {
    setQrFile(file);
  };

  const handleUploadQR = async () => {
    if (!qrFile) return;
    
    setIsUploadingQR(true);
    setQrMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', qrFile);
      formData.append('folder', 'sensey/payments');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      localStorage.setItem('sensey_payment_qr', data.url);
      setPaymentQR(data.url);
      setQrMessage('QR code uploaded successfully!');
      setQrFile(null);
    } catch (err: any) {
      setQrMessage(err.message || 'Failed to upload QR code');
    } finally {
      setIsUploadingQR(false);
    }
  };

  const totalInventory = products.length;
  const avgPrice = products.length > 0 
    ? products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length 
    : 0;

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

      setFormData({ name: '', price: '', description: '', vendor: '' });
      setImageFiles([null, null, null, null]);
    } catch (err: any) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
              <p className="text-slate-500 font-medium mt-1">Manage your inventory & payments</p>
            </div>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-md">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-slate-600">Live</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-3xl shadow-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-sm font-medium">Total Products</p>
                <p className="text-4xl font-black mt-2">{totalInventory}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 rounded-3xl shadow-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-200 text-sm font-medium">Avg. Price</p>
                <p className="text-4xl font-black mt-2">{formatCurrency(avgPrice)}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-3xl shadow-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Payment Status</p>
                <p className="text-2xl font-black mt-2">{paymentQR ? 'Active' : 'Setup Needed'}</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">{paymentQR ? '✅' : '⚠️'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-10">
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 px-6 py-4 text-sm font-bold transition-all ${
                activeTab === 'products'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              📦 Product Management
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex-1 px-6 py-4 text-sm font-bold transition-all ${
                activeTab === 'payments'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              💳 Payment Settings
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'products' ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">Add New Product</h2>
                </div>

                {(submitError || error) && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-6 py-4 font-semibold flex items-center gap-3">
                    <span className="text-xl">❌</span>
                    {submitError || error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Product Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold placeholder:text-slate-300"
                        placeholder="Enter product name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Price (₹) *</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold placeholder:text-slate-300"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold placeholder:text-slate-300"
                      placeholder="Describe the product..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Brand / Vendor</label>
                      <input
                        type="text"
                        name="vendor"
                        value={formData.vendor}
                        onChange={handleChange}
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold placeholder:text-slate-300"
                        placeholder="Brand name"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 rounded-2xl hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 font-bold text-lg shadow-lg transition-all transform hover:-translate-y-1 active:scale-95"
                      >
                        {isSubmitting ? '⏳ Adding...' : '➕ Add Product'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Product Images (Max 4)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(i, e.target.files?.[0] ?? null)}
                            className="hidden"
                            id={`admin-file-${i}`}
                          />
                          <label
                            htmlFor={`admin-file-${i}`}
                            className={`flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                              imageFiles[i] ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-indigo-500 hover:bg-indigo-50'
                            }`}
                          >
                            {imageFiles[i] ? (
                              <div className="text-center p-2">
                                <span className="text-2xl block">✅</span>
                                <p className="text-[10px] font-bold text-emerald-700 truncate max-w-[80px] mt-1">Ready</p>
                              </div>
                            ) : (
                              <div className="text-center">
                                <span className="text-2xl block">📸</span>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">{i === 0 ? 'Primary' : `Image ${i + 1}`}</p>
                              </div>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Payment QR Code</h2>
                    <p className="text-slate-500 mt-1">Upload your UPI QR code for customer payments</p>
                  </div>
                </div>

                {qrMessage && (
                  <div className={`px-6 py-4 rounded-2xl font-semibold flex items-center gap-3 ${
                    qrMessage.includes('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    <span className="text-xl">{qrMessage.includes('success') ? '✅' : '❌'}</span>
                    {qrMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-50 rounded-3xl p-8 border-2 border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Current QR Code</h3>
                    {paymentQR ? (
                      <div className="space-y-4">
                        <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                          <Image
                            src={paymentQR}
                            alt="Payment QR Code"
                            fill
                            className="object-contain p-4"
                          />
                        </div>
                        <button
                          onClick={() => {
                            localStorage.removeItem('sensey_payment_qr');
                            setPaymentQR(null);
                          }}
                          className="w-full py-3 bg-rose-100 text-rose-700 rounded-xl font-bold hover:bg-rose-200 transition-all"
                        >
                          🗑️ Remove QR Code
                        </button>
                      </div>
                    ) : (
                      <div className="aspect-square bg-white rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                        <div className="text-center text-slate-400">
                          <span className="text-5xl block mb-3">📱</span>
                          <p className="font-semibold">No QR code uploaded</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Upload New QR Code</h3>
                      <div className="space-y-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleQRChange(e.target.files?.[0] ?? null)}
                          className="hidden"
                          id="qr-upload"
                        />
                        <label
                          htmlFor="qr-upload"
                          className={`flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                            qrFile ? 'border-emerald-500 bg-emerald-50' : 'border-indigo-300 hover:border-indigo-500 hover:bg-white'
                          }`}
                        >
                          <span className="text-2xl">{qrFile ? '✅' : '📤'}</span>
                          <span className="font-semibold text-slate-700">
                            {qrFile ? qrFile.name : 'Click to select QR image'}
                          </span>
                        </label>
                        <button
                          onClick={handleUploadQR}
                          disabled={!qrFile || isUploadingQR}
                          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-1 active:scale-95"
                        >
                          {isUploadingQR ? '⏳ Uploading...' : '🚀 Upload QR Code'}
                        </button>
                      </div>
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">💡</span>
                        <div>
                          <p className="font-bold text-amber-800">Tip</p>
                          <p className="text-sm text-amber-700 mt-1">
                            Upload your UPI QR code (Google Pay, PhonePe, Paytm, etc.) or any payment QR code. 
                            Customers will see this during checkout.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Product Catalog</h2>
            <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">
              {products.length} items
            </span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-6xl block mb-4">📦</span>
              <p className="text-slate-500 font-medium">No products yet. Add your first product above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group"
                >
                  <div className="relative h-48 bg-slate-100">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-emerald-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                      {formatCurrency(product.price)}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 truncate">{product.name}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-400">{product.vendor || 'Sensey'}</span>
                      <button
                        onClick={() => handleRemoveProduct(product.id)}
                        className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
