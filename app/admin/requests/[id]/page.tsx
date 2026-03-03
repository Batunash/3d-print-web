"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, DollarSign, CheckCircle, Clock, Package, 
  FileText as FileIcon, AlertCircle, Box, MapPin, Phone,
  MessageSquare, Send, Download, Truck, Layers
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast'; // YENİ EKLENDİ
import LoadingSpinner from '@/components/LoadingSpinner'; // YENİ EKLENDİ

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState<string | null>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  const [price, setPrice] = useState('');
  const [printDate, setPrintDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (params.id) checkAdminAndFetchData();
  }, [params.id]);

  const checkAdminAndFetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.replace('/auth/login');

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return router.replace('/dashboard');

    setAdminId(user.id);
    fetchDetail();
    fetchMessages();
  };

  const fetchDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('print_requests')
        .select('*, profiles(full_name), quotes(*), orders(*), files(storage_path, filename, filesize)')
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

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('order_messages')
      .select('*, profiles(full_name, role)')
      .eq('request_id', params.id)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !adminId || !request) return;
    
    setSendingMsg(true);
    try {
      const { error } = await supabase.from('order_messages').insert({
        request_id: request.id, user_id: adminId, message: newMessage
      });
      if (error) throw error;
      
      await supabase.from('notifications').insert({
        user_id: request.user_id,
        title: 'Yeni Mesajınız Var 💬',
        message: `"${request.title}" siparişiniz için yeni bir mesaj geldi.`,
        link: `/dashboard/orders/${request.id}`
      });

      setNewMessage('');
      fetchMessages();
    } catch (error: any) {
      toast.error("Mesaj gönderilemedi.");
    } finally {
      setSendingMsg(false);
    }
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request || !adminId) return;
    if (parseFloat(price) < 0) return toast.error("Fiyat 0'dan küçük olamaz!");

    setIsSubmittingQuote(true);
    try {
      const { error: quoteError } = await supabase.from('quotes').insert({
        request_id: request.id, admin_id: adminId, price: parseFloat(price),
        estimated_print_date: printDate, estimated_delivery_date: deliveryDate, notes: notes
      });
      if (quoteError) throw quoteError;
      
      const { error: updateError } = await supabase.from('print_requests').update({ status: 'quoted' }).eq('id', request.id);
      if (updateError) throw updateError;
      
      await supabase.from('notifications').insert({
        user_id: request.user_id,
        title: 'Yeni Teklif Alındı! 🎉',
        message: `"${request.title}" projeniz için ₺${price} tutarında üretim teklifi verildi.`,
        link: `/dashboard/orders/${request.id}`
      });

      try {
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: request.user_id, subject: 'PrintCraft 3D: Yeni Teklifiniz Var! 🚀',
            type: 'quote_ready', data: { projectName: request.title, price: price }
          })
        });
      } catch (mailErr) { console.error("Mail hatası", mailErr); }
      
      toast.success("Teklif müşteriye başarıyla iletildi!");
      fetchDetail();
    } catch (error: any) {
      toast.error("Teklif oluşturulamadı.");
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase.from('print_requests').update({ status: newStatus }).eq('id', request.id);
      if (error) throw error;

      let durumMesaji = '';
      if (newStatus === 'printing') durumMesaji = 'üretime alındı! Makinelerimiz çalışıyor.';
      if (newStatus === 'shipped') durumMesaji = 'kargoya verildi! Yola çıktı.';
      if (newStatus === 'completed') durumMesaji = 'başarıyla tamamlandı. Bizi tercih ettiğiniz için teşekkürler!';

      if (durumMesaji) {
        await supabase.from('notifications').insert({
          user_id: request.user_id, title: 'Sipariş Durumu Güncellendi 📦',
          message: `"${request.title}" projeniz ${durumMesaji}`, link: `/dashboard/orders/${request.id}`
        });
      }
      
      toast.success("Sipariş durumu güncellendi!");
      fetchDetail();
    } catch (err: any) { 
      toast.error("Durum güncellenirken hata oluştu."); 
    }
  };

  const downloadFile = async (storagePath: string) => {
    try {
      const res = await fetch('/api/download', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ storagePath })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      window.open(data.signedUrl, '_blank');
    } catch (err: any) { 
      toast.error("Dosya indirilemedi: " + err.message); 
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, React.ReactNode> = {
      pending: <span className="px-3 py-1 rounded-full bg-warning/10 text-warning border border-warning/20 text-xs font-medium flex items-center gap-1 w-max"><Clock size={12}/> İnceleniyor</span>,
      quoted: <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium flex items-center gap-1 w-max"><CheckCircle size={12}/> Teklif Verildi</span>,
      approved: <span className="px-3 py-1 rounded-full bg-success/10 text-success border border-success/20 text-xs font-medium flex items-center gap-1 w-max"><CheckCircle size={12}/> Onaylandı</span>,
      printing: <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-medium flex items-center gap-1 w-max"><Layers size={12}/> Üretimde</span>,
      shipped: <span className="px-3 py-1 rounded-full bg-info/10 text-info border border-info/20 text-xs font-medium flex items-center gap-1 w-max"><Truck size={12}/> Kargoda</span>,
      completed: <span className="px-3 py-1 rounded-full bg-success/10 text-success border border-success/20 text-xs font-medium flex items-center gap-1 w-max"><CheckCircle size={12}/> Tamamlandı</span>,
    };
    return badges[status] || <span className="text-slate-400">{status}</span>;
  };

  if (loading) return <LoadingSpinner message="Sipariş detayları yükleniyor..." />;

  if (!request) return (
    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
      <AlertCircle size={48} className="mb-4 text-danger" />
      <p>Sipariş bulunamadı.</p>
      <Link href="/admin/requests" className="mt-4 text-primary hover:underline">Listeye dön</Link>
    </div>
  );

  const orderDetails = request.orders && request.orders.length > 0 ? request.orders[0] : null;

  return (
    <main className="flex-1 p-6 lg:p-10 overflow-y-auto w-full">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/requests" className="p-2 bg-surface hover:bg-surface-hover border border-slate-800 rounded-lg transition-colors group">
              <ArrowLeft size={20} className="text-slate-400 group-hover:text-white" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Sipariş Yönetimi</h1>
              <p className="text-sm text-slate-500 font-mono uppercase">ID: {request.id.split('-')[0]}...</p>
            </div>
          </div>
          {getStatusBadge(request.status)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-surface border border-slate-800/60 rounded-2xl p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <FileIcon size={20} className="text-primary" /> Proje Özeti
                </h2>
                <div className="space-y-4 text-sm">
                  <p className="flex justify-between"><span className="text-slate-500">Müşteri:</span> <span className="text-white font-medium">{request.profiles?.full_name}</span></p>
                  <p className="flex justify-between border-t border-slate-700/50 pt-3"><span className="text-slate-500">Proje:</span> <span className="text-white font-medium">{request.title}</span></p>
                  <div className="pt-3 flex justify-between border-t border-slate-700/50">
                    <p><span className="text-slate-500">Malzeme:</span> <span className="text-white ml-1">{request.material}</span></p>
                    <p><span className="text-slate-500">Renk:</span> <span className="text-white ml-1">{request.color}</span></p>
                    <p><span className="text-slate-500">Adet:</span> <span className="text-white ml-1">{request.quantity}</span></p>
                  </div>
                </div>
              </section>

              <section className="bg-surface border border-slate-800/60 rounded-2xl p-6 shadow-xl flex flex-col justify-center">
                 <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Box size={20} className="text-primary" /> 3D Dosya
                </h2>
                <div className="flex items-center gap-4 bg-background p-4 rounded-xl border border-slate-800">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><Package size={24} className="text-primary" /></div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-white font-medium truncate">{request.files?.[0]?.filename || "Dosya Yok"}</p>
                  </div>
                </div>
                {request.files?.[0] && (
                  <button onClick={() => downloadFile(request.files[0].storage_path)} className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors">
                    <Download size={16} /> Modeli İndir
                  </button>
                )}
              </section>
            </div>

            {request.status === 'pending' && (
              <section className="bg-gradient-to-b from-surface-hover to-surface border border-primary/30 ring-1 ring-primary/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2"><DollarSign className="text-success"/> Fiyat Teklifi Oluştur</h2>
                <form onSubmit={handleQuoteSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">Fiyat (TL)</label>
                    <input type="number" min="0" step="0.01" required value={price} onChange={(e)=>setPrice(e.target.value)} className="w-full bg-background border border-slate-700/60 rounded-lg py-3 px-4 text-white focus:ring-1 focus:ring-primary outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-300">Üretime Başlama</label>
                      <input type="date" min={today} required value={printDate} onChange={(e)=>setPrintDate(e.target.value)} className="w-full bg-background border border-slate-700/60 rounded-lg py-3 px-4 text-slate-300 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-300">Tahmini Teslim</label>
                      <input type="date" min={printDate || today} required value={deliveryDate} onChange={(e)=>setDeliveryDate(e.target.value)} className="w-full bg-background border border-slate-700/60 rounded-lg py-3 px-4 text-slate-300 outline-none" />
                    </div>
                  </div>
                  <button type="submit" disabled={isSubmittingQuote} className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20">
                    {isSubmittingQuote ? 'Gönderiliyor...' : 'Teklifi Müşteriye İlet'}
                  </button>
                </form>
              </section>
            )}

            {['approved', 'printing', 'shipped'].includes(request.status) && (
              <section className="bg-surface border border-slate-800/60 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4">Siparişi İlerlet</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  {request.status === 'approved' && <button onClick={() => updateStatus('printing')} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-medium transition-colors">Üretime Başla</button>}
                  {request.status === 'printing' && <button onClick={() => updateStatus('shipped')} className="flex-1 bg-info hover:bg-info/80 text-white py-4 rounded-xl font-medium transition-colors">Kargoya Ver</button>}
                  {request.status === 'shipped' && <button onClick={() => updateStatus('completed')} className="flex-1 bg-success hover:bg-success/80 text-white py-4 rounded-xl font-medium transition-colors">Tamamlandı İşaretle</button>}
                </div>
              </section>
            )}
            
            {orderDetails && (
              <section className="bg-surface border border-slate-800/60 rounded-2xl p-6 shadow-xl">
                <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2"><MapPin size={16} className="text-warning"/> Teslimat Adresi ve İletişim</h3>
                <div className="bg-surface-hover border border-slate-700 rounded-xl p-4">
                  <p className="text-white text-sm whitespace-pre-line mb-4">{orderDetails.shipping_address}</p>
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-700/50">
                    <Phone size={16} className="text-slate-500 shrink-0" />
                    <p className="text-white text-sm font-medium">{orderDetails.contact_phone}</p>
                  </div>
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6 h-full min-h-[500px]">
            <section className="bg-surface border border-slate-800/60 rounded-2xl p-6 shadow-xl flex flex-col h-full max-h-[700px]">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MessageSquare size={20} className="text-primary" /> Müşteri ile İletişim
              </h2>
              
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500 text-sm italic text-center">
                    Müşteriyle bu sipariş hakkında konuşmaya başlayın.
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.user_id === adminId;
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <span className="text-[10px] text-slate-500 mb-1 px-1">
                          {isMe ? 'Sen (Admin)' : msg.profiles?.full_name}
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
                  placeholder="Müşteriye yazın..." 
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
          
        </div>
      </div>
    </main>
  );
}