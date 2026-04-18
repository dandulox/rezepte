export function getAdminSessionSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "ADMIN_SESSION_SECRET fehlt oder ist zu kurz (mindestens 16 Zeichen). Setze die Variable in der Produktionsumgebung.",
    );
  }
  return "dev-rezeptbuch-admin-session-secret";
}
