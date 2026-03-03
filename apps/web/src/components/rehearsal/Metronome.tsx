'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Volume2, VolumeX, Minus, Plus } from 'lucide-react';
import * as Tone from 'tone';

interface MetronomeProps {
    playing: boolean;
    initialBpm?: number;
    onBpmChange?: (bpm: number) => void;
}

export default function Metronome({ playing, initialBpm = 100, onBpmChange }: MetronomeProps) {
    const [bpm, setBpm] = useState(initialBpm);
    const [isMuted, setIsMuted] = useState(false);
    const [beat, setBeat] = useState(0);

    // Tone.js Synth for the click
    const synthRef = useRef<Tone.Synth | null>(null);
    const loopRef = useRef<Tone.Loop | null>(null);

    // Initialize Tone.js objects
    useEffect(() => {
        synthRef.current = new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: {
                attack: 0.001,
                decay: 0.1,
                sustain: 0,
                release: 0.1
            }
        }).toDestination();

        return () => {
            synthRef.current?.dispose();
            loopRef.current?.dispose();
        };
    }, []);

    // Sync BPM with Tone.Transport
    useEffect(() => {
        Tone.getTransport().bpm.value = bpm;
    }, [bpm]);

    // Handle play/stop through Tone.Transport or local Loop
    useEffect(() => {
        if (playing) {
            if (!loopRef.current) {
                loopRef.current = new Tone.Loop((time) => {
                    const currentBeat = (Tone.getTransport().position as string).split(':')[1];
                    const beatNum = parseInt(currentBeat);

                    setBeat(beatNum % 2); // Visual toggle

                    if (!isMuted && synthRef.current) {
                        // First beat differentiation (higher pitch)
                        const frequency = (beatNum === 0) ? "C6" : "C5";
                        synthRef.current.triggerAttackRelease(frequency, "32n", time);
                    }
                }, "4n").start(0);
            }
        } else {
            loopRef.current?.stop();
        }
    }, [playing, isMuted]);

    const adjustBpm = (delta: number) => {
        const newBpm = Math.min(Math.max(bpm + delta, 40), 220); // Range 40-220 as per Rules
        setBpm(newBpm);
        onBpmChange?.(newBpm);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Timer size={18} className={playing ? "text-accent-500 animate-pulse" : "text-neutral-600"} />
                    <span className="text-xs font-bold text-neutral-300 uppercase tracking-widest">Metrónomo</span>
                </div>
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    title={isMuted ? "Activar sonido" : "Silenciar"}
                    aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                    className={`p-2 rounded-lg transition-colors focus-ring ${isMuted ? 'text-red-400 bg-red-400/10' : 'text-neutral-300 hover:bg-white/5'}`}
                >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
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

                    {/* Visual Beat Indicator */}
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
                        setBpm(newBpm);
                        onBpmChange?.(newBpm);
                    }}
                    className="w-full h-1.5 bg-primary-700 rounded-lg appearance-none cursor-pointer accent-accent-500 focus-ring"
                />
            </div>

            {playing && (
                <div className="flex justify-center gap-4">
                    {[0, 1].map((i) => (
                        <div
                            key={i}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-75 ${beat === i ? 'bg-accent-500 shadow-glow-accent scale-150' : 'bg-primary-900 border border-white/10'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
