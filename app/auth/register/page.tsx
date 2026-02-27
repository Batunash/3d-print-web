"use client";

import React, { useState } from 'react';
import { Box, User, Mail, Lock, CheckCircle2, RefreshCcw } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [fullname, setFullname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      return setError("Şifreler eşleşmiyor!");
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullname,
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      alert("Kayıt başarılı! Lütfen giriş yapın.");
      router.push('/auth/login');
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
          <a href="#" className="hover:text-white transition-colors">Fiyatlandırma</a>
          <Link href="/auth/login" className="px-5 py-2 rounded-full border border-slate-600 hover:bg-slate-800 text-white font-medium transition-colors">
            Giriş Yap
          </Link>
        </div>
      </nav>

      {/* Ana İçerik Alanı */}
      <div className="flex flex-col lg:flex-row flex-1">
        
        {/* Sol Panel - Bilgilendirme */}
        <div className="w-full lg:w-1/2 p-8 sm:p-16 lg:p-20 relative overflow-hidden flex flex-col justify-center bg-[#0f1520] border-r border-slate-800/50">
          {/* Arka plan geometrik aydınlatma efekti */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none"></div>

          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
              Fikirlerinizi <span className="text-blue-400">hayata</span><br />
              <span className="text-purple-400">geçirin</span>
            </h1>

            <p className="text-slate-400 text-lg mb-12 max-w-md leading-relaxed">
              Yüksek hassasiyetli hızlı prototip oluşturma ve üretim için PrintCraft 3D'ye güvenen binlerce tasarımcıya katılın.
            </p>

            {/* Özellik Listesi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-200">
                <CheckCircle2 size={20} className="text-blue-500" /> Anında Teklif
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-200">
                <CheckCircle2 size={20} className="text-blue-500" /> 50+ Materyal
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-200">
                <CheckCircle2 size={20} className="text-blue-500" /> 24s Teslimat
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-200">
                <CheckCircle2 size={20} className="text-blue-500" /> Kalite Kontrol
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Panel - Kayıt Formu */}
        <div className="w-full lg:w-1/2 p-8 sm:p-16 lg:p-20 flex items-center justify-center bg-[#121824]">
          <div className="max-w-md w-full">
            <h2 className="text-3xl font-bold text-white mb-2">Hesap Oluştur</h2>
            <p className="text-slate-400 text-sm mb-8">
              Modellerinizi yazdırmaya başlamak için bilgilerinizi girin.
            </p>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              {/* Ad Soyad Alanı */}
              <div className="space-y-2">
                <label htmlFor="fullname" className="text-xs font-semibold text-slate-300">Ad Soyad</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User size={18} />
                  </div>
                  <input
                    id="fullname"
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    placeholder="Ad Soyad"
                    required
                    className="w-full bg-[#1a202c] border border-slate-700/60 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* E-posta Alanı */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-semibold text-slate-300">E-posta</label>
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
                    required
                    className="w-full bg-[#1a202c] border border-slate-700/60 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Şifre ve Şifre Tekrar Alanları (Yan yana) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-xs font-semibold text-slate-300">Şifre</label>
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
                      required
                      className="w-full bg-[#1a202c] border border-slate-700/60 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm tracking-widest"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="passwordConfirm" className="text-xs font-semibold text-slate-300">Şifre Tekrar</label>
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
                      required
                      className="w-full bg-[#1a202c] border border-slate-700/60 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm tracking-widest"
                    />
                  </div>
                </div>
              </div>

              {/* Sözleşme Onay Checkbox */}
              <div className="flex items-start gap-3 pt-2">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="w-4 h-4 rounded border-slate-600 bg-[#1a202c] focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <label htmlFor="terms" className="text-xs text-slate-400">
                  <a href="#" className="text-blue-500 hover:underline">Hizmet Şartları</a>'nı ve <a href="#" className="text-blue-500 hover:underline">Gizlilik Politikası</a>'nı kabul ediyorum.
                </label>
              </div>

              {/* Kayıt Butonu */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg py-3 px-4 transition-all duration-200 mt-6 shadow-lg shadow-blue-600/20"
              >
                {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
              </button>
            </form>

            {/* Giriş Linki */}
            <div className="mt-8 text-center text-sm text-slate-400">
              Zaten hesabınız var mı?{' '}
              <Link href="/auth/login" className="text-blue-500 font-medium hover:text-blue-400 hover:underline transition-colors">
                Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}