import { supabase } from './supabase';

const sanitizeFileName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, '-');

export async function uploadProductImage(file: File, ownerId: string) {
  if (!supabase) {
    throw new Error('storage-not-configured');
  }

  const fileName = `${ownerId}/${Date.now()}-${sanitizeFileName(file.name)}`;

  // 1. Upload the file to a bucket named 'product-images'
  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw error;
  }

  // 2. Get the public URL for the uploaded image
  const { data: publicData } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName);

  return publicData.publicUrl;
}
