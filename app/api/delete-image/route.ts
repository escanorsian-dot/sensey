import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ success: false, message: 'Image URL required' }, { status: 400 });
    }

    const publicId = imageUrl.split('/').pop()?.split('.')[0];
    
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[ERROR] Delete image failed:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}