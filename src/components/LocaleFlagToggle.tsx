"use client";

import { useUiLocale } from "@/components/UiLocaleProvider";
import { useIosSafeClick } from "@/lib/use-ios-safe-click";

export function LocaleFlagToggle() {
  const { locale, setLocale, strings } = useUiLocale();
  const clickDe = useIosSafeClick(() => setLocale("de"));
  const clickEn = useIosSafeClick(() => setLocale("en"));

  const baseBtn =
    "flex h-11 w-10 touch-manipulation items-center justify-center rounded-md text-lg leading-none transition";

  return (
    <div
      className="flex shrink-0 items-center rounded-lg border border-border bg-card-muted/70 p-0.5 shadow-sm"
      role="group"
      aria-label={strings.nav.localeGroupAria}
    >
      <button
        type="button"
        {...clickDe}
        aria-pressed={locale === "de"}
        aria-label={strings.nav.localeDe}
        title={strings.nav.localeDe}
        className={
          locale === "de"
            ? `${baseBtn} bg-card text-foreground shadow-sm ring-1 ring-border`
            : `${baseBtn} text-muted-foreground hover:bg-card-muted hover:text-foreground`
        }
      >
        <span aria-hidden>🇩🇪</span>
      </button>
      <button
        type="button"
        {...clickEn}
        aria-pressed={locale === "en"}
        aria-label={strings.nav.localeEn}
        title={strings.nav.localeEn}
        className={
          locale === "en"
            ? `${baseBtn} bg-card text-foreground shadow-sm ring-1 ring-border`
            : `${baseBtn} text-muted-foreground hover:bg-card-muted hover:text-foreground`
        }
      >
        <span aria-hidden>🇬🇧</span>
      </button>
    </div>
  );
}
