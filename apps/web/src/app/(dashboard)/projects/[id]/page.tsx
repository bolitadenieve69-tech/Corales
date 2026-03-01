'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit3, Trash2, Calendar, Music, Plus, PlayCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import ProjectProgress from './project-progress';

const MOCK_PROJECT = {
    id: '1',
    name: 'Concierto de Navidad 2024',
    description: 'Repertorio completo para el concierto de Navidad en la Catedral.',
    date: '2024-12-20',
    isPublished: true,
    repertoire: [
        { id: '101', work_title: 'Adeste Fideles', order: 1 },
        { id: '102', work_title: 'O Holy Night', order: 2 },
        { id: '103', work_title: 'Hallelujah Chorus (Handel)', order: 3 },
    ]
};

export default function ProjectDetailPage() {
    const params = useParams();
    const [project] = useState(MOCK_PROJECT);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Actions */}
            <div className="flex items-center justify-between mt-2">
                <Link
                    href="/projects"
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium bg-white/5 py-1.5 px-3 rounded-full hover:bg-white/10"
                >
                    <ArrowLeft size={16} />
                    Volver a Proyectos
                </Link>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                        <Edit3 size={16} /> Editar
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-full transition-colors">
                        <Trash2 size={16} /> Eliminar
                    </button>
                </div>
            </div>

            {/* Main Info */}
            <div className="bg-[#0a0a1a] border border-white/10 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        {project.isPublished ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide uppercase">Publicado</span>
                        ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-500/20 text-slate-400 text-xs font-semibold tracking-wide uppercase">Borrador</span>
                        )}
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-4">{project.name}</h1>
                    <p className="text-slate-400 max-w-2xl text-lg leading-relaxed">{project.description}</p>

                    <div className="flex items-center gap-6 mt-8 p-4 bg-white/5 rounded-xl inline-flex backdrop-blur-sm border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Calendar size={20} className="text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Fecha</p>
                                <p className="text-white font-medium">{new Date(project.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-lg">
                                <Music size={20} className="text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Repertorio</p>
                                <p className="text-white font-medium">{project.repertoire.length} obras</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Repertoire Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                        <Music size={24} className="text-blue-500" /> Repertorio
                    </h2>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all text-sm">
                        <Plus size={16} /> Añadir Obra
                    </button>
                </div>

                <div className="bg-[#0a0a1a] border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/50">
                    <ul className="divide-y divide-white/5">
                        {project.repertoire.map((item, i) => (
                            <motion.li
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 border border-white/5">
                                        {item.order}
                                    </div>
                                    <span className="font-medium text-lg text-slate-200 group-hover:text-white transition-colors">{item.work_title}</span>
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-full">
                                    <PlayCircle size={20} />
                                </button>
                            </motion.li>
                        ))}
                        {project.repertoire.length === 0 && (
                            <li className="p-8 text-center text-slate-500">
                                No hay obras asignadas a este proyecto.
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Progress Module (MVP) */}
            <ProjectProgress projectId={project.id} />
        </div>
    );
}
