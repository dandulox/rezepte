"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { AdminAppearancePanel } from "@/app/admin/AdminAppearancePanel";
import {
  adminChangePinAction,
  adminLogoutAction,
  adminResetRecipeDislikesAction,
  adminResetRecipeLikesAction,
  adminResetRecipeVotesAction,
  type AdminActionState,
  type AdminVotesResetState,
} from "@/app/admin/actions";
import type { AdminThemeColors } from "@/lib/admin-theme-defaults";

const changeInitial: AdminActionState = {};
const votesResetInitial: AdminVotesResetState = {};

type AdminTab = "security" | "votes" | "appearance";

const tabBtn =
  "rounded-t-lg border-b-2 border-transparent px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)]";

export function AdminPanel({ initialAppearance }: { initialAppearance: AdminThemeColors }) {
  const [tab, setTab] = useState<AdminTab>("security");
  const securityTabId = useId();
  const votesTabId = useId();
  const appearanceTabId = useId();
  const securityPanelId = useId();
  const votesPanelId = useId();
  const appearancePanelId = useId();

  const [changeState, changeAction, changePending] = useActionState(
    adminChangePinAction,
    changeInitial,
  );
  const [likesState, likesAction, likesPending] = useActionState(
    adminResetRecipeLikesAction,
    votesResetInitial,
  );
  const [dislikesState, dislikesAction, dislikesPending] = useActionState(
    adminResetRecipeDislikesAction,
    votesResetInitial,
  );
  const [allVotesState, allVotesAction, allVotesPending] = useActionState(
    adminResetRecipeVotesAction,
    votesResetInitial,
  );

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (changeState.ok) {
      formRef.current?.reset();
    }
  }, [changeState.ok]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--admin-accent)]">
        Adminbereich
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sicherheit, Darstellung und Bewertungen.
      </p>

      <div
        role="tablist"
        aria-label="Adminbereich"
        className="mt-6 flex flex-wrap gap-1 border-b border-border"
      >
        <button
          type="button"
          role="tab"
          id={securityTabId}
          aria-controls={securityPanelId}
          aria-selected={tab === "security"}
          tabIndex={tab === "security" ? 0 : -1}
          data-active={tab === "security" ? "true" : undefined}
          className={`${tabBtn} text-label hover:text-foreground data-[active]:border-[var(--admin-accent)] data-[active]:text-[var(--admin-accent)]`}
          onClick={() => setTab("security")}
        >
          Sicherheit
        </button>
        <button
          type="button"
          role="tab"
          id={votesTabId}
          aria-controls={votesPanelId}
          aria-selected={tab === "votes"}
          tabIndex={tab === "votes" ? 0 : -1}
          data-active={tab === "votes" ? "true" : undefined}
          className={`${tabBtn} text-label hover:text-foreground data-[active]:border-[var(--admin-accent)] data-[active]:text-[var(--admin-accent)]`}
          onClick={() => setTab("votes")}
        >
          Bewertungen
        </button>
        <button
          type="button"
          role="tab"
          id={appearanceTabId}
          aria-controls={appearancePanelId}
          aria-selected={tab === "appearance"}
          tabIndex={tab === "appearance" ? 0 : -1}
          data-active={tab === "appearance" ? "true" : undefined}
          className={`${tabBtn} text-label hover:text-foreground data-[active]:border-[var(--admin-accent)] data-[active]:text-[var(--admin-accent)]`}
          onClick={() => setTab("appearance")}
        >
          Darstellung
        </button>
      </div>

      <div
        role="tabpanel"
        id={securityPanelId}
        aria-labelledby={securityTabId}
        hidden={tab !== "security"}
        className="pt-6"
      >
        <section className="admin-surface">
          <h2 className="text-lg font-medium text-foreground">PIN ändern</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Aktuellen PIN eingeben, dann viermal die neue PIN (nur Ziffern).
          </p>
          <form ref={formRef} action={changeAction} className="mt-4 space-y-3">
            <div>
              <label htmlFor="currentPin" className="mb-1 block text-xs font-medium text-label">
                Aktueller PIN
              </label>
              <input
                id="currentPin"
                name="currentPin"
                type="password"
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                required
                className="admin-input w-full max-w-xs font-mono tracking-widest"
              />
            </div>
            <div>
              <label htmlFor="newPin" className="mb-1 block text-xs font-medium text-label">
                Neuer PIN
              </label>
              <input
                id="newPin"
                name="newPin"
                type="password"
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                required
                className="admin-input w-full max-w-xs font-mono tracking-widest"
              />
            </div>
            <div>
              <label htmlFor="confirmPin" className="mb-1 block text-xs font-medium text-label">
                Neuer PIN (Wiederholung)
              </label>
              <input
                id="confirmPin"
                name="confirmPin"
                type="password"
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                required
                className="admin-input w-full max-w-xs font-mono tracking-widest"
              />
            </div>
            {changeState.error ? (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {changeState.error}
              </p>
            ) : null}
            {changeState.ok ? (
              <p className="text-sm text-[var(--admin-success-fg)]" role="status">
                PIN wurde geändert.
              </p>
            ) : null}
            <button type="submit" disabled={changePending} className="admin-btn-primary">
              {changePending ? "…" : "PIN speichern"}
            </button>
          </form>
        </section>
      </div>

      <div
        role="tabpanel"
        id={votesPanelId}
        aria-labelledby={votesTabId}
        hidden={tab !== "votes"}
        className="pt-6"
      >
        <section className="admin-surface space-y-6">
          <div>
            <h2 className="text-lg font-medium text-foreground">Likes &amp; Dislikes</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Zähler pro Art zurücksetzen oder alle Bewertungen auf einmal entfernen. Gilt für alle Rezepte.
            </p>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="text-sm font-medium text-foreground">Nur Likes</h3>
            <form
              action={likesAction}
              className="space-y-3"
              onSubmit={(e) => {
                if (
                  !window.confirm(
                    "Alle Like-Einträge unwiderruflich löschen? Dislikes bleiben erhalten.",
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              {likesState.error ? (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {likesState.error}
                </p>
              ) : null}
              {likesState.ok ? (
                <p className="text-sm text-[var(--admin-success-fg)]" role="status">
                  {likesState.count !== undefined
                    ? `${likesState.count} Like-Einträge gelöscht.`
                    : "Likes zurückgesetzt."}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={likesPending}
                className="rounded-lg border border-amber-500/50 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-950 transition hover:bg-amber-100 disabled:opacity-60 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-950/70"
              >
                {likesPending ? "…" : "Alle Likes zurücksetzen"}
              </button>
            </form>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="text-sm font-medium text-foreground">Nur Dislikes</h3>
            <form
              action={dislikesAction}
              className="space-y-3"
              onSubmit={(e) => {
                if (
                  !window.confirm(
                    "Alle Dislike-Einträge unwiderruflich löschen? Likes bleiben erhalten.",
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              {dislikesState.error ? (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {dislikesState.error}
                </p>
              ) : null}
              {dislikesState.ok ? (
                <p className="text-sm text-[var(--admin-success-fg)]" role="status">
                  {dislikesState.count !== undefined
                    ? `${dislikesState.count} Dislike-Einträge gelöscht.`
                    : "Dislikes zurückgesetzt."}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={dislikesPending}
                className="rounded-lg border border-violet-400/50 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-950 transition hover:bg-violet-100 disabled:opacity-60 dark:border-violet-500/40 dark:bg-violet-950/40 dark:text-violet-100 dark:hover:bg-violet-950/70"
              >
                {dislikesPending ? "…" : "Alle Dislikes zurücksetzen"}
              </button>
            </form>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="text-sm font-medium text-foreground">Alles</h3>
            <form
              action={allVotesAction}
              className="space-y-3"
              onSubmit={(e) => {
                if (
                  !window.confirm(
                    "Alle Likes und Dislikes unwiderruflich löschen? Dies betrifft alle Rezepte.",
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              {allVotesState.error ? (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {allVotesState.error}
                </p>
              ) : null}
              {allVotesState.ok ? (
                <p className="text-sm text-[var(--admin-success-fg)]" role="status">
                  {allVotesState.count !== undefined
                    ? `${allVotesState.count} Einträge gelöscht.`
                    : "Zähler zurückgesetzt."}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={allVotesPending}
                className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-800 transition hover:bg-red-100 disabled:opacity-60 dark:border-red-800/70 dark:bg-red-950/50 dark:text-red-200 dark:hover:bg-red-950/80"
              >
                {allVotesPending ? "…" : "Alle Likes & Dislikes zurücksetzen"}
              </button>
            </form>
          </div>
        </section>
      </div>

      <div
        role="tabpanel"
        id={appearancePanelId}
        aria-labelledby={appearanceTabId}
        hidden={tab !== "appearance"}
        className="pt-6"
      >
        <AdminAppearancePanel initial={initialAppearance} />
      </div>

      <form action={adminLogoutAction} className="mt-8">
        <button type="submit" className="admin-btn-secondary">
          Abmelden
        </button>
      </form>
    </div>
  );
}
