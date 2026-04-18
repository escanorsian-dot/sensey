'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface ValidUTR {
  id: string;
  utr: string;
  createdAt: number;
}

export default function SubmitReceiptPage() {
  const router = useRouter();
  const [utrInput, setUtrInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidUTR, setIsValidUTR] = useState(false);
  const [validUTRs, setValidUTRs] = useState<ValidUTR[]>([]);
  
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [receiptSubmitted, setReceiptSubmitted] = useState(false);

  useEffect(() => {
    const storedUTRs = localStorage.getItem('sensey_valid_utrs');
    if (storedUTRs) {
      const parsed = JSON.parse(storedUTRs) as ValidUTR[];
      const now = Date.now();
      const valid = parsed.filter(utr => {
        const age = now - utr.createdAt;
        return age <= 24 * 60 * 60 * 1000;
      });
      setValidUTRs(valid);
    }
  }, []);

  const handleValidateUTR = () => {
    setIsValidating(true);
    setValidationError(null);

    setTimeout(() => {
      const found = validUTRs.find(u => u.utr.trim() === utrInput.trim());
      
      if (found) {
        const age = Date.now() - found.createdAt;
        const hoursLeft = Math.floor((24 * 60 * 60 * 1000 - age) / (1000 * 60 * 60));
        
        if (hoursLeft > 0) {
          setIsValidUTR(true);
        } else {
          setValidationError('This UTR has expired. Please contact support.');
        }
      } else {
        setValidationError('Invalid UTR number. Please check and try again.');
      }
      
      setIsValidating(false);
    }, 800);
  };

  const handleReceiptChange = (file: File | null) => {
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setReceiptPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReceipt = async () => {
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
        utr: utrInput.trim(),
      };
      
      const existingReceipts = JSON.parse(localStorage.getItem('sensey_receipts') || '[]');
      existingReceipts.push(newReceipt);
      localStorage.setItem('sensey_receipts', JSON.stringify(existingReceipts));
      
      setReceiptSubmitted(true);
    } catch (err) {
      console.error('Receipt upload failed:', err);
      setValidationError('Failed to upload receipt. Please try again.');
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  if (receiptSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-3xl shadow-xl max-w-lg mx-4">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-[bounce_1s_ease infinite]">
            <span className="text-5xl">✅</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Receipt Submitted!</h1>
          <p className="text-gray-600 mb-2">Your payment receipt has been submitted successfully.</p>
          <p className="text-gray-500 mb-8 text-sm">We will verify your payment shortly.</p>
          <button 
            onClick={() => {
              setReceiptSubmitted(false);
              setUtrInput('');
              setReceiptFile(null);
              setReceiptPreview(null);
              setIsValidUTR(false);
            }}
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
          >
            Submit Another Receipt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold transition-all hover:-translate-x-1"
        >
          <span className="text-xl">←</span> Back
        </button>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4 animate-[slideUp_0.5s_ease-out_forwards]">
            Submit Payment Receipt
          </h1>
          <p className="text-gray-500 text-lg animate-[fadeIn_0.5s_ease-out_forwards]" style={{ animationDelay: '0.2s' }}>
            Enter your UTR number and upload your payment receipt
          </p>
        </div>

        {!isValidUTR ? (
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 animate-[scaleIn_0.4s_ease-out_forwards]">
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">UTR Number</label>
              <p className="text-xs text-gray-500 mb-4">
                Enter the UTR number from your payment transaction
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  className="flex-1 p-3 md:p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all font-mono text-gray-900 placeholder:text-gray-400"
                  placeholder="Enter UTR number (e.g., 123456789012)"
                />
                <button
                  onClick={handleValidateUTR}
                  disabled={!utrInput.trim() || isValidating}
                  className="px-6 py-3 md:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                >
                  {isValidating ? '⏳' : 'Verify'}
                </button>
              </div>
            </div>

            {validationError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 font-semibold flex items-center gap-3 animate-[shake_0.5s_ease]">
                <span className="text-xl">⚠️</span>
                {validationError}
              </div>
            )}

            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 mt-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div>
                  <p className="font-bold text-amber-800">How it works</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Your UTR number must be valid and not older than 24 hours. 
                    UTRs are provided by the admin after payment is processed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 animate-[slideUp_0.4s_ease-out_forwards]">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-bold text-emerald-800">UTR Verified</p>
                  <p className="text-sm text-emerald-700">UTR: {utrInput}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 animate-[scaleIn_0.4s_ease-out_forwards]" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Payment Receipt</h2>
              <p className="text-sm text-gray-500 mb-4">
                Take a screenshot or photo of your payment confirmation and upload it here.
              </p>
              
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleReceiptChange(e.target.files?.[0] ?? null)}
                className="hidden"
                id="receipt-upload"
              />
              <label
                htmlFor="receipt-upload"
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all hover-lift ${
                  receiptFile ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50'
                }`}
              >
                {receiptPreview ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                    <img src={receiptPreview} alt="Receipt preview" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <>
                    <span className="text-4xl mb-3">📷</span>
                    <span className="font-semibold text-gray-700">Click to upload receipt</span>
                    <span className="text-xs text-gray-500 mt-1">Screenshot or photo of payment</span>
                  </>
                )}
              </label>

              {receiptFile && (
                <button
                  onClick={handleSubmitReceipt}
                  disabled={isUploadingReceipt}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all transform hover:scale-[1.02] active:scale-95"
                >
                  {isUploadingReceipt ? '⏳ Uploading...' : '📤 Submit Receipt'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}