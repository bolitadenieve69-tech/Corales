'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, CheckCircle, Music, Clock, Bell } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useUIStore } from '@/store/uiStore';

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

export function DirectorMessages() {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMessages = async () => {
            try {
                const data = await fetchApi('/users/me/feedback');
                setMessages(data || []);
            } catch (err) {
                console.error("Error loading messages", err);
            } finally {
                setLoading(false);
            }
        };
        loadMessages();
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await fetchApi(`/users/me/feedback/${id}/read`, { method: 'PUT' });
            setMessages(prev => prev.map(m => m.id === id ? { ...m, read_at: new Date().toISOString() } : m));
            useUIStore.getState().addToast('Mensaje marcado como leído', 'success');
        } catch (err) {
            console.error("Error marking as read", err);
        }
    };

    if (loading) return null;
    if (messages.length === 0) return null;

    const unreadCount = messages.filter(m => !m.read_at).length;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl mx-auto mt-16 bg-primary-800/40 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-md"
        >
            <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent-500/20 flex items-center justify-center text-accent-500 border border-accent-500/20">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-white text-xl">Notas del Director</h3>
                        <p className="text-[10px] text-neutral-500 font-black tracking-widest uppercase">Indicaciones personales y técnica vocal</p>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <div className="flex items-center gap-2 bg-accent-500 text-primary-900 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-glow-accent">
                        <Bell size={12} className="animate-bounce" />
                        {unreadCount} nuevas
                    </div>
                )}
            </div>

            <div className="divide-y divide-white/5 max-h-[450px] overflow-y-auto scrollbar-hide">
                <AnimatePresence>
                    {messages.map((msg, index) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-8 hover:bg-white/5 transition-all relative ${!msg.read_at ? 'bg-accent-500/5' : 'opacity-60 grayscale-[0.5]'}`}
                        >
                            <div className="flex gap-6">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-accent-500 bg-accent-500/10 px-2 py-0.5 rounded">Director</span>
                                            <span className="text-neutral-400 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                                                <Clock size={12} />
                                                {timeAgo(msg.created_at)}
                                            </span>
                                        </div>
                                        {!msg.read_at && (
                                            <button
                                                onClick={() => markAsRead(msg.id)}
                                                className="text-[10px] font-black uppercase tracking-widest text-primary-300 hover:text-white transition-colors flex items-center gap-1.5 p-1 hover:bg-white/5 rounded"
                                                title="Marcar como leído"
                                            >
                                                <CheckCircle size={14} />
                                                Leído
                                            </button>
                                        )}
                                    </div>

                                    <p className="text-base text-neutral-200 leading-relaxed font-medium italic border-l-2 border-accent-500/30 pl-4 py-1">
                                        "{msg.content}"
                                    </p>

                                    {msg.work_id && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-xl w-fit">
                                            <Music size={14} className="text-primary-300" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary-300">Apunte de Obra</span>
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
