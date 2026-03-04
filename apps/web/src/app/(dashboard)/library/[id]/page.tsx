"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Music, FileText, FileAudio, PlayCircle, Download, BookOpen, Clock, Settings2, Loader2, Upload, X, Maximize2 } from 'lucide-react';
import ProgressControls from './progress-controls';
import PipelineStatus from './pipeline-status';
import Metronome from '@/components/rehearsal/Metronome';
import { RehearsalPanel } from '@/components/rehearsal/RehearsalPanel';
import { UploadAssetModal } from '@/components/library/UploadAssetModal';
import { fetchApi, API_URL } from '@/lib/api';

export default function WorkDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const [work, setWork] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedAsset, setSelectedAsset] = useState<any>(null);
    const [studyMode, setStudyMode] = useState(false);
    const [isMetronomeActive, setIsMetronomeActive] = useState(false);
    const [uploadModalEdition, setUploadModalEdition] = useState<string | null>(null);

    const loadWork = () => {
        if (!id) return;
        fetchApi(`/works/${id}`)
            .then(data => {
                if (data) {
                    setWork(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching work details", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadWork();
    }, [id]);

    const handlePlayAsset = (asset: any) => {
        setSelectedAsset(asset);
        if (asset.asset_type?.startsWith('MIDI_') || asset.asset_type === 'midi' || asset.asset_type === 'MIDI') {
            setIsMetronomeActive(true);
            setStudyMode(true);
        } else {
            setIsMetronomeActive(false);
        }
    };

    const handleStopStudy = () => {
        setStudyMode(false);
        setIsMetronomeActive(false);
        setSelectedAsset(null);
    };

    const getAssetLabel = (asset: any) => {
        // Friendly labels for pipeline-generated assets and user uploads
        const typeLabels: Record<string, string> = {
            'AUDIO_TUTTI': '🎵 Tutti (todas las voces)',
            'AUDIO_SOPRANO': '🎤 Soprano',
            'AUDIO_ALTO': '🎤 Alto',
            'AUDIO_TENOR': '🎤 Tenor',
            'AUDIO_BASS': '🎤 Bajo',
            'MIDI_TUTTI': '🎹 MIDI Tutti',
            'MIDI_SOPRANO': '🎹 MIDI Soprano',
            'MIDI_ALTO': '🎹 MIDI Alto',
            'MIDI_TENOR': '🎹 MIDI Tenor',
            'MIDI_BASS': '🎹 MIDI Bajo',
            'midi': '🎹 MIDI (Estudio)',
            'sheet_music': '📄 Partitura',
            'pdf': '📄 Partitura (PDF)',
            'learning_track': '🎵 Pista de Estudio',
            'reference_recording': '🎤 Grabación de Referencia',
        };
        return typeLabels[asset.asset_type] || asset.original_filename || asset.asset_type;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-neutral-600">
                <Loader2 className="animate-spin text-primary-500 mb-4" size={32} />
                <p>Cargando partituras y audios...</p>
            </div>
        );
    }

    if (!work) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-neutral-600">
                <p>No se encontró esta obra.</p>
                <Link href="/library" className="mt-4 text-primary-300 hover:text-primary-100">Volver a la biblioteca</Link>
            </div>
        );
    }

    // Categorize assets
    const getAssetsByCategory = (assets: any[]) => {
        if (!assets) return { musicxml: [], pdfs: [], audios: [], midis: [] };
        return {
            musicxml: assets.filter((a: any) => a.asset_type?.toUpperCase() === 'MUSICXML'),
            pdfs: assets.filter((a: any) => ['PDF', 'SHEET_MUSIC'].includes(a.asset_type?.toUpperCase())),
            audios: assets.filter((a: any) => a.asset_type?.toUpperCase().startsWith('AUDIO') || ['LEARNING_TRACK', 'REFERENCE_RECORDING'].includes(a.asset_type?.toUpperCase())),
            midis: assets.filter((a: any) => a.asset_type?.toUpperCase().startsWith('MIDI')),
        };
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header Actions */}
            <div className="flex items-center justify-between mt-2">
                <Link
                    href="/library"
                    className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors text-sm font-medium bg-white/5 py-1.5 px-3 rounded-full hover:bg-white/10"
                >
                    <ArrowLeft size={16} />
                    Volver a Biblioteca
                </Link>
                <div className="flex gap-3">
                    <Link
                        href="/library/upload"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent-500 hover:bg-accent-300 text-primary-900 border-none transition-all shadow-glow-accent rounded-xl transition-all shadow-lg shadow-glow-primary"
                    >
                        <Upload size={16} /> Subir Archivo
                    </Link>
                </div>
            </div>

            {/* Main Info */}
            <div className="bg-primary-800 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-700 to-primary-800 border border-primary-500/30 flex items-center justify-center shrink-0 shadow-xl shadow-md">
                        <Music className="w-12 h-12 text-primary-300" />
                    </div>

                    <div className="flex-1">
                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-2">{work.title}</h1>
                        <p className="text-xl text-primary-100 font-medium mb-6">{work.composer || 'Anónimo'}</p>

                        <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-4">
                            <span className="flex items-center gap-2 text-sm text-neutral-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                <Clock size={16} className="text-neutral-300" /> {work.era || 'Desconocida'}
                            </span>
                            <span className="flex items-center gap-2 text-sm text-neutral-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                <BookOpen size={16} className="text-neutral-300" /> {work.genre || 'Coral'}
                            </span>
                            <span className="flex items-center gap-2 text-sm text-amber-300/90 bg-accent-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 font-medium">
                                {work.difficulty || 'Media'}
                            </span>
                            <span className="px-3 py-1.5 rounded-lg bg-primary-500/20 text-primary-100 text-sm font-bold tracking-widest border border-primary-500/30 mr-auto">
                                {work.voice_format || 'SATB'}
                            </span>

                            {/* Progreso de estudio MVP */}
                            <ProgressControls workId={id as string} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Editions & Assets Loop */}
            <div className="space-y-8 mt-12">
                {work.editions && work.editions.length > 0 ? work.editions.map((edition: any) => {
                    const categories = getAssetsByCategory(edition.assets);

                    return (
                        <div key={edition.id} className="space-y-6">
                            <div className="flex items-center justify-between gap-4 mb-2">
                                <div className="flex items-baseline gap-4">
                                    <h2 className="text-2xl font-bold tracking-tight text-white">
                                        {edition.publisher || 'Edición Predeterminada'}
                                    </h2>
                                    {edition.notes && <span className="text-sm text-neutral-300">{edition.notes}</span>}
                                </div>
                                <button
                                    onClick={() => setUploadModalEdition(edition.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-accent-500/20 text-accent-500 hover:bg-accent-500 hover:text-primary-900 border-none transition-all rounded-lg text-sm font-semibold"
                                >
                                    <Upload size={16} /> Subir MIDI / PDF
                                </button>
                            </div>

                            {/* Pipeline Status for MusicXML assets */}
                            {categories.musicxml.map((asset: any) => (
                                <PipelineStatus
                                    key={asset.id}
                                    assetId={asset.id}
                                    editionId={edition.id}
                                />
                            ))}

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* PDF Section */}
                                <div className="col-span-1 lg:col-span-1 bg-primary-800 rounded-2xl border border-white/10 p-6 shadow-lg shadow-black/40 flex flex-col h-full">
                                    <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                                        <FileText className="text-accent-500" size={20} /> Partituras
                                    </h3>
                                    <div className="space-y-3 flex-1 overflow-y-auto">
                                        {categories.pdfs.map((asset: any) => (
                                            <a href={`${API_URL}/assets/${asset.id}/stream`} target="_blank" rel="noreferrer" key={asset.id} className="group p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-accent-500/30 transition-all cursor-pointer flex items-center justify-between">
                                                <span className="font-medium text-neutral-300 group-hover:text-amber-100 transition-colors line-clamp-1">{getAssetLabel(asset)}</span>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button title="Descargar" className="p-1.5 bg-accent-500/20 text-accent-300 rounded-md hover:bg-accent-500/40 transition-colors">
                                                        <Download size={16} />
                                                    </button>
                                                </div>
                                            </a>
                                        ))}
                                        {categories.pdfs.length === 0 && (
                                            <p className="text-sm text-neutral-600 italic">No hay PDFs vinculados.</p>
                                        )}
                                    </div>
                                </div>

                                {/* MIDI Section */}
                                <div className="col-span-1 lg:col-span-1 bg-primary-800 rounded-2xl border border-white/10 p-6 shadow-lg shadow-black/40 flex flex-col h-full">
                                    <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                                        <Music className="text-primary-300" size={20} /> MIDIs de Estudio
                                    </h3>
                                    <div className="space-y-3 flex-1 overflow-y-auto">
                                        {categories.midis.map((asset: any) => {
                                            const isSelected = selectedAsset?.id === asset.id;
                                            return (
                                                <div
                                                    key={asset.id}
                                                    onClick={() => handlePlayAsset(asset)}
                                                    className={`group p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isSelected ? 'bg-primary-500/20 border-indigo-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-primary-500/30'}`}
                                                >
                                                    <span className={`font-medium transition-colors line-clamp-1 ${isSelected ? 'text-primary-100' : 'text-neutral-300'}`}>{getAssetLabel(asset)}</span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            title="Iniciar práctica con metrónomo"
                                                            className={`p-1.5 rounded-md transition-colors ${isSelected ? 'bg-indigo-500 text-white' : 'bg-indigo-500/10 text-primary-300 group-hover:bg-primary-500/20'}`}
                                                        >
                                                            <PlayCircle size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {categories.midis.length === 0 && (
                                            <p className="text-sm text-neutral-600 italic">No hay MIDIs vinculados.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Audio Player Section */}
                                <div className="col-span-1 lg:col-span-1 bg-primary-800 rounded-2xl border border-white/10 p-6 shadow-lg shadow-black/40 relative overflow-hidden flex flex-col h-full">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-indigo-900/10 pointer-events-none" />

                                    <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2 relative z-10">
                                        <FileAudio className="text-primary-300" size={20} /> Audios de Estudio
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10 flex-1 content-start">
                                        {categories.audios.map((asset: any) => {
                                            const isSelected = selectedAsset?.id === asset.id;
                                            return (
                                                <div
                                                    key={asset.id}
                                                    onClick={() => handlePlayAsset(asset)}
                                                    className={`p-4 rounded-xl transition-all cursor-pointer flex items-center justify-between border ${isSelected
                                                        ? 'bg-primary-500/20 border-primary-500/50 shadow-inner'
                                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-blue-500/30'
                                                        }`}
                                                >
                                                    <span className={`font-medium truncate pr-2 ${isSelected ? 'text-blue-300' : 'text-neutral-300'} transition-colors`}>
                                                        {getAssetLabel(asset)}
                                                    </span>
                                                    <button
                                                        title="Reproducir audio"
                                                        className={`shrink-0 p-2 rounded-full transition-colors ${isSelected
                                                            ? 'bg-primary-500 text-white shadow-lg shadow-blue-500/40'
                                                            : 'bg-white/10 text-neutral-300 hover:text-white hover:bg-white/20'
                                                            }`}>
                                                        <PlayCircle size={20} className={isSelected ? 'animate-pulse' : ''} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        {categories.audios.length === 0 && (
                                            <p className="text-sm text-neutral-600 italic col-span-2">
                                                {categories.musicxml.length > 0
                                                    ? 'Los audios se generarán automáticamente cuando termine el procesado.'
                                                    : 'No hay audios vinculados.'}
                                            </p>
                                        )}
                                    </div>

                                    {selectedAsset && !studyMode && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-6 p-4 bg-black/40 rounded-xl border border-white/5 backdrop-blur-md relative z-10"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-blue-300 truncate pr-4">
                                                    ▶ {getAssetLabel(selectedAsset)}
                                                </span>
                                            </div>
                                            <audio
                                                controls
                                                autoPlay
                                                src={`${API_URL}/assets/${selectedAsset.id}/stream`}
                                                className="w-full h-12 rounded-lg"
                                            />
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="bg-primary-800 rounded-2xl border border-white/10 p-12 text-center text-neutral-600">
                        No hay ediciones ni archivos cargados.
                    </div>
                )}
            </div>

            {/* Study Mode Overlay (Rehearsal Panel) */}
            {studyMode && selectedAsset && (
                <RehearsalPanel
                    work={work}
                    selectedAsset={selectedAsset}
                    onClose={handleStopStudy}
                />
            )}

            {/* Upload Asset Modal */}
            {uploadModalEdition && (
                <UploadAssetModal
                    editionId={uploadModalEdition}
                    workTitle={work?.title || ''}
                    onClose={() => setUploadModalEdition(null)}
                    onSuccess={() => {
                        loadWork(); // Refetch work data to show new assets
                    }}
                />
            )}
        </div>
    );
}
