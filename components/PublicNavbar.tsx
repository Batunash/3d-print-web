"use client";

import React from 'react';
import Link from 'next/link';
import { Box } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

export default function PublicNavbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <Box size={24} className="text-white" />
          </div>
          <span className="font-bold text-xl text-white tracking-tight">{SITE_CONFIG.name}</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/#nasil-calisir" className="hover:text-white transition-colors">Nasıl Çalışır?</Link>
          <Link href="/#ozellikler" className="hover:text-white transition-colors">Özellikler</Link>
          <Link href="/auth/login" className="hover:text-white transition-colors">Giriş Yap</Link>
          <Link href="/auth/register" className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg shadow-lg shadow-primary/20 transition-all">
            Kayıt Ol
          </Link>
        </div>
      </div>
    </nav>
  );
}