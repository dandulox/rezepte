"use client";

import { useActionState, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import {
  adminBackfillRecipeTranslationsAction,
  adminSaveRecipeDisplayLocaleAction,
  type AdminBackfillTranslationsState,
  type AdminRecipeLocaleActionState,
} from "@/app/admin/actions";
import { RECIPE_TRANSLATE_TARGETS } from "@/lib/recipe-translate-locales";
import type { RecipeViewLang } from "@/lib/recipe-translate-locales";

const localeInitial: AdminRecipeLocaleActionState = {};
const backfillInitial: AdminBackfillTranslationsState = {};

export function AdminRecipeDisplayLocalePanel(props: {
  initialLocale: RecipeViewLang;
}) {
  const router = useRouter();
  const selectId = useId();
  const [saveState, saveAction, savePending] = useActionState(
    adminSaveRecipeDisplayLocaleAction,
    localeInitial,
  );
  const [backfillState, backfillAction, backfillPending] = useActionState(
    adminBackfillRecipeTranslationsAction,
    backfillInitial,
  );

  useEffect(() => {
    if (saveState.ok || backfillState.ok) {
      router.refresh();
    }
  }, [saveState.ok, backfillState.ok, router]);

  return (
    <section className="admin-surface mb-8 space-y-4">
      <div>
        <h2 className="text-lg font-medium text-foreground">Rezept-Anzeige</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sprache für Rezepttexte (Titel, Zutaten, Schritte) auf allen Rezeptseiten. Übersetzungen werden
          lokal gespeichert; ohne gespeicherte Übersetzung wird das deutsche Original angezeigt.
        </p>
      </div>

      <form
        key={props.initialLocale}
        action={saveAction}
        className="space-y-3 border-t border-border pt-4"
      >
        <div>
          <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-label">
            Anzeigesprache
          </label>
          <select
            id={selectId}
            name="recipeDisplayLocale"
            defaultValue={props.initialLocale}
            className="input-field max-w-md w-full px-3 py-2 text-sm"
          >
            <option value="de">Deutsch (Original)</option>
            {RECIPE_TRANSLATE_TARGETS.map((t) => (
              <option key={t.code} value={t.code}>
                {t.labelDe}
              </option>
            ))}
          </select>
        </div>
        {saveState.error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {saveState.error}
          </p>
        ) : null}
        {saveState.ok ? (
          <p className="text-sm text-[var(--admin-success-fg)]" role="status">
            Anzeigesprache gespeichert.
          </p>
        ) : null}
        <button type="submit" disabled={savePending} className="admin-btn-primary">
          {savePending ? "…" : "Speichern"}
        </button>
      </form>

      <form
        action={backfillAction}
        className="space-y-3 border-t border-border pt-4"
        onSubmit={(e) => {
          if (
            !window.confirm(
              "Für alle Rezepte fehlende Übersetzungen in der aktuell gespeicherten Anzeigesprache erzeugen? Das kann je nach Anzahl der Rezepte und Übersetzungsdienst einige Minuten dauern und ruft einen externen Dienst auf.",
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        <p className="text-sm text-muted-foreground">
          Erzeugt fehlende Übersetzungen nur für die <strong>gespeicherte</strong> Anzeigesprache (nicht
          Deutsch). Bereits vorhandene Übersetzungen werden übersprungen.
        </p>
        {backfillState.error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {backfillState.error}
          </p>
        ) : null}
        {backfillState.ok ? (
          <p className="text-sm text-[var(--admin-success-fg)]" role="status">
            Fertig: {backfillState.created ?? 0} neu, {backfillState.skipped ?? 0} schon vorhanden
            {backfillState.failed ? `, ${backfillState.failed} fehlgeschlagen` : ""}.
          </p>
        ) : null}
        <button type="submit" disabled={backfillPending} className="admin-btn-secondary">
          {backfillPending ? "…" : "Fehlende Übersetzungen erzeugen"}
        </button>
      </form>
    </section>
  );
}
