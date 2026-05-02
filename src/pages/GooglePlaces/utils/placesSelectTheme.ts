/**
 * Sentinel value for optional Google Places taxonomy selects (maps to `''` in parent state).
 * Must not collide with real category or industry ids.
 */
export const PLACES_SELECT_NONE_VALUE = '__places_none__';

/**
 * Trigger: full-width, dashboard input height (overrides default SelectTrigger h-8).
 */
export const placesSelectTriggerClassName =
  'h-10 w-full min-w-0 border-border bg-background px-3 text-sm font-normal text-foreground shadow-none data-[size=default]:h-10 dark:bg-input/30 dark:hover:bg-input/50';

/**
 * Popup list: themed popover surface (matches shadcn SelectContent + dashboard cards).
 */
export const placesSelectContentClassName =
  'max-h-[min(24rem,var(--available-height))] rounded-xl border border-border bg-popover text-popover-foreground shadow-xl ring-1 ring-border/60';
