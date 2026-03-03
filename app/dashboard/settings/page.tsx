"use client";

import React, { useState, useEffect } from 'react';
import { User, Phone, Save, ArrowLeft, Lock, ShieldCheck, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast'; // YENİ
import LoadingSpinner from '@/components/LoadingSpinner'; // YENİ

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  
  const [profile, setProfile] = useState({ full_name: '', phone: '' });
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile({ full_name: data.full_name || '', phone: data.phone || '' });
    }
    setLoading(false);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNumbers = e.target.value.replace(/\D/g, ''); 
    setProfile({...profile, phone: onlyNumbers});
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('profiles').update(profile).eq('id', user?.id);

    if (error) toast.error("Hata: " + error.message);
    else toast.success("Profil bilgileriniz başarıyla güncellendi!");
    setSavingProfile(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.oldPassword) return toast.error("Lütfen mevcut şifrenizi giriniz.");
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error("Yeni şifreler eşleşmiyor!");
    if (passwords.newPassword.length < 6) return toast.error("Yeni şifre en az 6 karakter olmalıdır.");

    setSavingPassword(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("Kullanıcı oturumu bulunamadı.");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email, password: passwords.oldPassword,
      });

      if (signInError) throw new Error("Mevcut şifrenizi yanlış girdiniz.");

      const { error: updateError } = await supabase.auth.updateUser({ password: passwords.newPassword });
      if (updateError) throw updateError;

      toast.success("Şifreniz başarıyla güncellendi!");
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSavingPassword(false);
    }
  };

  // YENİ: Ortak Spinner Kullanımı
  if (loading) return <LoadingSpinner message="Ayarlar yükleniyor..." />;

  return (
    <main className="flex-1 p-6 lg:p-10 overflow-y-auto w-full">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-4 border-b border-slate-800/60 pb-6">
          <Link href="/dashboard" className="p-2 bg-surface hover:bg-surface-hover border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Hesap Ayarları</h1>
            <p className="text-sm text-slate-400 mt-1">Kişisel bilgilerinizi ve güvenlik tercihlerinizi yönetin.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <section className="h-full">
            <form onSubmit={handleSaveProfile} className="bg-surface border border-slate-800/60 rounded-2xl p-6 shadow-xl space-y-5 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-slate-700/50 pb-3 mb-4">
                  <User size={18} className="text-primary" /> Profil Bilgileri
                </h2>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Ad Soyad</label>
                  <input type="text" value={profile.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} className="w-full bg-surface-hover border border-slate-700/60 rounded-lg py-3 px-4 text-white focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Ahmet Yılmaz" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 flex items-center gap-2"><Phone size={14} className="text-slate-500"/> Telefon Numarası</label>
                  <input type="tel" value={profile.phone} onChange={handlePhoneChange} maxLength={11} className="w-full bg-surface-hover border border-slate-700/60 rounded-lg py-3 px-4 text-white focus:ring-2 focus:ring-primary/50 outline-none" placeholder="05xx xxx xx xx" />
                  <p className="text-[11px] text-slate-500">Sadece rakam giriniz (Örn: 05551234567).</p>
                </div>
              </div>
              <button type="submit" disabled={savingProfile} className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-auto">
                {savingProfile ? "Kaydediliyor..." : <><Save size={18} /> Bilgileri Kaydet</>}
              </button>
            </form>
          </section>

          <section className="h-full">
            <form onSubmit={handleUpdatePassword} className="bg-surface border border-slate-800/60 rounded-2xl p-6 shadow-xl space-y-5 h-full flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-slate-700/50 pb-3 mb-4">
                  <ShieldCheck size={18} className="text-success" /> Güvenlik ve Şifre
                </h2>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 flex items-center gap-2"><KeyRound size={14} className="text-slate-500"/> Mevcut Şifre</label>
                  <input type="password" required value={passwords.oldPassword} onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})} className="w-full bg-surface-hover border border-slate-700/60 rounded-lg py-3 px-4 text-white focus:ring-2 focus:ring-primary/50 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Yeni Şifre</label>
                  <input type="password" required value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} className="w-full bg-surface-hover border border-slate-700/60 rounded-lg py-3 px-4 text-white focus:ring-2 focus:ring-success/50 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Yeni Şifre (Tekrar)</label>
                  <input type="password" required value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} className="w-full bg-surface-hover border border-slate-700/60 rounded-lg py-3 px-4 text-white focus:ring-2 focus:ring-success/50 outline-none" />
                </div>
              </div>
              <button type="submit" disabled={savingPassword} className="w-full bg-success hover:bg-success/80 text-white font-medium py-3 rounded-xl shadow-lg shadow-success/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-auto">
                {savingPassword ? "Güncelleniyor..." : <><Lock size={18} /> Şifreyi Güncelle</>}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}