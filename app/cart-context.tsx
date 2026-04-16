'use client';

import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import { useAuth } from './auth-context';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { type Product } from './products-context';

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'INITIALIZE_CART'; payload: CartState };

const initialCartState: CartState = { items: [], total: 0 };
const CART_STORAGE_KEY = 'cart';

const calculateTotal = (items: CartItem[]) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

const toValidNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeState = (state: Partial<CartState>): CartState => {
  const rawItems = Array.isArray(state.items) ? state.items : [];
  const items = rawItems
    .filter((item) => item && typeof item.id === 'string')
    .map((item) => ({
      ...item,
      name: typeof item.name === 'string' ? item.name : 'Untitled product',
      image:
        typeof item.image === 'string' && item.image.length > 0
          ? item.image
          : 'https://picsum.photos/200/200?grayscale',
      description:
        typeof item.description === 'string' ? item.description : 'No description yet.',
      price: toValidNumber(item.price, 0),
      quantity: Math.max(1, Math.floor(toValidNumber(item.quantity, 1))),
    }));

  return {
    items,
    total: calculateTotal(items),
  };
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'INITIALIZE_CART':
      return normalizeState(action.payload);
    case 'ADD_ITEM': {
      const safePrice = toValidNumber(action.payload.price, 0);
      const existingItem = state.items.find((item) => item.id === action.payload.id);
      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems),
        };
      }

      const updatedItems = [...state.items, { ...action.payload, price: safePrice, quantity: 1 }];
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems),
      };
    }
    case 'REMOVE_ITEM': {
      const filteredItems = state.items.filter((item) => item.id !== action.payload);
      return {
        ...state,
        items: filteredItems,
        total: calculateTotal(filteredItems),
      };
    }
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        const removedItems = state.items.filter((item) => item.id !== action.payload.id);
        return {
          ...state,
          items: removedItems,
          total: calculateTotal(removedItems),
        };
      }

      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.floor(action.payload.quantity) }
          : item,
      );
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems),
      };
    }
    case 'CLEAR_CART':
      return initialCartState;
    default:
      return state;
  }
};

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  isLoading: boolean;
  error: string | null;
  isFirebaseEnabled: boolean;
} | null>(null);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  const hasHydrated = useRef(false);
  const skipNextWrite = useRef(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !db || !user) {
      if (typeof window === 'undefined') {
        hasHydrated.current = true;
        return;
      }

      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (!storedCart) {
        hasHydrated.current = true;
        return;
      }

      try {
        const parsedCart = JSON.parse(storedCart) as CartState;
        dispatch({ type: 'INITIALIZE_CART', payload: parsedCart });
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY);
      } finally {
        hasHydrated.current = true;
      }

      return;
    }

    const cartRef = doc(db, 'carts', user.uid);
    const unsubscribe = onSnapshot(
      cartRef,
      (snapshot) => {
        skipNextWrite.current = true;
        if (!snapshot.exists()) {
          dispatch({ type: 'INITIALIZE_CART', payload: initialCartState });
          hasHydrated.current = true;
          return;
        }

        const data = snapshot.data() as Partial<CartState>;
        dispatch({ type: 'INITIALIZE_CART', payload: normalizeState(data) });
        hasHydrated.current = true;
        setError(null);
      },
      () => {
        setError('We could not sync your cart from Firebase.');
        hasHydrated.current = true;
      },
    );

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!hasHydrated.current) {
      return;
    }

    if (!isFirebaseConfigured || !db || !user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
      }
      return;
    }

    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }

    void setDoc(doc(db, 'carts', user.uid), {
      items: state.items,
      total: state.total,
      updatedAt: serverTimestamp(),
    }).catch(() => {
      setError('We could not save your cart to Firebase.');
    });
  }, [state, user]);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      isLoading: isFirebaseConfigured && isAuthLoading && !hasHydrated.current,
      error,
      isFirebaseEnabled: isFirebaseConfigured,
    }),
    [error, isAuthLoading, state],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
