'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../cart-context';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CheckoutPage() {
  const { state, dispatch } = useCart();
  const [paymentQR, setPaymentQR] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    phone: '',
  });
  const [showQR, setShowQR] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [receiptSubmitted, setReceiptSubmitted] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  useEffect(() => {
    fetchPaymentQR();
  }, []);

  const fetchPaymentQR = async () => {
    try {
      const res = await fetch('/api/settings/payment');
      const data = await res.json();
      if (data.qrCode) setPaymentQR(data.qrCode);
    } catch (err) {
      console.error('Failed to fetch payment QR:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReceiptChange = (file: File | null) => {
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setReceiptPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setShowQR(true);
  };

  const handleUploadReceipt = async () => {
    if (!receiptFile) return;
    
    setIsUploadingReceipt(true);
    try {
      const formData = new FormData();
      formData.append('file', receiptFile);
      formData.append('folder', 'sensey/receipts');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      
      const newReceipt = {
        id: Date.now().toString(),
        imageUrl: data.url,
        timestamp: Date.now(),
      };
      
      const existingReceipts = JSON.parse(localStorage.getItem('sensey_receipts') || '[]');
      existingReceipts.push(newReceipt);
      localStorage.setItem('sensey_receipts', JSON.stringify(existingReceipts));
      
      setReceiptSubmitted(true);
    } catch (err) {
      console.error('Receipt upload failed:', err);
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const handleConfirmPayment = () => {
    setOrderComplete(true);
    dispatch({ type: 'CLEAR_CART' });
  };

  if (state.items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-3xl shadow-xl max-w-md mx-4">
          <span className="text-7xl block mb-6">🛒</span>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-8">Add some products to checkout!</p>
          <Link href="/products" className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-3xl shadow-xl max-w-lg mx-4">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">✅</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Order Placed!</h1>
          <p className="text-gray-600 mb-2">Thank you for your purchase!</p>
          <p className="text-gray-500 mb-8 text-sm">Your order has been confirmed. We will verify your payment and contact you soon.</p>
          <Link href="/products" className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (showQR) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-8 px-4">
        <div className="max-w-lg mx-auto">
          <button 
            onClick={() => setShowQR(false)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold transition-colors"
          >
            <span>←</span> Back to details
          </button>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-center">
              <h2 className="text-2xl font-black">Complete Payment</h2>
              <p className="opacity-90 mt-1 font-medium">Pay {formatCurrency(state.total)}</p>
            </div>

            <div className="p-6 space-y-6">
              {paymentQR ? (
                <>
                  <div className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden">
                    <Image
                      src={paymentQR}
                      alt="Payment QR Code"
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-3xl font-black text-gray-900">{formatCurrency(state.total)}</p>
                    <p className="text-sm text-gray-500">Scan with any UPI app (Google Pay, PhonePe, Paytm)</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <span className="text-5xl block mb-4">⚠️</span>
                  <p className="text-gray-600 font-semibold">Payment QR not configured</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📎</span> Submit Payment Receipt
            </h3>
            
            {receiptSubmitted ? (
              <div className="text-center py-6 bg-emerald-50 rounded-2xl">
                <span className="text-4xl block mb-2">✅</span>
                <p className="font-bold text-emerald-700">Receipt submitted successfully!</p>
                <p className="text-sm text-emerald-600 mt-1">We will verify your payment shortly.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">After payment, take a screenshot or photo of your payment confirmation and upload it here.</p>
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleReceiptChange(e.target.files?.[0] ?? null)}
                  className="hidden"
                  id="receipt-upload"
                />
                <label
                  htmlFor="receipt-upload"
                  className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                    receiptFile ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50'
                  }`}
                >
                  {receiptPreview ? (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                      <img src={receiptPreview} alt="Receipt preview" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <>
                      <span className="text-3xl mb-2">📷</span>
                      <span className="font-semibold text-gray-700">Click to upload receipt</span>
                      <span className="text-xs text-gray-500 mt-1">Screenshot or photo of payment</span>
                    </>
                  )}
                </label>

                {receiptFile && (
                  <button
                    onClick={handleUploadReceipt}
                    disabled={isUploadingReceipt}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all"
                  >
                    {isUploadingReceipt ? '⏳ Uploading...' : '📤 Submit Receipt'}
                  </button>
                )}

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <span className="font-bold">Note:</span> You can also submit your receipt later from your order confirmation page.
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleConfirmPayment}
            className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all"
          >
            ✅ I've Paid - Confirm Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Delivery Details</h2>
            <form onSubmit={handlePlaceOrder} className="space-y-4 md:space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 md:p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 md:p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full p-3 md:p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full p-3 md:p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="House No., Street, Area"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full p-3 md:p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">PIN Code *</label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    required
                    className="w-full p-3 md:p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                    placeholder="XXXXXX"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 md:py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all mt-6"
              >
                📱 Continue to Payment
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm md:text-base truncate">{item.name}</p>
                      <p className="text-xs md:text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-gray-900 text-sm md:text-base">₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-gray-500 text-sm md:text-base">
                  <span>Subtotal</span>
                  <span>{formatCurrency(state.total)}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-sm md:text-base">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-lg md:text-xl font-black text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatCurrency(state.total)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 md:p-6 border border-amber-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="font-bold text-amber-800">How it works</p>
                  <p className="text-sm text-amber-700 mt-1">
                    After placing your order, you'll see a QR code. Scan it with any UPI app to pay, then submit your receipt.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
