import { prisma } from "@/lib/prisma";
import {
  addDays,
  toISODateLocal,
  weekMondayFromParam,
} from "@/lib/week";
import type { PlanWeekClientMeal } from "./types";
import { PlanWeekClient } from "./PlanWeekClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Wochenplan · Rezeptbuch",
};

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ w?: string }>;
}) {
  const { w } = await searchParams;
  const weekStart = weekMondayFromParam(w);
  const startStr = toISODateLocal(weekStart);
  /** Ausgewählte Woche plus die folgenden zwei Wochen (21 Tage). */
  const endStr = toISODateLocal(addDays(weekStart, 20));

  const [meals, recipes] = await Promise.all([
    prisma.plannedMeal.findMany({
      where: { date: { gte: startStr, lte: endStr } },
      include: {
        recipe: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            category: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    }),
    prisma.recipe.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true, imageUrl: true, category: true },
    }),
  ]);

  return (
    <PlanWeekClient
      weekStart={startStr}
      meals={JSON.parse(JSON.stringify(meals)) as PlanWeekClientMeal[]}
      recipes={recipes}
    />
  );
}
