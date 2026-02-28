"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, Phone, Save, ArrowLeft, Lock, ShieldCheck, KeyRound } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  
  const [profile, setProfile] = useState({ full_name: '', phone: '' });
  
  // Eski şifre (oldPassword) state'i eklendi
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile({
        full_name: data.full_name || '',
        phone: data.phone || ''
      });
    }
    setLoading(false);
  };

  // Telefon numarasında sadece rakamlara izin veren fonksiyon
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNumbers = e.target.value.replace(/\D/g, ''); // Harfleri ve sembolleri siler
    setProfile({...profile, phone: onlyNumbers});
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', user?.id);

    if (error) alert("Hata: " + error.message);
    else alert("Profil bilgileriniz başarıyla güncellendi!");
    setSavingProfile(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwords.oldPassword) {
      return alert("Lütfen mevcut şifrenizi giriniz.");
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return alert("Yeni şifreler birbiriyle eşleşmiyor!");
    }
    if (passwords.newPassword.length < 6) {
      return alert("Yeni şifre en az 6 karakter olmalıdır.");
    }

    setSavingPassword(true);

    try {
      // Kullanıcının aktif e-posta adresini alıyoruz
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("Kullanıcı oturumu bulunamadı.");

      // Kullanıcının girdiği "Eski Şifre" doğru mu diye Supabase'e soruyoruz
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwords.oldPassword,
      });

      if (signInError) {
        throw new Error("Mevcut şifrenizi yanlış girdiniz. Lütfen tekrar deneyin.");
      }

      // Şifre doğruysa yeni şifreyi kaydediyoruz
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });

      if (updateError) throw updateError;

      alert("Harika! Şifreniz başarıyla ve güvenli bir şekilde değiştirildi.");
      // Kutucukları temizle
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-slate-400">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 p-6 lg:p-10 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex items-center gap-4 border-b border-slate-800/60 pb-6">
          <Link href="/dashboard" className="p-2 bg-[#121824] hover:bg-[#1a2233] border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Hesap Ayarları</h1>
            <p className="text-sm text-slate-400 mt-1">Kişisel bilgilerinizi ve güvenlik tercihlerinizi yönetin.</p>
          </div>
        </div>

        {/* Ana grid yapısına items-stretch (varsayılan) eklendi ve items-start kaldırıldı */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* PROFİL BİLGİLERİ FORMU - h-full eklendi */}
          <section className="h-full">
            <form onSubmit={handleSaveProfile} className="bg-[#121824] border border-slate-800/60 rounded-2xl p-6 shadow-xl space-y-5 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-slate-700/50 pb-3 mb-4">
                  <User size={18} className="text-blue-500" /> Profil Bilgileri
                </h2>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Ad Soyad</label>
                  <input 
                    type="text" 
                    value={profile.full_name} 
                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                    className="w-full bg-[#1a2233] border border-slate-700/60 rounded-lg py-3 px-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none" 
                    placeholder="Ahmet Yılmaz"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 flex items-center gap-2"><Phone size={14} className="text-slate-500"/> Telefon Numarası</label>
                  <input 
                    type="tel" 
                    value={profile.phone} 
                    onChange={handlePhoneChange}
                    maxLength={11}
                    className="w-full bg-[#1a2233] border border-slate-700/60 rounded-lg py-3 px-4 text-white focus:ring-2 focus:ring-blue-500/50 outline-none" 
                    placeholder="05xx xxx xx xx"
                  />
                  <p className="text-[11px] text-slate-500">Sadece rakam giriniz (Örn: 05551234567). Varsayılan iletişim numarasıdır.</p>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={savingProfile}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-auto"
              >
                {savingProfile ? "Kaydediliyor..." : <><Save size={18} /> Bilgileri Kaydet</>}
              </button>
            </form>
          </section>

          {/* ŞİFRE GÜNCELLEME FORMU - h-full eklendi */}
          <section className="h-full">
            <form onSubmit={handleUpdatePassword} className="bg-[#121824] border border-slate-800/60 rounded-2xl p-6 shadow-xl space-y-5 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-slate-700/50 pb-3 mb-4">
                  <ShieldCheck size={18} className="text-emerald-500" /> Güvenlik ve Şifre
                </h2>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 flex items-center gap-2"><KeyRound size={14} className="text-slate-500"/> Mevcut Şifre</label>
                  <input 
                    type="password" 
                    required
                    value={passwords.oldPassword} 
                    onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                    className="w-full bg-[#1a2233] border border-slate-700/60 rounded-lg py-3 px-4 text-white focus:ring-2 focus:ring-slate-500/50 outline-none" 
                    placeholder="Şu anki şifreniz"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Yeni Şifre</label>
                  <input 
                    type="password" 
                    required
                    value={passwords.newPassword} 
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    className="w-full bg-[#1a2233] border border-slate-700/60 rounded-lg py-3 px-4 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" 
                    placeholder="Yeni şifrenizi belirleyin"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Yeni Şifre (Tekrar)</label>
                  <input 
                    type="password" 
                    required
                    value={passwords.confirmPassword} 
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    className="w-full bg-[#1a2233] border border-slate-700/60 rounded-lg py-3 px-4 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" 
                    placeholder="Yeni şifrenizi doğrulayın"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={savingPassword}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-auto"
              >
                {savingPassword ? "Güncelleniyor..." : <><Lock size={18} /> Şifreyi Güncelle</>}
              </button>
            </form>
          </section>

        </div>
      </div>
    </div>
  );
}