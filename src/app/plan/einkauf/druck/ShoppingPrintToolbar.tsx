"use client";

import Link from "next/link";

export function ShoppingPrintToolbar({ backHref }: { backHref: string }) {
  return (
    <div className="einkauf-print-no-print mb-8 flex flex-wrap items-center gap-3">
      <Link
        href={backHref}
        className="rounded-lg border border-border-strong px-3 py-2 text-sm font-medium text-body hover:bg-card-muted"
      >
        ← Zur Einkaufsliste
      </Link>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        Drucken
      </button>
    </div>
  );
}
