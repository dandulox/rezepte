"use client";

import { useUiLocale } from "@/components/UiLocaleProvider";
import { UI_LOCALE_FIELD } from "@/lib/admin-ui-locale";

export function AdminHiddenUiLocale() {
  const { locale } = useUiLocale();
  return <input type="hidden" name={UI_LOCALE_FIELD} value={locale} />;
}
