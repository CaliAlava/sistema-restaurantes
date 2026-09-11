import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FoodTech Storefront | Plataforma Gastronómica Multi-Tenant',
  description: 'Tienda directa de restaurante sin intermediarios ni comisiones abusivas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
