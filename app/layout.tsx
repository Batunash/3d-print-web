import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_CONFIG } from "@/lib/constants";
import AuthProvider from "@/components/AuthProvider"; 
import { Toaster } from "react-hot-toast"
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// app/layout.tsx içindeki metadata objesini bununla değiştir:
export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`, // Alt sayfalarda "Giriş Yap | PrintCraft 3D" yazar
  },
  description: SITE_CONFIG.description,
  keywords: ["3D Baskı", "Hızlı 3D Üretim", "Online 3D Baskı", "STL Baskı", "FDM", "SLA"],
  openGraph: {
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: 'https://3d-print-web.vercel.app',
    siteName: SITE_CONFIG.name,
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              style: {
                background: 'var(--color-surface)',
                color: '#fff',
                border: '1px solid rgba(30, 41, 59, 0.6)',
              }
            }} 
          />
        </AuthProvider>
      </body>
    </html>
  );
}