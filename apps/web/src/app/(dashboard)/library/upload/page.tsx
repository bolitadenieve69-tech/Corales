"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldAlert, Upload, Loader2, ArrowLeft, FileMusic, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { fetchApi, API_URL, getAuthToken } from '@/lib/api';

export default function UploadPrivateWorkPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [composer, setComposer] = useState('');
    const [format, setFormat] = useState('SATB');
    const [assetType, setAssetType] = useState('sheet_music');
    const [file, setFile] = useState<File | null>(null);
    const [rightsConfirmed, setRightsConfirmed] = useState(false);
    const [error, setError] = useState('');
    const [pipelineStarted, setPipelineStarted] = useState(false);
    const [choir, setChoir] = useState<any>(null);

    const isMusicXML = assetType === 'musicxml';

    useEffect(() => {
        fetchApi('/choirs/me')
            .then(data => {
                if (data) setChoir(data);
            })
            .catch(err => console.error("Error fetching choir for upload", err));
    }, []);

    const getAcceptedExtensions = () => {
        switch (assetType) {
            case 'musicxml': return '.musicxml,.xml,.mxl';
            case 'sheet_music': return '.pdf';
            case 'midi': return '.mid,.midi';
            default: return 'audio/*';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rightsConfirmed) {
            setError("Debes confirmar que posees los derechos de este material.");
            return;
        }
        if (!file) {
            setError("Debes seleccionar un archivo.");
            return;
        }
        setLoading(true);
        setError('');

        try {
            if (!choir) {
                throw new Error("No se ha encontrado un coro asociado a tu cuenta. Ve a 'Mi Coro' primero.");
            }
            const token = getAuthToken();
            const headers: Record<string, string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            // 1. Create Work
            const work = await fetchApi('/works/', {
                method: 'POST',
                body: JSON.stringify({ title, composer, voice_format: format, choir_id: choir.id })
            });

            // 2. Create Edition
            const edition = await fetchApi('/editions/', {
                method: 'POST',
                body: JSON.stringify({
                    work_id: work.id,
                    publishing_house: "Biblioteca Privada",
                    year: new Date().getFullYear(),
                    language: "Varios"
                })
            });

            // 3. Upload File
            const formData = new FormData();
            formData.append('file', file);
            formData.append('edition_id', edition.id);

            if (isMusicXML) {
                // Use the dedicated MusicXML upload endpoint → triggers pipeline
                const uploadRes = await fetch(`${API_URL}/assets/upload-musicxml`, {
                    method: 'POST',
                    headers: headers,
                    body: formData
                });
                if (!uploadRes.ok) {
                    const errData = await uploadRes.json();
                    throw new Error(errData.detail || "Error subiendo el MusicXML");
                }
                const asset = await uploadRes.json();
                setPipelineStarted(true);

                // Wait a moment then redirect to work detail
                setTimeout(() => {
                    router.push(`/library/${work.id}`);
                    router.refresh();
                }, 2000);
            } else {
                // Regular upload
                formData.append('asset_type', assetType);
                formData.append('rights_confirmed', rightsConfirmed.toString());

                const uploadRes = await fetch(`${API_URL}/assets/upload`, {
                    method: 'POST',
                    headers: headers,
                    body: formData
                });
                if (!uploadRes.ok) {
                    const errData = await uploadRes.json();
                    throw new Error(errData.detail || "Error subiendo el archivo");
                }
                router.push('/library');
                router.refresh();
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Ocurrió un error inesperado.");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link href="/library" className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Subir Obra Privada</h1>
                    <p className="text-slate-400">Añade partituras, audios o MusicXML para tu coro.</p>
                </div>
            </div>

            {/* Pipeline Success Banner */}
            {pipelineStarted && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-green-500/10 border border-green-500/30 rounded-2xl text-center"
                >
                    <Sparkles className="mx-auto text-green-400 mb-3" size={32} />
                    <h3 className="text-lg font-semibold text-green-300 mb-1">¡MusicXML subido con éxito!</h3>
                    <p className="text-green-400/80 text-sm">
                        El pipeline automático está procesando tu partitura.
                        Se detectarán las voces SATB y se generarán los audios de estudio.
                    </p>
                    <p className="text-green-400/60 text-xs mt-2">Redirigiendo a la obra...</p>
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="bg-[#0a0a1a] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl shadow-black/50">
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2">Datos de la Obra</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300">Título de la Obra <span className="text-red-400">*</span></label>
                            <input
                                required
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="Ej: Ave Verum Corpus"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300">Compositor <span className="text-red-400">*</span></label>
                            <input
                                required
                                value={composer}
                                onChange={e => setComposer(e.target.value)}
                                className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="Ej: W.A. Mozart"
                            />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-sm font-medium text-slate-300">Formato / Voces</label>
                            <select
                                value={format}
                                onChange={e => setFormat(e.target.value)}
                                className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="SATB">SATB</option>
                                <option value="SSA">SSA</option>
                                <option value="TTBB">TTBB</option>
                                <option value="Unísono">Unísono</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2">Archivo</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300">Tipo de Archivo</label>
                            <select
                                value={assetType}
                                onChange={e => setAssetType(e.target.value)}
                                className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="musicxml">🎼 MusicXML (genera audios automáticamente)</option>
                                <option value="sheet_music">📄 Partitura (PDF)</option>
                                <option value="midi">🎹 Archivo MIDI (.mid)</option>
                                <option value="learning_track">🎵 Pista de Estudio (Audio)</option>
                                <option value="reference_recording">🎤 Grabación de Referencia (Audio)</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300">Seleccionar Archivo <span className="text-red-400">*</span></label>
                            <div className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl text-white flex items-center justify-between">
                                <input
                                    required
                                    type="file"
                                    accept={getAcceptedExtensions()}
                                    onChange={e => setFile(e.target.files?.[0] || null)}
                                    className="w-full text-sm text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* MusicXML Pipeline Info */}
                {isMusicXML && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex gap-4"
                    >
                        <FileMusic className="text-indigo-400 shrink-0 mt-1" size={24} />
                        <div>
                            <h4 className="font-medium text-indigo-300 mb-1">Pipeline Automático</h4>
                            <p className="text-sm text-indigo-400/80">
                                Al subir un MusicXML, Corales analizará automáticamente las partes,
                                intentará asignar las voces SATB y generará los audios de estudio
                                para cada cuerda. Si no puede identificar las voces, te pedirá que
                                las asignes manualmente.
                            </p>
                        </div>
                    </motion.div>
                )}

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-4 mt-6">
                    <ShieldAlert className="text-amber-500 shrink-0 mt-1" size={24} />
                    <div className="space-y-2">
                        <h4 className="font-medium text-amber-500">Confirmación de Derechos y Copyright</h4>
                        <p className="text-sm text-amber-500/80">
                            Como director o administrador, es tu responsabilidad asegurar que las obras subidas a Corales cuentan con los permisos de distribución necesarios o se encuentran en dominio público.
                        </p>
                        <label className="flex items-start gap-3 mt-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={rightsConfirmed}
                                onChange={e => setRightsConfirmed(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-amber-500/30 bg-black/50 text-amber-600 focus:ring-amber-500 focus:ring-offset-gray-900"
                            />
                            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                                Confirmo que tengo el derecho legal o permiso expreso para compartir y distribuir este material a los miembros de mi coro.
                            </span>
                        </label>
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <Link
                        href="/library"
                        className="px-6 py-2.5 rounded-xl font-medium text-slate-300 hover:bg-white/5 transition-colors"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || !rightsConfirmed || !file}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                        {loading ? (isMusicXML ? 'Procesando...' : 'Subiendo...') : (isMusicXML ? 'Subir y Procesar' : 'Subir Archivo')}
                    </button>
                </div>
            </form>
        </div>
    );
}
