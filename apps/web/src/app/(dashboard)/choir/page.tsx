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
    const [invites, setInvites] = useState<any[]>([]);
    const [loadingInvites, setLoadingInvites] = useState(false);
    const [generatingInvite, setGeneratingInvite] = useState(false);

    const loadInvites = async () => {
        setLoadingInvites(true);
        try {
            const data = await fetchApi('/invites/me');
            setInvites(data || []);
        } catch (err) {
            console.error("Error loading invites", err);
        } finally {
            setLoadingInvites(false);
        }
    };

    useEffect(() => {
        fetchApi('/choirs/me')
            .then(data => {
                if (data) {
                    setChoir(data);
                    setChoirName(data.name);
                    setDescription(data.description || '');
                    loadInvites();
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching choir", err);
                setLoading(false);
            });
    }, []);

    const handleGenerateInvite = async () => {
        if (!choir) return;
        setGeneratingInvite(true);
        try {
            await fetchApi('/invites', {
                method: 'POST',
                body: JSON.stringify({
                    choir_id: choir.id,
                    max_uses: 1,
                })
            });
            await loadInvites();
        } catch (err) {
            alert("Error al generar invitación. ¿Has alcanzado el límite de tu plan?");
        } finally {
            setGeneratingInvite(false);
        }
    };

    const handleDeleteInvite = async (inviteId: string) => {
        if (!confirm("¿Seguro que quieres revocar esta invitación?")) return;
        try {
            await fetchApi(`/invites/${inviteId}`, { method: 'DELETE' });
            await loadInvites();
        } catch (err) {
            console.error("Error deleting invite", err);
        }
    };

    const copyInviteLink = (code: string) => {
        const url = `${window.location.origin}/register?code=${code}`;
        navigator.clipboard.writeText(url);
        alert("Enlace de invitación copiado al portapapeles");
    };

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
                            <span className="text-slate-400">Cupo de Miembros</span>
                            <span className="font-medium text-blue-400">{invites.filter((i: any) => i.uses_count > 0).length + 1} / {choir.max_users || 50}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Invitaciones Activas</span>
                            <span className="font-medium">{invites.filter((i: any) => i.uses_count < (i.max_uses || 1)).length}</span>
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

                    {/* Invitations Section */}
                    <div className="bg-[#0a0a1a] border border-white/10 rounded-2xl p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-semibold">Invitaciones para tu Coro</h3>
                                <p className="text-sm text-slate-400 mt-1">Crea enlaces para que tus coralistas se unan automáticamente.</p>
                            </div>
                            <button
                                onClick={handleGenerateInvite}
                                disabled={generatingInvite}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2"
                            >
                                {generatingInvite ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Generar Invitación
                            </button>
                        </div>

                        {loadingInvites ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="animate-spin text-indigo-500" size={24} />
                            </div>
                        ) : invites.length > 0 ? (
                            <div className="space-y-4">
                                {invites.map((invite) => {
                                    const isUsed = invite.uses_count >= (invite.max_uses || 1);
                                    return (
                                        <div key={invite.id} className={`p-4 rounded-xl border ${isUsed ? 'bg-white/5 border-white/5 opacity-60' : 'bg-indigo-500/5 border-indigo-500/20'} flex items-center justify-between group`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${isUsed ? 'bg-slate-500/10 text-slate-500' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                                    <Users size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-mono text-sm font-bold tracking-wider">{invite.code}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {isUsed ? 'Usada' : `Disponible (${invite.uses_count}/${invite.max_uses || 1} usos)`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!isUsed && (
                                                    <button
                                                        onClick={() => copyInviteLink(invite.code)}
                                                        className="p-2 hover:bg-indigo-500/10 text-indigo-400 rounded-lg transition-colors"
                                                        title="Copiar enlace"
                                                    >
                                                        <Save size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteInvite(invite.id)}
                                                    className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Revocar"
                                                >
                                                    <ArrowLeft size={18} className="rotate-45" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
                                <Users className="mx-auto text-slate-600 mb-3" size={32} />
                                <p className="text-slate-500 text-sm">No has creado ninguna invitación aún.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
