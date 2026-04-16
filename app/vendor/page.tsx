'use client';

import { useState } from 'react';
import { useProducts } from '../products-context';

export default function VendorPage() {
  const { addProduct } = useProducts();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
    vendor: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.image || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    addProduct({
      name: formData.name,
      price: parseFloat(formData.price),
      image: formData.image,
      description: formData.description,
      vendor: formData.vendor || 'Anonymous Vendor',
    });

    // Reset form
    setFormData({
      name: '',
      price: '',
      image: '',
      description: '',
      vendor: '',
    });

    alert('Product added successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Add Your Product</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Product Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg"
            placeholder="Enter product name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Price *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full p-3 border rounded-lg"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Image URL *</label>
          <input
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full p-3 border rounded-lg"
            placeholder="Describe your product"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Vendor Name (optional)</label>
          <input
            type="text"
            name="vendor"
            value={formData.vendor}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg"
            placeholder="Your business name"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 text-lg font-semibold"
        >
          Add Product
        </button>
      </form>
    </div>
  );
}