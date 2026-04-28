import { displayBilingual } from '@utils/ui';

/**
 * Coerces an API list item into a row object, or null if invalid.
 */
export function normalizeImportHistoryRow(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object') return null;
  return raw as Record<string, unknown>;
}

/**
 * Stable-ish React key for a history row.
 */
export function importHistoryRowKey(row: Record<string, unknown>): string {
  const candidates = [
    row.id,
    row.ulid,
    row.import_ulid,
    row.importUlid,
    row.googlePlaceId,
    row.google_place_id,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' || typeof c === 'number') return String(c);
  }
  return '';
}

/**
 * Google Place id shown in history.
 */
export function importHistoryPlaceId(row: Record<string, unknown>): string {
  const v = row.googlePlaceId ?? row.google_place_id ?? row.place_id;
  return typeof v === 'string' ? v : '';
}

/**
 * Display name for the import row (prefers API `companyName` bilingual object).
 */
export function importHistoryDisplayName(row: Record<string, unknown>): string {
  const bilingual = row.companyName ?? row.company_name;
  if (bilingual && typeof bilingual === 'object') {
    return displayBilingual(bilingual);
  }
  const direct =
    row.name ?? row.place_name ?? row.placeName ?? row.business_name ?? row.title;
  if (typeof direct === 'string' && direct.trim()) return direct;
  const company = row.company;
  if (company && typeof company === 'object') {
    const c = company as Record<string, unknown>;
    const n = c.name;
    if (typeof n === 'string' && n.trim()) return n;
    if (n && typeof n === 'object') return displayBilingual(n);
  }
  return '';
}

/**
 * Admin user label from `importedBy` / `imported_by`.
 */
export function importHistoryImportedByLabel(row: Record<string, unknown>): string {
  const ib = row.importedBy ?? row.imported_by;
  if (!ib || typeof ib !== 'object') return '';
  const o = ib as Record<string, unknown>;
  const n = o.name;
  return typeof n === 'string' && n.trim() ? n : '';
}

/**
 * Status string for badge / cell (trimmed; empty when unknown or blank).
 */
export function importHistoryStatus(row: Record<string, unknown>): string {
  const s = row.status ?? row.import_status ?? row.state;
  if (typeof s === 'number' && !Number.isNaN(s)) return String(s);
  if (typeof s === 'string' && s.trim()) return s.trim();
  return '';
}

/**
 * Best timestamp for an “imported at” column (`importedAt` preferred).
 */
export function importHistoryCreatedRaw(row: Record<string, unknown>): string | null {
  const keys = [
    'importedAt',
    'imported_at',
    'createdAt',
    'created_at',
    'inserted_at',
    'updatedAt',
    'updated_at',
  ];
  for (const k of keys) {
    const v = row[k];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return null;
}
