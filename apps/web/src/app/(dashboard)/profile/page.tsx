'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { User, Camera, Save, MapPin, Music, Star, Loader2, LogOut } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useUIStore } from '@/store/uiStore';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [favoriteVoice, setFavoriteVoice] = useState('');
    const [stats, setStats] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [userData, statsData] = await Promise.all([
                    fetchApi('/users/me'),
                    fetchApi('/progress/stats/me')
                ]);

                if (userData) {
                    setUser(userData);
                    setFullName(userData.full_name || '');
                    setBio(userData.bio || '');
                    setFavoriteVoice(userData.favorite_voice || '');
                }
                if (statsData) {
                    setStats(statsData);
                }
            } catch (err) {
                console.error("Error fetching profile data", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updatedUser = await fetchApi('/users/me', {
                method: 'PUT',
                body: JSON.stringify({
                    full_name: fullName,
                    bio: bio,
                    favorite_voice: favoriteVoice
                })
            });
            if (updatedUser) {
                setUser(updatedUser);
                useUIStore.getState().addToast('Perfil actualizado correctamente', 'success', '¡Éxito!');
            }
        } catch (err) {
            console.error("Error updating profile", err);
            useUIStore.getState().addToast('No se pudo actualizar el perfil', 'error', 'Error');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/users/me/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (resp.ok) {
                const updatedUser = await resp.json();
                setUser(updatedUser);
                useUIStore.getState().addToast('Imagen de perfil actualizada', 'success');
            } else {
                console.error("Failed to upload avatar");
                useUIStore.getState().addToast('Error al subir la imagen', 'error');
            }
        } catch (err) {
            console.error("Error uploading avatar", err);
            useUIStore.getState().addToast('Error de conexión al subir imagen', 'error');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-accent-500" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <header className="flex flex-col md:flex-row items-center gap-8 bg-primary-800/50 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/5 blur-3xl rounded-full -mr-32 -mt-32" />

                <div className="relative">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    <div
                        onClick={handleAvatarClick}
                        className="w-32 h-32 rounded-full bg-primary-700 border-4 border-white/10 flex items-center justify-center overflow-hidden group cursor-pointer relative"
                    >
                        {uploading ? (
                            <Loader2 size={32} className="animate-spin text-accent-500" />
                        ) : user?.avatar_url ? (
                            <Image
                                src={user.avatar_url}
                                alt={`Avatar de ${user.full_name || 'usuario'}`}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <User size={64} className="text-primary-300" />
                        )}
                        <button
                            aria-label="Cambiar foto de perfil"
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white z-10"
                        >
                            <Camera size={24} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-2">
                    <h1 className="text-3xl font-display font-bold text-white">Mi Perfil</h1>
                    <p className="text-primary-100/60 font-medium">Gestiona tu identidad y progreso en Corales</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                        <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 text-sm text-neutral-300">
                            <Star size={16} className="text-accent-500" />
                            {user?.role || 'Coralista'}
                        </div>
                        <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 text-sm text-neutral-300">
                            <Music size={16} className="text-primary-300" />
                            {user?.favorite_voice || 'Voz no seleccionada'}
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <section className="bg-primary-800/30 p-8 rounded-[2rem] border border-white/10 space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <User size={20} className="text-accent-500" />
                            Datos Personales
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-primary-300 uppercase tracking-widest pl-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-accent-500/50 focus:outline-none transition-all"
                                    placeholder="Escribe tu nombre..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-primary-300 uppercase tracking-widest pl-1">Biografía</label>
                                <textarea
                                    rows={4}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-accent-500/50 focus:outline-none transition-all resize-none"
                                    placeholder="Cuéntanos un poco sobre ti..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-primary-300 uppercase tracking-widest pl-1">Cuerda Vocales</label>
                                <select
                                    aria-label="Seleccionar cuerda vocal favorita"
                                    value={favoriteVoice}
                                    onChange={(e) => setFavoriteVoice(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-accent-500/50 focus:outline-none transition-all appearance-none"
                                >
                                    <option value="" disabled className="bg-primary-900">Selecciona tu voz...</option>
                                    <option value="soprano" className="bg-primary-900">Soprano</option>
                                    <option value="alto" className="bg-primary-900">Alto</option>
                                    <option value="tenor" className="bg-primary-900">Tenor</option>
                                    <option value="bajo" className="bg-primary-900">Bajo</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-accent-500 text-primary-900 font-bold hover:bg-accent-400 disabled:opacity-50 transition-all shadow-glow-accent"
                        >
                            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                            Guardar Cambios
                        </button>
                    </section>
                </div>

                <div className="space-y-8">
                    <section className="bg-primary-800/30 p-8 rounded-[2rem] border border-white/10 space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Star size={20} className="text-primary-300" />
                            Estadísticas
                        </h2>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                                <div className="text-2xl font-black text-white">
                                    {stats ? Math.round(stats.total_minutes / 60) : 0} h
                                </div>
                                <div className="text-[10px] text-primary-300 font-bold uppercase tracking-widest pl-1">Tiempo de ensayo</div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                                <div className="text-2xl font-black text-white">
                                    {stats?.works_studied || 0}
                                </div>
                                <div className="text-[10px] text-primary-300 font-bold uppercase tracking-widest pl-1">Obras estudiadas</div>
                            </div>
                            {stats?.most_practiced_work && (
                                <div className="p-4 bg-accent-500/5 rounded-2xl border border-accent-500/10 space-y-1">
                                    <div className="text-sm font-bold text-white truncate">{stats.most_practiced_work}</div>
                                    <div className="text-[10px] text-accent-500 font-bold uppercase tracking-widest pl-1">Obra más ensayada</div>
                                </div>
                            )}
                        </div>
                    </section>

                    <button className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 text-red-400 font-bold hover:bg-red-400/10 border border-white/10 transition-all">
                        <LogOut size={20} />
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
}
