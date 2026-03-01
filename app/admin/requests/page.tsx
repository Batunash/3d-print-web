"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { CheckCircle, Clock, Send, Layers, Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => { checkAdminAndFetchData(); }, []);

  const checkAdminAndFetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.replace('/auth/login');
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return router.replace('/dashboard');
    fetchRequests();
    setIsCheckingAuth(false);
  };

  const fetchRequests = async () => {
    const { data } = await supabase.from('print_requests').select('*, files (filename, storage_path), quotes (*), orders (*)').order('created_at', { ascending: false });
    if (data) setRequests(data);
  };

  if (isCheckingAuth) return (
    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
      <div className="w-12 h-12 mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <main className="flex-1 p-6 lg:p-10 overflow-y-auto w-full">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Gelen Talepler</h1>
            <p className="text-slate-400 mt-2">{SITE_CONFIG.name} sistemindeki tüm müşteri talepleri.</p>
          </div>
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 px-4 py-2 bg-surface-hover hover:bg-slate-800 rounded-lg text-sm text-slate-300 transition-colors">
            <Home size={16} /> Müşteri Paneline Git
          </button>
        </header>

        <div className="bg-surface border border-slate-800/60 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-hover text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800/60">
                  <th className="p-4 font-medium">Proje Adı</th>
                  <th className="p-4 font-medium">Malzeme / Renk / Adet</th>
                  <th className="p-4 font-medium">Durum</th>
                  <th className="p-4 font-medium text-right">Aksiyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="p-4 font-medium text-white">{req.title}</td>
                    <td className="p-4 text-slate-400">{req.material} - {req.color} <span className="text-slate-600 mx-1">x</span> {req.quantity}</td>
                    <td className="p-4">
                      {req.status === 'pending' && <span className="px-3 py-1 rounded-full bg-warning/10 text-warning border border-warning/20 text-xs font-medium flex items-center gap-1 w-max"><Clock size={12}/> Bekliyor</span>}
                      {req.status === 'quoted' && <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium flex items-center gap-1 w-max"><CheckCircle size={12}/> Teklif Verildi</span>}
                      {req.status === 'approved' && <span className="px-3 py-1 rounded-full bg-success/10 text-success border border-success/20 text-xs font-medium flex items-center gap-1 w-max"><CheckCircle size={12}/> Onaylandı</span>}
                      {req.status === 'printing' && <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-medium flex items-center gap-1 w-max"><Layers size={12}/> Üretimde</span>}
                      {req.status === 'shipped' && <span className="px-3 py-1 rounded-full bg-info/10 text-info border border-info/20 text-xs font-medium flex items-center gap-1 w-max"><Send size={12}/> Kargolandı</span>}
                      {req.status === 'completed' && <span className="px-3 py-1 rounded-full bg-success/10 text-success border border-success/20 text-xs font-medium flex items-center gap-1 w-max"><CheckCircle size={12}/> Tamamlandı</span>}
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/admin/requests/${req.id}`} className="inline-flex items-center gap-1 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors shadow-lg shadow-primary/20">
                        Detayı Yönet <ChevronRight size={16} />
                      </Link>
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