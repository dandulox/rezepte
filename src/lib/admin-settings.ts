import { prisma } from "@/lib/prisma";
import { hashAdminPin } from "@/lib/admin-pin";
import type { AdminThemeColors } from "@/lib/admin-theme-defaults";
import { normalizeRecipeDisplayLocale } from "@/lib/recipe-display-locale";
import type { RecipeViewLang } from "@/lib/recipe-translate-locales";
import { DEFAULT_ADMIN_PIN } from "@/lib/admin-constants";

const ADMIN_ROW_ID = "default";
export { DEFAULT_ADMIN_PIN };

export async function ensureAdminSettings() {
  const existing = await prisma.adminSettings.findUnique({
    where: { id: ADMIN_ROW_ID },
  });
  if (existing) return existing;

  const pinHash = hashAdminPin(DEFAULT_ADMIN_PIN);
  return prisma.adminSettings.create({
    data: { id: ADMIN_ROW_ID, pinHash },
  });
}

export function adminThemeFromRow(row: AdminThemeColors): AdminThemeColors {
  return {
    adminAccentLight: row.adminAccentLight,
    adminAccentLightHover: row.adminAccentLightHover,
    adminAccentLightFg: row.adminAccentLightFg,
    adminSuccessLight: row.adminSuccessLight,
    adminAccentDark: row.adminAccentDark,
    adminAccentDarkHover: row.adminAccentDarkHover,
    adminAccentDarkFg: row.adminAccentDarkFg,
    adminSuccessDark: row.adminSuccessDark,
  };
}

export async function getAdminPinHash(): Promise<string> {
  const row = await ensureAdminSettings();
  return row.pinHash;
}

export async function getRecipeDisplayLocale(): Promise<RecipeViewLang> {
  const row = await ensureAdminSettings();
  return normalizeRecipeDisplayLocale(row.recipeDisplayLocale);
}
