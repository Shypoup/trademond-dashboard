/**
 * Parsers for Laravel auth JSON supporting legacy `{ status, data }` wrappers and
 * flattened payloads (API response standardization).
 */

/** User fragment from login/register or `/api/me`. */
export interface ParsedAuthUser {
  id: string;
  name?: string;
  email?: string;
  email_verified_at?: string | null;
  is_verified?: boolean;
  roles?: string[];
}

/** Normalized tokens from login or register. */
export interface ParsedLoginPayload {
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number | null;
  user: ParsedAuthUser | null;
  emailVerified: boolean | null;
}

/**
 * @param body - Top-level JSON object
 * @returns Inner `data` object when present, otherwise `body`
 */
function unwrapDataLayer(body: Record<string, unknown>): Record<string, unknown> {
  const inner = body.data;
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return body;
}

/**
 * Parses admin or public login/register success bodies.
 *
 * @param body - Parsed JSON from `POST /api/admin/login` (or legacy `/api/login`)
 * @returns Tokens and embedded user, or `null` if no access token
 */
export function parseLoginOrRegisterResponse(body: unknown): ParsedLoginPayload | null {
  if (!body || typeof body !== 'object') return null;
  const root = body as Record<string, unknown>;
  const inner = unwrapDataLayer(root);

  const accessToken =
    (typeof inner.access_token === 'string' && inner.access_token) ||
    (typeof inner.token === 'string' && inner.token) ||
    null;
  if (!accessToken) return null;

  const refreshToken = typeof inner.refresh_token === 'string' ? inner.refresh_token : null;
  const expiresIn = typeof inner.expires_in === 'number' ? inner.expires_in : null;
  const emailVerified =
    typeof inner.email_verified === 'boolean' ? inner.email_verified : null;

  let user: ParsedAuthUser | null = null;
  if (inner.user && typeof inner.user === 'object') {
    const u = inner.user as Record<string, unknown>;
    const id = u.id != null ? String(u.id) : '';
    if (id) {
      user = {
        id,
        name: typeof u.name === 'string' ? u.name : undefined,
        email: typeof u.email === 'string' ? u.email : undefined,
        email_verified_at:
          typeof u.email_verified_at === 'string' ? u.email_verified_at : undefined,
        is_verified: typeof u.is_verified === 'boolean' ? u.is_verified : undefined,
        roles: Array.isArray(u.roles)
          ? (u.roles.filter((r) => typeof r === 'string') as string[])
          : undefined,
      };
    }
  }

  return {
    accessToken,
    refreshToken,
    expiresIn,
    user,
    emailVerified,
  };
}

/**
 * Parses `POST /api/refresh` response bodies.
 *
 * @param body - Parsed JSON
 * @returns New access (and optional refresh) or `null`
 */
export function parseRefreshResponse(
  body: unknown,
): { accessToken: string; refreshToken: string | null } | null {
  if (!body || typeof body !== 'object') return null;
  const root = body as Record<string, unknown>;
  const inner = unwrapDataLayer(root);
  const accessToken = inner.access_token;
  const refreshToken = inner.refresh_token;
  if (typeof accessToken !== 'string' || !accessToken) return null;
  return {
    accessToken,
    refreshToken: typeof refreshToken === 'string' ? refreshToken : null,
  };
}

/**
 * Parses `GET /api/me` for JSON:API user resources or flat `data.user`.
 *
 * @param body - Parsed JSON
 * @returns Normalized fields for the admin profile UI
 */
export function parseMeResponse(body: unknown): {
  id: string;
  name?: string;
  email?: string;
  profilePhoto?: string | null;
  roleLabel?: string;
  phone?: string;
  jobTitle?: string;
} | null {
  if (!body || typeof body !== 'object') return null;
  const root = body as Record<string, unknown>;
  const layer = unwrapDataLayer(root);

  if (layer.user && typeof layer.user === 'object') {
    const u = layer.user as Record<string, unknown>;
    const id = u.id != null ? String(u.id) : '';
    if (!id) return null;
    const roles = Array.isArray(u.roles)
      ? (u.roles.filter((r) => typeof r === 'string') as string[])
      : [];
    return {
      id,
      name: typeof u.name === 'string' ? u.name : undefined,
      email: typeof u.email === 'string' ? u.email : undefined,
      profilePhoto: null,
      roleLabel: roles[0] ?? 'Admin',
    };
  }

  const attrs = layer.attributes;
  if (attrs && typeof attrs === 'object' && layer.id != null) {
    const a = attrs as Record<string, unknown>;
    const id = String(layer.id);
    const profilePhoto = a.profilePhoto;
    return {
      id,
      name: typeof a.name === 'string' ? a.name : undefined,
      email: typeof a.email === 'string' ? a.email : undefined,
      profilePhoto:
        typeof profilePhoto === 'string' && profilePhoto.trim() !== '' ? profilePhoto : null,
      roleLabel:
        typeof a.role === 'string'
          ? a.role
          : typeof a.isAdmin === 'boolean' && a.isAdmin
            ? 'Admin'
            : 'Admin',
      phone: typeof a.phone === 'string' ? a.phone : undefined,
      jobTitle: typeof a.jobTitle === 'string' ? a.jobTitle : undefined,
    };
  }

  /** Axios JSON:API normalizer may flatten `data` to `{ id, name, email, ... }`. */
  if (layer.id != null && (typeof layer.name === 'string' || typeof layer.email === 'string')) {
    const id = String(layer.id);
    const profilePhoto = layer.profilePhoto;
    return {
      id,
      name: typeof layer.name === 'string' ? layer.name : undefined,
      email: typeof layer.email === 'string' ? layer.email : undefined,
      profilePhoto:
        typeof profilePhoto === 'string' && profilePhoto.trim() !== '' ? profilePhoto : null,
      roleLabel:
        typeof layer.role === 'string'
          ? layer.role
          : typeof layer.isAdmin === 'boolean' && layer.isAdmin
            ? 'Admin'
            : 'Admin',
      phone: typeof layer.phone === 'string' ? layer.phone : undefined,
      jobTitle: typeof layer.jobTitle === 'string' ? layer.jobTitle : undefined,
    };
  }

  return null;
}
