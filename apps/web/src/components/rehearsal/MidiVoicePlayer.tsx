'use client';

import React from 'react';
import { Play, Square, Download, Loader2 } from 'lucide-react';
import { useMidiPlayback, MidiVoice } from '@/hooks/useMidiPlayback';

interface MidiVoicePlayerProps {
    assets: any[];
}

const VOICE_CONFIG: Record<MidiVoice, { label: string; shortcut: string; color: string }> = {
    soprano: { label: 'Soprano', shortcut: 'S', color: 'var(--color-voice-soprano)' },
    alto:    { label: 'Alto',    shortcut: 'A', color: 'var(--color-voice-alto)'    },
    tenor:   { label: 'Tenor',   shortcut: 'T', color: 'var(--color-voice-tenor)'   },
    bajo:    { label: 'Bajo',    shortcut: 'B', color: 'var(--color-voice-bajo)'    },
};

export function MidiVoicePlayer({ assets }: MidiVoicePlayerProps) {
    const { voiceInfo, playVoice, getStreamUrl } = useMidiPlayback({ assets });

    const voices = Object.keys(VOICE_CONFIG) as MidiVoice[];
    const anyAvailable = voices.some(v => voiceInfo[v].assetId !== null);

    if (!anyAvailable) {
        return (
            <p className="text-xs text-neutral-600 italic">
                No hay MIDIs por voz disponibles para esta obra.
            </p>
        );
    }

    return (
        <div className="space-y-2">
            {voices.map(voice => {
                const config = VOICE_CONFIG[voice];
                const info = voiceInfo[voice];
                const streamUrl = getStreamUrl(voice);
                const available = info.assetId !== null;

                return (
                    <div
                        key={voice}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all ${
                            available
                                ? info.isPlaying
                                    ? 'bg-white/10 border-white/20'
                                    : 'bg-white/5 border-white/5 hover:bg-white/8 hover:border-white/10'
                                : 'bg-white/[0.02] border-white/5 opacity-40'
                        }`}
                    >
                        {/* Voice indicator */}
                        <div className="flex items-center gap-2">
                            <span
                                className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black shrink-0"
                                style={{
                                    backgroundColor: `color-mix(in srgb, ${config.color} 20%, transparent)`,
                                    color: config.color,
                                    border: `1px solid color-mix(in srgb, ${config.color} 40%, transparent)`,
                                }}
                            >
                                {config.shortcut}
                            </span>
                            <span className="text-sm font-medium text-neutral-300">
                                {config.label}
                            </span>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1">
                            {/* Play / Stop */}
                            <button
                                onClick={() => available && playVoice(voice)}
                                disabled={!available || info.isLoading}
                                title={info.isPlaying ? `Detener ${config.label}` : `Reproducir MIDI ${config.label}`}
                                className={`p-1.5 rounded-lg transition-all focus-ring ${
                                    !available
                                        ? 'text-neutral-700 cursor-not-allowed'
                                        : info.isPlaying
                                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                            : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {info.isLoading ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : info.isPlaying ? (
                                    <Square size={14} />
                                ) : (
                                    <Play size={14} />
                                )}
                            </button>

                            {/* Download */}
                            {streamUrl && (
                                <a
                                    href={streamUrl}
                                    download={`${config.label}.mid`}
                                    title={`Descargar MIDI ${config.label}`}
                                    className="p-1.5 rounded-lg bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white transition-all focus-ring"
                                >
                                    <Download size={14} />
                                </a>
                            )}

                            {/* Not available indicator */}
                            {!available && (
                                <span className="text-[10px] text-neutral-600 italic ml-1">—</span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
