"use client";

import React, { useState, useEffect } from 'react';
import { Box, FileBox, Clock, Settings, LogOut, Menu, X, DollarSign, FileText, Plus, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
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

  // --- MODAL STATE'LERİ ---
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Siparişleri ve bağlı olan "teklifleri" (quotes) beraber çekiyoruz
      const { data } = await supabase
        .from('print_requests')
        .select('*, quotes(*)')
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setRequests(data);
    }
    setLoadingReqs(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push('/auth/login');
  };

  // Teklif İnceleme Modalını Aç
  const openQuoteModal = (req: any) => {
    if (req.quotes && req.quotes.length > 0) {
      setSelectedQuote({ ...req.quotes[0], request: req });
      setIsModalOpen(true);
    }
  };

  // Teklifi Onayla ve Siparişe Dönüştür
  const handleApproveQuote = async () => {
    if (!selectedQuote) return;
    setIsProcessing(true);

    try {
      // 1. Durumu Approved yap
      const { error: reqError } = await supabase
        .from('print_requests')
        .update({ status: 'approved' })
        .eq('id', selectedQuote.request_id);
      
      if (reqError) throw reqError;

      // 2. Orders tablosuna yeni siparişi ekle
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          request_id: selectedQuote.request_id,
          // Fatura numarası için basit bir rastgele kod üretiyoruz
          invoice_number: `INV-${Math.floor(Math.random() * 1000000)}` 
        });

      if (orderError) throw orderError;

      alert("Harika! Teklifi onayladınız ve siparişiniz üretime alındı.");
      setIsModalOpen(false);
      fetchRequests(); // Listeyi yenile

    } catch (error: any) {
      alert("İşlem sırasında bir hata oluştu: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Teklifi Reddet (İsteğe bağlı iptal süreci)
  const handleRejectQuote = async () => {
    if (!selectedQuote) return;
    const confirmReject = window.confirm("Bu teklifi reddetmek istediğinize emin misiniz? İşlem geri alınamaz.");
    if (!confirmReject) return;

    setIsProcessing(true);
    try {
      await supabase.from('print_requests').update({ status: 'rejected' }).eq('id', selectedQuote.request_id);
      setIsModalOpen(false);
      fetchRequests();
    } catch (error: any) {
      alert("Hata: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Rozet fonksiyonu
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium">İnceleniyor</span>;
      case 'quoted': return <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium animate-pulse">Teklif Bekliyor</span>;
      case 'approved': return <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">Onaylandı</span>;
      case 'rejected': return <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium">Reddedildi</span>;
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
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-lg font-medium border border-blue-500/20"><FileBox size={20} /> Özet Paneli</Link>
            <Link href="/dashboard/new-request" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-[#1a2233] rounded-lg font-medium"><Plus size={20} /> Yeni Talep</Link>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800/60">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg font-medium"><LogOut size={20} /> Çıkış Yap</button>
        </div>
      </aside>

      {/* ANA İÇERİK */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <header>
            <h1 className="text-3xl font-bold text-white tracking-tight">Kontrol Paneli</h1>
            <p className="text-slate-400 mt-2">Siparişlerinizi ve güncel tekliflerinizi buradan takip edebilirsiniz.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#121824] border border-slate-800/60 p-5 rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400"><FileBox size={24} /></div>
              <div><p className="text-sm text-slate-400 font-medium">Toplam Talep</p><p className="text-2xl font-bold text-white">{requests.length}</p></div>
            </div>
            <div className="bg-[#121824] border border-slate-800/60 p-5 rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400"><Clock size={24} /></div>
              <div><p className="text-sm text-slate-400 font-medium">Bekleyen Teklifler</p><p className="text-2xl font-bold text-white">{requests.filter(r => r.status === 'quoted').length}</p></div>
            </div>
          </div>

          <div className="bg-[#121824] border border-slate-800/60 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800/60 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Siparişlerim & Taleplerim</h2>
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
                      <th className="p-4 font-medium">Malzeme / Adet</th>
                      <th className="p-4 font-medium">Durum</th>
                      <th className="p-4 font-medium text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-[#1a2233]/50 transition-colors">
                        <td className="p-4 font-medium text-white">{req.title}</td>
                        <td className="p-4 text-slate-400">{new Date(req.created_at).toLocaleDateString('tr-TR')}</td>
                        <td className="p-4 text-slate-400">{req.material} <span className="text-slate-600">x</span> {req.quantity}</td>
                        <td className="p-4">{getStatusBadge(req.status)}</td>
                        <td className="p-4 text-right">
                          {req.status === 'quoted' ? (
                            <button onClick={() => openQuoteModal(req)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-medium shadow-lg shadow-blue-500/20 transition-all">
                              Teklifi İncele
                            </button>
                          ) : (
                            <button className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"><ChevronRight size={18} /></button>
                          )}
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

      {/* --- MÜŞTERİ TEKLİF İNCELEME MODALI --- */}
      {isModalOpen && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#121824] border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-800/60 bg-[#1a2233]">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><DollarSign className="text-emerald-400"/> Teklif Detayı</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-1">Toplam Tutar</p>
                <p className="text-4xl font-bold text-white">₺{selectedQuote.price}</p>
              </div>

              <div className="bg-[#1a2233] border border-slate-700 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Üretime Başlama:</span>
                  <span className="text-white font-medium">{new Date(selectedQuote.estimated_print_date).toLocaleDateString('tr-TR')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Tahmini Teslimat:</span>
                  <span className="text-white font-medium">{new Date(selectedQuote.estimated_delivery_date).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>

              {selectedQuote.notes && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
                  <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs font-semibold text-blue-400 mb-1">Admin Notu:</p>
                    <p className="text-sm text-slate-300 italic">{selectedQuote.notes}</p>
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-3">
                <button 
                  onClick={handleApproveQuote} 
                  disabled={isProcessing} 
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg py-3 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  {isProcessing ? 'İşleniyor...' : <>Teklifi Onayla ve Üretime Başla <CheckCircle size={18} /></>}
                </button>
                <button 
                  onClick={handleRejectQuote} 
                  disabled={isProcessing} 
                  className="w-full bg-transparent border border-slate-700 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-slate-400 font-medium rounded-lg py-3 transition-colors"
                >
                  Teklifi Reddet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}