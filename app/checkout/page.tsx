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
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const storedQR = localStorage.getItem('sensey_payment_qr');
    if (storedQR) setPaymentQR(storedQR);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setShowQR(true);
  };

  const handleConfirmPayment = () => {
    setOrderPlaced(true);
    dispatch({ type: 'CLEAR_CART' });
  };

  if (state.items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-3xl shadow-xl max-w-md mx-4">
          <span className="text-7xl block mb-6">🛒</span>
          <h1 className="text-3xl font-black text-slate-900 mb-4">Your Cart is Empty</h1>
          <p className="text-slate-500 mb-8">Add some products to checkout!</p>
          <Link href="/products" className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-3xl shadow-xl max-w-lg mx-4">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">✅</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4">Order Placed!</h1>
          <p className="text-slate-500 mb-8">Thank you for your purchase. Your order has been confirmed.</p>
          <Link href="/products" className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (showQR) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-12">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-center">
              <h2 className="text-2xl font-black">Complete Payment</h2>
              <p className="opacity-80 mt-1">Scan QR code to pay {formatCurrency(state.total)}</p>
            </div>

            <div className="p-8">
              {paymentQR ? (
                <div className="space-y-6">
                  <div className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden">
                    <Image
                      src={paymentQR}
                      alt="Payment QR Code"
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                  <div className="text-center space-y-3">
                    <p className="text-3xl font-black text-slate-900">{formatCurrency(state.total)}</p>
                    <p className="text-sm text-slate-500">Pay using any UPI app (Google Pay, PhonePe, Paytm)</p>
                  </div>
                  <button
                    onClick={handleConfirmPayment}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all"
                  >
                    ✅ I've Paid - Confirm Order
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-6xl block mb-4">⚠️</span>
                  <p className="text-slate-600 font-semibold mb-6">Payment QR code not configured</p>
                  <button
                    onClick={() => setShowQR(false)}
                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
                  >
                    ← Go Back
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-black text-slate-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Delivery Details</h2>
            <form onSubmit={handlePlaceOrder} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Delivery Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium"
                  placeholder="House No., Street, Area"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">PIN Code</label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    required
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-medium"
                    placeholder="XXXXXX"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all mt-6"
              >
                📱 Pay with UPI / QR Code
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                      <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-slate-900">₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(state.total)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-xl font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span>{formatCurrency(state.total)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="font-bold text-amber-800">How it works</p>
                  <p className="text-sm text-amber-700 mt-1">
                    After placing your order, you'll see a QR code. Scan it with any UPI app (Google Pay, PhonePe, Paytm) to complete payment.
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
