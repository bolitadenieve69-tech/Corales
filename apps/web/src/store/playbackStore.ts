'use client';

import { create } from 'zustand';
import * as Tone from 'tone';

interface PlaybackState {
    isPlaying: boolean;
    currentTime: number;
    tempo: number;
    scoreBpm: number;          // BPM leído del archivo MIDI/partitura
    volumes: Record<string, number>;
    isMuted: Record<string, boolean>;

    // Actions
    setIsPlaying: (playing: boolean) => void;
    setCurrentTime: (time: number) => void;
    setTempo: (tempo: number) => void;
    setScoreBpm: (bpm: number) => void;
    setVolume: (voice: string, volume: number) => void;
    setMuted: (voice: string, muted: boolean) => void;
    togglePlay: () => void;
}

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
    isPlaying: false,
    currentTime: 0,
    tempo: 100,
    scoreBpm: 120,
    volumes: {
        soprano: 100,
        alto: 100,
        tenor: 100,
        bajo: 100,
    },
    isMuted: {
        soprano: false,
        alto: false,
        tenor: false,
        bajo: false,
    },

    setIsPlaying: (isPlaying) => set({ isPlaying }),
    setCurrentTime: (currentTime) => set({ currentTime }),
    setScoreBpm: (scoreBpm) => set({ scoreBpm }),
    setTempo: (tempo) => {
        set({ tempo });
        if (typeof window !== 'undefined') {
            Tone.getTransport().bpm.value = tempo;
        }
    },
    setVolume: (voice, volume) => set((state) => ({
        volumes: { ...state.volumes, [voice]: volume }
    })),
    setMuted: (voice, muted) => set((state) => ({
        isMuted: { ...state.isMuted, [voice]: muted }
    })),
    togglePlay: () => {
        const { isPlaying } = get();
        if (typeof window !== 'undefined') {
            if (isPlaying) {
                Tone.getTransport().pause();
            } else {
                Tone.getTransport().start();
            }
        }
        set({ isPlaying: !isPlaying });
    },
}));
