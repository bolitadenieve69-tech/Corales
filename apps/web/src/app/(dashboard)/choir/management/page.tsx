'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Users, Calendar, Settings, Shield, UserPlus, FileText, Search, Filter, Loader2, MessageSquare, Trash } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useUIStore } from '@/store/uiStore';
import { SeasonForm } from '@/components/choir/SeasonForm';
import { SendFeedbackModal } from '@/components/choir/SendFeedbackModal';
import { ChoirSettingsForm } from '@/components/choir/ChoirSettingsForm';
import { AddMemberModal } from '@/components/choir/AddMemberModal';

export default function ChoirManagementPage() {
    const { user: currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'info' | 'members' | 'seasons' | 'invites' | 'analytics'>('members');
    const [members, setMembers] = useState<any[]>([]);
    const [seasons, setSeasons] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showSeasonForm, setShowSeasonForm] = useState(false);
    const [choirId, setChoirId] = useState<string>('');
    const [selectedMember, setSelectedMember] = useState<any | null>(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);

    useEffect(() => {
        // En una app real, obtendríamos el choir_id del usuario actual (director)
        // Por ahora, listamos los coros y cogemos el primero para el demo
        async function loadData() {
            setLoading(true);
            try {
                const choirs = await fetchApi('/choirs/');
                if (choirs && choirs.length > 0) {
                    const cid = choirs[0].id;
                    setChoirId(cid);
                    const [membersData, seasonsData, statsData] = await Promise.all([
                        fetchApi(`/management/choir/${cid}/members`),
                        fetchApi(`/management/choir/${cid}/seasons`),
                        fetchApi(`/management/choir/${cid}/stats`)
                    ]);
                    setMembers(membersData || []);
                    setSeasons(seasonsData || []);
                    setStats(statsData || null);
                }
            } catch (err) {
                console.error("Error loading management data", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const voiceColorMap: Record<string, string> = {
        'SOPRANO': 'var(--color-voice-soprano)',
        'ALTO': 'var(--color-voice-alto)',
        'TENOR': 'var(--color-voice-tenor)',
        'BASS': 'var(--color-voice-bajo)'
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-accent-500" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <header className="space-y-4">
                <div className="flex items-center gap-3 text-accent-500 font-bold uppercase tracking-widest text-xs">
                    <Shield size={14} />
                    Panel de Administración
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white">Gestión del Coro</h1>
                <p className="text-primary-100/60 max-w-2xl">
                    Supervisa a los miembros, organiza las temporadas musicales y gestiona el acceso a tu agrupación académica.
                </p>
            </header>

            {/* Tabs Navigation */}
            <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit overflow-x-auto">
                {[
                    { id: 'info', label: 'Datos', icon: Settings },
                    { id: 'members', label: 'Miembros', icon: Users },
                    { id: 'seasons', label: 'Temporadas', icon: Calendar },
                    { id: 'analytics', label: 'Analíticas', icon: FileText },
                    { id: 'invites', label: 'Invitaciones', icon: UserPlus },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-medium ${activeTab === tab.id
                            ? 'bg-accent-500 text-primary-900 shadow-glow-accent'
                            : 'text-neutral-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-primary-800/30 border border-white/10 rounded-[2.5rem] p-8 min-h-[500px]"
            >
                {activeTab === 'info' && (
                    <div className="max-w-4xl mx-auto">
                        <ChoirSettingsForm choirId={choirId} />
                    </div>
                )}

                {activeTab === 'members' && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar miembro..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-accent-500/50"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-neutral-400 hover:text-white">
                                    <Filter size={18} />
                                </button>
                                <button
                                    onClick={() => setShowAddMemberModal(true)}
                                    className="flex items-center gap-2 bg-primary-500 text-white px-5 py-3 rounded-xl font-bold hover:bg-primary-400 transition-all shadow-glow-primary"
                                >
                                    <UserPlus size={18} />
                                    Añadir Miembro
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {members.map((member) => (
                                <div key={member.id} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 group hover:bg-white/10 transition-all border-l-4 relative" style={{ borderColor: voiceColorMap[member.voice_part] || 'transparent' }}>
                                    <div className="shrink-0 w-12 h-12 rounded-full bg-primary-700 border border-white/10 flex items-center justify-center overflow-hidden relative">
                                        {member.avatar_url ? (
                                            <Image
                                                src={member.avatar_url}
                                                alt={`Avatar de ${member.full_name}`}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-primary-300 font-bold">{member.full_name?.[0] || 'U'}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-bold truncate flex items-center gap-2">
                                            {member.full_name}
                                            {member.phone && member.has_whatsapp && (
                                                <div className="w-2 h-2 rounded-full bg-success flex-shrink-0" title="Tiene WhatsApp" />
                                            )}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <select
                                                aria-label={`Cambiar voz de ${member.full_name}`}
                                                value={member.voice_part}
                                                onChange={async (e) => {
                                                    const newVoice = e.target.value;
                                                    try {
                                                        const updated = await fetchApi(`/management/${choirId}/members/${member.id}/voice?voice_part=${newVoice}`, {
                                                            method: 'PUT'
                                                        });
                                                        if (updated) {
                                                            setMembers(prev => prev.map(m => m.id === member.id ? { ...m, voice_part: newVoice } : m));
                                                            useUIStore.getState().addToast('Voz actualizada', 'success');
                                                        }
                                                    } catch (err) {
                                                        useUIStore.getState().addToast('Error al cambiar voz', 'error');
                                                    }
                                                }}
                                                className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-neutral-300 uppercase font-black tracking-widest border-none cursor-pointer focus:ring-1 focus:ring-accent-500"
                                            >
                                                {['SOPRANO', 'ALTO', 'TENOR', 'BASS'].map(v => (
                                                    <option key={v} value={v} className="bg-primary-800 text-white">{v}</option>
                                                ))}
                                            </select>
                                            <span className="text-[10px] text-neutral-500 lowercase truncate" title={member.email}>{member.email}</span>
                                        </div>
                                    </div>
                                    <div className="shrink-0 flex gap-1">
                                        <button
                                            title="Enviar mensaje de corrección"
                                            aria-label={`Enviar mensaje a ${member.full_name}`}
                                            onClick={() => {
                                                setSelectedMember(member);
                                                setShowFeedbackModal(true);
                                            }}
                                            className="p-2 hover:bg-white/10 rounded-xl text-neutral-400 hover:text-accent-500 transition-all focus-ring"
                                        >
                                            <MessageSquare size={18} />
                                        </button>
                                        {member.user_id !== currentUser?.id && (
                                            <button
                                                title="Expulsar miembro"
                                                aria-label={`Expulsar a ${member.full_name}`}
                                                onClick={async () => {
                                                    if (confirm(`¿Estás seguro de que quieres eliminar a ${member.full_name} del coro?`)) {
                                                        try {
                                                            await fetchApi(`/management/choir/${choirId}/members/${member.id}`, {
                                                                method: 'DELETE'
                                                            });
                                                            setMembers(prev => prev.filter(m => m.id !== member.id));
                                                            useUIStore.getState().addToast('Miembro eliminado correctamente', 'success');
                                                        } catch (err: any) {
                                                            useUIStore.getState().addToast(err.message || 'Error al eliminar miembro', 'error');
                                                        }
                                                    }
                                                }}
                                                className="p-2 hover:bg-red-500/10 rounded-xl text-neutral-400 hover:text-red-500 transition-all focus-ring"
                                            >
                                                <Trash size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'seasons' && (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-display font-bold text-white">Ciclos Musicales</h2>
                            <button
                                onClick={() => setShowSeasonForm(true)}
                                className="flex items-center gap-2 bg-accent-500 text-primary-900 px-5 py-3 rounded-xl font-bold hover:bg-accent-400 transition-all shadow-glow-accent"
                            >
                                <Calendar size={18} />
                                Nueva Temporada
                            </button>
                        </div>

                        {seasons.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-primary-300">
                                    <Calendar size={40} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-white">No hay temporadas aún</h3>
                                    <p className="text-neutral-500 max-w-xs">Organiza tus proyectos escolares y conciertos por periodos de tiempo.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {seasons.map((season) => (
                                    <div key={season.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 hover:border-primary-500/30 transition-all">
                                        <div className="flex justify-between">
                                            <h3 className="text-xl font-bold text-white">{season.name}</h3>
                                            <span className="px-3 py-1 rounded-full bg-success/10 text-success text-[10px] font-black uppercase tracking-widest">Activo</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-neutral-400">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} />
                                                {season.start_date || 'N/A'} — {season.end_date || 'Presente'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FileText size={14} />
                                                0 proyectos
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all">Ver Repertorio</button>
                                            <button
                                                aria-label="Configurar temporada"
                                                className="py-2 px-4 rounded-xl bg-white/5 border border-white/10 text-xs hover:bg-white/10"
                                            >
                                                <Settings size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'invites' && (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 text-neutral-500">
                        <UserPlus size={48} />
                        <p>Gestión de invitaciones próximamente...</p>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="space-y-10">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-display font-bold text-white">Analíticas de Ensayo</h2>
                            <div className="text-sm text-neutral-400 font-medium bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                                Datos agregados de todos los proyectos
                            </div>
                        </div>

                        {seasons.length === 0 ? (
                            <p className="text-center py-20 text-neutral-500">Crea una temporada para ver analíticas.</p>
                        ) : (
                            <div className="space-y-12">
                                {seasons.map(season => (
                                    <div key={season.id} className="space-y-6">
                                        <h3 className="text-xl font-bold text-primary-300 border-l-4 border-accent-500 pl-4">{season.name}</h3>

                                        <div className="grid grid-cols-1 gap-6">
                                            {/* Aquí iría el mapeo de los proyectos y su progreso real desde /progress/project/{id} */}
                                            {/* Para el MVP/Demo mostramos un layout de progreso por cuerdas */}
                                            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-8">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <h4 className="text-lg font-bold text-white uppercase tracking-tight">Distribución de Voces</h4>
                                                        <p className="text-xs text-neutral-500 font-black tracking-widest uppercase">Balance actual del coro ({stats?.total || 0} miembros)</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    {[
                                                        { label: 'Sopranos', color: 'var(--color-voice-soprano)', count: stats?.voices?.SOPRANO || 0 },
                                                        { label: 'Altos', color: 'var(--color-voice-alto)', count: stats?.voices?.ALTO || 0 },
                                                        { label: 'Tenores', color: 'var(--color-voice-tenor)', count: stats?.voices?.TENOR || 0 },
                                                        { label: 'Bajos', color: 'var(--color-voice-bajo)', count: stats?.voices?.BASS || 0 },
                                                    ].map((voice) => {
                                                        const percentage = stats?.total > 0 ? (voice.count / stats.total) * 100 : 0;
                                                        return (
                                                            <div key={voice.label} className="space-y-2">
                                                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest pl-1">
                                                                    <span style={{ color: voice.color }}>{voice.label}</span>
                                                                    <span className="text-neutral-400">{voice.count} coralistas</span>
                                                                </div>
                                                                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                                    <div
                                                                        className="h-full rounded-full shadow-lg"
                                                                        style={{
                                                                            width: `${percentage}%`,
                                                                            backgroundColor: voice.color,
                                                                            boxShadow: `0 0 15px ${voice.color}40`
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Modal Overlay for AddMemberModal */}
            {showAddMemberModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="w-full max-w-2xl"
                    >
                        <AddMemberModal
                            choirId={choirId}
                            onSuccess={(newMember) => {
                                setShowAddMemberModal(false);
                                setMembers(prev => [...prev, newMember]);
                            }}
                            onCancel={() => setShowAddMemberModal(false)}
                        />
                    </motion.div>
                </div>
            )}

            {/* Modal Overlay for SeasonForm */}
            {showSeasonForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="w-full max-w-lg"
                    >
                        <SeasonForm
                            choirId={choirId}
                            onSuccess={() => {
                                setShowSeasonForm(false);
                                // Refresh seasons list
                                fetchApi(`/management/choir/${choirId}/seasons`).then(setSeasons);
                            }}
                            onCancel={() => setShowSeasonForm(false)}
                        />
                    </motion.div>
                </div>
            )}

            {/* Modal Overlay for SendFeedbackModal */}
            {showFeedbackModal && selectedMember && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="w-full max-w-lg shadow-2xl"
                    >
                        <SendFeedbackModal
                            choirId={choirId}
                            recipientId={selectedMember.user_id}
                            recipientName={selectedMember.full_name}
                            onSuccess={() => setShowFeedbackModal(false)}
                            onCancel={() => setShowFeedbackModal(false)}
                        />
                    </motion.div>
                </div>
            )}
        </div>
    );
}
