"use client";

import React, { useState, useEffect } from 'react';
import { Plus, ChevronRight, Search, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';



export default function OrdersPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('print_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setRequests(data);
    }
    setLoading(false);
  };

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
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Tüm Siparişler</h1>
            <p className="text-slate-400 mt-2">Geçmiş ve mevcut tüm 3D baskı taleplerinizi buradan yönetin.</p>
          </div>
          <Link href="/dashboard/new-request" className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary/20 w-fit">
            <Plus size={18} /> Yeni Oluştur
          </Link>
        </header>

        {/* SİPARİŞLER TABLOSU */}
        <div className="bg-surface border border-slate-800/60 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800/60 flex items-center justify-between bg-surface-hover">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Proje adı ile ara..." 
                className="w-full bg-background border border-slate-700/60 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-10 flex justify-center text-slate-400">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-surface-hover rounded-full flex items-center justify-center mb-4 text-slate-500">
                <FileText size={32} />
              </div>
              <h3 className="text-lg text-white font-medium mb-2">Sipariş Bulunamadı</h3>
              <p className="text-slate-400 max-w-md">Henüz hiçbir siparişiniz bulunmuyor. Hemen bir tasarım yükleyerek üretime başlayabilirsiniz.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800/60">
                    <th className="p-4 font-medium">Proje Adı</th>
                    <th className="p-4 font-medium">Materyal / Adet</th>
                    <th className="p-4 font-medium">Tarih</th>
                    <th className="p-4 font-medium">Durum</th>
                    <th className="p-4 font-medium text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-surface-hover/50 transition-colors">
                      <td className="p-4 font-medium text-white">{req.title}</td>
                      <td className="p-4 text-slate-400">{req.material} <span className="mx-1 text-slate-600">x</span> {req.quantity}</td>
                      <td className="p-4 text-slate-400">{new Date(req.created_at).toLocaleDateString('tr-TR')}</td>
                      <td className="p-4">{getStatusBadge(req.status)}</td>
                      <td className="p-4 text-right">
                        <Link href={`/dashboard/orders/${req.id}`} className="inline-flex items-center gap-1 text-primary hover:text-primary-hover font-medium bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg transition-colors">
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