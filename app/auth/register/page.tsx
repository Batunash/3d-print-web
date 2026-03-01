"use client";

import React, { useState } from 'react';
import { User, Mail, Lock, CheckCircle2, RefreshCcw, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PublicNavbar from '@/components/PublicNavbar';

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
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== passwordConfirm) return setError("Şifreler eşleşmiyor!");
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;

      if (authData.user) {
        await supabase.from('profiles').insert({ id: authData.user.id, full_name: fullname, role: 'customer' });
      }

      if (authData.session) {
        document.cookie = `sb-access-token=${authData.session.access_token}; path=/; max-age=604800;`;
        router.push('/dashboard');
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  if (isSuccess) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6 border border-success/20">
        <Mail size={40} className="text-success" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-4">E-postanızı Kontrol Edin</h1>
      <p className="text-slate-400 max-w-md mb-8"><b>{email}</b> adresine bir doğrulama bağlantısı gönderdik.</p>
      <Link href="/auth/login" className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg font-medium transition-colors">Giriş Yap</Link>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-slate-200 font-sans selection:bg-primary/30">
      <PublicNavbar />

      <div className="flex flex-col lg:flex-row flex-1 pt-[72px] relative">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-sidebar p-16 flex-col justify-center border-r border-slate-800/50">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 tracking-tight">
              Hayal gücünüzü<br /><span className="text-primary">gerçeğe</span> dönüştürün.
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed mb-12">Katmanlı üretimin yeni neslini deneyimleyin.</p>
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
            <h2 className="text-3xl font-bold text-white mb-2">Hesap Oluştur</h2>
            <p className="text-slate-400 text-sm mb-8">Üretime başlamak için güvenli bir şekilde kaydolun.</p>

            {error && <div className="mb-6 p-3 bg-danger/10 border border-danger/50 rounded-lg text-danger text-sm">{error}</div>}

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="fullname" className="text-xs font-semibold text-slate-300">Ad Soyad</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500"><User size={18} /></div>
                  <input id="fullname" type="text" value={fullname} onChange={(e) => setFullname(e.target.value)} required className="w-full bg-surface-hover border border-slate-700/60 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-semibold text-slate-300">E-posta</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500"><Mail size={18} /></div>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-surface-hover border border-slate-700/60 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Şifre</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500"><Lock size={18} /></div>
                    <input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-surface-hover border border-slate-700/60 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 tracking-widest text-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Şifre Tekrar</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500"><RefreshCcw size={18} /></div>
                    <input type="password" minLength={6} value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required className="w-full bg-surface-hover border border-slate-700/60 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 tracking-widest text-sm" />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <input id="terms" type="checkbox" required className="w-4 h-4 rounded border-slate-600 bg-surface-hover focus:ring-2 focus:ring-primary mt-0.5" />
                <label htmlFor="terms" className="text-xs text-slate-400">
                  <button type="button" onClick={() => setIsTermsOpen(true)} className="text-primary hover:underline">Hizmet Şartları</button>'nı ve <button type="button" onClick={() => setIsPrivacyOpen(true)} className="text-primary hover:underline">Gizlilik Politikası</button>'nı kabul ediyorum.
                </label>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-medium rounded-lg py-3 px-4 transition-all mt-6 shadow-lg shadow-primary/20">
                {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-400">
              Zaten hesabınız var mı? <Link href="/auth/login" className="text-primary font-medium hover:underline transition-colors">Giriş Yap</Link>
            </div>
          </div>
        </div>
      </div>

      {/* MODALLAR */}
      {isTermsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-800/60 bg-surface-hover rounded-t-2xl shrink-0">
              <h2 className="text-xl font-bold text-white">Hizmet Şartları</h2>
              <button onClick={() => setIsTermsOpen(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto text-sm text-slate-300 space-y-4">
              <p>Örnek hizmet şartları metni.</p>
            </div>
            <div className="p-6 border-t border-slate-800/60 bg-surface-hover rounded-b-2xl shrink-0">
              <button onClick={() => setIsTermsOpen(false)} className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-xl">Okudum, Kapat</button>
            </div>
          </div>
        </div>
      )}

      {isPrivacyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-800/60 bg-surface-hover rounded-t-2xl shrink-0">
              <h2 className="text-xl font-bold text-white">Gizlilik Politikası</h2>
              <button onClick={() => setIsPrivacyOpen(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto text-sm text-slate-300 space-y-4">
              <p>Örnek gizlilik politikası metni.</p>
            </div>
            <div className="p-6 border-t border-slate-800/60 bg-surface-hover rounded-b-2xl shrink-0">
              <button onClick={() => setIsPrivacyOpen(false)} className="w-full bg-success hover:bg-success/80 text-white font-medium py-3 rounded-xl">Okudum, Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}