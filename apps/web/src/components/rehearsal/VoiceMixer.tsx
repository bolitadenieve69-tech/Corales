'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Star } from 'lucide-react';
import { Voice } from '@/hooks/usePlayback';

interface VoiceMixerProps {
    volumes: Record<Voice, number>;
    isMuted: Record<Voice, boolean>;
    onVolumeChange: (voice: Voice, volume: number) => void;
    onToggleMute: (voice: Voice) => void;
    onSolo: (voice: Voice) => void;
}

const VOICE_CONFIG: Record<Voice, { label: string, color: string, shortcut: string }> = {
    soprano: { label: 'Soprano', color: 'var(--color-voice-soprano)', shortcut: 'S' },
    alto: { label: 'Alto', color: 'var(--color-voice-alto)', shortcut: 'A' },
    tenor: { label: 'Tenor', color: 'var(--color-voice-tenor)', shortcut: 'T' },
    bajo: { label: 'Bajo', color: 'var(--color-voice-bajo)', shortcut: 'B' },
};

export function VoiceMixer({ volumes, isMuted, onVolumeChange, onToggleMute, onSolo }: VoiceMixerProps) {
    return (
        <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end overflow-x-auto pb-2 md:pb-0">
            {(Object.keys(VOICE_CONFIG) as Voice[]).map((voice) => {
                const config = VOICE_CONFIG[voice];
                const volume = volumes[voice];
                const muted = isMuted[voice];

                return (
                    <div key={voice} className="flex flex-col items-center gap-2 group min-w-[60px]">
                        {/* Solo Button */}
                        <button
                            onClick={() => onSolo(voice)}
                            className="p-1 hover:bg-white/10 rounded-md text-[8px] font-black uppercase tracking-widest text-neutral-500 hover:text-accent-500 transition-colors flex items-center gap-1 focus-ring"
                            title={`Solo ${config.label}`}
                            aria-label={`Solo ${config.label}`}
                        >
                            <Star size={8} fill={muted ? "none" : "currentColor"} className={muted ? "" : "text-accent-500"} />
                            Solo
                        </button>

                        {/* Slider Tube */}
                        <div className="relative w-10 h-32 bg-primary-900 rounded-xl border border-white/5 p-1 flex items-end justify-center group-hover:border-white/20 transition-all shadow-inner">
                            {/* Level fill */}
                            <motion.div
                                initial={false}
                                animate={{ height: `${muted ? 0 : volume}%` }}
                                style={{ backgroundColor: config.color }}
                                className="w-full rounded-lg opacity-80 shadow-lg relative z-0"
                            />

                            {/* Input Range (Visual Overlay) */}
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={volume}
                                title={`Volumen ${config.label}`}
                                aria-label={`Volumen ${config.label}`}
                                onChange={(e) => onVolumeChange(voice, parseInt(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize z-10 [writing-mode:bt-lr] appearance-slider-vertical"
                            />

                            {/* Label */}
                            <span className="absolute -top-6 text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">
                                {config.shortcut}
                            </span>
                        </div>

                        {/* Mute Button */}
                        <button
                            onClick={() => onToggleMute(voice)}
                            className={`p-2 rounded-lg transition-all focus-ring ${muted ? 'bg-red-500/20 text-red-500' : 'bg-primary-800 text-neutral-400 hover:text-white'}`}
                            aria-label={muted ? `Activar sonido ${config.label}` : `Silenciar ${config.label}`}
                        >
                            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
