'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Tag, FileText, ArrowLeft, Loader2, Save } from 'lucide-react';
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
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link href="/projects" className="p-2 text-neutral-300 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Nuevo Proyecto</h1>
                    <p className="text-neutral-300">Crea un nuevo concierto o programa de estudio.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-primary-800 border border-white/10 rounded-2xl p-8 space-y-6 shadow-xl">
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="project-name" className="text-sm font-medium text-neutral-300">Nombre del Proyecto <span className="text-red-400">*</span></label>
                        <input
                            id="project-name"
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus-visible:outline-2 focus-visible:outline-accent-500 focus-visible:outline-offset-2 focus:ring-2 focus:ring-accent-500 focus-visible:outline-2 focus-visible:outline-accent-500"
                            placeholder="Ej: Concierto de Navidad 2026"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="project-desc" className="text-sm font-medium text-neutral-300">Descripción</label>
                        <textarea
                            id="project-desc"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus-visible:outline-2 focus-visible:outline-accent-500 focus-visible:outline-offset-2 focus:ring-2 focus:ring-accent-500 focus-visible:outline-2 focus-visible:outline-accent-500 resize-none"
                            rows={3}
                            placeholder="Detalles sobre el repertorio o fecha..."
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label htmlFor="project-date" className="text-sm font-medium text-neutral-300">Fecha Tentativa</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
                                <input
                                    id="project-date"
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus-visible:outline-2 focus-visible:outline-accent-500 focus-visible:outline-offset-2 focus:ring-2 focus:ring-accent-500 focus-visible:outline-2 focus-visible:outline-accent-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is-published"
                            checked={isPublished}
                            onChange={e => setIsPublished(e.target.checked)}
                            className="w-5 h-5 rounded border-white/10 bg-black/50 text-primary-500 focus:ring-accent-500 focus-visible:outline-2 focus-visible:outline-accent-500"
                        />
                        <label htmlFor="is-published" className="text-sm text-neutral-300 cursor-pointer select-none">
                            Publicar proyecto (visible para coralistas)
                        </label>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/10 flex justify-end gap-3">
                    <Link
                        href="/projects"
                        className="px-6 py-2.5 rounded-xl font-medium text-neutral-300 hover:bg-white/5 transition-colors"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || !name}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-glow-primary disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {loading ? 'Creando...' : 'Crear Proyecto'}
                    </button>
                </div>
            </form>
        </div>
    );
}
