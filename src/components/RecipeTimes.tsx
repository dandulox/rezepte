import { formatRecipeDurationLabel } from "@/lib/duration-format";

type Props = {
  prepTime: string | null;
  cookTime: string | null;
  totalTime: string | null;
  /** Standard: deutsche Beschriftungen */
  labels?: { prep: string; cook: string; total: string };
};

export function RecipeTimes({
  prepTime,
  cookTime,
  totalTime,
  labels,
}: Props) {
  const prep = formatRecipeDurationLabel(prepTime);
  const cook = formatRecipeDurationLabel(cookTime);
  const total = formatRecipeDurationLabel(totalTime);

  if (!prep && !cook && !total) return null;

  const L = labels ?? {
    prep: "Vorbereitung",
    cook: "Arbeitszeit",
    total: "Gesamt",
  };

  const rows: { label: string; value: string }[] = [];
  if (prep) rows.push({ label: L.prep, value: prep });
  if (cook) rows.push({ label: L.cook, value: cook });
  if (total) rows.push({ label: L.total, value: total });

  return (
    <dl className="mb-8 grid gap-3 rounded-2xl border border-border bg-card px-4 py-4 text-sm sm:grid-cols-3">
      {rows.map((row) => (
        <div key={row.label}>
          <dt className="font-medium text-muted-foreground">{row.label}</dt>
          <dd className="mt-1 text-foreground">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
