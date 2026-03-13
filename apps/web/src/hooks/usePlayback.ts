'use client';

import { useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { usePlaybackStore } from '@/store/playbackStore';

export type Voice = 'soprano' | 'alto' | 'tenor' | 'bajo';

interface UsePlaybackProps {
    workId: string;
    assets?: any[];
}

export function usePlayback({ workId, assets = [] }: UsePlaybackProps) {
    const {
        isPlaying,
        setIsPlaying,
        setCurrentTime,
        tempo,
        volumes,
        isMuted,
        setVolume,
        setMuted,
        togglePlay
    } = usePlaybackStore();

    // Sync Tone.Transport state with store on mount/init
    useEffect(() => {
        Tone.getTransport().bpm.value = tempo;
    }, []);

    // Animation loop to update current time
    useEffect(() => {
        let animationId: number;

        const updateTime = () => {
            if (Tone.getTransport().state === 'started') {
                setCurrentTime(Tone.getTransport().seconds);
            }
            animationId = requestAnimationFrame(updateTime);
        };

        animationId = requestAnimationFrame(updateTime);
        return () => cancelAnimationFrame(animationId);
    }, [setCurrentTime]);

    const setVoiceVolume = useCallback((voice: Voice, volume: number) => {
        setVolume(voice, volume);
        // If there were players, we'd update them here.
        // This hook is becoming a coordinator.
    }, [setVolume]);

    const toggleVoiceMute = useCallback((voice: Voice) => {
        setMuted(voice, !isMuted[voice]);
    }, [isMuted, setMuted]);

    const setSolo = useCallback((voice: Voice) => {
        const voices: Voice[] = ['soprano', 'alto', 'tenor', 'bajo'];
        voices.forEach(v => {
            setMuted(v, v !== voice);
        });
    }, [setMuted]);

    return {
        isPlaying,
        togglePlay,
        tempo,
        volumes,
        setVoiceVolume,
        isMuted,
        toggleMute: toggleVoiceMute,
        setSolo,
        currentTime: usePlaybackStore(s => s.currentTime)
    };
}
