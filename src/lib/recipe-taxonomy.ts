import { cache } from "react";
import { prisma } from "@/lib/prisma";

/** Öffentliche Felder für UI (Kategorie / Ernährung). */
export type RecipeCategoryDefPublic = {
  id: string;
  labelDe: string;
  labelEn: string;
  /** Reihenfolge wie im Admin (niedrig = weiter oben). */
  sortOrder: number;
};

export type RecipeDietKindDefPublic = {
  id: string;
  labelDe: string;
  labelEn: string;
  isMeat: boolean;
  searchExtra: string;
  sortOrder: number;
};

const orderTaxonomy = [{ sortOrder: "asc" as const }, { id: "asc" as const }];

export const getRecipeCategoryDefs = cache(async (): Promise<RecipeCategoryDefPublic[]> => {
  return prisma.recipeCategoryDef.findMany({
    orderBy: orderTaxonomy,
    select: { id: true, labelDe: true, labelEn: true, sortOrder: true },
  });
});

export const getRecipeDietKindDefs = cache(async (): Promise<RecipeDietKindDefPublic[]> => {
  return prisma.recipeDietKindDef.findMany({
    orderBy: orderTaxonomy,
    select: {
      id: true,
      labelDe: true,
      labelEn: true,
      isMeat: true,
      searchExtra: true,
      sortOrder: true,
    },
  });
});
