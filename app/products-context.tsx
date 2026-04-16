'use client';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from './auth-context';
import { db, isFirebaseConfigured } from '../lib/firebase';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  vendor?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface ProductDraft {
  name: string;
  price: number;
  image: string;
  description: string;
  vendor?: string;
}

interface ProductsContextType {
  products: Product[];
  addProduct: (product: ProductDraft) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isFirebaseEnabled: boolean;
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

const PRODUCTS_STORAGE_KEY = 'products';

const normalizeProduct = (product: Partial<Product>, fallbackId: string): Product => ({
  id: typeof product.id === 'string' ? product.id : fallbackId,
  name: typeof product.name === 'string' ? product.name : 'Untitled product',
  price: Number.isFinite(Number(product.price)) ? Number(product.price) : 0,
  image:
    typeof product.image === 'string' && product.image.length > 0
      ? product.image
      : 'https://picsum.photos/300/200?grayscale',
  description:
    typeof product.description === 'string' ? product.description : 'No description yet.',
  vendor: typeof product.vendor === 'string' && product.vendor.length > 0 ? product.vendor : undefined,
  createdBy:
    typeof product.createdBy === 'string' && product.createdBy.length > 0
      ? product.createdBy
      : undefined,
  createdAt:
    typeof product.createdAt === 'string' && product.createdAt.length > 0
      ? product.createdAt
      : undefined,
});

const loadLocalProducts = (): Product[] => {
  if (typeof window === 'undefined') {
    return initialProducts;
  }

  try {
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!stored) {
      return initialProducts;
    }

    const parsed = JSON.parse(stored) as Partial<Product>[];
    return parsed.map((product, index) => normalizeProduct(product, `${index + 1}`));
  } catch {
    return initialProducts;
  }
};

export const ProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>(loadLocalProducts);
  const [isLoading, setIsLoading] = useState(Boolean(isFirebaseConfigured));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      return;
    }

    const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        setProducts(
          snapshot.docs.map((snapshotDoc) => {
            const data = snapshotDoc.data() as Partial<Product> & {
              createdAt?: { toDate?: () => Date };
            };

            return normalizeProduct(
              {
                ...data,
                id: snapshotDoc.id,
                createdAt: data.createdAt?.toDate?.()?.toISOString(),
              },
              snapshotDoc.id,
            );
          }),
        );
        setIsLoading(false);
        setError(null);
      },
      () => {
        setError('We could not sync products from Firebase.');
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isFirebaseConfigured || typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const addProduct = async (newProduct: ProductDraft) => {
    const normalizedProduct: Product = normalizeProduct(
      {
        ...newProduct,
        id: Date.now().toString(),
        createdBy: user?.uid,
        createdAt: new Date().toISOString(),
      },
      Date.now().toString(),
    );

    if (!isFirebaseConfigured || !db || !user) {
      setProducts((prevProducts) => [...prevProducts, normalizedProduct]);
      return;
    }

    try {
      await addDoc(collection(db, 'products'), {
        name: normalizedProduct.name,
        price: normalizedProduct.price,
        image: normalizedProduct.image,
        description: normalizedProduct.description,
        vendor: normalizedProduct.vendor ?? null,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });
    } catch {
      setError('We could not save that product to Firebase.');
      throw new Error('product-save-failed');
    }
  };

  const removeProduct = async (id: string) => {
    if (!isFirebaseConfigured || !db) {
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
      return;
    }

    try {
      await deleteDoc(doc(db, 'products', id));
    } catch {
      setError('We could not remove that product from Firebase.');
      throw new Error('product-delete-failed');
    }
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        addProduct,
        removeProduct,
        isLoading: isLoading || (isFirebaseConfigured && isAuthLoading),
        error,
        isFirebaseEnabled: isFirebaseConfigured,
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
