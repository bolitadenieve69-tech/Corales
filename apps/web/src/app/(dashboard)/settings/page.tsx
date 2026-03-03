'use client';

import { motion } from 'framer-motion';
import { Settings, Bell, Lock, Globe, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function SettingsPage() {
    const { user } = useAuth();

    // Get initials for profile picture
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const roleLabels = {
        'ADMIN': 'Administrador',
        'DIRECTOR': 'Director',
        'SUBDIRECTOR': 'Subdirector',
        'CORALISTA': 'Coralista'
    };
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/projects" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-white">Ajustes</h1>
            </div>

            <div className="max-w-4xl space-y-6">
                {/* Profile Card */}
                <div className="bg-primary-800 border border-white/10 rounded-2xl p-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-2xl font-bold">
                            {user?.full_name ? getInitials(user.full_name) : '??'}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">{user ? roleLabels[user.role] : 'Cargando...'}</h2>
                            <p className="text-neutral-300">{user?.email || 'email@ejemplo.com'}</p>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors border border-white/10">
                        Editar Perfil
                    </button>
                </div>

                {/* Settings list */}
                <div className="bg-primary-800 border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
                    <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary-500/10 rounded-lg text-primary-300 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                                <Bell size={20} />
                            </div>
                            <div>
                                <h4 className="font-medium">Notificaciones</h4>
                                <p className="text-sm text-neutral-600">Configura avisos de ensayos y cambios.</p>
                            </div>
                        </div>
                        <div className="w-10 h-6 bg-primary-500 rounded-full relative">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                        </div>
                    </div>

                    <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-accent-500/10 rounded-lg text-accent-300 group-hover:bg-accent-500 group-hover:text-white transition-colors">
                                <Lock size={20} />
                            </div>
                            <div>
                                <h4 className="font-medium">Seguridad</h4>
                                <p className="text-sm text-neutral-600">Cambiar contraseña y accesos.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-primary-300 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                <Globe size={20} />
                            </div>
                            <div>
                                <h4 className="font-medium">Idioma</h4>
                                <p className="text-sm text-neutral-600">Español (España)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
