/**
 * Helpers for Google Places admin search rows and quota parsing.
 */

/**
 * Attempts to read monthly (or total) quota usage from the admin usage API payload.
 * Supports several common response shapes.
 */
export function extractQuotaFromUsage(raw: unknown): { used: number; limit: number } | null {
  if (!raw || typeof raw !== 'object') return null;
  const root = raw as Record<string, unknown>;
  const data =
    root.data && typeof root.data === 'object' ? (root.data as Record<string, unknown>) : root;

  const pickNum = (obj: Record<string, unknown>, keys: string[]): number | undefined => {
    for (const k of keys) {
      const v = obj[k];
      if (typeof v === 'number' && !Number.isNaN(v)) return v;
      if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v);
    }
    return undefined;
  };

  /** Shape from admin usage report (`todayUsed` / `dailyLimit`). */
  const todayUsed = pickNum(data, ['todayUsed', 'today_used']);
  const dailyLimit = pickNum(data, ['dailyLimit', 'daily_limit']);
  if (todayUsed !== undefined && dailyLimit !== undefined && dailyLimit > 0) {
    return { used: todayUsed, limit: dailyLimit };
  }
  const todayRemaining = pickNum(data, ['todayRemaining', 'today_remaining']);
  if (todayRemaining !== undefined && dailyLimit !== undefined && dailyLimit > 0) {
    return { used: Math.max(0, dailyLimit - todayRemaining), limit: dailyLimit };
  }

  const used = pickNum(data, [
    'used',
    'usage',
    'current',
    'count',
    'searches_used',
    'quota_used',
    'requests_used',
    'total_used',
  ]);
  const limit = pickNum(data, [
    'limit',
    'max',
    'quota',
    'quota_limit',
    'cap',
    'monthly_limit',
    'requests_limit',
  ]);

  if (used === undefined || limit === undefined) return null;
  return { used, limit };
}

/** Quota summary for the page header (usage endpoint or search `meta`). */
export type GooglePlacesQuotaBanner =
  | { variant: 'usedTotal'; used: number; limit: number }
  | { variant: 'remaining'; remaining: number };

/**
 * Builds a quota banner from the usage statistics API payload.
 */
export function quotaBannerFromUsage(raw: unknown): GooglePlacesQuotaBanner | null {
  const u = extractQuotaFromUsage(raw);
  if (u) return { variant: 'usedTotal', used: u.used, limit: u.limit };
  return null;
}

/**
 * Reads quota hints from a search response `meta` object (e.g. `quotaRemaining`, `quotaLimit`).
 */
export function quotaBannerFromSearchResponse(raw: unknown): GooglePlacesQuotaBanner | null {
  if (!raw || typeof raw !== 'object') return null;
  const root = raw as Record<string, unknown>;
  const meta =
    root.meta && typeof root.meta === 'object' ? (root.meta as Record<string, unknown>) : null;
  if (!meta) return null;

  const pickNum = (obj: Record<string, unknown>, keys: string[]): number | undefined => {
    for (const k of keys) {
      const v = obj[k];
      if (typeof v === 'number' && !Number.isNaN(v)) return v;
      if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v);
    }
    return undefined;
  };

  const remaining = pickNum(meta, ['quotaRemaining', 'quota_remaining', 'remaining']);
  const limit = pickNum(meta, ['quotaLimit', 'quota_limit', 'limit', 'max', 'monthly_quota']);

  if (remaining !== undefined && limit !== undefined && limit > 0) {
    const used = Math.max(0, Math.min(limit, limit - remaining));
    return { variant: 'usedTotal', used, limit };
  }
  if (remaining !== undefined) {
    return { variant: 'remaining', remaining };
  }
  return null;
}

/**
 * Parses the search endpoint response into a flat list of place objects.
 */
export function parsePlacesFromSearchResponse(raw: unknown): Array<Record<string, unknown>> {
  const root = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const data = root.data;
  let list: unknown[] = [];
  if (Array.isArray(data)) list = data;
  else if (data && typeof data === 'object' && Array.isArray((data as { places?: unknown[] }).places)) {
    list = (data as { places: unknown[] }).places;
  } else if (Array.isArray(root.places)) list = root.places;
  else if (Array.isArray(root.results)) list = root.results;
  return list.filter((p): p is Record<string, unknown> => !!p && typeof p === 'object');
}

/**
 * Resolves a stable Google Place id from an API row.
 */
export function placeIdOf(row: Record<string, unknown>): string {
  const id =
    (typeof row.googlePlaceId === 'string' && row.googlePlaceId) ||
    (typeof row.google_place_id === 'string' && row.google_place_id) ||
    (typeof row.place_id === 'string' && row.place_id) ||
    (typeof row.id === 'string' && row.id) ||
    '';
  return id;
}

export interface DisplayNameOptions {
  /** BCP 47 locale; when it starts with `ar`, prefers `nameAr` when set. */
  locale?: string;
}

/**
 * Human-readable place title from an API row.
 */
export function displayName(row: Record<string, unknown>, options?: DisplayNameOptions): string {
  const loc = options?.locale ?? '';
  if (loc.startsWith('ar')) {
    const ar = row.nameAr ?? row.name_ar;
    if (typeof ar === 'string' && ar.trim()) return ar;
  }
  const n = row.name ?? row.display_name ?? row.title;
  return typeof n === 'string' ? n : JSON.stringify(n);
}

/**
 * Best-effort formatted address string.
 */
export function rowAddress(row: Record<string, unknown>): string {
  const a =
    row.formattedAddress ??
    row.formatted_address ??
    row.address ??
    row.vicinity ??
    (typeof row.location === 'string' ? row.location : null);
  if (typeof a === 'string' && a.trim()) return a;
  return '';
}

/**
 * Best-effort phone string.
 */
export function rowPhone(row: Record<string, unknown>): string {
  const p =
    row.formatted_phone_number ??
    row.international_phone_number ??
    row.phone ??
    row.phone_number;
  if (typeof p === 'string' && p.trim()) return p;
  return '';
}

/**
 * Website URL if present.
 */
export function rowWebsite(row: Record<string, unknown>): string | null {
  const w = row.website ?? row.url ?? row.website_uri;
  if (typeof w === 'string' && w.trim()) return w.trim();
  return null;
}

/**
 * Whether the row appears already linked / imported in Trademond.
 */
export function rowIsImported(row: Record<string, unknown>): boolean {
  if (row.alreadyImported === true || row.imported === true || row.is_imported === true) return true;
  if (row.status === 'imported' || row.import_status === 'imported') return true;
  if (typeof row.company_id === 'string' && row.company_id) return true;
  if (typeof row.company_ulid === 'string' && row.company_ulid) return true;
  if (typeof row.trademond_company_id === 'string' && row.trademond_company_id) return true;
  return false;
}

/**
 * Opens Google Maps for a place_id.
 */
export function googleMapsPlaceUrl(placeId: string): string {
  return `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(placeId)}`;
}

/**
 * Preferred Google Maps URL for a row (API `googleMapsUrl` or synthetic from place id).
 */
export function rowMapsUrl(row: Record<string, unknown>, placeId: string): string {
  const u = row.googleMapsUrl ?? row.google_maps_url;
  if (typeof u === 'string' && u.trim()) return u.trim();
  return googleMapsPlaceUrl(placeId);
}
