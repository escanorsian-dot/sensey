'use client';

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from './auth-context';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  description: string;
  vendor?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface ProductDraft {
  name: string;
  price: number;
  image: string;
  images?: string[];
  description: string;
  vendor?: string;
}

interface ProductsContextType {
  products: Product[];
  addProduct: (product: ProductDraft) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const ProductsContext = createContext<ProductsContextType | null>(null);

const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Amazing Gadget',
    price: 99.99,
    image: 'https://picsum.photos/300/200?random=1',
    description: 'This is an amazing gadget that does wonderful things.',
  },
];

export const ProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();

      if (data && Array.isArray(data)) {
        setProducts(data.map((p: any) => ({
          id: p.id || p._id || '',
          name: p.name,
          price: Number(p.price),
          image: p.image,
          images: p.images || [],
          description: p.description,
          vendor: p.vendor,
          createdBy: p.owner_id,
          createdAt: p.createdAt
        })));
      }
    } catch (err: any) {
      console.error('Fetch Error:', err);
      setError(`Database Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addProduct = async (newProduct: ProductDraft) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newProduct.name,
          price: newProduct.price,
          image: newProduct.image,
          images: newProduct.images || [],
          description: newProduct.description,
          vendor: newProduct.vendor,
          owner_id: user?.uid || 'anonymous'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add product');
      }

      await fetchProducts();
    } catch (err: any) {
      console.error('Insert Error:', err);
      setError(`Failed to save: ${err.message}`);
      throw err;
    }
  };

  const removeProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      await fetchProducts();
    } catch (err: any) {
      console.error('Delete Error:', err);
      setError(`Failed to remove: ${err.message}`);
    }
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        addProduct,
        removeProduct,
        isLoading,
        error,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};
