"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Plus, ChevronRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import NotificationBell from '@/components/NotificationBell';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function DashboardPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingReqs, setLoadingReqs] = useState(true);

  useEffect(() => {
    const fetchLatestRequests = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('print_requests')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        if (data) setRequests(data);
      }
      setLoadingReqs(false);
    };
    fetchLatestRequests();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-3 py-1 rounded-full bg-warning/10 text-warning border border-warning/20 text-xs font-medium">İnceleniyor</span>;
      case 'quoted': return <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium animate-pulse">Teklif Bekliyor</span>;
      case 'approved': return <span className="px-3 py-1 rounded-full bg-success/10 text-success border border-success/20 text-xs font-medium">Onaylandı</span>;
      case 'rejected': return <span className="px-3 py-1 rounded-full bg-danger/10 text-danger border border-danger/20 text-xs font-medium">Reddedildi</span>;
      case 'printing': return <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-medium">Üretimde</span>;
      case 'shipped': return <span className="px-3 py-1 rounded-full bg-info/10 text-info border border-info/20 text-xs font-medium">Kargoya Verildi</span>;
      case 'completed': return <span className="px-3 py-1 rounded-full bg-success/10 text-success border border-success/20 text-xs font-medium">Tamamlandı</span>;
      default: return <span className="px-3 py-1 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20 text-xs font-medium">{status}</span>;
    }
  };

  return (
    <main className="flex-1 p-6 lg:p-10 overflow-y-auto w-full">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Özet Paneli</h1>
            <p className="text-slate-400 mt-2">Siparişlerinizi ve üretim süreçlerinizi buradan takip edebilirsiniz.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Link href="/dashboard/new-request" className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary/20 w-fit">
              <Plus size={18} /> Yeni Talep
            </Link>
          </div>
        </header>

        {/* ÇAĞRI (CTA) AFİŞİ */}
        <div className="bg-gradient-to-r from-primary/30 to-surface border border-primary/30 rounded-2xl p-8 lg:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="relative z-10 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white mb-2">Yeni Bir Projeye Başlayın</h2>
            <p className="text-slate-400 max-w-lg">3D modelinizi yükleyin, malzeme tercihlerinizi belirleyin ve anında üretim sürecini başlatalım.</p>
          </div>
          <Link href="/dashboard/new-request" className="relative z-10 shrink-0 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
            <Plus size={20} /> Yeni Talep Oluştur
          </Link>
        </div>

        {/* SON SİPARİŞLER TABLOSU */}
        <div className="bg-surface border border-slate-800/60 rounded-xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800/60 flex justify-between items-center bg-surface-hover">
            <h2 className="text-lg font-bold text-white">Son Etkinlikler</h2>
            <Link href="/dashboard/orders" className="text-sm text-primary hover:text-primary-hover font-medium transition-colors">
              Tümünü Gör
            </Link>
          </div>
          
          {loadingReqs ? (
            <div className="p-10 flex justify-center text-slate-400">Yükleniyor...</div>
          ) : requests.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center mb-4 text-slate-500"><FileText size={28} /></div>
              <h3 className="text-white font-medium mb-1">Henüz hiç talep oluşturmadınız</h3>
              <Link href="/dashboard/new-request" className="mt-4 text-sm text-primary border border-primary/30 rounded-lg px-4 py-2 hover:bg-primary/10">Hemen Başla</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-hover text-slate-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">Proje Adı</th>
                    <th className="p-4 font-medium">Tarih</th>
                    <th className="p-4 font-medium">Durum</th>
                    <th className="p-4 font-medium text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-surface-hover/50 transition-colors">
                      <td className="p-4 font-medium text-white">{req.title}</td>
                      <td className="p-4 text-slate-400">{new Date(req.created_at).toLocaleDateString('tr-TR')}</td>
                      <td className="p-4">{getStatusBadge(req.status)}</td>
                      <td className="p-4 text-right">
                        <Link href={`/dashboard/orders/${req.id}`} className="inline-flex items-center gap-1 text-slate-400 hover:text-white font-medium bg-surface-hover hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors">
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
  );
}