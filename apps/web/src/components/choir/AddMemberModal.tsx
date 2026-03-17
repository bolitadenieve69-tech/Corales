import React, { useState } from 'react';
import { UserPlus, X, Loader2, Music, Phone, MapPin, Mail, CreditCard } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useUIStore } from '@/store/uiStore';

// Voices for the select
const VOICES = [
    { id: 'SOPRANO', label: 'Soprano', color: 'var(--color-voice-soprano)' },
    { id: 'ALTO', label: 'Alto', color: 'var(--color-voice-alto)' },
    { id: 'TENOR', label: 'Tenor', color: 'var(--color-voice-tenor)' },
    { id: 'BASS', label: 'Bajo', color: 'var(--color-voice-bajo)' },
];

interface AddMemberModalProps {
    choirId: string;
    onSuccess: (newMember: any) => void;
    onCancel: () => void;
}

export function AddMemberModal({ choirId, onSuccess, onCancel }: AddMemberModalProps) {
    const addToast = useUIStore((state: any) => state.addToast);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        voice_part: 'SOPRANO',
        dni: '',
        phone: '',
        has_whatsapp: false,
        address: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.full_name || !formData.email || !formData.voice_part) {
            addToast('Nombre, email y cuerda son obligatorios', 'error');
            return;
        }

        setSaving(true);
        try {
            const member = await fetchApi(`/management/${choirId}/members/add`, {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            addToast('Miembro añadido correctamente', 'success');
            onSuccess(member);
        } catch (error: any) {
            console.error('Add member error:', error);
            const msg = error.message || 'Error al añadir el miembro';
            addToast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-primary-800 rounded-3xl w-full border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-500/20 text-accent-500 flex items-center justify-center">
                        <UserPlus size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Ingresar Nuevo Miembro</h2>
                        <p className="text-xs text-neutral-400">Añade directamente a un coralista a tu coro</p>
                    </div>
                </div>
                <button
                    onClick={onCancel}
                    title="Cerrar modal"
                    className="p-2 hover:bg-white/10 rounded-xl text-neutral-400 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="p-6 overflow-y-auto hidden-scrollbar flex-1">
                <form id="add-member-form" onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Información Básica</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-neutral-400 ml-1">Nombre y Apellidos *</label>
                                <div className="relative">
                                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-accent-500 focus:outline-none"
                                        placeholder="Ej. María García"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-neutral-400 ml-1">Correo Electrónico *</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-accent-500 focus:outline-none"
                                        placeholder="maria@email.com"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-neutral-400 ml-1">Cuerda Vocal *</label>
                            <div className="relative">
                                <Music className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                                <select
                                    name="voice_part"
                                    title="Seleccionar cuerda vocal"
                                    value={formData.voice_part}
                                    onChange={handleChange}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-accent-500 focus:outline-none appearance-none"
                                >
                                    {VOICES.map(voice => (
                                        <option key={voice.id} value={voice.id} className="bg-primary-900">
                                            {voice.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-white/5" />

                    {/* Extended Info */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Datos Adicionales</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-neutral-400 ml-1">DNI / Pasaporte (Opcional)</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                                    <input
                                        type="text"
                                        name="dni"
                                        value={formData.dni}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-accent-500 focus:outline-none"
                                        placeholder="12345678X"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs text-neutral-400 ml-1">Teléfono (Opcional)</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-accent-500 focus:outline-none"
                                        placeholder="+34 600..."
                                    />
                                </div>
                            </div>
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer ml-1 mt-2">
                            <input
                                type="checkbox"
                                name="has_whatsapp"
                                checked={formData.has_whatsapp}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-white/20 text-accent-500 bg-black/20 focus:ring-accent-500 focus:ring-opacity-50"
                            />
                            <span className="text-sm font-bold text-neutral-300">¿Utiliza WhatsApp con este número?</span>
                        </label>

                        <div className="space-y-1 mt-4">
                            <label className="text-xs text-neutral-400 ml-1">Dirección Postal (Opcional)</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-4 text-neutral-500" size={16} />
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-accent-500 focus:outline-none resize-none"
                                    placeholder="Calle Sol, 12, Ciudad"
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <div className="p-6 border-t border-white/5 bg-black/20 flex gap-4 shrink-0">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-6 py-3 rounded-xl font-bold bg-white/5 text-white hover:bg-white/10 transition-colors"
                    disabled={saving}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    form="add-member-form"
                    className="flex-1 px-6 py-3 rounded-xl font-bold bg-accent-500 text-primary-900 hover:bg-accent-400 shadow-glow-accent transition-all flex items-center justify-center disabled:opacity-50"
                    disabled={saving}
                >
                    {saving ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        'Añadir Miembro'
                    )}
                </button>
            </div>
        </div>
    );
}
