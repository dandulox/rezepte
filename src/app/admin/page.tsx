import { AdminPanel } from "@/app/admin/AdminPanel";
import { adminThemeFromRow, ensureAdminSettings } from "@/lib/admin-settings";
import { normalizeRecipeDisplayLocale } from "@/lib/recipe-display-locale";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin · Rezeptbuch",
};

export default async function AdminPage() {
  const [row, categoryDefs, dietKindDefs] = await Promise.all([
    ensureAdminSettings(),
    prisma.recipeCategoryDef.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    }),
    prisma.recipeDietKindDef.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    }),
  ]);
  const initialAppearance = adminThemeFromRow(row);
  const initialRecipeDisplayLocale = normalizeRecipeDisplayLocale(
    row.recipeDisplayLocale,
  );
  return (
    <AdminPanel
      initialAppearance={initialAppearance}
      initialRecipeDisplayLocale={initialRecipeDisplayLocale}
      initialCategoryDefs={categoryDefs}
      initialDietKindDefs={dietKindDefs}
    />
  );
}
