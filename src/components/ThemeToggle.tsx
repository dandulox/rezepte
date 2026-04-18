"use client";

import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme-storage";
import { useIosSafeClick } from "@/lib/use-ios-safe-click";

export type ThemePreference = "light" | "dark" | "system";

function systemIsDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyDocumentTheme(pref: ThemePreference) {
  const dark =
    pref === "dark" || (pref === "system" && systemIsDark());
  document.documentElement.classList.toggle("dark", dark);
}

function readStoredPref(): ThemePreference {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === "light" || raw === "dark") return raw;
  } catch {
    /* z. B. privates Surfen / Storage gesperrt */
  }
  return "system";
}

function persistPref(pref: ThemePreference) {
  try {
    if (pref === "system") {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, pref);
    }
  } catch {
    /* ignorieren */
  }
}

export function ThemeToggle() {
  const [pref, setPref] = useState<ThemePreference | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setPref(readStoredPref());
    });
  }, []);

  useEffect(() => {
    if (pref === null) return;
    applyDocumentTheme(pref);
    persistPref(pref);
  }, [pref]);

  useEffect(() => {
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyDocumentTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [pref]);

  function cycle() {
    setPref((current) => {
      const c = current ?? readStoredPref();
      if (c === "system") return "light";
      if (c === "light") return "dark";
      return "system";
    });
  }

  const iosClick = useIosSafeClick(cycle);

  const label =
    pref === "dark"
      ? "Dunkel"
      : pref === "light"
        ? "Hell"
        : pref === "system"
          ? "System"
          : "Farbschema";

  return (
    <button
      type="button"
      {...iosClick}
      className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-lg text-label transition hover:bg-card-muted"
      aria-label={`Farbschema: ${label}. Klicken zum Wechseln.`}
      title={`${label} — zu Hell, Dunkel oder System wechseln`}
    >
      {pref === "dark" ? (
        <MoonIcon />
      ) : pref === "light" ? (
        <SunIcon />
      ) : (
        <SystemIcon />
      )}
    </button>
  );
}

function SunIcon() {
  return (
    <svg className="pointer-events-none h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="pointer-events-none h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg className="pointer-events-none h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}
