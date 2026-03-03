"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Filter, Music, ChevronRight, FileAudio, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

export default function LibraryPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('Todos');
    const [selectedEra, setSelectedEra] = useState('Todas');
    const [works, setWorks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFilterVisible, setIsFilterVisible] = useState(false);

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

    const genres = ['Todos', ...Array.from(new Set(works.map(w => w.genre).filter(Boolean)))];
    const eras = ['Todas', ...Array.from(new Set(works.map(w => w.era).filter(Boolean)))];

    const filteredWorks = works.filter(w => {
        const matchesSearch = w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (w.composer && w.composer.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesGenre = selectedGenre === 'Todos' || w.genre === selectedGenre;
        const matchesEra = selectedEra === 'Todas' || w.era === selectedEra;
        return matchesSearch && matchesGenre && matchesEra;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2 font-display">Biblioteca Musical</h1>
                    <p className="text-neutral-300 font-ui text-sm">Gestiona las obras, partituras y audios de tu coro.</p>
                </div>
                <Link href="/library/upload" className="flex items-center justify-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-300 text-primary-900 rounded-xl font-bold transition-all shadow-glow-accent hover:scale-[1.02] active:scale-95">
                    <Plus size={18} /> Añadir Obra Privada
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por título o compositor..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-primary-800 border border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-accent-500/50 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setIsFilterVisible(!isFilterVisible)}
                        className={`flex items-center justify-center gap-2 px-6 py-3 border rounded-xl font-medium transition-all ${isFilterVisible ? 'bg-accent-500/10 border-accent-500 text-accent-500' : 'bg-primary-800 border-white/10 text-neutral-300 hover:bg-white/5'}`}
                    >
                        <Filter size={18} /> {isFilterVisible ? 'Cerrar Filtros' : 'Filtros Avanzados'}
                    </button>
                </div>

                {isFilterVisible && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-6 bg-primary-800 border border-white/10 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Género / Tipo</label>
                            <div className="flex flex-wrap gap-2">
                                {genres.map(genre => (
                                    <button
                                        key={genre}
                                        onClick={() => setSelectedGenre(genre)}
                                        className={`px-4 py-1.5 rounded-full text-sm transition-all ${selectedGenre === genre ? 'bg-accent-500 text-primary-900 font-bold' : 'bg-primary-900 text-neutral-400 hover:text-white border border-white/5'}`}
                                    >
                                        {genre}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Época / Periodo</label>
                            <div className="flex flex-wrap gap-2">
                                {eras.map(era => (
                                    <button
                                        key={era}
                                        onClick={() => setSelectedEra(era)}
                                        className={`px-4 py-1.5 rounded-full text-sm transition-all ${selectedEra === era ? 'bg-primary-500 text-white font-bold' : 'bg-primary-900 text-neutral-400 hover:text-white border border-white/5'}`}
                                    >
                                        {era}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Works List / Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full p-20 text-center flex flex-col items-center gap-4 text-neutral-600 bg-primary-800/50 rounded-3xl border border-white/5 border-dashed">
                        <Loader2 className="animate-spin text-primary-500" size={40} />
                        <p className="text-lg font-medium">Sincronizando biblioteca...</p>
                    </div>
                ) : filteredWorks.length === 0 ? (
                    <div className="col-span-full p-20 text-center text-neutral-500 bg-primary-800/50 rounded-3xl border border-white/5 border-dashed">
                        <div className="mb-4 inline-flex p-4 rounded-full bg-primary-900/50 text-neutral-700">
                            <Music size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No se encontraron obras</h3>
                        <p>Prueba a ajustar los filtros o la búsqueda.</p>
                        {(selectedGenre !== 'Todos' || selectedEra !== 'Todas' || searchQuery !== '') && (
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedGenre('Todos'); setSelectedEra('Todas'); }}
                                className="mt-6 text-accent-500 hover:text-accent-300 font-medium underline underline-offset-4"
                            >
                                Limpiar todos los filtros
                            </button>
                        )}
                    </div>
                ) : (
                    filteredWorks.map((work, i) => (
                        <motion.div
                            key={work.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Link href={`/library/${work.id}`} className="block h-full group">
                                <div className="h-full bg-primary-800 rounded-2xl border border-white/10 p-6 flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-black/60 hover:-translate-y-1 relative overflow-hidden group-hover:border-accent-500/50">

                                    {/* Glass gradient background on hover */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/10 blur-3xl rounded-full -translate-y-16 translate-x-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                    {/* Icon / Thumbnail Box */}
                                    <div className="w-12 h-12 rounded-xl bg-primary-900 flex items-center justify-center border border-white/5 text-primary-300 mb-5 group-hover:bg-accent-500 group-hover:text-primary-900 transition-all duration-300 shadow-inner">
                                        <Music size={24} strokeWidth={1.5} />
                                    </div>

                                    {/* Text Info */}
                                    <h3 className="text-xl font-display font-bold text-white mb-1 line-clamp-2 leading-tight">
                                        {work.title}
                                    </h3>
                                    <p className="text-sm font-ui text-neutral-400 mb-6 flex items-center gap-2">
                                        <span className="font-semibold text-neutral-300">{work.composer || 'Anónimo'}</span>
                                        {work.genre && <span className="w-1 h-1 rounded-full bg-neutral-700"></span>}
                                        {work.genre && <span>{work.genre}</span>}
                                    </p>

                                    {/* Spacer to push bottom content */}
                                    <div className="flex-1" />

                                    {/* SATB Indicators */}
                                    <div className="flex items-center gap-3 mb-6 p-3 bg-primary-900/50 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-1.5" title="Soprano">
                                            <div className="w-2.5 h-2.5 rounded-full bg-voice-soprano shadow-[0_0_8px_var(--color-voice-soprano)]"></div>
                                            <span className="text-[10px] font-mono font-bold text-neutral-400">S</span>
                                        </div>
                                        <div className="flex items-center gap-1.5" title="Alto">
                                            <div className="w-2.5 h-2.5 rounded-full bg-voice-alto shadow-[0_0_8px_var(--color-voice-alto)]"></div>
                                            <span className="text-[10px] font-mono font-bold text-neutral-400">A</span>
                                        </div>
                                        <div className="flex items-center gap-1.5" title="Tenor">
                                            <div className="w-2.5 h-2.5 rounded-full bg-voice-tenor shadow-[0_0_8px_var(--color-voice-tenor)]"></div>
                                            <span className="text-[10px] font-mono font-bold text-neutral-400">T</span>
                                        </div>
                                        <div className="flex items-center gap-1.5" title="Bajo">
                                            <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-voice-bajo)] shadow-[0_0_8px_var(--color-voice-bajo)]"></div>
                                            <span className="text-[10px] font-mono font-bold text-neutral-400">B</span>
                                        </div>
                                        {work.era && (
                                            <span className="ml-auto px-2.5 py-1 rounded-lg text-[10px] font-bold bg-primary-900 border border-white/10 text-accent-300 uppercase tracking-tighter">
                                                {work.era}
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3">
                                        <button className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-300 text-white text-xs font-bold transition-all shadow-md active:scale-95">
                                            <Plus size={14} /> Ensayar
                                        </button>
                                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-transparent border border-white/10 text-neutral-300 hover:bg-white/5 text-xs font-bold transition-all active:scale-95">
                                            Partitura
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
