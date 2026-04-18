"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  UI_LOCALE_STORAGE_KEY,
  readSiteLocaleFromStorage,
  type SiteLocale,
} from "@/lib/ui-locale-storage";
import { getSiteStrings, type SiteStrings } from "@/lib/site-i18n";

type UiLocaleContextValue = {
  locale: SiteLocale;
  setLocale: (locale: SiteLocale) => void;
  toggleLocale: () => void;
  strings: SiteStrings;
};

const UiLocaleContext = createContext<UiLocaleContextValue | null>(null);

function HtmlLangSync() {
  const { locale } = useUiLocale();
  useEffect(() => {
    document.documentElement.lang = locale === "en" ? "en" : "de";
  }, [locale]);
  return null;
}

export function UiLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SiteLocale>("de");

  useEffect(() => {
    queueMicrotask(() => setLocaleState(readSiteLocaleFromStorage()));
  }, []);

  const setLocale = useCallback((next: SiteLocale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(UI_LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => {
      const next = prev === "de" ? "en" : "de";
      try {
        localStorage.setItem(UI_LOCALE_STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const strings = useMemo(() => getSiteStrings(locale), [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale, strings }),
    [locale, setLocale, toggleLocale, strings],
  );

  return (
    <UiLocaleContext.Provider value={value}>
      <HtmlLangSync />
      {children}
    </UiLocaleContext.Provider>
  );
}

export function useUiLocale(): UiLocaleContextValue {
  const ctx = useContext(UiLocaleContext);
  if (!ctx) {
    throw new Error("useUiLocale muss innerhalb von UiLocaleProvider verwendet werden.");
  }
  return ctx;
}
