type Props = {
  steps: string[];
};

export function RecipeInstructions({ steps }: Props) {
  if (steps.length === 0) return null;

  return (
    <section
      className="rounded-2xl border border-border bg-card p-6 shadow-md ring-1 ring-ring-card dark:shadow-xl"
      aria-labelledby="recipe-instructions-heading"
    >
      <div className="mb-6 border-b border-border pb-4">
        <h2
          id="recipe-instructions-heading"
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          Zubereitung
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {steps.length} {steps.length === 1 ? "Schritt" : "Schritte"}
        </p>
      </div>

      <ol className="m-0 list-none space-y-0 p-0">
        {steps.map((step, i) => (
          <li key={i} className="flex items-stretch gap-4">
            <div className="relative flex w-9 shrink-0 justify-center self-stretch">
              {i < steps.length - 1 ? (
                <span
                  className="absolute top-10 bottom-0 left-1/2 z-0 w-px -translate-x-1/2 bg-border"
                  aria-hidden
                />
              ) : null}
              <span className="relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold tabular-nums text-white shadow-sm ring-2 ring-card dark:bg-emerald-500">
                {i + 1}
              </span>
            </div>
            <div
              className={`min-w-0 flex-1 pt-0.5 ${i < steps.length - 1 ? "pb-8" : "pb-0"}`}
            >
              <p className="leading-relaxed text-body">{step}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
