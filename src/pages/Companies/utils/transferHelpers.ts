/**
 * Types and helpers for the admin company ownership transfer flow.
 */

/** How to handle the previous real-user owner after transfer. */
export type PreviousOwnerAction = 'keep_as_admin' | 'keep_as_member' | 'remove';

/** Candidate account returned by the preview endpoint. */
export interface TransferPreviewAccount {
  id: string;
  name: string;
  email: string;
  active: boolean;
}

/** Eligibility checks returned alongside the preview account. */
export interface TransferChecks {
  eligible: boolean;
  isCurrentOwner: boolean;
  isPlatformAccount: boolean;
  isAlreadyMember: boolean;
  currentRole: string | null;
}

/** Normalized preview response from POST …/transfer-ownership/preview. */
export interface TransferPreviewResult {
  account: TransferPreviewAccount;
  checks: TransferChecks;
  warnings: string[];
  blockers: string[];
}

/** Normalized success payload from POST …/transfer-ownership. */
export interface TransferResult {
  message: string;
  warnings: string[];
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

/** UI phases for the transfer ownership sheet. */
export type TransferPhase =
  | 'idle'
  | 'looking'
  | 'notfound'
  | 'resolved'
  | 'committing'
  | 'success'
  | 'error';

/**
 * Trims whitespace and collapses internal spaces in a lookup query.
 *
 * @param value - Raw input from the admin (email or ULID).
 */
export function sanitizeLookupQuery(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Maps a server blocker code to an i18n translation key under `companies.transfer.blockers.*`.
 *
 * @param code - Blocker code from the API or derived from checks.
 */
export function mapBlockerCode(code: string): string {
  const known: Record<string, string> = {
    already_owner: 'companies.transfer.blockers.alreadyOwner',
    is_current_owner: 'companies.transfer.blockers.alreadyOwner',
    platform_account: 'companies.transfer.blockers.staff',
    is_platform_account: 'companies.transfer.blockers.staff',
    staff_account: 'companies.transfer.blockers.staff',
    inactive_account: 'companies.transfer.blockers.inactive',
    account_inactive: 'companies.transfer.blockers.inactive',
    deactivated: 'companies.transfer.blockers.inactive',
  };
  return known[code] ?? 'companies.transfer.blockers.generic';
}

/**
 * Maps a server warning code to an i18n translation key under `companies.transfer.warnings.*`.
 *
 * @param code - Warning code from the API (e.g. `new_owner_has_no_subscription`).
 */
export function mapWarningCode(code: string): string {
  const known: Record<string, string> = {
    new_owner_has_no_subscription: 'companies.transfer.warnings.noSubscription',
    no_subscription: 'companies.transfer.warnings.noSubscription',
  };
  return known[code] ?? 'companies.transfer.warnings.generic';
}

/**
 * Derives blocker codes from preview checks when the server omits explicit blocker strings.
 *
 * @param checks - Eligibility checks from the preview response.
 * @param accountActive - Whether the candidate account is active.
 */
function deriveBlockerCodes(checks: TransferChecks, accountActive: boolean): string[] {
  const codes: string[] = [];
  if (checks.isCurrentOwner) codes.push('is_current_owner');
  if (checks.isPlatformAccount) codes.push('is_platform_account');
  if (!accountActive) codes.push('inactive_account');
  return codes;
}

/**
 * Coerces a blocker/warning entry (string or `{ code, message }` object) to a string code.
 *
 * @param entry - Raw entry from the API.
 */
function coerceCode(entry: unknown): string {
  if (typeof entry === 'string') return entry;
  if (entry && typeof entry === 'object') {
    const obj = entry as Record<string, unknown>;
    const value = obj.code ?? obj.key ?? obj.type ?? obj.reason ?? obj.message ?? '';
    return typeof value === 'string' ? value : String(value);
  }
  return entry != null ? String(entry) : '';
}

/**
 * Coerces an array of blocker/warning entries to string codes, dropping empties.
 *
 * @param entries - Raw array from the API.
 */
function coerceCodeList(entries: unknown): string[] {
  if (!Array.isArray(entries)) return [];
  return entries.map(coerceCode).filter((code): code is string => code.length > 0);
}

/**
 * Normalizes a raw preview API response into a consistent shape.
 *
 * @param raw - Unparsed response body from the preview endpoint.
 */
export function normalizeTransferPreview(raw: unknown): TransferPreviewResult {
  const body = raw as Record<string, unknown>;
  const data = (body.data ?? body) as Record<string, unknown>;
  const attrs = (data.attributes ?? data) as Record<string, unknown>;
  const checksRaw = (body.checks ?? data.checks ?? {}) as Record<string, unknown>;

  const account: TransferPreviewAccount = {
    id: String(attrs.id ?? data.id ?? ''),
    name: String(attrs.name ?? data.name ?? ''),
    email: String(attrs.email ?? data.email ?? ''),
    active: Boolean(attrs.active ?? data.active ?? true),
  };

  const checks: TransferChecks = {
    eligible: Boolean(checksRaw.eligible),
    isCurrentOwner: Boolean(checksRaw.isCurrentOwner ?? checksRaw.is_current_owner),
    isPlatformAccount: Boolean(checksRaw.isPlatformAccount ?? checksRaw.is_platform_account),
    isAlreadyMember: Boolean(checksRaw.isAlreadyMember ?? checksRaw.is_already_member),
    currentRole: checksRaw.currentRole != null
      ? String(checksRaw.currentRole)
      : checksRaw.current_role != null
        ? String(checksRaw.current_role)
        : null,
  };

  const serverBlockers = coerceCodeList(body.blockers ?? data.blockers);
  const serverWarnings = coerceCodeList(body.warnings ?? data.warnings);

  const derivedBlockers = deriveBlockerCodes(checks, account.active);
  const blockers = serverBlockers.length > 0 ? serverBlockers : derivedBlockers;
  const eligible = checks.eligible && blockers.length === 0;

  return {
    account,
    checks: { ...checks, eligible },
    warnings: serverWarnings,
    blockers,
  };
}

/**
 * Normalizes a raw transfer success API response.
 *
 * @param raw - Unparsed response body from the transfer endpoint.
 */
export function normalizeTransferResult(raw: unknown): TransferResult {
  const body = raw as Record<string, unknown>;
  const data = (body.data ?? {}) as Record<string, unknown>;
  const rels = (data.relationships ?? {}) as Record<string, unknown>;
  const ownerRel = (rels.owner ?? data.owner ?? {}) as Record<string, unknown>;

  const warnings = coerceCodeList(body.warnings);

  return {
    message: String(body.message ?? ''),
    warnings,
    owner: {
      id: String(ownerRel.id ?? ''),
      name: String(ownerRel.name ?? ''),
      email: String(ownerRel.email ?? ''),
    },
  };
}

/**
 * Extracts blocker codes from a 422 validation error on transfer commit.
 *
 * @param error - Axios-style error object.
 */
export function extractTransferBlockers(error: unknown): string[] {
  const axiosErr = error as {
    response?: { status?: number; data?: { errors?: Record<string, string[]>; message?: string } };
  };
  const status = axiosErr?.response?.status;
  const data = axiosErr?.response?.data;

  if (status === 422 && data?.errors?.new_owner_id) {
    return coerceCodeList(data.errors.new_owner_id);
  }
  if (status === 422 && data?.message) {
    return [String(data.message)];
  }
  return [];
}
