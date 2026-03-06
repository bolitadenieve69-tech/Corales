export const dynamic = 'force-dynamic';
export const revalidate = 0;

import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope, DM_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const cormorantGaramond = Cormorant_Garamond({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: '--font-display',
});

const manrope = Manrope({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ["latin"],
  variable: '--font-ui',
});

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ["latin"],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: "Corales",
  description: "Estudio coral simplificado",
};

import { ToastContainer } from "@/components/ui/ToastContainer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${cormorantGaramond.variable} ${manrope.variable} ${dmMono.variable} antialiased min-h-screen bg-transparent`}>
        <AuthProvider>
          {children}
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
