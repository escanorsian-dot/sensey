import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Header from "./header";

export const metadata: Metadata = {
  title: "Sensey - Your Product Store",
  description: "Buy amazing products from Sensey",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1 page-enter">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
