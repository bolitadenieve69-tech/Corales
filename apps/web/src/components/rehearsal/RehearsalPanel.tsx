'use client';

import React, { useState } from 'react';
import { X, Maximize2, Settings2, PlayCircle, PauseCircle, MessageSquare, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlayback } from '@/hooks/usePlayback';
import { API_URL } from '@/lib/api';
import { usePlaybackStore } from '@/store/playbackStore';
import { usePracticeTracking } from '@/hooks/usePracticeTracking';
import { useDirectorNotes } from '@/hooks/useDirectorNotes';
import { VoiceMixer } from './VoiceMixer';
import { ScoreViewer } from './ScoreViewer';
import Metronome from './Metronome';
import { MidiVoicePlayer } from './MidiVoicePlayer';

interface RehearsalPanelProps {
    work: any;
    selectedAsset: any;
    onClose: () => void;
}

export function RehearsalPanel({ work, selectedAsset, onClose }: RehearsalPanelProps) {
    const {
        isPlaying,
        togglePlay,
        volumes,
        setVoiceVolume,
        isMuted,
        toggleMute,
        setSolo,
        currentTime
    } = usePlayback({
        workId: work.id,
        assets: work.editions?.[0]?.assets || []
    });

    // Track practice time whenever playing
    usePracticeTracking({
        workId: work.id,
        isActive: isPlaying
    });

    const scoreBpm = usePlaybackStore(s => s.scoreBpm);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const { notes: directorNotes } = useDirectorNotes(work.id);
    const unreadNotes = directorNotes.filter(n => !n.read_at);

    // Find the MusicXML asset if any
    const xmlAsset = work.editions?.[0]?.assets?.find((a: any) => a.asset_type?.toUpperCase() === 'MUSICXML');
    const pdfAsset = work.editions?.[0]?.assets?.find((a: any) => ['PDF', 'SHEET_MUSIC', 'SCORE_PDF'].includes(a.asset_type?.toUpperCase()));

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercent = Math.min((currentTime / (work.duration || 300)) * 100, 100);

    return (
        <div className={`fixed inset-0 z-[100] bg-primary-900 flex flex-col items-stretch overflow-hidden animate-in slide-in-from-bottom-4 duration-300 ${isFullscreen ? 'p-0' : ''}`}>

            {/* Zone 1: Top Header */}
            <header className="h-16 bg-primary-900 border-b border-white/10 px-4 sm:px-6 flex items-center justify-between shrink-0 z-10">
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={onClose}
                        title="Cerrar modo ensayo"
                        className="p-2 hover:bg-white/10 rounded-full text-neutral-300 hover:text-white transition-all"
                    >
                        <X size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-display font-bold text-white line-clamp-1">{work.title}</h1>
                            {unreadNotes.length > 0 && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent-500 text-primary-900 text-[9px] font-black uppercase tracking-widest animate-pulse">
                                    <MessageSquare size={10} />
                                    {unreadNotes.length} {unreadNotes.length === 1 ? 'NOTA' : 'NOTAS'}
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] uppercase tracking-widest text-primary-300 font-bold">{selectedAsset?.original_filename || 'Modo Ensayo'}</p>
                    </div>
                </div>

                <div className="flex-1 flex justify-center">
                    <div className="px-3 py-1 bg-primary-800 rounded-full border border-white/10 text-xs font-medium text-neutral-300 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-600'}`}></span>
                        {isPlaying ? 'Ensayo en curso' : 'En pausa'}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 flex-1">
                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 hover:bg-white/10 rounded-full text-neutral-300 transition-colors"
                        aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                        title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                    >
                        <Maximize2 size={20} />
                    </button>
                </div>
            </header>

            {/* Zone 2: Main Area */}
            <main className="flex-1 bg-neutral-900 flex flex-col md:flex-row relative overflow-hidden">
                <div className="flex-1 p-4 md:p-8 flex justify-center items-start overflow-y-auto">
                    {xmlAsset ? (
                        <ScoreViewer
                            xmlUrl={`${API_URL}/assets/${xmlAsset.id}/stream`}
                            currentTime={currentTime}
                            isPlaying={isPlaying}
                            scoreBpm={scoreBpm}
                        />
                    ) : pdfAsset ? (
                        <div className="w-full max-w-5xl h-full bg-neutral-100 rounded-xl shadow-2xl overflow-hidden">
                            <iframe
                                src={`${API_URL}/assets/${pdfAsset.id}/stream#toolbar=0`}
                                title="Partitura PDF"
                                className="w-full h-full border-none"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-neutral-500 h-64">
                            <p>No hay partitura disponible para visualización dinámica.</p>
                        </div>
                    )}
                </div>

                <aside className="hidden lg:flex w-80 bg-primary-800 border-l border-white/10 p-6 flex-col shrink-0 shadow-2xl overflow-y-auto">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4 font-ui">Metrónomo</h3>
                            <Metronome playing={isPlaying} initialBpm={work.bpm || 80} timeSignature={work.time_signature || 4} />
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4 font-ui">MIDIs por Voz</h3>
                            <MidiVoicePlayer assets={work.editions?.[0]?.assets || []} />
                        </div>
                    </div>
                </aside>
            </main>

            {/* Zone 3: Bottom Control Bar */}
            <footer className="bg-primary-900 border-t border-white/10 px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-6 z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={togglePlay}
                        className="w-14 h-14 flex items-center justify-center rounded-full bg-accent-500 hover:bg-accent-400 text-primary-900 transition-all shadow-glow-accent active:scale-95"
                        aria-label={isPlaying ? "Pausar" : "Reproducir"}
                        title={isPlaying ? "Pausar" : "Reproducir"}
                    >
                        {isPlaying ? <PauseCircle size={32} /> : <PlayCircle size={32} className="ml-1" />}
                    </button>

                    <div className="hidden sm:block">
                        <span className="text-lg font-mono font-bold text-white">{formatTime(currentTime)}</span>
                    </div>
                </div>

                <div className="flex-1 w-full max-w-xl hidden md:block">
                    <div className="h-1.5 w-full bg-primary-800 rounded-full overflow-hidden border border-white/5 cursor-pointer relative group">
                        <div 
                            className="absolute top-0 left-0 h-full bg-primary-500 transition-all duration-300" 
                            style={{ width: `${progressPercent}%` }} 
                        />
                    </div>
                </div>

                <VoiceMixer
                    volumes={volumes}
                    isMuted={isMuted}
                    onVolumeChange={setVoiceVolume}
                    onToggleMute={toggleMute}
                    onSolo={setSolo}
                />
            </footer>
        </div>
    );
}
