"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { RecipeVoteType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const VISITOR_COOKIE = "rezeptVisitor";

async function optionalVisitorKey(): Promise<string | null> {
  const jar = await cookies();
  let key = jar.get(VISITOR_COOKIE)?.value ?? "";
  if (!key) {
    key = crypto.randomUUID();
    jar.set(VISITOR_COOKIE, key, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 400,
      secure: process.env.NODE_ENV === "production",
    });
  }
  return key;
}

/** Jeder Aufruf zählt einen weiteren Like (unabhängig von Dislikes). */
export async function addRecipeLike(recipeId: string) {
  const id = recipeId.trim();
  if (!id) return;
  const visitorKey = await optionalVisitorKey();
  await prisma.recipeVote.create({
    data: { recipeId: id, visitorKey, type: RecipeVoteType.LIKE },
  });
  revalidatePath(`/recipes/${id}`);
  revalidatePath("/recipes/kategorien");
}

/** Jeder Aufruf zählt einen weiteren Dislike (unabhängig von Likes). */
export async function addRecipeDislike(recipeId: string) {
  const id = recipeId.trim();
  if (!id) return;
  const visitorKey = await optionalVisitorKey();
  await prisma.recipeVote.create({
    data: { recipeId: id, visitorKey, type: RecipeVoteType.DISLIKE },
  });
  revalidatePath(`/recipes/${id}`);
  revalidatePath("/recipes/kategorien");
}
