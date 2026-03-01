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
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Music className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-white">
                            Corales
                        </h1>
                    </div>
                    {/* Choir Logo Placeholder */}
                    <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 group cursor-pointer hover:bg-white/10 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-blue-400">
                            CP
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">Coro Principal</p>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Director</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4">
                    <Link href="/projects" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
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
