import { redirect } from "next/navigation";
import { AdminLoginView } from "@/app/admin/login/AdminLoginView";
import { isAdminSessionValid } from "@/lib/admin-session";

export const metadata = {
  title: "Admin-Anmeldung · Rezeptbuch",
};

export default async function AdminLoginPage() {
  if (await isAdminSessionValid()) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <AdminLoginView />
    </div>
  );
}
