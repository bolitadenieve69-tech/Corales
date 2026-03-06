'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Music className="w-12 h-12 text-primary-500 animate-bounce" />
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect via useEffect
    }

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
        <div className="flex h-screen bg-background text-foreground overflow-hidden">

            {/* DESKTOP SIDEBAR (Hidden on mobile) */}
            <aside className="hidden md:flex flex-col w-64 border-r border-neutral-300 bg-[var(--sidebar-background)]">
                <div className="p-6 shrink-0">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-glow-primary">
                            <Music className="text-white w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-display font-bold tracking-tight text-foreground leading-none">
                                CoralApp
                            </h1>
                            <span className="text-[10px] font-ui font-semibold uppercase tracking-widest text-primary-500 opacity-80 mt-1">
                                Director Edition
                            </span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {filteredNav.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-semibold ${isActive
                                    ? 'text-primary-500 bg-primary-100 shadow-sm'
                                    : 'text-neutral-600 hover:text-primary-500 hover:bg-neutral-100'
                                    }`}
                            >
                                <item.icon size={20} className={isActive ? 'text-primary-500' : ''} />
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-neutral-200 shrink-0">
                    {/* User Profile Mini-Card */}
                    <Link
                        href="/profile"
                        className="mb-4 p-3 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center gap-3 hover:border-primary-500 transition-all cursor-pointer group"
                    >
                        <div className="w-9 h-9 rounded-full bg-primary-100 border border-primary-500/20 flex items-center justify-center overflow-hidden relative">
                            {user?.avatar_url ? (
                                <Image
                                    src={user.avatar_url}
                                    alt={`Avatar de ${user.full_name || 'usuario'}`}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <span className="text-xs font-bold text-primary-500">
                                    {user?.full_name ? getInitials(user.full_name) : '??'}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary-500 transition-colors">{user?.full_name || 'Usuario'}</p>
                            <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider">{user ? roleLabels[user.role as keyof typeof roleLabels] : '...'}</p>
                        </div>
                    </Link>

                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-error hover:bg-error/10 transition-colors font-bold"
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
            <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-foreground text-background rounded-2xl shadow-lg border border-white/10 pb-safe z-50">
                <div className="flex items-center justify-around px-2 py-3">
                    {filteredNav.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center w-full transition-colors relative ${isActive ? 'text-primary-500' : 'text-background/60 hover:text-background'
                                    }`}
                            >
                                <item.icon size={22} />
                                <span className={`text-[9px] font-bold uppercase tracking-tighter mt-1 ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>

        </div>
    );
}
