"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { RecipeVoteType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { hashAdminPin, verifyAdminPin } from "@/lib/admin-pin";
import {
  clearAdminSessionCookie,
  isAdminSessionValid,
  setAdminSessionCookie,
} from "@/lib/admin-session";
import { ADMIN_THEME_DEFAULTS } from "@/lib/admin-theme-defaults";
import type { AdminThemeColors } from "@/lib/admin-theme-defaults";
import { adminServerErrors, adminUiLocaleFromFormData } from "@/lib/admin-ui-locale";
import { ensureAdminSettings, getAdminPinHash } from "@/lib/admin-settings";
import { normalizeRecipeDisplayLocale } from "@/lib/recipe-display-locale";
import { isRecipeViewLang } from "@/lib/recipe-translate-locales";
import { persistRecipeTranslation } from "@/lib/recipe-translation-persist";

const PIN_RE = /^\d{4}$/;
const ADMIN_ROW_ID = "default";

export type AdminActionState = { error?: string; ok?: boolean };

export type AdminVotesResetState = { error?: string; ok?: boolean; count?: number };

export type AdminThemeActionState = { error?: string; ok?: boolean };

export type AdminRecipeLocaleActionState = { error?: string; ok?: boolean };

export type AdminBackfillTranslationsState = {
  error?: string;
  ok?: boolean;
  created?: number;
  skipped?: number;
  failed?: number;
};

export type AdminTaxonomyActionState = { error?: string; ok?: boolean };

const HEX6 = /^#[0-9A-Fa-f]{6}$/;
const TAXONOMY_SLUG_RE = /^[a-z][a-z0-9_]{0,63}$/;

function revalidateTaxonomyPaths() {
  revalidatePath("/", "layout");
  revalidatePath("/recipes/kategorien");
  revalidatePath("/recipes/new");
  revalidatePath("/statistik");
  revalidatePath("/plan");
  revalidatePath("/favoriten");
  revalidatePath("/admin");
}

function parseHex6(raw: string): string | null {
  const s = raw.trim();
  if (!HEX6.test(s)) return null;
  return s.toLowerCase();
}

const THEME_KEYS = [
  "adminAccentLight",
  "adminAccentLightHover",
  "adminAccentLightFg",
  "adminSuccessLight",
  "adminAccentDark",
  "adminAccentDarkHover",
  "adminAccentDarkFg",
  "adminSuccessDark",
] as const satisfies readonly (keyof AdminThemeColors)[];

export async function adminLoginAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const err = adminServerErrors(adminUiLocaleFromFormData(formData));
  await ensureAdminSettings();
  const pin = String(formData.get("pin") ?? "").trim();
  if (!PIN_RE.test(pin)) {
    return { error: err.pinMustBe4 };
  }
  const pinHash = await getAdminPinHash();
  if (!verifyAdminPin(pin, pinHash)) {
    return { error: err.wrongPin };
  }
  await setAdminSessionCookie();
  redirect("/admin");
}

export async function adminLogoutAction() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}

export async function adminChangePinAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const err = adminServerErrors(adminUiLocaleFromFormData(formData));
  if (!(await isAdminSessionValid())) {
    return { error: err.sessionExpired };
  }
  await ensureAdminSettings();
  const current = String(formData.get("currentPin") ?? "").trim();
  const nextPin = String(formData.get("newPin") ?? "").trim();
  const confirm = String(formData.get("confirmPin") ?? "").trim();
  if (!PIN_RE.test(current) || !PIN_RE.test(nextPin) || !PIN_RE.test(confirm)) {
    return { error: err.allPinsMustBe4 };
  }
  if (nextPin !== confirm) {
    return { error: err.pinMismatch };
  }
  const pinHash = await getAdminPinHash();
  if (!verifyAdminPin(current, pinHash)) {
    return { error: err.currentPinWrong };
  }
  await prisma.adminSettings.update({
    where: { id: ADMIN_ROW_ID },
    data: { pinHash: hashAdminPin(nextPin) },
  });
  return { ok: true };
}

function revalidateAfterVoteChange() {
  revalidatePath("/", "layout");
}

export async function adminResetRecipeLikesAction(
  _prev: AdminVotesResetState,
  formData: FormData,
): Promise<AdminVotesResetState> {
  const err = adminServerErrors(adminUiLocaleFromFormData(formData));
  if (!(await isAdminSessionValid())) {
    return { error: err.sessionExpired };
  }
  const { count } = await prisma.recipeVote.deleteMany({
    where: { type: RecipeVoteType.LIKE },
  });
  revalidateAfterVoteChange();
  return { ok: true, count };
}

export async function adminResetRecipeDislikesAction(
  _prev: AdminVotesResetState,
  formData: FormData,
): Promise<AdminVotesResetState> {
  const err = adminServerErrors(adminUiLocaleFromFormData(formData));
  if (!(await isAdminSessionValid())) {
    return { error: err.sessionExpired };
  }
  const { count } = await prisma.recipeVote.deleteMany({
    where: { type: RecipeVoteType.DISLIKE },
  });
  revalidateAfterVoteChange();
  return { ok: true, count };
}

export async function adminResetRecipeVotesAction(
  _prev: AdminVotesResetState,
  formData: FormData,
): Promise<AdminVotesResetState> {
  const err = adminServerErrors(adminUiLocaleFromFormData(formData));
  if (!(await isAdminSessionValid())) {
    return { error: err.sessionExpired };
  }
  const { count } = await prisma.recipeVote.deleteMany({});
  revalidateAfterVoteChange();
  return { ok: true, count };
}

export async function adminSaveThemeAction(
  _prev: AdminThemeActionState,
  formData: FormData,
): Promise<AdminThemeActionState> {
  const err = adminServerErrors(adminUiLocaleFromFormData(formData));
  if (!(await isAdminSessionValid())) {
    return { error: err.sessionExpired };
  }
  const data: Partial<AdminThemeColors> = {};
  for (const key of THEME_KEYS) {
    const v = parseHex6(String(formData.get(key) ?? ""));
    if (!v) {
      return { error: err.invalidThemeColor(key) };
    }
    data[key] = v;
  }
  await prisma.adminSettings.update({
    where: { id: ADMIN_ROW_ID },
    data: data as AdminThemeColors,
  });
  revalidatePath("/admin");
  revalidatePath("/admin/login");
  return { ok: true };
}

export async function adminResetThemeAction(
  _prev: AdminThemeActionState,
  formData: FormData,
): Promise<AdminThemeActionState> {
  const err = adminServerErrors(adminUiLocaleFromFormData(formData));
  if (!(await isAdminSessionValid())) {
    return { error: err.sessionExpired };
  }
  await prisma.adminSettings.update({
    where: { id: ADMIN_ROW_ID },
    data: ADMIN_THEME_DEFAULTS,
  });
  revalidatePath("/admin");
  revalidatePath("/admin/login");
  return { ok: true };
}

export async function adminSaveRecipeDisplayLocaleAction(
  _prev: AdminRecipeLocaleActionState,
  formData: FormData,
): Promise<AdminRecipeLocaleActionState> {
  const err = adminServerErrors(adminUiLocaleFromFormData(formData));
  if (!(await isAdminSessionValid())) {
    return { error: err.sessionExpired };
  }
  const raw = String(formData.get("recipeDisplayLocale") ?? "").trim();
  if (!isRecipeViewLang(raw)) {
    return { error: err.invalidDisplayLocale };
  }
  await prisma.adminSettings.update({
    where: { id: ADMIN_ROW_ID },
    data: { recipeDisplayLocale: raw },
  });
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function adminBackfillRecipeTranslationsAction(
  _prev: AdminBackfillTranslationsState,
  formData: FormData,
): Promise<AdminBackfillTranslationsState> {
  const err = adminServerErrors(adminUiLocaleFromFormData(formData));
  if (!(await isAdminSessionValid())) {
    return { error: err.sessionExpired };
  }
  await ensureAdminSettings();
  const row = await prisma.adminSettings.findUniqueOrThrow({
    where: { id: ADMIN_ROW_ID },
  });
  const locale = normalizeRecipeDisplayLocale(row.recipeDisplayLocale);
  if (locale === "de") {
    return {
      error: err.backfillNeedsNonDe,
    };
  }

  const recipes = await prisma.recipe.findMany({ select: { id: true } });
  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const r of recipes) {
    const existing = await prisma.recipeTranslation.findUnique({
      where: { recipeId_locale: { recipeId: r.id, locale } },
    });
    if (existing) {
      skipped++;
      continue;
    }
    const res = await persistRecipeTranslation(r.id, locale);
    if (res.ok) {
      created++;
    } else {
      failed++;
    }
  }

  revalidatePath("/", "layout");
  return { ok: true, created, skipped, failed };
}

export async function adminCreateRecipeCategoryAction(
  _prev: AdminTaxonomyActionState,
  formData: FormData,
): Promise<AdminTaxonomyActionState> {
  const err = adminServerErrors(adminUiLocaleFromFormData(formData));
  if (!(await isAdminSessionValid())) {
    return { error: err.sessionExpired };
  }
  const id = String(formData.get("newCategoryId") ?? "").trim();
  const labelDe = String(formData.get("newCategoryLabelDe") ?? "").trim();
  const labelEn = String(formData.get("newCategoryLabelEn") ?? "").trim();
  const sortOrderRaw = String(formData.get("newCategorySortOrder") ?? "").trim();
  const sortOrder = sortOrderRaw ? parseInt(sortOrderRaw, 10) : 0;
  if (!TAXONOMY_SLUG_RE.test(id)) {
    return { error: err.invalidTaxonomySlug };
  }
  if (!labelDe || !labelEn) {
    return { error: err.taxonomyMissingLabels };
  }
  const existing = await prisma.recipeCategoryDef.findUnique({ where: { id } });
  if (existing) {
    return { error: err.duplicateTaxonomyId };
  }
  await prisma.recipeCategoryDef.create({
    data: {
      id,
      labelDe,
      labelEn,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  });
  revalidateTaxonomyPaths();
  return { ok: true };
}

export async function adminUpdateRecipeCategoryAction(
  _prev: AdminTaxonomyActionState,
  formData: FormData,
): Promise<AdminTaxonomyActionState> {
  const err = adminServerErrors(adminUiLocaleFromFormData(formData));
  if (!(await isAdminSessionValid())) {
    return { error: err.sessionExpired };
  }
  const id = String(formData.get("categoryId") ?? "").trim();
  const labelDe = String(formData.get("labelDe") ?? "").trim();
  const labelEn = String(formData.get("labelEn") ?? "").trim();
  const sortOrder = parseInt(String(formData.get("sortOrder") ?? "0"), 10);
  if (!id || !TAXONOMY_SLUG_RE.test(id)) {
    return { error: err.invalidTaxonomySlug };
  }
  if (!labelDe || !labelEn) {
    return { error: err.taxonomyMissingLabels };
  }
  await prisma.recipeCategoryDef.update({
    where: { id },
    data: {
      labelDe,
      labelEn,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  });
  revalidateTaxonomyPaths();
  return { ok: true };
}

export async function adminDeleteRecipeCategoryAction(
  _prev: AdminTaxonomyActionState,
  formData: FormData,
): Promise<AdminTaxonomyActionState> {
  const err = adminServerErrors(adminUiLocaleFromFormData(formData));
  if (!(await isAdminSessionValid())) {
    return { error: err.sessionExpired };
  }
  const id = String(formData.get("categoryId") ?? "").trim();
  if (!id) {
    return { error: err.invalidTaxonomySlug };
  }
  const n = await prisma.recipe.count({ where: { category: id } });
  if (n > 0) {
    return { error: err.categoryInUse(n) };
  }
  await prisma.recipeCategoryDef.delete({ where: { id } });
  revalidateTaxonomyPaths();
  return { ok: true };
}

export async function adminCreateRecipeDietKindAction(
  _prev: AdminTaxonomyActionState,
  formData: FormData,
): Promise<AdminTaxonomyActionState> {
  const err = adminServerErrors(adminUiLocaleFromFormData(formData));
  if (!(await isAdminSessionValid())) {
    return { error: err.sessionExpired };
  }
  const id = String(formData.get("newDietId") ?? "").trim();
  const labelDe = String(formData.get("newDietLabelDe") ?? "").trim();
  const labelEn = String(formData.get("newDietLabelEn") ?? "").trim();
  const searchExtra = String(formData.get("newDietSearchExtra") ?? "").trim();
  const sortOrderRaw = String(formData.get("newDietSortOrder") ?? "").trim();
  const sortOrder = sortOrderRaw ? parseInt(sortOrderRaw, 10) : 0;
  const isMeat = String(formData.get("newDietIsMeat") ?? "") === "on";
  if (!TAXONOMY_SLUG_RE.test(id)) {
    return { error: err.invalidTaxonomySlug };
  }
  if (!labelDe || !labelEn) {
    return { error: err.taxonomyMissingLabels };
  }
  const existing = await prisma.recipeDietKindDef.findUnique({ where: { id } });
  if (existing) {
    return { error: err.duplicateTaxonomyId };
  }
  await prisma.recipeDietKindDef.create({
    data: {
      id,
      labelDe,
      labelEn,
      searchExtra,
      isMeat,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  });
  revalidateTaxonomyPaths();
  return { ok: true };
}

export async function adminUpdateRecipeDietKindAction(
  _prev: AdminTaxonomyActionState,
  formData: FormData,
): Promise<AdminTaxonomyActionState> {
  const err = adminServerErrors(adminUiLocaleFromFormData(formData));
  if (!(await isAdminSessionValid())) {
    return { error: err.sessionExpired };
  }
  const id = String(formData.get("dietId") ?? "").trim();
  const labelDe = String(formData.get("labelDe") ?? "").trim();
  const labelEn = String(formData.get("labelEn") ?? "").trim();
  const searchExtra = String(formData.get("searchExtra") ?? "").trim();
  const sortOrder = parseInt(String(formData.get("sortOrder") ?? "0"), 10);
  const isMeat = String(formData.get("isMeat") ?? "") === "on";
  if (!id || !TAXONOMY_SLUG_RE.test(id)) {
    return { error: err.invalidTaxonomySlug };
  }
  if (!labelDe || !labelEn) {
    return { error: err.taxonomyMissingLabels };
  }
  await prisma.recipeDietKindDef.update({
    where: { id },
    data: {
      labelDe,
      labelEn,
      searchExtra,
      isMeat,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  });
  revalidateTaxonomyPaths();
  return { ok: true };
}

export async function adminDeleteRecipeDietKindAction(
  _prev: AdminTaxonomyActionState,
  formData: FormData,
): Promise<AdminTaxonomyActionState> {
  const err = adminServerErrors(adminUiLocaleFromFormData(formData));
  if (!(await isAdminSessionValid())) {
    return { error: err.sessionExpired };
  }
  const id = String(formData.get("dietId") ?? "").trim();
  if (!id) {
    return { error: err.invalidTaxonomySlug };
  }
  const n = await prisma.recipe.count({ where: { dietKind: id } });
  if (n > 0) {
    return { error: err.dietInUse(n) };
  }
  await prisma.recipeDietKindDef.delete({ where: { id } });
  revalidateTaxonomyPaths();
  return { ok: true };
}
