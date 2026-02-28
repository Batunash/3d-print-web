"use client";

import React, { useState, useEffect } from 'react';
import { Lock, RefreshCcw, ArrowRight, Box, CheckCircle2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sayfa yüklendiğinde kullanıcının gerçekten şifre sıfırlama linkinden gelip gelmediğini kontrol edebiliriz
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Eğer ortada bir oturum yoksa (yani linke tıklamadan rastgele bu sayfaya girdiyse) logine yolla
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

    // Supabase üzerinden şifreyi güncelliyoruz
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      setError("Şifre güncellenirken hata oluştu: " + updateError.message);
      setLoading(false);
    } else {
      alert("Şifreniz başarıyla güncellendi! Yönlendiriliyorsunuz...");
      
      // Middleware'in kapıyı açması için güncel çerezi (cookie) tekrar ayarlıyoruz
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=604800;`;
      }
      
      // Şifre değişti, doğrudan içeri alıyoruz
      router.push('/dashboard');
    }
  };

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
      </nav>

      <div className="flex flex-col lg:flex-row flex-1">
        
        {/* Sol Panel - Görsel/Branding Kısmı */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0f1520] p-16 flex-col justify-center border-r border-slate-800/50">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none"></div>

          <div className="relative z-10">
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 tracking-tight">
              Hesabınızı <span className="text-emerald-400">güvende</span><br />tutun.
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed mb-12">
              Güçlü bir şifre belirleyerek 3D tasarımlarınızı ve sipariş detaylarınızı koruma altına alın.
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
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 sm:p-16 lg:p-20 bg-[#121824]">
          <div className="max-w-md w-full">
            <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/10">
               <Lock size={28} className="text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Yeni Şifre Belirle</h2>
            <p className="text-slate-400 text-sm mb-10">
              Lütfen hesabınız için güçlü ve yeni bir şifre oluşturun.
            </p>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
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
                    className="w-full bg-[#1a202c] border border-slate-700/60 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm tracking-widest"
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
                    className="w-full bg-[#1a202c] border border-slate-700/60 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm tracking-widest"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg py-3 px-4 flex justify-center items-center gap-2 transition-all duration-200 mt-8 shadow-lg shadow-blue-600/20"
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