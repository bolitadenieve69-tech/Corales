
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

export function useRealtime(tableName: string, callback: (payload: any) => void) {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        // Suscribirse a cambios en tiempo real en una tabla específica
        const channel = supabase
            .channel(`public:${tableName}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: tableName
                },
                (payload) => {
                    console.log('Realtime update received:', payload);
                    callback(payload);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [tableName, callback, user]);
}

/**
 * Hook específico para notificaciones (mensajes del director, feedback directo)
 */
export function useNotifications(onNewNotification: (notif: any) => void) {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('direct-feedback')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'directfeedback',
                    filter: `recipient_id=eq.${user.id}`
                },
                (payload) => {
                    onNewNotification(payload.new);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, onNewNotification]);
}
