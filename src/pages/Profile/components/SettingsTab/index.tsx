import React from 'react';
import {
    User,
    Mail,
    Phone,
    Briefcase,
    Save,
    Trash2,
    Loader2,
    Settings as SettingsIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SettingsTabProps } from '../../utils/types';

/**
 * Personal identity / account settings form.
 * Allows editing name, phone, and job title. Email is read-only.
 */
export const SettingsTab: React.FC<SettingsTabProps> = ({
    formData,
    formSaving,
    onChange,
    onSubmit,
}) => {
    const { t } = useTranslation();

    return (
        <div className="premium-card animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div>
                    <h4 className="font-black text-xl text-slate-800 font-outfit italic tracking-tighter">
                        {t('profile.personalIdentity')}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-widest leading-none">
                        {t('profile.globalMetadata')}
                    </p>
                </div>
                <div className="p-3 bg-teal-50 rounded-2xl text-teal-600">
                    <SettingsIcon size={24} />
                </div>
            </div>

            <form onSubmit={onSubmit} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Full Name */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            {t('profile.fullName')}
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={onChange}
                                className="w-full h-14 pl-12 pr-4 bg-slate-50/50 border border-slate-100 focus:border-teal-400 rounded-2xl text-sm font-black outline-none transition-all shadow-inner focus:bg-white"
                                placeholder={t('profile.namePlaceholder')}
                            />
                        </div>
                    </div>

                    {/* Email (read-only) */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            {t('profile.authEmail')}
                        </label>
                        <div className="relative opacity-60">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                value={formData.email}
                                className="w-full h-14 pl-12 pr-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-black outline-none cursor-not-allowed"
                                readOnly
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            {t('profile.primaryPhone')}
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors">
                                <Phone size={18} />
                            </div>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={onChange}
                                className="w-full h-14 pl-12 pr-4 bg-slate-50/50 border border-slate-100 focus:border-teal-400 rounded-2xl text-sm font-black outline-none transition-all shadow-inner focus:bg-white"
                                placeholder="+00 (0) 000 000"
                            />
                        </div>
                    </div>

                    {/* Job Title */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            {t('profile.jobTitle')}
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-500 transition-colors">
                                <Briefcase size={18} />
                            </div>
                            <input
                                type="text"
                                name="jobTitle"
                                value={formData.jobTitle}
                                onChange={onChange}
                                className="w-full h-14 pl-12 pr-4 bg-slate-50/50 border border-slate-100 focus:border-teal-400 rounded-2xl text-sm font-black outline-none transition-all shadow-inner focus:bg-white"
                                placeholder={t('profile.jobTitlePlaceholder')}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-rose-500 hover:text-rose-600 transition-colors cursor-pointer p-2 opacity-50 hover:opacity-100">
                        <Trash2 size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {t('profile.deleteAdmin')}
                        </span>
                    </div>
                    <button
                        type="submit"
                        disabled={formSaving}
                        className="flex items-center gap-3 px-12 py-3.5 bg-slate-900 rounded-2xl text-sm font-black text-white hover:bg-teal-600 transition-all shadow-2xl shadow-teal-900/20 active:scale-95 disabled:opacity-50"
                    >
                        {formSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        <span>{t('profile.syncProfile')}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};
