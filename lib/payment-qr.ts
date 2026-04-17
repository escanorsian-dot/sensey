export async function uploadPaymentQR(file: File) {
  try {
    const folder = 'sensey/payments';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    const data = await response.json();
    localStorage.setItem('sensey_payment_qr', data.url);
    return data.url;
  } catch (error) {
    console.error('Payment QR upload error:', error);
    throw error;
  }
}

export function getStoredPaymentQR(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sensey_payment_qr');
}

export function clearStoredPaymentQR(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('sensey_payment_qr');
}
