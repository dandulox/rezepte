"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useIosSafeClick } from "@/lib/use-ios-safe-click";

const NAV_LINKS = [
  { href: "/recipes/kategorien", label: "Kategorien" },
  { href: "/favoriten", label: "Favoriten" },
  { href: "/plan", label: "Wochenplan" },
  { href: "/plan/einkauf", label: "Einkauf" },
] as const;

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none ${className ?? ""}`}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none ${className ?? ""}`}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const mounted = useIsClient();
  const menuToggle = useIosSafeClick(() => setOpen((v) => !v));

  useEffect(() => {
    if (!open) return;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const mobileMenu =
    open && mounted ? (
      <div
        id="site-mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Mobilmenü"
        className="fixed inset-x-0 bottom-0 z-[200] flex flex-col border-t border-border bg-background lg:hidden"
        style={{
          top: "calc(3.5rem + env(safe-area-inset-top, 0px))",
          maxHeight: "calc(100dvh - 3.5rem - env(safe-area-inset-top, 0px))",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          paddingLeft: "max(1rem, env(safe-area-inset-left, 0px))",
          paddingRight: "max(1rem, env(safe-area-inset-right, 0px))",
        }}
      >
        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain py-4" aria-label="Menüpunkte">
          <ul className="flex list-none flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block rounded-xl px-4 py-3.5 text-base font-medium text-foreground transition active:bg-card-muted"
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/recipes/new"
                className="mt-2 block rounded-xl bg-emerald-600 px-4 py-3.5 text-center text-base font-medium text-white transition hover:bg-emerald-700 active:bg-emerald-800"
                onClick={() => setOpen(false)}
              >
                Neues Rezept
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    ) : null;

  return (
    <header className="sticky top-0 z-50 pt-[env(safe-area-inset-top,0px)]">
      {/* Blur nur innen: backdrop-filter am äußeren Header macht fixed-Kinder in Safari/iPadOS zum falschen Containing Block */}
      <div className="border-b border-nav-border bg-background/95 dark:bg-zinc-950/95">
        <div className="relative z-[60] mx-auto flex max-w-6xl items-center justify-between gap-3 px-[max(1rem,env(safe-area-inset-left,0px))] py-3 pr-[max(1rem,env(safe-area-inset-right,0px))] sm:gap-4">
          <Link
            href="/"
            className="shrink-0 text-lg font-semibold tracking-tight text-foreground"
            onClick={() => setOpen(false)}
          >
            Rezeptbuch
          </Link>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
            <nav
              className="hidden items-center justify-end gap-1 text-sm font-medium lg:flex lg:gap-2"
              aria-label="Hauptnavigation"
            >
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-lg px-3 py-2 text-label transition hover:bg-card-muted"
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/recipes/new"
                className="rounded-lg bg-emerald-600 px-3 py-2 text-white transition hover:bg-emerald-700"
              >
                Neues Rezept
              </Link>
            </nav>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <ThemeToggle />
              <button
                type="button"
                {...menuToggle}
                className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-lg text-label transition hover:bg-card-muted lg:hidden"
                aria-expanded={open}
                aria-controls="site-mobile-nav"
                aria-label={open ? "Menü schließen" : "Menü öffnen"}
              >
                {open ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {mobileMenu ? createPortal(mobileMenu, document.body) : null}
    </header>
  );
}
