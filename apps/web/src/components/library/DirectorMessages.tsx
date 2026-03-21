'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, CheckCircle, Music, Clock, Bell, AlertCircle, RefreshCw } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { useUIStore } from '@/store/uiStore';

interface FeedbackMessage {
    id: string;
    content: string;
    created_at: string;
    read_at: string | null;
    work_id?: string | null;
}

function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'ahora mismo';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours} horas`;
    const days = Math.floor(hours / 24);
    return `hace ${days} días`;
}

function MessageSkeleton() {
    return (
        <div
            className="w-full max-w-4xl mx-auto mt-16 bg-white border border-neutral-100 rounded-[2.5rem] shadow-2xl overflow-hidden"
            aria-busy="true"
            aria-label="Cargando indicaciones del director"
        >
            <div className="p-10 border-b border-neutral-100 bg-neutral-50/50 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-neutral-100 animate-pulse shrink-0" />
                <div className="space-y-2 flex-1">
                    <div className="h-7 w-48 bg-neutral-100 rounded-lg animate-pulse" />
                    <div className="h-4 w-64 bg-neutral-100 rounded-lg animate-pulse" />
                </div>
            </div>
            {[1, 2].map(i => (
                <div key={i} className="p-10 space-y-4 border-b border-neutral-100 last:border-0">
                    <div className="flex gap-3">
                        <div className="h-5 w-20 bg-neutral-100 rounded-full animate-pulse" />
                        <div className="h-5 w-28 bg-neutral-100 rounded-full animate-pulse" />
                    </div>
                    <div className="h-6 w-full bg-neutral-100 rounded-lg animate-pulse" />
                    <div className="h-6 w-3/4 bg-neutral-100 rounded-lg animate-pulse" />
                </div>
            ))}
        </div>
    );
}

export function DirectorMessages() {
    const queryClient = useQueryClient();

    const { data: messages = [], isLoading, isError, refetch } = useQuery<FeedbackMessage[]>({
        queryKey: ['director-messages'],
        queryFn: async () => {
            const data = await fetchApi('/users/me/feedback');
            return (data ?? []) as FeedbackMessage[];
        },
        staleTime: 30_000,
    });

    const markAsRead = async (id: string) => {
        try {
            await fetchApi(`/users/me/feedback/${id}/read`, { method: 'PUT' });
            queryClient.setQueryData<FeedbackMessage[]>(['director-messages'], old =>
                (old ?? []).map(m => m.id === id ? { ...m, read_at: new Date().toISOString() } : m)
            );
            useUIStore.getState().addToast('Mensaje marcado como leído', 'success');
        } catch {
            useUIStore.getState().addToast('Error al marcar como leído', 'error');
        }
    };

    if (isLoading) return <MessageSkeleton />;

    if (isError) return (
        <div className="w-full max-w-4xl mx-auto mt-16 bg-white border border-red-100 rounded-[2.5rem] shadow-2xl overflow-hidden p-12 flex flex-col items-center text-center gap-4">
            <AlertCircle className="text-red-400" size={40} />
            <p className="text-neutral-500">No se pudieron cargar las indicaciones del director.</p>
            <button
                onClick={() => refetch()}
                className="flex items-center gap-2 px-5 py-2 bg-primary-500 text-white rounded-full font-bold text-sm hover:bg-primary-800 transition-all active:scale-95"
            >
                <RefreshCw size={15} /> Reintentar
            </button>
        </div>
    );

    if (messages.length === 0) return (
        <div className="w-full max-w-4xl mx-auto mt-16 bg-white border border-neutral-100 rounded-[2.5rem] shadow-sm overflow-hidden px-10 py-12 flex flex-col items-center gap-4 text-center">
            <CheckCircle className="text-emerald-400" size={44} />
            <div>
                <h3 className="font-display font-bold text-foreground text-xl">Sin indicaciones pendientes</h3>
                <p className="text-neutral-400 text-sm mt-1">El director no ha dejado notas recientes. ¡Todo va genial, a ensayar!</p>
            </div>
        </div>
    );

    const unreadCount = messages.filter(m => !m.read_at).length;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl mx-auto mt-16 bg-white border border-neutral-100 rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
            <div className="p-10 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-primary-500 border border-primary-500/20 shadow-sm">
                        <MessageSquare size={28} />
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-foreground text-2xl">Notas del Maestro</h3>
                        <p className="text-[10px] text-primary-500 font-bold tracking-widest uppercase mt-0.5">Indicaciones personales y técnica vocal</p>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <div className="flex items-center gap-2 bg-primary-500 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20">
                        <Bell size={14} className="animate-bounce" />
                        {unreadCount} nuevas
                    </div>
                )}
            </div>

            <div className="divide-y divide-neutral-100 max-h-[500px] overflow-y-auto scrollbar-hide">
                <AnimatePresence>
                    {messages.map((msg, index) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-10 hover:bg-neutral-50 transition-all relative ${!msg.read_at ? 'bg-primary-50/30' : 'opacity-60'}`}
                        >
                            <div className="flex gap-6">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-500 bg-primary-100 px-3 py-1 rounded-full">Director</span>
                                            <span className="text-neutral-400 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                                                <Clock size={14} />
                                                {timeAgo(msg.created_at)}
                                            </span>
                                        </div>
                                        {!msg.read_at && (
                                            <button
                                                onClick={() => markAsRead(msg.id)}
                                                className="text-[10px] font-bold uppercase tracking-widest text-primary-500 hover:text-white hover:bg-primary-500 transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary-500/20"
                                                title="Marcar como leído"
                                            >
                                                <CheckCircle size={16} />
                                                Finalizar
                                            </button>
                                        )}
                                    </div>

                                    <p className="text-lg text-foreground leading-relaxed font-display font-medium border-l-4 border-primary-500/20 pl-6 py-2">
                                        &ldquo;{msg.content}&rdquo;
                                    </p>

                                    {msg.work_id && (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 border border-neutral-200 rounded-xl w-fit">
                                            <Music size={14} className="text-primary-500" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">Apunte de Obra</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
