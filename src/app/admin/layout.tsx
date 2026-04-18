import type { CSSProperties } from "react";
import { prisma } from "@/lib/prisma";
import { ensureAdminSettings } from "@/lib/admin-settings";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await ensureAdminSettings();
  const row = await prisma.adminSettings.findUniqueOrThrow({
    where: { id: "default" },
  });

  const style = {
    "--admin-accent-light": row.adminAccentLight,
    "--admin-accent-hover-light": row.adminAccentLightHover,
    "--admin-accent-foreground-light": row.adminAccentLightFg,
    "--admin-success-fg-light": row.adminSuccessLight,
    "--admin-accent-dark": row.adminAccentDark,
    "--admin-accent-hover-dark": row.adminAccentDarkHover,
    "--admin-accent-foreground-dark": row.adminAccentDarkFg,
    "--admin-success-fg-dark": row.adminSuccessDark,
  } as CSSProperties;

  return (
    <div className="admin-area" style={style}>
      {children}
    </div>
  );
}
