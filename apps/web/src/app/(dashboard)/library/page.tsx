"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, Music, ChevronRight, ChevronDown, FileText, FileAudio, Loader2, BookOpen, X } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

// Era ordering and visual config
const ERA_CONFIG: Record<string, { order: number; icon: string; color: string; bg: string }> = {
    'Renacimiento': { order: 1, icon: '🏛️', color: 'text-amber-300', bg: 'bg-amber-500/10 border-amber-500/20' },
    'Barroco': { order: 2, icon: '🎻', color: 'text-orange-300', bg: 'bg-orange-500/10 border-orange-500/20' },
    'Clasicismo': { order: 3, icon: '🎼', color: 'text-sky-300', bg: 'bg-sky-500/10 border-sky-500/20' },
    'Romanticismo': { order: 4, icon: '🌹', color: 'text-rose-300', bg: 'bg-rose-500/10 border-rose-500/20' },
    'Zarzuela': { order: 5, icon: '🎭', color: 'text-fuchsia-300', bg: 'bg-fuchsia-500/10 border-fuchsia-500/20' },
    'Siglo XX': { order: 6, icon: '🎷', color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    'Contemporánea': { order: 7, icon: '✨', color: 'text-violet-300', bg: 'bg-violet-500/10 border-violet-500/20' },
    'Tradicional': { order: 8, icon: '🎶', color: 'text-yellow-300', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    'Por definir': { order: 99, icon: '📋', color: 'text-neutral-400', bg: 'bg-neutral-500/10 border-neutral-500/20' },
};

function getEraConfig(era: string) {
    return ERA_CONFIG[era] || ERA_CONFIG['Por definir'];
}

export default function LibraryPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEra, setSelectedEra] = useState<string | null>(null);
    const [works, setWorks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [collapsedEras, setCollapsedEras] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchApi('/works/?skip=0&limit=500')
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

    // Filter works
    const filteredWorks = useMemo(() => {
        return works.filter(w => {
            const matchesSearch = !searchQuery ||
                w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (w.composer && w.composer.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesEra = !selectedEra || w.era === selectedEra;
            return matchesSearch && matchesEra;
        });
    }, [works, searchQuery, selectedEra]);

    // Group by era
    const groupedByEra = useMemo(() => {
        const groups: Record<string, any[]> = {};
        filteredWorks.forEach(w => {
            const era = w.era || 'Por definir';
            if (!groups[era]) groups[era] = [];
            groups[era].push(w);
        });
        // Sort groups by era order
        const sorted = Object.entries(groups).sort(([a], [b]) => {
            return (getEraConfig(a).order) - (getEraConfig(b).order);
        });
        // Sort works within each group alphabetically
        return sorted.map(([era, eraWorks]) => ({
            era,
            works: eraWorks.sort((a: any, b: any) => a.title.localeCompare(b.title)),
        }));
    }, [filteredWorks]);

    // Available eras for filter pills
    const availableEras = useMemo(() => {
        const eras = new Set(works.map(w => w.era || 'Por definir'));
        return Array.from(eras).sort((a, b) => getEraConfig(a).order - getEraConfig(b).order);
    }, [works]);

    const toggleEraCollapse = (era: string) => {
        setCollapsedEras(prev => {
            const next = new Set(prev);
            if (next.has(era)) next.delete(era);
            else next.add(era);
            return next;
        });
    };

    const totalCount = filteredWorks.length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1 font-display">Biblioteca Musical</h1>
                    <p className="text-neutral-400 font-ui text-sm">
                        {loading ? 'Cargando...' : `${totalCount} obras en el catálogo`}
                    </p>
                </div>
                <Link href="/library/upload" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-accent-500 hover:bg-accent-300 text-primary-900 rounded-xl font-bold transition-all shadow-glow-accent hover:scale-[1.02] active:scale-95 text-sm">
                    <Plus size={16} /> Añadir Obra
                </Link>
            </div>

            {/* Search + Era Filters */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por título o compositor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-primary-800 border border-white/10 rounded-xl text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-accent-500/50 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                            aria-label="Limpiar búsqueda"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Era filter pills */}
                <div className="flex flex-wrap gap-1.5">
                    <button
                        onClick={() => setSelectedEra(null)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${!selectedEra ? 'bg-accent-500 text-primary-900' : 'bg-primary-800 text-neutral-400 hover:text-white border border-white/5'}`}
                    >
                        Todas
                    </button>
                    {availableEras.map(era => {
                        const config = getEraConfig(era);
                        const count = works.filter(w => (w.era || 'Por definir') === era).length;
                        return (
                            <button
                                key={era}
                                onClick={() => setSelectedEra(selectedEra === era ? null : era)}
                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${selectedEra === era ? 'bg-accent-500 text-primary-900' : `bg-primary-800 text-neutral-400 hover:text-white border border-white/5`}`}
                            >
                                <span>{config.icon}</span>
                                {era}
                                <span className="opacity-60">({count})</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="p-16 text-center flex flex-col items-center gap-4 text-neutral-600 bg-primary-800/50 rounded-2xl border border-white/5 border-dashed">
                    <Loader2 className="animate-spin text-primary-500" size={32} />
                    <p className="text-sm font-medium">Sincronizando biblioteca...</p>
                </div>
            ) : filteredWorks.length === 0 ? (
                <div className="p-16 text-center text-neutral-500 bg-primary-800/50 rounded-2xl border border-white/5 border-dashed">
                    <div className="mb-4 inline-flex p-4 rounded-full bg-primary-900/50 text-neutral-700">
                        <Music size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">No se encontraron obras</h3>
                    <p className="text-sm">Prueba a ajustar los filtros o la búsqueda.</p>
                    {(selectedEra || searchQuery) && (
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedEra(null); }}
                            className="mt-4 text-accent-500 hover:text-accent-300 font-medium underline underline-offset-4 text-sm"
                        >
                            Limpiar todos los filtros
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {groupedByEra.map(({ era, works: eraWorks }) => {
                        const config = getEraConfig(era);
                        const isCollapsed = collapsedEras.has(era);

                        return (
                            <motion.div
                                key={era}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`rounded-2xl border overflow-hidden ${config.bg}`}
                            >
                                {/* Era Header */}
                                <button
                                    onClick={() => toggleEraCollapse(era)}
                                    className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{config.icon}</span>
                                        <h2 className={`text-base font-bold ${config.color}`}>{era}</h2>
                                        <span className="text-xs text-neutral-500 font-mono bg-black/20 px-2 py-0.5 rounded-full">
                                            {eraWorks.length} {eraWorks.length === 1 ? 'obra' : 'obras'}
                                        </span>
                                    </div>
                                    <motion.div
                                        animate={{ rotate: isCollapsed ? -90 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ChevronDown size={18} className="text-neutral-500" />
                                    </motion.div>
                                </button>

                                {/* Works List */}
                                <AnimatePresence>
                                    {!isCollapsed && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-2 pb-2">
                                                <div className="bg-primary-900/60 rounded-xl overflow-hidden divide-y divide-white/[0.03]">
                                                    {eraWorks.map((work: any, i: number) => (
                                                        <Link
                                                            key={work.id}
                                                            href={`/library/${work.id}`}
                                                            className="group flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors"
                                                        >
                                                            {/* Small music icon */}
                                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-neutral-600 group-hover:bg-accent-500/20 group-hover:text-accent-500 transition-all shrink-0">
                                                                <Music size={14} />
                                                            </div>

                                                            {/* Title + Composer */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-baseline gap-2">
                                                                    <span className="text-sm font-semibold text-white group-hover:text-accent-300 transition-colors truncate">
                                                                        {work.title}
                                                                    </span>
                                                                </div>
                                                                <span className="text-xs text-neutral-500 truncate block">
                                                                    {work.composer || 'Anónimo'}
                                                                </span>
                                                            </div>

                                                            {/* Voices badge */}
                                                            <div className="hidden sm:flex items-center gap-1 shrink-0">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-voice-soprano" title="Soprano"></div>
                                                                <div className="w-1.5 h-1.5 rounded-full bg-voice-alto" title="Alto"></div>
                                                                <div className="w-1.5 h-1.5 rounded-full bg-voice-tenor" title="Tenor"></div>
                                                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-voice-bajo)]" title="Bajo"></div>
                                                            </div>

                                                            {/* Assets indicators */}
                                                            <div className="hidden md:flex items-center gap-2 shrink-0">
                                                                {work.editions?.some((e: any) => e.assets?.some((a: any) => ['PDF', 'SHEET_MUSIC'].includes(a.asset_type?.toUpperCase()))) && (
                                                                    <span className="text-[10px] font-bold text-neutral-500 bg-white/5 px-1.5 py-0.5 rounded" title="Tiene partitura">
                                                                        <FileText size={12} className="inline -mt-0.5" /> PDF
                                                                    </span>
                                                                )}
                                                                {work.editions?.some((e: any) => e.assets?.some((a: any) => a.asset_type?.toUpperCase()?.includes('MIDI'))) && (
                                                                    <span className="text-[10px] font-bold text-neutral-500 bg-white/5 px-1.5 py-0.5 rounded" title="Tiene MIDI">
                                                                        <FileAudio size={12} className="inline -mt-0.5" /> MIDI
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Arrow */}
                                                            <ChevronRight size={14} className="text-neutral-700 group-hover:text-accent-500 transition-colors shrink-0" />
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
