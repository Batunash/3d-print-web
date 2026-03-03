"use client";

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Supabase'in oturum durumunu sürekli arkada dinler
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      
      // Eğer token yenilenirse (1 saat dolduğunda) veya yeni giriş yapıldığında
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          // Tarayıcıdaki çerezi (cookie) ÇAKTIRMADAN günceller! Sayfa çökmez.
          document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=604800;`;
        }
      } 
      // Kullanıcı çıkış yaparsa çerezi temizle ve logine at
      else if (event === 'SIGNED_OUT') {
        document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.push('/auth/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return <>{children}</>;
}