"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  mondayOfWeekContaining,
  parseISODateLocal,
  toISODateLocal,
} from "@/lib/week";

export async function addPlannedMealForm(formData: FormData) {
  const date = String(formData.get("date") ?? "").trim();
  const recipeId = String(formData.get("recipeId") ?? "").trim();
  if (!date || !recipeId) return;
  await prisma.plannedMeal.create({ data: { date, recipeId } });
  revalidatePath("/plan");
  revalidatePath("/plan/einkauf");
  revalidatePath("/plan/einkauf/druck");
}

/** Für Kalender-Popover (client) */
export async function addPlannedMealAction(date: string, recipeId: string) {
  const d = date.trim();
  const r = recipeId.trim();
  if (!d || !r) return;
  await prisma.plannedMeal.create({ data: { date: d, recipeId: r } });
  revalidatePath("/plan");
  revalidatePath("/plan/einkauf");
  revalidatePath("/plan/einkauf/druck");
}

export async function removePlannedMealForm(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await prisma.plannedMeal.delete({ where: { id } });
  revalidatePath("/plan");
  revalidatePath("/plan/einkauf");
  revalidatePath("/plan/einkauf/druck");
}

export async function removePlannedMealAction(id: string) {
  const mealId = id.trim();
  if (!mealId) return;
  await prisma.plannedMeal.delete({ where: { id: mealId } });
  revalidatePath("/plan");
  revalidatePath("/plan/einkauf");
  revalidatePath("/plan/einkauf/druck");
}

export async function addShoppingIngredientAction(input: {
  plannedMealId: string;
  ingredientId: string;
  text: string;
  mealDate: string;
}) {
  const monday = toISODateLocal(mondayOfWeekContaining(parseISODateLocal(input.mealDate)));
  await prisma.shoppingListItem.upsert({
    where: {
      plannedMealId_ingredientId: {
        plannedMealId: input.plannedMealId,
        ingredientId: input.ingredientId,
      },
    },
    create: {
      weekStart: monday,
      text: input.text.trim(),
      plannedMealId: input.plannedMealId,
      ingredientId: input.ingredientId,
      checked: false,
    },
    update: { checked: false },
  });
  revalidatePath("/plan");
  revalidatePath("/plan/einkauf");
  revalidatePath("/plan/einkauf/druck");
}

export async function removeShoppingIngredientAction(input: {
  plannedMealId: string;
  ingredientId: string;
}) {
  await prisma.shoppingListItem.deleteMany({
    where: {
      plannedMealId: input.plannedMealId,
      ingredientId: input.ingredientId,
    },
  });
  revalidatePath("/plan");
  revalidatePath("/plan/einkauf");
  revalidatePath("/plan/einkauf/druck");
}

export async function toggleShoppingItemCheckedAction(itemId: string, checked: boolean) {
  await prisma.shoppingListItem.update({
    where: { id: itemId },
    data: { checked },
  });
  revalidatePath("/plan");
  revalidatePath("/plan/einkauf");
  revalidatePath("/plan/einkauf/druck");
}

export async function deleteShoppingItemForm(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await prisma.shoppingListItem.delete({ where: { id } });
  revalidatePath("/plan");
  revalidatePath("/plan/einkauf");
  revalidatePath("/plan/einkauf/druck");
}

export async function clearCheckedShoppingForm(formData: FormData) {
  const weekStart = String(formData.get("weekStart") ?? "").trim();
  if (!weekStart) return;
  await prisma.shoppingListItem.deleteMany({
    where: { weekStart, checked: true },
  });
  revalidatePath("/plan");
  revalidatePath("/plan/einkauf");
  revalidatePath("/plan/einkauf/druck");
}
