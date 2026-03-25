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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="premium-card flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CheckCircle size={22} />
                </div>
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Active Products</p>
                    <div className="flex items-end gap-2 mt-0.5">
                        <h3 className="text-2xl font-bold text-foreground">{activeCount.toLocaleString()}</h3>
                        <span className="text-[11px] font-bold text-teal-600 flex items-center gap-0.5 pb-0.5">
                            <TrendingUp size={11} /> Live
                        </span>
                    </div>
                </div>
            </div>

            <div className="premium-card flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                    <AlertTriangle size={22} />
                </div>
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pending Review</p>
                    <div className="flex items-end gap-2 mt-0.5">
                        <h3 className="text-2xl font-bold text-foreground">{pendingCount.toLocaleString()}</h3>
                        <span className="pb-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">Active + Unpublished</span>
                    </div>
                </div>
            </div>

            <div className="premium-card flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
                    <Eye size={22} />
                </div>
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Published</p>
                    <div className="flex items-end gap-2 mt-0.5">
                        <h3 className="text-2xl font-bold text-foreground">{publishedCount.toLocaleString()}</h3>
                        <span className="pb-0.5 text-[11px] font-semibold text-sky-600 dark:text-sky-400">Visible to users</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
