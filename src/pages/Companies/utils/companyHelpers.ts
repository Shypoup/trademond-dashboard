import { BilingualText } from '@data-types/api';

/**
 * Coerces JSON/API boolean-like values to a strict boolean for form controls.
 *
 * @param value - Raw value from flat attributes or JSON payloads.
 * @param defaultValue - Used when `value` is `null` or `undefined`.
 */
export const coerceApiBoolean = (value: unknown, defaultValue: boolean): boolean => {
    if (typeof value === 'boolean') return value;
    if (value === 1 || value === '1' || value === 'true') return true;
    if (value === 0 || value === '0' || value === 'false') return false;
    if (value === null || value === undefined) return defaultValue;
    return defaultValue;
};

/**
 * Normalized shape of a company record after flattening
 * both legacy flat payloads and JSON:API-style payloads.
 */
/** Company profile source as returned by the API. */
export type CompanySource = 'manual' | 'google_places' | 'claimed' | string;

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
    /** Profile source: `manual`, `google_places`, or `claimed`. */
    source: CompanySource;
    /** True when the company has been claimed by a real business owner. */
    claimed: boolean;
    /** True when the current owner is a real user (claimed profile). */
    ownerIsRealUser: boolean;
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

/** Outcome of {@link validateCompanyEditRequiredFields}. */
export type CompanyEditValidationResult =
    | { ok: true }
    | {
          ok: false;
          reason:
              | 'missing_required'
              | 'missing_name_en'
              | 'missing_name_ar'
              | 'established_year_invalid';
      };

/**
 * Returns trimmed string or empty when falsy.
 *
 * @param value - Raw input string.
 */
const trimField = (value: string) => value.trim();

/**
 * Whether the active UI locale uses Arabic as the primary editing language (requires Arabic name on edit).
 *
 * @param uiLanguage - Value from i18n (`en`, `ar`, `en-US`, …).
 */
export function isArabicUiLanguage(uiLanguage: string): boolean {
    return uiLanguage.toLowerCase().startsWith('ar');
}

/**
 * Validates name (by UI language), slogan, acronym, handle, industry id, and established year
 * before updating an existing company from the admin sheet.
 *
 * When the admin UI is English, only the English name is required; when Arabic, only the Arabic name.
 *
 * @param data - Current {@link CompanyFormData} from the sheet.
 * @param options.uiLanguage - Active i18n language for which name field is required.
 */
export function validateCompanyEditRequiredFields(
    data: CompanyFormData,
    options: { uiLanguage: string },
): CompanyEditValidationResult {
    if (isArabicUiLanguage(options.uiLanguage)) {
        if (!trimField(data.name.ar)) {
            return { ok: false, reason: 'missing_name_ar' };
        }
    } else if (!trimField(data.name.en)) {
        return { ok: false, reason: 'missing_name_en' };
    }
    if (!trimField(data.slogan.en) || !trimField(data.slogan.ar)) {
        return { ok: false, reason: 'missing_required' };
    }
    if (!trimField(data.acronym) || !trimField(data.handle) || !trimField(data.industry_id)) {
        return { ok: false, reason: 'missing_required' };
    }
    const establishedRaw = trimField(data.established);
    if (!establishedRaw) {
        return { ok: false, reason: 'missing_required' };
    }
    const year = Number(establishedRaw);
    const maxYear = new Date().getFullYear();
    if (!Number.isFinite(year) || !Number.isInteger(year) || year < 1800 || year > maxYear) {
        return { ok: false, reason: 'established_year_invalid' };
    }
    return { ok: true };
}

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

    const rawActive = attrs.active !== undefined ? attrs.active : c.active;
    const rawPublished = attrs.published !== undefined ? attrs.published : c.published;
    const rawSearchable = attrs.searchable !== undefined ? attrs.searchable : c.searchable;
    const rawVerified = attrs.verified !== undefined ? attrs.verified : c.verified;
    const rawSource = String(attrs.source ?? c.source ?? 'manual');
    const claimed = rawSource === 'claimed';

    return {
        id: c.id,
        name: attrs.name || c.name || { en: '', ar: '' },
        handle: attrs.handle || c.handle || '',
        acronym: attrs.acronym || c.acronym || '',
        slogan: attrs.slogan || c.slogan || { en: '', ar: '' },
        profilePhoto: attrs.profilePhoto || attrs.profile_photo || c.profilePhoto || '',
        active: coerceApiBoolean(rawActive, true),
        published: coerceApiBoolean(rawPublished, true),
        searchable: coerceApiBoolean(rawSearchable, true),
        verified: coerceApiBoolean(rawVerified, false),
        createdAt: attrs.createdAt || attrs.created_at || c.created_at || '',
        location: rels.primaryCountry?.name || c.primaryCountry?.name || c.location || '',
        industryId: rels.industry?.id || c.industry?.id || c.industry_id || '',
        industryName: rels.industry?.name || c.industry?.name || '',
        ownerId: rels.owner?.id || c.owner?.id || c.owner_id || '',
        ownerName: rels.owner?.name || c.owner?.name || '',
        ownerEmail: rels.owner?.email || c.owner?.email || '',
        source: rawSource,
        claimed,
        ownerIsRealUser: claimed,
        ranking: attrs.ranking ?? c.ranking ?? null,
        established: attrs.established ?? c.established ?? null,
        expertiseIds: Array.isArray(rels.expertises)
            ? rels.expertises.map((e: Record<string, unknown>) => String(e.id))
            : Array.isArray(c.expertises)
                ? c.expertises.map((e: Record<string, unknown>) => String(e.id))
                : (c.expertise_ids || []),
    };
};
