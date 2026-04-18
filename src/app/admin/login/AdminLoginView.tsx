"use client";

import Link from "next/link";
import { AdminLoginForm } from "@/app/admin/login/AdminLoginForm";
import { useUiLocale } from "@/components/UiLocaleProvider";
import { DEFAULT_ADMIN_PIN } from "@/lib/admin-constants";

export function AdminLoginView() {
  const { strings: s } = useUiLocale();
  const a = s.admin.login;

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-accent)]">
        {a.heading}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{a.intro(DEFAULT_ADMIN_PIN)}</p>
      <div className="admin-surface mt-8">
        <AdminLoginForm />
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          href="/"
          className="text-[var(--admin-accent)] underline-offset-4 hover:underline"
        >
          {a.backLink}
        </Link>
      </p>
    </>
  );
}
