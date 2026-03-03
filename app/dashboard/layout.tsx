import React from 'react';
import UserSidebar from '@/components/UserSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background text-slate-200 font-sans overflow-hidden">
      <UserSidebar />
      {/* Mobil düzeltmesi: Mobilde üstten boşluk (pt-16) bıraktık ki hamburger menü ile yazılar çakışmasın. Ayrıca ekranın dışına taşmayı engelledik. */}
      <div className="flex-1 flex flex-col w-full h-screen overflow-y-auto pt-16 lg:pt-0">
        {children}
      </div>
    </div>
  );
}