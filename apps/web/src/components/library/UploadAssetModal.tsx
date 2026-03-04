"use client";

import React, { useState, useRef } from 'react';
import { X, Upload, Loader2, Music, FileText, Check } from 'lucide-react';
import { API_URL, getAuthToken } from '@/lib/api';

const ASSET_TYPES = [
    { id: 'MIDI_SOPRANO', label: 'MIDI Soprano', icon: '🎤', color: 'var(--color-voice-soprano)', group: 'midi' },
    { id: 'MIDI_ALTO', label: 'MIDI Alto', icon: '🎤', color: 'var(--color-voice-alto)', group: 'midi' },
    { id: 'MIDI_TENOR', label: 'MIDI Tenor', icon: '🎤', color: 'var(--color-voice-tenor)', group: 'midi' },
    { id: 'MIDI_BASS', label: 'MIDI Bajo', icon: '🎤', color: 'var(--color-voice-bajo)', group: 'midi' },
    { id: 'MIDI', label: 'MIDI Completo (tutti)', icon: '🎹', color: '#6DAAD9', group: 'midi' },
    { id: 'PDF', label: 'Partitura PDF', icon: '📄', color: '#F0A500', group: 'pdf' },
    { id: 'AUDIO_TUTTI', label: 'Audio Tutti', icon: '🔊', color: '#27AE60', group: 'audio' },
    { id: 'AUDIO_SOPRANO', label: 'Audio Soprano', icon: '🔊', color: 'var(--color-voice-soprano)', group: 'audio' },
    { id: 'AUDIO_ALTO', label: 'Audio Alto', icon: '🔊', color: 'var(--color-voice-alto)', group: 'audio' },
    { id: 'AUDIO_TENOR', label: 'Audio Tenor', icon: '🔊', color: 'var(--color-voice-tenor)', group: 'audio' },
    { id: 'AUDIO_BASS', label: 'Audio Bajo', icon: '🔊', color: 'var(--color-voice-bajo)', group: 'audio' },
];

interface UploadAssetModalProps {
    editionId: string;
    workTitle: string;
    onClose: () => void;
    onSuccess: () => void;
}

interface FileSlot {
    assetType: string;
    file: File | null;
    status: 'idle' | 'uploading' | 'done' | 'error';
    error?: string;
}

export function UploadAssetModal({ editionId, workTitle, onClose, onSuccess }: UploadAssetModalProps) {
    const [slots, setSlots] = useState<FileSlot[]>([
        { assetType: 'MIDI_SOPRANO', file: null, status: 'idle' },
        { assetType: 'MIDI_ALTO', file: null, status: 'idle' },
        { assetType: 'MIDI_TENOR', file: null, status: 'idle' },
        { assetType: 'MIDI_BASS', file: null, status: 'idle' },
    ]);
    const [uploading, setUploading] = useState(false);
    const [additionalFiles, setAdditionalFiles] = useState<FileSlot[]>([]);
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleFileSelect = (index: number, file: File | null, isAdditional = false) => {
        if (isAdditional) {
            setAdditionalFiles(prev => prev.map((s, i) => i === index ? { ...s, file } : s));
        } else {
            setSlots(prev => prev.map((s, i) => i === index ? { ...s, file } : s));
        }
    };

    const addAdditionalSlot = (assetType: string) => {
        setAdditionalFiles(prev => [...prev, { assetType, file: null, status: 'idle' }]);
    };

    const uploadSingleFile = async (slot: FileSlot): Promise<boolean> => {
        if (!slot.file) return true; // skip empty slots

        const token = getAuthToken();
        const formData = new FormData();
        formData.append('file', slot.file);
        formData.append('edition_id', editionId);
        formData.append('asset_type', slot.assetType);
        formData.append('rights_confirmed', 'true');

        const resp = await fetch(`${API_URL}/assets/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({ detail: 'Error desconocido' }));
            throw new Error(err.detail || `Error ${resp.status}`);
        }
        return true;
    };

    const handleUploadAll = async () => {
        const allSlots = [...slots, ...additionalFiles];
        const filledSlots = allSlots.filter(s => s.file);
        if (filledSlots.length === 0) return;

        setUploading(true);

        // Upload each file sequentially
        for (let i = 0; i < slots.length; i++) {
            if (!slots[i].file) continue;
            setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'uploading' } : s));
            try {
                await uploadSingleFile(slots[i]);
                setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'done' } : s));
            } catch (e: any) {
                setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'error', error: e.message } : s));
            }
        }

        for (let i = 0; i < additionalFiles.length; i++) {
            if (!additionalFiles[i].file) continue;
            setAdditionalFiles(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'uploading' } : s));
            try {
                await uploadSingleFile(additionalFiles[i]);
                setAdditionalFiles(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'done' } : s));
            } catch (e: any) {
                setAdditionalFiles(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'error', error: e.message } : s));
            }
        }

        setUploading(false);
        // Notify parent to refetch
        onSuccess();
    };

    const totalFiles = [...slots, ...additionalFiles].filter(s => s.file).length;
    const doneFiles = [...slots, ...additionalFiles].filter(s => s.status === 'done').length;
    const allDone = totalFiles > 0 && doneFiles === totalFiles;

    const getTypeConfig = (assetType: string) => ASSET_TYPES.find(t => t.id === assetType) || ASSET_TYPES[0];

    const renderSlot = (slot: FileSlot, index: number, isAdditional: boolean) => {
        const config = getTypeConfig(slot.assetType);
        return (
            <div
                key={`${isAdditional ? 'add' : 'main'}-${index}`}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${slot.status === 'done' ? 'bg-green-500/10 border-green-500/30' :
                        slot.status === 'error' ? 'bg-red-500/10 border-red-500/30' :
                            slot.file ? 'bg-white/5 border-accent-500/30' :
                                'bg-black/20 border-white/5 hover:border-white/10'
                    }`}
            >
                {/* Voice color indicator */}
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                    style={{ backgroundColor: `${config.color}20`, color: config.color }}
                >
                    {slot.status === 'done' ? <Check size={16} /> :
                        slot.status === 'uploading' ? <Loader2 size={16} className="animate-spin" /> :
                            <span>{config.icon}</span>}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{config.label}</p>
                    {slot.file ? (
                        <p className="text-xs text-neutral-400 truncate">{slot.file.name}</p>
                    ) : (
                        <p className="text-xs text-neutral-600">Sin archivo seleccionado</p>
                    )}
                    {slot.error && <p className="text-xs text-red-400 mt-0.5">{slot.error}</p>}
                </div>

                {/* File picker */}
                {slot.status !== 'done' && slot.status !== 'uploading' && (
                    <label className="cursor-pointer px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold text-neutral-300 transition-colors border border-white/5">
                        {slot.file ? 'Cambiar' : 'Elegir'}
                        <input
                            type="file"
                            className="hidden"
                            accept={config.group === 'midi' ? '.mid,.midi' : config.group === 'pdf' ? '.pdf' : '.mp3,.wav,.ogg,.m4a'}
                            onChange={(e) => handleFileSelect(index, e.target.files?.[0] || null, isAdditional)}
                        />
                    </label>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="bg-primary-800 rounded-3xl w-full max-w-lg border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/5 bg-black/20 shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-white">Subir Archivos</h2>
                        <p className="text-xs text-neutral-400 mt-0.5 truncate max-w-sm">{workTitle}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-neutral-400 transition-colors" aria-label="Cerrar">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 overflow-y-auto flex-1 space-y-4">
                    {/* MIDI SATB slots */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-3 flex items-center gap-2">
                            <Music size={14} /> MIDIs por Voz (SATB)
                        </h3>
                        <div className="space-y-2">
                            {slots.map((slot, i) => renderSlot(slot, i, false))}
                        </div>
                    </div>

                    {/* Additional files */}
                    {additionalFiles.length > 0 && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-3">Archivos Adicionales</h3>
                            <div className="space-y-2">
                                {additionalFiles.map((slot, i) => renderSlot(slot, i, true))}
                            </div>
                        </div>
                    )}

                    {/* Add more buttons */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        <button
                            onClick={() => addAdditionalSlot('MIDI')}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-neutral-400 transition-colors border border-white/5"
                        >
                            + MIDI Tutti
                        </button>
                        <button
                            onClick={() => addAdditionalSlot('PDF')}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-neutral-400 transition-colors border border-white/5"
                        >
                            + Partitura PDF
                        </button>
                        <button
                            onClick={() => addAdditionalSlot('AUDIO_TUTTI')}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-neutral-400 transition-colors border border-white/5"
                        >
                            + Audio
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-white/5 bg-black/20 flex gap-3 shrink-0">
                    {allDone ? (
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl font-bold bg-green-500 text-white text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <Check size={18} /> ¡Archivos subidos!
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-white/5 text-white hover:bg-white/10 transition-colors text-sm"
                                disabled={uploading}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUploadAll}
                                disabled={uploading || totalFiles === 0}
                                className="flex-[2] px-6 py-2.5 rounded-xl font-bold bg-accent-500 text-primary-900 hover:bg-accent-400 shadow-glow-accent transition-all flex items-center justify-center gap-2 disabled:opacity-40 text-sm"
                            >
                                {uploading ? (
                                    <><Loader2 size={16} className="animate-spin" /> Subiendo {doneFiles}/{totalFiles}...</>
                                ) : (
                                    <><Upload size={16} /> Subir {totalFiles} {totalFiles === 1 ? 'archivo' : 'archivos'}</>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
