import { AdminPanel } from "@/app/admin/AdminPanel";
import { adminThemeFromRow, ensureAdminSettings } from "@/lib/admin-settings";
import { normalizeRecipeDisplayLocale } from "@/lib/recipe-display-locale";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin · Rezeptbuch",
};

export default async function AdminPage() {
  const row = await ensureAdminSettings();
  const initialAppearance = adminThemeFromRow(row);
  const initialRecipeDisplayLocale = normalizeRecipeDisplayLocale(
    row.recipeDisplayLocale,
  );
  return (
    <AdminPanel
      initialAppearance={initialAppearance}
      initialRecipeDisplayLocale={initialRecipeDisplayLocale}
    />
  );
}
