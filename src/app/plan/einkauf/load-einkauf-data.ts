import { prisma } from "@/lib/prisma";
import {
  addDays,
  addWeeks,
  toISODateLocal,
  weekMondayFromParam,
} from "@/lib/week";
import type { PlanEinkaufMeal, PlanWeekClientShopping } from "../types";

export async function loadEinkaufPageData(wParam: string | undefined) {
  const weekStart = weekMondayFromParam(wParam);
  const startStr = toISODateLocal(weekStart);
  const endStr = toISODateLocal(addDays(weekStart, 20));
  const shoppingWeekStarts = [0, 1, 2].map((i) => toISODateLocal(addWeeks(weekStart, i)));

  const [meals, shopping] = await Promise.all([
    prisma.plannedMeal.findMany({
      where: { date: { gte: startStr, lte: endStr } },
      include: {
        recipe: {
          include: {
            ingredients: { orderBy: { sortOrder: "asc" } },
          },
        },
      },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    }),
    prisma.shoppingListItem.findMany({
      where: { weekStart: { in: shoppingWeekStarts } },
      include: {
        plannedMeal: {
          include: { recipe: { select: { title: true } } },
        },
      },
      orderBy: [{ checked: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  return {
    weekAnchor: startStr,
    meals: JSON.parse(JSON.stringify(meals)) as PlanEinkaufMeal[],
    shopping: JSON.parse(JSON.stringify(shopping)) as PlanWeekClientShopping[],
  };
}
