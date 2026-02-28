"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { 
  Download, CheckCircle, Clock, Search, Send, ShieldAlert, X, 
  DollarSign, Calendar, FileText as FileIcon, Layers, Info, 
  LogOut, Home, MapPin, Phone 
} from 'lucide-react';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [adminId, setAdminId] = useState<string | null>(null);

  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  
  const [price, setPrice] = useState('');
  const [printDate, setPrintDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Geçmiş tarih seçilmesini engellemek için bugünün tarihi
  const today = new Date().toISOString().split('T')[0];

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
    const { data } = await supabase
      .from('print_requests')
      .select(`*, files ( id, storage_path, filename, filesize ), quotes (*), orders (*)`)
      .order('created_at', { ascending: false });
    if (data) setRequests(data);
  };

  const downloadFile = async (storagePath: string) => {
    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storagePath })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push('/auth/login');
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('print_requests').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      fetchRequests();
      setIsDetailModalOpen(false);
    } catch (err: any) {
      alert("Durum güncellenirken hata: " + err.message);
    }
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !adminId) return;
    
    // Güvenlik: Negatif fiyat engeli
    if (parseFloat(price) < 0) {
      alert("Fiyat 0'dan küçük olamaz!");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Teklifi veritabanına ekle
      const { error: quoteError } = await supabase.from('quotes').insert({
        request_id: selectedRequest.id, admin_id: adminId, price: parseFloat(price),
        estimated_print_date: printDate, estimated_delivery_date: deliveryDate, notes: notes
      });
      if (quoteError) throw quoteError;
      
      // 2. Talebin durumunu güncelle
      const { error: updateError } = await supabase.from('print_requests').update({ status: 'quoted' }).eq('id', selectedRequest.id);
      if (updateError) throw updateError;
      
      // 3. E-POSTA GÖNDERİMİ (RESEND)
     try {
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: selectedRequest.user_id, // Sadece ID'yi yolluyoruz, e-postayı arka plan bulacak!
            subject: 'PrintCraft 3D: Projeniz İçin Yeni Bir Teklifiniz Var! 🚀',
            type: 'quote_ready',
            data: {
              projectName: selectedRequest.title,
              price: price
            }
          })
        });
      } catch (mailErr) {
        console.error("Mail gönderilemedi, ama teklif oluşturuldu.", mailErr);
      }
      
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

  const orderDetails = selectedRequest?.orders && selectedRequest.orders.length > 0 ? selectedRequest.orders[0] : null;

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
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border border-blue-500/20 rounded-lg text-sm font-medium transition-colors">
              Özet Analiz
            </Link>
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 px-4 py-2 bg-[#1a2233] hover:bg-slate-800 rounded-lg text-sm text-slate-300 transition-colors">
              <Home size={16} /> Müşteri Paneli
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors">
              <LogOut size={16} /> Çıkış
            </button>
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
                        {req.status === 'printing' && <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-medium flex items-center gap-1 w-max"><Layers size={12}/> Üretimde</span>}
                        {req.status === 'shipped' && <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-medium flex items-center gap-1 w-max"><Send size={12}/> Kargolandı</span>}
                        {req.status === 'completed' && <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium flex items-center gap-1 w-max"><CheckCircle size={12}/> Tamamlandı</span>}
                      </td>
                      <td className="p-4 text-right">
                        {req.status === 'pending' ? (
                          <button onClick={() => openQuoteModal(req)} className="flex items-center gap-2 justify-end ml-auto bg-white text-slate-900 hover:bg-slate-200 px-4 py-2 rounded-lg font-medium transition-colors text-xs shadow-md">
                            Teklif Ver <Send size={14} />
                          </button>
                        ) : (
                          <button onClick={() => openDetailModal(req)} className="text-blue-400 hover:text-blue-300 transition-colors underline text-xs font-medium cursor-pointer">
                            Detayı Gör & Yönet
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

      {/* --- TEKLİF VERME MODALI --- */}
      {isQuoteModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#121824] border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-800/60 bg-[#1a2233]">
              <h2 className="text-xl font-bold text-white">Teklif Oluştur</h2>
              <button onClick={() => setIsQuoteModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleQuoteSubmit} className="p-6 space-y-5 overflow-y-auto">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2"><DollarSign size={16} className="text-emerald-400"/> Fiyat (TL)</label>
                <input type="number" min="0" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Örn: 1500" className="w-full bg-[#1a2233] border border-slate-700/60 rounded-lg py-3 px-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300 flex items-center gap-2"><Calendar size={16} className="text-blue-400"/> Üretime Başlama</label>
                  <input type="date" min={today} required value={printDate} onChange={(e) => setPrintDate(e.target.value)} className="w-full bg-[#1a2233] border border-slate-700/60 rounded-lg py-3 px-4 text-slate-300 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300 flex items-center gap-2"><Calendar size={16} className="text-blue-400"/> Tahmini Teslim</label>
                  <input type="date" min={printDate || today} required value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="w-full bg-[#1a2233] border border-slate-700/60 rounded-lg py-3 px-4 text-slate-300 outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2"><FileIcon size={16} className="text-amber-400"/> Müşteriye Not (Opsiyonel)</label>
                <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-[#1a2233] border border-slate-700/60 rounded-lg py-3 px-4 text-white outline-none resize-none" />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsQuoteModalOpen(false)} className="flex-1 border border-slate-700 hover:bg-slate-800 text-white py-3 rounded-lg transition-colors">İptal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg transition-colors">{isSubmitting ? 'Gönderiliyor...' : 'Teklifi Gönder'}</button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- DETAY VE YÖNETİM MODALI --- */}
      {isDetailModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#121824] border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-800/60 bg-[#1a2233] shrink-0 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Info className="text-blue-400"/> Sipariş Yönetimi</h2>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
              
              {/* Teslimat Bilgileri (Müşteri Onayladıysa Görünür) */}
              {orderDetails && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2"><MapPin size={16} className="text-amber-400"/> Teslimat Bilgileri</h3>
                  <div className="bg-[#1a2233] border border-slate-700 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-slate-500 mt-0.5 shrink-0" />
                      <p className="text-white text-sm whitespace-pre-line">{orderDetails.shipping_address}</p>
                    </div>
                    <div className="flex items-center gap-3 pt-3 border-t border-slate-700/50">
                      <Phone size={18} className="text-slate-500 shrink-0" />
                      <p className="text-white text-sm font-medium">{orderDetails.contact_phone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Proje Bilgileri */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2"><FileIcon size={16} className="text-blue-400"/> Proje Bilgileri</h3>
                <div className="bg-[#1a2233] border border-slate-700 rounded-lg p-4 space-y-2 text-sm">
                  <p className="flex justify-between"><span className="text-slate-500">Proje Adı:</span> <span className="text-white font-medium">{selectedRequest.title}</span></p>
                  <div className="pt-2 flex justify-between border-t border-slate-700/50 mt-2">
                    <p><span className="text-slate-500">Materyal:</span> <span className="text-white ml-1">{selectedRequest.material}</span></p>
                    <p><span className="text-slate-500">Adet:</span> <span className="text-white ml-1">{selectedRequest.quantity}</span></p>
                  </div>
                  {selectedRequest.description && (
                    <div className="pt-3 border-t border-slate-700/50 mt-2">
                      <span className="text-slate-500 block mb-1">Müşteri Açıklaması:</span>
                      <span className="text-slate-300">{selectedRequest.description}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Verilen Teklif */}
              {selectedRequest.quotes && selectedRequest.quotes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2"><DollarSign size={16} className="text-emerald-400"/> Verilen Teklif</h3>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 space-y-2 text-sm">
                    <p className="flex justify-between"><span className="text-slate-400">Fiyat:</span> <span className="text-emerald-400 font-bold text-lg">₺{selectedRequest.quotes[0].price}</span></p>
                    <p className="flex justify-between"><span className="text-slate-400">Üretime Başlama:</span> <span className="text-white">{new Date(selectedRequest.quotes[0].estimated_print_date).toLocaleDateString('tr-TR')}</span></p>
                    <p className="flex justify-between"><span className="text-slate-400">Teslim Tarihi:</span> <span className="text-white">{new Date(selectedRequest.quotes[0].estimated_delivery_date).toLocaleDateString('tr-TR')}</span></p>
                  </div>
                </div>
              )}

              {/* Sipariş Durumunu İlerletme Butonları */}
              {['approved', 'printing', 'shipped'].includes(selectedRequest.status) && (
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <h3 className="text-sm font-semibold text-slate-400 mb-3">Siparişi İlerlet</h3>
                  <div className="flex gap-2">
                    {selectedRequest.status === 'approved' && (
                      <button onClick={() => updateStatus(selectedRequest.id, 'printing')} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg text-sm font-medium transition-colors">Üretime Başla</button>
                    )}
                    {selectedRequest.status === 'printing' && (
                      <button onClick={() => updateStatus(selectedRequest.id, 'shipped')} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-lg text-sm font-medium transition-colors">Kargoya Ver</button>
                    )}
                    {selectedRequest.status === 'shipped' && (
                      <button onClick={() => updateStatus(selectedRequest.id, 'completed')} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg text-sm font-medium transition-colors">Tamamlandı İşaretle</button>
                    )}
                  </div>
                </div>
              )}

              <button onClick={() => setIsDetailModalOpen(false)} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg py-3 transition-colors mt-2">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}