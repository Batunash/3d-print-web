"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Download, CheckCircle, Clock, Search, Send, ShieldAlert, X, DollarSign, Calendar, FileText as FileIcon, Layers, Info } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [adminId, setAdminId] = useState<string | null>(null);

  // --- MODAL STATE'LERİ ---
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  
  // Teklif Formu State'leri
  const [price, setPrice] = useState('');
  const [printDate, setPrintDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  const checkAdminAndFetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.replace('/auth/login');

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return router.replace('/dashboard');

    setAdminId(user.id);
    fetchRequests();
    setIsCheckingAuth(false);
  };

  const fetchRequests = async () => {
    // YENİ: quotes (teklifler) tablosunu da çekiyoruz ki detayda görebilelim
    const { data } = await supabase
      .from('print_requests')
      .select(`
        *, 
        files ( id, storage_path, filename, filesize ),
        quotes (*) 
      `)
      .order('created_at', { ascending: false });
    if (data) setRequests(data);
  };

  // YENİ: Güvenli API üzerinden dosya indirme
  const downloadFile = async (storagePath: string) => {
    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storagePath })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      // Gelen güvenli linki yeni sekmede aç
      window.open(data.signedUrl, '_blank');
    } catch (err: any) {
      alert("Dosya indirilemedi: " + err.message);
    }
  };

  const openQuoteModal = (req: any) => {
    setSelectedRequest(req);
    setPrice(''); setPrintDate(''); setDeliveryDate(''); setNotes('');
    setIsQuoteModalOpen(true);
  };

  const openDetailModal = (req: any) => {
    setSelectedRequest(req);
    setIsDetailModalOpen(true);
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !adminId) return;
    setIsSubmitting(true);

    try {
      const { error: quoteError } = await supabase.from('quotes').insert({
        request_id: selectedRequest.id,
        admin_id: adminId,
        price: parseFloat(price),
        estimated_print_date: printDate,
        estimated_delivery_date: deliveryDate,
        notes: notes
      });
      if (quoteError) throw quoteError;

      const { error: updateError } = await supabase.from('print_requests').update({ status: 'quoted' }).eq('id', selectedRequest.id);
      if (updateError) throw updateError;

      setIsQuoteModalOpen(false);
      fetchRequests();
    } catch (error: any) {
      alert("Teklif oluşturulurken hata: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center">
        <div className="w-12 h-12 mb-4 relative">
          <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-400 font-medium">Güvenli bağlantı doğrulanıyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 font-sans p-6 lg:p-10 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded uppercase tracking-widest font-bold">Admin</span>
              Gelen Talepler
            </h1>
          </div>
        </header>

        <div className="bg-[#121824] border border-slate-800/60 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1a2233] text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800/60">
                  <th className="p-4 font-medium">Proje Adı</th>
                  <th className="p-4 font-medium">Malzeme/Adet</th>
                  <th className="p-4 font-medium">Dosya</th>
                  <th className="p-4 font-medium">Durum</th>
                  <th className="p-4 font-medium text-right">Aksiyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {requests.map((req) => {
                  const file = req.files && req.files.length > 0 ? req.files[0] : null;
                  return (
                    <tr key={req.id} className="hover:bg-[#1a2233]/30 transition-colors">
                      <td className="p-4 font-medium text-white">{req.title}</td>
                      <td className="p-4 text-slate-400">{req.material} <span className="text-slate-600 mx-1">x</span> {req.quantity}</td>
                      <td className="p-4">
                        {file ? (
                          <button onClick={() => downloadFile(file.storage_path)} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 text-xs font-medium transition-colors">
                            <Download size={14} /> İndir
                          </button>
                        ) : <span className="text-slate-500 text-xs italic">Dosya Yok</span>}
                      </td>
                      <td className="p-4">
                        {req.status === 'pending' && <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium flex items-center gap-1 w-max"><Clock size={12}/> Bekliyor</span>}
                        {req.status === 'quoted' && <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium flex items-center gap-1 w-max"><CheckCircle size={12}/> Teklif Verildi</span>}
                        {req.status === 'approved' && <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium flex items-center gap-1 w-max"><CheckCircle size={12}/> Onaylandı</span>}
                        {req.status === 'rejected' && <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium flex items-center gap-1 w-max"><CheckCircle size={12}/> Reddedildi</span>}
                      </td>
                      <td className="p-4 text-right">
                        {req.status === 'pending' ? (
                          <button onClick={() => openQuoteModal(req)} className="flex items-center gap-2 justify-end ml-auto bg-white text-slate-900 hover:bg-slate-200 px-4 py-2 rounded-lg font-medium transition-colors text-xs shadow-md">
                            Teklif Ver <Send size={14} />
                          </button>
                        ) : (
                          <button onClick={() => openDetailModal(req)} className="text-blue-400 hover:text-blue-300 transition-colors underline text-xs font-medium cursor-pointer">
                            Detayı Gör
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- 1. TEKLİF VERME MODALI --- */}
      {isQuoteModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#121824] border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-800/60 bg-[#1a2233]">
              <h2 className="text-xl font-bold text-white">Teklif Oluştur</h2>
              <button onClick={() => setIsQuoteModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleQuoteSubmit} className="p-6 space-y-5 overflow-y-auto">
              {/* Form alanları bir öncekiyle aynı... */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2"><DollarSign size={16} className="text-emerald-400"/> Fiyat (TL)</label>
                <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Örn: 1500" className="w-full bg-[#1a2233] border border-slate-700/60 rounded-lg py-3 px-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300 flex items-center gap-2"><Calendar size={16} className="text-blue-400"/> Üretime Başlama</label>
                  <input type="date" required value={printDate} onChange={(e) => setPrintDate(e.target.value)} className="w-full bg-[#1a2233] border border-slate-700/60 rounded-lg py-3 px-4 text-slate-300 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300 flex items-center gap-2"><Calendar size={16} className="text-blue-400"/> Tahmini Teslim</label>
                  <input type="date" required value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="w-full bg-[#1a2233] border border-slate-700/60 rounded-lg py-3 px-4 text-slate-300 outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2"><FileIcon size={16} className="text-amber-400"/> Müşteriye Not (Opsiyonel)</label>
                <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-[#1a2233] border border-slate-700/60 rounded-lg py-3 px-4 text-white outline-none resize-none" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsQuoteModalOpen(false)} className="flex-1 border border-slate-700 hover:bg-slate-800 text-white py-3 rounded-lg">İptal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg">{isSubmitting ? 'Gönderiliyor...' : 'Teklifi Gönder'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- 2. DETAY GÖSTERME MODALI --- */}
      {isDetailModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#121824] border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-800/60 bg-[#1a2233]">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Info className="text-blue-400"/> Sipariş Detayları</h2>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </div>

            <div className="p-6 space-y-6">
              {/* Kullanıcı Notu ve Açıklamalar */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-2">Proje Bilgileri</h3>
                <div className="bg-[#1a2233] border border-slate-700 rounded-lg p-4 space-y-2">
                  <p><span className="text-slate-500">Proje Adı:</span> <span className="text-white font-medium">{selectedRequest.title}</span></p>
                  <p><span className="text-slate-500">Açıklama:</span> <span className="text-slate-300">{selectedRequest.description || "Açıklama girilmemiş."}</span></p>
                  <div className="pt-2 flex gap-4 border-t border-slate-700/50 mt-2">
                    <p><span className="text-slate-500">Materyal:</span> <span className="text-white">{selectedRequest.material}</span></p>
                    <p><span className="text-slate-500">Adet:</span> <span className="text-white">{selectedRequest.quantity}</span></p>
                  </div>
                </div>
              </div>

              {/* Eğer Teklif Verildiyse Göster */}
              {selectedRequest.quotes && selectedRequest.quotes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-2">Verilen Teklif</h3>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 space-y-2">
                    <p className="flex justify-between"><span className="text-slate-400">Fiyat:</span> <span className="text-emerald-400 font-bold text-lg">₺{selectedRequest.quotes[0].price}</span></p>
                    <p className="flex justify-between"><span className="text-slate-400">Üretime Başlama:</span> <span className="text-white">{new Date(selectedRequest.quotes[0].estimated_print_date).toLocaleDateString('tr-TR')}</span></p>
                    <p className="flex justify-between"><span className="text-slate-400">Teslim Tarihi:</span> <span className="text-white">{new Date(selectedRequest.quotes[0].estimated_delivery_date).toLocaleDateString('tr-TR')}</span></p>
                    {selectedRequest.quotes[0].notes && (
                      <div className="mt-3 pt-3 border-t border-emerald-500/10">
                        <span className="text-slate-500 text-xs">Admin Notu:</span>
                        <p className="text-sm text-slate-300 mt-1">{selectedRequest.quotes[0].notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button onClick={() => setIsDetailModalOpen(false)} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg py-3 transition-colors">
                Kapat
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}