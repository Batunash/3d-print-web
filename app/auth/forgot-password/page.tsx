"use client";

import React, { useState } from 'react';
import { Mail, ArrowRight, Box, CheckCircle2, ArrowLeft } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Supabase'e şifre sıfırlama e-postası atmasını söylüyoruz
    // redirectTo: Kullanıcı maildeki linke tıklayınca nereye döneceğini belirtir
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      setError("Bir hata oluştu: " + error.message);
      setLoading(false);
    } else {
      // E-posta başarıyla gittiyse başarı ekranını göster
      setIsSuccess(true);
      setLoading(false);
    }
  };

  // BAŞARI EKRANI (E-Posta Gönderildiğinde)
  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#111622] p-6 text-center">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
          <Mail size={40} className="text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Bağlantı Gönderildi!</h1>
        <p className="text-slate-400 max-w-md mb-8">
          <b>{email}</b> adresine şifre sıfırlama bağlantısı gönderdik. Lütfen gelen kutunuzu (ve gerekiyorsa spam klasörünü) kontrol edin.
        </p>
        <Link href="/auth/login" className="flex items-center gap-2 text-blue-500 hover:text-blue-400 font-medium transition-colors">
          <ArrowLeft size={18} /> Giriş Sayfasına Dön
        </Link>
      </div>
    );
  }

  // NORMAL ŞİFRE SIFIRLAMA EKRANI
  return (
    <div className="min-h-screen flex flex-col bg-[#111622] text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* Üst Navigasyon Barı */}
      <nav className="flex justify-between items-center px-8 sm:px-12 py-5 border-b border-slate-800/60 bg-[#111622] z-20 relative">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Box size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg text-white">PrintCraft 3D</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/#nasil-calisir" className="hover:text-white transition-colors">Nasıl Çalışır?</Link>
          <Link href="/#ozellikler" className="hover:text-white transition-colors">Özellikler</Link>
          <Link href="/auth/login" className="px-5 py-2 rounded-full border border-slate-600 hover:bg-slate-800 text-white transition-colors">
            Giriş Yap
          </Link>
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row flex-1">
        
        {/* Sol Panel - Görsel/Branding Kısmı */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0f1520] p-16 flex-col justify-center border-r border-slate-800/50">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none"></div>

          <div className="relative z-10">
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 tracking-tight">
              Hayal gücünüzü<br />
              <span className="text-blue-400">gerçeğe</span> dönüştürün.
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed mb-12">
              Katmanlı üretimin yeni neslini deneyimleyin. Modellerinizi yükleyin, malzemeleri seçin ve baskılarınızı gerçek zamanlı takip edin.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-200"><CheckCircle2 size={20} className="text-blue-500" /> Anında Teklif</div>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-200"><CheckCircle2 size={20} className="text-blue-500" /> Endüstriyel Kalite</div>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-200"><CheckCircle2 size={20} className="text-blue-500" /> Hızlı Teslimat</div>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-200"><CheckCircle2 size={20} className="text-blue-500" /> 3D Önizleme</div>
            </div>
          </div>
        </div>

        {/* Sağ Panel - Form */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-16 lg:p-20 bg-[#121824] relative">
          
          {/* Geri Dön Butonu */}
          <div className="absolute top-8 left-8 sm:top-12 sm:left-12">
            <Link href="/auth/login" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={16} /> Girişe Dön
            </Link>
          </div>

          <div className="max-w-md w-full mt-12 sm:mt-0">
            <h2 className="text-3xl font-bold text-white mb-2">Şifrenizi mi unuttunuz?</h2>
            <p className="text-slate-400 text-sm mb-10">
              Endişelenmeyin! E-posta adresinizi girin, size şifrenizi sıfırlamanız için güvenli bir bağlantı gönderelim.
            </p>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
                {error}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-semibold text-slate-300">
                  Kayıtlı E-posta Adresiniz
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    className="w-full bg-[#1a202c] border border-slate-700/60 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg py-3 px-4 flex justify-center items-center gap-2 transition-all duration-200 mt-8 shadow-lg shadow-blue-600/20"
              >
                {loading ? 'Bağlantı Gönderiliyor...' : <>Sıfırlama Bağlantısı Gönder <ArrowRight size={18} /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}