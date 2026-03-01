"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Filter, Music, ChevronRight, FileAudio, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

export default function LibraryPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [works, setWorks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApi('/works/?skip=0&limit=100')
            .then(data => {
                if (data) {
                    setWorks(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching works", err);
                setLoading(false);
            });
    }, []);

    const filteredWorks = works.filter(w =>
        w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.composer && w.composer.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Biblioteca Musical</h1>
                    <p className="text-slate-400">Gestiona las obras, partituras y audios de tu coro.</p>
                </div>
                <Link href="/library/upload" className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20">
                    <Plus size={18} /> Añadir Obra Privada
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por título o compositor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a1a] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    />
                </div>
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0a0a1a] border border-white/10 hover:bg-white/5 text-slate-300 rounded-xl font-medium transition-colors">
                    <Filter size={18} /> Filtros
                </button>
            </div>

            {/* Works List */}
            <div className="bg-[#0a0a1a] border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/50">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <div className="col-span-12 sm:col-span-5">Obra</div>
                    <div className="hidden sm:block col-span-3">Compositor</div>
                    <div className="hidden sm:block col-span-2 text-center">Formato</div>
                    <div className="hidden sm:block col-span-2 text-right">Archivos</div>
                </div>

                <div className="divide-y divide-white/5">
                    {loading ? (
                        <div className="p-12 text-center flex flex-col items-center text-slate-500">
                            <Loader2 className="animate-spin text-blue-500 mb-2" size={32} />
                            <p>Cargando catálogo...</p>
                        </div>
                    ) : filteredWorks.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            No se encontraron obras.
                        </div>
                    ) : (
                        filteredWorks.map((work, i) => (
                            <Link href={`/library/${work.id}`} key={work.id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group cursor-pointer"
                                >
                                    <div className="col-span-12 sm:col-span-5 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                            <Music size={18} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-200 group-hover:text-white transition-colors">{work.title}</p>
                                            <p className="text-sm text-slate-500 sm:hidden mt-0.5">{work.composer || 'Anónimo'}</p>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex col-span-3 items-center text-slate-400">
                                        {work.composer || 'Anónimo'}
                                    </div>
                                    <div className="hidden sm:flex col-span-2 items-center justify-center">
                                        <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-white/5 text-xs text-slate-300 font-medium whitespace-nowrap overflow-hidden text-ellipsis select-none">
                                            {work.voice_format || 'SATB'}
                                        </span>
                                    </div>
                                    <div className="col-span-12 sm:col-span-2 flex items-center justify-between sm:justify-end gap-4 mt-3 sm:mt-0">
                                        <div className="flex gap-3 text-slate-500 sm:hidden">
                                            <div className="flex items-center gap-1 text-xs">
                                                <FileText size={14} /> Partituras
                                            </div>
                                            <div className="flex items-center gap-1 text-xs">
                                                <FileAudio size={14} /> Audios
                                            </div>
                                        </div>
                                        <div className="hidden sm:flex items-center gap-3">
                                            <span className="text-xs font-medium text-slate-400 bg-white/5 px-2 py-1 rounded-md flex items-center gap-1.5 border border-white/5">
                                                <FileText size={12} className="text-amber-400/80" /> {work.editions_count || '?'}
                                            </span>
                                            <span className="text-xs font-medium text-slate-400 bg-white/5 px-2 py-1 rounded-md flex items-center gap-1.5 border border-white/5">
                                                <FileAudio size={12} className="text-indigo-400/80" /> {work.assets_count || '?'}
                                            </span>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-600 group-hover:text-blue-400 transition-colors transform group-hover:translate-x-1" />
                                    </div>
                                </motion.div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
