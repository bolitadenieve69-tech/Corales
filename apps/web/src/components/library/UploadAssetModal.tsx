"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, Upload, Loader2, Check } from 'lucide-react';
import { API_URL, getAuthToken } from '@/lib/api';

const ASSET_TYPES = [
    { id: 'SCORE_PDF',    label: 'Partitura PDF', icon: '📄', color: '#F0A500' },
    { id: 'MIDI_SOPRANO', label: 'MIDI Soprano',  icon: '🎤', color: 'var(--color-voice-soprano)' },
    { id: 'MIDI_ALTO',    label: 'MIDI Alto',     icon: '🎤', color: 'var(--color-voice-alto)' },
    { id: 'MIDI_TENOR',   label: 'MIDI Tenor',    icon: '🎤', color: 'var(--color-voice-tenor)' },
    { id: 'MIDI_BASS',    label: 'MIDI Bajo',     icon: '🎤', color: 'var(--color-voice-bajo)' },
    { id: 'MIDI',         label: 'MIDI Tutti',    icon: '🎹', color: '#6DAAD9' },
];

function detectType(filename: string): string {
    const l = filename.toLowerCase();
    if (l.endsWith('.pdf')) return 'SCORE_PDF';
    if (l.includes('soprano') || l.includes('sopran') || l.includes('sop')) return 'MIDI_SOPRANO';
    if (l.includes('alto') || l.includes('alt')) return 'MIDI_ALTO';
    if (l.includes('tenor') || l.includes('ten')) return 'MIDI_TENOR';
    if (l.includes('bass') || l.includes('bajo') || l.includes('basso') || l.includes('baj')) return 'MIDI_BASS';
    // Generic MIDI — default to soprano so the selector is visibly set
    if (l.endsWith('.mid') || l.endsWith('.midi')) return 'MIDI_SOPRANO';
    return 'SCORE_PDF';
}

interface FileEntry {
    id: number;
    file: File;
    assetType: string;
    status: 'idle' | 'uploading' | 'done' | 'error';
    error?: string;
}

interface UploadAssetModalProps {
    editionId: string;
    workTitle: string;
    onClose: () => void;
    onSuccess: () => void;
}

let _nextId = 0;

async function uploadEntry(editionId: string, entry: FileEntry): Promise<void> {
    const token = getAuthToken();
    const form = new FormData();
    form.append('file', entry.file);
    form.append('edition_id', editionId);
    form.append('asset_type', entry.assetType);
    form.append('rights_confirmed', 'true');
    const res = await fetch(`${API_URL}/assets/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Error ${res.status}`);
    }
}

export function UploadAssetModal({ editionId, workTitle, onClose, onSuccess }: UploadAssetModalProps) {
    const [entries, setEntries] = useState<FileEntry[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    // Focus trap + Escape key handler
    useEffect(() => {
        const previousFocus = document.activeElement as HTMLElement | null;
        closeButtonRef.current?.focus();

        const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { onClose(); return; }
            if (e.key !== 'Tab' || !dialogRef.current) return;
            const nodes = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
            if (nodes.length === 0) return;
            const first = nodes[0];
            const last = nodes[nodes.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            previousFocus?.focus();
        };
    }, [onClose]);

    const addFiles = useCallback((files: FileList | File[]) => {
        const newEntries: FileEntry[] = Array.from(files).map(f => ({
            id: ++_nextId,
            file: f,
            assetType: detectType(f.name),
            status: 'idle' as const,
        }));
        setEntries(prev => [...prev, ...newEntries]);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        addFiles(e.dataTransfer.files);
    }, [addFiles]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        // Only clear when leaving the zone entirely, not when hovering child elements
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragging(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) addFiles(e.target.files);
        e.target.value = '';
    };

    const updateType = (id: number, assetType: string) => {
        setEntries(prev => prev.map(e => e.id === id ? { ...e, assetType } : e));
    };

    const removeEntry = (id: number) => {
        setEntries(prev => prev.filter(e => e.id !== id));
    };

    const handleUpload = async () => {
        const idleEntries = entries.filter(e => e.status === 'idle');
        if (!idleEntries.length) return;

        setUploading(true);

        await Promise.all(
            entries.map(async (entry) => {
                if (entry.status !== 'idle') return;
                setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: 'uploading' } : e));
                try {
                    await uploadEntry(editionId, entry);
                    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: 'done' } : e));
                } catch (err: any) {
                    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: 'error', error: err.message } : e));
                }
            })
        );

        setUploading(false);
        onSuccess();
    };

    const getConfig = (id: string) => ASSET_TYPES.find(t => t.id === id) ?? ASSET_TYPES[1];

    const idleCount = entries.filter(e => e.status === 'idle').length;
    const doneCount = entries.filter(e => e.status === 'done').length;
    const allDone = entries.length > 0 && entries.every(e => e.status === 'done' || e.status === 'error') && doneCount > 0;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose}
            aria-hidden="true"
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="upload-modal-title"
                className="bg-primary-800 rounded-3xl w-full max-w-lg border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/5 bg-black/20 shrink-0">
                    <div>
                        <h2 id="upload-modal-title" className="text-lg font-bold text-white">Gestionar Archivos</h2>
                        <p className="text-xs text-neutral-400 mt-0.5 truncate max-w-xs">{workTitle}</p>
                    </div>
                    <button
                        ref={closeButtonRef}
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="p-2 hover:bg-white/10 rounded-xl text-neutral-400 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 flex-1 overflow-y-auto space-y-4">
                    {/* Drop zone */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => inputRef.current?.click()}
                        className={`flex flex-col items-center justify-center gap-3 py-8 px-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all select-none ${
                            isDragging
                                ? 'border-accent-500 bg-accent-500/5 scale-[1.01]'
                                : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-black/30'
                        }`}
                    >
                        <Upload size={28} className={isDragging ? 'text-accent-500' : 'text-neutral-500'} />
                        <div className="text-center">
                            <p className="text-sm font-semibold text-white">
                                {isDragging ? 'Suelta los archivos aquí' : 'Arrastra o haz clic para seleccionar'}
                            </p>
                            <p className="text-xs text-neutral-500 mt-1">
                                Partitura PDF + MIDIs de voz (Soprano · Alto · Tenor · Bajo)
                            </p>
                        </div>
                        <input
                            ref={inputRef}
                            type="file"
                            multiple
                            className="hidden"
                            accept=".pdf,.mid,.midi"
                            onChange={handleChange}
                        />
                    </div>

                    {/* File list */}
                    {entries.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 px-1">
                                {entries.length} {entries.length === 1 ? 'archivo' : 'archivos'} seleccionados
                            </p>
                            {entries.map(entry => {
                                const cfg = getConfig(entry.assetType);
                                const isIdle = entry.status === 'idle';
                                return (
                                    <div
                                        key={entry.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                            entry.status === 'done'      ? 'bg-green-500/10 border-green-500/30' :
                                            entry.status === 'error'     ? 'bg-red-500/10 border-red-500/30' :
                                            entry.status === 'uploading' ? 'bg-white/5 border-accent-500/30' :
                                                                           'bg-white/5 border-white/5'
                                        }`}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm"
                                            style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}
                                        >
                                            {entry.status === 'done'      ? <Check size={16} /> :
                                             entry.status === 'uploading' ? <Loader2 size={16} className="animate-spin" /> :
                                             <span>{cfg.icon}</span>}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-neutral-400 truncate leading-tight">{entry.file.name}</p>
                                            {isIdle ? (
                                                <select
                                                    value={entry.assetType}
                                                    onChange={e => updateType(entry.id, e.target.value)}
                                                    className="mt-0.5 text-xs font-bold bg-transparent focus:outline-none cursor-pointer w-full"
                                                    style={{ color: cfg.color }}
                                                >
                                                    {ASSET_TYPES.map(t => (
                                                        <option key={t.id} value={t.id} className="bg-primary-900 text-white">
                                                            {t.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <p className="text-xs font-bold mt-0.5" style={{ color: cfg.color }}>{cfg.label}</p>
                                            )}
                                            {entry.error && <p className="text-xs text-red-400 mt-0.5">{entry.error}</p>}
                                        </div>

                                        {isIdle && (
                                            <button
                                                onClick={() => removeEntry(entry.id)}
                                                aria-label="Quitar archivo"
                                                className="p-1.5 hover:bg-white/10 rounded-lg text-neutral-600 hover:text-red-400 transition-colors shrink-0"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-white/5 bg-black/20 shrink-0">
                    {allDone ? (
                        <button
                            onClick={onClose}
                            className="w-full px-6 py-3 rounded-xl font-bold bg-green-500 text-white text-sm flex items-center justify-center gap-2"
                        >
                            <Check size={18} />
                            {doneCount === 1 ? '1 archivo subido' : `${doneCount} archivos subidos`} — Cerrar
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                disabled={uploading}
                                className="flex-1 px-4 py-2.5 rounded-xl font-bold bg-white/5 text-white hover:bg-white/10 transition-colors text-sm disabled:opacity-40"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={uploading || idleCount === 0}
                                className="flex-[2] px-6 py-2.5 rounded-xl font-bold bg-accent-500 text-primary-900 hover:bg-accent-400 shadow-glow-accent transition-all flex items-center justify-center gap-2 disabled:opacity-40 text-sm"
                            >
                                {uploading
                                    ? <><Loader2 size={16} className="animate-spin" /> Subiendo {doneCount}/{entries.filter(e => e.status !== 'error').length}...</>
                                    : <><Upload size={16} /> Subir {idleCount} {idleCount === 1 ? 'archivo' : 'archivos'}</>
                                }
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
