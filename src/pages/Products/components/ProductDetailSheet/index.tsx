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
                                        <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                                            {displayBilingual(d.description) || <span className="italic text-muted-foreground/70">No narrative provided for this item.</span>}
                                        </p>

                                        {d.tags && d.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {d.tags.map((tag) => (
                                                    <Badge key={tag.id} variant="secondary" className="border-none bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground hover:bg-muted/80">
                                                        {displayBilingual(tag.name)}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-2">
                                            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-muted-foreground">
                                                <TagIcon size={12} className="text-muted-foreground" />
                                                <span className="text-[11px] font-bold">{displayBilingual(d.categoryName)}</span>
                                            </div>
                                            {d.sku && (
                                                <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-muted-foreground">
                                                    <span className="text-[10px] font-bold text-muted-foreground">SKU</span>
                                                    <span className="text-[11px] font-bold uppercase text-foreground">{d.sku}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Separator className="bg-border" />

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-muted/40 p-4">
                                            <Heart size={18} className="text-destructive" />
                                            <span className="mt-1 text-lg font-black text-foreground">{d.likesCount}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Faves</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-muted/40 p-4">
                                            <MessageSquare size={18} className="text-chart-2" />
                                            <span className="mt-1 text-lg font-black text-foreground">{d.reviewsCount}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Feed</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-muted/40 p-4">
                                            <Eye size={18} className="text-primary" />
                                            <span className="mt-1 text-lg font-black text-foreground">{d.views}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reach</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Partner Hub</h3>
                                        <div className="group flex cursor-pointer items-center justify-between rounded-3xl border border-border bg-card p-4 transition-all hover:bg-muted/60 hover:shadow-lg">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-14 w-14 border-4 border-border shadow-md">
                                                    <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayBilingual(d.companyName))}&background=0f172a&color=fff`} />
                                                    <AvatarFallback className="bg-primary text-xl font-black text-primary-foreground">{String(displayBilingual(d.companyName))[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-black leading-none text-foreground">{displayBilingual(d.companyName)}</p>
                                                    <p className="mt-1.5 flex items-center gap-1.5 text-[12px] font-bold text-primary">
                                                        <CheckCircle size={12} /> Gold Supplier
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all group-hover:bg-primary/10 group-hover:text-primary">
                                                <ExternalLink size={16} />
                                            </div>
                                        </div>
                                    </div>

                                    {(d.ownerName || d.ownerEmail) && (
                                        <div className="space-y-4">
                                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Point of Contact</h3>
                                            <div className="flex items-center gap-4 rounded-2xl border border-dashed border-border p-4">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted">
                                                    <User size={20} className="text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold leading-none text-foreground">{d.ownerName}</p>
                                                    <p className="mt-1 text-[11px] font-medium italic text-muted-foreground">{d.ownerEmail}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4 pt-4">
                                        <div className="rounded-2xl border border-border bg-muted/30 p-6 shadow-inner">
                                            <div className="mb-4 flex items-center gap-2">
                                                <AlertTriangle size={14} className="text-amber-500" />
                                                <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Internal Admin Ledger</h4>
                                            </div>
                                            <textarea
                                                rows={3}
                                                placeholder="Append audit notes or moderation logs..."
                                                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 px-2">
                                            <div className="text-[10px] font-bold uppercase leading-tight tracking-widest text-muted-foreground">
                                                Listed: <br />
                                                <span className="text-foreground">{new Date(d.createdAt).toLocaleString('en-GB')}</span>
                                            </div>
                                            <div className="text-end text-[10px] font-bold uppercase leading-tight tracking-widest text-muted-foreground">
                                                Last Update: <br />
                                                <span className="text-foreground">{new Date(d.updatedAt).toLocaleString('en-GB')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 border-t border-border bg-muted/50 p-6 backdrop-blur-md">
                                <Button
                                    variant="outline"
                                    onClick={() => onDelete(d.id)}
                                    className="h-12 flex-1 rounded-xl border-destructive/40 font-bold text-destructive transition-all hover:border-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 size={16} className="me-2" /> Scrap
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => onToggleActive(d.id)}
                                    disabled={togglingId === `active-${d.id}`}
                                    className={`h-12 flex-1 rounded-xl font-bold transition-all ${d.active ? 'border-border text-muted-foreground hover:bg-muted' : 'border-primary/40 text-primary hover:bg-primary/10'
                                        }`}
                                >
                                    {togglingId === `active-${d.id}` ? <Loader2 size={16} className="animate-spin" /> : d.active ? <ToggleLeft size={16} className="me-2" /> : <ToggleRight size={16} className="me-2" />}
                                    {d.active ? 'Halt' : 'Resume'}
                                </Button>

                                <Button
                                    onClick={() => onTogglePublished(d.id)}
                                    disabled={togglingId === `pub-${d.id}`}
                                    className={`h-12 flex-1 rounded-xl font-black shadow-lg transition-all ${d.published ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90' : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                        }`}
                                >
                                    {togglingId === `pub-${d.id}` ? <Loader2 size={16} className="animate-spin" /> : d.published ? <EyeOff size={16} className="me-2" /> : <Eye size={16} className="me-2" />}
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
