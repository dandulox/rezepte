"use client";

import { useActionState, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import {
  adminBackfillRecipeTranslationsAction,
  adminSaveRecipeDisplayLocaleAction,
  type AdminBackfillTranslationsState,
  type AdminRecipeLocaleActionState,
} from "@/app/admin/actions";
import { AdminHiddenUiLocale } from "@/components/AdminHiddenUiLocale";
import { useUiLocale } from "@/components/UiLocaleProvider";
import { RECIPE_TRANSLATE_TARGETS } from "@/lib/recipe-translate-locales";
import type { RecipeViewLang } from "@/lib/recipe-translate-locales";
import type { SiteStrings } from "@/lib/site-i18n";

const localeInitial: AdminRecipeLocaleActionState = {};
const backfillInitial: AdminBackfillTranslationsState = {};

function recipeTargetLabel(
  code: string,
  rd: SiteStrings["admin"]["recipeDisplay"],
): string {
  switch (code) {
    case "en":
      return rd.targetEn;
    case "fr":
      return rd.targetFr;
    case "it":
      return rd.targetIt;
    case "es":
      return rd.targetEs;
    case "pl":
      return rd.targetPl;
    default:
      return code;
  }
}

export function AdminRecipeDisplayLocalePanel(props: {
  initialLocale: RecipeViewLang;
}) {
  const { strings: s } = useUiLocale();
  const rd = s.admin.recipeDisplay;
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
    <section className="admin-surface space-y-4">
      <div>
        <h2 className="text-lg font-medium text-foreground">{rd.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{rd.hint}</p>
      </div>

      <form
        key={props.initialLocale}
        action={saveAction}
        className="space-y-3 border-t border-border pt-4"
      >
        <AdminHiddenUiLocale />
        <div>
          <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-label">
            {rd.displayLanguage}
          </label>
          <select
            id={selectId}
            name="recipeDisplayLocale"
            defaultValue={props.initialLocale}
            className="input-field max-w-md w-full px-3 py-2 text-sm"
          >
            <option value="de">{rd.optionDe}</option>
            {RECIPE_TRANSLATE_TARGETS.map((t) => (
              <option key={t.code} value={t.code}>
                {recipeTargetLabel(t.code, rd)}
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
            {rd.saved}
          </p>
        ) : null}
        <button type="submit" disabled={savePending} className="admin-btn-primary">
          {savePending ? "…" : rd.save}
        </button>
      </form>

      <form
        action={backfillAction}
        className="space-y-3 border-t border-border pt-4"
        onSubmit={(e) => {
          if (!window.confirm(rd.backfillConfirm)) {
            e.preventDefault();
          }
        }}
      >
        <AdminHiddenUiLocale />
        <p className="text-sm text-muted-foreground">{rd.backfillHint}</p>
        {backfillState.error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {backfillState.error}
          </p>
        ) : null}
        {backfillState.ok ? (
          <p className="text-sm text-[var(--admin-success-fg)]" role="status">
            {rd.backfillDone(
              backfillState.created ?? 0,
              backfillState.skipped ?? 0,
              backfillState.failed ?? 0,
            )}
          </p>
        ) : null}
        <button type="submit" disabled={backfillPending} className="admin-btn-secondary">
          {backfillPending ? "…" : rd.backfillButton}
        </button>
      </form>
    </section>
  );
}
