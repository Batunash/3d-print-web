"use client";

import React, { useState } from 'react';
import { Box, User, Mail, Lock, CheckCircle2, RefreshCcw, X } from 'lucide-react';
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
  
  // E-Posta Onayı State'i
  const [isSuccess, setIsSuccess] = useState(false);

  // YENİ: Modal State'leri
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      return setError("Şifreler eşleşmiyor!");
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        await supabase.from('profiles').insert({
          id: authData.user.id,
          full_name: fullname,
          role: 'customer'
        });
      }

      if (authData.session) {
        document.cookie = `sb-access-token=${authData.session.access_token}; path=/; max-age=604800;`;
        router.push('/dashboard');
      } else {
        setIsSuccess(true);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#111622] p-6 text-center">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
          <Mail size={40} className="text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">E-postanızı Kontrol Edin</h1>
        <p className="text-slate-400 max-w-md mb-8">
          <b>{email}</b> adresine bir doğrulama bağlantısı gönderdik. Lütfen gelen kutunuzu kontrol edip hesabınızı doğrulayın.
        </p>
        <Link href="/auth/login" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium transition-colors">
          Doğruladıktan Sonra Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#111622] text-slate-200 font-sans selection:bg-blue-500/30">
      
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

      <div className="flex flex-col lg:flex-row flex-1 relative">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0f1520] p-16 flex-col justify-center border-r border-slate-800/50">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 tracking-tight">
              Hayal gücünüzü<br /><span className="text-blue-400">gerçeğe</span> dönüştürün.
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

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 lg:p-20 bg-[#121824]">
          <div className="max-w-md w-full">
            <h2 className="text-3xl font-bold text-white mb-2">Hesap Oluştur</h2>
            <p className="text-slate-400 text-sm mb-8">Üretime başlamak için güvenli bir şekilde kaydolun.</p>

            {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</div>}

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="fullname" className="text-xs font-semibold text-slate-300">Ad Soyad</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500"><User size={18} /></div>
                  <input id="fullname" type="text" value={fullname} onChange={(e) => setFullname(e.target.value)} placeholder="Ad Soyad" required className="w-full bg-[#1a202c] border border-slate-700/60 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-semibold text-slate-300">E-posta</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500"><Mail size={18} /></div>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@email.com" required className="w-full bg-[#1a202c] border border-slate-700/60 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-xs font-semibold text-slate-300">Şifre</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500"><Lock size={18} /></div>
                    <input id="password" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full bg-[#1a202c] border border-slate-700/60 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm tracking-widest" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="passwordConfirm" className="text-xs font-semibold text-slate-300">Şifre Tekrar</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500"><RefreshCcw size={18} /></div>
                    <input id="passwordConfirm" type="password" minLength={6} value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="••••••••" required className="w-full bg-[#1a202c] border border-slate-700/60 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm tracking-widest" />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <div className="flex items-center h-5">
                  <input id="terms" type="checkbox" required className="w-4 h-4 rounded border-slate-600 bg-[#1a202c] focus:ring-2 focus:ring-blue-500" />
                </div>
                {/* YENİ: Butona dönüştürülmüş linkler */}
                <label htmlFor="terms" className="text-xs text-slate-400">
                  <button type="button" onClick={() => setIsTermsOpen(true)} className="text-blue-500 hover:underline">Hizmet Şartları</button>'nı ve <button type="button" onClick={() => setIsPrivacyOpen(true)} className="text-blue-500 hover:underline">Gizlilik Politikası</button>'nı kabul ediyorum.
                </label>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg py-3 px-4 transition-all duration-200 mt-6 shadow-lg shadow-blue-600/20">
                {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-400">
              Zaten hesabınız var mı? <Link href="/auth/login" className="text-blue-500 font-medium hover:text-blue-400 hover:underline transition-colors">Giriş Yap</Link>
            </div>
          </div>
        </div>
      </div>

      {/* --- HİZMET ŞARTLARI MODALI --- */}
      {isTermsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121824] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-800/60 bg-[#1a2233] rounded-t-2xl shrink-0">
              <h2 className="text-xl font-bold text-white">Hizmet Şartları</h2>
              <button onClick={() => setIsTermsOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto text-sm text-slate-300 space-y-4">
              <p><strong>1. Kabul Edilme</strong><br/>PrintCraft 3D hizmetlerini kullanarak bu şartları kabul etmiş sayılırsınız.</p>
              <p><strong>2. Hizmet Tanımı</strong><br/>Sistemimiz kullanıcıların 3D modellerini yükleyip fiyat teklifi almasını ve üretim siparişi vermesini sağlar.</p>
              <p><strong>3. Fiyatlandırma ve Ödeme</strong><br/>Verilen teklifler anlıktır. Ödemeler sipariş onayında tahsil edilir.</p>
              <p><strong>4. İptal ve İade</strong><br/>Üretime başlanmış siparişlerde iptal ve iade yapılamamaktadır.</p>
              <p><strong>5. Fikri Mülkiyet</strong><br/>Yüklediğiniz modellerin tüm fikri mülkiyet hakları size aittir. Sistemimiz sadece üretim amacıyla bu dosyaları işler.</p>
              <p><strong>6. İçerik Kısıtlamaları</strong><br/>Yasadışı, ateşli silah parçaları veya telif hakkı ihlali içeren modellerin basımı reddedilir.</p>
            </div>
            <div className="p-6 border-t border-slate-800/60 bg-[#1a2233] rounded-b-2xl shrink-0">
              <button onClick={() => setIsTermsOpen(false)} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-colors">Okudum, Kapat</button>
            </div>
          </div>
        </div>
      )}

      {/* --- GİZLİLİK POLİTİKASI MODALI --- */}
      {isPrivacyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121824] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-800/60 bg-[#1a2233] rounded-t-2xl shrink-0">
              <h2 className="text-xl font-bold text-white">Gizlilik Politikası</h2>
              <button onClick={() => setIsPrivacyOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto text-sm text-slate-300 space-y-4">
              <p><strong>1. Veri Toplama</strong><br/>Ad, soyad, e-posta, telefon ve adres gibi temel iletişim bilgilerinizi hizmet verebilmek için topluyoruz.</p>
              <p><strong>2. 3D Model Güvenliği</strong><br/>Yüklediğiniz 3D tasarım dosyaları yüksek güvenlikli sunucularda şifrelenerek saklanır ve asla üçüncü şahıslarla paylaşılmaz.</p>
              <p><strong>3. Veri Kullanımı</strong><br/>Bilgileriniz sadece sipariş süreçlerini yönetmek, kargo gönderimi yapmak ve size destek sağlamak amacıyla kullanılır.</p>
              <p><strong>4. Çerezler (Cookies)</strong><br/>Oturum yönetimi ve kullanıcı deneyimini iyileştirmek için temel çerezler kullanılmaktadır.</p>
              <p><strong>5. Veri Silme Hakları</strong><br/>Hesabınızı ve yüklediğiniz tüm verileri dilediğiniz zaman sistemden tamamen sildirme hakkına sahipsiniz.</p>
            </div>
            <div className="p-6 border-t border-slate-800/60 bg-[#1a2233] rounded-b-2xl shrink-0">
              <button onClick={() => setIsPrivacyOpen(false)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-colors">Okudum, Kapat</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}