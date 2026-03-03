import React from 'react';

export default function LoadingSpinner({ message = "Yükleniyor..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[200px] text-slate-400 gap-4">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="font-medium animate-pulse">{message}</p>
    </div>
  );
}