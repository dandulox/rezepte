import {
  addWeeks,
  formatDateDe,
  formatWeekRangeDe,
  parseISODateLocal,
  planWeekSectionHeading,
  toISODateLocal,
} from "@/lib/week";
import { groupShoppingListByIngredientCategory } from "@/lib/shopping-print-group";
import { loadEinkaufPageData } from "../load-einkauf-data";
import { ShoppingPrintToolbar } from "./ShoppingPrintToolbar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Einkaufsliste · Druckansicht",
};

export default async function EinkaufDruckPage({
  searchParams,
}: {
  searchParams: Promise<{ w?: string }>;
}) {
  const { w } = await searchParams;
  const { weekAnchor, shopping } = await loadEinkaufPageData(w);
  const anchorDate = parseISODateLocal(weekAnchor);

  const weekBlocks = [0, 1, 2].map((offset) => {
    const mondayIso = toISODateLocal(addWeeks(anchorDate, offset));
    const weekShopping = shopping.filter((s) => s.weekStart === mondayIso);
    const grouped = groupShoppingListByIngredientCategory(weekShopping);
    return { mondayIso, offset, grouped };
  });

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @page { margin: 14mm; }
            @media print {
              .einkauf-print-no-print { display: none !important; }
              .einkauf-print-week-break { break-before: page; }
              .einkauf-print-group { break-inside: avoid; }
            }
          `,
        }}
      />
      <div className="mx-auto max-w-3xl px-4 py-8 text-foreground">
        <ShoppingPrintToolbar backHref={`/plan/einkauf?w=${weekAnchor}`} />

        <header className="mb-10 border-b border-border pb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Einkaufsliste</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Nur offene Einträge, sortiert nach Zutaten-Kategorie (wie in der Rezeptansicht).
          </p>
        </header>

        <div className="space-y-12">
          {weekBlocks.map((block, blockIdx) => (
            <section
              key={block.mondayIso}
              className={
                blockIdx > 0 ? "einkauf-print-week-break border-t border-border pt-10" : ""
              }
            >
              <h2 className="mb-6 text-xl font-semibold">
                {planWeekSectionHeading(block.offset, weekAnchor)}
                <span className="ml-2 text-base font-normal text-muted-foreground">
                  ({formatWeekRangeDe(block.mondayIso)})
                </span>
              </h2>

              {block.grouped.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Keine offenen Artikel für diese Woche.
                </p>
              ) : (
                <div className="space-y-8">
                  {block.grouped.map((g) => (
                    <div key={g.groupId} className="einkauf-print-group">
                      <h3 className="mb-3 border-b border-border pb-1 text-sm font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-400 print:text-black">
                        {g.label}
                      </h3>
                      <ul className="space-y-2 text-sm">
                        {g.items.map((row) => (
                          <li
                            key={row.id}
                            className="flex flex-col gap-0.5 border-b border-border/60 py-2 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                          >
                            <span className="font-medium text-foreground">{row.text}</span>
                            <span className="shrink-0 text-xs text-muted-foreground print:text-gray-600">
                              {row.recipeTitle} · {formatDateDe(row.date)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
