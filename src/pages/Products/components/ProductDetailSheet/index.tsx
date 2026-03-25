import React from 'react';
import {
    Trash2,
    Loader2,
    ToggleLeft,
    ToggleRight,
    Eye,
    EyeOff,
    ExternalLink,
    Tag as TagIcon,
    User,
    Heart,
    MessageSquare,
    AlertTriangle,
    CheckCircle,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Product } from '@data-types/api';
import { displayBilingual, formatCurrency } from '@utils/ui';
import { getProductData, getStatus } from '../../utils/productHelpers';

/**
 * Props for the ProductDetailSheet component.
 */
export interface ProductDetailSheetProps {
    /** The product to display, or null when closed */
    product: Product | null;
    /** Callback to close the sheet */
    onClose: () => void;
    /** ID of the product currently being toggled (e.g. "active-123") */
    togglingId: string | null;
    /** Callback to initiate product deletion */
    onDelete: (id: string | number) => void;
    /** Callback to toggle active status */
    onToggleActive: (id: string | number) => void;
    /** Callback to toggle published status */
    onTogglePublished: (id: string | number) => void;
}

/**
 * Detail drawer sheet that shows comprehensive product information,
 * engagement stats, company card, owner info, and admin actions.
 */
export const ProductDetailSheet: React.FC<ProductDetailSheetProps> = ({
    product,
    onClose,
    togglingId,
    onDelete,
    onToggleActive,
    onTogglePublished,
}) => {
    return (
        <Sheet open={!!product} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="p-0 sm:max-w-md w-full max-h-screen overflow-y-auto border-none shadow-2xl flex flex-col">
                {product && (() => {
                    const d = getProductData(product);
                    const status = getStatus(d);
                    return (
                        <>
                            <div className="relative h-64 shrink-0 overflow-hidden bg-slate-900">
                                <img
                                    src={d.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayBilingual(d.name))}&background=1e293b&color=94a3b8&size=500`}
                                    alt={displayBilingual(d.name)}
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-black/20 pointer-events-none" />

                                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <Badge className={`${status.bg} ${status.text} border-white/20 backdrop-blur-md px-3 py-1 font-black text-[10px] uppercase tracking-wider`}>
                                            {status.label === 'Pending' ? 'Needs Review' : status.label}
                                        </Badge>
                                        {d.premium && (
                                            <Badge className="bg-amber-100 text-amber-700 border-white/20 backdrop-blur-md px-3 py-1 font-black text-[10px] uppercase tracking-wider">
                                                Premium
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-black text-white leading-tight font-outfit drop-shadow-lg">
                                            {displayBilingual(d.name)}
                                        </h2>
                                        {(d.name as any)?.ar && <p className="text-white/70 text-sm mt-1 font-medium drop-shadow-md" dir="rtl">{(d.name as any).ar}</p>}
                                    </div>
                                    {d.price !== null && d.price !== undefined && (
                                        <div className="bg-teal-500 text-white px-4 py-2 rounded-2xl shadow-xl border border-teal-400/50 backdrop-blur-md">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Price</p>
                                            <p className="text-xl font-black leading-none mt-1">{formatCurrency(d.price)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto premium-scrollbar">
                                <div className="p-8 space-y-8">
                                    <div className="space-y-4">
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                            {displayBilingual(d.description) || <span className="italic text-slate-300">No narrative provided for this item.</span>}
                                        </p>

                                        {d.tags && d.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {d.tags.map((tag) => (
                                                    <Badge key={tag.id} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none px-2 py-0.5 text-[10px] font-bold">
                                                        {displayBilingual(tag.name)}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-2">
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-slate-500 border border-slate-100">
                                                <TagIcon size={12} className="text-slate-400" />
                                                <span className="text-[11px] font-bold">{displayBilingual(d.categoryName)}</span>
                                            </div>
                                            {d.sku && (
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-slate-500 border border-slate-100">
                                                    <span className="text-[10px] font-bold text-slate-400">SKU</span>
                                                    <span className="text-[11px] font-bold text-slate-700 uppercase">{d.sku}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Separator className="bg-slate-100" />

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100/50 flex flex-col items-center gap-1">
                                            <Heart size={18} className="text-rose-500" />
                                            <span className="text-lg font-black text-slate-900 mt-1">{d.likesCount}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Faves</span>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50 flex flex-col items-center gap-1">
                                            <MessageSquare size={18} className="text-blue-500" />
                                            <span className="text-lg font-black text-slate-900 mt-1">{d.reviewsCount}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Feed</span>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100/50 flex flex-col items-center gap-1">
                                            <Eye size={18} className="text-teal-500" />
                                            <span className="text-lg font-black text-slate-900 mt-1">{d.views}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reach</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Partner Hub</h3>
                                        <div className="group flex items-center justify-between p-4 rounded-3xl border border-slate-100 bg-white/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="w-14 h-14 border-4 border-white shadow-lg shadow-slate-200">
                                                    <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayBilingual(d.companyName))}&background=0f172a&color=fff`} />
                                                    <AvatarFallback className="bg-teal-600 text-white font-black text-xl">{String(displayBilingual(d.companyName))[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 leading-none">{displayBilingual(d.companyName)}</p>
                                                    <p className="text-[12px] text-teal-600 font-bold mt-1.5 flex items-center gap-1.5">
                                                        <CheckCircle size={12} /> Gold Supplier
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-teal-50 group-hover:text-teal-600 transition-all">
                                                <ExternalLink size={16} />
                                            </div>
                                        </div>
                                    </div>

                                    {(d.ownerName || d.ownerEmail) && (
                                        <div className="space-y-4">
                                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Point of Contact</h3>
                                            <div className="flex items-center gap-4 p-4 rounded-2xl border border-dashed border-slate-200">
                                                <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                    <User size={20} className="text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800 leading-none">{d.ownerName}</p>
                                                    <p className="text-[11px] text-slate-500 mt-1 font-medium italic">{d.ownerEmail}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 space-y-4">
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 shadow-inner">
                                            <div className="flex items-center gap-2 mb-4">
                                                <AlertTriangle size={14} className="text-amber-500" />
                                                <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Internal Admin Ledger</h4>
                                            </div>
                                            <textarea
                                                rows={3}
                                                placeholder="Append audit notes or moderation logs..."
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 resize-none focus:outline-none focus:border-teal-400 focus:shadow-[0_0_0_4px_rgba(20,184,166,0.1)] transition-all font-medium"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 px-2">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                                                Listed: <br />
                                                <span className="text-slate-600">{new Date(d.createdAt).toLocaleString('en-GB')}</span>
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight text-right">
                                                Last Update: <br />
                                                <span className="text-slate-600">{new Date(d.updatedAt).toLocaleString('en-GB')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t bg-slate-50/80 backdrop-blur-md flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => onDelete(d.id)}
                                    className="flex-1 h-12 rounded-xl border-rose-200 text-rose-600 font-bold hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-all"
                                >
                                    <Trash2 size={16} className="mr-2" /> Scrap
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => onToggleActive(d.id)}
                                    disabled={togglingId === `active-${d.id}`}
                                    className={`flex-1 h-12 rounded-xl font-bold transition-all ${d.active ? 'border-slate-200 text-slate-600 hover:bg-white' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                        }`}
                                >
                                    {togglingId === `active-${d.id}` ? <Loader2 size={16} className="animate-spin" /> : d.active ? <ToggleLeft size={16} className="mr-2" /> : <ToggleRight size={16} className="mr-2" />}
                                    {d.active ? 'Halt' : 'Resume'}
                                </Button>

                                <Button
                                    onClick={() => onTogglePublished(d.id)}
                                    disabled={togglingId === `pub-${d.id}`}
                                    className={`flex-1 h-12 rounded-xl font-black transition-all shadow-lg ${d.published ? 'bg-slate-800 hover:bg-slate-700' : 'bg-primary hover:bg-primary/90'
                                        } text-primary-foreground`}
                                >
                                    {togglingId === `pub-${d.id}` ? <Loader2 size={16} className="animate-spin" /> : d.published ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
                                    {d.published ? 'Retract' : 'Broadcast'}
                                </Button>
                            </div>
                        </>
                    );
                })()}
            </SheetContent>
        </Sheet>
    );
};
