"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Box, FileBox, Plus, Settings, LogOut, Menu, X } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';



export default function UserSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push('/auth/login');
  };

  const navLinks = [
    { href: '/dashboard', icon: Box, label: 'Özet Paneli', exact: true },
    { href: '/dashboard/orders', icon: FileBox, label: 'Tüm Siparişler', exact: false },
    { href: '/dashboard/new-request', icon: Plus, label: 'Yeni Talep', exact: false },
    { href: '/dashboard/settings', icon: Settings, label: 'Ayarlar', exact: false },
  ];

  return (
    <>
      {/* Mobil Menü Butonu */}
      <button onClick={() => setIsOpen(true)} className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-surface border border-slate-700 rounded-md text-white shadow-lg">
        <Menu size={24} />
      </button>

      {/* Mobil Arka Plan Karartması */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      {/* Menü Gövdesi */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-slate-800/60 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col justify-between shrink-0 h-screen sticky top-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <div className="flex items-center justify-between px-6 py-6 border-b border-slate-800/60">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                <Box size={18} className="text-white" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">{SITE_CONFIG.name}</span>
            </Link>
            <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
          <nav className="p-4 space-y-2">
            {navLinks.map((link) => {
              const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive ? 'bg-primary/10 text-primary border border-primary/20' : 'text-slate-400 hover:bg-surface-hover'
                  }`}
                >
                  <Icon size={20} /> {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800/60">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg font-medium transition-colors">
            <LogOut size={20} /> Çıkış Yap
          </button>
        </div>
      </aside>
    </>
  );
}