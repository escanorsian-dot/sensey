'use client';

import { AuthProvider } from './auth-context';
import { CartProvider } from './cart-context';
import { ProductsProvider } from './products-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProductsProvider>
        <CartProvider>{children}</CartProvider>
      </ProductsProvider>
    </AuthProvider>
  );
}
