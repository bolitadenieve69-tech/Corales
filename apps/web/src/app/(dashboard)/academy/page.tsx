'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Lock, ArrowRight, Play, GraduationCap, BookOpen, Music } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAcademyDashboard } from '@/hooks/useAcademy';
import { QueryBoundary } from '@/components/layout/QueryBoundary';
import { useQuery } from '@tanstack/react-query'; // Assuming @tanstack/react-query is used

// Define a type for lessons if not already defined
interface Lesson {
    id: string;
    title: string;
    level: string;
    type: 'RHYTHM' | 'THEORY';
    order: number;
    completed?: boolean; // Optional for mock data
    content?: string; // Optional for mock data
    description?: string; // For actual lessons
    lesson_type?: 'RHYTHM' | 'THEORY'; // For actual lessons
}

export default function AcademyPage() {
    const { t } = useTranslation('academy');
    const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError, refetch: refetchDashboard } = useAcademyDashboard();
    const [activeLevel, setActiveLevel] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;

    // --- MOCK DATA FOR DEMO MODE ---
    const mockLessons: Lesson[] = [
        { id: 'm1', title: 'Las Figuras: La Negra', level: 'INICIACION', type: 'RHYTHM', order: 1, completed: true, content: 'Aprende el pulso básico.', description: 'Aprende el pulso básico.' },
        { id: 'm2', title: 'La Blanca y su silencio', level: 'INICIACION', type: 'RHYTHM', order: 2, completed: false, content: 'Sonidos de dos pulsos.', description: 'Sonidos de dos pulsos.' },
        { id: 'm3', title: 'El Pentagrama', level: 'ELEMENTAL', type: 'THEORY', order: 3, completed: false, content: 'Introducción a la notación.', description: 'Introducción a la notación.' },
        { id: 'm4', title: 'Clave de Sol', level: 'ELEMENTAL', type: 'THEORY', order: 4, completed: false, content: 'Notas en el espacio.', description: 'Notas en el espacio.' },
        { id: 'm5', title: 'Ejercicio de Corcheas', level: 'BASICO', type: 'RHYTHM', order: 5, completed: false, content: 'Dividiendo el pulso.', description: 'Dividiendo el pulso.' },
        { id: 'm6', title: 'Intervalos I', level: 'BASICO', type: 'THEORY', order: 6, completed: false, content: 'Distancias entre notas.', description: 'Distancias entre notas.' },
        { id: 'm7', title: 'Lección Extra 1', level: 'INICIACION', type: 'THEORY', order: 7, completed: false, description: 'Lección extra de teoría.' },
        { id: 'm8', title: 'Lección Extra 2', level: 'ELEMENTAL', type: 'RHYTHM', order: 8, completed: false, description: 'Lección extra de ritmo.' },
        { id: 'm9', title: 'Lección Extra 3', level: 'BASICO', type: 'THEORY', order: 9, completed: false, description: 'Otra lección de teoría.' },
        { id: 'm10', title: 'Lección Extra 4', level: 'INICIACION', type: 'RHYTHM', order: 10, completed: false, description: 'Otra lección de ritmo.' },
        { id: 'm11', title: 'Página 2 - Introducción', level: 'INICIACION', type: 'THEORY', order: 11, completed: false, description: 'Introducción a la segunda página.' },
        { id: 'm12', title: 'Página 2 - Ritmo Avanzado', level: 'ELEMENTAL', type: 'RHYTHM', order: 12, completed: false, description: 'Ritmo avanzado para la segunda página.' },
    ];

    const { data: lessons = [], isLoading: isLessonsLoading } = useQuery<Lesson[]>({
        queryKey: ['lessons'],
        queryFn: async () => {
            try {
                const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/academy/lessons`);
                if (!resp.ok) throw new Error('API down');
                return resp.json();
            } catch (e) {
                console.warn("Using Mock Data (API unavailable)", e);
                return mockLessons;
            }
        },
    });

    const levels = [
        { id: 'all', label: 'Todos', color: 'neutral' }, // Added 'all' level
        { id: 'INICIACION', label: 'Iniciación', color: 'primary' },
        { id: 'ELEMENTAL', label: 'Elemental', color: 'accent-gold' },
        { id: 'BASICO', label: 'Básico', color: 'emerald' }
    ];

    if (isDashboardLoading || isLessonsLoading) return <AcademySkeleton />; // Use combined loading state

    const filteredLessons = lessons
        .filter((l: Lesson) => activeLevel === 'all' || l.level === activeLevel)
        .sort((a, b) => a.order - b.order);
    
    return (
        <QueryBoundary isLoading={isDashboardLoading || isLessonsLoading} error={null} onRetry={() => refetchDashboard()}>
            {dashboardData && (() => {
                const levelCompletedCount = dashboardData.lessons.filter((l: any) => l.level === activeLevel && dashboardData.lessons.indexOf(l) < dashboardData.completed_lessons).length || 0;
                const levelTotalCount = filteredLessons.length || 1;
                const levelProgress = Math.round((levelCompletedCount / levelTotalCount) * 100);

                return (
                    <div className="max-w-5xl mx-auto space-y-12 pb-24 animate-in fade-in duration-1000">
                    {/* Premium Header */}
                    <div className="relative rounded-[3rem] overflow-hidden bg-primary-900 border border-white/10 p-8 md:p-12 shadow-2xl">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800/80 to-indigo-900/40" />
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-500/20 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
                            <div className="space-y-6">
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-500/10 border border-accent-500/20 rounded-full text-accent-500 shadow-glow-accent"
                                >
                                    <GraduationCap size={16} />
                                    <span className="font-bold uppercase tracking-[0.25em] text-[10px]">Escuela de Corales</span>
                                </motion.div>
                                <h1 className="text-6xl md:text-7xl font-display font-bold text-white tracking-tight leading-[0.9] drop-shadow-2xl">
                                    Tu Camino <br /><span className="text-accent-500">Musical</span>
                                </h1>
                                <p className="text-xl text-neutral-400 max-w-lg leading-relaxed font-ui">
                                    De la primera nota a la maestría coral. Un sistema progresivo basado en la práctica real.
                                </p>
                            </div>

                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 min-w-[340px] shadow-3xl space-y-6"
                            >
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Progreso Global</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-5xl font-black text-white font-mono tracking-tighter">
                                                {Math.round((dashboardData.completed_lessons / dashboardData.total_lessons) * 100)}
                                            </p>
                                            <span className="text-xl font-bold text-accent-500">%</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center text-primary-400 mb-3 ml-auto">
                                            <Music size={24} />
                                        </div>
                                        <p className="text-white font-mono text-sm font-bold opacity-60">
                                            {dashboardData.completed_lessons} / {dashboardData.total_lessons}
                                        </p>
                                    </div>
                                </div>

                                <div className="relative h-3 bg-primary-800 rounded-full overflow-hidden border border-white/5 shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(dashboardData.completed_lessons / dashboardData.total_lessons) * 100}%` }}
                                        transition={{ duration: 1.5, ease: "circOut" }}
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-600 to-accent-400 shadow-[0_0_20px_var(--color-accent-500)]"
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Level Selector Tabs */}
                    <div className="flex flex-col items-center gap-8">
                        <div className="bg-neutral-100 p-2 rounded-3xl border border-neutral-200 flex gap-2">
                            {levels.map((level) => (
                                <button
                                    key={level.id}
                                    onClick={() => {
                                        setActiveLevel(level.id);
                                        setCurrentPage(0);
                                    }}
                                    className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${
                                        activeLevel === level.id 
                                        ? 'bg-white text-primary-500 shadow-lg' 
                                        : 'text-neutral-500 hover:text-neutral-800'
                                    }`}
                                >
                                    {level.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 text-neutral-500">
                            <span className="text-[10px] font-black uppercase tracking-widest">Progreso {levels.find(l => l.id === activeLevel)?.label}</span>
                            <div className="w-48 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${levelProgress}%` }}
                                    className="h-full bg-primary-500"
                                />
                            </div>
                            <span className="text-[10px] font-mono font-bold">{levelProgress}%</span>
                        </div>
                    </div>

                    {/* The Map (Zig-Zag Path) */}
                    <div className="relative max-w-4xl mx-auto py-12">
                        <div className="relative space-y-24">
                            {filteredLessons.length === 0 && (
                                <div className="text-center py-20 bg-neutral-50 rounded-[3rem] border-2 border-dashed border-neutral-200">
                                    <Lock size={48} className="mx-auto text-neutral-300 mb-4" />
                                    <p className="text-neutral-500 font-medium">Completa el nivel anterior para desbloquear estas unidades.</p>
                                </div>
                            )}

                            {(() => {
                                const paginatedLessons = filteredLessons.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
                                const totalPages = Math.ceil(filteredLessons.length / pageSize);

                                return (
                                    <>
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={`${activeLevel}-${currentPage}`}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.4, ease: "circOut" }}
                                                className="space-y-24"
                                            >
                                                {paginatedLessons.map((lesson: any, index: number) => {
                                                    // Find global index to determine status correctly
                                                    const globalIndex = dashboardData.lessons.findIndex((l: any) => l.id === lesson.id);
                                                    const isCompleted = globalIndex < dashboardData.completed_lessons;
                                                    const isUnlocked = globalIndex <= dashboardData.completed_lessons;
                                                    const isLocked = !isUnlocked;
                                                    const isCurrent = lesson.id === dashboardData.current_lesson_id;
                                                    const isLeft = index % 2 === 0;

                                                    return (
                                                        <motion.div
                                                            key={lesson.id}
                                                            initial={{ opacity: 0, y: 30 }}
                                                            whileInView={{ opacity: 1, y: 0 }}
                                                            viewport={{ once: true }}
                                                            transition={{ delay: index * 0.05, duration: 0.5 }}
                                                            className={`flex items-center w-full ${isLeft ? 'justify-start lg:pl-20' : 'justify-end lg:pr-20'}`}
                                                        >
                                                            <div className={`flex items-center gap-12 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                                                                {/* The Node */}
                                                                <div className="relative group/node">
                                                                    {isCurrent && (
                                                                        <motion.div
                                                                            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                                                                            transition={{ duration: 2, repeat: Infinity }}
                                                                            className="absolute -inset-4 bg-primary-500/30 rounded-full blur-2xl"
                                                                        />
                                                                    )}
                                                                    <Link
                                                                        href={isUnlocked ? `/academy/${lesson.id}` : '#'}
                                                                        className={`relative z-10 w-24 h-24 rounded-[2rem] flex items-center justify-center border-4 transition-all duration-500 ${!isUnlocked ? 'bg-neutral-100 border-neutral-200 text-neutral-400 scale-90' :
                                                                            isCurrent ? 'bg-primary-500 border-white/30 text-white shadow-glow-primary scale-110 rotate-3' :
                                                                                isCompleted ? 'bg-accent-gold border-white/20 text-white shadow-lg -rotate-3 hover:rotate-0' :
                                                                                    'bg-white border-neutral-200 text-neutral-400 hover:border-primary-500/50 hover:text-primary-500 shadow-sm'
                                                                            }`}
                                                                    >
                                                                        {isCompleted ? <CheckCircle2 size={40} className="drop-shadow-md" /> :
                                                                            !isUnlocked ? <Lock size={32} /> :
                                                                                <Play size={40} className={isCurrent ? 'translate-x-1 outline-1' : ''} />}

                                                                        <div className="absolute -top-3 -right-3 w-9 h-9 bg-white rounded-2xl border-2 border-neutral-100 flex items-center justify-center text-[11px] font-black text-neutral-800 shadow-2xl group-hover/node:scale-110 transition-transform">
                                                                            {lesson.order}
                                                                        </div>
                                                                    </Link>
                                                                    
                                                                    {/* Connecting Dot for visual path */}
                                                                    {!isLeft && index < paginatedLessons.length - 1 && (
                                                                        <div className="absolute top-full left-1/2 w-1 h-24 bg-gradient-to-b from-neutral-200 to-transparent -translate-x-1/2 z-0" />
                                                                    )}
                                                                </div>

                                                                {/* Content Card */}
                                                                <Link
                                                                    href={isUnlocked ? `/academy/${lesson.id}` : '#'}
                                                                    className={`group relative flex flex-col items-center p-8 rounded-[2.5rem] transition-all duration-700 hover:scale-[1.03] ${isLocked
                                                                        ? 'bg-neutral-100/50 border border-neutral-200/50 opacity-40 grayscale blur-[1px]'
                                                                        : 'bg-white border border-neutral-200 hover:border-primary-500/30 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] shadow-sm'
                                                                        } w-64 md:w-80`}
                                                                >
                                                                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-inner transition-all duration-700 group-hover:scale-110 group-hover:-rotate-12 ${isLocked ? 'bg-neutral-200 text-neutral-400' : 'bg-primary-50/80 text-primary-500 group-hover:bg-primary-500 group-hover:text-white'
                                                                        }`}>
                                                                        {lesson.lesson_type === 'RHYTHM' ? <Music size={36} /> :
                                                                            lesson.lesson_type === 'THEORY' ? <BookOpen size={36} /> :
                                                                                <GraduationCap size={36} />}
                                                                    </div>
                                                                    <div className="space-y-3 text-center">
                                                                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary-400/80">
                                                                            {lesson.lesson_type === 'RHYTHM' ? 'Lectura Rítmica' : 'Teoría Musical'}
                                                                        </span>
                                                                        <h3 className="font-display font-bold text-neutral-900 leading-tight text-2xl group-hover:text-primary-600 transition-colors">{lesson.title}</h3>
                                                                        <p className="text-sm text-neutral-500 line-clamp-2 leading-relaxed font-ui">{lesson.description}</p>
                                                                    </div>

                                                                    {isUnlocked && (
                                                                        <div className="mt-8 flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-primary-500 transition-all">
                                                                            <div className="h-px w-6 bg-neutral-200 group-hover:w-10 group-hover:bg-primary-500 transition-all" />
                                                                            {isCompleted ? 'Repasar' : 'Comenzar'} 
                                                                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-2" />
                                                                        </div>
                                                                    )}
                                                                </Link>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </motion.div>
                                        </AnimatePresence>

                                        {/* Pagination Controls */}
                                        {totalPages > 1 && (
                                            <div className="flex justify-center items-center gap-6 mt-16 pt-8 border-t border-neutral-100">
                                                <button 
                                                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                                    disabled={currentPage === 0}
                                                    className="p-4 rounded-2xl bg-neutral-100 text-neutral-500 hover:bg-primary-500 hover:text-white disabled:opacity-30 disabled:hover:bg-neutral-100 disabled:hover:text-neutral-500 transition-all shadow-sm"
                                                    aria-label="Página anterior"
                                                >
                                                    <ArrowRight size={20} className="rotate-180" />
                                                </button>
                                                
                                                <div className="flex gap-2">
                                                    {Array.from({ length: totalPages }).map((_, i) => (
                                                        <button 
                                                            key={i}
                                                            onClick={() => setCurrentPage(i)}
                                                            className={`w-12 h-12 rounded-2xl font-black text-[11px] transition-all flex flex-col items-center justify-center gap-0.5 ${
                                                                currentPage === i 
                                                                ? 'bg-primary-500 text-white shadow-glow-primary scale-110' 
                                                                : 'bg-white text-neutral-400 border border-neutral-100 hover:border-primary-300'
                                                            }`}
                                                        >
                                                            <span className="opacity-40 text-[8px] leading-none">PAG</span>
                                                            <span className="leading-none">{i + 1}</span>
                                                        </button>
                                                    ))}
                                                </div>

                                                <button 
                                                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                                    disabled={currentPage === totalPages - 1}
                                                    className="p-4 rounded-2xl bg-neutral-100 text-neutral-500 hover:bg-primary-500 hover:text-white disabled:opacity-30 disabled:hover:bg-neutral-100 disabled:hover:text-neutral-500 transition-all shadow-sm"
                                                    aria-label="Siguiente página"
                                                >
                                                    <ArrowRight size={20} />
                                                </button>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Bottom Features */}
                    <div className="grid md:grid-cols-3 gap-8 pt-12">
                        {[
                            { icon: <Music />, title: 'Ejercicios Reales', desc: 'Practica con fragmentos de obras corales famosas.' },
                            { icon: <Play />, title: 'Audio Guía', desc: 'Escucha cómo debe sonar antes de intentarlo.' },
                            { icon: <CheckCircle2 />, title: 'Certificación', desc: 'Obtén tu diploma al completar los 3 niveles.' }
                        ].map((feat, i) => (
                            <div key={i} className="p-8 bg-white border border-neutral-200 rounded-[2.5rem] space-y-4 hover:shadow-xl transition-shadow">
                                <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-primary-500">
                                    {feat.icon}
                                </div>
                                <h4 className="text-xl font-display font-bold text-neutral-900">{feat.title}</h4>
                                <p className="text-sm text-neutral-500 leading-relaxed font-ui">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                    </div>
                );
            })()}
        </QueryBoundary>
    );
}

function AcademySkeleton() {
    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-24 animate-pulse">
            <div className="h-80 bg-neutral-200 rounded-[3rem]" />
            <div className="flex justify-center gap-4">
                <div className="h-12 w-32 bg-neutral-200 rounded-2xl" />
                <div className="h-12 w-32 bg-neutral-200 rounded-2xl" />
                <div className="h-12 w-32 bg-neutral-200 rounded-2xl" />
            </div>
            <div className="space-y-24 py-12">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`flex gap-12 items-center ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                        <div className="w-24 h-24 bg-neutral-200 rounded-[2rem]" />
                        <div className="w-80 h-48 bg-neutral-200 rounded-[2.5rem]" />
                    </div>
                ))}
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
