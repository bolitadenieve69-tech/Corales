'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Music, BookOpen, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface ActivityOptionProps {
    title: string;
    description: string;
    icon: React.ElementType;
    href: string;
    color: string;
    index: number;
}

const ActivityOption = ({ title, description, icon: Icon, href, color, index }: ActivityOptionProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
    >
        <Link
            href={href}
            className="group block relative p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-accent-500/30 hover:bg-white/10 transition-all duration-300 overflow-hidden"
        >
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl rounded-full -mr-16 -mt-16 bg-${color}`} />

            <div className="flex flex-col gap-6 relative z-10">
                <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-${color} border border-white/10 group-hover:scale-110 group-hover:shadow-lg transition-transform duration-300`}>
                    <Icon size={32} />
                </div>

                <div className="space-y-2">
                    <h3 className="text-2xl font-display font-bold text-white group-hover:text-accent-300 transition-colors">
                        {title}
                    </h3>
                    <p className="text-neutral-400 text-sm leading-relaxed max-w-[200px]">
                        {description}
                    </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-300 group-hover:text-accent-500 group-hover:translate-x-1 transition-all">
                    Comenzar ahora
                    <ChevronRight size={14} />
                </div>
            </div>
        </Link>
    </motion.div>
);

export const ActivitySelector = () => {
    return (
        <div className="py-12 px-6 max-w-5xl mx-auto text-center space-y-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-500 text-xs font-bold uppercase tracking-widest">
                    <Sparkles size={14} />
                    Bienvenido de nuevo
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-white">
                    ¿Qué te apetece hoy?
                </h2>
                <p className="text-primary-100/60 max-w-md mx-auto">
                    Elige cómo quieres seguir creciendo musicalmente hoy.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <ActivityOption
                    title="Ensayar"
                    description="Repasa tus obras, ajusta los canales de voz y prepárate para el siguiente concierto."
                    icon={Music}
                    href="/seasons"
                    color="accent-500"
                    index={0}
                />
                <ActivityOption
                    title="Aprender"
                    description="Mejora tu lectura musical y ritmo con lecciones interactivas y divertidas."
                    icon={BookOpen}
                    href="/academy"
                    color="primary-300"
                    index={1}
                />
            </div>
        </div>
    );
};
