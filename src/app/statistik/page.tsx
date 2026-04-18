import Link from "next/link";
import { getCookStatsSnapshot } from "@/lib/cook-stats";

export const dynamic = "force-dynamic";

const longDateFmt = new Intl.DateTimeFormat("de-DE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function StatBarBlock(props: {
  title: string;
  description?: string;
  rows: { key: string; label: string; count: number }[];
  /** Längere Y-Achsen-Labels (z. B. Kategorien) */
  wideLabels?: boolean;
}) {
  const max = Math.max(1, ...props.rows.map((r) => r.count));
  const labelWidth = props.wideLabels ? "sm:w-44" : "sm:w-28";
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-md ring-1 ring-ring-card dark:shadow-xl">
      <h2 className="text-lg font-semibold text-foreground">{props.title}</h2>
      {props.description ? (
        <p className="mt-1 text-sm text-muted-foreground">{props.description}</p>
      ) : null}
      <div className="mt-5 space-y-3">
        {props.rows.map((row) => {
          const pct = max > 0 ? Math.round((row.count / max) * 100) : 0;
          return (
            <div key={row.key} className="flex min-h-8 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
              <span
                className={`w-full shrink-0 text-sm leading-snug text-muted-foreground ${labelWidth}`}
              >
                {row.label}
              </span>
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div
                  className="flex h-7 min-w-0 flex-1 overflow-hidden rounded-md bg-card-muted"
                  title={`${row.count}`}
                >
                  <div
                    className="h-full rounded-md bg-emerald-600/90 dark:bg-emerald-500/85"
                    style={{
                      width: `${pct}%`,
                      minWidth: row.count > 0 ? "6px" : "0px",
                    }}
                  />
                </div>
                <span className="w-9 shrink-0 text-right text-sm tabular-nums text-foreground">
                  {row.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FavoriteRankList(props: {
  title: string;
  description: string;
  emptyHint: string;
  rows: { recipeId: string; title: string; value: number; suffix: string }[];
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-md ring-1 ring-ring-card dark:shadow-xl">
      <h2 className="text-lg font-semibold text-foreground">{props.title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{props.description}</p>
      {props.rows.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">{props.emptyHint}</p>
      ) : (
        <ol className="mt-5 space-y-3">
          {props.rows.map((r, i) => (
            <li key={r.recipeId} className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm text-muted-foreground tabular-nums">{i + 1}.</span>
              <Link
                href={`/recipes/${r.recipeId}`}
                className="min-w-0 flex-1 text-sm font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
              >
                {r.title}
              </Link>
              <span className="text-sm tabular-nums text-foreground">
                {r.value}
                {r.suffix}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default async function StatistikPage() {
  const stats = await getCookStatsSnapshot();

  const hasCookData = stats.totalCooks > 0;
  const hasLikeData = stats.topRecipesByLikes.length > 0;

  const monthMax = Math.max(1, ...stats.byMonth.map((m) => m.count));
  const weekdayMax = Math.max(1, ...stats.byWeekday.map((w) => w.count));
  const categoryMax =
    stats.cooksByCategory.length > 0
      ? Math.max(1, ...stats.cooksByCategory.map((c) => c.count))
      : 1;

  const avgPerRecipe =
    stats.recipesWithLogs > 0 ? stats.totalCooks / stats.recipesWithLogs : 0;
  const avgLabel =
    stats.recipesWithLogs > 0
      ? new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(avgPerRecipe)
      : "—";

  let monthTrend: string | null = null;
  if (stats.lastMonthCount > 0) {
    const rel = Math.round(
      ((stats.thisMonthCount - stats.lastMonthCount) / stats.lastMonthCount) * 100,
    );
    if (rel > 0) monthTrend = `+${rel} % zum Vormonat`;
    else if (rel < 0) monthTrend = `${rel} % zum Vormonat`;
    else monthTrend = "unverändert zum Vormonat";
  } else if (stats.thisMonthCount > 0) {
    monthTrend = "im Vormonat keine Einträge";
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Kochstatistik</h1>
        <p className="mt-2 max-w-2xl text-label">
          Übersicht, wie oft Rezepte gekocht wurden und wann — basierend auf deinen manuellen Einträgen
          auf den Rezeptseiten.
        </p>
      </header>

      {!hasCookData && !hasLikeData ? (
        <div className="rounded-2xl border border-dashed border-border-strong bg-card-muted/40 px-6 py-12 text-center">
          <p className="text-lg font-medium text-foreground">Noch keine Daten</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Trage auf den Rezeptseiten unter „Gekocht“ ein, wann du etwas zubereitet hast, und nutze
            die Like-Buttons — dann erscheinen Auswertungen hier.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
          >
            Zur Rezeptübersicht
          </Link>
        </div>
      ) : (
        <>
          {!hasCookData && hasLikeData ? (
            <p className="mb-8 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-body dark:border-amber-400/20 dark:bg-amber-400/10">
              Noch keine Einträge im Kochprotokoll — die folgende Liste zeigt nur{" "}
              <strong className="font-medium text-foreground">Likes</strong>. Sobald du Mahlzeiten
              protokollierst, erscheinen Kategorie-Grafik, Häufigkeit und Zeitverläufe.
            </p>
          ) : null}

          {hasCookData ? (
          <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm ring-1 ring-ring-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Gekocht (gesamt)
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
                {stats.totalCooks}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm ring-1 ring-ring-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Dieser Monat
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
                {stats.thisMonthCount}
              </p>
              {monthTrend ? (
                <p className="mt-1 text-xs text-muted-foreground">{monthTrend}</p>
              ) : null}
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm ring-1 ring-ring-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Rezepte mit Eintrag
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
                {stats.recipesWithLogs}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Ø {avgLabel}× pro Rezept (mit Protokoll)
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm ring-1 ring-ring-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Zeitraum
              </p>
              <p className="mt-2 text-sm leading-snug text-body">
                {stats.firstCookAt ? (
                  <>
                    Erster Eintrag:{" "}
                    <time dateTime={stats.firstCookAt}>
                      {longDateFmt.format(new Date(stats.firstCookAt))}
                    </time>
                  </>
                ) : null}
              </p>
              {stats.lastCookAt ? (
                <p className="mt-2 text-sm leading-snug text-body">
                  Zuletzt:{" "}
                  <time dateTime={stats.lastCookAt}>
                    {longDateFmt.format(new Date(stats.lastCookAt))}
                  </time>
                </p>
              ) : null}
            </div>
          </div>
          ) : null}

          {hasCookData ? (
          <div className="grid gap-8 lg:grid-cols-2">
            <StatBarBlock
              title="Letzte 12 Monate"
              description="Anzahl protokollierter Mahlzeiten pro Monat."
              rows={stats.byMonth.map((m) => ({
                key: m.key,
                label: m.label,
                count: m.count,
              }))}
            />
            <StatBarBlock
              title="Wochentag"
              description="Verteilung nach Kalendertag des Eintrags (lokale Zeit)."
              rows={stats.byWeekday.map((w) => ({
                key: w.label,
                label: w.label,
                count: w.count,
              }))}
            />
          </div>
          ) : null}

          {hasCookData ? (
            <div className="mt-8">
              <StatBarBlock
                title="Gekocht nach Kategorie"
                description="Jeder Protokolleintrag zählt — zugeordnet über die Rezept-Kategorie (Gerichtstyp). Ohne Kategorie zählt „Ohne Kategorie“."
                wideLabels
                rows={stats.cooksByCategory.map((c) => ({
                  key: c.key,
                  label: c.label,
                  count: c.count,
                }))}
              />
            </div>
          ) : null}

          <div
            className={`mt-8 grid gap-8 ${hasCookData ? "lg:grid-cols-3" : "lg:grid-cols-1"}`}
          >
            {hasCookData ? (
              <FavoriteRankList
                title="Lieblingsgerichte (Häufigkeit)"
                description="Am häufigsten im Kochprotokoll — mehr Einträge, mehr Liebe beim Wiederholen."
                emptyHint="Noch keine Einträge."
                rows={stats.topRecipes.map((r) => ({
                  recipeId: r.recipeId,
                  title: r.title,
                  value: r.count,
                  suffix: "×",
                }))}
              />
            ) : null}

            <div className={!hasCookData && hasLikeData ? "mx-auto w-full max-w-lg" : undefined}>
              <FavoriteRankList
                title="Lieblingsgerichte (Likes)"
                description="Summe der Like-Klicks pro Rezept (jeder Klick zählt)."
                emptyHint="Noch keine Likes — auf der Rezeptseite 👍 tippen."
                rows={stats.topRecipesByLikes.map((r) => ({
                  recipeId: r.recipeId,
                  title: r.title,
                  value: r.likeCount,
                  suffix: " 👍",
                }))}
              />
            </div>

            {hasCookData ? (
              <section className="rounded-2xl border border-border bg-card p-6 shadow-md ring-1 ring-ring-card dark:shadow-xl">
                <h2 className="text-lg font-semibold text-foreground">Zuletzt gekocht</h2>
                <p className="mt-1 text-sm text-muted-foreground">Die neuesten Protokolleinträge.</p>
                <ul className="mt-5 divide-y divide-border rounded-xl border border-border">
                  {stats.recent.map((row) => (
                    <li
                      key={row.id}
                      className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
                    >
                      <Link
                        href={`/recipes/${row.recipeId}`}
                        className="min-w-0 font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
                      >
                        {row.title}
                      </Link>
                      <time
                        dateTime={row.cookedAt}
                        className="shrink-0 text-muted-foreground tabular-nums"
                      >
                        {longDateFmt.format(new Date(row.cookedAt))}
                      </time>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          {hasCookData ? (
            <p className="mt-10 text-center text-xs text-muted-foreground">
              Balkenhöhen jeweils relativ zum Maximum in der jeweiligen Grafik (Monate max. {monthMax},
              Wochentage {weekdayMax}, Kategorien {categoryMax}).
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
