import React from 'react';
import UserSidebar from '@/components/UserSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background text-slate-200 font-sans">
      <UserSidebar />
      {/* Sayfa içerikleri (page.tsx'ler) bu alana gelecek */}
      {children}
    </div>
  );
}