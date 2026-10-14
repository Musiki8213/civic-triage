// components/layout/DashboardLayout.tsx
'use client';

import { Search, Map, LayoutDashboard, FilePlus, AlertTriangle, BarChart3, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">CT</div>
                        <span className="font-semibold text-lg tracking-tight">CivicTriage</span>
                    </div>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    <NavItem href="/" icon={<LayoutDashboard size={18} />} label="Overview" active={pathname === '/'} />
                    <NavItem href="/log-complaint" icon={<FilePlus size={18} />} label="Log New Complaint" active={pathname === '/log-complaint'} />
                    <NavItem href="/queue" icon={<AlertTriangle size={18} />} label="Complaint Queue" active={pathname === '/queue'} />
                    <NavItem href="/map" icon={<Map size={18} />} label="Map View" active={pathname === '/map'} />
                    <NavItem href="/reports" icon={<BarChart3 size={18} />} label="Reports & Analytics" active={pathname === '/reports'} />
                </nav>

                <div className="p-4 border-t border-slate-200">
                    <NavItem href="/settings" icon={<Settings size={18} />} label="Settings" active={pathname === '/settings'} />
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
                    <div className="flex items-center bg-slate-100 rounded-md px-3 py-1.5 w-96">
                        <Search size={16} className="text-slate-400 mr-2" />
                        <input type="text" placeholder="Search complaint ID, location..." className="bg-transparent border-none outline-none text-sm w-full" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium">
                            MS
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <Link href={href} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? 'bg-blue-100 text-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
            {icon}
            {label}
        </Link>
    );
}