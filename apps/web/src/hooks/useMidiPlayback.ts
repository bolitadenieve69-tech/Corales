'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import * as Tone from 'tone';
import { API_URL } from '@/lib/api';
import { usePlaybackStore } from '@/store/playbackStore';

export type MidiVoice = 'soprano' | 'alto' | 'tenor' | 'bajo';

const VOICE_ASSET_TYPES: Record<MidiVoice, string> = {
    soprano: 'MIDI_SOPRANO',
    alto: 'MIDI_ALTO',
    tenor: 'MIDI_TENOR',
    bajo: 'MIDI_BASS',
};

export interface MidiVoiceInfo {
    assetId: string | null;
    fileUrl: string | null;
    isLoading: boolean;
    isPlaying: boolean;
}

export function useMidiPlayback({ assets = [] }: { assets?: any[] }) {
    const { volumes, isMuted, setScoreBpm, isPlaying: transportPlaying, togglePlay } = usePlaybackStore();
    
    const [voiceInfo, setVoiceInfo] = useState<Record<MidiVoice, MidiVoiceInfo>>({
        soprano: { assetId: null, fileUrl: null, isLoading: false, isPlaying: false },
        alto:    { assetId: null, fileUrl: null, isLoading: false, isPlaying: false },
        tenor:   { assetId: null, fileUrl: null, isLoading: false, isPlaying: false },
        bajo:    { assetId: null, fileUrl: null, isLoading: false, isPlaying: false },
    });

    const synthsRef = useRef<Record<MidiVoice, Tone.PolySynth | null>>({
        soprano: null, alto: null, tenor: null, bajo: null,
    });
    const partRefs = useRef<Record<MidiVoice, Tone.Part | null>>({
        soprano: null, alto: null, tenor: null, bajo: null,
    });

    // Sync volume and mute states to synths
    useEffect(() => {
        (Object.keys(synthsRef.current) as MidiVoice[]).forEach(voice => {
            const synth = synthsRef.current[voice];
            if (synth) {
                const vol = volumes[voice] ?? 100;
                const muted = isMuted[voice] ?? false;
                synth.volume.value = muted ? -100 : Tone.gainToDb(vol / 100);
            }
        });
    }, [volumes, isMuted]);

    useEffect(() => {
        setVoiceInfo(prev => {
            const updated = { ...prev };
            (Object.keys(VOICE_ASSET_TYPES) as MidiVoice[]).forEach(voice => {
                const asset = assets.find((a: any) => a.asset_type === VOICE_ASSET_TYPES[voice]);
                updated[voice] = { ...updated[voice], assetId: asset?.id ?? null, fileUrl: asset?.file_url ?? null };
            });
            return updated;
        });
    }, [assets]);

    const stopVoice = useCallback((voice: MidiVoice) => {
        if (partRefs.current[voice]) {
            partRefs.current[voice]?.stop();
            partRefs.current[voice]?.dispose();
            partRefs.current[voice] = null;
        }
        if (synthsRef.current[voice]) {
            synthsRef.current[voice]?.releaseAll();
            synthsRef.current[voice]?.dispose();
            synthsRef.current[voice] = null;
        }
        setVoiceInfo(prev => ({
            ...prev,
            [voice]: { ...prev[voice], isPlaying: false, isLoading: false },
        }));
    }, []);

    const playVoice = useCallback(async (voice: MidiVoice) => {
        const { assetId, fileUrl } = voiceInfo[voice];
        if (!assetId && !fileUrl) return;

        if (voiceInfo[voice].isPlaying) {
            stopVoice(voice);
            return;
        }

        setVoiceInfo(prev => ({ ...prev, [voice]: { ...prev[voice], isLoading: true } }));

        try {
            await Tone.start();
            const { Midi } = await import('@tonejs/midi');
            
            // Priorizamos la URL directa (Supabase Storage), y de fallback la API antigua
            const midiUrl = fileUrl || `${API_URL}/assets/${assetId}/stream`;
            const midi = await Midi.fromUrl(midiUrl);

            // Expose score BPM so ScoreViewer can sync cursor correctly
            const midiFileBpm = midi.header.tempos[0]?.bpm ?? 120;
            setScoreBpm(midiFileBpm);

            // Start Transport if not already running (first voice play)
            if (!transportPlaying) {
                Tone.getTransport().position = 0;
                togglePlay();
            }

            // Create Synth
            const synth = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'triangle' },
                envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.8 },
            }).toDestination();
            
            // Apply current volume immediately
            const vol = volumes[voice] ?? 100;
            const muted = isMuted[voice] ?? false;
            synth.volume.value = muted ? -100 : Tone.gainToDb(vol / 100);
            
            synthsRef.current[voice] = synth;

            // Prepare part for Transport synchronization
            const notes = midi.tracks.flatMap(t => t.notes);
            const part = new Tone.Part((time, note) => {
                synth.triggerAttackRelease(note.name, note.duration, time, note.velocity);
            }, notes.map(n => ({ time: n.time, name: n.name, duration: n.duration, velocity: n.velocity })));

            part.start(0);
            partRefs.current[voice] = part;

            setVoiceInfo(prev => ({
                ...prev,
                [voice]: { ...prev[voice], isLoading: false, isPlaying: true },
            }));

        } catch (err) {
            console.error(`[useMidiPlayback] Error loading MIDI for ${voice}:`, err);
            setVoiceInfo(prev => ({
                ...prev,
                [voice]: { ...prev[voice], isLoading: false, isPlaying: false },
            }));
        }
    }, [voiceInfo, stopVoice, volumes, isMuted]);

    const stopAll = useCallback(() => {
        (Object.keys(VOICE_ASSET_TYPES) as MidiVoice[]).forEach(stopVoice);
    }, [stopVoice]);

    const getStreamUrl = useCallback((voice: MidiVoice): string | null => {
        const { assetId, fileUrl } = voiceInfo[voice];
        return fileUrl || (assetId ? `${API_URL}/assets/${assetId}/stream` : null);
    }, [voiceInfo]);

    return { voiceInfo, playVoice, stopVoice, stopAll, getStreamUrl };
}
