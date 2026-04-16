'use client';

import { CartProvider } from './cart-context';
import { ProductsProvider } from './products-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ProductsProvider>
      <CartProvider>{children}</CartProvider>
    </ProductsProvider>
  );
}