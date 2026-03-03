'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Music, CalendarDays, Users, Settings, LogOut, GraduationCap, UserCircle } from 'lucide-react';
import { logout } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const pathname = usePathname();

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const roleLabels = {
        'ADMIN': 'Administrador',
        'DIRECTOR': 'Director',
        'SUBDIRECTOR': 'Subdirector',
        'CORALISTA': 'Coralista'
    };

    // Navigation configuration
    const navItems = [
        { href: '/projects', icon: CalendarDays, label: 'Proyectos', roles: ['ADMIN', 'DIRECTOR', 'SUBDIRECTOR', 'CORALISTA'] },
        { href: '/seasons', icon: Music, label: 'Mi Repertorio', roles: ['ADMIN', 'DIRECTOR', 'SUBDIRECTOR', 'CORALISTA'] },
        { href: '/academy', icon: GraduationCap, label: 'Academia', roles: ['ADMIN', 'DIRECTOR', 'SUBDIRECTOR', 'CORALISTA'] },
        { href: '/choir/management', icon: Users, label: 'Mi Coro', roles: ['ADMIN', 'DIRECTOR', 'SUBDIRECTOR'] },
        { href: '/library', icon: GraduationCap, label: 'Biblioteca', roles: ['ADMIN', 'DIRECTOR', 'SUBDIRECTOR'] },
    ];

    const filteredNav = navItems.filter(item => user && item.roles.includes(user.role));

    return (
        <div className="flex h-screen bg-primary-900 text-white overflow-hidden">

            {/* DESKTOP SIDEBAR (Hidden on mobile) */}
            <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-primary-800">
                <div className="p-6 shrink-0">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-glow-primary">
                            <Music className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-xl font-display font-bold tracking-tight text-white">
                            CoralApp
                        </h1>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {filteredNav.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium border-l-4 ${isActive
                                    ? 'text-white bg-primary-100/10 border-accent-500'
                                    : 'text-neutral-300 hover:text-white hover:bg-white/5 border-transparent pointer-events-auto'
                                    }`}
                            >
                                <item.icon size={20} className={isActive ? 'text-accent-500' : ''} />
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-white/10 shrink-0">
                    {/* User Profile Mini-Card */}
                    <Link
                        href="/profile"
                        className="mb-4 p-3 rounded-xl bg-primary-900/50 border border-white/5 flex items-center gap-3 hover:bg-white/5 hover:border-accent-500/30 transition-all cursor-pointer group"
                    >
                        <div className="w-9 h-9 rounded-full bg-primary-700 border border-white/10 flex items-center justify-center overflow-hidden relative">
                            {user?.avatar_url ? (
                                <Image
                                    src={user.avatar_url}
                                    alt={`Avatar de ${user.full_name || 'usuario'}`}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <span className="text-xs font-bold text-primary-300">
                                    {user?.full_name ? getInitials(user.full_name) : '??'}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate group-hover:text-accent-300 transition-colors">{user?.full_name || 'Usuario'}</p>
                            <p className="text-[10px] text-neutral-300 font-medium uppercase tracking-wider">{user ? roleLabels[user.role as keyof typeof roleLabels] : '...'}</p>
                        </div>
                    </Link>

                    <Link href="/profile" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-2 font-medium ${pathname === '/profile' ? 'text-white bg-white/10' : 'text-neutral-300 hover:text-white hover:bg-white/5'}`}>
                        <UserCircle size={18} />
                        <span>Mi Perfil</span>
                    </Link>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-error hover:text-red-300 hover:bg-error/10 transition-colors font-medium"
                    >
                        <LogOut size={18} />
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
                    <div className="max-w-6xl mx-auto p-4 md:p-8">
                        {children}
                    </div>
                </div>
            </main>

            {/* MOBILE BOTTOM NAVIGATION (Hidden on desktop) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-primary-800 border-t border-white/10 pb-safe z-50">
                <div className="flex items-center justify-around px-2 py-2">
                    {filteredNav.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center w-full py-1 gap-1 transition-colors relative ${isActive ? 'text-accent-500' : 'text-neutral-300 hover:text-white'
                                    }`}
                            >
                                {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-accent-500 rounded-b-full shadow-glow-accent" />}
                                <item.icon size={24} className="mt-1" />
                                <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                            </Link>
                        )
                    })}

                    {/* Settings/Profile mobile shortcut */}
                    <Link
                        href="/profile"
                        className={`flex flex-col items-center justify-center w-full py-1 gap-1 transition-colors ${pathname.startsWith('/profile') ? 'text-accent-500' : 'text-neutral-300 hover:text-white'
                            }`}
                    >
                        <UserCircle size={24} />
                        <span className="text-[10px] font-medium">Perfil</span>
                    </Link>
                </div>
            </nav>

        </div>
    );
}
