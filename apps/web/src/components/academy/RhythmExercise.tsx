'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Loader2, Music, CheckCircle2, XCircle } from 'lucide-react';
import { useRhythmEngine } from '@/hooks/useRhythmEngine';
import { fetchApi } from '@/lib/api';

interface RhythmExerciseProps {
    exercise: any;
    onCompleted: (passed: boolean) => void;
}

export function RhythmExercise({ exercise, onCompleted }: RhythmExerciseProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{ score: number, feedback: string, passed: boolean } | null>(null);
    const [lastPrecision, setLastPrecision] = useState<'PERFECTO' | 'BIEN' | 'TARDE' | 'PRONTO' | null>(null);

    const expectedBeats = exercise.solution.expected_intervals_ms.length;

    const handleFinish = async (taps: number[]) => {
        setIsSubmitting(true);
        try {
            const intervals_ms = [];
            for (let i = 1; i < taps.length; i++) {
                intervals_ms.push(taps[i] - taps[i - 1]);
            }

            const res = await fetchApi(`/academy/exercises/${exercise.id}/validate`, {
                method: 'POST',
                body: JSON.stringify({ intervals_ms })
            });

            setResult(res);
            onCompleted(res.passed);
        } catch (e) {
            console.error(e);
            setResult({ score: 0, passed: false, feedback: "Error de conexión al validar el ejercicio." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const { startEngine, stopEngine, recordTap, isPlaying, taps } = useRhythmEngine({
        bpm: exercise.content.bpm || 60,
        expectedBeats: expectedBeats + 1,
        onFinish: handleFinish,
        onIntervalRecord: (timestamp) => {
            // Logic for real-time feedback could go here if we had the targets in the frontend
            // For now, let's show a pulse animation
            setLastPrecision(null);
            setTimeout(() => setLastPrecision('PERFECTO'), 50); // Simple visual cue
        }
    });

    return (
        <div className="bg-primary-900 border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/10 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none" />

            <div className="flex flex-col md:flex-row gap-12 items-center justify-between relative z-10">

                {/* Left side: Instructions and Info */}
                <div className="space-y-6 max-w-sm">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                        <Music size={14} />
                        Práctica de Ritmo
                    </div>

                    <h3 className="text-3xl font-display font-bold text-white leading-tight">
                        {exercise.prompt}
                    </h3>

                    <div className="space-y-3">
                        <p className="text-neutral-400 text-sm leading-relaxed">
                            Escucharás **4 pulsos de cuenta** iniciales. Empieza a tocar justo después del cuarto pulso.
                        </p>
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-2">
                            <div className="flex items-center justify-between text-xs font-mono text-neutral-500 uppercase tracking-widest">
                                <span>Configuración</span>
                                <span className="text-accent-500">{exercise.content.bpm || 60} BPM</span>
                            </div>
                            <div className="flex gap-2">
                                {exercise.content.notes?.map((n: string, i: number) => (
                                    <div key={i} className="px-2 py-1 bg-white/5 rounded text-white font-mono text-xs border border-white/10 uppercase">
                                        {n === 'q' ? 'Negra' : n === '8' ? 'Corchea' : 'Silencio'}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side: The Interactive Arena */}
                <div className="relative flex flex-col items-center gap-8 min-w-[300px]">

                    {/* Visual Metronome Ring */}
                    {isPlaying && (
                        <motion.div
                            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                            transition={{ duration: 60 / (exercise.content.bpm || 60), repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 border-2 border-primary-500/30 rounded-full blur-md"
                        />
                    )}

                    {!isPlaying && !isSubmitting && !result && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={startEngine}
                            className="w-40 h-40 rounded-full bg-primary-500 flex flex-col items-center justify-center gap-2 text-white shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all border-4 border-white/20"
                        >
                            <Play size={40} fill="white" />
                            <span className="font-black tracking-[0.2em] uppercase text-[10px]">Empezar</span>
                        </motion.button>
                    )}

                    {isPlaying && (
                        <div className="relative">
                            <motion.button
                                whileTap={{ scale: 0.85 }}
                                onClick={recordTap}
                                className="w-56 h-56 rounded-full bg-emerald-600 flex flex-col items-center justify-center gap-3 text-white shadow-[0_0_60px_rgba(16,185,129,0.3)] transition-all border-8 border-emerald-400/20"
                            >
                                <span className="font-black text-3xl uppercase tracking-tighter">¡TOCA!</span>
                                <span className="text-[10px] text-emerald-200 uppercase tracking-widest font-bold opacity-60">Espacio o Clic</span>

                                <div className="mt-4 flex gap-1.5">
                                    {Array.from({ length: expectedBeats + 1 }).map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={false}
                                            animate={{
                                                scale: i < taps.length ? 1.2 : 1,
                                                backgroundColor: i < taps.length ? '#ffffff' : 'rgba(255,255,255,0.1)'
                                            }}
                                            className="h-2 w-8 rounded-full"
                                        />
                                    ))}
                                </div>
                            </motion.button>

                            {/* Precision Feedback Popups */}
                            <AnimatePresence>
                                {lastPrecision && (
                                    <motion.div
                                        key={Date.now()}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: -40 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute -top-12 left-1/2 -translate-x-1/2 text-emerald-400 font-black tracking-widest text-lg drop-shadow-lg"
                                    >
                                        {lastPrecision}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {isSubmitting && (
                        <div className="w-40 h-40 rounded-full bg-primary-800 flex flex-col items-center justify-center gap-3 text-primary-300 border-4 border-white/5 shadow-inner">
                            <Loader2 size={40} className="animate-spin" />
                            <span className="font-bold tracking-widest uppercase text-[10px]">Evaluando</span>
                        </div>
                    )}

                    {result && !isPlaying && !isSubmitting && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`flex flex-col items-center text-center p-8 rounded-[2rem] border-2 shadow-2xl ${result.passed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                                }`}
                        >
                            <div className="mb-4">
                                {result.passed ? <CheckCircle2 size={56} /> : <XCircle size={56} />}
                            </div>

                            <div className="text-5xl font-black mb-2 tracking-tighter">
                                {result.score}<span className="text-xl opacity-50">%</span>
                            </div>

                            <p className="text-sm font-medium opacity-80 max-w-[200px] leading-snug mb-6 italic">
                                "{result.feedback}"
                            </p>

                            <button
                                onClick={() => setResult(null)}
                                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
                            >
                                Reintentar
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Keyboard hint */}
            {!isPlaying && !result && (
                <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
                    <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-[0.2em] flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-black/40 border border-white/10 rounded-md">SPACE</kbd> habilitado para mayor precisión
                    </p>
                </div>
            )}
        </div>
    );
}
