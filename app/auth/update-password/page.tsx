"use client";

import React, { useState, useEffect } from 'react';
import { Lock, RefreshCcw, ArrowRight, CheckCircle2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import PublicNavbar from '@/components/PublicNavbar';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
      }
    };
    checkSession();
  }, [router]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== passwordConfirm) {
      setError("Şifreler eşleşmiyor, lütfen kontrol edin.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Şifreniz en az 6 karakter olmalıdır.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      setError("Şifre güncellenirken hata oluştu: " + updateError.message);
      setLoading(false);
    } else {
      alert("Şifreniz başarıyla güncellendi! Yönlendiriliyorsunuz...");
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=604800;`;
      }
      
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-slate-200 font-sans selection:bg-primary/30">
      
      <PublicNavbar />

      <div className="flex flex-col lg:flex-row flex-1 pt-[72px]">
        
        {/* Sol Panel */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-sidebar p-16 flex-col justify-center border-r border-slate-800/50">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none"></div>

          <div className="relative z-10">
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 tracking-tight">
              Hesabınızı <span className="text-success">güvende</span><br />tutun.
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed mb-12">
              Güçlü bir şifre belirleyerek 3D tasarımlarınızı ve sipariş detaylarınızı koruma altına alın.
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
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-16 lg:p-20 bg-surface">
          <div className="max-w-md w-full">
            <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary/10">
               <Lock size={28} className="text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Yeni Şifre Belirle</h2>
            <p className="text-slate-400 text-sm mb-10">
              Lütfen hesabınız için güçlü ve yeni bir şifre oluşturun.
            </p>

            {error && (
              <div className="mb-6 p-3 bg-danger/10 border border-danger/50 rounded-lg text-danger text-sm flex items-center gap-2">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-semibold text-slate-300">
                  Yeni Şifre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-hover border border-slate-700/60 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm tracking-widest"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="passwordConfirm" className="text-xs font-semibold text-slate-300">
                  Yeni Şifre (Tekrar)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <RefreshCcw size={18} />
                  </div>
                  <input
                    id="passwordConfirm"
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-hover border border-slate-700/60 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm tracking-widest"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-medium rounded-lg py-3 px-4 flex justify-center items-center gap-2 transition-all duration-200 mt-8 shadow-lg shadow-primary/20"
              >
                {loading ? 'Güncelleniyor...' : <>Şifreyi Kaydet ve Giriş Yap <ArrowRight size={18} /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}