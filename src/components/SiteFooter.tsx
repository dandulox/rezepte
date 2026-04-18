import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-nav-border bg-background/95 dark:bg-zinc-950/95">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-[max(1rem,env(safe-area-inset-left,0px))] py-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] text-xs leading-5">
        <nav
          aria-label="Fußzeilen-Navigation"
          className="flex min-w-0 flex-1 flex-wrap items-center gap-x-0.5 gap-y-1 font-medium sm:gap-x-1"
        >
          <Link
            href="/recipes/kategorien"
            className="inline-flex items-center rounded-md px-2 py-0.5 text-label transition hover:bg-card-muted"
          >
            Kategorien
          </Link>
          <Link
            href="/statistik"
            className="inline-flex items-center rounded-md px-2 py-0.5 text-label transition hover:bg-card-muted"
          >
            Statistik
          </Link>
          <Link
            href="/plan"
            className="inline-flex items-center rounded-md px-2 py-0.5 text-label transition hover:bg-card-muted"
          >
            Wochenplan
          </Link>
          <Link
            href="/plan/einkauf"
            className="inline-flex items-center rounded-md px-2 py-0.5 text-label transition hover:bg-card-muted"
          >
            Einkauf
          </Link>
          <Link
            href="/recipes/new"
            className="inline-flex items-center rounded-md px-2 py-0.5 text-label transition hover:bg-card-muted"
          >
            Neues Rezept
          </Link>
          <Link
            href="/admin/login"
            className="inline-flex items-center rounded-md px-2 py-0.5 text-label transition hover:bg-card-muted"
          >
            Admin
          </Link>
        </nav>
        <p className="inline-flex shrink-0 items-center text-muted-foreground">
          <Link href="/" className="transition hover:text-label">
            Rezeptbuch
          </Link>{" "}
          <span className="tabular-nums">2026</span>
        </p>
      </div>
    </footer>
  );
}
