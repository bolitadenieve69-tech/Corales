'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Volume2, VolumeX, Minus, Plus } from 'lucide-react';
import * as Tone from 'tone';
import { usePlaybackStore } from '@/store/playbackStore';

interface MetronomeProps {
    playing: boolean;
    initialBpm?: number;
    timeSignature?: number; // numerator: 2, 3, 4, 6…
    onBpmChange?: (bpm: number) => void;
}

export default function Metronome({ playing, initialBpm = 100, timeSignature = 4, onBpmChange }: MetronomeProps) {
    // Single source of truth: tempo lives in the global store so ScoreViewer
    // and other consumers always read the user-adjusted value.
    const bpm = usePlaybackStore(s => s.tempo);
    const setStoreTempo = usePlaybackStore(s => s.setTempo);
    const [isMuted, setIsMuted] = useState(false);
    const [beat, setBeat] = useState(0);

    // Seed the store with the work's BPM when the panel opens
    useEffect(() => {
        setStoreTempo(initialBpm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialBpm]);

    const synthRef = useRef<Tone.Synth | null>(null);
    const loopRef = useRef<Tone.Loop | null>(null);

    // Refs so the loop callback always reads the latest values without recreating the loop
    const isMutedRef = useRef(isMuted);
    const timeSignatureRef = useRef(timeSignature);

    useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
    useEffect(() => { timeSignatureRef.current = timeSignature; }, [timeSignature]);

    // Initialize synth once
    useEffect(() => {
        synthRef.current = new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
        }).toDestination();

        return () => {
            synthRef.current?.dispose();
            loopRef.current?.dispose();
        };
    }, []);

    // Sync time signature with Transport
    useEffect(() => {
        Tone.getTransport().timeSignature = timeSignature;
    }, [timeSignature]);

    // Play / pause — fix: always recreate loop on play to avoid stale-stop state
    useEffect(() => {
        if (playing) {
            // Dispose previous loop so we never accumulate scheduled events
            loopRef.current?.dispose();
            loopRef.current = new Tone.Loop((time) => {
                const pos = Tone.getTransport().position as string;
                const beatNum = parseInt(pos.split(':')[1] ?? '0');
                setBeat(beatNum % timeSignatureRef.current);
                if (!isMutedRef.current && synthRef.current) {
                    // Beat 0 = strong accent (higher pitch), rest = weak (lower)
                    const frequency = beatNum === 0 ? 'C6' : 'C5';
                    synthRef.current.triggerAttackRelease(frequency, '32n', time);
                }
            }, '4n').start(0);

            if (Tone.getTransport().state !== 'started') {
                Tone.getTransport().start();
            }
        } else {
            // Stop only this loop — do not stop the shared Transport
            loopRef.current?.stop();
        }
    }, [playing]);

    const adjustBpm = (delta: number) => {
        const newBpm = Math.min(Math.max(bpm + delta, 40), 220);
        setStoreTempo(newBpm);
        onBpmChange?.(newBpm);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Timer size={18} className={playing ? 'text-accent-500 animate-pulse' : 'text-neutral-600'} />
                    <span className="text-xs font-bold text-neutral-300 uppercase tracking-widest">Metrónomo</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-neutral-600 tabular-nums">{timeSignature}/4</span>
                    <button
                        type="button"
                        onClick={() => setIsMuted(!isMuted)}
                        title={isMuted ? 'Activar sonido' : 'Silenciar'}
                        aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                        className={`p-2 rounded-lg transition-colors focus-ring ${isMuted ? 'text-red-400 bg-red-400/10' : 'text-neutral-300 hover:bg-white/5'}`}
                    >
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-center gap-6 py-4">
                <button
                    onClick={() => adjustBpm(-5)}
                    title="Disminuir tempo"
                    aria-label="Disminuir tempo"
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-neutral-300 transition-all border border-white/5"
                >
                    <Minus size={20} />
                </button>

                <div className="text-center relative">
                    <div className="text-5xl font-black text-white tabular-nums drop-shadow-glow">{bpm}</div>
                    <div className="text-[10px] text-accent-500 font-bold tracking-widest uppercase mt-1">BPM</div>

                    <AnimatePresence>
                        {playing && (
                            <motion.div
                                key={beat}
                                initial={{ scale: 1, opacity: 0.5 }}
                                animate={{ scale: 2, opacity: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-accent-500/20 rounded-full -z-10"
                            />
                        )}
                    </AnimatePresence>
                </div>

                <button
                    onClick={() => adjustBpm(5)}
                    title="Aumentar tempo"
                    aria-label="Aumentar tempo"
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-neutral-300 transition-all border border-white/5"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="px-2">
                <input
                    type="range"
                    min="40"
                    max="220"
                    value={bpm}
                    title="Ajustar BPM"
                    aria-label="Ajustar pulsaciones por minuto"
                    onChange={(e) => {
                        const newBpm = parseInt(e.target.value);
                        setStoreTempo(newBpm);
                        onBpmChange?.(newBpm);
                    }}
                    className="w-full h-1.5 bg-primary-700 rounded-lg appearance-none cursor-pointer accent-accent-500 focus-ring"
                />
            </div>

            {/* Dynamic beat LEDs — one per beat in the time signature */}
            {playing && (
                <div className="flex justify-center gap-3">
                    {Array.from({ length: timeSignature }).map((_, i) => (
                        <div
                            key={i}
                            className={`rounded-full transition-all duration-75 ${
                                beat === i
                                    ? i === 0
                                        // Strong beat: accent color, bigger
                                        ? 'w-4 h-4 bg-accent-500 shadow-glow-accent scale-150'
                                        // Weak beat: primary color, medium
                                        : 'w-2.5 h-2.5 bg-primary-400 scale-125'
                                    : 'w-2.5 h-2.5 bg-primary-900 border border-white/10'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
