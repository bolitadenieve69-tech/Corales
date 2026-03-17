'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, Copy, Trash2, Calendar, Users, Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useUIStore } from '@/store/uiStore';
import { motion, AnimatePresence } from 'framer-motion';

interface Invite {
    id: string;
    code: string;
    max_uses: number | null;
    uses_count: number;
    expires_at: string | null;
}

interface InvitationManagerProps {
    choirId: string;
}

export function InvitationManager({ choirId }: InvitationManagerProps) {
    const [invites, setInvites] = useState<Invite[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [maxUses, setMaxUses] = useState('1');
    const [expiresAt, setExpiresAt] = useState('');
    const addToast = useUIStore(state => state.addToast);

    const loadInvites = async () => {
        setLoading(true);
        try {
            const data = await fetchApi('/invites/me');
            setInvites(data || []);
        } catch (err) {
            console.error("Error loading invites", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInvites();
    }, [choirId]);

    const handleCreateInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            await fetchApi('/invites/', {
                method: 'POST',
                body: JSON.stringify({
                    choir_id: choirId,
                    max_uses: maxUses ? parseInt(maxUses) : null,
                    expires_at: expiresAt || null
                })
            });
            addToast('Invitación creada correctamente', 'success');
            loadInvites();
            // Reset form
            setMaxUses('1');
            setExpiresAt('');
        } catch (err: any) {
            addToast(err.message || 'Error al crear invitación', 'error');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteInvite = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta invitación?')) return;
        try {
            await fetchApi(`/invites/${id}`, { method: 'DELETE' });
            setInvites(prev => prev.filter(inv => inv.id !== id));
            addToast('Invitación eliminada', 'success');
        } catch (err: any) {
            addToast(err.message || 'Error al eliminar', 'error');
        }
    };

    const copyToClipboard = (code: string) => {
        const url = `${window.location.origin}/register?invite=${code}`;
        navigator.clipboard.writeText(url);
        addToast('Enlace copiado al portapapeles', 'success');
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-display font-bold text-white">Enlaces de Invitación</h2>
                    <p className="text-neutral-400 text-sm mt-1">Genera accesos seguros para tus coralistas.</p>
                </div>

                <form onSubmit={handleCreateInvite} className="flex flex-wrap items-end gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 w-full md:w-auto">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary-300 pl-1">Usos Máx.</label>
                        <input
                            id="max-uses"
                            type="number"
                            min="1"
                            title="Usos máximos de la invitación"
                            placeholder="1"
                            value={maxUses}
                            onChange={(e) => setMaxUses(e.target.value)}
                            className="w-20 bg-primary-900 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-accent-500/50 outline-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary-300 pl-1">Caducidad (Opc.)</label>
                        <input
                            id="expires-at"
                            type="date"
                            title="Fecha de caducidad"
                            placeholder="dd/mm/aaaa"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            className="bg-primary-900 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:border-accent-500/50 outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={creating}
                        className="bg-accent-500 text-primary-900 px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-accent-400 transition-all disabled:opacity-50 h-[38px] shadow-glow-accent"
                    >
                        {creating ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                        Generar
                    </button>
                </form>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-accent-500" size={40} />
                </div>
            ) : invites.length === 0 ? (
                <div className="py-20 text-center bg-white/5 border border-dashed border-white/10 rounded-3xl">
                    <UserPlus className="mx-auto text-neutral-600 mb-4" size={48} />
                    <p className="text-neutral-500">Todavía no has generado ningún enlace de acceso.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence>
                        {invites.map((invite) => (
                            <motion.div
                                key={invite.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-5 bg-white/5 border border-white/10 rounded-2xl flex flex-col md:flex-row items-center gap-6 group hover:border-accent-500/30 transition-all"
                            >
                                <div className="flex-1 w-full min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <code className="bg-black/40 px-3 py-1.5 rounded-lg text-accent-500 font-mono text-xs border border-white/5 truncate max-w-xs md:max-w-none">
                                            {invite.code}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(invite.code)}
                                            className="p-1.5 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-all"
                                            title="Copiar enlace"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-xs">
                                        <div className="flex items-center gap-1.5 text-neutral-400">
                                            <Users size={14} className="text-primary-400" />
                                            <span className="font-bold text-white">{invite.uses_count}</span>
                                            <span>/</span>
                                            <span className="text-neutral-500">{invite.max_uses || '∞'} usos</span>
                                        </div>
                                        {invite.expires_at && (
                                            <div className="flex items-center gap-1.5 text-neutral-400">
                                                <Calendar size={14} className="text-primary-400" />
                                                <span>Expira {new Date(invite.expires_at).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            {invite.max_uses && invite.uses_count >= invite.max_uses ? (
                                                <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 uppercase font-black tracking-tighter text-[9px]">Agotado</span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded bg-success/10 text-success uppercase font-black tracking-tighter text-[9px]">Activo</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                                    <button
                                        onClick={() => handleDeleteInvite(invite.id)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 hover:bg-red-500/10 rounded-xl text-neutral-500 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20 text-xs font-bold"
                                    >
                                        <Trash2 size={16} />
                                        Eliminar
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(invite.code)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-all border border-white/10 text-xs font-bold"
                                    >
                                        <ExternalLink size={16} />
                                        Copiar Link
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
