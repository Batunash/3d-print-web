"use client";

import React, { useState, useEffect } from 'react';
import { Box, FileBox, LogOut, Menu, Plus, Settings, ChevronRight, Search, FileText } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function OrdersPage() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Tüm siparişleri çekiyoruz (Limit yok)
      const { data } = await supabase
        .from('print_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setRequests(data);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push('/auth/login');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium">İnceleniyor</span>;
      case 'quoted': return <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium animate-pulse">Teklif Bekliyor</span>;
      case 'approved': return <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">Onaylandı</span>;
      case 'rejected': return <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium">Reddedildi</span>;
      case 'printing': return <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-medium">Üretimde</span>;
      case 'shipped': return <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-medium">Kargoya Verildi</span>;
      case 'completed': return <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">Tamamlandı</span>;
      default: return <span className="px-3 py-1 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20 text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0d1117] text-slate-200 font-sans">
      
      {/* Mobil Menü Butonu */}
      <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-[#121824] border border-slate-700 rounded-md text-white shadow-lg">
        <Menu size={24} />
      </button>

      {/* SOL MENÜ (Güncellenmiş, Ayarlar ve Çıkış Yap eklenmiş hali) */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#111622] border-r border-slate-800/60 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block flex flex-col justify-between ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <Link href="/dashboard" className="flex items-center justify-between px-6 py-6 border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Box size={18} className="text-white" />
              </div>
              <span className="font-bold text-lg text-white">PrintCraft 3D</span>
            </div>
          </Link>
          <nav className="p-4 space-y-2">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-[#1a2233] rounded-lg font-medium transition-colors">
              <Box size={20} /> Özet Paneli
            </Link>
            {/* Aktif Menü Burası (Mavi Yanan Kısım) */}
            <Link href="/dashboard/orders" className="flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-lg font-medium border border-blue-500/20">
              <FileBox size={20} /> Tüm Siparişler
            </Link>
            <Link href="/dashboard/new-request" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-[#1a2233] rounded-lg font-medium transition-colors">
              <Plus size={20} /> Yeni Talep
            </Link>
            <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-[#1a2233] rounded-lg font-medium transition-colors">
              <Settings size={20} /> Ayarlar
            </Link>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800/60">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg font-medium transition-colors">
            <LogOut size={20} /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* ANA İÇERİK */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto" onClick={() => setIsMobileMenuOpen(false)}>
        <div className="max-w-6xl mx-auto space-y-8">
          
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Tüm Siparişler</h1>
              <p className="text-slate-400 mt-2">Geçmiş ve mevcut tüm 3D baskı taleplerinizi buradan yönetin.</p>
            </div>
            <Link href="/dashboard/new-request" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 w-fit">
              <Plus size={18} /> Yeni Oluştur
            </Link>
          </header>

          {/* SİPARİŞLER TABLOSU */}
          <div className="bg-[#121824] border border-slate-800/60 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800/60 flex items-center justify-between bg-[#1a2233]">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Proje adı ile ara..." 
                  className="w-full bg-[#0d1117] border border-slate-700/60 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-10 flex justify-center text-slate-400">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : requests.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 text-slate-500">
                  <FileText size={32} />
                </div>
                <h3 className="text-lg text-white font-medium mb-2">Sipariş Bulunamadı</h3>
                <p className="text-slate-400 max-w-md">Henüz hiçbir siparişiniz bulunmuyor. Hemen bir tasarım yükleyerek üretime başlayabilirsiniz.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#121824] text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800/60">
                      <th className="p-4 font-medium">Proje Adı</th>
                      <th className="p-4 font-medium">Materyal / Adet</th>
                      <th className="p-4 font-medium">Tarih</th>
                      <th className="p-4 font-medium">Durum</th>
                      <th className="p-4 font-medium text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-[#1a2233]/50 transition-colors">
                        <td className="p-4 font-medium text-white">{req.title}</td>
                        <td className="p-4 text-slate-400">{req.material} <span className="mx-1 text-slate-600">x</span> {req.quantity}</td>
                        <td className="p-4 text-slate-400">{new Date(req.created_at).toLocaleDateString('tr-TR')}</td>
                        <td className="p-4">{getStatusBadge(req.status)}</td>
                        <td className="p-4 text-right">
                          <Link href={`/dashboard/orders/${req.id}`} className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg transition-colors">
                            Detay <ChevronRight size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}