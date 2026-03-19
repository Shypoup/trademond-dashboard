import { BilingualText } from '@data-types/api';

/**
 * Normalized shape of a company record after flattening
 * both legacy flat payloads and JSON:API-style payloads.
 */
export interface NormalizedCompany {
    id: string | number;
    name: BilingualText;
    handle: string;
    acronym: string;
    slogan: BilingualText;
    profilePhoto: string;
    active: boolean;
    published: boolean;
    searchable: boolean;
    verified: boolean;
    createdAt: string;
    location: BilingualText;
    industryId: string;
    industryName: BilingualText;
    ownerId: string;
    ownerName: string;
    ownerEmail: string;
    ranking: number | null;
    established: number | null;
    expertiseIds: string[];
}

/**
 * Shape of the company form state used by the create / edit sheet.
 */
export interface CompanyFormData {
    name: { en: string; ar: string };
    slogan: { en: string; ar: string };
    location: string;
    acronym: string;
    handle: string;
    owner_id: string;
    industry_id: string;
    expertise_ids: string[];
    established: string;
    searchable: boolean;
    active: boolean;
    published: boolean;
}

/** Default (empty) form values for creating a new company. */
export const EMPTY_COMPANY_FORM: CompanyFormData = {
    name: { en: '', ar: '' },
    slogan: { en: '', ar: '' },
    location: '',
    acronym: '',
    handle: '',
    owner_id: '',
    industry_id: '',
    expertise_ids: [],
    established: '',
    searchable: true,
    active: true,
    published: true,
};

/**
 * Safely extracts `{ en, ar }` parts from a {@link BilingualText} value.
 * When the value is a plain string it is treated as the English part.
 */
export const toBilingualParts = (val: BilingualText | undefined): { en: string; ar: string } => {
    if (!val) return { en: '', ar: '' };
    if (typeof val === 'string') return { en: val, ar: '' };
    return { en: val.en || '', ar: val.ar || '' };
};

/**
 * Normalizes a company record coming from either a flat or JSON:API-style payload.
 *
 * Supports:
 * - Legacy flat `Company` objects.
 * - New payloads where data lives under `attributes` and related info under `relationships`.
 */
export const getCompanyData = (item: unknown): NormalizedCompany => {
    const c = item as Record<string, any>;
    const attrs = c.attributes || c;
    const rels = c.relationships || {};

    return {
        id: c.id,
        name: attrs.name || c.name || { en: '', ar: '' },
        handle: attrs.handle || c.handle || '',
        acronym: attrs.acronym || c.acronym || '',
        slogan: attrs.slogan || c.slogan || { en: '', ar: '' },
        profilePhoto: attrs.profilePhoto || attrs.profile_photo || c.profilePhoto || '',
        active: attrs.active !== undefined ? attrs.active : (c.active !== undefined ? c.active : true),
        published: attrs.published !== undefined ? attrs.published : (c.published !== undefined ? c.published : true),
        searchable: attrs.searchable !== undefined ? attrs.searchable : (c.searchable !== undefined ? c.searchable : true),
        verified: attrs.verified !== undefined ? attrs.verified : (c.verified !== undefined ? c.verified : false),
        createdAt: attrs.createdAt || attrs.created_at || c.created_at || '',
        location: rels.primaryCountry?.name || c.location || '',
        industryId: rels.industry?.id || c.industry_id || '',
        industryName: rels.industry?.name || '',
        ownerId: rels.owner?.id || c.owner_id || '',
        ownerName: rels.owner?.name || '',
        ownerEmail: rels.owner?.email || '',
        ranking: attrs.ranking ?? c.ranking ?? null,
        established: attrs.established ?? c.established ?? null,
        expertiseIds: Array.isArray(rels.expertises)
            ? rels.expertises.map((e: Record<string, unknown>) => String(e.id))
            : (c.expertise_ids || []),
    };
};
