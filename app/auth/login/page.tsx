"use client";

import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Box } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Supabase istemcisini oluştur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

    // data objesini de alıyoruz (session bilgisi için)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.session) {
      // İŞTE ÇÖZÜM: Middleware'in kapıyı açması için çerez (cookie) oluşturuyoruz
      document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=604800;`; 
      
      // Şimdi güvenle dashboard'a geçebiliriz
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#111622] text-slate-200 font-sans">
      
      {/* Üst Navigasyon Barı */}
      <nav className="flex justify-between items-center px-8 sm:px-12 py-5 border-b border-slate-800/60 bg-[#111622] z-20 relative">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-900/40 border border-blue-500/30 rounded-lg flex items-center justify-center shadow-inner shadow-blue-500/20">
            <Box size={20} className="text-blue-400" />
          </div>
          <span className="font-bold text-lg text-white">PrintCraft 3D</span>
        </Link>
        
        {/* Masaüstü Menü */}
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
          <a href="#" className="hover:text-white transition-colors">Nasıl Çalışır</a>
          <a href="#" className="hover:text-white transition-colors">Materyaller</a>
          <Link href="/auth/register" className="px-5 py-2 rounded-full border border-slate-600 hover:bg-slate-800 text-white font-medium transition-colors">
            Hesap Oluştur
          </Link>
        </div>
      </nav>

      {/* Ana İçerik Alanı */}
      <div className="flex flex-col lg:flex-row flex-1">
        
        {/* Sol Panel - Görsel/Branding Kısmı */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0f1520] p-16 flex-col justify-between border-r border-slate-800/50">
          
          {/* Arka Plan Parlama Efekti */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0f1520]/80 to-[#0f1520] rounded-full blur-3xl pointer-events-none"></div>

          {/* Sol Panel İçerik */}
          <div className="relative z-10 flex flex-col justify-center h-full">
            <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-500/10">
               <Box size={28} className="text-indigo-400" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Hayal gücünüzü<br />gerçeğe dönüştürün.
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Katmanlı üretimin yeni neslini deneyimleyin. Modellerinizi yükleyin, malzemeleri seçin ve baskılarınızı gerçek zamanlı takip edin.
            </p>

            {/* Kullanıcı Sosyal Kanıtı (Avatar Grubu) */}
            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-[#0f1520] flex items-center justify-center overflow-hidden">
                     <div className={`w-full h-full bg-gradient-to-br from-slate-700 to-slate-600 opacity-80`} />
                  </div>
                ))}
              </div>
              <div>
                <div className="font-bold text-sm text-white">10k+ Üretici</div>
                <div className="text-xs text-slate-500">Bu ay katıldı</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Panel - Giriş Formu */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 lg:p-20 bg-[#121824]">
          <div className="max-w-md w-full">
            <h2 className="text-3xl font-bold text-white mb-2">Tekrar Hoşgeldiniz</h2>
            <p className="text-slate-400 text-sm mb-10">
              Kontrol panelinize erişmek için lütfen giriş yapın.
            </p>

            {/* Hata Mesajı */}
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* E-posta Alanı */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-semibold text-slate-300">
                  E-posta
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
                    placeholder="ad@sirket.com"
                    className="w-full bg-[#1a2233] border border-slate-700/60 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                    required
                  />
                </div>
              </div>

              {/* Şifre Alanı */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-xs font-semibold text-slate-300">
                    Şifre
                  </label>
                  <a href="#" className="text-xs text-blue-500 hover:text-blue-400 transition-colors">
                    Şifremi Unuttum
                  </a>
                </div>
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
                    className="w-full bg-[#1a2233] border border-slate-700/60 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm tracking-widest"
                    required
                  />
                </div>
              </div>

              {/* Giriş Butonu */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg py-3 px-4 flex justify-center items-center gap-2 transition-all duration-200 mt-8 shadow-lg shadow-blue-600/20"
              >
                {loading ? 'Giriş yapılıyor...' : <>Giriş Yap <ArrowRight size={18} /></>}
              </button>
            </form>

            {/* Kayıt Linki */}
            <div className="mt-8 text-center text-sm text-slate-400">
              Hesabınız yok mu?{' '}
              <Link href="/auth/register" className="text-blue-500 font-medium hover:text-blue-400 hover:underline transition-colors">
                Ücretsiz kaydolun
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}