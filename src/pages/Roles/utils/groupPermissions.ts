/**
 * Normalizes `/admin/permissions` payloads into checkbox groups (domain → permission strings).
 */
export function groupPermissionsFromApi(raw: unknown): { group: string; items: string[] }[] {
  if (raw === null || raw === undefined) return [];
  const root =
    typeof raw === 'object' && raw !== null && 'data' in (raw as object)
      ? (raw as { data: unknown }).data
      : raw;

  if (Array.isArray(root)) {
    return root
      .map((g) => {
        if (!g || typeof g !== 'object') return null;
        const o = g as { name?: string; group?: string; permissions?: unknown; items?: unknown };
        const groupName = typeof o.name === 'string' ? o.name : typeof o.group === 'string' ? o.group : 'permissions';
        const arr = Array.isArray(o.permissions) ? o.permissions : Array.isArray(o.items) ? o.items : [];
        const items = arr.filter((x): x is string => typeof x === 'string');
        return { group: groupName, items };
      })
      .filter((x): x is { group: string; items: string[] } => !!x && x.items.length > 0);
  }

  if (typeof root === 'object' && root !== null && !Array.isArray(root)) {
    const out: { group: string; items: string[] }[] = [];
    for (const [k, v] of Object.entries(root)) {
      if (Array.isArray(v) && v.every((x) => typeof x === 'string')) {
        out.push({ group: k, items: v });
      }
    }
    return out;
  }

  return [];
}

/**
 * Reads `permissions: string[]` from a role detail payload.
 */
export function permissionsFromRolePayload(roleBody: unknown): string[] {
  if (!roleBody || typeof roleBody !== 'object') return [];
  const r = roleBody as Record<string, unknown>;
  const inner = r.data && typeof r.data === 'object' ? (r.data as Record<string, unknown>) : r;
  const p = inner.permissions;
  if (Array.isArray(p) && p.every((x) => typeof x === 'string')) return p;
  return [];
}
