import React from 'react';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background text-slate-200 font-sans">
      <AdminSidebar />
      {children}
    </div>
  );
}