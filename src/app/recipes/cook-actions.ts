"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function parseLocalDateYmd(value: string): Date | null {
  const s = value.trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
  const dt = new Date(y, mo - 1, d, 12, 0, 0, 0);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
}

export async function logRecipeCookedAction(recipeId: string, cookedDateYmd?: string) {
  const id = recipeId.trim();
  if (!id) return { ok: false as const, error: "Rezept fehlt." };

  const recipe = await prisma.recipe.findUnique({ where: { id }, select: { id: true } });
  if (!recipe) return { ok: false as const, error: "Rezept nicht gefunden." };

  const cookedAt =
    cookedDateYmd && cookedDateYmd.trim()
      ? parseLocalDateYmd(cookedDateYmd)
      : new Date();
  if (!cookedAt) return { ok: false as const, error: "Ungültiges Datum." };

  await prisma.recipeCookLog.create({
    data: { recipeId: id, cookedAt },
  });

  revalidatePath(`/recipes/${id}`);
  revalidatePath("/statistik");
  return { ok: true as const };
}

export async function deleteRecipeCookLogAction(logId: string) {
  const id = logId.trim();
  if (!id) return { ok: false as const, error: "Eintrag fehlt." };

  const log = await prisma.recipeCookLog.findUnique({
    where: { id },
    select: { id: true, recipeId: true },
  });
  if (!log) return { ok: false as const, error: "Eintrag nicht gefunden." };

  await prisma.recipeCookLog.delete({ where: { id: log.id } });

  revalidatePath(`/recipes/${log.recipeId}`);
  revalidatePath("/statistik");
  return { ok: true as const };
}
