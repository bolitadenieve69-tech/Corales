'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock, ArrowRight, Play, GraduationCap, Loader2, BookOpen, Music } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

export default function AcademyPage() {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApi('/academy/dashboard')
            .then(data => {
                setDashboardData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching academy dashboard", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 size={48} className="animate-spin text-primary-500 mb-4" />
                <p className="text-neutral-400 animate-pulse font-medium">Cargando tu camino musical...</p>
            </div>
        );
    }

    if (!dashboardData) return null;

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-24 animate-in fade-in duration-1000">
            {/* Premium Header */}
            <div className="relative rounded-[2rem] overflow-hidden bg-primary-800 border border-white/10 p-8 md:p-12 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800/80 to-indigo-900/40" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-500/10 border border-accent-500/20 rounded-full text-accent-500">
                            <GraduationCap size={16} />
                            <span className="font-bold uppercase tracking-[0.2em] text-[10px]">Escuela de Solfeo</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-display font-bold text-white tracking-tight leading-none">
                            Tu Camino <br />de Aprendizaje
                        </h1>
                        <p className="text-lg text-neutral-300 max-w-lg leading-relaxed font-ui">
                            Domina el ritmo y la lectura musical con un sistema progresivo diseñado para coralistas.
                        </p>
                    </div>

                    <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-6 min-w-[320px] shadow-2xl space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Progreso Actual</p>
                                <p className="text-3xl font-black text-white font-mono flex items-baseline gap-1">
                                    {dashboardData.total_lessons > 0 ? Math.round((dashboardData.completed_lessons / dashboardData.total_lessons) * 100) : 0}
                                    <span className="text-sm text-accent-500">%</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Lecciones</p>
                                <p className="text-white font-bold">{dashboardData.completed_lessons} / {dashboardData.total_lessons}</p>
                            </div>
                        </div>

                        <div className="relative h-4 bg-primary-900 rounded-full overflow-hidden border border-white/5 ring-4 ring-black/20">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${dashboardData.total_lessons > 0 ? (dashboardData.completed_lessons / dashboardData.total_lessons) * 100 : 0}%` }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-600 to-accent-400 shadow-[0_0_15px_var(--color-accent-500)]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Path Title */}
            <div className="flex items-center justify-between px-4">
                <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-4">
                    <span className="w-12 h-px bg-primary-500/30" />
                    Ritmo y Lectura 1
                    <span className="w-12 h-px bg-primary-500/30" />
                </h2>
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.3em]">Nivel Iniciación</span>
            </div>

            {/* The Map (Zig-Zag Path) */}
            <div className="relative max-w-3xl mx-auto py-12">
                {/* SVG Connecting Path */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d={generatePath(dashboardData.lessons.length)}
                        fill="none"
                        stroke="url(#pathGradient)"
                        strokeWidth="4"
                        strokeDasharray="12 8"
                        strokeLinecap="round"
                        className="opacity-10 translate-x-[50%] md:translate-x-[50%]"
                    />
                    <defs>
                        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="var(--color-primary-500)" />
                            <stop offset="100%" stopColor="var(--color-accent-gold)" />
                        </linearGradient>
                    </defs>
                </svg>

                <div className="relative space-y-24">
                    {dashboardData.lessons.map((lesson: any, index: number) => {
                        const isCompleted = index < dashboardData.completed_lessons;
                        const isUnlocked = index <= dashboardData.completed_lessons;
                        const isLocked = !isUnlocked;
                        const isCurrent = lesson.id === dashboardData.current_lesson_id;
                        const isLeft = index % 2 === 0;

                        return (
                            <motion.div
                                key={lesson.id}
                                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                className={`flex items-center w-full ${isLeft ? 'justify-start md:pl-12' : 'justify-end md:pr-12'}`}
                            >
                                <div className={`flex items-center gap-8 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                                    {/* The Node */}
                                    <div className="relative">
                                        {isCurrent && (
                                            <motion.div
                                                animate={{ scale: [1, 1.4, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl"
                                            />
                                        )}
                                        <Link
                                            href={isUnlocked ? `/academy/${lesson.id}` : '#'}
                                            className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${!isUnlocked ? 'bg-neutral-200 border-neutral-300 text-neutral-400 scale-90' :
                                                isCurrent ? 'bg-primary-500 border-white/20 text-white shadow-glow-primary scale-110 active:scale-95' :
                                                    isCompleted ? 'bg-accent-gold border-white/10 text-white shadow-lg hover:scale-105' :
                                                        'bg-white border-neutral-200 text-neutral-400 hover:border-primary-500/50 hover:text-primary-500 shadow-sm'
                                                }`}
                                        >
                                            {isCompleted ? <CheckCircle2 size={32} /> :
                                                !isUnlocked ? <Lock size={28} /> :
                                                    <Play size={32} className={isCurrent ? 'translate-x-0.5' : ''} />}

                                            {/* Order Number Badge */}
                                            <div className="absolute -top-1 -right-1 w-7 h-7 bg-white rounded-full border border-neutral-200 flex items-center justify-center text-[10px] font-black text-neutral-600 shadow-sm">
                                                {index + 1}
                                            </div>
                                        </Link>
                                    </div>

                                    {/* Content Card */}
                                    <Link
                                        href={isUnlocked ? `/academy/${lesson.id}` : '#'}
                                        className={`group relative flex flex-col items-center p-6 rounded-[2rem] transition-all duration-500 hover:scale-105 ${isLocked
                                            ? 'bg-neutral-100 border border-neutral-200 opacity-60 grayscale cursor-not-allowed'
                                            : 'bg-white border border-neutral-200 hover:border-primary-500/30 hover:shadow-2xl shadow-sm'
                                            }`}
                                    >
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:rotate-6 ${isLocked ? 'bg-neutral-200 text-neutral-400' : 'bg-primary-100 text-primary-500 group-hover:bg-primary-500 group-hover:text-white'
                                            }`}>
                                            {lesson.lesson_type === 'RHYTHM' ? <Music size={28} /> :
                                                lesson.lesson_type === 'THEORY' ? <BookOpen size={28} /> :
                                                    <GraduationCap size={28} />}
                                        </div>
                                        <div className="space-y-2 text-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary-500">
                                                {lesson.lesson_type === 'RHYTHM' ? 'Ritmo' : 'Teoría'}
                                            </p>
                                            <h3 className="font-display font-bold text-foreground leading-tight text-xl">{lesson.title}</h3>
                                            <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed font-medium">{lesson.description}</p>
                                        </div>

                                        {isUnlocked && (
                                            <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-neutral-400 group-hover:text-primary-500 transition-colors">
                                                {isCompleted ? 'Volver a ver' : 'Comenzar ahora'} <ArrowRight size={14} className="text-primary-500" />
                                            </div>
                                        )}
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Invitation */}
            <div className="text-center py-24 px-8 bg-white border border-neutral-200 rounded-[3rem] shadow-sm">
                <div className="max-w-md mx-auto space-y-6">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto border border-primary-500/10">
                        <GraduationCap size={32} className="text-primary-500" />
                    </div>
                    <h3 className="text-3xl font-display font-bold text-foreground">Próximo Nivel</h3>
                    <p className="text-neutral-500 font-medium">Continúa practicando para desbloquear ejercicios de armonía y entrenamiento auditivo avanzado.</p>
                </div>
            </div>
        </div>
    );
}

// Utility to calculate zig-zag SVG path
function generatePath(count: number) {
    let path = `M 50% 0 `;
    for (let i = 0; i < count; i++) {
        const y = i * 160 + 80;
        const x = i % 2 === 0 ? '45%' : '55%';
        path += `L ${x} ${y} `;
    }
    return path;
}
