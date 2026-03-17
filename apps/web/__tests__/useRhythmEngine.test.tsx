import { renderHook, act } from '@testing-library/react';
import { useRhythmEngine } from '../src/hooks/useRhythmEngine';

// Mock Web Audio API
class AudioContextMock {
    state = 'suspended';
    currentTime = 0;

    createOscillator() {
        return {
            connect: jest.fn(),
            frequency: { value: 0 },
            start: jest.fn(),
            stop: jest.fn(),
        };
    }

    createGain() {
        return {
            connect: jest.fn(),
            gain: {
                setValueAtTime: jest.fn(),
                exponentialRampToValueAtTime: jest.fn(),
            }
        };
    }

    resume() {
        this.state = 'running';
        return Promise.resolve();
    }

    close() {
        return Promise.resolve();
    }
}

(window as any).AudioContext = AudioContextMock;

describe('useRhythmEngine', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('should initialize correctly', () => {
        const mockFinish = jest.fn();
        const { result } = renderHook(() => useRhythmEngine({ bpm: 60, expectedBeats: 4, onFinish: mockFinish }));

        expect(result.current.isPlaying).toBe(false);
        expect(result.current.taps).toEqual([]);
    });

    it('should start and record taps', () => {
        const mockFinish = jest.fn();
        const { result } = renderHook(() => useRhythmEngine({ bpm: 60, expectedBeats: 4, onFinish: mockFinish }));

        act(() => {
            result.current.startEngine();
        });

        expect(result.current.isPlaying).toBe(true);

        // Fast forward 4 intro beats (4 * 1000ms) + 500ms into the exercise time
        act(() => {
            jest.advanceTimersByTime(4500);
            // AudioContext mock inner timing isn't fully mocked here, but we just want 
            // to ensure state doesn't crash on standard interaction.
            result.current.recordTap();
        });

        // Should have 1 tap
        expect(result.current.taps.length).toBe(1);
    });
});
