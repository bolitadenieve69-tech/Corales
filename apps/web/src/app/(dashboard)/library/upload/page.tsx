'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Music, Loader2, FileMusic, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_URL, fetchApi } from '@/lib/api';

export default function UploadPrivateWorkPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [assetType, setAssetType] = useState('musicxml');

    const [title, setTitle] = useState('');
    const [composer, setComposer] = useState('');
    const [era, setEra] = useState('');
    const [voiceFormat, setVoiceFormat] = useState('SATB');
    const [rightsConfirmed, setRightsConfirmed] = useState(false);

    const isMusicXML = assetType === 'musicxml';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title || !composer || !rightsConfirmed) {
            setError('Por favor rellena todos los campos obligatorios y acepta los términos.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. Create Work
            const work = await fetchApi('/works/', {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    composer,
                    era,
                    voice_format: voiceFormat,
                    genre: 'Coral',
                    difficulty: 'Media',
                    accompaniment: 'A Capella'
                })
            });

            if (!work || !work.id) throw new Error('Error al crear la obra');

            // 2. Get/Create Edition (the backend might create one by default in the seed, 
            // but for new works we might need to ensure one exists or get the ID)
            // Our generic POST /works/ already creates a default edition.
            const edition = work.editions?.[0];
            if (!edition) throw new Error('No se pudo encontrar la edición de la obra');

            // 3. Upload File
            const formData = new FormData();
            formData.append('file', file);
            formData.append('edition_id', edition.id);
            formData.append('asset_type', assetType.toUpperCase());
            formData.append('rights_confirmed', 'true');

            const uploadRes = await fetch(`${API_URL}/assets/upload`, {
                method: 'POST',
                // Note: Fetch with FormData automatically sets multipart/form-data with boundary
                body: formData
            });

            if (!uploadRes.ok) {
                const errData = await uploadRes.json();
                throw new Error(errData.detail || 'Error al subir el archivo');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push(`/library/${work.id}`);
            }, 3000);

        } catch (err: any) {
            console.error("Upload error", err);
            setError(err.message || 'Ocurrió un error inesperado');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/library" className="p-2 hover:bg-white/5 rounded-full transition-colors text-neutral-400 hover:text-white">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-3xl font-display font-bold text-white">Subir Nueva Obra</h1>
                    <p className="text-neutral-500">Añade partituras o grabaciones a la biblioteca de tu coro.</p>
                </div>
            </div>

            {success && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center space-y-4"
                >
                    <div className="w-16 h-16 bg-emerald-500 text-primary-900 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                        <Upload size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">¡Obra subida con éxito!</h2>
                    <p className="text-neutral-300">
                        El archivo se ha subido correctamente. {isMusicXML ? 'El pipeline está procesando las voces.' : ''}
                    </p>
                    <p className="text-emerald-500/60 text-xs mt-2 font-mono uppercase tracking-widest">Redirigiendo a la obra...</p>
                </motion.div>
            )}

            {!success && (
                <form onSubmit={handleSubmit} className="bg-primary-800 border border-white/10 rounded-[2.5rem] p-8 md:p-12 space-y-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* Section 1: File Selection */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent-500/20 text-accent-500 flex items-center justify-center shadow-lg shadow-accent-500/10">
                                <Upload size={20} />
                            </div>
                            <h3 className="text-2xl font-display font-bold text-white">Archivo Principal</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-1">
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">Tipo de Documento</label>
                                <div className="relative">
                                    <select
                                        value={assetType}
                                        onChange={e => setAssetType(e.target.value)}
                                        aria-label="Tipo de Documento"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-accent-500 appearance-none text-sm transition-all"
                                    >
                                        <option value="musicxml" className="bg-primary-900">🎼 MusicXML (Procesado IA)</option>
                                        <option value="sheet_music" className="bg-primary-900">📄 Partitura (PDF)</option>
                                        <option value="midi" className="bg-primary-900">🎹 Archivo MIDI (.mid)</option>
                                        <option value="learning_track" className="bg-primary-900">🎵 Pista de Estudio (Audio)</option>
                                        <option value="reference_recording" className="bg-primary-900">🎤 Grabación (Audio)</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                                        <ArrowLeft size={16} className="-rotate-90" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">Seleccionar Archivo</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        onChange={e => setFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                        id="primary-file-upload"
                                        accept={assetType === 'sheet_music' ? '.pdf' : assetType === 'musicxml' ? '.xml,.mxl,.musicxml' : assetType === 'midi' ? '.mid,.midi' : '.mp3,.wav,.ogg,.m4a'}
                                    />
                                    <label
                                        htmlFor="primary-file-upload"
                                        className={`flex items-center justify-between w-full bg-white/5 border ${file ? 'border-accent-500/50' : 'border-white/10'} rounded-2xl px-5 py-4 cursor-pointer hover:bg-white/10 transition-all border-dashed`}
                                    >
                                        <span className={`text-sm truncate pr-2 ${file ? 'text-white font-medium' : 'text-neutral-600'}`}>
                                            {file ? file.name : "Subir archivo..."}
                                        </span>
                                        <Upload size={18} className={file ? 'text-accent-500' : 'text-neutral-600'} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Metadata */}
                    <div className="space-y-6 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-300 flex items-center justify-center shadow-lg shadow-primary-500/10">
                                <Music size={20} />
                            </div>
                            <h3 className="text-2xl font-display font-bold text-white">Información de la Obra</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-1">
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">Título de la Obra *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Ej. Ave Verum Corpus"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-accent-500 text-sm transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">Compositor *</label>
                                <input
                                    type="text"
                                    value={composer}
                                    onChange={e => setComposer(e.target.value)}
                                    placeholder="Ej. W.A. Mozart"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-accent-500 text-sm transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">Época / Estilo</label>
                                <input
                                    type="text"
                                    value={era}
                                    onChange={e => setEra(e.target.value)}
                                    placeholder="Ej. Barroco"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-accent-500 text-sm transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">Formato Vocal</label>
                                <input
                                    type="text"
                                    value={voiceFormat}
                                    onChange={e => setVoiceFormat(e.target.value)}
                                    placeholder="Ej. SATB"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-accent-500 text-sm transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pipeline Info */}
                    {isMusicXML && (
                        <div className="bg-primary-500/5 border border-primary-500/10 rounded-2xl p-6 flex gap-4">
                            <FileMusic className="text-primary-300 shrink-0" size={24} />
                            <div className="space-y-1">
                                <h4 className="font-bold text-primary-300 text-sm uppercase tracking-wider">Análisis Inteligente ACTIVADO</h4>
                                <p className="text-sm text-neutral-400 leading-relaxed">
                                    Al subir un archivo MusicXML, el sistema detectará automáticamente las cuerdas (S, A, T, B) y generará los audios de estudio.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-8 border-t border-white/5 space-y-8">
                        <label className="flex items-start gap-4 cursor-pointer group p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                            <div className="mt-1">
                                <input
                                    type="checkbox"
                                    checked={rightsConfirmed}
                                    onChange={e => setRightsConfirmed(e.target.checked)}
                                    className="w-6 h-6 rounded-lg border-white/20 text-accent-500 bg-black/40 focus:ring-accent-500 focus:ring-offset-0 transition-all cursor-pointer"
                                />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-white font-bold">Declaración de Responsabilidad</p>
                                <p className="text-xs text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors">
                                    Confirmo que tengo los derechos para distribuir este material o que es de dominio público. Entiendo que como director soy responsable legal de los contenidos subidos.
                                </p>
                            </div>
                        </label>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/library"
                                className="flex-1 px-8 py-5 rounded-2xl font-bold text-neutral-500 hover:text-white hover:bg-white/5 transition-all text-center border border-transparent hover:border-white/10"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={loading || !file || !title || !composer || !rightsConfirmed}
                                className="flex-[2] bg-accent-500 hover:bg-accent-400 text-primary-900 font-bold py-5 px-8 rounded-2xl transition-all shadow-glow-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                            >
                                {loading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                                {loading ? 'Subiendo...' : 'Publicar Obra'}
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}
