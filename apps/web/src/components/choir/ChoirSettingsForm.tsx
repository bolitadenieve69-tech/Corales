import React, { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Save, Loader2, Link2 } from 'lucide-react';
import { fetchApi, API_URL } from '@/lib/api';
import { useUIStore } from '@/store/uiStore';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';

interface ChoirSettingsFormProps {
    choirId: string;
    onUpdate?: (updatedChoir?: any) => void;
    onIdDiscovered?: (id: string) => void;
}

export function ChoirSettingsForm({ choirId, onUpdate, onIdDiscovered }: ChoirSettingsFormProps) {
    const addToast = useUIStore(state => state.addToast);
    const { refreshUser } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [hasChoir, setHasChoir] = useState(false);

    const [formData, setFormData] = useState<any>({
        name: '',
        social_address: '',
        director_name: '',
        director_phone: '',
        subdirector_name: '',
        subdirector_phone: '',
        president_name: '',
        president_phone: '',
        president_email: '',
        president_has_whatsapp: false,
        secretary_name: '',
        secretary_phone: '',
        secretary_email: '',
        secretary_has_whatsapp: false,
        treasurer_name: '',
        treasurer_phone: '',
        treasurer_email: '',
        treasurer_has_whatsapp: false,
        other_info: '',
        logo_url: '',
        cover_photo_url: ''
    });

    useEffect(() => {
        // Obtenemos los datos del coro a nivel me (current user choir)
        fetchApi('/choirs/me')
            .then(data => {
                if (data) {
                    setFormData({
                        ...formData,
                        ...data
                    });
                    setHasChoir(true);
                    if (onIdDiscovered) onIdDiscovered(data.id);
                } else {
                    setHasChoir(false);
                }
            })
            .catch(() => {
                setHasChoir(false);
            })
            .finally(() => setLoading(false));
    }, [choirId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, type, value } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData((prev: any) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Filter out empty strings to prevent schema validation errors
            const cleanData: any = {};
            for (const [key, value] of Object.entries(formData)) {
                if (value !== '') {
                    cleanData[key] = value;
                }
            }

            if (hasChoir) {
                await fetchApi('/choirs/me', {
                    method: 'PUT',
                    body: JSON.stringify(cleanData)
                });
                if (onUpdate) onUpdate(cleanData);
            } else {
                // If the user doesn't have a choir yet, create one
                const res = await fetchApi('/choirs/', {
                    method: 'POST',
                    body: JSON.stringify({
                        ...cleanData,
                        name: cleanData.name || 'Mi Coro',
                        max_users: 50,
                    })
                });
                if (res && res.id) {
                    setHasChoir(true);
                    if (onIdDiscovered) onIdDiscovered(res.id);
                    if (onUpdate) onUpdate(res);
                }
            }

            addToast('Datos del coro guardados correctamente', 'success');
            // Refresh user context to show updated name in sidebar etc
            refreshUser();
        } catch (error: any) {
            console.error(error);
            addToast(`Error guardando los datos del coro: ${error.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, assetType: 'logo' | 'cover') => {
        if (!hasChoir) {
            addToast('Por favor, guarda la información básica del coro primero', 'error');
            return;
        }

        const file = e.target.files?.[0];
        if (!file) return;

        if (assetType === 'logo') setUploadingLogo(true);
        else setUploadingCover(true);

        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('asset_type', assetType);

        try {
            // Note: Use standard fetch because fetchApi might have implicit JSON headers
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/choirs/me/upload-asset`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: uploadData
            });

            if (!res.ok) throw new Error('Upload failed');
            const updatedChoir = await res.json();

            setFormData((prev: any) => ({
                ...prev,
                logo_url: updatedChoir.logo_url,
                cover_photo_url: updatedChoir.cover_photo_url,
                updated_at: updatedChoir.updated_at
            }));

            addToast(`${assetType === 'logo' ? 'Logo' : 'Foto'} subido correctamente`, 'success');
            if (onUpdate) onUpdate();
        } catch (error) {
            addToast(`Error al subir la imagen`, 'error');
        } finally {
            if (assetType === 'logo') setUploadingLogo(false);
            else setUploadingCover(false);
        }
    };

    if (loading) return <div className="py-20 flex justify-center"><Loader2 size={32} className="animate-spin text-accent-500" /></div>;

    const renderContactBlock = (title: string, prefix: string) => (
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-lg text-primary-300 border-l-4 border-accent-500 pl-3">{title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-neutral-500 font-bold block mb-1">Nombre</label>
                    <input
                        name={`${prefix}_name`}
                        value={formData[`${prefix}_name`] || ''}
                        onChange={handleChange}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-500"
                        placeholder={`Nombre del ${title.toLowerCase()}`} />
                </div>
                <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-neutral-500 font-bold block mb-1">Email</label>
                    <input
                        name={`${prefix}_email`}
                        value={formData[`${prefix}_email`] || ''}
                        onChange={handleChange}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-500"
                        type="email"
                        placeholder={`Email del ${title.toLowerCase()}`} />
                </div>
                <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-neutral-500 font-bold block mb-1">Teléfono</label>
                    <input
                        name={`${prefix}_phone`}
                        value={formData[`${prefix}_phone`] || ''}
                        onChange={handleChange}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-500"
                        placeholder="Número de contacto" />
                </div>
                {prefix !== 'director' && prefix !== 'subdirector' && (
                    <div className="space-y-1 flex items-center pt-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name={`${prefix}_has_whatsapp`}
                                checked={formData[`${prefix}_has_whatsapp`] || false}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-white/20 text-accent-500 bg-black/20 focus:ring-accent-500 focus:ring-opacity-50" />
                            <span className="text-sm font-bold text-neutral-300 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-success inline-block"></span>
                                Tiene WhatsApp
                            </span>
                        </label>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSave} className="space-y-10 animate-in fade-in duration-500">
            {/* Cabecera / Imágenes */}
            <div className="space-y-4">
                <div className="relative h-48 w-full rounded-[2rem] bg-primary-900 border border-white/10 overflow-hidden group">
                    {formData.cover_photo_url ? (
                        <Image
                            src={`${API_URL}/choirs/me/asset/cover?t=${new Date(formData.updated_at || Date.now()).getTime()}`}
                            alt="Portada"
                            fill
                            className="object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-primary-700">
                            <ImageIcon size={64} />
                        </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                        <label className="cursor-pointer bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">
                            {uploadingCover ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                            {uploadingCover ? 'Subiendo...' : 'Cambiar Portada'}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'cover')} />
                        </label>
                    </div>
                </div>

                <div className="flex px-8 -mt-16 relative z-10 gap-6">
                    <div className="relative w-32 h-32 rounded-full border-4 border-primary-800 bg-primary-900 overflow-hidden group shadow-2xl">
                        {formData.logo_url ? (
                            <Image
                                src={`${API_URL}/choirs/me/asset/logo?t=${new Date(formData.updated_at || Date.now()).getTime()}`}
                                alt="Logo"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-primary-500">
                                <ImageIcon size={40} className="opacity-50" />
                            </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm cursor-pointer">
                            <label className="cursor-pointer text-white flex flex-col items-center gap-1 w-full h-full justify-center">
                                {uploadingLogo ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
                                <span className="text-[10px] font-bold uppercase tracking-widest">{uploadingLogo ? '...' : 'LOGO'}</span>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                            </label>
                        </div>
                    </div>
                    <div className="flex-1 self-end pt-16 pb-2">
                        <input
                            name="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b-2 border-white/10 focus:border-accent-500 px-0 py-2 text-3xl font-display font-bold text-white focus:outline-none placeholder:text-neutral-600 transition-colors"
                            placeholder="Nombre oficial del Coro"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-neutral-500 font-bold block mb-1">Dirección Social / Sede</label>
                <input
                    name="social_address"
                    value={formData.social_address || ''}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent-500"
                    placeholder="Av. de la Música, 12, Ciudad" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderContactBlock('Director', 'director')}
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <div className="p-2 bg-primary-500/20 text-primary-400 rounded-lg"><Link2 size={20} /></div>
                    <h2 className="text-2xl font-display font-bold text-white">Cargos de la Asociación</h2>
                </div>

                {renderContactBlock('Presidente/a', 'president')}
                {renderContactBlock('Secretario/a', 'secretary')}
                {renderContactBlock('Tesorero/a', 'treasurer')}
            </div>

            <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-neutral-500 font-bold block mb-1">Otros datos de interés (CIF, Cuenta Bancaria, etc.)</label>
                <textarea
                    name="other_info"
                    value={formData.other_info || ''}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent-500 resize-none"
                    placeholder="Información adicional relevante de la asociación..." />
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-accent-500 text-primary-900 px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-accent-400 transition-all shadow-glow-accent disabled:opacity-50"
                >
                    {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    {saving ? 'Guardando...' : 'Guardar Información'}
                </button>
            </div>
        </form>
    );
}
