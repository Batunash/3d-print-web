"use client";

import React from 'react';
import Link from 'next/link';
import { Box, Layers, Zap, ShieldCheck, ArrowRight, CheckCircle2, Calculator, Bell, Truck, FileBox } from 'lucide-react';
import PublicNavbar from '@/components/PublicNavbar';
import { SITE_CONFIG } from '@/lib/constants';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-primary/30">
      
      <PublicNavbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span></span>
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
            <Link href="/auth/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-medium transition-all shadow-xl shadow-primary/20 group">
              Ücretsiz Hesap Oluştur <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#nasil-calisir" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-surface-hover hover:bg-slate-800 border border-slate-700/60 text-white px-8 py-4 rounded-xl font-medium transition-all">
              Süreci İncele
            </a>
          </div>
        </div>
      </section>

      {/* NASIL ÇALIŞIR? */}
      <section id="nasil-calisir" className="py-20 bg-sidebar border-y border-slate-800/60 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Sadece 3 Adımda Üretim</h2>
            <p className="text-slate-400">Karmaşık süreçleri unutun, dosyanızı yükleyin ve gerisini bize bırakın.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface-hover/50 border border-slate-700/50 p-8 rounded-2xl relative overflow-hidden">
              <div className="text-6xl font-black text-slate-800/50 absolute -right-4 -bottom-4">1</div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6"><Box className="text-primary" size={24}/></div>
              <h3 className="text-xl font-bold text-white mb-3">Modelini Yükle</h3>
              <p className="text-slate-400 text-sm leading-relaxed">STL veya OBJ formatındaki 3 boyutlu tasarım dosyanızı bulut tabanlı sistemimize güvenle yükleyin.</p>
            </div>
            <div className="bg-surface-hover/50 border border-slate-700/50 p-8 rounded-2xl relative overflow-hidden">
              <div className="text-6xl font-black text-slate-800/50 absolute -right-4 -bottom-4">2</div>
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6"><Calculator className="text-indigo-400" size={24}/></div>
              <h3 className="text-xl font-bold text-white mb-3">Teklif Al ve Onayla</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Uzmanlarımız modelinizi incelesin. Size özel sunulan fiyatı ve teslimat tarihini tek tıkla onaylayın.</p>
            </div>
            <div className="bg-surface-hover/50 border border-slate-700/50 p-8 rounded-2xl relative overflow-hidden">
              <div className="text-6xl font-black text-slate-800/50 absolute -right-4 -bottom-4">3</div>
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-6"><Truck className="text-success" size={24}/></div>
              <h3 className="text-xl font-bold text-white mb-3">Üretim ve Teslimat</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Siparişiniz anında üretime alınır ve tamamlandığında doğrudan kapınıza kadar güvenle kargolanır.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ÖZELLİKLER BÖLÜMÜ */}
      <section id="ozellikler" className="py-24 bg-background px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Gerçek Gücümüzü Keşfedin</h2>
            <p className="text-slate-400">Üretim sürecinizi uçtan uca yönetmenizi sağlayan gelişmiş yazılım altyapımız.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-surface border border-slate-800/60 p-6 rounded-2xl hover:border-primary/30 transition-colors group">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Layers className="text-primary" size={20}/></div>
              <h3 className="text-lg font-bold text-white mb-2">Canlı Sipariş Takibi</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Siparişinizin durumunu canlı izleyin.</p>
            </div>
            <div className="bg-surface border border-slate-800/60 p-6 rounded-2xl hover:border-success/30 transition-colors group">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Bell className="text-success" size={20}/></div>
              <h3 className="text-lg font-bold text-white mb-2">Akıllı Bildirimler</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Gelişmelerden anında e-posta ile haberdar olun.</p>
            </div>
            <div className="bg-surface border border-slate-800/60 p-6 rounded-2xl hover:border-indigo-500/30 transition-colors group">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><ShieldCheck className="text-indigo-400" size={20}/></div>
              <h3 className="text-lg font-bold text-white mb-2">Güvenli Altyapı</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Tüm 3D modelleriniz yüksek güvenlikli sunucularda barındırılır.</p>
            </div>
            <div className="bg-surface border border-slate-800/60 p-6 rounded-2xl hover:border-warning/30 transition-colors group">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><FileBox className="text-warning" size={20}/></div>
              <h3 className="text-lg font-bold text-white mb-2">Esnek Malzeme Seçimi</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Endüstriyel standartlardaki tüm malzemeleri tek tıkla seçin.</p>
            </div>
            <div className="bg-surface border border-slate-800/60 p-6 rounded-2xl hover:border-cyan-500/30 transition-colors group">
              <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><CheckCircle2 className="text-info" size={20}/></div>
              <h3 className="text-lg font-bold text-white mb-2">Kolay Adres Yönetimi</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Profilinize bir kez kaydedin veya özel adres belirleyin.</p>
            </div>
            <div className="bg-surface border border-slate-800/60 p-6 rounded-2xl hover:border-purple-500/30 transition-colors group">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Zap className="text-purple-400" size={20}/></div>
              <h3 className="text-lg font-bold text-white mb-2">Hızlı ve Kesintisiz Akış</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Saniyeler içinde siparişinizi tamamlayın.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 bg-sidebar text-center text-slate-500 text-sm border-t border-slate-800/60">
        <p>© {new Date().getFullYear()} {SITE_CONFIG.company.name}. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}