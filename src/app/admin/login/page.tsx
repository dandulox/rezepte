import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminLoginForm } from "@/app/admin/login/AdminLoginForm";
import { isAdminSessionValid } from "@/lib/admin-session";
import { DEFAULT_ADMIN_PIN } from "@/lib/admin-settings";

export const metadata = {
  title: "Admin-Anmeldung · Rezeptbuch",
};

export default async function AdminLoginPage() {
  if (await isAdminSessionValid()) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-accent)]">Admin</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Melde dich mit der 4-stelligen PIN an. Standard nach Ersteinrichtung:{" "}
        <span className="font-mono tabular-nums text-label">{DEFAULT_ADMIN_PIN}</span> — bitte im Adminbereich
        ändern.
      </p>
      <div className="admin-surface mt-8">
        <AdminLoginForm />
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          href="/"
          className="text-[var(--admin-accent)] underline-offset-4 hover:underline"
        >
          Zurück zur Startseite
        </Link>
      </p>
    </div>
  );
}
