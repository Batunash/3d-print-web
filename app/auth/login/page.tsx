"use client";

import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("E-posta veya şifre hatalı. Lütfen tekrar deneyin.");
      setLoading(false);
    } else if (data.session) {
      document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=604800;`; 
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-slate-200 font-sans selection:bg-primary/30">
      <PublicNavbar />

      {/* İçerik, Navbar'ın altında kalmasın diye pt-20 ekledik */}
      <div className="flex flex-col lg:flex-row flex-1 pt-[72px]">
        
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-sidebar p-16 flex-col justify-center border-r border-slate-800/50">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 tracking-tight">
              Hayal gücünüzü<br /><span className="text-primary">gerçeğe</span> dönüştürün.
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

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 lg:p-20 bg-surface">
          <div className="max-w-md w-full">
            <h2 className="text-3xl font-bold text-white mb-2">Tekrar Hoşgeldiniz</h2>
            <p className="text-slate-400 text-sm mb-10">Kontrol panelinize erişmek için lütfen giriş yapın.</p>

            {error && <div className="mb-6 p-3 bg-danger/10 border border-danger/50 rounded-lg text-danger text-sm">{error}</div>}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-semibold text-slate-300">E-posta</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500"><Mail size={18} /></div>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@email.com" className="w-full bg-surface-hover border border-slate-700/60 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm" required />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-xs font-semibold text-slate-300">Şifre</label>
                  <Link href="/auth/forgot-password" className="text-xs text-primary hover:text-primary-hover transition-colors">Şifremi Unuttum</Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500"><Lock size={18} /></div>
                  <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-surface-hover border border-slate-700/60 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm tracking-widest" required />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-medium rounded-lg py-3 px-4 flex justify-center items-center gap-2 transition-all mt-8 shadow-lg shadow-primary/20">
                {loading ? 'Giriş yapılıyor...' : <>Giriş Yap <ArrowRight size={18} /></>}
              </button>
            </form>
            <div className="mt-8 text-center text-sm text-slate-400">
              Hesabınız yok mu? <Link href="/auth/register" className="text-primary font-medium hover:underline transition-colors">Ücretsiz kaydolun</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}