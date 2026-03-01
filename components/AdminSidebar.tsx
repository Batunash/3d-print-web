"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { BarChart3, FileText, Layers, LogOut } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants'; 

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push('/auth/login');
  };

  const navLinks = [
    { href: '/admin', icon: BarChart3, label: 'Özet Analiz', exact: true },
    { href: '/admin/requests', icon: FileText, label: 'Gelen Talepler', exact: false },
    { href: '/admin/materials', icon: Layers, label: 'Malzeme & Renkler', exact: false },
  ];

  return (
    // bg-[#111622] -> bg-sidebar oldu
    <aside className="w-64 bg-sidebar border-r border-slate-800/60 flex flex-col justify-between hidden lg:flex shrink-0 h-screen sticky top-0">
      <div>
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800/60">
          {/* bg-blue-600 -> bg-primary */}
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <BarChart3 size={18} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-lg text-white block leading-tight">Yönetim Paneli</span>
            <span className="text-[10px] text-slate-500 font-mono uppercase">{SITE_CONFIG.shortName} Admin</span>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
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
  );
}