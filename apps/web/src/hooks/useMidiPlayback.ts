'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import * as Tone from 'tone';
import { API_URL } from '@/lib/api';

export type MidiVoice = 'soprano' | 'alto' | 'tenor' | 'bajo';

const VOICE_ASSET_TYPES: Record<MidiVoice, string> = {
    soprano: 'MIDI_SOPRANO',
    alto: 'MIDI_ALTO',
    tenor: 'MIDI_TENOR',
    bajo: 'MIDI_BASS',
};

export interface MidiVoiceInfo {
    assetId: string | null;
    isLoading: boolean;
    isPlaying: boolean;
}

export function useMidiPlayback({ assets = [] }: { assets?: any[] }) {
    const [voiceInfo, setVoiceInfo] = useState<Record<MidiVoice, MidiVoiceInfo>>({
        soprano: { assetId: null, isLoading: false, isPlaying: false },
        alto:    { assetId: null, isLoading: false, isPlaying: false },
        tenor:   { assetId: null, isLoading: false, isPlaying: false },
        bajo:    { assetId: null, isLoading: false, isPlaying: false },
    });

    const synthsRef = useRef<Record<MidiVoice, Tone.PolySynth | null>>({
        soprano: null, alto: null, tenor: null, bajo: null,
    });

    // Resolve asset IDs whenever the assets list changes
    useEffect(() => {
        setVoiceInfo(prev => {
            const updated = { ...prev };
            (Object.keys(VOICE_ASSET_TYPES) as MidiVoice[]).forEach(voice => {
                const asset = assets.find((a: any) => a.asset_type === VOICE_ASSET_TYPES[voice]);
                updated[voice] = { ...updated[voice], assetId: asset?.id ?? null };
            });
            return updated;
        });
    }, [assets]);

    const stopVoice = useCallback((voice: MidiVoice) => {
        const synth = synthsRef.current[voice];
        if (synth) {
            synth.releaseAll();
            synth.dispose();
            synthsRef.current[voice] = null;
        }
        setVoiceInfo(prev => ({
            ...prev,
            [voice]: { ...prev[voice], isPlaying: false, isLoading: false },
        }));
    }, []);

    const playVoice = useCallback(async (voice: MidiVoice) => {
        const assetId = voiceInfo[voice].assetId;
        if (!assetId) return;

        // Toggle off if already playing
        if (voiceInfo[voice].isPlaying) {
            stopVoice(voice);
            return;
        }

        setVoiceInfo(prev => ({ ...prev, [voice]: { ...prev[voice], isLoading: true } }));

        try {
            await Tone.start();

            // Dynamic import to avoid SSR issues
            const { Midi } = await import('@tonejs/midi');
            const midi = await Midi.fromUrl(`${API_URL}/assets/${assetId}/stream`);

            // Create a PolySynth with a piano-like envelope
            const synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'triangle' },
                envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.8 },
            }).toDestination();
            synth.volume.value = -6;
            synthsRef.current[voice] = synth;

            // Schedule all notes at absolute audio-context times (no Transport dependency)
            const startAt = Tone.now() + 0.1;
            midi.tracks.forEach(track => {
                track.notes.forEach(note => {
                    synth.triggerAttackRelease(
                        note.name,
                        note.duration,
                        startAt + note.time,
                        note.velocity,
                    );
                });
            });

            setVoiceInfo(prev => ({
                ...prev,
                [voice]: { ...prev[voice], isLoading: false, isPlaying: true },
            }));

            // Auto-stop once the MIDI finishes
            const durationMs = (midi.duration + 0.5) * 1000;
            setTimeout(() => stopVoice(voice), durationMs);

        } catch (err) {
            console.error(`[useMidiPlayback] Error loading MIDI for ${voice}:`, err);
            setVoiceInfo(prev => ({
                ...prev,
                [voice]: { ...prev[voice], isLoading: false, isPlaying: false },
            }));
        }
    }, [voiceInfo, stopVoice]);

    const stopAll = useCallback(() => {
        (Object.keys(VOICE_ASSET_TYPES) as MidiVoice[]).forEach(stopVoice);
    }, [stopVoice]);

    const getStreamUrl = useCallback((voice: MidiVoice): string | null => {
        const { assetId } = voiceInfo[voice];
        return assetId ? `${API_URL}/assets/${assetId}/stream` : null;
    }, [voiceInfo]);

    return { voiceInfo, playVoice, stopVoice, stopAll, getStreamUrl };
}
