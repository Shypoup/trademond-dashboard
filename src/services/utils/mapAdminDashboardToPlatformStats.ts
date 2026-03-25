import type { PlatformStats } from '@data-types/api';

/**
 * Safely reads a numeric value from unknown API data (numbers, numeric strings).
 */
function readNumber(value: unknown): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return 0;
}

/**
 * Maps the `GET /api/v1/admin/dashboard` JSON payload to {@link PlatformStats} used by the UI.
 * The API returns nested sections (users, companies, products, subscriptions, etc.); this
 * function tolerates several plausible key shapes so the dashboard stays resilient to minor
 * response changes.
 *
 * @param payload - Raw JSON from `GET /admin/dashboard`
 * @returns Normalized {@link PlatformStats} for overview cards
 */
export function mapAdminDashboardToPlatformStats(payload: unknown): PlatformStats {
  const root =
    payload &&
    typeof payload === 'object' &&
    'data' in (payload as Record<string, unknown>) &&
    (payload as { data: unknown }).data !== undefined
      ? (payload as { data: unknown }).data
      : payload;

  const o = root && typeof root === 'object' ? (root as Record<string, unknown>) : {};

  const users = o.users as Record<string, unknown> | undefined;
  const companies = o.companies as Record<string, unknown> | undefined;
  const products = o.products as Record<string, unknown> | undefined;
  const services = o.services as Record<string, unknown> | undefined;
  const subscriptions = o.subscriptions as Record<string, unknown> | undefined;
  const sponsored = o.sponsored as Record<string, unknown> | undefined;
  const moderation = o.moderation as Record<string, unknown> | undefined;
  const analytics = o.analytics as Record<string, unknown> | undefined;

  const totalUsers = readNumber(
    users?.total ?? users?.count ?? users?.all ?? o.total_users,
  );
  const activeUsers = readNumber(
    users?.active ?? users?.active_count ?? users?.active_users ?? totalUsers,
  );

  return {
    total_users: totalUsers,
    active_users: activeUsers,
    total_companies: readNumber(
      companies?.total ?? companies?.count ?? o.total_companies,
    ),
    pending_approvals: readNumber(
      o.pending_approvals ??
        moderation?.pending ??
        companies?.pending_verification ??
        moderation?.tag_proposals_pending,
    ),
    total_products: readNumber(products?.total ?? products?.count ?? o.total_products),
    total_services: readNumber(services?.total ?? services?.count ?? o.total_services),
    revenue: readNumber(
      subscriptions?.mrr ??
        subscriptions?.revenue ??
        sponsored?.revenue ??
        o.revenue,
    ),
    growth: {
      users: readNumber(
        users?.growth_percent ?? analytics?.user_growth ?? o.user_growth ?? 0,
      ),
      revenue: readNumber(
        subscriptions?.revenue_growth ?? sponsored?.revenue_growth ?? o.revenue_growth ?? 0,
      ),
    },
  };
}
