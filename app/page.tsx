"use client";

import React from 'react';
import Link from 'next/link';
import { Box, Layers, Zap, ShieldCheck, ArrowRight, CheckCircle2, Calculator, Bell, Truck, FileBox } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-[#0d1117]/80 backdrop-blur-md border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Box size={24} className="text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">PrintCraft 3D</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#nasil-calisir" className="hover:text-white transition-colors">Nasıl Çalışır?</a>
            {/* İŞTE BURASI: Birazdan oluşturacağımız #ozellikler ID'sine kaydırır */}
            <a href="#ozellikler" className="hover:text-white transition-colors">Özellikler</a>
            <Link href="/auth/login" className="hover:text-white transition-colors">Giriş Yap</Link>
            <Link href="/auth/register" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-blue-600/20 transition-all">
              Hemen Başla
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION (Ana Karşılama) */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>
            V1.0 Yayında: Tam Otomatik Sipariş Yönetimi
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tight mb-8 leading-tight">
            Hayalinizdeki tasarımları <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">gerçeğe dönüştürün.</span>
          </h1>
          
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Saniyeler içinde 3D modelinizi yükleyin, malzeme seçiminizi yapın ve anında fiyat teklifi alın. Profesyonel 3D baskı süreci hiç bu kadar kolay olmamıştı.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-xl shadow-blue-600/20 group">
              Ücretsiz Hesap Oluştur <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#nasil-calisir" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1a2233] hover:bg-[#232d42] border border-slate-700/60 text-white px-8 py-4 rounded-xl font-medium transition-all">
              Süreci İncele
            </a>
          </div>
        </div>
      </section>

      {/* NASIL ÇALIŞIR? */}
      <section id="nasil-calisir" className="py-20 bg-[#111622] border-y border-slate-800/60 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Sadece 3 Adımda Üretim</h2>
            <p className="text-slate-400">Karmaşık süreçleri unutun, dosyanızı yükleyin ve gerisini bize bırakın.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#1a2233]/50 border border-slate-700/50 p-8 rounded-2xl relative overflow-hidden">
              <div className="text-6xl font-black text-slate-800/50 absolute -right-4 -bottom-4">1</div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6"><Box className="text-blue-400" size={24}/></div>
              <h3 className="text-xl font-bold text-white mb-3">Modelini Yükle</h3>
              <p className="text-slate-400 text-sm leading-relaxed">STL veya OBJ formatındaki 3 boyutlu tasarım dosyanızı bulut tabanlı sistemimize güvenle yükleyin.</p>
            </div>

            <div className="bg-[#1a2233]/50 border border-slate-700/50 p-8 rounded-2xl relative overflow-hidden">
              <div className="text-6xl font-black text-slate-800/50 absolute -right-4 -bottom-4">2</div>
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6"><Calculator className="text-indigo-400" size={24}/></div>
              <h3 className="text-xl font-bold text-white mb-3">Teklif Al ve Onayla</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Uzmanlarımız modelinizi incelesin. Size özel sunulan fiyatı ve teslimat tarihini tek tıkla onaylayın.</p>
            </div>

            <div className="bg-[#1a2233]/50 border border-slate-700/50 p-8 rounded-2xl relative overflow-hidden">
              <div className="text-6xl font-black text-slate-800/50 absolute -right-4 -bottom-4">3</div>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6"><Truck className="text-emerald-400" size={24}/></div>
              <h3 className="text-xl font-bold text-white mb-3">Üretim ve Teslimat</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Siparişiniz anında üretime alınır ve tamamlandığında doğrudan kapınıza kadar güvenle kargolanır.</p>
            </div>
          </div>
        </div>
      </section>

      {/* YENİ: ÖZELLİKLER BÖLÜMÜ */}
      <section id="ozellikler" className="py-24 bg-[#0d1117] px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Gerçek Gücümüzü Keşfedin</h2>
            <p className="text-slate-400">Üretim sürecinizi uçtan uca yönetmenizi sağlayan gelişmiş yazılım altyapımız.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Kart 1 */}
            <div className="bg-[#121824] border border-slate-800/60 p-6 rounded-2xl hover:border-blue-500/30 transition-colors group">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Layers className="text-blue-400" size={20}/></div>
              <h3 className="text-lg font-bold text-white mb-2">Canlı Sipariş Takibi</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Siparişinizin durumunu "İnceleniyor, Üretimde, Kargoya Verildi" gibi adımlarla panelinizden canlı izleyin.</p>
            </div>

            {/* Kart 2 */}
            <div className="bg-[#121824] border border-slate-800/60 p-6 rounded-2xl hover:border-emerald-500/30 transition-colors group">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Bell className="text-emerald-400" size={20}/></div>
              <h3 className="text-lg font-bold text-white mb-2">Akıllı Bildirimler</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Projenize yeni bir teklif verildiğinde veya kargoya çıktığında anında e-posta ile haberdar olun.</p>
            </div>

            {/* Kart 3 */}
            <div className="bg-[#121824] border border-slate-800/60 p-6 rounded-2xl hover:border-indigo-500/30 transition-colors group">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><ShieldCheck className="text-indigo-400" size={20}/></div>
              <h3 className="text-lg font-bold text-white mb-2">Güvenli Dosya Altyapısı</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Tüm 3D modelleriniz yüksek güvenlikli bulut sunucularımızda barındırılır ve 3. şahıslarla asla paylaşılmaz.</p>
            </div>

            {/* Kart 4 */}
            <div className="bg-[#121824] border border-slate-800/60 p-6 rounded-2xl hover:border-amber-500/30 transition-colors group">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><FileBox className="text-amber-400" size={20}/></div>
              <h3 className="text-lg font-bold text-white mb-2">Esnek Malzeme Seçimi</h3>
              <p className="text-slate-400 text-sm leading-relaxed">PLA, ABS, PETG, TPU ve Reçine gibi endüstriyel standartlardaki tüm malzemeleri tek tıkla seçin.</p>
            </div>

            {/* Kart 5 */}
            <div className="bg-[#121824] border border-slate-800/60 p-6 rounded-2xl hover:border-cyan-500/30 transition-colors group">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><CheckCircle2 className="text-cyan-400" size={20}/></div>
              <h3 className="text-lg font-bold text-white mb-2">Kolay Adres Yönetimi</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Her siparişte adres yazmakla uğraşmayın. Profilinize bir kez kaydedin veya her siparişe özel adres belirleyin.</p>
            </div>

            {/* Kart 6 */}
            <div className="bg-[#121824] border border-slate-800/60 p-6 rounded-2xl hover:border-purple-500/30 transition-colors group">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Zap className="text-purple-400" size={20}/></div>
              <h3 className="text-lg font-bold text-white mb-2">Hızlı ve Kesintisiz Akış</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Modalsız (inline) ödeme ekranları ve pürüzsüz arayüz tasarımı ile saniyeler içinde siparişinizi tamamlayın.</p>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 bg-[#111622] text-center text-slate-500 text-sm border-t border-slate-800/60">
        <p>© {new Date().getFullYear()} PrintCraft 3D. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}