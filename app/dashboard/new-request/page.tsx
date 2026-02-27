"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UploadCloud, FileText, Settings, Layers, Box, Trash2 } from 'lucide-react';
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
  
  // --- YENİ: Dosya UX State'leri ---
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Form State'leri
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('PLA');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    fetchUser();
  }, []);

  // --- YENİ: Sürükle-Bırak UX Fonksiyonları ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  const removeFile = () => {
    setFile(null);
    setUploadProgress(0); // Dosya silinince progress'i sıfırla
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return setError("Kullanıcı oturumu bulunamadı.");
    if (!file) return setError("Lütfen bir 3D model dosyası yükleyin.");
    
    if (file.size > 50 * 1024 * 1024) {
      return setError("Dosya boyutu maksimum 50MB olabilir.");
    }
    
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    // Hata durumunda silmek için ID'yi hafızada tutacağımız değişken
    let createdRequestId: string | null = null; 

    try {
      // 1. ÖNCE TALEBİ OLUŞTUR
      const { data: requestData, error: requestError } = await supabase
        .from("print_requests")
        .insert({ user_id: userId, title, description, material, quantity })
        .select()
        .single();

      if (requestError) throw new Error(requestError.message);
      
      createdRequestId = requestData.id; // ID'yi hafızaya al

      // 2. SIGNED URL AL
      const uploadApiRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, requestId: createdRequestId, mimeType: file.type }),
      });
      
      const { uploadUrl, filePath, error: apiError } = await uploadApiRes.json();
      if (apiError) throw new Error(apiError);

      // 3. DOSYAYI STORAGE'A YÜKLE (XHR ile Progress Bar takibi)
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl, true);
        xhr.setRequestHeader("Content-Type", file.type);

        // İlerleme anlık olarak buraya düşer
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            reject(new Error("Dosya yüklenemedi."));
          }
        };

        xhr.onerror = () => reject(new Error("Yükleme sırasında ağ hatası oluştu."));
        
        xhr.send(file);
      });

      // 4. VERİTABANINA DOSYA METADATASINI KAYDET
      const completeRes = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: createdRequestId,
          filePath,
          filename: file.name,
          filesize: file.size,
          fileMime: file.type,
        }),
      });

      const completeData = await completeRes.json();
      if (completeData.error) throw new Error(completeData.error);

      // 5. HER ŞEY KUSURSUZ ÇALIŞTI -> YÖNLENDİR
      router.push('/dashboard');
      
    } catch (err: any) {
      // 🚨 ROLLBACK (GERİ ALMA) İŞLEMİ 🚨
      // Eğer bir hata olduysa ve talep DB'de oluşmuşsa, o içi boş talebi sil
      if (createdRequestId) {
        await supabase.from("print_requests").delete().eq("id", createdRequestId);
      }
      
      setError(err.message || "Yükleme sırasında bir hata oluştu.");
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 font-sans p-6 lg:p-10">
      <div className="max-w-3xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 bg-[#121824] hover:bg-[#1a2233] border border-slate-800 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-slate-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Yeni 3D Baskı Talebi</h1>
            <p className="text-sm text-slate-400">Modelinizi yükleyin ve tercihlerinizi belirleyin.</p>
          </div>
        </div>

        <div className="bg-[#121824] border border-slate-800/60 rounded-xl overflow-hidden shadow-xl p-6 sm:p-10">
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-8">
            
            {/* --- DOSYA YÜKLEME ALANI UX --- */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Box size={16} className="text-blue-400"/> 3D Model Dosyası
              </label>
              
              {!file ? (
                // Dosya Seçilmediyse: Sürükle Bırak Alanı
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-all duration-200 ${isDragging ? 'border-blue-500 bg-blue-500/5' : 'border-slate-700 bg-[#1a2233] hover:border-slate-500'}`}
                >
                  <UploadCloud size={32} className="text-slate-400 mb-3" />
                  <p className="text-sm text-slate-300 mb-1">Dosyanızı buraya sürükleyin veya</p>
                  <label className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer">
                    bilgisayardan seçin
                    <input type="file" className="hidden" accept=".stl,.obj,.3mf,.step,.stp,.iges,.igs,.blend,.f3d" onChange={handleFileChange} />
                  </label>
                  <p className="text-xs text-slate-500 mt-2">Maksimum 50MB (.stl,.obj,.3mf,.step,.stp,.iges,.igs,.blend,.f3d)</p>
                </div>
              ) : (
                // Dosya Seçildiyse: Seçilen Dosya Kartı
                <div className="bg-[#1a2233] border border-blue-500/30 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400">
                      <Box size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                      <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button type="button" onClick={removeFile} disabled={loading} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Yatay Ayırıcı Çizgi */}
            <hr className="border-slate-800/60" />

            {/* Proje Adı */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <FileText size={16} className="text-blue-400"/> Proje Adı
              </label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn: Drone Pervane Koruyucu" className="w-full bg-[#1a2233] border border-slate-700/60 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>

            {/* Açıklama */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Layers size={16} className="text-blue-400"/> Açıklama & Notlar
              </label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Baskı yönü, doluluk oranı gibi özel isteklerinizi buraya yazabilirsiniz..." className="w-full bg-[#1a2233] border border-slate-700/60 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Materyal Seçimi */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Settings size={16} className="text-blue-400"/> Malzeme Türü
                </label>
                <select value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full bg-[#1a2233] border border-slate-700/60 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none">
                  <option value="PLA">PLA (Standart, Ekonomik)</option>
                  <option value="PETG">PETG (Dayanıklı, Esnek)</option>
                  <option value="ABS">ABS (Isıya Dayanıklı)</option>
                </select>
              </div>

              {/* Adet */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Üretim Adedi</label>
                <input type="number" min="1" required value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} className="w-full bg-[#1a2233] border border-slate-700/60 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </div>
            </div>

            {/* Gönder Butonu ve Progress Bar */}
            <div className="mt-8">
              {uploadProgress > 0 && uploadProgress < 100 ? (
                // Yükleniyor Durumu (Progress Bar)
                <div className="w-full bg-[#1a2233] rounded-lg p-4 border border-blue-500/30 shadow-lg">
                  <div className="flex justify-between text-xs text-slate-300 font-medium mb-2">
                    <span>Model Yükleniyor...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-out" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                // Normal Buton Durumu
                <button
                  type="submit"
                  disabled={loading || !userId || !file}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg py-4 flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                >
                  {loading ? 'Talep İşleniyor...' : <>Talebi Kaydet <UploadCloud size={18} /></>}
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}