import { cn } from '@utils/core/cn';

interface JsonInspectorProps {
  /** Arbitrary JSON-serializable API payload */
  data: unknown;
  className?: string;
}

/**
 * Read-only pretty-printed JSON for admin analytics and debug views.
 */
export function JsonInspector({ data, className }: JsonInspectorProps) {
  let text = '';
  try {
    text = JSON.stringify(data ?? null, null, 2);
  } catch {
    text = String(data);
  }

  return (
    <pre
      className={cn(
        'max-h-[480px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-xs leading-relaxed text-slate-700',
        className,
      )}
    >
      {text}
    </pre>
  );
}
