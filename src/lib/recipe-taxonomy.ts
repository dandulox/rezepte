import { cache } from "react";
import { prisma } from "@/lib/prisma";

/** Öffentliche Felder für UI (Kategorie / Ernährung). */
export type RecipeCategoryDefPublic = {
  id: string;
  labelDe: string;
  labelEn: string;
};

export type RecipeDietKindDefPublic = {
  id: string;
  labelDe: string;
  labelEn: string;
  isMeat: boolean;
  searchExtra: string;
};

export const getRecipeCategoryDefs = cache(async (): Promise<RecipeCategoryDefPublic[]> => {
  return prisma.recipeCategoryDef.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, labelDe: true, labelEn: true },
  });
});

export const getRecipeDietKindDefs = cache(async (): Promise<RecipeDietKindDefPublic[]> => {
  return prisma.recipeDietKindDef.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, labelDe: true, labelEn: true, isMeat: true, searchExtra: true },
  });
});
