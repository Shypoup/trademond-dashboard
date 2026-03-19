import { BilingualText } from '@data-types/api';

/**
 * Normalized product data extracted from json:api or flat API response.
 */
export interface ProductData {
    id: string | number;
    name: BilingualText;
    description: BilingualText;
    image: string;
    active: boolean;
    published: boolean;
    searchable: boolean;
    createdAt: string;
    updatedAt: string;
    companyId: string | number;
    companyName: BilingualText;
    categoryId: string | number;
    categoryName: BilingualText;
    ownerName: string;
    ownerEmail: string;
    tags: Array<{ id: string; name: BilingualText }>;
    reviewsCount: number;
    likesCount: number;
    views: number;
    price: number | string | null;
    sku: string;
    premium: boolean;
}

/**
 * Status badge display properties for a product.
 */
export interface ProductStatus {
    label: string;
    dot: string;
    text: string;
    bg: string;
}

/**
 * Form data shape for creating or editing a product.
 */
export interface ProductFormData {
    name: { en: string; ar: string };
    description: { en: string; ar: string };
    company_id: string;
    category_id: string;
    price: string;
    sku: string;
    active: boolean;
    published: boolean;
    tags: string[];
}

/**
 * Extracts nested json:api fields or falls back to flat struct for a product item.
 */
export const getProductData = (item: unknown): ProductData => {
    const p = item as Record<string, any>;
    const attrs = p.attributes || p;
    const rels = p.relationships || {};
    const meta = p.meta || {};

    const active = attrs.active !== undefined ? attrs.active : (p.active !== undefined ? p.active : true);
    const published = attrs.published !== undefined ? attrs.published : p.published;

    return {
        id: p.id,
        name: attrs.name || p.name || { en: '', ar: '' },
        description: attrs.description || p.description || { en: '', ar: '' },
        image: attrs.profilePhoto || p.profilePhoto || p.image || '',
        active,
        published,
        searchable: attrs.searchable !== undefined ? attrs.searchable : p.searchable,
        createdAt: attrs.createdAt || attrs.created_at || p.created_at || '',
        updatedAt: attrs.updatedAt || attrs.updated_at || p.updated_at || attrs.createdAt || '',
        companyId: rels.company?.id || p.company_id || p.company?.id || '',
        companyName: rels.company?.name || p.company?.name || p.company || 'N/A',
        categoryId: rels.category?.id || p.category_id || p.category?.id || '',
        categoryName: rels.category?.name || p.category?.name || p.category || 'N/A',
        ownerName: rels.owner?.name || p.owner?.name || '',
        ownerEmail: rels.owner?.email || p.owner?.email || '',
        tags: (rels.tags || p.tags || []) as Array<{ id: string; name: BilingualText }>,
        reviewsCount: meta.reviewsCount ?? p.reviewsCount ?? 0,
        likesCount: meta.likesCount ?? p.likesCount ?? 0,
        views: attrs.views ?? meta.viewsCount ?? p.views ?? 0,
        price: attrs.price ?? p.price ?? null,
        sku: attrs.sku ?? p.sku ?? '',
        premium: attrs.premium ?? p.premium ?? false,
    };
};

/**
 * Computes status display info based on active and published flags.
 */
export const getStatus = (data: ProductData): ProductStatus => {
    if (data.active && data.published) return { label: 'Approved', dot: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (data.active && !data.published) return { label: 'Pending', dot: 'bg-amber-400', text: 'text-amber-600', bg: 'bg-amber-50' };
    if (!data.active && data.published) return { label: 'Suspended', dot: 'bg-slate-400', text: 'text-slate-500', bg: 'bg-slate-50' };
    return { label: 'Rejected', dot: 'bg-rose-500', text: 'text-rose-600', bg: 'bg-rose-50' };
};

/**
 * Returns a human-readable relative time string from a date string.
 */
export const timeAgo = (dateStr: string): string => {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

/** Available rows-per-page options for pagination. */
export const ROWS_OPTIONS = [10, 25, 50] as const;

/**
 * Normalizes raw company API data into `{ id, name }` entities.
 */
export const extractCompaniesData = (data: unknown[]): Array<{ id: string | number; name: BilingualText }> => {
    if (!Array.isArray(data)) return [];
    return data.map((c: any) => {
        const attrs = c.attributes || c;
        return { id: c.id || attrs.id, name: attrs.name || c.name || '' };
    });
};

/**
 * Normalizes raw category API data into `{ id, name }` entities.
 */
export const extractCategoriesData = (data: unknown[]): Array<{ id: string | number; name: BilingualText }> => {
    if (!Array.isArray(data)) return [];
    return data.map((c: any) => {
        const attrs = c.attributes || c;
        return { id: c.id || attrs.id, name: attrs.name || c.name || '' };
    });
};
