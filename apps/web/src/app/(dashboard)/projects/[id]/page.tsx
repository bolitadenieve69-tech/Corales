'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit3, Trash2, Calendar, Music, Plus, PlayCircle, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import ProjectProgress from './project-progress';

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Work addition state
    const [isAddingWork, setIsAddingWork] = useState(false);
    const [library, setLibrary] = useState<any[]>([]);
    const [addingWorkLoading, setAddingWorkLoading] = useState(false);

    useEffect(() => {
        if (!params.id) return;
        loadProject();
    }, [params.id]);

    const loadProject = () => {
        fetchApi(`/projects/${params.id}`)
            .then(data => {
                setProject(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching project", err);
                setError(err.message || "No se pudo cargar el proyecto");
                setLoading(false);
            });
    };

    const loadLibrary = async () => {
        try {
            const data = await fetchApi('/works/');
            if (data) setLibrary(data);
        } catch (err) {
            console.error("Error loading library", err);
        }
    };

    const handleAddFromLibrary = async (work: any) => {
        try {
            await fetchApi(`/projects/${id}/repertoire`, {
                method: 'POST',
                body: JSON.stringify({
                    work_title: work.title,
                    work_id: work.id,
                    order: (project.repertoire || []).length
                })
            });
            setIsAddingWork(false);
            fetchProject();
        } catch (err) {
            console.error("Error adding work to project", err);
        }
    };

    const handleFastUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadData.file || !uploadData.title) return;

        setIsUploading(true);
        try {
            // 1. Create Work
            const work = await fetchApi('/works/', {
                method: 'POST',
                body: JSON.stringify({
                    title: uploadData.title,
                    composer: uploadData.composer,
                    choir_id: project.choir_id
                })
            });

            // 2. Create Edition
            const edition = await fetchApi('/editions/', {
                method: 'POST',
                body: JSON.stringify({
                    work_id: work.id,
                    edition_type: 'OTRO',
                    name: 'Edición Original'
                })
            });

            // 3. Upload MusicXML
            const formData = new FormData();
            formData.append('file', uploadData.file);
            formData.append('edition_id', edition.id);

            await fetchApi('/assets/upload-musicxml', {
                method: 'POST',
                body: formData,
                headers: {}, // fetchApi will set Content-Type if we don't pass it, but for FormData we MUST NOT set it manually or it breaks boundaries
            });

            // 4. Link to Project
            await fetchApi(`/projects/${id}/repertoire`, {
                method: 'POST',
                body: JSON.stringify({
                    work_title: work.title,
                    work_id: work.id,
                    order: (project.repertoire || []).length
                })
            });

            setIsAddingWork(false);
            setUploadData({ title: '', composer: '', file: null });
            fetchProject();
        } catch (err) {
            console.error("Error in fast upload", err);
            alert("Error al subir la obra. Verífica el formato del archivo.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveWork = async (repertoireId: string) => {
        if (!confirm('¿Quitar esta obra del proyecto?')) return;
        try {
            // Optimistic update
            const updatedRepertoire = project.repertoire.filter((r: any) => r.id !== repertoireId);
            setProject({ ...project, repertoire: updatedRepertoire });

            await fetchApi(`/projects/${id}/repertoire/${repertoireId}`, {
                method: 'DELETE'
            });
        } catch (err) {
            console.error("Error removing work", err);
            fetchProject();
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 size={48} className="text-primary-500 animate-spin" />
            <p className="text-neutral-300 font-medium">Cargando detalles del proyecto...</p>
        </div>
    );

    if (error || !project) return (
        <div className="text-center py-20 bg-primary-800 rounded-3xl border border-white/10">
            <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <Music size={32} className="text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Proyecto no encontrado</h2>
            <p className="text-neutral-400 mb-6">{error || "No pudimos cargar la información del proyecto."}</p>
            <Link href="/projects" className="text-primary-300 hover:text-white transition-colors">
                Volver a la lista
            </Link>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-primary-800 border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-900 via-primary-800/80 to-indigo-900/40" />
                <div className="relative p-8 md:p-12">
                    <Link href="/projects" className="inline-flex items-center gap-2 text-primary-300 hover:text-white transition-colors mb-6 font-medium group text-sm">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Volver a Proyectos
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${project.is_published ? 'bg-success/20 text-green-400 border border-success/30' : 'bg-neutral-500/20 text-neutral-400 border border-white/10'}`}>
                                    {project.is_published ? 'Publicado' : 'Borrador'}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 leading-tight">{project.name}</h1>
                            <p className="text-lg text-neutral-300 max-w-2xl leading-relaxed">{project.description || 'Sin descripción.'}</p>
                        </div>

                        <div className="flex gap-3">
                            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-neutral-300 transition-colors border border-white/10">
                                <Edit size={20} />
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm("¿Estás seguro de que quieres eliminar este proyecto?")) {
                                        try {
                                            fetchApi(`/projects/${project.id}`, { method: 'DELETE' });
                                            router.push('/projects');
                                            router.refresh();
                                        } catch (err) {
                                            alert("No se pudo eliminar el proyecto.");
                                        }
                                    }
                                }}
                                className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 transition-colors border border-red-500/20"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 mt-8 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-500/20 rounded-lg">
                                <Calendar size={20} className="text-primary-300" />
                            </div>
                            <div>
                                <p className="text-xs text-neutral-600 font-medium uppercase tracking-wider">Fecha</p>
                                <p className="text-white font-medium">
                                    {project.date
                                        ? new Date(project.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
                                        : 'Por definir'}
                                </p>
                            </div>
                        </div>
                        <div className="hidden sm:block w-px h-10 bg-white/10" />
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-500/20 rounded-lg">
                                <Music size={20} className="text-primary-300" />
                            </div>
                            <div>
                                <p className="text-xs text-neutral-600 font-medium uppercase tracking-wider">Repertorio</p>
                                <p className="text-white font-medium">{(project.repertoire || []).length} obras</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Repertoire Section */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                        <Music size={24} className="text-primary-500" /> Repertorio
                    </h2>
                    {!isAddingWork ? (
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setIsAddingWork(true);
                                    loadLibrary();
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-glow-primary"
                            >
                                <Plus size={18} />
                                Añadir De Biblioteca
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAddingWork(false)}
                            className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                    )}
                </div>

                {isAddingWork && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-300">
                        {/* Option 1: Select from Library */}
                        <div className="bg-primary-800 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <FileText size={18} className="text-primary-300" /> Seleccionar Existente
                            </h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                                {library.length === 0 ? (
                                    <p className="text-sm text-neutral-500 italic">No hay obras en la biblioteca.</p>
                                ) : (
                                    library.map((work: any) => (
                                        <button
                                            key={work.id}
                                            onClick={() => handleAddFromLibrary(work)}
                                            className="w-full text-left p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group shrink-0"
                                        >
                                            <p className="font-medium text-white group-hover:text-primary-300">{work.title}</p>
                                            <p className="text-xs text-neutral-500">{work.composer || 'Compositor desconocido'}</p>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Option 2: Upload New Piece */}
                        <div className="bg-primary-800 border border-accent-500/30 rounded-2xl p-6 shadow-lg shadow-glow-accent/5">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Plus size={18} className="text-accent-500" /> Subir Nueva Obra
                            </h3>
                            <form onSubmit={handleFastUpload} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Título de la obra"
                                    className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm"
                                    value={uploadData.title}
                                    onChange={e => setUploadData({ ...uploadData, title: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Compositor"
                                    className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm"
                                    value={uploadData.composer}
                                    onChange={e => setUploadData({ ...uploadData, composer: e.target.value })}
                                />
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept=".xml,.musicxml,.mxl"
                                        className="hidden"
                                        id="quick-upload"
                                        onChange={e => setUploadData({ ...uploadData, file: e.target.files?.[0] || null })}
                                    />
                                    <label
                                        htmlFor="quick-upload"
                                        className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-accent-500/50 hover:bg-accent-500/5 transition-all"
                                    >
                                        <FileText className={`mb-2 ${uploadData.file ? 'text-accent-500' : 'text-neutral-500'}`} size={24} />
                                        <span className="text-xs text-neutral-400 font-medium">
                                            {uploadData.file ? uploadData.file.name : 'Seleccionar MusicXML'}
                                        </span>
                                    </label>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isUploading || !uploadData.file || !uploadData.title}
                                    className="w-full py-2 bg-accent-500 hover:bg-accent-600 text-black font-bold rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    {isUploading ? 'Subiendo...' : 'Subir y Añadir'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {(project.repertoire || []).length === 0 ? (
                    <div className="bg-primary-800/50 border border-dashed border-white/20 rounded-3xl p-12 text-center">
                        <div className="bg-primary-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Music size={32} className="text-primary-400 opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Sin repertorio</h3>
                        <p className="text-neutral-400 mb-6">Empieza añadiendo obras de la biblioteca o sube nuevas partituras.</p>
                        {!isAddingWork && (
                            <button
                                onClick={() => {
                                    setIsAddingWork(true);
                                    loadLibrary();
                                }}
                                className="px-6 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-white font-medium transition-colors"
                            >
                                Añadir mi primera obra
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(project.repertoire || []).map((work: any, index: number) => (
                            <div key={work.id} className="group relative bg-primary-800 border border-white/10 rounded-2xl p-6 hover:border-primary-500/50 transition-all hover:shadow-xl hover:-translate-y-1">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleRemoveWork(work.id)}
                                        className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary-900 border border-white/10 flex items-center justify-center text-primary-500 font-bold">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white group-hover:text-primary-300 transition-colors">{work.work_title}</h3>
                                        <p className="text-xs text-neutral-500">Repertorio del proyecto</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                    <Link
                                        href={work.work_id ? `/library/${work.work_id}` : '#'}
                                        className="text-xs font-bold text-primary-400 hover:text-white uppercase tracking-wider flex items-center gap-2"
                                    >
                                        Estudiar <ChevronRight size={14} />
                                    </Link>
                                    <span className="text-[10px] text-neutral-600 font-medium">BPM: 72 (est)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Project Progress (Mini Dashboard) */}
            <div className="bg-gradient-to-br from-primary-800 to-indigo-900/20 border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Estado del Ensayo</h2>
                        <p className="text-neutral-400">Progreso global del coro en este proyecto.</p>
                    </div>
                    <div className="bg-primary-500/20 px-4 py-2 rounded-2xl border border-primary-500/30">
                        <span className="text-2xl font-bold text-primary-300">0%</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {['Soprano', 'Contralto', 'Tenor', 'Bajo'].map((voice, i) => (
                        <div key={voice} className="space-y-3">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                                <span className={`text-voice-${voice.toLowerCase().replace('contralto', 'alto')}`}>{voice}</span>
                                <span className="text-neutral-500">0%</span>
                            </div>
                            <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                                <div className="h-full bg-neutral-700 w-0 transition-all duration-1000" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const Plus = ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const Edit = ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const Trash2 = ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

const ChevronRight = ({ size = 20, className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="9 18 15 12 9 6" />
    </svg>
);
