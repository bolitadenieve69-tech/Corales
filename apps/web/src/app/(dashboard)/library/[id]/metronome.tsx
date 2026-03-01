"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Volume2, VolumeX, Minus, Plus } from 'lucide-react';

interface MetronomeProps {
    playing: boolean;
    initialBpm?: number;
    onBpmChange?: (bpm: number) => void;
}

export default function Metronome({ playing, initialBpm = 100, onBpmChange }: MetronomeProps) {
    const [bpm, setBpm] = useState(initialBpm);
    const [isMuted, setIsMuted] = useState(false);
    const [beat, setBeat] = useState(0); // 0 or 1 for visual toggle

    const audioContextRef = useRef<AudioContext | null>(null);
    const nextTickTimeRef = useRef(0);
    const timerIDRef = useRef<number | null>(null);

    const lookahead = 25.0; // How frequently to call scheduling function (ms)
    const scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)

    const nextTick = useCallback(() => {
        const secondsPerBeat = 60.0 / bpm;
        nextTickTimeRef.current += secondsPerBeat;
        setBeat((prev) => (prev + 1) % 2);
    }, [bpm]);

    const scheduleNote = useCallback((time: number) => {
        if (!audioContextRef.current || isMuted) return;

        const osc = audioContextRef.current.createOscillator();
        const envelope = audioContextRef.current.createGain();

        osc.frequency.value = 880; // High pitch for tick
        envelope.gain.value = 0.5;
        envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

        osc.connect(envelope);
        envelope.connect(audioContextRef.current.destination);

        osc.start(time);
        osc.stop(time + 0.1);
    }, [isMuted]);

    const scheduler = useCallback(() => {
        while (nextTickTimeRef.current < (audioContextRef.current?.currentTime || 0) + scheduleAheadTime) {
            scheduleNote(nextTickTimeRef.current);
            nextTick();
        }
        timerIDRef.current = window.setTimeout(scheduler, lookahead);
    }, [nextTick, scheduleNote]);

    useEffect(() => {
        if (playing) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            nextTickTimeRef.current = audioContextRef.current.currentTime;
            scheduler();
        } else {
            if (timerIDRef.current) {
                clearTimeout(timerIDRef.current);
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        }
        return () => {
            if (timerIDRef.current) clearTimeout(timerIDRef.current);
        };
    }, [playing, scheduler]);

    const adjustBpm = (delta: number) => {
        const newBpm = Math.min(Math.max(bpm + delta, 40), 240);
        setBpm(newBpm);
        onBpmChange?.(newBpm);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Timer size={18} className={playing ? "text-indigo-400 animate-pulse" : "text-slate-500"} />
                    <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Metrónomo</span>
                </div>
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    title={isMuted ? "Activar sonido" : "Silenciar"}
                    className={`p-2 rounded-lg transition-colors ${isMuted ? 'text-red-400 bg-red-400/10' : 'text-slate-400 hover:bg-white/5'}`}
                >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
            </div>

            <div className="flex items-center justify-center gap-6 py-2">
                <button
                    onClick={() => adjustBpm(-5)}
                    title="Disminuir tempo"
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-all ring-1 ring-white/5"
                >
                    <Minus size={20} />
                </button>

                <div className="text-center relative">
                    <div className="text-4xl font-black text-white tabular-nums drop-shadow-lg">{bpm}</div>
                    <div className="text-[10px] text-indigo-400/70 font-bold tracking-tighter uppercase mt-1">BPM</div>

                    {/* Visual Beat Indicator */}
                    <AnimatePresence>
                        {playing && (
                            <motion.div
                                key={beat}
                                initial={{ scale: 1, opacity: 0.5 }}
                                animate={{ scale: 1.5, opacity: 0 }}
                                className="absolute inset-0 bg-indigo-500/20 rounded-full -z-10"
                            />
                        )}
                    </AnimatePresence>
                </div>

                <button
                    onClick={() => adjustBpm(5)}
                    title="Aumentar tempo"
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-all ring-1 ring-white/5"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="px-2">
                <input
                    type="range"
                    min="40"
                    max="240"
                    value={bpm}
                    title="Ajustar BPM"
                    aria-label="Ajustar pulsaciones por minuto"
                    onChange={(e) => {
                        const newBpm = parseInt(e.target.value);
                        setBpm(newBpm);
                        onBpmChange?.(newBpm);
                    }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
            </div>

            {playing && (
                <div className="flex justify-center gap-3">
                    {[0, 1].map((i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all duration-100 ${beat === i ? 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)] scale-125' : 'bg-slate-700'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
