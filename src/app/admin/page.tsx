import { AdminPanel } from "@/app/admin/AdminPanel";
import { adminThemeFromRow, ensureAdminSettings } from "@/lib/admin-settings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin · Rezeptbuch",
};

export default async function AdminPage() {
  const row = await ensureAdminSettings();
  const initialAppearance = adminThemeFromRow(row);
  return <AdminPanel initialAppearance={initialAppearance} />;
}
