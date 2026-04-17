import { uploadImage } from './cloudinary';

export async function uploadProductImage(file: File, ownerId: string) {
  try {
    const folder = `sensey/products/${ownerId}`;
    const url = await uploadImage(file, folder) as string;
    return url;
  } catch (error) {
    console.error('Product image upload error:', error);
    throw error;
  }
}
