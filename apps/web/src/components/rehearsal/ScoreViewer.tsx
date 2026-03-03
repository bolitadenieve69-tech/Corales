'use client';

import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { Loader2, AlertCircle, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ScoreViewerProps {
    xmlUrl: string;
    onLoad?: () => void;
    onError?: (error: string) => void;
}

export function ScoreViewer({ xmlUrl, onLoad, onError }: ScoreViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1.0);

    const handleZoom = (delta: number) => {
        const newZoom = Math.min(Math.max(zoom + delta, 0.5), 3.0);
        setZoom(newZoom);
        if (osmdRef.current) {
            osmdRef.current.zoom = newZoom;
            osmdRef.current.render();
        }
    };

    useEffect(() => {
        if (!containerRef.current) return;

        const initOSMD = async () => {
            setLoading(true);
            setError(null);

            try {
                if (!osmdRef.current) {
                    osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
                        autoResize: true,
                        drawTitle: false,
                        drawSubtitle: false,
                        drawComposer: false,
                        drawLyricist: false,
                        drawCredits: false,
                        drawPartNames: true,
                        renderBackend: 'svg',
                        coloringMode: 1, // 1 = Simple coloring
                        defaultColorMusic: '#0D1B2A',
                    });
                }

                await osmdRef.current.load(xmlUrl);
                osmdRef.current.zoom = zoom;
                osmdRef.current.render();
                setLoading(false);
                if (onLoad) onLoad();
            } catch (err) {
                console.error('OSMD Error:', err);
                setError('No se pudo renderizar la partitura MusicXML.');
                setLoading(false);
                if (onError) onError('Failed to load score');
            }
        };

        initOSMD();
    }, [xmlUrl, onLoad, onError]);

    return (
        <div className="w-full h-full flex flex-col items-center bg-white rounded-[2.5rem] shadow-lg relative overflow-hidden min-h-[600px] border border-white/10">
            {/* Toolbar */}
            <div className="absolute top-6 right-6 z-30 flex gap-2">
                <div className="flex bg-primary-900/40 backdrop-blur-md rounded-xl border border-white/10 p-1 shadow-xl">
                    <button
                        onClick={() => handleZoom(-0.1)}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all focus-ring"
                        aria-label="Alejar"
                    >
                        <ZoomOut size={18} />
                    </button>
                    <div className="px-2 flex items-center text-[10px] font-black text-white/40 tracking-widest border-x border-white/5">
                        {Math.round(zoom * 100)}%
                    </div>
                    <button
                        onClick={() => handleZoom(0.1)}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all focus-ring"
                        aria-label="Acercar"
                    >
                        <ZoomIn size={18} />
                    </button>
                </div>
            </div>

            {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary-900/5 backdrop-blur-sm z-20">
                    <Loader2 className="animate-spin text-primary-500 mb-2" size={32} />
                    <p className="text-xs font-black uppercase tracking-widest text-primary-900/40">Cargando Partitura...</p>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 text-red-600 p-8 text-center z-20">
                    <AlertCircle size={48} className="mb-4 opacity-30" />
                    <h4 className="font-bold text-lg mb-1 font-display">Error de Renderizado</h4>
                    <p className="text-xs font-medium opacity-70">{error}</p>
                </div>
            )}

            <div className="w-full h-full overflow-auto scrollbar-hide py-12">
                <div ref={containerRef} className="mx-auto" />
            </div>
        </div>
    );
}
