"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, DollarSign, CheckCircle, Clock, Package, 
  FileText, AlertCircle, Truck, Box, MapPin, Phone, Building 
} from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modalsız (Inline) Form State'leri
  const [isAcceptingQuote, setIsAcceptingQuote] = useState(false);
  
  // YENİ: Detaylı Adres ve Telefon State'leri
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  useEffect(() => {
    if (params.id) fetchDetail();
  }, [params.id]);

  const fetchDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('print_requests')
        .select('*, quotes(*), files(filename, filesize)')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setRequest(data);
    } catch (error: any) {
      console.error("Detay yükleme hatası:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // YENİ: Telefon numarasında sadece rakamlara izin veren fonksiyon
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNumbers = e.target.value.replace(/\D/g, ''); // Harfleri ve sembolleri siler
    setContactPhone(onlyNumbers);
  };

  const handleFinalApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basit Telefon Validasyonu
    if (contactPhone.length < 10) {
      alert("Lütfen geçerli bir telefon numarası giriniz. (Örn: 05551234567)");
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Talebi 'approved' yap
      const { error: updateError } = await supabase.from('print_requests').update({ status: 'approved' }).eq('id', request.id);
      if (updateError) throw updateError;

      // 2. Adresi birleştirip tek bir metin haline getiriyoruz
      const fullShippingAddress = `${addressDetail}\n${district} / ${city}`;

      // 3. Orders tablosuna kayıt atıyoruz
      const { error: orderError } = await supabase.from('orders').insert({ 
        request_id: request.id, 
        invoice_number: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
        shipping_address: fullShippingAddress,
        contact_phone: contactPhone
      });
      if (orderError) throw orderError;

      setIsAcceptingQuote(false);
      alert("Harika! Siparişiniz başarıyla oluşturuldu ve üretime alındı.");
      fetchDetail(); 
    } catch (error: any) {
      alert("İşlem sırasında bir hata oluştu: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!window.confirm('Bu talebi iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;
    try {
      await supabase.from('print_requests').delete().eq('id', request.id);
      router.push('/dashboard/orders');
    } catch (error: any) {
      alert("Hata: " + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, React.ReactNode> = {
      pending: <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium">İnceleniyor</span>,
      quoted: <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium animate-pulse">Teklif Geldi</span>,
      approved: <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">Onaylandı</span>,
      printing: <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-medium italic">Üretiliyor</span>,
      shipped: <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-medium flex items-center gap-1"><Truck size={12}/> Kargoda</span>,
      completed: <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">Tamamlandı</span>,
      rejected: <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium">Reddedildi</span>
    };
    return badges[status] || <span>{status}</span>;
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center text-slate-400 gap-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p>Sipariş detayları yükleniyor...</p>
    </div>
  );

  if (!request) return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center text-slate-400">
      <AlertCircle size={48} className="mb-4 text-red-500" />
      <p>Sipariş bulunamadı veya erişim yetkiniz yok.</p>
      <Link href="/dashboard/orders" className="mt-4 text-blue-400 hover:underline">Siparişlerime dön</Link>
    </div>
  );

  const activeQuote = request.quotes && request.quotes.length > 0 ? request.quotes[0] : null;

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 font-sans p-6 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/orders" className="p-2 bg-[#121824] hover:bg-[#1a2233] border border-slate-800 rounded-lg transition-colors group">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-white" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Sipariş Detayı</h1>
              <p className="text-sm text-slate-500 font-mono uppercase">ID: {request.id.split('-')[0]}...</p>
            </div>
          </div>
          {getStatusBadge(request.status)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sol Kolon */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-[#121824] border border-slate-800/60 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <FileText size={20} className="text-blue-500" /> Proje Özeti
              </h2>
              <div className="grid grid-cols-2 gap-y-6">
                <div><label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Proje Adı</label><p className="text-white font-medium">{request.title}</p></div>
                <div><label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Tarih</label><p className="text-white font-medium">{new Date(request.created_at).toLocaleDateString('tr-TR')}</p></div>
                <div><label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Materyal</label><p className="text-slate-300 font-medium px-2 py-0.5 bg-slate-800 rounded w-fit">{request.material}</p></div>
                <div><label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Adet</label><p className="text-white font-medium">{request.quantity} parça</p></div>
              </div>
              {request.description && (
                <div className="mt-8 pt-6 border-t border-slate-800/60">
                  <label className="text-xs text-slate-500 uppercase tracking-wider block mb-2">Açıklama / Notlar</label>
                  <p className="text-slate-400 text-sm leading-relaxed">{request.description}</p>
                </div>
              )}
            </section>

            <section className="bg-[#121824] border border-slate-800/60 rounded-2xl p-6 shadow-xl">
               <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Box size={20} className="text-blue-500" /> 3D Model Dosyası
              </h2>
              <div className="flex items-center gap-4 bg-[#0d1117] p-4 rounded-xl border border-slate-800">
                <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center"><Package size={24} className="text-blue-500" /></div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-white font-medium truncate">{request.files?.filename || "model_dosyasi.stl"}</p>
                  <p className="text-xs text-slate-500 uppercase">Hazır - STL / OBJ</p>
                </div>
              </div>
            </section>
          </div>

          {/* Sağ Kolon (Form Burada) */}
          <div className="space-y-6">
            {activeQuote ? (
              <section className={`bg-gradient-to-b from-[#1a2233] to-[#121824] border ${request.status === 'quoted' ? 'border-blue-500/30 ring-1 ring-blue-500/20' : 'border-slate-800'} rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all duration-300`}>
                <div className="absolute top-0 right-0 p-4"><DollarSign size={40} className="text-blue-500/10 -rotate-12" /></div>
                
                <h2 className="text-lg font-semibold text-white mb-4">Üretim Teklifi</h2>
                <div className="mb-6">
                  <span className="text-sm text-slate-400 block mb-1">Toplam Tutar</span>
                  <div className="text-4xl font-bold text-white flex items-baseline gap-1">
                    <span className="text-2xl text-blue-500">₺</span>{activeQuote.price}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-sm text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                    <Clock size={16} className="text-blue-400" />
                    <span>Teslimat: <b>{new Date(activeQuote.estimated_delivery_date).toLocaleDateString('tr-TR')}</b></span>
                  </div>
                </div>

                {request.status === 'quoted' ? (
                  !isAcceptingQuote ? (
                    <button 
                      onClick={() => setIsAcceptingQuote(true)}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 group"
                    >
                      Teklifi Değerlendir <CheckCircle size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                  ) : (
                    <form onSubmit={handleFinalApprove} className="mt-4 pt-4 border-t border-slate-700/50 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3"><Truck size={16} className="text-amber-400"/> Teslimat Bilgileri</h3>
                      
                      {/* YENİ: İl ve İlçe Yan Yana */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400 uppercase tracking-wider flex items-center gap-1"><Building size={10}/> İl</label>
                          <input required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Örn: Ankara" className="w-full bg-[#0d1117] border border-slate-700/60 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400 uppercase tracking-wider flex items-center gap-1"><MapPin size={10}/> İlçe</label>
                          <input required value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Örn: Çankaya" className="w-full bg-[#0d1117] border border-slate-700/60 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 uppercase tracking-wider">Açık Adres (Mahalle, Sokak, No)</label>
                        <textarea required rows={3} value={addressDetail} onChange={(e) => setAddressDetail(e.target.value)} className="w-full bg-[#0d1117] border border-slate-700/60 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none resize-none" placeholder="Örn: Kavaklıdere Mah. Tunalı Hilmi Cad. No:1 D:2..." />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 uppercase tracking-wider flex items-center gap-1"><Phone size={10}/> Telefon Numarası</label>
                        <input type="tel" required maxLength={11} value={contactPhone} onChange={handlePhoneChange} className="w-full bg-[#0d1117] border border-slate-700/60 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none" placeholder="05XX XXX XX XX" />
                        <p className="text-[10px] text-slate-500 mt-1">Sadece rakam giriniz (Örn: 05551234567)</p>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button type="button" onClick={() => setIsAcceptingQuote(false)} className="flex-1 bg-transparent border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium rounded-lg py-3 transition-colors">İptal</button>
                        <button type="submit" disabled={isProcessing} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg py-3 transition-colors disabled:opacity-50">
                          {isProcessing ? 'İşleniyor...' : 'Onayla & Bitir'}
                        </button>
                      </div>
                    </form>
                  )
                ) : (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                    <p className="text-emerald-400 text-sm font-medium">Bu teklif onaylandı ve üretime alındı.</p>
                  </div>
                )}
              </section>
            ) : (
              <section className="bg-[#121824] border border-dashed border-slate-800 rounded-2xl p-8 text-center">
                <Clock size={40} className="mx-auto text-slate-600 mb-4 animate-pulse" />
                <h2 className="text-white font-semibold mb-2">Teklif Hazırlanıyor</h2>
                <p className="text-sm text-slate-500 leading-relaxed">Uzmanlarımız modelinizi inceliyor. En kısa sürede fiyatlandırılacaktır.</p>
              </section>
            )}

            {['pending', 'quoted'].includes(request.status) && !isAcceptingQuote && (
              <button onClick={handleCancelRequest} className="w-full text-slate-500 hover:text-red-400 text-sm transition-colors py-2">
                Talebi İptal Et
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}