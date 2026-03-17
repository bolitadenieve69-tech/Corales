'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Music, Loader2, FileMusic, ArrowLeft, X, Check, Info, AlertCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_URL, fetchApi, getAuthToken } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useUIStore } from '@/store/uiStore';

const VOICES = [
    { id: 'MIDI_SOPRANO', label: 'Soprano', icon: '🎤', color: 'var(--color-voice-soprano)', patterns: ['soprano', 'sop', 's.mid', 's_'] },
    { id: 'MIDI_ALTO', label: 'Alto', icon: '🎤', color: 'var(--color-voice-alto)', patterns: ['alto', 'alt', 'a.mid', 'a_'] },
    { id: 'MIDI_TENOR', label: 'Tenor', icon: '🎤', color: 'var(--color-voice-tenor)', patterns: ['tenor', 'ten', 't.mid', 't_'] },
    { id: 'MIDI_BASS', label: 'Bajo', icon: '🎤', color: 'var(--color-voice-bajo)', patterns: ['bajo', 'bass', 'baj', 'b.mid', 'b_', 'bass.mid'] },
];

export default function UploadPrivateWorkPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [composer, setComposer] = useState('');
    const [era, setEra] = useState('Renacimiento');
    const [voiceFormat, setVoiceFormat] = useState('SATB');
    const [primaryFile, setPrimaryFile] = useState<File | null>(null);
    const [studyFiles, setStudyFiles] = useState<{ file: File, role: string }[]>([]);
    const [choirs, setChoirs] = useState<any[]>([]);
    const [selectedChoirId, setSelectedChoirId] = useState('');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [rightsConfirmed, setRightsConfirmed] = useState(false);

    useEffect(() => {
        const loadChoirs = async () => {
            try {
                const data = await fetchApi('/choirs/');
                setChoirs(data);
                if (data.length > 0) setSelectedChoirId(data[0].id);
            } catch (err) {
                console.error("Failed to load choirs", err);
            }
        };
        loadChoirs();
    }, []);

    const detectRole = (filename: string): string => {
        const lower = filename.toLowerCase();
        if (lower.endsWith('.pdf')) return 'PDF';
        for (const voice of VOICES) {
            if (voice.patterns.some(p => lower.includes(p))) return voice.id;
        }
        return 'UNKNOWN';
    };

    const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);
        if (selected.length === 0) return;

        // The first file that looks like a score is primary.
        const pdfOrXml = selected.find(f => f.name.toLowerCase().endsWith('.pdf') || f.name.toLowerCase().endsWith('.xml') || f.name.toLowerCase().endsWith('.musicxml') || f.name.toLowerCase().endsWith('.mxl'));
        
        if (pdfOrXml && !primaryFile) {
            setPrimaryFile(pdfOrXml);
            const rest = selected.filter(f => f !== pdfOrXml);
            addStudyFiles(rest);
        } else if (!primaryFile) {
            setPrimaryFile(selected[0]);
            addStudyFiles(selected.slice(1));
        } else {
            addStudyFiles(selected);
        }
    };

    const addStudyFiles = (files: File[]) => {
        const newStudyFiles = files.map(f => ({
            file: f,
            role: detectRole(f.name)
        }));
        setStudyFiles(prev => [...prev, ...newStudyFiles]);
    };

    const removeStudyFile = (index: number) => {
        setStudyFiles(prev => prev.filter((_, i) => i !== index));
    };

    const updateFileRole = (index: number, role: string) => {
        setStudyFiles(prev => prev.map((item, i) => i === index ? { ...item, role } : item));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !primaryFile || !selectedChoirId || !rightsConfirmed) {
            setError('Por favor, completa todos los campos obligatorios y confirma los derechos.');
            return;
        }

        setUploading(true);
        setProgress(5);
        setError(null);

        try {
            // 1. Create Work record
            const work = await fetchApi('/works/', {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    composer,
                    era,
                    voice_format: voiceFormat,
                    choir_id: selectedChoirId
                })
            });

            setProgress(20);

            const edition = work.editions?.[0];
            if (!edition) throw new Error('No se pudo encontrar la edición de la obra');

            // 2. Upload Primary File
            const primaryFormData = new FormData();
            primaryFormData.append('file', primaryFile);
            primaryFormData.append('edition_id', edition.id);
            
            let primaryType = 'PDF';
            const ext = primaryFile.name.toLowerCase();
            if (ext.endsWith('.xml') || ext.endsWith('.musicxml') || ext.endsWith('.mxl')) {
                primaryType = 'MUSICXML';
            } else if (ext.endsWith('.mid') || ext.endsWith('.midi')) {
                primaryType = 'MIDI';
            }
            
            primaryFormData.append('asset_type', primaryType);
            primaryFormData.append('rights_confirmed', 'true');

            await fetch(`${API_URL}/assets${primaryType === 'MUSICXML' ? '/upload-musicxml' : '/upload'}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getAuthToken()}` },
                body: primaryFormData,
            });

            setProgress(40);

            // 3. Sequential Upload of Study Files
            let currentStep = 40;
            const stepInc = studyFiles.length > 0 ? 55 / studyFiles.length : 0;

            for (const item of studyFiles) {
                if (item.role === 'UNKNOWN') continue;

                const formData = new FormData();
                formData.append('file', item.file);
                formData.append('edition_id', edition.id);
                formData.append('asset_type', item.role);
                formData.append('rights_confirmed', 'true');

                await fetch(`${API_URL}/assets/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
                    body: formData,
                });
                
                currentStep += stepInc;
                setProgress(Math.floor(currentStep));
            }

            setProgress(100);
            useUIStore.getState().addToast('Obra publicada con éxito', 'success');
            
            setTimeout(() => {
                router.push(`/library/${work.id}`);
            }, 1000);

        } catch (err: any) {
            console.error('Upload failed:', err);
            setError(err.message || 'Error al subir la obra. Por favor, inténtalo de nuevo.');
            setUploading(false);
        }
    };

    const isMusicXML = primaryFile?.name.toLowerCase().endsWith('.xml') || primaryFile?.name.toLowerCase().endsWith('.musicxml') || primaryFile?.name.toLowerCase().endsWith('.mxl');

    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-8 animate-in fade-in duration-500">
            <header className="space-y-4">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-xs font-black uppercase tracking-[0.2em]"
                >
                    <ArrowLeft size={16} /> Volver a Biblioteca
                </button>
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
                        Publicar Nueva Obra
                    </h1>
                    <p className="text-primary-100/60 text-lg max-w-2xl">
                        Añade partituras y MIDIs de estudio. El sistema detectará automáticamente las voces para ahorrarte tiempo.
                    </p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Metadata Section */}
                <section className="bg-primary-800 border border-white/10 rounded-[2.5rem] p-8 md:p-10 space-y-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                    
                    <div className="flex items-center gap-4 text-accent-500 font-bold uppercase tracking-widest text-xs">
                        <div className="w-8 h-8 rounded-full bg-accent-500/10 flex items-center justify-center border border-accent-500/20">1</div>
                        Información de la Obra
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500 ml-1">Título *</label>
                            <input 
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Ej: O Magnum Mysterium"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-neutral-700 focus:outline-none focus:border-accent-500/50 transition-all font-medium"
                                required
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500 ml-1">Compositor *</label>
                            <input 
                                type="text"
                                value={composer}
                                onChange={e => setComposer(e.target.value)}
                                placeholder="Ej: Tomás Luis de Victoria"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-neutral-700 focus:outline-none focus:border-accent-500/50 transition-all font-medium"
                                required
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500 ml-1">Época / Estilo</label>
                            <select 
                                value={era}
                                onChange={e => setEra(e.target.value)}
                                aria-label="Época"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent-500 transition-all font-medium appearance-none"
                            >
                                {['Renacimiento', 'Barroco', 'Clasicismo', 'Romanticismo', 'Contemporáneo', 'Popular'].map(e => (
                                    <option key={e} value={e} className="bg-primary-900">{e}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500 ml-1">Formato Vocal</label>
                            <input 
                                type="text"
                                value={voiceFormat}
                                onChange={e => setVoiceFormat(e.target.value)}
                                placeholder="Ej: SATB"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent-500 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-3 md:col-span-2">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500 ml-1">Coro Propietario *</label>
                            <select 
                                value={selectedChoirId}
                                aria-label="Coro"
                                onChange={e => setSelectedChoirId(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent-500 transition-all font-medium appearance-none"
                                required
                            >
                                {choirs.map(c => (
                                    <option key={c.id} value={c.id} className="bg-primary-900">{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                {/* 2. Files Section */}
                <section className="bg-primary-800 border border-white/10 rounded-[2.5rem] p-8 md:p-10 space-y-8 shadow-2xl">
                    <div className="flex items-center gap-4 text-accent-500 font-bold uppercase tracking-widest text-xs">
                        <div className="w-8 h-8 rounded-full bg-accent-500/10 flex items-center justify-center border border-accent-500/20">2</div>
                        Archivos y Material de Estudio
                    </div>

                    <div className="space-y-6">
                        {!primaryFile ? (
                            <label className="flex flex-col items-center justify-center w-full min-h-[220px] border-2 border-dashed border-white/10 hover:border-accent-500/50 rounded-[2rem] bg-black/20 cursor-pointer transition-all group p-10 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-xl">
                                    <Upload className="text-accent-500" size={32} />
                                </div>
                                <p className="text-xl font-bold text-white mb-2">Selecciona tus archivos</p>
                                <p className="text-sm text-neutral-500 max-w-sm leading-relaxed">
                                    Sube la **partitura (PDF/MusicXML)** y los **MIDIs** de estudio. Puedes seleccionarlos todos de una vez.
                                </p>
                                <input 
                                    type="file" 
                                    multiple
                                    onChange={handleFileSelection}
                                    className="hidden" 
                                    accept=".pdf,.xml,.musicxml,.mxl,.mid,.midi"
                                />
                            </label>
                        ) : (
                            <div className="space-y-6">
                                {/* Primary File Slot */}
                                <div className="bg-accent-500/5 border border-accent-500/20 rounded-2xl p-6 flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-xl bg-accent-500/10 flex items-center justify-center text-accent-500 shadow-lg shadow-accent-500/5">
                                        {isMusicXML ? <FileMusic size={28} /> : <Upload size={28} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-500/60 mb-1">Partitura Principal</p>
                                        <p className="font-bold text-lg text-white truncate">{primaryFile.name}</p>
                                        <p className="text-xs text-neutral-500">{(primaryFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setPrimaryFile(null)}
                                        className="p-3 hover:bg-red-500/10 rounded-xl text-neutral-600 hover:text-red-400 transition-colors"
                                        aria-label="Eliminar partitura"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {isMusicXML && (
                                    <div className="bg-primary-500/10 border border-primary-500/20 rounded-3xl p-6 flex gap-5 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-glow-primary">
                                            <Info size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-primary-300 text-sm uppercase tracking-widest">Análisis Inteligente</h4>
                                            <p className="text-sm text-neutral-400 leading-relaxed">
                                                Al subir un archivo MusicXML, nuestro sistema detectará automáticamente las cuerdas y **generará los audios de estudio** sin que tengas que subirlos manualmente.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Study Files Area */}
                                <div className="space-y-5 pt-4 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400">Material de Estudio (MIDIs)</h3>
                                        {!isMusicXML && (
                                            <label className="text-[11px] font-black uppercase tracking-widest text-accent-500 hover:text-white cursor-pointer flex items-center gap-2 transition-colors">
                                                <Plus size={14} /> Añadir archivos
                                                <input type="file" multiple className="hidden" accept=".mid,.midi" onChange={(e) => addStudyFiles(Array.from(e.target.files || []))} />
                                            </label>
                                        )}
                                    </div>

                                    {studyFiles.length === 0 ? (
                                        <div className="py-10 border-2 border-dashed border-white/5 rounded-3xl text-center">
                                            <p className="text-sm text-neutral-600 font-medium">No hay archivos de estudio seleccionados.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {studyFiles.map((item, idx) => (
                                                <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 group">
                                                    <div className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center text-sm shadow-inner">
                                                        {item.role === 'UNKNOWN' ? '❓' : VOICES.find(v => v.id === item.role)?.icon || '🎤'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[10px] font-bold text-neutral-500 truncate mb-1">{item.file.name}</p>
                                                        <select 
                                                            value={item.role}
                                                            aria-label={`Asignar voz a ${item.file.name}`}
                                                            onChange={e => updateFileRole(idx, e.target.value)}
                                                            className="bg-transparent text-[11px] font-black uppercase tracking-widest focus:outline-none cursor-pointer hover:text-accent-500 transition-colors"
                                                            style={{ color: VOICES.find(v => v.id === item.role)?.color } as any}
                                                        >
                                                            <option value="UNKNOWN" className="bg-primary-900">Asignar cuerda...</option>
                                                            {VOICES.map(v => (
                                                                <option key={v.id} value={v.id} className="bg-primary-900">{v.label}</option>
                                                            ))}
                                                            <option value="MIDI" className="bg-primary-900">MIDI Tutti</option>
                                                        </select>
                                                    </div>
                                                    <button 
                                                        type="button"
                                                        onClick={() => removeStudyFile(idx)}
                                                        className="p-2 hover:bg-white/10 rounded-xl text-neutral-600 hover:text-red-400 transition-colors"
                                                        aria-label="Quitar archivo"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Rights declaration */}
                <label className="flex items-start gap-5 p-8 bg-white/5 border border-white/10 rounded-[2rem] cursor-pointer hover:bg-white/10 transition-all group">
                    <div className="mt-1">
                        <input 
                            type="checkbox" 
                            checked={rightsConfirmed}
                            onChange={e => setRightsConfirmed(e.target.checked)}
                            className="w-6 h-6 rounded-lg border-white/20 bg-primary-900 text-accent-500 focus:ring-accent-500 focus:ring-offset-0 transition-all cursor-pointer"
                        />
                    </div>
                    <div className="space-y-2">
                        <p className="text-base font-bold text-white group-hover:text-accent-500 transition-colors">Declaración de Responsabilidad</p>
                        <p className="text-sm text-neutral-500 leading-relaxed max-w-2xl">
                            Confirmo que tengo los derechos legales para distribuir este material o que forma parte del dominio público. Entiendo que esta obra se almacenará de forma privada exclusivamente para mi coro.
                        </p>
                    </div>
                </label>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }}
                        className="p-6 bg-red-500/10 border border-red-500/30 rounded-3xl flex items-center gap-4 text-red-400"
                    >
                        <AlertCircle size={28} />
                        <p className="text-sm font-bold leading-relaxed">{error}</p>
                    </motion.div>
                )}

                {/* Progress bar */}
                {uploading && (
                    <div className="space-y-4 px-2">
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.3em] text-primary-300">
                            <span className="animate-pulse">Sincronizando con la nube...</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-accent-500 to-primary-500 rounded-full shadow-[0_0_20px_rgba(240,165,0,0.4)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-5 pt-4">
                    <button
                        type="submit"
                        disabled={uploading || !rightsConfirmed || !primaryFile}
                        className="flex-[2] bg-accent-500 text-primary-900 h-20 rounded-3xl font-black uppercase tracking-[0.2em] text-sm hover:bg-accent-400 disabled:opacity-40 transition-all shadow-glow-accent flex items-center justify-center gap-4"
                    >
                        {uploading ? (
                            <><Loader2 className="animate-spin" size={24} /> Procesando...</>
                        ) : (
                            <><Check size={24} /> Publicar en Biblioteca</>
                        )}
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 border border-white/10 text-white h-20 rounded-3xl font-black uppercase tracking-[0.2em] text-sm hover:bg-white/5 transition-all"
                    >
                        Cancelar
                    </button>
                </div>
            </form>

            <footer className="mt-16 text-center">
                <p className="text-[11px] text-neutral-600 font-black uppercase tracking-[0.4em]">Propiedad Intelectual CoralApp © 2026</p>
            </footer>
        </div>
    );
}
