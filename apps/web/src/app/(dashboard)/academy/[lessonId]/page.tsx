'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ChevronRight, Play, Info } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { RhythmExercise } from '@/components/academy/RhythmExercise';

export default function LessonDetailPage() {
    const { lessonId } = useParams();
    const router = useRouter();
    const [lesson, setLesson] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);
    const [completed, setCompleted] = useState(false);

    // Exercise state
    const [hasExercises, setHasExercises] = useState(false);
    const [exercisesPassed, setExercisesPassed] = useState(true);

    useEffect(() => {
        if (!lessonId) return;

        fetchApi(`/academy/lessons/${lessonId}`)
            .then(data => {
                setLesson(data);

                // Check for exercises
                if (data.exercises && data.exercises.length > 0) {
                    setHasExercises(true);
                    setExercisesPassed(false); // Must pass to complete
                }

                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching lesson", err);
                setLoading(false);
            });
    }, [lessonId]);

    const handleComplete = async () => {
        if (hasExercises && !exercisesPassed) return;

        setCompleting(true);
        try {
            await fetchApi(`/academy/lessons/${lessonId}/complete`, { method: 'POST' });
            setCompleted(true);
            setTimeout(() => {
                router.push('/academy');
            }, 2000);
        } catch (err) {
            console.error("Error completing lesson", err);
        } finally {
            setCompleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-neutral-600">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p>Cargando lección...</p>
            </div>
        );
    }

    if (!lesson) return null;

    const content = typeof lesson.content === 'string' ? JSON.parse(lesson.content) : lesson.content;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Nav */}
            <div className="flex items-center justify-between">
                <Link href="/academy" className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Volver a la Academia</span>
                </Link>
                <div className="px-4 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-300 text-xs font-bold uppercase tracking-widest">
                    Lección {lesson.order}
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-primary-800 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-8 border-b border-white/5 bg-gradient-to-r from-blue-600/5 to-transparent">
                    <h1 className="text-3xl font-bold text-white mb-4">{lesson.title}</h1>
                    <p className="text-neutral-300 text-lg leading-relaxed">
                        {lesson.description}
                    </p>
                </div>

                {/* Content Area */}
                <div className="p-8 space-y-8">
                    {/* Theory Section */}
                    {content?.theory && (
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex gap-4">
                            <div className="p-3 bg-primary-500/20 text-primary-300 rounded-xl h-fit">
                                <Info size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Fundamento Teórico</h3>
                                <div className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
                                    {content.theory || content.text}
                                </div>
                            </div>
                        </div>
                    )}

                    {content?.text && !content?.theory && (
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex gap-4">
                            <div className="p-3 bg-primary-500/20 text-primary-300 rounded-xl h-fit">
                                <Info size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Teoría</h3>
                                <div className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
                                    {content.text}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Interactive Goal Section */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Play size={20} className="text-emerald-400" />
                            Tu Objetivo
                        </h3>

                        {hasExercises ? (
                            <div className="space-y-6">
                                {lesson.exercises.map((ex: any) => (
                                    <RhythmExercise
                                        key={ex.id}
                                        exercise={ex}
                                        onCompleted={(passed) => setExercisesPassed(passed)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                                <p className="text-xl text-white font-medium">"{lesson.goal}"</p>
                                <p className="text-emerald-400/80 text-sm font-bold uppercase tracking-widest">
                                    Lección puramente teórica
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-8 bg-black/40 border-t border-white/5 flex items-center justify-between">
                    <div className="text-neutral-600 text-sm">
                        {completed ? '¡Lección superada!' :
                            (hasExercises && !exercisesPassed) ? 'Debes superar los ejercicios para avanzar' :
                                '¿Has entendido los conceptos?'}
                    </div>
                    <button
                        onClick={handleComplete}
                        disabled={completing || completed || (hasExercises && !exercisesPassed)}
                        className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all ${completed ? 'bg-emerald-500 text-white cursor-default'
                                : (hasExercises && !exercisesPassed) ? 'bg-primary-700 text-neutral-600 cursor-not-allowed border border-slate-700'
                                    : 'bg-primary-500 hover:bg-primary-500 text-white shadow-xl shadow-glow-primary active:scale-95'
                            } disabled:opacity-50`}
                    >
                        {completing ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : completed ? (
                            <CheckCircle2 size={22} />
                        ) : (
                            <>
                                <span>Marcar como Completada</span>
                                <ChevronRight size={20} />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Success Animation */}
            <AnimatePresence>
                {completed && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                    >
                        <div className="bg-emerald-500 text-white px-12 py-6 rounded-3xl shadow-2xl flex items-center gap-4">
                            <CheckCircle2 size={48} />
                            <div>
                                <h4 className="text-2xl font-bold">¡Excelente!</h4>
                                <p className="opacity-90">Siguiente lección desbloqueada.</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
