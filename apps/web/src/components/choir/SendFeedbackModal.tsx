'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Music, MessageSquare, Loader2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useUIStore } from '@/store/uiStore';

interface SendFeedbackModalProps {
    choirId: string;
    recipientId: string;
    recipientName: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export function SendFeedbackModal({ choirId, recipientId, recipientName, onSuccess, onCancel }: SendFeedbackModalProps) {
    const [content, setContent] = useState('');
    const [workId, setWorkId] = useState<string>('');
    const [works, setWorks] = useState<any[]>([]);
    const [loadingWorks, setLoadingWorks] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadWorks = async () => {
            try {
                const data = await fetchApi(`/works/choir/${choirId}`);
                setWorks(data || []);
            } catch (err) {
                console.error("Error loading works", err);
            } finally {
                setLoadingWorks(false);
            }
        };
        loadWorks();
    }, [choirId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setSubmitting(true);
        try {
            const result = await fetchApi(`/management/${choirId}/feedback`, {
                method: 'POST',
                body: JSON.stringify({
                    recipient_id: recipientId,
                    work_id: workId || null,
                    content: content
                })
            });

            if (result) {
                useUIStore.getState().addToast('Mensaje enviado correctamente', 'success');
                onSuccess();
            }
        } catch (err) {
            console.error("Error sending feedback", err);
            useUIStore.getState().addToast('Error al enviar el mensaje', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-primary-800 border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-display font-bold text-white">Nota para {recipientName}</h2>
                    <p className="text-xs text-neutral-500 font-black tracking-widest uppercase">Comunicación privada del director</p>
                </div>
                <button
                    onClick={onCancel}
                    className="p-2 hover:bg-white/5 rounded-full text-neutral-500 transition-all focus-ring"
                    title="Cerrar"
                >
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Work Selection (Optional) */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-primary-300 uppercase tracking-widest flex items-center gap-2 pl-1">
                        <Music size={14} />
                        Asociado a una obra (Opcional)
                    </label>
                    <select
                        aria-label="Seleccionar obra asociada"
                        value={workId}
                        onChange={(e) => setWorkId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-accent-500/50 focus:outline-none transition-all appearance-none text-sm"
                    >
                        <option value="" className="bg-primary-900 text-white">Generales / Técnica Vocal</option>
                        {works.map((work) => (
                            <option key={work.id} value={work.id} className="bg-primary-900 text-white">
                                {work.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-primary-300 uppercase tracking-widest flex items-center gap-2 pl-1">
                        <MessageSquare size={14} />
                        Mensaje
                    </label>
                    <textarea
                        required
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Ej. Mejora la proyección en el compás 24..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-accent-500/50 focus:outline-none transition-all min-h-[150px] text-sm resize-none"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500 font-bold uppercase tracking-widest px-1">
                        <span>{content.length} / 2000 caracteres</span>
                    </div>
                </div>

                <div className="flex gap-4 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-4 px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all focus-ring"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={submitting || !content.trim()}
                        className="flex-[2] py-4 px-6 rounded-2xl bg-accent-500 text-primary-900 font-bold hover:bg-accent-400 transition-all shadow-glow-accent disabled:opacity-50 flex items-center justify-center gap-2 focus-ring"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                        Enviar Nota
                    </button>
                </div>
            </form>
        </div>
    );
}
