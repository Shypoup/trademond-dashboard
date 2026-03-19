import React from 'react';
import { CheckCircle, TrendingUp, AlertTriangle, Eye } from 'lucide-react';

/**
 * Props for the ProductStatsCards component.
 */
export interface ProductStatsCardsProps {
    /** Number of active products */
    activeCount: number;
    /** Number of pending review products */
    pendingCount: number;
    /** Number of published products */
    publishedCount: number;
}

/**
 * Three stat cards showing active, pending, and published product counts.
 */
export const ProductStatsCards: React.FC<ProductStatsCardsProps> = ({
    activeCount,
    pendingCount,
    publishedCount,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                    <CheckCircle className="text-teal-600" size={22} />
                </div>
                <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Products</p>
                    <div className="flex items-end gap-2 mt-0.5">
                        <h3 className="text-2xl font-bold text-slate-900">{activeCount.toLocaleString()}</h3>
                        <span className="text-[11px] font-bold text-teal-600 flex items-center gap-0.5 pb-0.5">
                            <TrendingUp size={11} /> Live
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <AlertTriangle className="text-amber-500" size={22} />
                </div>
                <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pending Review</p>
                    <div className="flex items-end gap-2 mt-0.5">
                        <h3 className="text-2xl font-bold text-slate-900">{pendingCount.toLocaleString()}</h3>
                        <span className="text-[11px] font-semibold text-amber-500 pb-0.5">Active + Unpublished</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                    <Eye className="text-sky-500" size={22} />
                </div>
                <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Published</p>
                    <div className="flex items-end gap-2 mt-0.5">
                        <h3 className="text-2xl font-bold text-slate-900">{publishedCount.toLocaleString()}</h3>
                        <span className="text-[11px] font-semibold text-sky-500 pb-0.5">Visible to users</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
