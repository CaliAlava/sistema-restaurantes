import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'POS & KDS Kitchen Display | FoodTech OS',
  description: 'Sistema de Pantalla de Cocina y Punto de Venta en tiempo real.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-amber-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
