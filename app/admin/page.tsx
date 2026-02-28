"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, Clock, CheckCircle, Layers, 
  DollarSign, ArrowRight, Home, LogOut, FileText 
} from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // İstatistik State'leri
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingCount: 0,
    activeProduction: 0,
    completedCount: 0,
    totalRequests: 0
  });

  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.replace('/auth/login');

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return router.replace('/dashboard');

    fetchDashboardData();
  };

  const fetchDashboardData = async () => {
    try {
      // 1. Tüm talepleri ve bağlı teklifleri/siparişleri çek
      const { data: requests } = await supabase
        .from('print_requests')
        .select('*, quotes(*), orders(*)')
        .order('created_at', { ascending: false });

      if (requests) {
        let revenue = 0;
        let pending = 0;
        let production = 0;
        let completed = 0;

        requests.forEach(req => {
          // Durum sayıları
          if (req.status === 'pending') pending++;
          if (['approved', 'printing', 'shipped'].includes(req.status)) production++;
          if (req.status === 'completed') completed++;

          // Ciro hesaplama (Eğer sipariş onaylandıysa ve teklif varsa fiyata ekle)
          if (req.orders && req.orders.length > 0 && req.quotes && req.quotes.length > 0) {
            revenue += parseFloat(req.quotes[0].price);
          }
        });

        setStats({
          totalRevenue: revenue,
          pendingCount: pending,
          activeProduction: production,
          completedCount: completed,
          totalRequests: requests.length
        });

        // Son 5 talebi tablo için ayır
        setRecentRequests(requests.slice(0, 5));
      }
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push('/auth/login');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center text-slate-400">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p>Yönetim paneli yükleniyor...</p>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#0d1117] text-slate-200 font-sans">
      
      {/* SOL MENÜ (ADMİN SİDEBAR) - EKSİKSİZ VE TUTARLI */}
      <aside className="w-64 bg-[#111622] border-r border-slate-800/60 flex flex-col justify-between hidden lg:flex shrink-0">
        <div>
          <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800/60">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BarChart3 size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white">Yönetim Paneli</span>
          </div>
          <nav className="p-4 space-y-2">
            {/* Aktif sekme: Özet Analiz */}
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-lg font-medium border border-blue-500/20 transition-colors">
              <BarChart3 size={20} /> Özet Analiz
            </Link>
            <Link href="/admin/requests" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-[#1a2233] rounded-lg font-medium transition-colors">
              <FileText size={20} /> Gelen Talepler
            </Link>
            {/* Eklenen Yeni Link */}
            <Link href="/admin/materials" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-[#1a2233] rounded-lg font-medium transition-colors">
              <Layers size={20} /> Malzeme & Renkler
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
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">İşletme Özeti</h1>
              <p className="text-slate-400 mt-2">Sistemdeki genel üretim ve finansal durumu buradan takip edin.</p>
            </div>
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 px-4 py-2 bg-[#1a2233] hover:bg-slate-800 rounded-lg text-sm text-slate-300 transition-colors">
              <Home size={16} /> Müşteri Paneline Git
            </button>
          </header>

          {/* İSTATİSTİK KARTLARI */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#121824] border border-slate-800/60 p-6 rounded-2xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20"><DollarSign size={48} className="text-emerald-500" /></div>
              <p className="text-sm font-medium text-slate-400 mb-1">Toplam Ciro (Onaylanan)</p>
              <p className="text-3xl font-bold text-white">₺{stats.totalRevenue.toLocaleString('tr-TR')}</p>
            </div>

            <div className="bg-[#121824] border border-slate-800/60 p-6 rounded-2xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20"><Clock size={48} className="text-amber-500" /></div>
              <p className="text-sm font-medium text-slate-400 mb-1">Bekleyen Talepler</p>
              <p className="text-3xl font-bold text-white">{stats.pendingCount}</p>
            </div>

            <div className="bg-[#121824] border border-slate-800/60 p-6 rounded-2xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20"><Layers size={48} className="text-indigo-500" /></div>
              <p className="text-sm font-medium text-slate-400 mb-1">Aktif Üretim/Kargo</p>
              <p className="text-3xl font-bold text-white">{stats.activeProduction}</p>
            </div>

            <div className="bg-[#121824] border border-slate-800/60 p-6 rounded-2xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20"><CheckCircle size={48} className="text-emerald-500" /></div>
              <p className="text-sm font-medium text-slate-400 mb-1">Tamamlanan İşler</p>
              <p className="text-3xl font-bold text-white">{stats.completedCount}</p>
            </div>
          </div>

          {/* HIZLI ERİŞİM & SON TALEPLER */}
          <div className="bg-[#121824] border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800/60 flex justify-between items-center bg-[#1a2233]">
              <h2 className="text-lg font-bold text-white">Son Gelen Talepler</h2>
              <Link href="/admin/requests" className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Tümünü Yönet <ArrowRight size={16} />
              </Link>
            </div>
            
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#121824] text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800/60">
                    <th className="p-4 font-medium">Proje Adı</th>
                    <th className="p-4 font-medium">Tarih</th>
                    <th className="p-4 font-medium">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {recentRequests.length === 0 ? (
                    <tr><td colSpan={3} className="p-8 text-center text-slate-500">Henüz talep yok.</td></tr>
                  ) : (
                    recentRequests.map(req => (
                      <tr key={req.id} className="hover:bg-[#1a2233]/30 transition-colors">
                        <td className="p-4 font-medium text-white">{req.title}</td>
                        <td className="p-4 text-slate-400">{new Date(req.created_at).toLocaleDateString('tr-TR')}</td>
                        <td className="p-4">
                          <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium uppercase">
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}