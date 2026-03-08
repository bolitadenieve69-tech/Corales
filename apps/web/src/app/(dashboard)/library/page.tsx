"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, Music, ChevronRight, ChevronDown, FileText, FileAudio, Loader2, BookOpen, X } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

// Era ordering and visual config
const ERA_CONFIG: Record<string, { order: number; icon: string; color: string; bg: string }> = {
    'Renacimiento': { order: 1, icon: '🏛️', color: 'text-white', bg: 'bg-primary-500 border-primary-800 shadow-md shadow-primary-500/20' },
    'Barroco': { order: 2, icon: '🎻', color: 'text-white', bg: 'bg-primary-500 border-primary-800 shadow-md shadow-primary-500/20' },
    'Clasicismo': { order: 3, icon: '🎼', color: 'text-white', bg: 'bg-primary-500 border-primary-800 shadow-md shadow-primary-500/20' },
    'Romanticismo': { order: 4, icon: '🌹', color: 'text-white', bg: 'bg-primary-500 border-primary-800 shadow-md shadow-primary-500/20' },
    'Zarzuela': { order: 5, icon: '🎭', color: 'text-white', bg: 'bg-primary-500 border-primary-800 shadow-md shadow-primary-500/20' },
    'Siglo XX': { order: 6, icon: '🎷', color: 'text-white', bg: 'bg-primary-500 border-primary-800 shadow-md shadow-primary-500/20' },
    'Contemporánea': { order: 7, icon: '✨', color: 'text-white', bg: 'bg-primary-500 border-primary-800 shadow-md shadow-primary-500/20' },
    'Tradicional': { order: 8, icon: '🎶', color: 'text-white', bg: 'bg-primary-500 border-primary-800 shadow-md shadow-primary-500/20' },
    'Por definir': { order: 99, icon: '📋', color: 'text-primary-900', bg: 'bg-neutral-100 border-neutral-200' },
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
                    <h1 className="text-4xl font-bold tracking-tight text-foreground mb-1 font-display">Biblioteca Musical</h1>
                    <p className="text-neutral-500 font-ui font-medium text-sm">
                        {loading ? 'Sincronizando...' : `Gestionando ${totalCount} obras magistrales`}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/library/upload" className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-800 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-primary-500/20 active:scale-95 text-sm">
                        <Plus size={18} /> Añadir Obra
                    </Link>
                </div>
            </div>

            {/* Search + Era Filters */}
            <div className="space-y-4">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por título o compositor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 bg-white border border-neutral-200 rounded-2xl text-foreground font-medium text-base shadow-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-primary-500 transition-colors"
                            aria-label="Limpiar búsqueda"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Era filter pills */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedEra(null)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${!selectedEra
                            ? 'bg-primary-500 text-white border-primary-500 shadow-md'
                            : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-500/50 hover:text-primary-500 shadow-sm'}`}
                    >
                        Todas
                    </button>
                    {availableEras.map(era => {
                        const config = getEraConfig(era);
                        return (
                            <button
                                key={era}
                                onClick={() => setSelectedEra(selectedEra === era ? null : era)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border flex items-center gap-2 ${selectedEra === era
                                    ? 'bg-primary-500 text-white border-primary-500 shadow-md'
                                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-500/50 hover:text-primary-500 shadow-sm'}`}
                            >
                                <span>{config.icon}</span>
                                {era}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="p-16 text-center flex flex-col items-center gap-4 text-neutral-500 bg-white rounded-3xl border border-neutral-100 shadow-sm">
                    <Loader2 className="animate-spin text-primary-500" size={40} />
                    <p className="text-base font-semibold font-display">Sincronizando catálogo magistral...</p>
                </div>
            ) : filteredWorks.length === 0 ? (
                <div className="p-16 text-center text-neutral-500 bg-white rounded-3xl border border-neutral-100 shadow-xl">
                    <div className="mb-6 inline-flex p-6 rounded-full bg-neutral-100 text-primary-500">
                        <Music size={48} />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-foreground mb-2">No se encontraron partituras</h3>
                    <p className="text-base max-w-md mx-auto">Prueba a ajustar los filtros o el compositor. El catálogo se actualiza constantemente.</p>
                    {(selectedEra || searchQuery) && (
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedEra(null); }}
                            className="mt-6 px-6 py-2 bg-neutral-100 text-primary-500 hover:bg-neutral-200 rounded-full font-bold transition-all text-sm"
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
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`rounded-3xl border overflow-hidden bg-white shadow-xl hover:shadow-2xl transition-all duration-300 ${config.bg}`}
                            >
                                {/* Era Header */}
                                <button
                                    onClick={() => toggleEraCollapse(era)}
                                    className="w-full flex items-center justify-between px-6 py-4 hover:brightness-105 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl drop-shadow-sm">{config.icon}</span>
                                        <h2 className={`text-xl font-display font-bold ${config.color}`}>{era}</h2>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest ${era === 'Por definir' ? 'text-neutral-600 bg-white/50 border border-neutral-200' : 'text-primary-500 bg-white shadow-sm'}`}>
                                            {eraWorks.length} {eraWorks.length === 1 ? 'partitura' : 'partituras'}
                                        </span>
                                    </div>
                                    <motion.div
                                        animate={{ rotate: isCollapsed ? -90 : 0 }}
                                        transition={{ duration: 0.3, ease: 'backOut' }}
                                    >
                                        <ChevronDown size={24} className={config.color} />
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
                                            <div className="px-4 pb-4">
                                                <div className="bg-neutral-50 rounded-2xl overflow-hidden divide-y divide-neutral-200/50">
                                                    {eraWorks.map((work: any, i: number) => (
                                                        <Link
                                                            key={work.id}
                                                            href={`/library/${work.id}`}
                                                            className="group flex items-center gap-4 px-5 py-4 hover:bg-white transition-all"
                                                        >
                                                            {/* Small music icon styled as in Stitch */}
                                                            <div className="w-10 h-10 rounded-xl bg-white border border-neutral-100 flex items-center justify-center text-primary-500 shadow-sm group-hover:bg-primary-500 group-hover:text-white transition-all shrink-0">
                                                                <FileText size={18} />
                                                            </div>

                                                            {/* Title + Composer */}
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="text-base font-bold text-foreground group-hover:text-primary-500 transition-colors truncate">
                                                                    {work.title}
                                                                </h3>
                                                                <span className="text-sm font-medium text-neutral-500 truncate block">
                                                                    {work.composer || 'Anónimo'}
                                                                </span>
                                                            </div>

                                                            {/* Voices badge - Stitch Style dots */}
                                                            <div className="hidden lg:flex items-center gap-1.5 shrink-0 px-3 py-1.5 bg-white rounded-full border border-neutral-100 shadow-sm">
                                                                <div className="w-2 h-2 rounded-full bg-voice-soprano" title="Soprano"></div>
                                                                <div className="w-2 h-2 rounded-full bg-voice-alto" title="Alto"></div>
                                                                <div className="w-2 h-2 rounded-full bg-voice-tenor" title="Tenor"></div>
                                                                <div className="w-2 h-2 rounded-full bg-bajo" title="Bajo"></div>
                                                            </div>

                                                            {/* Assets indicators */}
                                                            <div className="hidden md:flex items-center gap-2 shrink-0">
                                                                {work.editions?.some((e: any) => e.assets?.some((a: any) => ['PDF', 'SHEET_MUSIC'].includes(a.asset_type?.toUpperCase()))) && (
                                                                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-primary-500 bg-primary-100 px-2 py-1 rounded-md uppercase tracking-wider" title="Tiene partitura">
                                                                        PDF
                                                                    </span>
                                                                )}
                                                                {work.editions?.some((e: any) => e.assets?.some((a: any) => a.asset_type?.toUpperCase()?.includes('MIDI'))) && (
                                                                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-accent-gold bg-accent-gold/10 px-2 py-1 rounded-md uppercase tracking-wider" title="Tiene MIDI">
                                                                        MIDI
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Arrow - Stitch Style */}
                                                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-200 group-hover:bg-primary-500 group-hover:text-white transition-all shrink-0">
                                                                <ChevronRight size={16} />
                                                            </div>
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
