'use client';

import React, { useState } from 'react';
import { Calendar, Save, X, Loader2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface SeasonFormProps {
    choirId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export const SeasonForm = ({ choirId, onSuccess, onCancel }: SeasonFormProps) => {
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await fetchApi(`/management/choir/${choirId}/seasons`, {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    start_date: startDate || null,
                    end_date: endDate || null,
                    choir_id: choirId
                })
            });
            onSuccess();
        } catch (err) {
            console.error("Error creating season", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-primary-900/90 backdrop-blur-md p-8 rounded-[2rem] border border-white/20 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                    <Calendar className="text-accent-500" />
                    Nueva Temporada
                </h2>
                <button
                    onClick={onCancel}
                    className="p-2 text-neutral-500 hover:text-white transition-colors"
                    aria-label="Cerrar modal"
                    title="Cerrar"
                >
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-primary-300 uppercase tracking-widest pl-1">Nombre de la Temporada</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Curso 2025-2026"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-accent-500/50 focus:outline-none transition-all"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="start-date" className="text-xs font-bold text-primary-300 uppercase tracking-widest pl-1">Fecha Inicio</label>
                        <input
                            id="start-date"
                            type="date"
                            title="Fecha de inicio"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-accent-500/50 focus:outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="end-date" className="text-xs font-bold text-primary-300 uppercase tracking-widest pl-1">Fecha Fin (Opcional)</label>
                        <input
                            id="end-date"
                            type="date"
                            title="Fecha de fin"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-accent-500/50 focus:outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="pt-4 flex gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all font-ui"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !name}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-accent-500 text-primary-900 font-bold hover:bg-accent-400 disabled:opacity-50 transition-all shadow-glow-accent font-ui"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Crear Temporada
                    </button>
                </div>
            </form>
        </div>
    );
};
