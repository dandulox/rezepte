"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminResetThemeAction,
  adminSaveThemeAction,
  type AdminThemeActionState,
} from "@/app/admin/actions";
import type { AdminThemeColors } from "@/lib/admin-theme-defaults";

const themeInitial: AdminThemeActionState = {};

const LIGHT_LABELS: Record<
  "adminAccentLight" | "adminAccentLightHover" | "adminAccentLightFg" | "adminSuccessLight",
  string
> = {
  adminAccentLight: "Akzent",
  adminAccentLightHover: "Akzent (Hover)",
  adminAccentLightFg: "Schrift auf Buttons",
  adminSuccessLight: "Erfolgsmeldungen",
};

const DARK_LABELS: Record<
  "adminAccentDark" | "adminAccentDarkHover" | "adminAccentDarkFg" | "adminSuccessDark",
  string
> = {
  adminAccentDark: "Akzent",
  adminAccentDarkHover: "Akzent (Hover)",
  adminAccentDarkFg: "Schrift auf Buttons",
  adminSuccessDark: "Erfolgsmeldungen",
};

const LIGHT_ORDER = [
  "adminAccentLight",
  "adminAccentLightHover",
  "adminAccentLightFg",
  "adminSuccessLight",
] as const satisfies readonly (keyof AdminThemeColors)[];

const DARK_ORDER = [
  "adminAccentDark",
  "adminAccentDarkHover",
  "adminAccentDarkFg",
  "adminSuccessDark",
] as const satisfies readonly (keyof AdminThemeColors)[];

type SchemeTab = "light" | "dark";

const schemeTabBtn =
  "rounded-t-lg border-b-2 border-transparent px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)]";

function ThemeColorField({
  fieldKey,
  label,
  value,
  onChange,
}: {
  fieldKey: keyof AdminThemeColors;
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      <label htmlFor={id} className="min-w-[12rem] flex-1 text-xs font-medium text-label">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-14 shrink-0 cursor-pointer rounded border border-border-strong bg-input"
          aria-label={label}
        />
        <code className="rounded border border-border bg-card-muted px-2 py-1 font-mono text-xs text-label">
          {value}
        </code>
      </div>
      <input type="hidden" name={fieldKey} value={value} />
    </div>
  );
}

export function AdminAppearancePanel({ initial }: { initial: AdminThemeColors }) {
  const router = useRouter();
  const [schemeTab, setSchemeTab] = useState<SchemeTab>("light");
  const lightTabId = useId();
  const darkTabId = useId();
  const lightPanelId = useId();
  const darkPanelId = useId();

  const [colors, setColors] = useState<AdminThemeColors>(initial);
  const [saveState, saveAction, savePending] = useActionState(adminSaveThemeAction, themeInitial);
  const [resetState, resetAction, resetPending] = useActionState(
    adminResetThemeAction,
    themeInitial,
  );

  useEffect(() => {
    setColors(initial);
  }, [initial]);

  useEffect(() => {
    if (saveState.ok || resetState.ok) {
      router.refresh();
    }
  }, [saveState.ok, resetState.ok, router]);

  return (
    <section className="admin-surface space-y-4">
      <div>
        <h2 className="text-lg font-medium text-foreground">Darstellung</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Akzentfarben für den Adminbereich (inkl. Login). Werte im Format #RRGGBB — getrennt für helles und
          dunkles Erscheinungsbild.
        </p>
      </div>

      <form action={saveAction} className="space-y-0 border-t border-border pt-4">
        <div
          role="tablist"
          aria-label="Farbschema"
          className="flex flex-wrap gap-1 border-b border-border"
        >
          <button
            type="button"
            role="tab"
            id={lightTabId}
            aria-controls={lightPanelId}
            aria-selected={schemeTab === "light"}
            tabIndex={schemeTab === "light" ? 0 : -1}
            data-active={schemeTab === "light" ? "true" : undefined}
            className={`${schemeTabBtn} text-label hover:text-foreground data-[active]:border-[var(--admin-accent)] data-[active]:text-[var(--admin-accent)]`}
            onClick={() => setSchemeTab("light")}
          >
            Hell
          </button>
          <button
            type="button"
            role="tab"
            id={darkTabId}
            aria-controls={darkPanelId}
            aria-selected={schemeTab === "dark"}
            tabIndex={schemeTab === "dark" ? 0 : -1}
            data-active={schemeTab === "dark" ? "true" : undefined}
            className={`${schemeTabBtn} text-label hover:text-foreground data-[active]:border-[var(--admin-accent)] data-[active]:text-[var(--admin-accent)]`}
            onClick={() => setSchemeTab("dark")}
          >
            Dunkel
          </button>
        </div>

        <div
          role="tabpanel"
          id={lightPanelId}
          aria-labelledby={lightTabId}
          hidden={schemeTab !== "light"}
          className="space-y-1 pt-4"
        >
          {LIGHT_ORDER.map((key) => (
            <ThemeColorField
              key={key}
              fieldKey={key}
              label={LIGHT_LABELS[key]}
              value={colors[key]}
              onChange={(next) => setColors((c) => ({ ...c, [key]: next }))}
            />
          ))}
        </div>

        <div
          role="tabpanel"
          id={darkPanelId}
          aria-labelledby={darkTabId}
          hidden={schemeTab !== "dark"}
          className="space-y-1 pt-4"
        >
          {DARK_ORDER.map((key) => (
            <ThemeColorField
              key={key}
              fieldKey={key}
              label={DARK_LABELS[key]}
              value={colors[key]}
              onChange={(next) => setColors((c) => ({ ...c, [key]: next }))}
            />
          ))}
        </div>

        {saveState.error ? (
          <p className="pt-4 text-sm text-red-600 dark:text-red-400" role="alert">
            {saveState.error}
          </p>
        ) : null}
        {saveState.ok ? (
          <p className="pt-4 text-sm text-[var(--admin-success-fg)]" role="status">
            Farben gespeichert.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3 pt-4">
          <button type="submit" disabled={savePending} className="admin-btn-primary">
            {savePending ? "…" : "Farben speichern"}
          </button>
        </div>
      </form>

      <form
        action={resetAction}
        className="border-t border-border pt-4"
        onSubmit={(e) => {
          if (!window.confirm("Alle Admin-Farben auf Standard zurücksetzen?")) {
            e.preventDefault();
          }
        }}
      >
        <p className="mb-3 text-sm text-muted-foreground">
          Setzt alle Farben auf die mitgelieferten Standardwerte (Indigo) zurück.
        </p>
        {resetState.error ? (
          <p className="mb-2 text-sm text-red-600 dark:text-red-400" role="alert">
            {resetState.error}
          </p>
        ) : null}
        {resetState.ok ? (
          <p className="mb-2 text-sm text-[var(--admin-success-fg)]" role="status">
            Standardfarben wiederhergestellt.
          </p>
        ) : null}
        <button type="submit" disabled={resetPending} className="admin-btn-secondary">
          {resetPending ? "…" : "Standard wiederherstellen"}
        </button>
      </form>
    </section>
  );
}
