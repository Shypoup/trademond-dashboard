import React from 'react';
import { Briefcase, Plus, Loader2, Globe, Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CompaniesTabProps } from '../../utils/types';
import { StatusBadge } from '../StatusBadge';

/**
 * Companies tab listing all owned company entities
 * with visibility toggle, edit, and delete actions.
 */
export const CompaniesTab: React.FC<CompaniesTabProps> = ({
    companies,
    tabLoading,
    onToggleStatus,
    onOpenModal,
    onDelete,
}) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between">
                <h4 className="font-black text-xl text-slate-900 font-outfit tracking-tighter italic">
                    {t('profile.ownedEntities')}
                </h4>
                <button
                    onClick={() => onOpenModal('company')}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-2xl text-xs font-black hover:bg-teal-600 transition-all shadow-lg active:scale-95"
                >
                    <Plus size={16} />
                    <span>{t('profile.newCompany')}</span>
                </button>
            </div>

            {tabLoading ? (
                <div className="premium-card p-12 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-teal-500" size={32} />
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                            {t('profile.fetchingAssets')}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {companies.length === 0 ? (
                        <div className="col-span-2 premium-card p-12 text-center border-dashed border-2">
                            <Briefcase size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="font-bold text-slate-400">{t('profile.noCompanies')}</p>
                        </div>
                    ) : companies.map((company) => (
                        <div key={company.id} className="premium-card group hover:scale-[1.01] transition-all duration-300 flex flex-col">
                            <div className="p-6 flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:border-teal-200 transition-colors overflow-hidden">
                                        {company.profilePhoto ? (
                                            <img src={company.profilePhoto} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <Briefcase className="text-slate-400" size={24} />
                                        )}
                                    </div>
                                    <div>
                                        <h5 className="font-black text-slate-800 tracking-tight">
                                            {typeof company.name === 'string' ? company.name : company.name.en}
                                        </h5>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                            {company.location || t('profile.globalOperations')}
                                        </p>
                                    </div>
                                </div>
                                <StatusBadge published={company.published} />
                            </div>
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 grid grid-cols-3 gap-1 rounded-b-3xl mt-auto">
                                <button
                                    onClick={() => onToggleStatus('company', company.id)}
                                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-white transition-all group/btn"
                                >
                                    <Globe size={14} className="group-hover/btn:animate-pulse" />
                                    <span className="text-[9px] font-black uppercase">{t('profile.visibility')}</span>
                                </button>
                                <button
                                    onClick={() => onOpenModal('company', company.id)}
                                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-white transition-all group/btn"
                                >
                                    <Edit2 size={14} />
                                    <span className="text-[9px] font-black uppercase">{t('common.edit')}</span>
                                </button>
                                <button
                                    onClick={() => onDelete(company.id)}
                                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-white transition-all group/btn"
                                >
                                    <Trash2 size={14} />
                                    <span className="text-[9px] font-black uppercase">{t('profile.purge')}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
