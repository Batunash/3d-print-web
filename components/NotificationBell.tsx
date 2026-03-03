"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; // Merkezi istemci

export default function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserAndNotifications();

    // 🛡️ MEMORY LEAK KORUMASI: Component kapandığında WebSocket dinlemeyi durdur!
    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  const fetchUserAndNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) setNotifications(data);

      supabase
        .channel('custom-all-channel')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            setNotifications((prev) => [payload.new, ...prev]);
          }
        )
        .subscribe();
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id: string, link?: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    setIsOpen(false);
    if (link) router.push(link);
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  return (
    <div className="relative z-50">
      {/* bg-[#1a2233] yerine bg-surface-hover yapıldı */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 bg-surface-hover hover:bg-slate-800 rounded-lg text-slate-300 transition-colors border border-slate-700/60"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white shadow-lg animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        // bg-[#121824] yerine bg-surface yapıldı
        <div className="absolute right-0 mt-3 w-80 bg-surface border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[400px]">
          <div className="p-4 border-b border-slate-800/60 bg-surface-hover flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Bildirimler</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-[11px] text-primary hover:text-primary-hover flex items-center gap-1">
                <Check size={12} /> Tümünü Okundu İşaretle
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto custom-scrollbar flex-1">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500 italic">Hiç bildiriminiz yok.</div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => markAsRead(notif.id, notif.link)}
                    className={`p-4 cursor-pointer hover:bg-surface-hover transition-colors ${!notif.is_read ? 'bg-primary/10' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm ${!notif.is_read ? 'text-white font-semibold' : 'text-slate-300 font-medium'}`}>{notif.title}</h4>
                      {!notif.is_read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></span>}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-slate-500 block mt-2">
                      {new Date(notif.created_at).toLocaleDateString('tr-TR')} {new Date(notif.created_at).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}