'use client';

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from './auth-context';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
  isFirebaseEnabled: boolean; // Keeping for UI compatibility
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
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from Supabase
  const fetchProducts = async () => {
    if (!supabase) return;
    
    try {
      const { data, error: fetchErr } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;

      if (data) {
        setProducts(data.map(p => ({
          id: p.id.toString(),
          name: p.name,
          price: Number(p.price),
          image: p.image,
          images: p.images || [],
          description: p.description,
          vendor: p.vendor,
          createdBy: p.owner_id,
          createdAt: p.created_at
        })));
      }
    } catch (err: any) {
      console.error('Supabase Fetch Error:', err);
      setError(`Database Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchProducts();

      // Subscribe to real-time changes
      const channel = supabase!
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          () => fetchProducts()
        )
        .subscribe();

      return () => {
        supabase!.removeChannel(channel);
      };
    }
  }, []);

  const addProduct = async (newProduct: ProductDraft) => {
    if (!supabase) {
      // Local fallback if Supabase not configured
      const localProduct = {
        ...newProduct,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      setProducts(prev => [localProduct, ...prev]);
      return;
    }

    try {
      const { error: insertErr } = await supabase
        .from('products')
        .insert([{
          name: newProduct.name,
          price: newProduct.price,
          image: newProduct.image,
          images: newProduct.images || [],
          description: newProduct.description,
          vendor: newProduct.vendor,
          owner_id: user?.uid || 'anonymous'
        }]);

      if (insertErr) {
        console.error('Full Supabase Error Object:', insertErr);
        alert(`Supabase Error: ${insertErr.message}\nCode: ${insertErr.code}\nDetails: ${insertErr.details}`);
        throw insertErr;
      }
      
      // Real-time subscription will handle the UI update
    } catch (err: any) {
      console.error('Supabase Insert Error:', err);
      setError(`Failed to save: ${err.message}`);
      throw err;
    }
  };

  const removeProduct = async (id: string) => {
    if (!supabase) {
      setProducts(prev => prev.filter(p => p.id !== id));
      return;
    }

    try {
      const { error: deleteErr } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (deleteErr) throw deleteErr;
    } catch (err: any) {
      console.error('Supabase Delete Error:', err);
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
        isFirebaseEnabled: true, // Keep as true for UI badges
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
