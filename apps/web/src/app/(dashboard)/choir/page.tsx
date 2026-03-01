'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Users, Music, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ChoirPage() {
    const [choirName, setChoirName] = useState('Coro Principal');

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Nav */}
            <div className="flex items-center gap-4">
                <Link href="/projects" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Mi Coro</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Logo Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#0a0a1a] border border-white/10 rounded-2xl p-8 flex flex-col items-center">
                        <div className="relative group cursor-pointer">
                            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-2 border-dashed border-white/20 flex items-center justify-center group-hover:border-blue-500/50 transition-all overflow-hidden">
                                <Camera className="text-slate-500 group-hover:text-blue-400 transition-colors" size={32} />
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-opacity">
                                <span className="text-xs font-medium">Cambiar Logo</span>
                            </div>
                        </div>
                        <h2 className="mt-6 text-xl font-semibold">{choirName}</h2>
                        <p className="text-slate-500 text-sm mt-1">Sede Central</p>
                    </div>

                    <div className="bg-[#0a0a1a] border border-white/10 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Coralistas</span>
                            <span className="font-medium">42</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Proyectos Activos</span>
                            <span className="font-medium">3</span>
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#0a0a1a] border border-white/10 rounded-2xl p-8">
                        <h3 className="text-xl font-semibold mb-6">Información General</h3>
                        <form className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="choir-name" className="text-sm font-medium text-slate-400">Nombre del Coro</label>
                                <input
                                    id="choir-name"
                                    type="text"
                                    placeholder="Nombre de tu coro"
                                    value={choirName}
                                    onChange={(e) => setChoirName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="city" className="text-sm font-medium text-slate-400">Ciudad</label>
                                    <input
                                        id="city"
                                        type="text"
                                        placeholder="Ej. Madrid"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="foundation-year" className="text-sm font-medium text-slate-400">Fundación</label>
                                    <input
                                        id="foundation-year"
                                        type="number"
                                        placeholder="2010"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                            </div>
                            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20">
                                <Save size={18} /> Guardar Cambios
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
