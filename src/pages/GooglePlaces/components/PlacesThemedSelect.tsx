import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@utils/core/cn';
import {
  PLACES_SELECT_NONE_VALUE,
  placesSelectContentClassName,
  placesSelectTriggerClassName,
} from '@pages/GooglePlaces/utils/placesSelectTheme';

export interface PlacesThemedSelectOption {
  value: string;
  label: React.ReactNode;
}

export interface PlacesThemedSelectProps {
  /** Current value; use `''` when optional “none” is selected. */
  value: string;
  /** Called with the raw stored value (`''` when “none”). */
  onValueChange: (next: string) => void;
  options: PlacesThemedSelectOption[];
  /** When true, prepends an option mapped to `''`. */
  optionalNone?: boolean;
  /** Label for the none row (and trigger placeholder when empty). */
  noneLabel?: string;
  disabled?: boolean;
  'aria-label'?: string;
  /** Extra classes merged onto `SelectTrigger`. */
  triggerClassName?: string;
}

/**
 * Dashboard-themed shadcn `Select` so the dropdown popup uses `popover` / `accent` tokens instead of the OS native list.
 */
export function PlacesThemedSelect({
  value,
  onValueChange,
  options,
  optionalNone = false,
  noneLabel = '',
  disabled = false,
  'aria-label': ariaLabel,
  triggerClassName,
}: PlacesThemedSelectProps) {
  const innerValue =
    optionalNone && (value === '' || value === undefined) ? PLACES_SELECT_NONE_VALUE : value;

  /**
   * Label shown in the closed trigger. Base UI `SelectValue` otherwise renders the raw `value`
   * string (e.g. taxonomy id) instead of the option's visible text.
   */
  const triggerLabel = React.useMemo(() => {
    if (optionalNone && innerValue === PLACES_SELECT_NONE_VALUE) {
      return noneLabel;
    }
    const match = options.find((o) => o.value === innerValue);
    return match?.label;
  }, [optionalNone, innerValue, noneLabel, options]);

  const handleChange = (v: string | null) => {
    const raw = v ?? PLACES_SELECT_NONE_VALUE;
    if (optionalNone && raw === PLACES_SELECT_NONE_VALUE) {
      onValueChange('');
      return;
    }
    onValueChange(raw);
  };

  return (
    <Select value={innerValue} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn(placesSelectTriggerClassName, triggerClassName)}
      >
        <SelectValue placeholder={optionalNone ? noneLabel : undefined}>{triggerLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent className={placesSelectContentClassName}>
        {optionalNone ? <SelectItem value={PLACES_SELECT_NONE_VALUE}>{noneLabel}</SelectItem> : null}
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
