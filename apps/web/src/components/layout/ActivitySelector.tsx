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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
    >
        <Link
            href={href}
            className="group block relative p-10 rounded-[2.5rem] bg-white border border-neutral-100 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden"
        >
            <div className={`absolute top-0 right-0 w-40 h-40 opacity-5 blur-3xl rounded-full -mr-16 -mt-16 bg-primary-500`} />

            <div className="flex flex-col gap-8 relative z-10">
                <div className={`w-20 h-20 rounded-[1.5rem] bg-neutral-50 flex items-center justify-center text-primary-500 border border-neutral-100 group-hover:bg-primary-500 group-hover:text-white transition-all duration-500`}>
                    <Icon size={40} />
                </div>

                <div className="space-y-3">
                    <h3 className="text-3xl font-display font-bold text-foreground">
                        {title}
                    </h3>
                    <p className="text-neutral-500 font-medium text-base leading-relaxed max-w-[240px]">
                        {description}
                    </p>
                </div>

                <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-primary-500 group-hover:gap-5 transition-all">
                    Explorar
                    <ChevronRight size={18} />
                </div>
            </div>
        </Link>
    </motion.div>
);

export const ActivitySelector = () => {
    return (
        <div className="py-12 px-6 max-w-5xl mx-auto text-center space-y-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary-100 text-primary-500 text-xs font-bold uppercase tracking-widest">
                    <Sparkles size={16} />
                    Director Edition
                </div>
                <h2 className="text-5xl md:text-7xl font-display font-bold text-foreground leading-tight">
                    ¿Qué ensayamos<br />hoy, maestro?
                </h2>
                <p className="text-neutral-500 font-medium text-lg max-w-lg mx-auto leading-relaxed">
                    Tu agrupación está lista. Selecciona un comando para comenzar la sesión de hoy.
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
