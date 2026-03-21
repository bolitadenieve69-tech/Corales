'use client';

import { lazy, Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ChevronRight, Music, BookOpen, Target, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useLesson, useCompleteLesson } from '@/hooks/useAcademy';
import { MusicalFigure } from '@/components/academy/MusicalFigure';

const RhythmExercise = lazy(() =>
    import('@/components/academy/RhythmExercise').then(m => ({ default: m.RhythmExercise }))
);

const FIGURE_LABELS: Record<string, string> = {
    'q': 'Negra', 'h': 'Blanca', 'w': 'Redonda',
    '8': 'Corchea', '16': 'Semicorchea', '32': 'Fusa',
    'rq': 'Sil. Negra', 'rh': 'Sil. Blanca', 'rw': 'Sil. Redonda',
    'r8': 'Sil. Corchea', 'qr': 'Sil. Negra',
    'q.': 'Negra c/punt.', 'h.': 'Blanca c/punt.',
};

const LEVEL_LABEL: Record<string, string> = {
    INICIACION: 'Iniciación', ELEMENTAL: 'Elemental', BASICO: 'Básico',
};

export default function LessonDetailPage() {
    const { lessonId } = useParams();
    const router = useRouter();
    const id = (Array.isArray(lessonId) ? lessonId[0] : lessonId as string) ?? '';

    const { data: lesson, isLoading, error, refetch } = useLesson(id);
    const completeLesson = useCompleteLesson();

    const [completed, setCompleted] = useState(false);
    const [exercisesPassed, setExercisesPassed] = useState(false);

    const handleComplete = () => {
        const hasExercises = !!(lesson?.exercises?.length);
        if (hasExercises && !exercisesPassed) return;
        completeLesson.mutate(id, {
            onSettled: () => {
                setCompleted(true);
                setTimeout(() => router.push('/academy'), 1800);
            },
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-neutral-400">
                <Loader2 className="animate-spin" size={32} />
                <p className="text-sm">Cargando lección...</p>
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className="max-w-3xl mx-auto">
                <Link href="/academy" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8 text-sm">
                    <ArrowLeft size={16} /> Volver a la Academia
                </Link>
                <div className="flex flex-col items-center justify-center h-48 bg-primary-800 border border-white/10 rounded-3xl text-neutral-500 gap-4">
                    <p>No se pudo cargar la lección.</p>
                    <button
                        onClick={() => refetch()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-neutral-400 hover:text-white hover:border-white/20 transition-all"
                    >
                        <RefreshCw size={14} /> Reintentar
                    </button>
                </div>
            </div>
        );
    }

    const hasExercises = !!(lesson.exercises?.length);
    const canComplete = !hasExercises || exercisesPassed;

    let content: any = {};
    try {
        content = typeof lesson.content === 'string' ? JSON.parse(lesson.content) : (lesson.content || {});
    } catch { /* keep empty */ }

    const lessonType = lesson.lesson_type || lesson.type || 'RHYTHM';
    const isRhythm = lessonType === 'RHYTHM';
    const theoryText = content?.theory || content?.text;
    const notations: string[] = (content?.notations || []).filter(
        (n: string) => n && !['|', '~'].some(s => n.includes(s)) && !n.startsWith('(')
    );

    return (
        <div className="max-w-3xl mx-auto pb-28 space-y-6 animate-in fade-in duration-400">

            {/* Top nav */}
            <div className="flex items-center justify-between pt-2">
                <Link
                    href="/academy"
                    className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    Academia
                </Link>
                <div className="flex items-center gap-2">
                    {lesson.level && (
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                            {LEVEL_LABEL[lesson.level] || lesson.level}
                        </span>
                    )}
                    <span className="px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary-300">
                        Unidad {lesson.order}
                    </span>
                </div>
            </div>

            {/* Title block */}
            <div className="space-y-3">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    isRhythm
                        ? 'bg-primary-500/10 border-primary-500/20 text-primary-300'
                        : 'bg-accent-500/10 border-accent-500/20 text-accent-500'
                }`}>
                    {isRhythm ? <Music size={11} /> : <BookOpen size={11} />}
                    {isRhythm ? 'Lectura Rítmica' : 'Teoría Musical'}
                </div>

                <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight leading-tight">
                    {lesson.title}
                </h1>

                {lesson.description && (
                    <p className="text-neutral-400 text-base leading-relaxed max-w-xl">
                        {lesson.description}
                    </p>
                )}

                {lesson.goal && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-neutral-300">
                        <Target size={13} className="text-accent-500 shrink-0" />
                        <span>
                            <span className="font-bold text-accent-500">Objetivo:</span> {lesson.goal}
                        </span>
                    </div>
                )}
            </div>

            {/* Theory / Explanation */}
            {theoryText && (
                <div className="bg-primary-800 border border-white/10 rounded-2xl p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-3">
                        {isRhythm ? 'Concepto' : 'Fundamento teórico'}
                    </p>
                    <p className="text-neutral-200 leading-relaxed text-base whitespace-pre-line">
                        {theoryText}
                    </p>
                </div>
            )}

            {/* Musical figures */}
            {notations.length > 0 && (
                <div className="bg-accent-500/5 border border-accent-500/10 rounded-2xl p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-accent-500/60 mb-5">
                        Figuras de esta unidad
                    </p>
                    <div className="flex flex-wrap gap-5">
                        {notations.map((note, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2 group">
                                <div className="w-16 h-16 flex items-center justify-center bg-white/5 rounded-2xl border border-white/5 group-hover:border-accent-500/30 group-hover:bg-white/10 transition-all">
                                    <MusicalFigure type={note} size={40} color="white" />
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 group-hover:text-accent-500 transition-colors text-center leading-tight">
                                    {FIGURE_LABELS[note] || note}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Rhythm exercise OR callout */}
            {hasExercises ? (
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 px-1">
                        Ejercicio de práctica
                    </p>
                    <Suspense fallback={<div className="h-32 bg-primary-800 border border-white/10 rounded-2xl animate-pulse" />}>
                        {lesson.exercises!.map((ex: any) => (
                            <RhythmExercise
                                key={ex.id}
                                exercise={ex}
                                onCompleted={(passed: boolean) => setExercisesPassed(passed)}
                            />
                        ))}
                    </Suspense>
                </div>
            ) : (
                <div className="bg-primary-800 border border-white/10 rounded-2xl p-5 flex items-start gap-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isRhythm ? 'bg-primary-500/20' : 'bg-accent-500/20'}`}>
                        {isRhythm
                            ? <Music size={16} className="text-primary-300" />
                            : <BookOpen size={16} className="text-accent-500" />}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white mb-1">
                            {isRhythm ? 'Practica con el metrónomo' : 'Asimila el concepto'}
                        </p>
                        <p className="text-sm text-neutral-400 leading-relaxed">
                            {isRhythm
                                ? 'Entona las figuras de esta unidad a 60 bpm. Cuando te sientas seguro, marca la lección como completada.'
                                : 'Cuando hayas comprendido el fundamento, completa la lección para desbloquear la siguiente.'}
                        </p>
                    </div>
                </div>
            )}

            {/* ── Sticky completion footer ── */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-primary-900/95 backdrop-blur-md border-t border-white/10 px-4 sm:px-8 py-4 flex items-center gap-4">
                <p className="text-sm text-neutral-500 hidden sm:block flex-1">
                    {completed
                        ? '¡Lección superada!'
                        : (hasExercises && !exercisesPassed)
                            ? 'Supera el ejercicio para continuar'
                            : 'Cuando estés listo, continúa.'}
                </p>

                <button
                    onClick={handleComplete}
                    disabled={completeLesson.isPending || completed || !canComplete}
                    className={`flex items-center gap-2 px-7 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 ml-auto ${
                        completed
                            ? 'bg-emerald-500 text-white cursor-default'
                            : !canComplete
                                ? 'bg-white/5 text-neutral-600 border border-white/5 cursor-not-allowed'
                                : 'bg-accent-500 text-primary-900 hover:bg-accent-400 shadow-glow-accent'
                    } disabled:opacity-60`}
                >
                    {completeLesson.isPending ? (
                        <><Loader2 size={15} className="animate-spin" /> Guardando...</>
                    ) : completed ? (
                        <><CheckCircle2 size={15} /> ¡Completada!</>
                    ) : (
                        <>Completar y continuar <ChevronRight size={15} /></>
                    )}
                </button>
            </div>

            {/* Success overlay */}
            <AnimatePresence>
                {completed && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                    >
                        <div className="bg-emerald-500 text-white px-10 py-6 rounded-3xl shadow-2xl flex items-center gap-4">
                            <CheckCircle2 size={40} />
                            <div>
                                <h4 className="text-xl font-bold">¡Excelente!</h4>
                                <p className="opacity-80 text-sm">Siguiente lección desbloqueada.</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
