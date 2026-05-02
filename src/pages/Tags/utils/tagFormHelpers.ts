import type { AdminTag } from '@services/tagService';

/**
 * Reads bilingual name fields from a flattened admin tag (translations envelope).
 */
export function getTagNameLocales(tag: AdminTag): { en: string; ar: string } {
  const tr = tag.translations?.name;
  if (tr && typeof tr === 'object') {
    return { en: String(tr.en ?? ''), ar: String(tr.ar ?? '') };
  }
  return { en: '', ar: '' };
}

/**
 * Whether the tag is flagged for review (camelCase from JSON attributes).
 */
export function isTagNeedsReview(tag: AdminTag): boolean {
  return tag.needsReview === true;
}

/**
 * Sum of product and service attachments for delete guards and UI hints.
 */
export function getTagUsageTotal(tag: AdminTag): number {
  return (tag.productsCount ?? 0) + (tag.servicesCount ?? 0);
}

/**
 * True when at least one trimmed locale string is non-empty.
 */
export function hasAtLeastOneLocaleName(name: { en: string; ar: string }): boolean {
  return name.en.trim().length > 0 || name.ar.trim().length > 0;
}
