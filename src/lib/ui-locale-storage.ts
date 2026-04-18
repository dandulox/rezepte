/** localStorage: UI-Sprache der Website (Navigation, Startseite, …) */
export const UI_LOCALE_STORAGE_KEY = "rezepte-ui-locale";

export type SiteLocale = "de" | "en";

export function normalizeSiteLocale(raw: string | null | undefined): SiteLocale {
  if (raw === "en") return "en";
  return "de";
}

export function readSiteLocaleFromStorage(): SiteLocale {
  try {
    return normalizeSiteLocale(localStorage.getItem(UI_LOCALE_STORAGE_KEY));
  } catch {
    return "de";
  }
}
