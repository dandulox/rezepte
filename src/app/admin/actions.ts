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

const HEX6 = /^#[0-9A-Fa-f]{6}$/;

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
  await ensureAdminSettings();
  const pin = String(formData.get("pin") ?? "").trim();
  if (!PIN_RE.test(pin)) {
    return { error: "PIN muss genau 4 Ziffern sein." };
  }
  const pinHash = await getAdminPinHash();
  if (!verifyAdminPin(pin, pinHash)) {
    return { error: "Falscher PIN." };
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
  if (!(await isAdminSessionValid())) {
    return { error: "Sitzung abgelaufen. Bitte erneut anmelden." };
  }
  await ensureAdminSettings();
  const current = String(formData.get("currentPin") ?? "").trim();
  const nextPin = String(formData.get("newPin") ?? "").trim();
  const confirm = String(formData.get("confirmPin") ?? "").trim();
  if (!PIN_RE.test(current) || !PIN_RE.test(nextPin) || !PIN_RE.test(confirm)) {
    return { error: "Alle PINs müssen genau 4 Ziffern sein." };
  }
  if (nextPin !== confirm) {
    return { error: "Neue PIN und Wiederholung stimmen nicht überein." };
  }
  const pinHash = await getAdminPinHash();
  if (!verifyAdminPin(current, pinHash)) {
    return { error: "Aktueller PIN ist falsch." };
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
  _formData: FormData,
): Promise<AdminVotesResetState> {
  if (!(await isAdminSessionValid())) {
    return { error: "Sitzung abgelaufen. Bitte erneut anmelden." };
  }
  const { count } = await prisma.recipeVote.deleteMany({
    where: { type: RecipeVoteType.LIKE },
  });
  revalidateAfterVoteChange();
  return { ok: true, count };
}

export async function adminResetRecipeDislikesAction(
  _prev: AdminVotesResetState,
  _formData: FormData,
): Promise<AdminVotesResetState> {
  if (!(await isAdminSessionValid())) {
    return { error: "Sitzung abgelaufen. Bitte erneut anmelden." };
  }
  const { count } = await prisma.recipeVote.deleteMany({
    where: { type: RecipeVoteType.DISLIKE },
  });
  revalidateAfterVoteChange();
  return { ok: true, count };
}

export async function adminResetRecipeVotesAction(
  _prev: AdminVotesResetState,
  _formData: FormData,
): Promise<AdminVotesResetState> {
  if (!(await isAdminSessionValid())) {
    return { error: "Sitzung abgelaufen. Bitte erneut anmelden." };
  }
  const { count } = await prisma.recipeVote.deleteMany({});
  revalidateAfterVoteChange();
  return { ok: true, count };
}

export async function adminSaveThemeAction(
  _prev: AdminThemeActionState,
  formData: FormData,
): Promise<AdminThemeActionState> {
  if (!(await isAdminSessionValid())) {
    return { error: "Sitzung abgelaufen. Bitte erneut anmelden." };
  }
  const data: Partial<AdminThemeColors> = {};
  for (const key of THEME_KEYS) {
    const v = parseHex6(String(formData.get(key) ?? ""));
    if (!v) {
      return { error: `Ungültige Farbe: „${key}“ muss als #RRGGBB angegeben werden.` };
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
  _formData: FormData,
): Promise<AdminThemeActionState> {
  if (!(await isAdminSessionValid())) {
    return { error: "Sitzung abgelaufen. Bitte erneut anmelden." };
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
  if (!(await isAdminSessionValid())) {
    return { error: "Sitzung abgelaufen. Bitte erneut anmelden." };
  }
  const raw = String(formData.get("recipeDisplayLocale") ?? "").trim();
  if (!isRecipeViewLang(raw)) {
    return { error: "Ungültige Anzeigesprache." };
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
  _formData: FormData,
): Promise<AdminBackfillTranslationsState> {
  if (!(await isAdminSessionValid())) {
    return { error: "Sitzung abgelaufen. Bitte erneut anmelden." };
  }
  await ensureAdminSettings();
  const row = await prisma.adminSettings.findUniqueOrThrow({
    where: { id: ADMIN_ROW_ID },
  });
  const locale = normalizeRecipeDisplayLocale(row.recipeDisplayLocale);
  if (locale === "de") {
    return {
      error:
        "Für „Deutsch (Original)“ werden keine Übersetzungen gespeichert. Bitte zuerst eine andere Anzeigesprache wählen und speichern.",
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
