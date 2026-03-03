'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';

// Design tokens match tokens.css
// --color-voice-soprano: #E8A0BF;
// --color-voice-alto:    #F0A500;
// --color-voice-tenor:   #4EA8DE;
// --color-voice-bajo:    #6C5CE7;

export type Voice = 'soprano' | 'alto' | 'tenor' | 'bajo';

interface UsePlaybackProps {
    workId: string;
    assets?: any[];
    onProgress?: (progress: number) => void;
}

export function usePlayback({ workId, assets = [], onProgress }: UsePlaybackProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [tempo, setTempo] = useState(100);
    const [volumes, setVolumes] = useState<Record<Voice, number>>({
        soprano: 100,
        alto: 100,
        tenor: 100,
        bajo: 100
    });
    const [isMuted, setIsMuted] = useState<Record<Voice, boolean>>({
        soprano: false,
        alto: false,
        tenor: false,
        bajo: false
    });

    const [minutesPracticed, setMinutesPracticed] = useState(0);
    const startTimeRef = useRef<number | null>(null);

    // Tone.js player refs
    const playersRef = useRef<Record<Voice, Tone.Player | null>>({
        soprano: null,
        alto: null,
        tenor: null,
        bajo: null
    });

    const setupAudio = useCallback(async () => {
        if (Tone.getContext().state !== 'running') {
            await Tone.start();
        }

        // Find audio tracks for each voice
        const voiceTracks: Record<Voice, string | null> = {
            soprano: assets?.find(a => a.asset_type === 'AUDIO_SOPRANO')?.id || null,
            alto: assets?.find(a => a.asset_type === 'AUDIO_ALTO')?.id || null,
            tenor: assets?.find(a => a.asset_type === 'AUDIO_TENOR')?.id || null,
            bajo: assets?.find(a => a.asset_type === 'AUDIO_BASS')?.id || null,
        };

        // Create players for found tracks
        for (const [voice, assetId] of Object.entries(voiceTracks)) {
            if (assetId && !playersRef.current[voice as Voice]) {
                const player = new Tone.Player({
                    url: `/api/v1/assets/${assetId}/stream`,
                    autostart: false,
                    loop: true,
                }).toDestination();
                playersRef.current[voice as Voice] = player;
            }
        }

        console.log('Audio context and players initialized');
    }, [assets]);

    const togglePlay = useCallback(async () => {
        if (Tone.getContext().state !== 'running') {
            await setupAudio();
        }

        if (isPlaying) {
            Tone.getTransport().pause();
            setIsPlaying(false);
            if (startTimeRef.current) {
                const sessionMinutes = (Date.now() - startTimeRef.current) / 60000;
                setMinutesPracticed(prev => prev + sessionMinutes);
                startTimeRef.current = null;
            }
        } else {
            Tone.getTransport().start();
            setIsPlaying(true);
            startTimeRef.current = Date.now();
        }
    }, [isPlaying, setupAudio]);

    const setVoiceVolume = useCallback((voice: Voice, volume: number) => {
        setVolumes(prev => ({ ...prev, [voice]: volume }));
        const player = playersRef.current[voice];
        if (player) {
            // Volume in Tone.js is in decibels. 0 is original, -inf is mute.
            // Simplified linear mapping for now.
            player.volume.value = Tone.gainToDb(volume / 100);
        }
    }, []);

    const toggleMute = useCallback((voice: Voice) => {
        setIsMuted(prev => {
            const newState = !prev[voice];
            const player = playersRef.current[voice];
            if (player) {
                player.mute = newState;
            }
            return { ...prev, [voice]: newState };
        });
    }, []);

    const setSolo = useCallback((voice: Voice) => {
        const newMutedState: Record<Voice, boolean> = {
            soprano: voice !== 'soprano',
            alto: voice !== 'alto',
            tenor: voice !== 'tenor',
            bajo: voice !== 'bajo'
        };
        setIsMuted(newMutedState);
        Object.entries(newMutedState).forEach(([v, muted]) => {
            const player = playersRef.current[v as Voice];
            if (player) player.mute = muted;
        });
    }, []);

    const resetMixer = useCallback(() => {
        const resetMuted = { soprano: false, alto: false, tenor: false, bajo: false };
        const resetVolumes = { soprano: 100, alto: 100, tenor: 100, bajo: 100 };
        setIsMuted(resetMuted);
        setVolumes(resetVolumes);
        Object.values(playersRef.current).forEach(player => {
            if (player) {
                player.mute = false;
                player.volume.value = 0;
            }
        });
    }, []);

    return {
        isPlaying,
        togglePlay,
        tempo,
        setTempo,
        volumes,
        setVoiceVolume,
        isMuted,
        toggleMute,
        setSolo,
        resetMixer,
        minutesPracticed
    };
}
