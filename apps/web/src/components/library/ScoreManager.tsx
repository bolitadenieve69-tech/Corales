import { useState, useMemo, lazy, Suspense } from 'react';
import {
    Search,
    Download,
    FileJson,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Paperclip,
    ChevronUp,
    ChevronDown,
    ExternalLink,
    MoreVertical,
    Filter,
    Check,
    FileText,
    Music,
    PlayCircle,
    UploadCloud,
    Plus,
    Loader2,
    RefreshCw,
} from 'lucide-react';

import Link from 'next/link';
import { UploadAssetModal } from './UploadAssetModal';
import { useWorksWithEditions, ApiAsset } from '@/hooks/useLibrary';

const RehearsalPanel = lazy(() =>
    import('../rehearsal/RehearsalPanel').then(m => ({ default: m.RehearsalPanel }))
);

import scoresData from '@/data/scores.json';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Score {
    id: string;           // work UUID from API
    editionId?: string;   // first edition UUID (used for asset uploads)
    titulo: string;
    compositor: string;
    voces: string;
    pdf_filename: string;
    pdf_source_url?: string;
    pdf_status: 'ok' | 'pendiente' | 'sin_fuente' | 'error';
    midis?: string[];
    dbAssets?: ApiAsset[];
}

type PdfStatus = Score['pdf_status'];

// ─── Module-level constants ───────────────────────────────────────────────────

const STATUS_CONFIG = {
    pendiente:   { label: 'Pendiente',      color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200',   icon: Clock },
    descargado:  { label: 'Descargado',     color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2 },
    sin_fuente:  { label: 'Sin fuente',     color: 'text-rose-600',    bg: 'bg-rose-50',    border: 'border-rose-200',    icon: AlertTriangle },
    manual:      { label: 'Subido manual',  color: 'text-indigo-600',  bg: 'bg-indigo-50',  border: 'border-indigo-200',  icon: Paperclip },
};

// JSON metadata lookup: "titulo_lower|compositor_lower" → pdf metadata
interface PdfMeta { pdf_filename: string; pdf_source_url?: string; pdf_status: PdfStatus; }
const JSON_META_MAP = new Map<string, PdfMeta>(
    (scoresData as any[]).map(s => [
        `${String(s.titulo).toLowerCase()}|${String(s.compositor).toLowerCase()}`,
        { pdf_filename: s.pdf_filename, pdf_source_url: s.pdf_source_url || undefined, pdf_status: s.pdf_status as PdfStatus },
    ])
);

// JSON-based fallback catalog (shown instantly while API loads, or if API fails)
const JSON_FALLBACK: Score[] = (scoresData as any[]).map(s => ({
    id: `json-${s.id}`,
    editionId: undefined,
    titulo: String(s.titulo),
    compositor: String(s.compositor),
    voces: String(s.voces),
    pdf_filename: String(s.pdf_filename),
    pdf_source_url: s.pdf_source_url || undefined,
    pdf_status: s.pdf_status as PdfStatus,
    midis: (s.midis ?? []) as string[],
    dbAssets: [],
}));

// ─── Component ────────────────────────────────────────────────────────────────

export default function ScoreManager() {
    const {
        data: apiWorks = [],
        isLoading: worksLoading,
        refetch: refetchWorks,
    } = useWorksWithEditions(0, 500);

    // Merge API works with JSON pdf metadata.
    // Falls back to JSON catalog if API is still loading or returned nothing.
    const data = useMemo<Score[]>(() => {
        if (apiWorks.length === 0) return JSON_FALLBACK;
        return apiWorks.map(work => {
            const edition = work.editions?.[0];
            const assets: ApiAsset[] = edition?.assets ?? [];
            const midis = assets
                .filter(a => a.asset_type.startsWith('MIDI_'))
                .map(a => a.asset_type.replace('MIDI_', ''));
            const key = `${work.title.toLowerCase()}|${(work.composer ?? '').toLowerCase()}`;
            const meta = JSON_META_MAP.get(key);
            return {
                id: work.id,
                editionId: edition?.id,
                titulo: work.title,
                compositor: work.composer ?? '',
                voces: work.voice_format ?? '',
                pdf_filename: meta?.pdf_filename ?? '',
                pdf_source_url: meta?.pdf_source_url,
                pdf_status: meta?.pdf_status ?? 'pendiente',
                midis,
                dbAssets: assets,
            };
        });
    }, [apiWorks]);

    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('todos');
    const [sortCol, setSortCol] = useState<keyof Score>('titulo');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [uploadModalOpen, setUploadModalOpen] = useState<{ id: string; title: string } | null>(null);
    const [rehearsalScore, setRehearsalScore] = useState<Score | null>(null);

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const filtered = useMemo(() => {
        const result = data.filter(r => {
            const matchSearch =
                !search ||
                r.titulo.toLowerCase().includes(search.toLowerCase()) ||
                r.compositor.toLowerCase().includes(search.toLowerCase());
            const matchStatus = filterStatus === 'todos' || r.pdf_status === filterStatus;
            return matchSearch && matchStatus;
        });
        result.sort((a, b) => {
            const va = String(a[sortCol] ?? '').toLowerCase();
            const vb = String(b[sortCol] ?? '').toLowerCase();
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return result;
    }, [data, search, filterStatus, sortCol, sortDir]);

    const stats = useMemo(() => {
        const s: Record<string, number> = { total: data.length, pendiente: 0, descargado: 0, sin_fuente: 0, manual: 0 };
        data.forEach(r => { if (r.pdf_status in s) s[r.pdf_status]++; });
        return s;
    }, [data]);

    const toggleAll = () => {
        if (selectedIds.size === filtered.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(filtered.map(r => r.id)));
    };

    const handleSort = (col: keyof Score) => {
        if (sortCol === col) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
        else { setSortCol(col); setSortDir('asc'); }
    };

    return (
        <div className="min-h-screen bg-neutral-100 font-ui text-neutral-900">
            {/* Header */}
            <header className="bg-white border-b border-neutral-200 px-8 py-10 shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary-500 rounded-xl shadow-lg shadow-primary-500/20">
                                    <Download className="text-white w-6 h-6" />
                                </div>
                                <h1 className="text-3xl font-display font-bold text-primary-900 tracking-tight">
                                    Gestor de Partituras
                                </h1>
                            </div>
                            <div className="flex items-center gap-3 ml-12">
                                <p className="text-neutral-500 font-medium">
                                    Digitalización y catalogación del repertorio magistral
                                </p>
                                {worksLoading && (
                                    <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                                        <Loader2 size={12} className="animate-spin" /> Sincronizando catálogo...
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link href="/library/upload" className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-full text-sm font-bold hover:bg-primary-800 transition-all shadow-lg shadow-primary-500/20 active:scale-95">
                                <Plus size={18} /> Nueva Obra
                            </Link>
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-neutral-200 rounded-full text-sm font-bold text-neutral-600 hover:border-primary-500 hover:text-primary-500 transition-all shadow-sm">
                                <FileJson size={18} /> Exportar
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-10">
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                            <button
                                key={key}
                                onClick={() => setFilterStatus(filterStatus === key ? 'todos' : key)}
                                className={`flex flex-col p-4 rounded-2xl border transition-all text-left ${filterStatus === key ? `${cfg.bg} ${cfg.border}` : 'bg-neutral-50 border-neutral-100 hover:border-neutral-300'}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <cfg.icon className={cfg.color} size={18} />
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                                </div>
                                <div className="text-2xl font-bold text-neutral-900">{stats[key] ?? 0}</div>
                            </button>
                        ))}
                        <button
                            onClick={() => setFilterStatus('todos')}
                            className={`flex flex-col p-4 rounded-2xl border transition-all text-left ${filterStatus === 'todos' ? 'bg-primary-100 border-primary-200' : 'bg-neutral-50 border-neutral-100 hover:border-neutral-300'}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <Check className="text-primary-500" size={18} />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-500">Total</span>
                            </div>
                            <div className="text-2xl font-bold text-neutral-900">{stats.total}</div>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-8">
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por obra o compositor..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-3 bg-white border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-all">
                            <Filter size={18} /> Filtrar
                        </button>
                        {selectedIds.size > 0 && (
                            <div className="flex items-center gap-2 animate-in slide-in-from-right duration-300">
                                <span className="text-sm font-bold text-primary-500 px-2">{selectedIds.size} seleccionados</span>
                                <button className="px-4 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all">
                                    Marcar Descargados
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-100">
                                    <th className="px-6 py-4 text-left w-10">
                                        <input
                                            type="checkbox"
                                            aria-label="Seleccionar todas las partituras"
                                            className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                                            checked={selectedIds.size === filtered.length && filtered.length > 0}
                                            onChange={toggleAll}
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-left font-bold text-neutral-500 uppercase tracking-wider text-[11px] w-12">#</th>
                                    {([
                                        { key: 'titulo',      label: 'Título',      width: '' },
                                        { key: 'compositor',  label: 'Compositor',  width: '' },
                                        { key: 'voces',       label: 'Voces',       width: 'w-24' },
                                        { key: 'pdf_status',  label: 'Estado',      width: 'w-32' },
                                    ] as { key: keyof Score; label: string; width: string }[]).map(col => (
                                        <th
                                            key={col.key}
                                            onClick={() => handleSort(col.key)}
                                            className={`px-6 py-4 text-left font-bold text-neutral-500 uppercase tracking-wider text-[11px] cursor-pointer hover:text-primary-500 transition-colors select-none ${col.width}`}
                                        >
                                            <div className="flex items-center gap-1">
                                                {col.label}
                                                {sortCol === col.key && (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-6 py-4 text-center">Pistas MIDI</th>
                                    <th className="px-6 py-4 text-right">Partitura / Fuente</th>
                                    <th className="px-6 py-4 w-28 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {filtered.map((score, idx) => {
                                    const cfg = STATUS_CONFIG[score.pdf_status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pendiente;
                                    const isSelected = selectedIds.has(score.id);
                                    const hasRealEdition = !!score.editionId;
                                    return (
                                        <tr
                                            key={score.id}
                                            className={`hover:bg-neutral-50/50 transition-colors ${isSelected ? 'bg-primary-50/30' : ''}`}
                                        >
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    aria-label={`Seleccionar ${score.titulo}`}
                                                    className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelect(score.id)}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-neutral-400 font-mono text-xs">
                                                {String(idx + 1).padStart(3, '0')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-neutral-900">{score.titulo}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-neutral-600 font-medium">{score.compositor}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 bg-neutral-100 rounded-md text-[11px] font-bold text-neutral-600">
                                                    {score.voces}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                                    <cfg.icon size={12} />
                                                    {cfg.label}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {['SOPRANO', 'ALTO', 'TENOR', 'BASS'].map(voice => {
                                                        const exists = score.midis?.includes(voice);
                                                        const vColor = `var(--color-voice-${voice.toLowerCase()})`;
                                                        return (
                                                            <div
                                                                key={voice}
                                                                title={`MIDI ${voice} ${exists ? 'Disponible' : 'Faltante'}`}
                                                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${exists ? 'shadow-sm text-white' : 'bg-neutral-100 text-neutral-300'}`}
                                                                style={exists ? { backgroundColor: vColor } : {}}
                                                            >
                                                                {voice[0]}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {score.pdf_filename ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] text-neutral-400 font-mono mb-1">{score.pdf_filename}</span>
                                                        <a
                                                            href={`/api/v1/assets/download/${score.pdf_filename}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-bold transition-colors text-xs"
                                                        >
                                                            <FileText size={12} /> Ver PDF
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <span className="text-neutral-300 italic text-xs">Sin archivo</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {score.pdf_source_url ? (
                                                    <a
                                                        href={score.pdf_source_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-primary-500 hover:text-primary-800 font-bold transition-colors"
                                                    >
                                                        {score.pdf_source_url.includes('cpdl') ? 'CPDL' : 'IMSLP'}
                                                        <ExternalLink size={12} />
                                                    </a>
                                                ) : (
                                                    <span className="text-neutral-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {(score.midis?.length ?? 0) > 0 && (
                                                        <button
                                                            onClick={() => setRehearsalScore(score)}
                                                            className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 text-primary-500 hover:bg-primary-500 hover:text-white transition-all shadow-sm"
                                                            title="Ensayar obra"
                                                        >
                                                            <PlayCircle size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        aria-label="Subir Archivos"
                                                        title={hasRealEdition ? 'Gestionar archivos MIDI y PDF' : 'Obra sin edición — guarda primero desde Nueva Obra'}
                                                        disabled={!hasRealEdition}
                                                        onClick={() => hasRealEdition && setUploadModalOpen({ id: score.editionId!, title: score.titulo })}
                                                        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-all border border-transparent hover:border-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        <UploadCloud size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Music className="text-neutral-200" size={48} />
                                                <p className="font-bold text-neutral-500">Sin resultados</p>
                                                <p className="text-sm text-neutral-400">
                                                    {search
                                                        ? `No hay obras que coincidan con "${search}"`
                                                        : 'No hay obras con este estado'}
                                                </p>
                                                {(search || filterStatus !== 'todos') && (
                                                    <button
                                                        onClick={() => { setSearch(''); setFilterStatus('todos'); }}
                                                        className="mt-1 px-4 py-1.5 text-xs font-bold text-primary-500 border border-primary-200 rounded-full hover:bg-primary-50 transition-all"
                                                    >
                                                        Limpiar filtros
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                        <p className="text-xs text-neutral-500 font-medium">
                            Mostrando <span className="font-bold">{filtered.length}</span> de <span className="font-bold">{data.length}</span> obras registradas
                            {worksLoading && <span className="ml-2 text-neutral-300">(actualizando...)</span>}
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => refetchWorks()}
                                title="Actualizar catálogo"
                                className="flex items-center gap-1 text-xs text-neutral-400 hover:text-primary-500 transition-colors"
                            >
                                <RefreshCw size={13} /> Actualizar
                            </button>
                            <div className="flex items-center gap-2 text-xs text-neutral-400">
                                <kbd className="px-2 py-1 bg-white border border-neutral-200 rounded shadow-sm font-mono">CMD</kbd> +
                                <kbd className="px-2 py-1 bg-white border border-neutral-200 rounded shadow-sm font-mono">F</kbd> para buscar
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal de Subida de MIDIs y Archivos */}
            {uploadModalOpen && (
                <UploadAssetModal
                    editionId={uploadModalOpen.id}
                    workTitle={uploadModalOpen.title}
                    onClose={() => setUploadModalOpen(null)}
                    onSuccess={() => {
                        setUploadModalOpen(null);
                        refetchWorks();
                    }}
                />
            )}

            {/* Panel de Ensayo — carga lazy para no penalizar el bundle inicial */}
            {rehearsalScore && (
                <Suspense fallback={null}>
                    <RehearsalPanel
                        work={{
                            id: rehearsalScore.id,
                            title: rehearsalScore.titulo,
                            duration: 180,
                            bpm: 100,
                            editions: [{
                                assets: rehearsalScore.dbAssets?.length
                                    ? rehearsalScore.dbAssets
                                    : rehearsalScore.midis?.map(voice => ({
                                        id: `mock-${rehearsalScore.id}-${voice}`,
                                        asset_type: `MIDI_${voice}`,
                                        original_filename: `${rehearsalScore.titulo} - ${voice}.mid`,
                                    })) ?? [],
                            }],
                        }}
                        selectedAsset={{ original_filename: 'Reproductor MIDI SATB' }}
                        onClose={() => setRehearsalScore(null)}
                    />
                </Suspense>
            )}
        </div>
    );
}
