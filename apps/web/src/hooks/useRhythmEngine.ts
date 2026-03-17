import { useState, useEffect, useRef, useCallback } from 'react';

interface RhythmEngineConfig {
    bpm: number;
    timeSignature?: string;
    onIntervalRecord?: (timestamp: number) => void;
    onFinish: (taps: number[]) => void;
    expectedBeats: number;
}

export function useRhythmEngine({ bpm, onFinish, expectedBeats, onIntervalRecord }: RhythmEngineConfig) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [taps, setTaps] = useState<number[]>([]);

    // Web Audio Context
    const audioCtxRef = useRef<AudioContext | null>(null);
    const nextNoteTimeRef = useRef(0);
    const currentBeatRef = useRef(0);
    const startTimeRef = useRef(0);
    const timerIDRef = useRef<number | null>(null);

    // Tap capturing state
    const tapsRef = useRef<number[]>([]);
    const isPlayingRef = useRef(false);

    const scheduleAheadTime = 0.1; // s
    const lookahead = 25.0; // ms
    const secondsPerBeat = 60.0 / bpm;

    const playClick = (time: number, isStrongBeat: boolean) => {
        if (!audioCtxRef.current) return;
        const osc = audioCtxRef.current.createOscillator();
        const envelope = audioCtxRef.current.createGain();
        osc.connect(envelope);
        envelope.connect(audioCtxRef.current.destination);

        osc.frequency.value = isStrongBeat ? 1000 : 800;
        envelope.gain.setValueAtTime(1, time);
        envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

        osc.start(time);
        osc.stop(time + 0.1);
    };

    const nextNote = () => {
        nextNoteTimeRef.current += secondsPerBeat;
        currentBeatRef.current++;
    };

    const scheduler = useCallback(() => {
        if (!audioCtxRef.current || !isPlayingRef.current) return;

        // Stop metronome automatically after giving the user enough time
        // E.g., if expectedBeats is 4, we play 4 intro beats + 4 exercise beats + 1 margin = 9 beats max.
        if (currentBeatRef.current >= expectedBeats + 5) {
            stopEngine();
            return;
        }

        while (nextNoteTimeRef.current < audioCtxRef.current.currentTime + scheduleAheadTime) {
            // Strong beat on 0, 4, 8...
            const isStrongBeat = currentBeatRef.current % 4 === 0;
            playClick(nextNoteTimeRef.current, isStrongBeat);
            nextNote();
        }
        timerIDRef.current = window.setTimeout(scheduler, lookahead);
    }, [expectedBeats]);

    const startEngine = useCallback(() => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }

        setIsPlaying(true);
        isPlayingRef.current = true;
        setTaps([]);
        tapsRef.current = [];
        currentBeatRef.current = 0;

        startTimeRef.current = audioCtxRef.current.currentTime + 0.1;
        nextNoteTimeRef.current = startTimeRef.current;
        scheduler();
    }, [scheduler]);

    const stopEngine = useCallback(() => {
        setIsPlaying(false);
        isPlayingRef.current = false;
        if (timerIDRef.current !== null) {
            window.clearTimeout(timerIDRef.current);
            timerIDRef.current = null;
        }
        // Notify parent of final taps
        onFinish(tapsRef.current);
    }, [onFinish]);

    const recordTap = useCallback(() => {
        if (!isPlayingRef.current || !audioCtxRef.current) return;

        const timestampMs = (audioCtxRef.current.currentTime - startTimeRef.current) * 1000;

        // We only care about taps AFTER the 4-beat intro
        const introDurationMs = (secondsPerBeat * 4) * 1000;

        // Adjust timestamp relative to the END of the intro (the start of the actual exercise)
        const adjustedTimestamp = timestampMs - introDurationMs;

        if (adjustedTimestamp > -500) { // Allow slight early anticipated tapping
            tapsRef.current.push(adjustedTimestamp);
            setTaps([...tapsRef.current]);
            if (onIntervalRecord) onIntervalRecord(adjustedTimestamp);

            // Auto-stop if user has tapped enough notes
            if (tapsRef.current.length >= expectedBeats) {
                // Wait briefly before stopping to let UI update
                setTimeout(() => stopEngine(), 500);
            }
        }
    }, [secondsPerBeat, expectedBeats, stopEngine, onIntervalRecord]);

    // Keyboard listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && isPlayingRef.current) {
                e.preventDefault();
                recordTap();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [recordTap]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (timerIDRef.current) window.clearTimeout(timerIDRef.current);
            if (audioCtxRef.current) audioCtxRef.current.close();
        };
    }, []);

    return {
        startEngine,
        stopEngine,
        recordTap,
        isPlaying,
        taps
    };
}
