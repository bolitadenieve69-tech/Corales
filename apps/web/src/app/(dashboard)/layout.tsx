import Link from 'next/link';
import { Music, CalendarDays, Users, Settings, LogOut } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[#050511] text-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-[#0a0a1a] flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                        Corales
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <Link href="/projects" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-500/10 text-blue-400 font-medium transition-colors">
                        <CalendarDays size={18} />
                        <span>Proyectos</span>
                    </Link>
                    <Link href="/choir" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                        <Users size={18} />
                        <span>Mi Coro</span>
                    </Link>
                    <Link href="/library" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                        <Music size={18} />
                        <span>Biblioteca</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors mb-2">
                        <Settings size={18} />
                        <span>Ajustes</span>
                    </Link>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors">
                        <LogOut size={18} />
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
