import React from 'react';
import { User, Briefcase, Boxes, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@utils/core/cn';
import type { TabType, TabDescriptor } from '../../utils/types';

/** Props for the ProfileTabBar component */
interface ProfileTabBarProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

/** Tab configuration with translation keys and icons */
const TABS: TabDescriptor[] = [
    { id: 'settings', labelKey: 'profile.tabIdentity', icon: User },
    { id: 'companies', labelKey: 'profile.tabCompanies', icon: Briefcase },
    { id: 'products', labelKey: 'profile.tabProducts', icon: Boxes },
    { id: 'services', labelKey: 'profile.tabServices', icon: LayoutGrid },
];

/**
 * Glassmorphism-styled tab bar for switching between Profile sections.
 */
export const ProfileTabBar: React.FC<ProfileTabBarProps> = ({ activeTab, onTabChange }) => {
    const { t } = useTranslation();

    return (
        <div className="flex bg-slate-100/80 backdrop-blur p-1.5 rounded-2xl border border-white/50 shadow-inner">
            {TABS.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all",
                        activeTab === tab.id
                            ? "bg-white text-teal-600 shadow-md transform scale-[1.02]"
                            : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                    )}
                >
                    <tab.icon
                        size={16}
                        className={cn(activeTab === tab.id ? "text-teal-500" : "opacity-40")}
                    />
                    <span>{t(tab.labelKey)}</span>
                </button>
            ))}
        </div>
    );
};
