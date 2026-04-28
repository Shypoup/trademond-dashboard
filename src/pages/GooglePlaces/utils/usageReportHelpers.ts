/**
 * Normalized Google Places admin usage API (`/admin/google-places/usage`) report.
 */

export interface GooglePlacesUsagePeriodDto {
  from: string;
  to: string;
}

export interface GooglePlacesUsageEndpointRowDto {
  key: string;
  requests: number;
  cost: number;
}

export interface GooglePlacesUsageDayRowDto {
  date: string;
  requests: number;
  cost: number;
}

export interface GooglePlacesUsageReportDto {
  period: GooglePlacesUsagePeriodDto | null;
  totalRequests: number | null;
  estimatedCostUsd: number | null;
  dailyLimit: number | null;
  todayUsed: number | null;
  todayRemaining: number | null;
  byEndpoint: GooglePlacesUsageEndpointRowDto[];
  byDay: GooglePlacesUsageDayRowDto[];
}

/**
 * Picks the first numeric field from an object by key candidates.
 */
function pickNum(obj: Record<string, unknown>, keys: string[]): number | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'number' && !Number.isNaN(v)) return v;
    if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v);
  }
  return undefined;
}

/**
 * Maps the usage API JSON body to a display DTO, or null if `data` is missing or invalid.
 */
export function parseGooglePlacesUsageReport(raw: unknown): GooglePlacesUsageReportDto | null {
  if (!raw || typeof raw !== 'object') return null;
  const root = raw as Record<string, unknown>;
  const data = root.data;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const d = data as Record<string, unknown>;

  let period: GooglePlacesUsagePeriodDto | null = null;
  const p = d.period;
  if (p && typeof p === 'object' && !Array.isArray(p)) {
    const po = p as Record<string, unknown>;
    const from = typeof po.from === 'string' ? po.from : '';
    const to = typeof po.to === 'string' ? po.to : '';
    if (from && to) period = { from, to };
  }

  const totalRequests = pickNum(d, ['totalRequests', 'total_requests']) ?? null;
  const estimatedCostUsd = pickNum(d, ['estimatedCostUsd', 'estimated_cost_usd']) ?? null;
  const dailyLimit = pickNum(d, ['dailyLimit', 'daily_limit']) ?? null;
  const todayUsed = pickNum(d, ['todayUsed', 'today_used']) ?? null;
  const todayRemaining = pickNum(d, ['todayRemaining', 'today_remaining']) ?? null;

  const byEndpoint: GooglePlacesUsageEndpointRowDto[] = [];
  const be = d.byEndpoint ?? d.by_endpoint;
  if (be && typeof be === 'object' && !Array.isArray(be)) {
    for (const [key, val] of Object.entries(be)) {
      if (!val || typeof val !== 'object' || Array.isArray(val)) continue;
      const vo = val as Record<string, unknown>;
      const requests = pickNum(vo, ['requests']);
      const cost = pickNum(vo, ['cost']);
      if (requests !== undefined && cost !== undefined) {
        byEndpoint.push({ key, requests, cost });
      }
    }
  }

  const byDay: GooglePlacesUsageDayRowDto[] = [];
  const bd = d.byDay ?? d.by_day;
  if (Array.isArray(bd)) {
    for (const item of bd) {
      if (!item || typeof item !== 'object') continue;
      const o = item as Record<string, unknown>;
      const date = typeof o.date === 'string' ? o.date : '';
      const requests = pickNum(o, ['requests']);
      const cost = pickNum(o, ['cost']);
      if (!date || requests === undefined || cost === undefined) continue;
      byDay.push({ date, requests, cost });
    }
  }

  return {
    period,
    totalRequests,
    estimatedCostUsd,
    dailyLimit,
    todayUsed,
    todayRemaining,
    byEndpoint,
    byDay,
  };
}

/**
 * True when the parsed report has nothing meaningful to show.
 */
export function isGooglePlacesUsageReportEmpty(report: GooglePlacesUsageReportDto): boolean {
  const hasNums =
    report.totalRequests != null ||
    report.estimatedCostUsd != null ||
    report.dailyLimit != null ||
    report.todayUsed != null ||
    report.todayRemaining != null;
  return !report.period && !hasNums && report.byEndpoint.length === 0 && report.byDay.length === 0;
}
