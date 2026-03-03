"use client";

import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';



export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      setError("Bir hata oluştu: " + error.message);
      setLoading(false);
    } else {
      setIsSuccess(true);
      setLoading(false);
    }
  };

  // BAŞARI EKRANI
  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6 border border-success/20">
          <Mail size={40} className="text-success" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Bağlantı Gönderildi!</h1>
        <p className="text-slate-400 max-w-md mb-8">
          <b>{email}</b> adresine şifre sıfırlama bağlantısı gönderdik. Lütfen gelen kutunuzu (ve gerekiyorsa spam klasörünü) kontrol edin.
        </p>
        <Link href="/auth/login" className="flex items-center gap-2 text-primary hover:text-primary-hover font-medium transition-colors">
          <ArrowLeft size={18} /> Giriş Sayfasına Dön
        </Link>
      </div>
    );
  }

  // NORMAL ŞİFRE SIFIRLAMA EKRANI
  return (
    <div className="min-h-screen flex flex-col bg-background text-slate-200 font-sans selection:bg-primary/30">
      
      <PublicNavbar />

      <div className="flex flex-col lg:flex-row flex-1 pt-[72px]">
        
        {/* Sol Panel */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-sidebar p-16 flex-col justify-center border-r border-slate-800/50">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none"></div>

          <div className="relative z-10">
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 tracking-tight">
              Hayal gücünüzü<br />
              <span className="text-primary">gerçeğe</span> dönüştürün.
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed mb-12">
              Katmanlı üretimin yeni neslini deneyimleyin. Modellerinizi yükleyin, malzemeleri seçin ve baskılarınızı gerçek zamanlı takip edin.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-200"><CheckCircle2 size={20} className="text-primary" /> Anında Teklif</div>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-200"><CheckCircle2 size={20} className="text-primary" /> Endüstriyel Kalite</div>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-200"><CheckCircle2 size={20} className="text-primary" /> Hızlı Teslimat</div>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-200"><CheckCircle2 size={20} className="text-primary" /> 3D Önizleme</div>
            </div>
          </div>
        </div>

        {/* Sağ Panel */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-16 lg:p-20 bg-surface relative">
          
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
              <div className="mb-6 p-3 bg-danger/10 border border-danger/50 rounded-lg text-danger text-sm flex items-center gap-2">
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
                    className="w-full bg-surface-hover border border-slate-700/60 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-medium rounded-lg py-3 px-4 flex justify-center items-center gap-2 transition-all duration-200 mt-8 shadow-lg shadow-primary/20"
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