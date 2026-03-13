
'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

export function RealtimeToastListener() {
    const { user } = useAuth();
    const { addToast } = useUIStore();

    useEffect(() => {
        if (!user) return;

        // Escuchar cambios en el progreso de la academia
        const progressChannel = supabase
            .channel('academy-progress-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'user_academy_progress'
                },
                (payload: any) => {
                    const { status, user_id } = payload.new;
                    
                    // Solo mostramos toast si la lección es NUEVA para completar
                    // y el usuario es el actual
                    if (status === 'COMPLETED' && user_id === user.id) {
                        addToast(
                            '¡Has completado una lección con éxito!',
                            'success',
                            '¡Felicidades!'
                        );
                    }
                }
            )
            .subscribe();

        // Escuchar nuevos mensajes del director
        const messagesChannel = supabase
            .channel('director-messages-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'directfeedback',
                    filter: `recipient_id=eq.${user.id}`
                },
                (payload: any) => {
                    addToast(
                        payload.new.content,
                        'info',
                        'Nuevo mensaje del Director'
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(progressChannel);
            supabase.removeChannel(messagesChannel);
        };
    }, [user, addToast]);

    return null; // Componente invisible que solo gestiona lógica
}
