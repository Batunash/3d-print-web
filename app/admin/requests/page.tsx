"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle, Clock, Send, Layers, 
  LogOut, Home, BarChart3, FileText as FileIcon, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  const checkAdminAndFetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.replace('/auth/login');

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return router.replace('/dashboard');

    fetchRequests();
    setIsCheckingAuth(false);
  };

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('print_requests')
      .select(`*, files ( id, storage_path, filename, filesize ), quotes (*), orders (*)`)
      .order('created_at', { ascending: false });
    if (data) setRequests(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push('/auth/login');
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center">
        <div className="w-12 h-12 mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium">Güvenli bağlantı doğrulanıyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#0d1117] text-slate-200 font-sans">
      
      {/* SOL MENÜ */}
      <aside className="w-64 bg-[#111622] border-r border-slate-800/60 flex flex-col justify-between hidden lg:flex shrink-0">
        <div>
          <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800/60">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BarChart3 size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white">Yönetim Paneli</span>
          </div>
          <nav className="p-4 space-y-2">
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-[#1a2233] rounded-lg font-medium transition-colors">
              <BarChart3 size={20} /> Özet Analiz
            </Link>
            <Link href="/admin/requests" className="flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-lg font-medium border border-blue-500/20 transition-colors">
              <FileIcon size={20} /> Gelen Talepler
            </Link>
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
              <h1 className="text-3xl font-bold text-white tracking-tight">Gelen Talepler</h1>
              <p className="text-slate-400 mt-2">Müşterilerden gelen tüm talepler.</p>
            </div>
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 px-4 py-2 bg-[#1a2233] hover:bg-slate-800 rounded-lg text-sm text-slate-300 transition-colors">
              <Home size={16} /> Müşteri Paneline Git
            </button>
          </header>

          <div className="bg-[#121824] border border-slate-800/60 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1a2233] text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800/60">
                    <th className="p-4 font-medium">Proje Adı</th>
                    <th className="p-4 font-medium">Malzeme / Renk / Adet</th>
                    <th className="p-4 font-medium">Durum</th>
                    <th className="p-4 font-medium text-right">Aksiyon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-[#1a2233]/30 transition-colors">
                      <td className="p-4 font-medium text-white">{req.title}</td>
                      <td className="p-4 text-slate-400">{req.material} - {req.color} <span className="text-slate-600 mx-1">x</span> {req.quantity}</td>
                      <td className="p-4">
                        {req.status === 'pending' && <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium flex items-center gap-1 w-max"><Clock size={12}/> Bekliyor</span>}
                        {req.status === 'quoted' && <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium flex items-center gap-1 w-max"><CheckCircle size={12}/> Teklif Verildi</span>}
                        {req.status === 'approved' && <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium flex items-center gap-1 w-max"><CheckCircle size={12}/> Onaylandı</span>}
                        {req.status === 'printing' && <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-medium flex items-center gap-1 w-max"><Layers size={12}/> Üretimde</span>}
                        {req.status === 'shipped' && <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-medium flex items-center gap-1 w-max"><Send size={12}/> Kargolandı</span>}
                        {req.status === 'completed' && <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium flex items-center gap-1 w-max"><CheckCircle size={12}/> Tamamlandı</span>}
                      </td>
                      <td className="p-4 text-right">
                        {/* ÇÖZÜM: Tıklayınca yeni detay sayfasına yönlendirir */}
                        <Link href={`/admin/requests/${req.id}`} className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors shadow-lg shadow-blue-500/20">
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
    </div>
  );
}