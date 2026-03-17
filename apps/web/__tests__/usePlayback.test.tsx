import { renderHook, act } from '@testing-library/react';
import { usePlayback } from '../src/hooks/usePlayback';
import * as Tone from 'tone';

// Mock Tone.js
jest.mock('tone', () => ({
  start: jest.fn().mockResolvedValue(true),
  getContext: jest.fn(() => ({ state: 'suspended' })),
  getTransport: jest.fn(() => ({
    start: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
    bpm: { value: 120 }
  })),
  Player: jest.fn().mockImplementation(() => ({
    toDestination: jest.fn().mockReturnThis(),
    volume: { value: 0 },
    mute: false,
    loop: true,
    start: jest.fn(),
    stop: jest.fn()
  })),
  gainToDb: jest.fn((val) => val),
}));

describe('usePlayback', () => {
  const mockWorkId = 'test-work-123';
  const mockAssets = [
    { id: 'a1', asset_type: 'AUDIO_SOPRANO' },
    { id: 'a2', asset_type: 'AUDIO_ALTO' }
  ];

  it('debe inicializar con los volúmenes al 100%', () => {
    const { result } = renderHook(() => usePlayback({ workId: mockWorkId, assets: mockAssets }));
    
    expect(result.current.volumes.soprano).toBe(100);
    expect(result.current.isMuted.soprano).toBe(false);
    expect(result.current.isPlaying).toBe(false);
  });

  it('debe alternar la reproducción', async () => {
    const { result } = renderHook(() => usePlayback({ workId: mockWorkId, assets: mockAssets }));
    
    await act(async () => {
      await result.current.togglePlay();
    });

    expect(result.current.isPlaying).toBe(true);
    expect(Tone.start).toHaveBeenCalled();
  });

  it('debe cambiar el volumen de una voz', () => {
    const { result } = renderHook(() => usePlayback({ workId: mockWorkId, assets: mockAssets }));
    
    act(() => {
      result.current.setVoiceVolume('soprano', 50);
    });

    expect(result.current.volumes.soprano).toBe(50);
  });

  it('debe activar el modo SOLO para una voz', () => {
    const { result } = renderHook(() => usePlayback({ workId: mockWorkId, assets: mockAssets }));
    
    act(() => {
      result.current.setSolo('alto');
    });

    expect(result.current.isMuted.soprano).toBe(true);
    expect(result.current.isMuted.alto).toBe(false);
    expect(result.current.isMuted.tenor).toBe(true);
    expect(result.current.isMuted.bajo).toBe(true);
  });
});
