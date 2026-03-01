'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Users, Music, Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

export default function ChoirPage() {
    const [choir, setChoir] = useState<any>(null);
    const [choirName, setChoirName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchApi('/choirs/me')
            .then(data => {
                if (data) {
                    setChoir(data);
                    setChoirName(data.name);
                    setDescription(data.description || '');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching choir", err);
                setLoading(false);
            });
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            const data = await fetchApi('/choirs/me', {
                method: 'PUT',
                body: JSON.stringify({ name: choirName, description })
            });
            if (data) {
                setChoir(data);
                setMessage('¡Cambios guardados con éxito!');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            console.error("Error saving choir", err);
            setMessage('Error al guardar los cambios');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
                <p>Cargando información de tu coro...</p>
            </div>
        );
    }

    if (!choir) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <p>No se encontró información de tu coro.</p>
                <p className="text-sm mt-2">Contacta con soporte si crees que es un error.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Nav */}
            <div className="flex items-center gap-4">
                <Link href="/projects" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Mi Coro</h1>
            </div>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl text-sm font-medium ${message.includes('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}
                >
                    {message}
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Logo Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#0a0a1a] border border-white/10 rounded-2xl p-8 flex flex-col items-center">
                        <div className="relative group cursor-pointer">
                            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-2 border-dashed border-white/20 flex items-center justify-center group-hover:border-blue-500/50 transition-all overflow-hidden text-blue-500/50 text-4xl font-bold">
                                {choirName.charAt(0)}
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-opacity">
                                <span className="text-xs font-medium text-white">Próximamente...</span>
                            </div>
                        </div>
                        <h2 className="mt-6 text-xl font-semibold">{choirName}</h2>
                        <p className="text-slate-500 text-sm mt-1">Perfil de Coro</p>
                    </div>

                    <div className="bg-[#0a0a1a] border border-white/10 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Coralistas</span>
                            <span className="font-medium text-blue-400">Sólo tú (Director)</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Invitaciones Pendientes</span>
                            <span className="font-medium">0</span>
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#0a0a1a] border border-white/10 rounded-2xl p-8">
                        <h3 className="text-xl font-semibold mb-6">Información General</h3>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="choir-name" className="text-sm font-medium text-slate-400">Nombre del Coro</label>
                                <input
                                    id="choir-name"
                                    type="text"
                                    value={choirName}
                                    onChange={(e) => setChoirName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                    placeholder="Nombre de tu coro"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="description" className="text-sm font-medium text-slate-400">Descripción / Biografía</label>
                                <textarea
                                    id="description"
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                                    placeholder="Cuéntanos un poco sobre tu coro..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
