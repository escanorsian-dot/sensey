'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  vendor?: string;
}

interface ProductsContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  removeProduct: (id: string) => void;
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
  {
    id: '2',
    name: 'Super Tool',
    price: 49.99,
    image: 'https://picsum.photos/300/200?random=2',
    description: 'A super tool for all your needs.',
  },
  {
    id: '3',
    name: 'Cool Device',
    price: 149.99,
    image: 'https://picsum.photos/300/200?random=3',
    description: 'The coolest device on the market.',
  },
];

export const ProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window === 'undefined') {
      return initialProducts;
    }

    try {
      const stored = localStorage.getItem('products');
      return stored ? (JSON.parse(stored) as Product[]) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const addProduct = (newProduct: Omit<Product, 'id'>) => {
    const product: Product = {
      ...newProduct,
      id: Date.now().toString(),
    };
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts, product];
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      return updatedProducts;
    });
  };

  const removeProduct = (id: string) => {
    setProducts((prevProducts) => {
      const updatedProducts = prevProducts.filter((product) => product.id !== id);
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      return updatedProducts;
    });
  };

  return (
    <ProductsContext.Provider value={{ products, addProduct, removeProduct }}>
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
