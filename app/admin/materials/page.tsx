"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { BarChart3, LogOut, FileText, Layers, Palette, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function MaterialsManagement() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const [materials, setMaterials] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  
  const [newMaterial, setNewMaterial] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#ffffff');

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.replace('/auth/login');

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return router.replace('/dashboard');

    fetchLists();
  };

  const fetchLists = async () => {
    // ÇÖZÜM BURADA: Artık oluşturulma tarihine göre değil, İsme göre (Alfabetik A-Z) sıralanıyor. 
    // Böylece tıkladığında asla yerleri değişmeyecek!
    const { data: mats } = await supabase.from('materials').select('*').order('name', { ascending: true });
    const { data: cols } = await supabase.from('colors').select('*').order('name', { ascending: true });
    
    if (mats) setMaterials(mats);
    if (cols) setColors(cols);
    setLoading(false);
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.trim()) return;
    await supabase.from('materials').insert([{ name: newMaterial }]);
    setNewMaterial(''); fetchLists();
  };

  const handleAddColor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColorName.trim()) return;
    await supabase.from('colors').insert([{ name: newColorName, hex_code: newColorHex }]);
    setNewColorName(''); setNewColorHex('#ffffff'); fetchLists();
  };

  const toggleStatus = async (table: 'materials' | 'colors', id: string, currentStatus: boolean) => {
    await supabase.from(table).update({ is_active: !currentStatus }).eq('id', id);
    fetchLists();
  };

  const handleDelete = async (table: 'materials' | 'colors', id: string) => {
    if(!confirm("Bu öğeyi tamamen silmek istediğinize emin misiniz?")) return;
    await supabase.from(table).delete().eq('id', id);
    fetchLists();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push('/auth/login');
  };

  if (loading) return <div className="min-h-screen bg-[#0d1117] flex items-center justify-center text-slate-400">Yükleniyor...</div>;

  return (
    <div className="min-h-screen flex bg-[#0d1117] text-slate-200 font-sans">
      
      {/* SOL MENÜ */}
      <aside className="w-64 bg-[#111622] border-r border-slate-800/60 flex flex-col justify-between hidden lg:flex">
        <div>
          <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800/60">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BarChart3 size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white">Yönetim Paneli</span>
          </div>
          <nav className="p-4 space-y-2">
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-[#1a2233] rounded-lg font-medium transition-colors">
              <BarChart3 size={20} /> Özet Analiz
            </Link>
            <Link href="/admin/requests" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-[#1a2233] rounded-lg font-medium transition-colors">
              <FileText size={20} /> Gelen Talepler
            </Link>
            <Link href="/admin/materials" className="flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-lg font-medium border border-blue-500/20 transition-colors">
              <Layers size={20} /> Malzeme & Renkler
            </Link>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800/60">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg font-medium transition-colors">
            <LogOut size={20} /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* ANA İÇERİK */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Malzeme & Renk Yönetimi</h1>
              <p className="text-slate-400 mt-2">Müşterilerin formda göreceği seçenekleri buradan anlık kontrol edin.</p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* MALZEMELER */}
            <section className="bg-[#121824] border border-slate-800/60 rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Layers className="text-blue-500"/> Malzemeler</h2>
              
              <form onSubmit={handleAddMaterial} className="flex gap-2 mb-6">
                <input type="text" value={newMaterial} onChange={(e) => setNewMaterial(e.target.value)} placeholder="Yeni Malzeme (Örn: TPU)" className="flex-1 bg-[#1a2233] border border-slate-700/60 rounded-lg py-2 px-4 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors"><Plus size={20}/></button>
              </form>

              <div className="space-y-3">
                {materials.map(mat => (
                  <div key={mat.id} className="flex items-center justify-between p-3 bg-[#1a2233]/50 border border-slate-700/50 rounded-lg hover:bg-[#1a2233] transition-colors">
                    <span className={`font-medium ${mat.is_active ? 'text-white' : 'text-slate-500 line-through'}`}>{mat.name}</span>
                    <div className="flex gap-3 items-center">
                      <button onClick={() => toggleStatus('materials', mat.id, mat.is_active)} className={`${mat.is_active ? 'text-emerald-500' : 'text-slate-500'} hover:scale-110 transition-transform`}>
                        {mat.is_active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                      </button>
                      <button onClick={() => handleDelete('materials', mat.id)} className="text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* RENKLER */}
            <section className="bg-[#121824] border border-slate-800/60 rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Palette className="text-indigo-500"/> Renkler</h2>
              
              <form onSubmit={handleAddColor} className="flex gap-2 mb-6">
                <input type="color" value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)} className="w-12 h-10 rounded cursor-pointer bg-[#1a2233] border border-slate-700/60" />
                <input type="text" value={newColorName} onChange={(e) => setNewColorName(e.target.value)} placeholder="Renk Adı (Örn: Siyah)" className="flex-1 bg-[#1a2233] border border-slate-700/60 rounded-lg py-2 px-4 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors"><Plus size={20}/></button>
              </form>

              <div className="space-y-3">
                {colors.map(col => (
                  <div key={col.id} className="flex items-center justify-between p-3 bg-[#1a2233]/50 border border-slate-700/50 rounded-lg hover:bg-[#1a2233] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border border-slate-500" style={{ backgroundColor: col.hex_code }}></div>
                      <span className={`font-medium ${col.is_active ? 'text-white' : 'text-slate-500 line-through'}`}>{col.name}</span>
                    </div>
                    <div className="flex gap-3 items-center">
                      <button onClick={() => toggleStatus('colors', col.id, col.is_active)} className={`${col.is_active ? 'text-emerald-500' : 'text-slate-500'} hover:scale-110 transition-transform`}>
                        {col.is_active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                      </button>
                      <button onClick={() => handleDelete('colors', col.id)} className="text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}