'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Tag, FileText, ArrowLeft, Loader2, Save, Plus } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

export default function NewProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [choir, setChoir] = useState<any>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchApi('/choirs/me')
            .then(data => {
                if (data) setChoir(data);
            })
            .catch(err => console.error("Error fetching choir for new project", err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!choir) {
            setError("Necesitas un coro para crear un proyecto. Ve a 'Mi Coro' primero.");
            setLoading(false);
            return;
        }

        try {
            const project = await fetchApi('/projects/', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    description,
                    date: date || null,
                    is_published: isPublished,
                    choir_id: choir.id
                })
            });

            if (project) {
                router.push(`/projects/${project.id}`);
                router.refresh();
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Error al crear el proyecto");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-6">
                <Link href="/projects" className="p-3 text-neutral-400 hover:text-primary-500 bg-white border border-neutral-200 rounded-2xl transition-all shadow-sm">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">Nuevo Proyecto</h1>
                    <p className="text-neutral-500 font-medium">Crea un nuevo concierto o programa de estudio magistral.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-[2.5rem] p-10 space-y-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-primary-500" />
                
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="project-name" className="text-sm font-black uppercase tracking-widest text-neutral-400">Nombre del Proyecto <span className="text-primary-500">*</span></label>
                        <input
                            id="project-name"
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-foreground placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-lg"
                            placeholder="Ej: Concierto de Navidad 2026"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="project-desc" className="text-sm font-black uppercase tracking-widest text-neutral-400">Descripción</label>
                        <textarea
                            id="project-desc"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-foreground placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium resize-none min-h-[120px]"
                            rows={3}
                            placeholder="Detalles sobre el repertorio o fecha..."
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="project-date" className="text-sm font-black uppercase tracking-widest text-neutral-400">Fecha Tentativa</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                                <input
                                    id="project-date"
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="w-full pl-12 pr-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center gap-4 group cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                id="is-published"
                                checked={isPublished}
                                onChange={e => setIsPublished(e.target.checked)}
                                className="peer w-6 h-6 rounded-lg border-neutral-300 bg-neutral-50 text-primary-500 focus:ring-primary-500 cursor-pointer appearance-none checked:bg-primary-500 transition-all"
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white opacity-0 peer-checked:opacity-100 transition-opacity">
                                <Plus size={14} className="rotate-45" />
                            </div>
                        </div>
                        <label htmlFor="is-published" className="text-sm font-bold text-neutral-600 cursor-pointer select-none group-hover:text-primary-500 transition-colors">
                            Publicar proyecto (visible para todos los coralistas inmediatamente)
                        </label>
                    </div>
                </div>

                <div className="pt-8 border-t border-neutral-100 flex items-center justify-end gap-4">
                    <Link
                        href="/projects"
                        className="px-8 py-3 rounded-full font-bold text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-all"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || !name}
                        className="flex items-center gap-2 px-10 py-3 bg-primary-500 hover:bg-primary-800 text-white rounded-full font-bold transition-all shadow-lg shadow-glow-primary active:scale-95 disabled:opacity-50 disabled:grayscale"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        {loading ? 'Creando...' : 'Crear Proyecto'}
                    </button>
                </div>
            </form>
        </div>
    );
}
