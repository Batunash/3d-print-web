import Link from 'next/link';
import { Box } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center text-slate-200 font-sans p-6">
      
      {/* Logo ve İkon */}
      <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/30">
        <Box size={32} className="text-white" />
      </div>
      
      {/* Başlık ve Açıklama */}
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center text-white tracking-tight">
        PrintCraft 3D'ye Hoş Geldiniz
      </h1>
      <p className="text-slate-400 text-lg mb-12 text-center max-w-xl leading-relaxed">
        Katmanlı üretimin yeni nesil yönetim platformu. Modellerinizi yükleyin, malzemeleri seçin ve baskılarınızı gerçek zamanlı takip edin.
      </p>
      
      {/* Yönlendirme Butonları */}
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Link 
          href="/auth/login" 
          className="flex justify-center bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-lg font-medium transition-all shadow-lg shadow-blue-600/20"
        >
          Giriş Yap
        </Link>
        
        <Link 
          href="/auth/register" 
          className="flex justify-center bg-[#1a2233] hover:bg-[#232d42] border border-slate-700/60 text-white px-8 py-3.5 rounded-lg font-medium transition-all"
        >
          Hesap Oluştur
        </Link>
      </div>

    </div>
  );
}