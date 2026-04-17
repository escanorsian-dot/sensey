export async function uploadProductImage(file: File, ownerId: string) {
  try {
    const folder = `sensey/products/${ownerId}`;
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
    return data.url;
  } catch (error) {
    console.error('Product image upload error:', error);
    throw error;
  }
}
