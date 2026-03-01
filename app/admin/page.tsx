"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, Layers, DollarSign, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRevenue: 0, pendingCount: 0, activeProduction: 0, completedCount: 0, totalRequests: 0 });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  useEffect(() => { checkAuthAndFetchData(); }, []);

  const checkAuthAndFetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.replace('/auth/login');
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return router.replace('/dashboard');
    fetchDashboardData();
  };

  const fetchDashboardData = async () => {
    try {
      const { data: requests } = await supabase.from('print_requests').select('*, quotes(*), orders(*)').order('created_at', { ascending: false });
      if (requests) {
        let revenue = 0, pending = 0, production = 0, completed = 0;
        requests.forEach(req => {
          if (req.status === 'pending') pending++;
          if (['approved', 'printing', 'shipped'].includes(req.status)) production++;
          if (req.status === 'completed') completed++;
          if (req.orders?.length > 0 && req.quotes?.length > 0) revenue += parseFloat(req.quotes[0].price);
        });
        setStats({ totalRevenue: revenue, pendingCount: pending, activeProduction: production, completedCount: completed, totalRequests: requests.length });
        setRecentRequests(requests.slice(0, 5));
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p>Yönetim paneli yükleniyor...</p>
    </div>
  );

  return (
    <main className="flex-1 p-6 lg:p-10 overflow-y-auto w-full">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">İşletme Özeti</h1>
            <p className="text-slate-400 mt-2">{SITE_CONFIG.name} sistemindeki genel durumu buradan takip edin.</p>
          </div>
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 px-4 py-2 bg-surface-hover hover:bg-slate-800 rounded-lg text-sm text-slate-300 transition-colors">
            <Home size={16} /> Müşteri Paneline Git
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface border border-slate-800/60 p-6 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20"><DollarSign size={48} className="text-success" /></div>
            <p className="text-sm font-medium text-slate-400 mb-1">Toplam Ciro</p>
            <p className="text-3xl font-bold text-white">₺{stats.totalRevenue.toLocaleString('tr-TR')}</p>
          </div>
          <div className="bg-surface border border-slate-800/60 p-6 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20"><Clock size={48} className="text-warning" /></div>
            <p className="text-sm font-medium text-slate-400 mb-1">Bekleyen</p>
            <p className="text-3xl font-bold text-white">{stats.pendingCount}</p>
          </div>
          <div className="bg-surface border border-slate-800/60 p-6 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20"><Layers size={48} className="text-primary" /></div>
            <p className="text-sm font-medium text-slate-400 mb-1">Aktif Üretim</p>
            <p className="text-3xl font-bold text-white">{stats.activeProduction}</p>
          </div>
          <div className="bg-surface border border-slate-800/60 p-6 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20"><CheckCircle size={48} className="text-success" /></div>
            <p className="text-sm font-medium text-slate-400 mb-1">Tamamlanan</p>
            <p className="text-3xl font-bold text-white">{stats.completedCount}</p>
          </div>
        </div>

        <div className="bg-surface border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800/60 flex justify-between items-center bg-surface-hover">
            <h2 className="text-lg font-bold text-white">Son Gelen Talepler</h2>
            <Link href="/admin/requests" className="flex items-center gap-1 text-sm text-primary hover:text-primary-hover transition-colors">
              Tümünü Yönet <ArrowRight size={16} />
            </Link>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800/60">
                  <th className="p-4 font-medium">Proje Adı</th>
                  <th className="p-4 font-medium">Tarih</th>
                  <th className="p-4 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {recentRequests.map(req => (
                  <tr key={req.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="p-4 font-medium text-white">{req.title}</td>
                    <td className="p-4 text-slate-400">{new Date(req.created_at).toLocaleDateString('tr-TR')}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium uppercase">{req.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}