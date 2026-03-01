import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Settings,
    LogOut,
    ShieldCheck,
    FileText,
    CreditCard,
    Database,
    HelpCircle,
    Briefcase,
    Boxes,
    ClipboardList
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { label: 'General', type: 'label' },
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Users & Access', icon: Users, path: '/users' },
    { label: 'Companies', icon: Briefcase, path: '/companies' },
    {
        label: 'Listings', icon: Boxes, path: '/listings',
        children: [
            { label: 'Products', path: '/products' },
            { label: 'Services', path: '/services' },
            { label: 'Categories', path: '/categories' }
        ]
    },
    { label: 'Governance', type: 'label' },
    { label: 'Moderation', icon: ShieldCheck, path: '/moderation', badge: 12 },
    { label: 'Payments', icon: CreditCard, path: '/payments' },
    { label: 'CMS', icon: FileText, path: '/cms' },
    { label: 'Infrastructure', type: 'label' },
    { label: 'System', icon: Database, path: '/system' },
    { label: 'Support Tickets', icon: HelpCircle, path: '/support', badge: 5 },
];

const Sidebar = () => {
    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0a2525] text-slate-300 border-r border-[#0e3131] flex flex-col z-50">
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#008080] rounded-xl flex items-center justify-center">
                    <ShieldCheck className="text-white" size={24} />
                </div>
                <div>
                    <h1 className="text-white font-bold leading-none tracking-tight">Trademond</h1>
                    <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Super Admin</span>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {navItems.map((item, idx) => {
                    if (item.type === 'label') {
                        return (
                            <div key={idx} className="mt-6 mb-2 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                {item.label}
                            </div>
                        );
                    }

                    const Icon = item.icon!;
                    return (
                        <div key={idx}>
                            <NavLink
                                to={item.path!}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium",
                                    isActive
                                        ? "bg-[#008080]/10 text-teal-400 border border-[#008080]/20"
                                        : "hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <Icon size={18} className={cn("transition-colors", "group-hover:text-teal-400")} />
                                <span className="flex-1">{item.label}</span>
                                {item.badge && (
                                    <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                        {item.badge}
                                    </span>
                                )}
                            </NavLink>
                            {item.children && (
                                <div className="ml-9 mt-1 space-y-1">
                                    {item.children.map((child, cIdx) => (
                                        <NavLink
                                            key={cIdx}
                                            to={child.path}
                                            className={({ isActive }) => cn(
                                                "block px-3 py-1.5 rounded-lg text-[13px] transition-colors",
                                                isActive ? "text-teal-400 font-medium" : "text-slate-500 hover:text-slate-300"
                                            )}
                                        >
                                            {child.label}
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            <div className="p-4 mt-auto border-t border-[#0e3131]">
                <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all">
                    <Settings size={18} />
                    <span>Settings</span>
                </button>
                <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all">
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>

            <div className="p-4 bg-[#0d2e2e] m-4 rounded-2xl flex items-center gap-3 border border-white/5">
                <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-white/10">
                    <img src="https://ui-avatars.com/api/?name=Alex+Rivera&background=008080&color=fff" alt="User" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">Alex Rivera</p>
                    <p className="text-[10px] text-slate-500 truncate">System Admin</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
