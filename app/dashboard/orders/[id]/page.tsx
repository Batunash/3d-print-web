"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, DollarSign, CheckCircle, Clock, Package, 
  FileText, AlertCircle, Truck, Box, MapPin, Phone, Building,
  MessageSquare, Send
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAcceptingQuote, setIsAcceptingQuote] = useState(false);
  
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => {
    if (params.id) fetchDetail();
  }, [params.id]);

  const fetchDetail = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) setCurrentUserId(authData.user.id);

      const { data, error } = await supabase
        .from('print_requests')
        .select('*, quotes(*), files(filename, filesize)')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setRequest(data);

      const { data: msgData } = await supabase
        .from('order_messages')
        .select('*, profiles(full_name, role)')
        .eq('request_id', params.id)
        .order('created_at', { ascending: true });
        
      if (msgData) setMessages(msgData);

    } catch (error: any) {
      console.error("Detay yükleme hatası:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId) return;
    
    setSendingMsg(true);
    try {
      const { error } = await supabase.from('order_messages').insert({
        request_id: request.id,
        user_id: currentUserId,
        message: newMessage
      });
      if (error) throw error;
      
      setNewMessage('');
      
      const { data: msgData } = await supabase
        .from('order_messages')
        .select('*, profiles(full_name, role)')
        .eq('request_id', request.id)
        .order('created_at', { ascending: true });
      if (msgData) setMessages(msgData);
      
      // Admin'e bildirim çak
      const { data: adminProfile } = await supabase.from('profiles').select('id').eq('role', 'admin').single();
      if (adminProfile) {
        await supabase.from('notifications').insert({
          user_id: adminProfile.id,
          title: 'Müşteriden Yeni Mesaj 💬',
          message: `"${request.title}" siparişi için müşteriden yeni bir mesaj geldi.`,
          link: `/admin/requests/${request.id}`
        });
      }
      
    } catch (error: any) {
      toast.error("Mesaj gönderilemedi.");
    } finally {
      setSendingMsg(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNumbers = e.target.value.replace(/\D/g, ''); 
    setContactPhone(onlyNumbers);
  };

  const handleFinalApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (contactPhone.length < 10) return toast.error("Lütfen geçerli bir telefon numarası giriniz.");

    setIsProcessing(true);
    try {
      const { error: updateError } = await supabase.from('print_requests').update({ status: 'approved' }).eq('id', request.id);
      if (updateError) throw updateError;

      const fullShippingAddress = `${addressDetail}\n${district} / ${city}`;
      const { error: orderError } = await supabase.from('orders').insert({ 
        request_id: request.id, 
        invoice_number: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
        shipping_address: fullShippingAddress,
        contact_phone: contactPhone
      });
      if (orderError) throw orderError;

      setIsAcceptingQuote(false);
      toast.success("Harika! Siparişiniz başarıyla oluşturuldu ve üretime alındı.");
      fetchDetail(); 
    } catch (error: any) {
      toast.error("İşlem sırasında bir hata oluştu: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!window.confirm('Bu talebi iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;
    try {
      const { error } = await supabase.from('print_requests').delete().eq('id', request.id);
      if (error) throw error;
      toast.success("Talebiniz iptal edildi.");
      router.push('/dashboard/orders');
    } catch (error: any) {
      toast.error("İptal edilemedi: " + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, React.ReactNode> = {
      pending: <span className="px-3 py-1 rounded-full bg-warning/10 text-warning border border-warning/20 text-xs font-medium">İnceleniyor</span>,
      quoted: <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium animate-pulse">Teklif Geldi</span>,
      approved: <span className="px-3 py-1 rounded-full bg-success/10 text-success border border-success/20 text-xs font-medium">Onaylandı</span>,
      printing: <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-medium italic">Üretiliyor</span>,
      shipped: <span className="px-3 py-1 rounded-full bg-info/10 text-info border border-info/20 text-xs font-medium flex items-center gap-1"><Truck size={12}/> Kargoda</span>,
      completed: <span className="px-3 py-1 rounded-full bg-success/10 text-success border border-success/20 text-xs font-medium">Tamamlandı</span>,
      rejected: <span className="px-3 py-1 rounded-full bg-danger/10 text-danger border border-danger/20 text-xs font-medium">Reddedildi</span>
    };
    return badges[status] || <span>{status}</span>;
  };

  if (loading) return <LoadingSpinner message="Sipariş detayları yükleniyor..." />;

  if (!request) return (
    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
      <AlertCircle size={48} className="mb-4 text-danger" />
      <p>Sipariş bulunamadı veya erişim yetkiniz yok.</p>
      <Link href="/dashboard/orders" className="mt-4 text-primary hover:underline">Siparişlerime dön</Link>
    </div>
  );

  const activeQuote = request.quotes && request.quotes.length > 0 ? request.quotes[0] : null;

  return (
    <main className="flex-1 p-6 lg:p-10 overflow-y-auto w-full">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/orders" className="p-2 bg-surface hover:bg-surface-hover border border-slate-800 rounded-lg transition-colors group">
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
          
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-surface border border-slate-800/60 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <FileText size={20} className="text-primary" /> Proje Özeti
              </h2>
              <div className="grid grid-cols-2 gap-y-6">
                <div><label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Proje Adı</label><p className="text-white font-medium">{request.title}</p></div>
                <div><label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Tarih</label><p className="text-white font-medium">{new Date(request.created_at).toLocaleDateString('tr-TR')}</p></div>
                <div><label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Materyal</label><p className="text-slate-300 font-medium px-2 py-0.5 bg-slate-800 rounded w-fit">{request.material} - {request.color}</p></div>
                <div><label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Adet</label><p className="text-white font-medium">{request.quantity} parça</p></div>
              </div>
              {request.description && (
                <div className="mt-8 pt-6 border-t border-slate-800/60">
                  <label className="text-xs text-slate-500 uppercase tracking-wider block mb-2">Açıklama / Notlar</label>
                  <p className="text-slate-400 text-sm leading-relaxed">{request.description}</p>
                </div>
              )}
            </section>

            <section className="bg-surface border border-slate-800/60 rounded-2xl p-6 shadow-xl">
               <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Box size={20} className="text-primary" /> 3D Model Dosyası
              </h2>
              <div className="flex items-center gap-4 bg-background p-4 rounded-xl border border-slate-800">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center"><Package size={24} className="text-primary" /></div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-white font-medium truncate">{request.files?.[0]?.filename || "model_dosyasi.stl"}</p>
                  <p className="text-xs text-slate-500 uppercase">Hazır - STL / OBJ</p>
                </div>
              </div>
            </section>

            <section className="bg-surface border border-slate-800/60 rounded-2xl p-6 shadow-xl flex flex-col h-[400px]">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MessageSquare size={20} className="text-primary" /> Sipariş Mesajları
              </h2>
              
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500 text-sm italic">
                    Talebinizle ilgili bir sorunuz varsa buradan yazabilirsiniz.
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.user_id === currentUserId;
                    const isAdmin = msg.profiles?.role === 'admin';
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <span className="text-[10px] text-slate-500 mb-1 px-1">
                          {isAdmin ? 'Müşteri Temsilcisi' : msg.profiles?.full_name}
                        </span>
                        <div className={`px-4 py-2.5 max-w-[85%] text-sm rounded-2xl shadow-md ${isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-surface-hover text-slate-200 border border-slate-700/50 rounded-tl-sm'}`}>
                          {msg.message}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2 pt-4 border-t border-slate-800/60 mt-auto">
                <input 
                  type="text" 
                  value={newMessage} 
                  onChange={e=>setNewMessage(e.target.value)} 
                  placeholder="Mesajınızı yazın..." 
                  className="flex-1 bg-background border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary" 
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim() || sendingMsg} 
                  className="bg-primary hover:bg-primary-hover text-white px-5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  <Send size={18} className={sendingMsg ? 'animate-pulse' : ''}/>
                </button>
              </form>
            </section>
          </div>

          <div className="space-y-6">
            {activeQuote ? (
              <section className={`bg-gradient-to-b from-surface-hover to-surface border ${request.status === 'quoted' ? 'border-primary/30 ring-1 ring-primary/20' : 'border-slate-800'} rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all duration-300`}>
                <div className="absolute top-0 right-0 p-4"><DollarSign size={40} className="text-primary/10 -rotate-12" /></div>
                
                <h2 className="text-lg font-semibold text-white mb-4">Üretim Teklifi</h2>
                <div className="mb-6">
                  <span className="text-sm text-slate-400 block mb-1">Toplam Tutar</span>
                  <div className="text-4xl font-bold text-white flex items-baseline gap-1">
                    <span className="text-2xl text-primary">₺</span>{activeQuote.price}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-sm text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                    <Clock size={16} className="text-primary" />
                    <span>Teslimat: <b>{new Date(activeQuote.estimated_delivery_date).toLocaleDateString('tr-TR')}</b></span>
                  </div>
                </div>

                {request.status === 'quoted' ? (
                  !isAcceptingQuote ? (
                    <button 
                      onClick={() => setIsAcceptingQuote(true)}
                      className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group"
                    >
                      Teklifi Değerlendir <CheckCircle size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                  ) : (
                    <form onSubmit={handleFinalApprove} className="mt-4 pt-4 border-t border-slate-700/50 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3"><Truck size={16} className="text-warning"/> Teslimat Bilgileri</h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400 uppercase tracking-wider flex items-center gap-1"><Building size={10}/> İl</label>
                          <input required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Örn: Ankara" className="w-full bg-background border border-slate-700/60 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-primary outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-slate-400 uppercase tracking-wider flex items-center gap-1"><MapPin size={10}/> İlçe</label>
                          <input required value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Örn: Çankaya" className="w-full bg-background border border-slate-700/60 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-primary outline-none" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 uppercase tracking-wider">Açık Adres</label>
                        <textarea required rows={3} value={addressDetail} onChange={(e) => setAddressDetail(e.target.value)} className="w-full bg-background border border-slate-700/60 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-primary outline-none resize-none" placeholder="Örn: Kavaklıdere Mah. Tunalı Hilmi Cad..." />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-400 uppercase tracking-wider flex items-center gap-1"><Phone size={10}/> Telefon Numarası</label>
                        <input type="tel" required maxLength={11} value={contactPhone} onChange={handlePhoneChange} className="w-full bg-background border border-slate-700/60 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-primary outline-none" placeholder="05XX XXX XX XX" />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button type="button" onClick={() => setIsAcceptingQuote(false)} className="flex-1 bg-transparent border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium rounded-lg py-3 transition-colors">İptal</button>
                        <button type="submit" disabled={isProcessing} className="flex-1 bg-success hover:bg-success/80 text-white text-sm font-bold rounded-lg py-3 transition-colors disabled:opacity-50">
                          {isProcessing ? 'İşleniyor...' : 'Onayla & Bitir'}
                        </button>
                      </div>
                    </form>
                  )
                ) : (
                  <div className="p-4 bg-success/10 border border-success/20 rounded-xl text-center">
                    <p className="text-success text-sm font-medium">Bu teklif onaylandı ve üretime alındı.</p>
                  </div>
                )}
              </section>
            ) : (
              <section className="bg-surface border border-dashed border-slate-800 rounded-2xl p-8 text-center">
                <Clock size={40} className="mx-auto text-slate-600 mb-4 animate-pulse" />
                <h2 className="text-white font-semibold mb-2">Teklif Hazırlanıyor</h2>
                <p className="text-sm text-slate-500 leading-relaxed">Uzmanlarımız modelinizi inceliyor. En kısa sürede fiyatlandırılacaktır.</p>
              </section>
            )}

            {['pending', 'quoted'].includes(request.status) && !isAcceptingQuote && (
              <button onClick={handleCancelRequest} className="w-full text-slate-500 hover:text-danger text-sm transition-colors py-2">
                Talebi İptal Et
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}