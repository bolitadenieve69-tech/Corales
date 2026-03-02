"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, AlertTriangle, XCircle, RefreshCw, Sparkles } from 'lucide-react';

import { API_URL, fetchApi } from '@/lib/api';

interface PipelineStatusProps {
    assetId: string;
    editionId: string;
    onStatusChange?: (status: string) => void;
}

interface PipelineStatusData {
    processing_status: string;
    processing_error?: string;
    metadata?: {
        mapping?: Record<string, string>;
        parsed?: {
            parts?: Array<{ name: string }>;
            tempo?: number;
            key_signature?: string;
            time_signature?: string;
        };
    };
}

const VOICE_LABELS: Record<string, string> = {
    'S': 'Soprano',
    'A': 'Alto',
    'T': 'Tenor',
    'B': 'Bajo',
    'Other': 'Otro',
};

const STATUS_CONFIG: Record<string, {
    icon: any;
    color: string;
    bg: string;
    border: string;
    label: string;
    animating?: boolean;
}> = {
    'PENDING': {
        icon: Loader2,
        color: 'text-primary-300',
        bg: 'bg-primary-500/10',
        border: 'border-primary-500/20',
        label: 'En cola de procesado...',
        animating: true,
    },
    'RUNNING': {
        icon: Loader2,
        color: 'text-primary-300',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/20',
        label: 'Procesando MusicXML...',
        animating: true,
    },
    'OK': {
        icon: CheckCircle,
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        label: 'Procesado correctamente',
    },
    'NEEDS_MAPPING': {
        icon: AlertTriangle,
        color: 'text-accent-300',
        bg: 'bg-accent-500/10',
        border: 'border-amber-500/20',
        label: 'Asignación manual requerida',
    },
    'ERROR': {
        icon: XCircle,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        label: 'Error en el procesado',
    },
};

export default function PipelineStatus({ assetId, editionId, onStatusChange }: PipelineStatusProps) {
    const [status, setStatus] = useState<PipelineStatusData | null>(null);
    const [loading, setLoading] = useState(true);
    const [retrying, setRetrying] = useState(false);
    const [mappings, setMappings] = useState<Array<{ part_name: string; assigned_to: string }>>([]);
    const [savingMapping, setSavingMapping] = useState(false);

    const fetchStatus = async () => {
        try {
            const data = await fetchApi(`/pipeline/status/${assetId}`);
            if (data) {
                setStatus(data);
                onStatusChange?.(data.processing_status);

                // If NEEDS_MAPPING, pre-populate mapping form from metadata
                if (data.processing_status === 'NEEDS_MAPPING' && data.metadata?.parsed?.parts) {
                    setMappings(data.metadata.parsed.parts.map((p: any) => ({
                        part_name: p.name,
                        assigned_to: '', // User must pick
                    })));
                }
            }
        } catch (err) {
            console.error('Error fetching pipeline status', err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchStatus();
        // Poll while processing
        const interval = setInterval(() => {
            fetchStatus();
        }, 5000);
        return () => clearInterval(interval);
    }, [assetId]);

    // Stop polling when done
    useEffect(() => {
        if (status?.processing_status && !['PENDING', 'RUNNING'].includes(status.processing_status)) {
            // Status is final, no more polling needed
        }
    }, [status?.processing_status]);

    const handleRetry = async () => {
        setRetrying(true);
        try {
            await fetchApi(`/pipeline/retry/${assetId}`, {
                method: 'POST',
            });
            fetchStatus();
        } catch (err) {
            console.error('Error retrying', err);
        }
        setRetrying(false);
    };

    const handleSaveMapping = async () => {
        // Validate all parts have assignments
        if (mappings.some(m => !m.assigned_to)) {
            return;
        }
        setSavingMapping(true);
        try {
            await fetchApi(`/pipeline/mapping/${editionId}`, {
                method: 'POST',
                body: JSON.stringify({ mappings }),
            });
            setTimeout(fetchStatus, 1000);
        } catch (err) {
            console.error('Error saving mapping', err);
        }
        setSavingMapping(false);
    };

    if (loading) return null;
    if (!status) return null;

    const config = STATUS_CONFIG[status.processing_status] || STATUS_CONFIG['PENDING'];
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${config.bg} border ${config.border} rounded-xl p-4 space-y-4`}
        >
            {/* Status Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Icon
                        size={20}
                        className={`${config.color} ${config.animating ? 'animate-spin' : ''}`}
                    />
                    <div>
                        <p className={`font-medium ${config.color}`}>{config.label}</p>
                        {status.processing_error && (
                            <p className="text-xs text-red-400/70 mt-0.5">{status.processing_error}</p>
                        )}
                    </div>
                </div>

                {/* Retry button for ERROR status */}
                {status.processing_status === 'ERROR' && (
                    <button
                        onClick={handleRetry}
                        disabled={retrying}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={retrying ? 'animate-spin' : ''} />
                        Reintentar
                    </button>
                )}
            </div>

            {/* Parsing Results (when OK) */}
            {status.processing_status === 'OK' && status.metadata?.mapping && (
                <div className="space-y-2">
                    <p className="text-xs text-green-400/70 font-medium uppercase tracking-wider">Voces detectadas:</p>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(status.metadata.mapping as Record<string, string>).map(([part, voice]) => (
                            <span
                                key={part}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-lg text-sm"
                            >
                                <span className="text-green-300 font-medium">{VOICE_LABELS[voice] || voice}</span>
                                <span className="text-green-400/50">←</span>
                                <span className="text-green-400/70">{part}</span>
                            </span>
                        ))}
                    </div>
                    {status.metadata?.parsed && (
                        <div className="flex gap-4 text-xs text-green-400/60 mt-1">
                            {status.metadata.parsed.tempo && <span>♩ = {status.metadata.parsed.tempo}</span>}
                            {status.metadata.parsed.key_signature && <span>Tonalidad: {status.metadata.parsed.key_signature}</span>}
                            {status.metadata.parsed.time_signature && <span>Compás: {status.metadata.parsed.time_signature}</span>}
                        </div>
                    )}
                </div>
            )}

            {/* NEEDS_MAPPING: Manual mapping form */}
            {status.processing_status === 'NEEDS_MAPPING' && (
                <div className="space-y-3">
                    <p className="text-sm text-accent-300/80">
                        No se pudo auto-detectar la asignación de voces. Asigna cada parte manualmente:
                    </p>
                    <div className="space-y-2">
                        {mappings.map((mapping, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-sm text-amber-300 font-medium min-w-[120px]">{mapping.part_name}</span>
                                <span className="text-accent-300/50">→</span>
                                <select
                                    value={mapping.assigned_to}
                                    onChange={e => {
                                        const updated = [...mappings];
                                        updated[i].assigned_to = e.target.value;
                                        setMappings(updated);
                                    }}
                                    className="flex-1 px-3 py-1.5 bg-black/40 border border-amber-500/20 rounded-lg text-white text-sm focus:outline-none focus-visible:outline-2 focus-visible:outline-accent-500 focus-visible:outline-offset-2 focus:ring-2 focus:ring-amber-500/50"
                                >
                                    <option value="">Seleccionar voz...</option>
                                    <option value="S">Soprano</option>
                                    <option value="A">Alto</option>
                                    <option value="T">Tenor</option>
                                    <option value="B">Bajo</option>
                                    <option value="Other">Otro</option>
                                </select>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleSaveMapping}
                        disabled={savingMapping || mappings.some(m => !m.assigned_to)}
                        className="flex items-center gap-2 px-4 py-2 bg-accent-500/20 text-amber-300 rounded-lg text-sm font-medium hover:bg-accent-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {savingMapping ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        {savingMapping ? 'Guardando...' : 'Guardar y Reprocesar'}
                    </button>
                </div>
            )}
        </motion.div>
    );
}
