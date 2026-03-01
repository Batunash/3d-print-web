"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UploadCloud, FileText, Settings, Layers, Box, Trash2, Palette } from 'lucide-react';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function NewRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  const [materialOptions, setMaterialOptions] = useState<any[]>([]);
  const [colorOptions, setColorOptions] = useState<any[]>([]);
  
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    const fetchUserAndOptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      const { data: mats } = await supabase.from('materials').select('*').eq('is_active', true).order('name');
      const { data: cols } = await supabase.from('colors').select('*').eq('is_active', true).order('name');
      
      if (mats && mats.length > 0) {
        setMaterialOptions(mats);
        setSelectedMaterial(mats[0].name);
      }
      if (cols && cols.length > 0) {
        setColorOptions(cols);
        setSelectedColor(cols[0].name);
      }
    };
    fetchUserAndOptions();
  }, []);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) setFile(e.dataTransfer.files[0]);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0]);
  };
  const removeFile = () => { setFile(null); setUploadProgress(0); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return setError("Kullanıcı oturumu bulunamadı.");
    if (!file) return setError("Lütfen bir 3D model dosyası yükleyin.");
    if (file.size > 50 * 1024 * 1024) return setError("Dosya boyutu maksimum 50MB olabilir.");
    
    setLoading(true); setError(null); setUploadProgress(0);
    let createdRequestId: string | null = null; 

    try {
      const { data: requestData, error: requestError } = await supabase
        .from("print_requests")
        .insert({ user_id: userId, title, description, material: selectedMaterial, color: selectedColor, quantity })
        .select().single();

      if (requestError) throw new Error(requestError.message);
      createdRequestId = requestData.id;

      const uploadApiRes = await fetch("/api/upload", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, requestId: createdRequestId, mimeType: file.type }),
      });
      
      const { uploadUrl, filePath, error: apiError } = await uploadApiRes.json();
      if (apiError) throw new Error(apiError);

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl, true);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) setUploadProgress(Math.round((event.loaded / event.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response);
          else reject(new Error("Dosya yüklenemedi."));
        };
        xhr.onerror = () => reject(new Error("Ağ hatası oluştu."));
        xhr.send(file);
      });

      const completeRes = await fetch("/api/upload/complete", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: createdRequestId, filePath, filename: file.name, filesize: file.size, fileMime: file.type }),
      });

      const completeData = await completeRes.json();
      if (completeData.error) throw new Error(completeData.error);

      router.push('/dashboard');
    } catch (err: any) {
      if (createdRequestId) await supabase.from("print_requests").delete().eq("id", createdRequestId);
      setError(err.message || "Bir hata oluştu.");
      setLoading(false); setUploadProgress(0);
    }
  };

  return (
    <main className="flex-1 p-6 lg:p-10 overflow-y-auto w-full">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 bg-surface hover:bg-surface-hover border border-slate-800 rounded-lg transition-colors group">
            <ArrowLeft size={20} className="text-slate-400 group-hover:text-white" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Yeni 3D Baskı Talebi</h1>
            <p className="text-sm text-slate-400 mt-1">Modelinizi yükleyin ve tercihlerinizi belirleyin.</p>
          </div>
        </div>

        <div className="bg-surface border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl p-6 sm:p-10">
          
          {error && (
            <div className="mb-6 p-4 bg-danger/10 border border-danger/50 rounded-xl text-danger text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-8">
            
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Box size={16} className="text-primary"/> 3D Model Dosyası
              </label>
              
              {!file ? (
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-10 transition-all duration-200 ${isDragging ? 'border-primary bg-primary/5' : 'border-slate-700 bg-surface-hover hover:border-slate-500'}`}
                >
                  <UploadCloud size={36} className="text-slate-400 mb-3" />
                  <p className="text-sm text-slate-300 mb-1">Dosyanızı buraya sürükleyin veya</p>
                  <label className="text-primary hover:text-primary-hover font-medium cursor-pointer transition-colors">
                    bilgisayardan seçin
                    <input type="file" className="hidden" accept=".stl,.obj,.3mf,.step,.stp,.iges,.igs,.blend,.f3d" onChange={handleFileChange} />
                  </label>
                  <p className="text-xs text-slate-500 mt-2">Maksimum 50MB (.stl, .obj, .step vb.)</p>
                </div>
              ) : (
                <div className="bg-surface-hover border border-primary/30 rounded-xl p-4 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <Box size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                      <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button type="button" onClick={removeFile} disabled={loading} className="p-2 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors disabled:opacity-50">
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>

            <hr className="border-slate-800/60" />

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <FileText size={16} className="text-primary"/> Proje Adı
              </label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn: Drone Pervane Koruyucu" className="w-full bg-surface-hover border border-slate-700/60 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Layers size={16} className="text-primary"/> Açıklama & Notlar
              </label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Baskı yönü, doluluk oranı gibi özel isteklerinizi buraya yazabilirsiniz..." className="w-full bg-surface-hover border border-slate-700/60 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Settings size={16} className="text-primary"/> Malzeme Türü
                </label>
                <select value={selectedMaterial} onChange={(e) => setSelectedMaterial(e.target.value)} className="w-full bg-surface-hover border border-slate-700/60 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none transition-all">
                  {materialOptions.length === 0 ? <option value="">Yükleniyor...</option> : materialOptions.map(mat => <option key={mat.id} value={mat.name}>{mat.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Palette size={16} className="text-indigo-400"/> Baskı Rengi
                </label>
                <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="w-full bg-surface-hover border border-slate-700/60 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none transition-all">
                  {colorOptions.length === 0 ? <option value="">Yükleniyor...</option> : colorOptions.map(col => <option key={col.id} value={col.name}>{col.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Üretim Adedi</label>
                <input type="number" min="1" required value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} className="w-full bg-surface-hover border border-slate-700/60 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </div>
            </div>

            <div className="mt-8">
              {uploadProgress > 0 && uploadProgress < 100 ? (
                <div className="w-full bg-surface-hover rounded-xl p-4 border border-primary/30 shadow-lg">
                  <div className="flex justify-between text-xs text-slate-300 font-medium mb-2">
                    <span>Model Yükleniyor...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !userId || !file || materialOptions.length === 0}
                  className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-medium rounded-xl py-4 flex justify-center items-center gap-2 transition-all shadow-lg shadow-primary/20"
                >
                  {loading ? 'Talep İşleniyor...' : <>Talebi Kaydet <UploadCloud size={18} /></>}
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </main>
  );
}