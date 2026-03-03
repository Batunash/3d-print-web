import React from 'react';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background text-slate-200 font-sans overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col w-full h-screen overflow-y-auto pt-16 lg:pt-0">
        {children}
      </div>
    </div>
  );
}