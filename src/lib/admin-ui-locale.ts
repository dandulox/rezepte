import { getSiteStrings } from "@/lib/site-i18n";
import type { SiteLocale } from "@/lib/ui-locale-storage";

const UI_LOCALE_FIELD = "uiLocale";

/** Liest die Oberflächensprache aus versteckten Formularfeldern (Admin-Aktionen). */
export function adminUiLocaleFromFormData(formData: FormData): SiteLocale {
  return String(formData.get(UI_LOCALE_FIELD) ?? "de") === "en" ? "en" : "de";
}

export function adminServerErrors(locale: SiteLocale) {
  return getSiteStrings(locale).admin.serverErrors;
}

export { UI_LOCALE_FIELD };
