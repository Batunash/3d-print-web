"use client";

import React, { useState, useEffect } from 'react';
import { Box, FileBox, Clock, LogOut, Menu, X, FileText, Plus, ChevronRight,Settings } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function DashboardPage() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingReqs, setLoadingReqs] = useState(true);

  // Sayfa yüklendiğinde sadece "Son 5" siparişi çekiyoruz (Özet paneli olduğu için)
  useEffect(() => {
    const fetchLatestRequests = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('print_requests')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5); // Sadece son 5 kayıt
        if (data) setRequests(data);
      }
      setLoadingReqs(false);
    };
    fetchLatestRequests();
  }, []);

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
      
      <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-[#121824] border border-slate-700 rounded-md text-white shadow-lg"><Menu size={24} /></button>

      {/* SOL MENÜ */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#111622] border-r border-slate-800/60 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block flex flex-col justify-between ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <Link href="/dashboard" className="flex items-center justify-between px-6 py-6 border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20"><Box size={18} className="text-white" /></div>
              <span className="font-bold text-lg text-white">PrintCraft 3D</span>
            </div>
          </Link>
          <nav className="p-4 space-y-2">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-lg font-medium border border-blue-500/20"><Box size={20} /> Özet Paneli</Link>
            <Link href="/dashboard/orders" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-[#1a2233] rounded-lg font-medium transition-colors"><FileBox size={20} /> Tüm Siparişler</Link>
            <Link href="/dashboard/new-request" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-[#1a2233] rounded-lg font-medium transition-colors"><Plus size={20} /> Yeni Talep</Link>
            <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-[#1a2233] rounded-lg font-medium transition-colors"><Settings size={20} /> Ayarlar</Link>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800/60">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg font-medium transition-colors"><LogOut size={20} /> Çıkış Yap</button>
        </div>
      </aside>

      {/* ANA İÇERİK */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <header>
            <h1 className="text-3xl font-bold text-white tracking-tight">Hoş Geldiniz</h1>
            <p className="text-slate-400 mt-2">Siparişlerinizin genel durumunu buradan takip edebilirsiniz.</p>
          </header>

          {/* ÇAĞRI (CTA) AFİŞİ */}
          <div className="bg-gradient-to-r from-blue-900/40 to-[#121824] border border-blue-500/30 rounded-2xl p-8 lg:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="relative z-10 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-white mb-2">Yeni Bir Projeye Başlayın</h2>
              <p className="text-slate-400 max-w-lg">3D modelinizi yükleyin, malzeme tercihlerinizi belirleyin ve anında üretim sürecini başlatalım.</p>
            </div>
            <Link href="/dashboard/new-request" className="relative z-10 shrink-0 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
              <Plus size={20} /> Yeni Talep Oluştur
            </Link>
          </div>

          {/* SON SİPARİŞLER TABLOSU */}
          <div className="bg-[#121824] border border-slate-800/60 rounded-xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800/60 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Son Etkinlikler</h2>
              <Link href="/dashboard/orders" className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Tümünü Gör
              </Link>
            </div>
            
            {loadingReqs ? (
              <div className="p-10 flex justify-center text-slate-400">Yükleniyor...</div>
            ) : requests.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 text-slate-500"><FileText size={28} /></div>
                <h3 className="text-white font-medium mb-1">Henüz hiç talep oluşturmadınız</h3>
                <Link href="/dashboard/new-request" className="mt-4 text-sm text-blue-400 border border-blue-500/30 rounded-lg px-4 py-2 hover:bg-blue-500/10">Hemen Başla</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1a2233] text-slate-400 text-xs uppercase tracking-wider">
                      <th className="p-4 font-medium">Proje Adı</th>
                      <th className="p-4 font-medium">Tarih</th>
                      <th className="p-4 font-medium">Durum</th>
                      <th className="p-4 font-medium text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-[#1a2233]/50 transition-colors">
                        <td className="p-4 font-medium text-white">{req.title}</td>
                        <td className="p-4 text-slate-400">{new Date(req.created_at).toLocaleDateString('tr-TR')}</td>
                        <td className="p-4">{getStatusBadge(req.status)}</td>
                        <td className="p-4 text-right">
                          <Link href={`/dashboard/orders/${req.id}`} className="inline-flex items-center gap-1 text-slate-400 hover:text-white font-medium bg-slate-800/50 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors">
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