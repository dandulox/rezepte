import { RecipeVoteType } from "@/generated/prisma/client";
import { displayRecipeCategoryLabel } from "@/lib/recipe-category";
import { prisma } from "@/lib/prisma";
import type { RecipeCategoryDefPublic } from "@/lib/recipe-taxonomy";
import { getRecipeCategoryDefs } from "@/lib/recipe-taxonomy";

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"] as const;

function orderWeekdayIndex(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function last12MonthKeys(anchor: Date): string[] {
  const keys: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
}

function formatMonthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return new Intl.DateTimeFormat("de-DE", { month: "short", year: "numeric" }).format(d);
}

function categoryKeyAndLabel(
  category: string | null,
  categoryDefs: readonly RecipeCategoryDefPublic[],
): { key: string; label: string } {
  if (!category) return { key: "uncategorized", label: "Ohne Kategorie" };
  const label = displayRecipeCategoryLabel(category, "de", categoryDefs);
  if (label) return { key: category, label };
  return { key: `legacy:${category}`, label: category };
}

async function buildTopRecipesByLikes(
  likeGroups: { recipeId: string; _count: { _all: number } }[],
): Promise<{ recipeId: string; title: string; likeCount: number }[]> {
  if (likeGroups.length === 0) return [];
  const ids = likeGroups.map((g) => g.recipeId);
  const titles = await prisma.recipe.findMany({
    where: { id: { in: ids } },
    select: { id: true, title: true },
  });
  const titleById = new Map(titles.map((t) => [t.id, t.title]));
  return likeGroups.map((g) => ({
    recipeId: g.recipeId,
    title: titleById.get(g.recipeId) ?? "(Rezept fehlt)",
    likeCount: g._count._all,
  }));
}

export type CookStatsSnapshot = {
  totalCooks: number;
  recipesWithLogs: number;
  firstCookAt: string | null;
  lastCookAt: string | null;
  byMonth: { key: string; label: string; count: number }[];
  byWeekday: { label: string; count: number }[];
  /** Gekocht: Häufigkeit nach Rezept */
  topRecipes: { recipeId: string; title: string; count: number }[];
  /** Gekocht: Verteilung nach Rezept-Kategorie (Gerichtstyp) */
  cooksByCategory: { key: string; label: string; count: number }[];
  /** Lieblingsgerichte nach Like-Klicks (unabhängig vom Kochprotokoll) */
  topRecipesByLikes: { recipeId: string; title: string; likeCount: number }[];
  recent: { id: string; cookedAt: string; recipeId: string; title: string }[];
  thisMonthCount: number;
  lastMonthCount: number;
};

export async function getCookStatsSnapshot(): Promise<CookStatsSnapshot> {
  const now = new Date();
  const thisMonthKey = monthKey(now);
  const lastMonthKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const categoryDefs = await getRecipeCategoryDefs();

  const [allLogs, likeGroups] = await Promise.all([
    prisma.recipeCookLog.findMany({
      select: { cookedAt: true, recipeId: true },
    }),
    prisma.recipeVote.groupBy({
      by: ["recipeId"],
      where: { type: RecipeVoteType.LIKE },
      _count: { _all: true },
      orderBy: { _count: { recipeId: "desc" } },
      take: 15,
    }),
  ]);

  const topRecipesByLikes = await buildTopRecipesByLikes(likeGroups);

  const totalCooks = allLogs.length;

  if (totalCooks === 0) {
    return {
      totalCooks: 0,
      recipesWithLogs: 0,
      firstCookAt: null,
      lastCookAt: null,
      byMonth: last12MonthKeys(now).map((key) => ({
        key,
        label: formatMonthLabel(key),
        count: 0,
      })),
      byWeekday: WEEKDAY_LABELS.map((label) => ({ label, count: 0 })),
      topRecipes: [],
      cooksByCategory: [],
      topRecipesByLikes,
      recent: [],
      thisMonthCount: 0,
      lastMonthCount: 0,
    };
  }

  const recipesWithLogs = new Set(allLogs.map((l) => l.recipeId)).size;

  let minT = Infinity;
  let maxT = -Infinity;
  const monthCounts = new Map<string, number>();
  const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
  let thisMonthCount = 0;
  let lastMonthCount = 0;

  for (const row of allLogs) {
    const t = row.cookedAt.getTime();
    if (t < minT) minT = t;
    if (t > maxT) maxT = t;
    const d = row.cookedAt;
    const mk = monthKey(d);
    monthCounts.set(mk, (monthCounts.get(mk) ?? 0) + 1);
    weekdayCounts[orderWeekdayIndex(d.getDay())] += 1;
    if (mk === thisMonthKey) thisMonthCount += 1;
    if (mk === lastMonthKey) lastMonthCount += 1;
  }

  const monthKeys = last12MonthKeys(now);
  const byMonth = monthKeys.map((key) => ({
    key,
    label: formatMonthLabel(key),
    count: monthCounts.get(key) ?? 0,
  }));

  const byWeekday = WEEKDAY_LABELS.map((label, i) => ({
    label,
    count: weekdayCounts[i] ?? 0,
  }));

  const uniqueRecipeIds = [...new Set(allLogs.map((l) => l.recipeId))];
  const recipesMeta = await prisma.recipe.findMany({
    where: { id: { in: uniqueRecipeIds } },
    select: { id: true, title: true, category: true },
  });
  const categoryByRecipeId = new Map(
    recipesMeta.map((r) => [r.id, r.category]),
  );

  const categoryAgg = new Map<string, { label: string; count: number }>();
  for (const log of allLogs) {
    const rawCat = categoryByRecipeId.get(log.recipeId) ?? null;
    const { key, label } = categoryKeyAndLabel(rawCat, categoryDefs);
    const cur = categoryAgg.get(key);
    if (cur) cur.count += 1;
    else categoryAgg.set(key, { label, count: 1 });
  }
  const cooksByCategory = [...categoryAgg.entries()]
    .map(([key, v]) => ({ key, label: v.label, count: v.count }))
    .sort((a, b) => b.count - a.count);

  const topGroups = await prisma.recipeCookLog.groupBy({
    by: ["recipeId"],
    _count: { _all: true },
    orderBy: { _count: { recipeId: "desc" } },
    take: 15,
  });

  const titleById = new Map(recipesMeta.map((r) => [r.id, r.title]));
  const topRecipes = topGroups.map((g) => ({
    recipeId: g.recipeId,
    title: titleById.get(g.recipeId) ?? "(Rezept fehlt)",
    count: g._count._all,
  }));

  const recentLogs = await prisma.recipeCookLog.findMany({
    orderBy: { cookedAt: "desc" },
    take: 25,
    select: {
      id: true,
      cookedAt: true,
      recipeId: true,
      recipe: { select: { title: true } },
    },
  });

  const recent = recentLogs.map((r) => ({
    id: r.id,
    cookedAt: r.cookedAt.toISOString(),
    recipeId: r.recipeId,
    title: r.recipe.title,
  }));

  return {
    totalCooks,
    recipesWithLogs,
    firstCookAt: new Date(minT).toISOString(),
    lastCookAt: new Date(maxT).toISOString(),
    byMonth,
    byWeekday,
    topRecipes,
    cooksByCategory,
    topRecipesByLikes,
    recent,
    thisMonthCount,
    lastMonthCount,
  };
}
