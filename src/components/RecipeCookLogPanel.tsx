"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  deleteRecipeCookLogAction,
  logRecipeCookedAction,
} from "@/app/recipes/cook-actions";

function todayYmdLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const dateFmt = new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function RecipeCookLogPanel(props: {
  recipeId: string;
  cookCount: number;
  recent: { id: string; cookedAt: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dateYmd, setDateYmd] = useState(() => todayYmdLocal());
  const [message, setMessage] = useState<string | null>(null);

  const recentSorted = useMemo(
    () =>
      [...props.recent].sort(
        (a, b) => new Date(b.cookedAt).getTime() - new Date(a.cookedAt).getTime(),
      ),
    [props.recent],
  );

  function refresh() {
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-md ring-1 ring-ring-card dark:shadow-xl">
      <h2 className="text-xl font-semibold text-foreground">Gekocht</h2>
      <p className="mt-3 text-sm font-medium text-body">
        Bisher <span className="tabular-nums text-foreground">{props.cookCount}</span>× gekocht
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-0 sm:min-w-[11rem]">
          <label htmlFor={`cook-date-${props.recipeId}`} className="mb-1 block text-xs font-medium text-muted-foreground">
            Datum
          </label>
          <input
            id={`cook-date-${props.recipeId}`}
            type="date"
            value={dateYmd}
            onChange={(e) => setDateYmd(e.target.value)}
            className="input-field w-full text-sm"
          />
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setMessage(null);
            startTransition(() => {
              void (async () => {
                const res = await logRecipeCookedAction(props.recipeId, dateYmd);
                if (!res.ok) setMessage(res.error);
                else {
                  setDateYmd(todayYmdLocal());
                  refresh();
                }
              })();
            });
          }}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
        >
          Eintrag hinzufügen
        </button>
      </div>
      {message ? (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {message}
        </p>
      ) : null}

      {recentSorted.length > 0 ? (
        <div className="mt-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Letzte Einträge
          </h3>
          <ul className="divide-y divide-border rounded-xl border border-border bg-card-muted/50">
            {recentSorted.slice(0, 8).map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
              >
                <span className="text-body">{dateFmt.format(new Date(row.cookedAt))}</span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (!window.confirm("Diesen Eintrag löschen?")) return;
                    startTransition(() => {
                      void (async () => {
                        await deleteRecipeCookLogAction(row.id);
                        refresh();
                      })();
                    });
                  }}
                  className="shrink-0 rounded-md border border-border-strong px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-card hover:text-foreground"
                >
                  Löschen
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
