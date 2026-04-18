'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface ImageCropperModalProps {
  imageSrc: string;
  onCrop: (croppedFile: File) => void;
  onCancel: () => void;
}

export default function ImageCropperModal({ imageSrc, onCrop, onCancel }: ImageCropperModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageData, setImageData] = useState<{ width: number; height: number; naturalWidth: number; naturalHeight: number } | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropSize] = useState(200);

  const minScale = 0.5;
  const maxScale = 3;

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageData({
        width: img.width,
        height: img.height,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove]);

  const handleCrop = () => {
    if (!imageData) return;

    const canvas = document.createElement('canvas');
    canvas.width = cropSize;
    canvas.height = cropSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const containerSize = containerRect.width;
      const imageDisplaySize = containerSize;

      const imgScaleX = imageData.naturalWidth / imageDisplaySize;
      const imgScaleY = imageData.naturalHeight / imageDisplaySize;

      const offsetX = (imageDisplaySize - imageData.width * scale) / 2 + position.x;
      const offsetY = (imageDisplaySize - imageData.height * scale) / 2 + position.y;

      const cropX = -offsetX * imgScaleX + (cropSize / 2) * imgScaleX;
      const cropY = -offsetY * imgScaleY + (cropSize / 2) * imgScaleY;
      const cropWidth = cropSize * imgScaleX;
      const cropHeight = cropSize * imgScaleY;

      ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropSize, cropSize);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
          onCrop(file);
        }
      }, 'image/jpeg', 0.92);
    };
    img.src = imageSrc;
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl p-4 md:p-6 w-full max-w-md">
        <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Adjust Image</h3>
        <p className="text-sm text-gray-500 mb-4 text-center">Drag to position your image</p>

        <div 
          ref={containerRef}
          className="relative mx-auto mb-4 cursor-move select-none overflow-hidden rounded-xl"
          style={{ 
            width: cropSize, 
            height: cropSize,
            backgroundColor: '#f3f4f6'
          }}
          onMouseDown={handleMouseDown}
        >
          {imageData && (
            <div 
              className="absolute"
              style={{
                width: `${imageData.width * scale}px`,
                height: `${imageData.height * scale}px`,
                left: `calc(50% - ${imageData.width * scale / 2}px + ${position.x}px)`,
                top: `calc(50% - ${imageData.height * scale / 2}px + ${position.y}px)`,
                backgroundImage: `url(${imageSrc})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          )}
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-500 mb-2 text-center">Zoom</label>
          <input
            type="range"
            min={minScale * 100}
            max={maxScale * 100}
            value={scale * 100}
            onChange={(e) => setScale(Number(e.target.value) / 100)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            ✓ Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
}