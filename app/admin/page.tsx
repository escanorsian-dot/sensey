'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../auth-context';
import { uploadProductImage } from '../../lib/product-images';
import { useProducts } from '../products-context';

function formatCurrency(amount: number) {
  try {
    return `₹${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } catch {
    return `₹${amount || 0}`;
  }
}

function ReplyForm({ messageId, onReply }: { messageId: string; onReply: (id: string, reply: string) => Promise<void> }) {
  const [reply, setReply] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    
    setIsSending(true);
    try {
      await onReply(messageId, reply);
      setReply('');
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="text"
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Type your response..."
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-gray-900"
      />
      <button
        type="submit"
        disabled={!reply.trim() || isSending}
        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
      >
        {isSending ? 'Sending...' : 'Send Reply'}
      </button>
    </form>
  );
}

export default function AdminPage() {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const productState = useProducts();
  const authState = useAuth();
  
  const products = productState?.products || [];
  const { addProduct, removeProduct, error: productError } = productState;
  const { user: authUser, supportMessages = [], adminReply, markAsRead, unreadCount = 0, deleteMessage } = authState;

  useEffect(() => {
    const stored = localStorage.getItem('sensey_user');
    if (!stored) {
      router.push('/login');
      return;
    }
    try {
      const userData = JSON.parse(stored);
      if (!userData || !userData.isLoggedIn || userData.role !== 'admin') {
        router.push('/login');
        return;
      }
    } catch (e) {
      router.push('/login');
      return;
    }
    setIsChecking(false);
  }, [router]);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    vendor: '',
  });
  
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'payments' | 'receipts' | 'utrs' | 'support' | 'users'>('products');
  const [mobileTabOpen, setMobileTabOpen] = useState(false);

  const [paymentQR, setPaymentQR] = useState<string | null>(null);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [isUploadingQR, setIsUploadingQR] = useState(false);
  const [qrMessage, setQrMessage] = useState<string | null>(null);

  const [receipts, setReceipts] = useState<Array<{ id: string; imageUrl: string; timestamp: number; utr?: string }>>([]);

  const [validUTRs, setValidUTRs] = useState<Array<{ id: string; utr: string; createdAt: number }>>([]);
  const [newUTR, setNewUTR] = useState('');
  const [utrMessage, setUtrMessage] = useState<string | null>(null);
  const [isLoadingUTRs, setIsLoadingUTRs] = useState(false);

  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newVendorUsername, setNewVendorUsername] = useState('');
  const [newVendorPassword, setNewVendorPassword] = useState('');
  const [adminList, setAdminList] = useState<Array<{ username: string }>>([]);
  const [vendorList, setVendorList] = useState<Array<{ username: string }>>([]);

  useEffect(() => {
    if (!isChecking) {
      fetchPaymentQR();
      loadReceipts();
      loadUTRs();
      loadAdmins();
      loadVendors();
    }
  }, [isChecking]);

  const loadAdmins = async () => {
    try {
      const res = await fetch('/api/admins');
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.admins) setAdminList(data.admins);
    } catch (err) { console.error('Failed to load admins:', err); }
  };

  const loadVendors = async () => {
    try {
      const res = await fetch('/api/vendors');
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.vendors) setVendorList(data.vendors);
    } catch (err) { console.error('Failed to load vendors:', err); }
  };

  const handleAddAdmin = async () => {
    if (!newAdminUsername || !newAdminPassword) return;
    try {
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newAdminUsername, password: newAdminPassword })
      });
      if (res.ok) {
        setNewAdminUsername('');
        setNewAdminPassword('');
        loadAdmins();
      }
    } catch (err) { console.error('Failed to add admin:', err); }
  };

  const handleRemoveAdmin = async (username: string) => {
    if (username === 'qwertyu') return;
    try {
      const res = await fetch(`/api/admins?username=${username}`, { method: 'DELETE' });
      if (res.ok) loadAdmins();
    } catch (err) { console.error('Failed to remove admin:', err); }
  };

  const handleAddVendor = async () => {
    if (!newVendorUsername || !newVendorPassword) return;
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newVendorUsername, password: newVendorPassword })
      });
      if (res.ok) {
        setNewVendorUsername('');
        setNewVendorPassword('');
        loadVendors();
      }
    } catch (err) { console.error('Failed to add vendor:', err); }
  };

  const handleRemoveVendor = async (username: string) => {
    try {
      const res = await fetch(`/api/vendors?username=${username}`, { method: 'DELETE' });
      if (res.ok) loadVendors();
    } catch (err) { console.error('Failed to remove vendor:', err); }
  };

  const fetchPaymentQR = async () => {
    try {
      const res = await fetch('/api/settings/payment');
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.qrCode) setPaymentQR(data.qrCode);
    } catch (err) {
      console.error('Failed to fetch payment QR:', err);
    }
  };

  const loadReceipts = () => {
    try {
      const storedReceipts = localStorage.getItem('sensey_receipts');
      if (storedReceipts) {
        const parsed = JSON.parse(storedReceipts);
        if (Array.isArray(parsed)) setReceipts(parsed);
      }
    } catch (err) {
      console.error('Failed to parse receipts:', err);
      setReceipts([]);
    }
  };

const loadUTRs = async () => {
    try {
      const res = await fetch('/api/settings/utrs');
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.utrs) {
        const now = Date.now();
        const valid = data.utrs.filter((utr: any) => {
          const age = now - (utr.createdAt || 0);
          return age <= 24 * 60 * 60 * 1000;
        });
        setValidUTRs(valid);
      }
    } catch (err) {
      console.error('Failed to load UTRs:', err);
    }
  };

  const handleAddUTR = async () => {
    if (!newUTR.trim()) return;
    
    try {
      setIsLoadingUTRs(true);
      const res = await fetch('/api/settings/utrs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utr: newUTR.trim() }),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data && data.utr) {
          setValidUTRs(prev => [...prev, data.utr]);
          setNewUTR('');
          setUtrMessage('UTR added successfully! Valid for 24 hours.');
          setTimeout(() => setUtrMessage(null), 3000);
        }
      }
    } catch (err) {
      setUtrMessage('Failed to add UTR');
    } finally {
      setIsLoadingUTRs(false);
    }
  };

  const handleRemoveUTR = async (id: string) => {
    try {
      const res = await fetch(`/api/settings/utrs?id=${id}`, { method: 'DELETE' });
      if (res.ok) setValidUTRs(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error('Failed to remove UTR:', err);
    }
  };

  const handleQRChange = (file: File | null) => {
    setQrFile(file);
  };

  const handleUploadQR = async () => {
    if (!qrFile) return;
    
    setIsUploadingQR(true);
    setQrMessage(null);

    try {
      const formDataQR = new FormData();
      formDataQR.append('file', qrFile);
      formDataQR.append('folder', 'sensey/payments');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataQR,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      
      await fetch('/api/settings/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: data.url }),
      });
      
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
      const ownerId = authUser?.username || 'admin';
      const uploadPromises = selectedFiles.map(file => uploadProductImage(file, ownerId));
      const imageUrls = await Promise.all(uploadPromises);

      await addProduct({
        name: formData.name,
        price: parseFloat(formData.price),
        image: imageUrls[0] || '',
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
      const product = products.find(p => p.id === id);
      await removeProduct(id, product?.image);
    } catch {
      setSubmitError('Failed to remove product.');
    }
  };

  const tabLabels = {
    products: { icon: '📦', label: 'Products' },
    payments: { icon: '💳', label: 'Payments' },
    receipts: { icon: '📋', label: `Receipts${receipts.length > 0 ? ` (${receipts.length})` : ''}` },
    utrs: { icon: '🔑', label: `UTRs${validUTRs.length > 0 ? ` (${validUTRs.length})` : ''}` },
    support: { icon: '💬', label: `Support${unreadCount > 0 ? ` (${unreadCount} new)` : ''}` },
    users: { icon: '👥', label: 'Users' },
  };

  useEffect(() => {
    if (activeTab === 'support' && typeof markAsRead === 'function') {
      markAsRead();
    }
  }, [activeTab, markAsRead]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Checking authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold transition-all hover:-translate-x-1"
        >
          <span className="text-xl">←</span> Back to Store
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-500 font-medium mt-1">Manage your inventory & payments</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-md">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-600">Live</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-xl text-white hover-lift animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-xs md:text-sm font-medium">Total Products</p>
                <p className="text-3xl md:text-4xl font-black mt-2">{totalInventory}</p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center animate-float">
                <span className="text-2xl md:text-3xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-xl text-white hover-lift animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-200 text-xs md:text-sm font-medium">Avg. Price</p>
                <p className="text-2xl md:text-3xl font-black mt-2 truncate">{formatCurrency(avgPrice)}</p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center animate-float" style={{ animationDelay: '200ms' }}>
                <span className="text-2xl md:text-3xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-xl text-white hover-lift animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-xs md:text-sm font-medium">Payment Status</p>
                <p className="text-lg md:text-xl font-black mt-2">{paymentQR ? 'Active' : 'Setup Needed'}</p>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center">
                <span className="text-2xl md:text-3xl">{paymentQR ? '✅' : '⚠️'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-8">
          <div className="hidden md:flex border-b border-slate-100">
            {(['products', 'payments', 'receipts', 'utrs', 'support', 'users'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 text-sm font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {tabLabels[tab].icon} {tabLabels[tab].label}
              </button>
            ))}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMobileTabOpen(!mobileTabOpen)}
              className="w-full px-6 py-4 flex items-center justify-between font-bold text-gray-900 bg-slate-50"
            >
              <span>{tabLabels[activeTab].icon} {tabLabels[activeTab].label}</span>
              <span className={`text-xl transition-transform ${mobileTabOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {mobileTabOpen && (
              <div className="border-t border-slate-100 bg-white">
                {(['products', 'payments', 'receipts', 'utrs', 'support', 'users'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setMobileTabOpen(false);
                    }}
                    className={`w-full px-6 py-4 text-left font-bold transition-all ${
                      activeTab === tab
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-600 hover:bg-slate-50'
                    }`}
                  >
                    {tabLabels[tab].icon} {tabLabels[tab].label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 text-gray-900">
            {activeTab === 'products' && (
              <div className="space-y-8 animate-fade-in">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Add New Product</h2>

                {(submitError || productError) && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl md:rounded-2xl px-6 py-4 font-semibold flex items-center gap-3 animate-slide-up">
                    <span className="text-xl">❌</span>
                    {submitError || productError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
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
                        placeholder="Enter product name"
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
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full p-3 md:p-4 bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold placeholder:text-gray-300 text-gray-900"
                      placeholder="Describe the product..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Brand / Vendor</label>
                      <input
                        type="text"
                        name="vendor"
                        value={formData.vendor}
                        onChange={handleChange}
                        className="w-full p-3 md:p-4 bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-semibold placeholder:text-gray-300 text-gray-900"
                        placeholder="Brand name"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-3 md:p-4 rounded-xl md:rounded-2xl hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 font-bold text-base md:text-lg shadow-lg transition-all transform hover:-translate-y-1 active:scale-95"
                      >
                        {isSubmitting ? '⏳ Adding...' : '➕ Add Product'}
                      </button>
                    </div>
                  </div>

<div>
                      <label className="block text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Product Images (Max 4)</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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
                              className={`flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-xl md:rounded-2xl cursor-pointer transition-all hover-lift ${
                                imageFiles[i] ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-indigo-500 hover:bg-indigo-50'
                              }`}
                            >
                              {imageFiles[i] ? (
                                <div className="text-center p-2">
                                  <span className="text-xl md:text-2xl block">✅</span>
                                  <p className="text-[10px] font-bold text-emerald-700 truncate max-w-[80px] mt-1">Ready</p>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <span className="text-xl md:text-2xl block">📸</span>
                                  <p className="text-[10px] font-bold text-gray-400 mt-1">{i === 0 ? 'Primary' : `Image ${i + 1}`}</p>
                                </div>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                </form>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-6 md:space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Payment QR Code</h2>
                  <p className="text-gray-500 mt-1">Upload your UPI QR code for customer payments</p>
                </div>

                {qrMessage && (
                  <div className={`px-6 py-4 rounded-xl md:rounded-2xl font-semibold flex items-center gap-3 ${
                    qrMessage.includes('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    <span className="text-xl">{qrMessage.includes('success') ? '✅' : '❌'}</span>
                    {qrMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="bg-slate-50 rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 border-slate-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 md:mb-6">Current QR Code</h3>
                    {paymentQR ? (
                      <div className="space-y-4">
                        <div className="relative aspect-square bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                          <Image
                            src={paymentQR}
                            alt="Payment QR Code"
                            fill
                            className="object-contain p-4"
                          />
                        </div>
                        <button
                          onClick={async () => {
                            await fetch('/api/settings/payment', { method: 'DELETE' });
                            setPaymentQR(null);
                          }}
                          className="w-full py-2 md:py-3 bg-rose-100 text-rose-700 rounded-lg md:rounded-xl font-bold hover:bg-rose-200 transition-all hover:scale-105 active:scale-95"
                        >
                          🗑️ Remove QR Code
                        </button>
                      </div>
                    ) : (
                      <div className="aspect-square bg-white rounded-xl md:rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                        <div className="text-center text-slate-400">
                          <span className="text-4xl md:text-5xl block mb-3">📱</span>
                          <p className="font-semibold">No QR code uploaded</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-indigo-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Upload New QR Code</h3>
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
                          className={`flex items-center justify-center gap-3 p-4 md:p-6 border-2 border-dashed rounded-xl md:rounded-2xl cursor-pointer transition-all hover-lift ${
                            qrFile ? 'border-emerald-500 bg-emerald-50' : 'border-indigo-300 hover:border-indigo-500 hover:bg-white'
                          }`}
                        >
                          <span className="text-xl md:text-2xl">{qrFile ? '✅' : '📤'}</span>
                          <span className="font-semibold text-gray-700 text-sm md:text-base">
                            {qrFile ? qrFile.name : 'Click to select QR image'}
                          </span>
                        </label>
                        <button
                          onClick={handleUploadQR}
                          disabled={!qrFile || isUploadingQR}
                          className="w-full py-3 md:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl md:rounded-2xl font-bold text-base md:text-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-1 active:scale-95"
                        >
                          {isUploadingQR ? '⏳ Uploading...' : '🚀 Upload QR Code'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'receipts' && (
              <div className="space-y-6 md:space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Payment Receipts</h2>
                  <p className="text-gray-500 mt-1">View and manage customer payment receipts</p>
                </div>

                {receipts.length === 0 ? (
                  <div className="text-center py-12 md:py-16 bg-slate-50 rounded-2xl md:rounded-3xl border-2 border-dashed border-slate-200">
                    <span className="text-5xl md:text-6xl block mb-4">📋</span>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">No receipts yet</h3>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {receipts.map((receipt, index) => (
                      <div 
                        key={receipt.id} 
                        className="bg-white border border-slate-200 rounded-xl md:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all animate-slide-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="relative aspect-[4/3] bg-slate-100">
                          {receipt.imageUrl && (
                            <Image
                              src={receipt.imageUrl}
                              alt="Payment Receipt"
                              fill
                              className="object-contain"
                            />
                          )}
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-gray-500">
                            Submitted: {new Date(receipt.timestamp).toLocaleString('en-IN')}
                          </p>
                          {receipt.utr && <p className="text-xs font-mono font-bold mt-1">UTR: {receipt.utr}</p>}
                          <div className="flex gap-2 mt-3">
                            <button 
                              onClick={() => {
                                const updated = receipts.filter(r => r.id !== receipt.id);
                                setReceipts(updated);
                                localStorage.setItem('sensey_receipts', JSON.stringify(updated));
                              }}
                              className="w-full py-2 px-3 bg-rose-100 text-rose-700 rounded-lg font-bold text-sm hover:bg-rose-200 transition-all hover:scale-105 active:scale-95"
                            >
                              🗑️ Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'utrs' && (
              <div className="space-y-6 md:space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Valid UTR Numbers</h2>
                  <p className="text-gray-500 mt-1">Manage UTR numbers for payment verification</p>
                </div>

                {utrMessage && (
                  <div className={`px-6 py-4 rounded-xl md:rounded-2xl font-semibold flex items-center gap-3 ${
                    utrMessage.includes('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    <span className="text-xl">{utrMessage.includes('success') ? '✅' : '❌'}</span>
                    {utrMessage}
                  </div>
                )}

                <div className="bg-slate-50 rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 border-slate-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Add New UTR</h3>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newUTR}
                      onChange={(e) => setNewUTR(e.target.value)}
                      className="flex-1 p-3 md:p-4 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-mono text-gray-900"
                      placeholder="Enter UTR number"
                    />
                    <button
                      onClick={handleAddUTR}
                      disabled={!newUTR.trim() || isLoadingUTRs}
                      className="px-6 py-3 md:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all transform hover:scale-105 active:scale-95"
                    >
                      {isLoadingUTRs ? '⏳' : '➕ Add'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {validUTRs.map((utr) => (
                    <div 
                      key={utr.id}
                      className="bg-white border border-slate-200 rounded-xl md:rounded-2xl p-4 shadow-md flex items-center justify-between"
                    >
                      <div>
                        <p className="font-mono font-bold text-gray-900">{utr.utr}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          Created: {new Date(utr.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveUTR(utr.id)}
                        className="p-2 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'support' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Support Messages</h2>
                  <p className="text-gray-500 mt-1">View and respond to customer inquiries</p>
                </div>

                {supportMessages.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <span className="text-5xl block mb-4">💬</span>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No messages yet</h3>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {supportMessages.map((msg) => (
                      <div key={msg.id} className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-md">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-bold text-gray-900">{msg.username}</p>
                            <p className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleString()}</p>
                          </div>
                          <button
                            onClick={() => deleteMessage && deleteMessage(msg.id)}
                            className="text-rose-500 hover:text-rose-700 text-xs font-medium"
                          >
                            Delete
                          </button>
                        </div>
                        <p className="text-gray-700 mb-4">{msg.message}</p>
                        
                        {msg.reply ? (
                          <div className="bg-indigo-600 border border-indigo-700 rounded-xl p-3">
                            <p className="text-xs font-bold text-indigo-200 mb-1">📨 Your Response:</p>
                            <p className="text-sm text-white font-medium">{msg.reply}</p>
                          </div>
                        ) : (
                          adminReply && <ReplyForm messageId={msg.id} onReply={adminReply} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Add Admin User</h3>
                    <form onSubmit={(e) => { e.preventDefault(); handleAddAdmin(); }} className="space-y-3">
                      <input type="text" placeholder="Username" value={newAdminUsername} onChange={(e) => setNewAdminUsername(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-gray-900" />
                      <input type="password" placeholder="Password" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-gray-900" />
                      <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-xl font-semibold">Add Admin</button>
                    </form>
                    <div className="mt-4 space-y-2">
                      <p className="font-bold text-gray-700 text-sm">Existing Admins:</p>
                      {adminList.map((admin: { username: string }) => (
                        <div key={admin.username} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                          <span className="text-sm font-medium">{admin.username}</span>
                          {admin.username !== 'qwertyu' && (
                            <button onClick={() => handleRemoveAdmin(admin.username)} className="text-rose-500 text-xs">Remove</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Add Vendor User</h3>
                    <form onSubmit={(e) => { e.preventDefault(); handleAddVendor(); }} className="space-y-3">
                      <input type="text" placeholder="Username" value={newVendorUsername} onChange={(e) => setNewVendorUsername(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-gray-900" />
                      <input type="password" placeholder="Password" value={newVendorPassword} onChange={(e) => setNewVendorPassword(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-gray-900" />
                      <button type="submit" className="w-full py-2 bg-emerald-600 text-white rounded-xl font-semibold">Add Vendor</button>
                    </form>
                    <div className="mt-4 space-y-2">
                      <p className="font-bold text-gray-700 text-sm">Existing Vendors:</p>
                      {vendorList.map((vendor: { username: string }) => (
                        <div key={vendor.username} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                          <span className="text-sm font-medium">{vendor.username}</span>
                          <button onClick={() => handleRemoveVendor(vendor.username)} className="text-rose-500 text-xs">Remove</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Product Catalog</h2>
            <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold w-fit">
              {products.length} items
            </span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12 md:py-16">
              <span className="text-5xl md:text-6xl block mb-4">📦</span>
              <p className="text-gray-500 font-medium">No products yet. Add your first product above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 stagger-grid">
              {products.map((product, index) => (
                <div
                  key={product.id || index}
                  className="bg-white border border-slate-100 rounded-xl md:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="relative h-40 md:h-48 bg-slate-100 overflow-hidden">
                    {product.image && (
                      <Image
                        src={product.image}
                        alt={product.name || 'Product'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute top-2 md:top-3 right-2 md:right-3 bg-emerald-600 text-white px-2 md:px-3 py-1 rounded-full font-bold text-xs md:text-sm shadow-lg">
                      {formatCurrency(product.price)}
                    </div>
                  </div>
                  <div className="p-4 md:p-5">
                    <h3 className="font-bold text-gray-900 truncate text-sm md:text-base">{product.name || 'Unnamed Product'}</h3>
                    <p className="text-xs md:text-sm text-gray-500 mt-1 line-clamp-2">{product.description || ''}</p>
                    <div className="flex items-center justify-between mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-100">
                      <span className="text-xs font-semibold text-gray-400">{product.vendor || 'Sensey'}</span>
                      <button
                        onClick={() => handleRemoveProduct(product.id)}
                        className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors hover:scale-110"
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
