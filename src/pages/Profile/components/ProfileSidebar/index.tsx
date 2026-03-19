import React from 'react';
import { Camera, Shield, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ProfileSidebarProps } from '../../utils/types';

/**
 * Left sidebar panel displaying user avatar, summary stats,
 * and the platform security widget.
 */
export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
    user,
    uploading,
    itemCount,
    fileInputRef,
    onAvatarClick,
    onAvatarUpload,
}) => {
    const { t } = useTranslation();

    return (
        <div className="lg:col-span-3 space-y-6">
            {/* User Summary Card */}
            <div className="premium-card p-6 flex flex-col items-center text-center relative group">
                <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-3xl border-4 border-white shadow-2xl overflow-hidden bg-slate-100 relative group-hover:rotate-2 transition-transform duration-500">
                        <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=008080&color=fff&size=128`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            alt={t('profile.avatarAlt')}
                        />
                        {uploading && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Loader2 className="text-white animate-spin" size={24} />
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onAvatarClick}
                        className="absolute -bottom-2 -right-2 bg-teal-600 text-white p-2.5 rounded-2xl shadow-xl hover:bg-teal-700 hover:scale-110 active:scale-90 transition-all border-2 border-white"
                    >
                        <Camera size={16} />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={onAvatarUpload}
                        disabled={uploading}
                    />
                </div>

                <h3 className="text-lg font-black text-slate-900 font-outfit truncate w-full px-2">
                    {user.name}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold mb-4 uppercase tracking-widest">
                    {user.role}
                </p>

                <div className="w-full grid grid-cols-2 gap-2 pt-6 border-t border-slate-50 mt-2">
                    <div className="bg-slate-50/50 p-3 rounded-2xl">
                        <p className="text-[9px] text-slate-400 font-black uppercase mb-1">
                            {t('profile.items')}
                        </p>
                        <span className="text-sm font-black text-slate-800">{itemCount}</span>
                    </div>
                    <div className="bg-slate-50/50 p-3 rounded-2xl">
                        <p className="text-[9px] text-slate-400 font-black uppercase mb-1">
                            {t('profile.reach')}
                        </p>
                        <span className="text-sm font-black text-slate-800">1.2k</span>
                    </div>
                </div>
            </div>

            {/* Security Widget */}
            <div className="premium-card p-6 bg-slate-900 text-white border-0 shadow-2xl shadow-teal-900/10 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <div className="flex items-center gap-3 text-teal-400 mb-6">
                    <Shield size={20} />
                    <h4 className="font-black text-[10px] uppercase tracking-widest">
                        {t('profile.platformSecurity')}
                    </h4>
                </div>
                <p className="text-[11px] text-slate-400 mb-6 leading-relaxed font-medium">
                    {t('profile.securityDescription')}
                </p>
                <div className="h-1 bg-white/10 rounded-full w-full overflow-hidden">
                    <div className="h-full bg-teal-500 w-[85%] rounded-full"></div>
                </div>
                <p className="text-[9px] text-slate-500 mt-3 font-bold uppercase tracking-tighter">
                    {t('profile.securityScore')}
                </p>
            </div>
        </div>
    );
};
