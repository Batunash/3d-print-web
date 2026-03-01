"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Layers, Palette, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/constants';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function MaterialsManagement() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [newMaterial, setNewMaterial] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#ffffff');

  useEffect(() => { checkAuthAndFetchData(); }, []);

  const checkAuthAndFetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.replace('/auth/login');
    fetchLists();
  };

  const fetchLists = async () => {
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

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <main className="flex-1 p-6 lg:p-10 overflow-y-auto w-full">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Malzeme & Renk Yönetimi</h1>
            <p className="text-slate-400 mt-2">{SITE_CONFIG.name} müşterilerinin formda göreceği seçenekleri kontrol edin.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-surface border border-slate-800/60 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Layers className="text-primary"/> Malzemeler</h2>
            <form onSubmit={handleAddMaterial} className="flex gap-2 mb-6">
              <input type="text" value={newMaterial} onChange={(e) => setNewMaterial(e.target.value)} placeholder="Yeni Malzeme (Örn: TPU)" className="flex-1 bg-surface-hover border border-slate-700/60 rounded-lg py-2 px-4 text-sm text-white focus:ring-1 focus:ring-primary outline-none" />
              <button type="submit" className="bg-primary hover:bg-primary-hover text-white p-2 rounded-lg transition-colors"><Plus size={20}/></button>
            </form>
            <div className="space-y-3">
              {materials.map(mat => (
                <div key={mat.id} className="flex items-center justify-between p-3 bg-surface-hover/50 border border-slate-700/50 rounded-lg hover:bg-surface-hover transition-colors">
                  <span className={`font-medium ${mat.is_active ? 'text-white' : 'text-slate-500 line-through'}`}>{mat.name}</span>
                  <div className="flex gap-3 items-center">
                    <button onClick={() => toggleStatus('materials', mat.id, mat.is_active)} className={`${mat.is_active ? 'text-success' : 'text-slate-500'} hover:scale-110 transition-transform`}>
                      {mat.is_active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                    <button onClick={() => handleDelete('materials', mat.id)} className="text-slate-500 hover:text-danger transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-surface border border-slate-800/60 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Palette className="text-indigo-500"/> Renkler</h2>
            <form onSubmit={handleAddColor} className="flex gap-2 mb-6">
              <input type="color" value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)} className="w-12 h-10 rounded cursor-pointer bg-surface-hover border border-slate-700/60" />
              <input type="text" value={newColorName} onChange={(e) => setNewColorName(e.target.value)} placeholder="Renk Adı (Örn: Siyah)" className="flex-1 bg-surface-hover border border-slate-700/60 rounded-lg py-2 px-4 text-sm text-white focus:ring-1 focus:ring-primary outline-none" />
              <button type="submit" className="bg-primary hover:bg-primary-hover text-white p-2 rounded-lg transition-colors"><Plus size={20}/></button>
            </form>
            <div className="space-y-3">
              {colors.map(col => (
                <div key={col.id} className="flex items-center justify-between p-3 bg-surface-hover/50 border border-slate-700/50 rounded-lg hover:bg-surface-hover transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border border-slate-500" style={{ backgroundColor: col.hex_code }}></div>
                    <span className={`font-medium ${col.is_active ? 'text-white' : 'text-slate-500 line-through'}`}>{col.name}</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <button onClick={() => toggleStatus('colors', col.id, col.is_active)} className={`${col.is_active ? 'text-success' : 'text-slate-500'} hover:scale-110 transition-transform`}>
                      {col.is_active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                    <button onClick={() => handleDelete('colors', col.id)} className="text-slate-500 hover:text-danger transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}