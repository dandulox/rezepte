/**
 * Reine Sortierung (ohne Prisma) — für Client-Komponenten importierbar.
 * Reihenfolge wie im Admin: sortOrder aufsteigend, bei Gleichstand Slug.
 */
export function sortTaxonomyDefsByOrder<T extends { id: string; sortOrder: number }>(
  defs: readonly T[],
): T[] {
  return [...defs].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id, "de"),
  );
}

export const sortRecipeCategoryDefs = sortTaxonomyDefsByOrder;
export const sortRecipeDietKindDefs = sortTaxonomyDefsByOrder;
