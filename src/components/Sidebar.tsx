import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
    ClipboardList,
    Layers,
    List,
    Beaker,
    Star,
    DollarSign,
    Heart,
    Network,
    HardDrive,
    Search,
    Download
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { authService } from '../services/authService';

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
            { label: 'Tags', path: '/tags' },
            { label: 'Tag Proposals', path: '/tag-proposals' }
        ]
    },
    { label: 'Engagement', type: 'label' },
    { label: 'Moderation', icon: ShieldCheck, path: '/moderation', badge: 12 },
    { label: 'Reviews', icon: Star, path: '/reviews' },
    { label: 'Follows Graph', icon: Network, path: '/follows' },
    { label: 'Likes Metrics', icon: Heart, path: '/likes' },
    { label: 'Monetization', type: 'label' },
    { label: 'Plans & Pricing', icon: DollarSign, path: '/plans' },
    { label: 'Global Features', icon: Layers, path: '/features' },
    { label: 'Subscriptions', icon: ClipboardList, path: '/subscriptions' },
    { label: 'Per-Entity Bypasses', icon: Settings, path: '/feature-overrides' },
    { label: 'System Entitlements', icon: Layers, path: '/entitlements' },
    { label: 'Keyword Sponsored', icon: Star, path: '/sponsorships' },
    { label: 'Platform Settings', type: 'label' },
    { label: 'Curated Content', icon: List, path: '/curated-lists' },
    { label: 'A/B Experiments', icon: Beaker, path: '/experiments' },
    { label: 'Platform Settings', icon: Settings, path: '/settings' },
    { label: 'System APIs', type: 'label' },
    { label: 'Search Re-indexer', icon: Search, path: '/search' },
    { label: 'Media Store', icon: HardDrive, path: '/media' },
    { label: 'Data Imports (*.xlsx)', icon: Download, path: '/imports' },
];

const Sidebar = () => {
    const navigate = useNavigate();
    const [user, setUser] = React.useState<any>(null);

    React.useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await authService.getProfile();
                setUser(profile);
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

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
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>

            <NavLink
                to="/profile"
                className={({ isActive }) => cn(
                    "p-4 m-4 rounded-2xl flex items-center gap-3 border transition-all cursor-pointer",
                    isActive ? "bg-[#008080]/20 border-[#008080]/40" : "bg-[#0d2e2e] border-white/5 hover:border-white/10 hover:bg-[#113a3a]"
                )}
            >
                <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-white/10">
                    <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=008080&color=fff`} alt="User" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{user?.name || 'Admin'}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.email || 'System Admin'}</p>
                </div>
            </NavLink>
        </aside>
    );
};

export default Sidebar;
