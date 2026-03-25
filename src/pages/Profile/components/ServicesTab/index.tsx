import React from 'react';
import { LayoutGrid, Plus, Loader2, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ServicesTabProps } from '../../utils/types';
import { StatusBadge } from '../StatusBadge';

/**
 * Services tab listing all services for the selected company,
 * with edit, delete, and publish/retract actions.
 */
export const ServicesTab: React.FC<ServicesTabProps> = ({
    services,
    companies,
    selectedCompanyId,
    onSelectCompany,
    tabLoading,
    onToggleStatus,
    onOpenModal,
    onDelete,
}) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <h4 className="font-black text-xl text-slate-900 font-outfit tracking-tighter italic">
                        {t('profile.serviceInventory')}
                    </h4>
                    <div className="relative">
                        <select
                            value={selectedCompanyId}
                            onChange={(e) => onSelectCompany(e.target.value)}
                            className="bg-slate-100 border-none rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-teal-500 outline-none pr-8 cursor-pointer"
                        >
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>
                                    {typeof c.name === 'string' ? c.name : c.name.en}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                    </div>
                </div>
                <button
                    onClick={() => onOpenModal('service')}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-2xl text-xs font-black hover:bg-teal-600 transition-all shadow-lg active:scale-95"
                >
                    <Plus size={16} />
                    <span>{t('profile.newService')}</span>
                </button>
            </div>

            {tabLoading ? (
                <div className="premium-card p-12 flex items-center justify-center">
                    <Loader2 className="animate-spin text-teal-500" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.length === 0 ? (
                        <div className="col-span-2 premium-card p-12 text-center border-dashed border-2">
                            <p className="font-black text-slate-400 text-xs uppercase tracking-widest">
                                {t('profile.noServices')}
                            </p>
                        </div>
                    ) : services.map((service) => (
                        <div key={service.id} className="premium-card p-6 flex flex-col group relative">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-teal-50 rounded-2xl text-teal-600">
                                    <LayoutGrid size={24} />
                                </div>
                                <StatusBadge published={service.published} />
                            </div>
                            <h5 className="font-black text-slate-800 text-lg tracking-tight mb-2 truncate pr-4">
                                {typeof service.name === 'string' ? service.name : service.name.en}
                            </h5>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-4">
                                {t('profile.servicePackage')}
                            </p>
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-2 mb-6">
                                {typeof service.description === 'string'
                                    ? service.description
                                    : service.description?.en || t('profile.reliableService')}
                            </p>

                            <div className="mt-auto pt-6 border-t flex items-center justify-between">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onOpenModal('service', service.id)}
                                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(service.id)}
                                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => onToggleStatus('service', service.id)}
                                    className="text-[10px] font-black uppercase text-teal-600 bg-teal-50 px-4 py-1.5 rounded-full hover:bg-teal-100 transition-colors"
                                >
                                    {service.published ? t('profile.retract') : t('profile.publish')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
