"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface ProgressControlsProps {
    workId: string;
}

export default function ProgressControls({ workId }: ProgressControlsProps) {
    const [status, setStatus] = useState<string>('NUEVA');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleUpdate = async (newStatus: string) => {
        setLoading(true);
        setStatus(newStatus);
        setMessage('');

        try {
            const res = await fetch('http://127.0.0.1:8000/api/v1/progress/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    work_id: workId,
                    status: newStatus,
                    minutes_practiced: 0
                })
            });

            if (!res.ok) throw new Error('Error al actualizar progreso');

            setMessage('Estado actualizado');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error(error);
            setMessage('Error de red');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#0a0a1a] border border-white/10 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-medium text-white mb-4">Mi Progreso de Estudio</h3>

            <div className="flex flex-wrap gap-3">
                <button
                    onClick={() => handleUpdate('NUEVA')}
                    disabled={loading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${status === 'NUEVA' ? 'bg-slate-800 border-slate-500 text-white' : 'bg-black/50 border-white/10 text-slate-400 hover:bg-white/5'}`}
                >
                    <Circle size={16} />
                    <span>Nueva</span>
                </button>

                <button
                    onClick={() => handleUpdate('EN_PROGRESO')}
                    disabled={loading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${status === 'EN_PROGRESO' ? 'bg-blue-900/50 border-blue-500/50 text-blue-300' : 'bg-black/50 border-white/10 text-slate-400 hover:bg-white/5'}`}
                >
                    <Loader2 size={16} className={status === 'EN_PROGRESO' ? 'animate-spin' : ''} />
                    <span>En Progreso</span>
                </button>

                <button
                    onClick={() => handleUpdate('DOMINADA')}
                    disabled={loading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${status === 'DOMINADA' ? 'bg-emerald-900/50 border-emerald-500/50 text-emerald-300' : 'bg-black/50 border-white/10 text-slate-400 hover:bg-white/5'}`}
                >
                    <CheckCircle2 size={16} />
                    <span>Dominada</span>
                </button>
            </div>

            {message && (
                <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-sm text-blue-400"
                >
                    {message}
                </motion.p>
            )}
        </div>
    );
}
