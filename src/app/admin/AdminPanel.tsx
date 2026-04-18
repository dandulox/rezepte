"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { AdminAppearancePanel } from "@/app/admin/AdminAppearancePanel";
import { AdminRecipeDisplayLocalePanel } from "@/app/admin/AdminRecipeDisplayLocalePanel";
import { AdminTaxonomyPanel } from "@/app/admin/AdminTaxonomyPanel";
import {
  adminChangePinAction,
  adminLogoutAction,
  adminResetRecipeDislikesAction,
  adminResetRecipeLikesAction,
  adminResetRecipeVotesAction,
  type AdminActionState,
  type AdminVotesResetState,
} from "@/app/admin/actions";
import { AdminHiddenUiLocale } from "@/components/AdminHiddenUiLocale";
import { useUiLocale } from "@/components/UiLocaleProvider";
import type { AdminThemeColors } from "@/lib/admin-theme-defaults";
import type { RecipeViewLang } from "@/lib/recipe-translate-locales";

const changeInitial: AdminActionState = {};
const votesResetInitial: AdminVotesResetState = {};

type AdminTab = "security" | "votes" | "appearance" | "taxonomy";

const tabBtn =
  "rounded-t-lg border-b-2 border-transparent px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)]";

type TaxonomyCategoryRow = {
  id: string;
  labelDe: string;
  labelEn: string;
  sortOrder: number;
};

type TaxonomyDietRow = {
  id: string;
  labelDe: string;
  labelEn: string;
  sortOrder: number;
  isMeat: boolean;
  searchExtra: string;
};

export function AdminPanel({
  initialAppearance,
  initialRecipeDisplayLocale,
  initialCategoryDefs,
  initialDietKindDefs,
}: {
  initialAppearance: AdminThemeColors;
  initialRecipeDisplayLocale: RecipeViewLang;
  initialCategoryDefs: TaxonomyCategoryRow[];
  initialDietKindDefs: TaxonomyDietRow[];
}) {
  const { strings: s } = useUiLocale();
  const p = s.admin.panel;
  const sec = s.admin.security;
  const v = s.admin.votes;
  const [tab, setTab] = useState<AdminTab>("security");
  const securityTabId = useId();
  const votesTabId = useId();
  const appearanceTabId = useId();
  const taxonomyTabId = useId();
  const securityPanelId = useId();
  const votesPanelId = useId();
  const appearancePanelId = useId();
  const taxonomyPanelId = useId();

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
        {p.title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{p.subtitle}</p>

      <div
        role="tablist"
        aria-label={p.tabListAria}
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
          {p.tabSecurity}
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
          {p.tabVotes}
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
          {p.tabAppearance}
        </button>
        <button
          type="button"
          role="tab"
          id={taxonomyTabId}
          aria-controls={taxonomyPanelId}
          aria-selected={tab === "taxonomy"}
          tabIndex={tab === "taxonomy" ? 0 : -1}
          data-active={tab === "taxonomy" ? "true" : undefined}
          className={`${tabBtn} text-label hover:text-foreground data-[active]:border-[var(--admin-accent)] data-[active]:text-[var(--admin-accent)]`}
          onClick={() => setTab("taxonomy")}
        >
          {p.tabTaxonomy}
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
          <h2 className="text-lg font-medium text-foreground">{sec.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{sec.hint}</p>
          <form ref={formRef} action={changeAction} className="mt-4 space-y-3">
            <AdminHiddenUiLocale />
            <div>
              <label htmlFor="currentPin" className="mb-1 block text-xs font-medium text-label">
                {sec.currentPin}
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
                {sec.newPin}
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
                {sec.confirmPin}
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
                {sec.pinChanged}
              </p>
            ) : null}
            <button type="submit" disabled={changePending} className="admin-btn-primary">
              {changePending ? "…" : sec.savePin}
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
            <h2 className="text-lg font-medium text-foreground">{v.sectionTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{v.sectionHint}</p>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="text-sm font-medium text-foreground">{v.likesOnlyTitle}</h3>
            <form
              action={likesAction}
              className="space-y-3"
              onSubmit={(e) => {
                if (!window.confirm(v.confirmLikes)) {
                  e.preventDefault();
                }
              }}
            >
              <AdminHiddenUiLocale />
              {likesState.error ? (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {likesState.error}
                </p>
              ) : null}
              {likesState.ok ? (
                <p className="text-sm text-[var(--admin-success-fg)]" role="status">
                  {likesState.count !== undefined
                    ? v.deletedLikes(likesState.count)
                    : v.resetLikesFallback}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={likesPending}
                className="rounded-lg border border-amber-500/50 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-950 transition hover:bg-amber-100 disabled:opacity-60 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-950/70"
              >
                {likesPending ? "…" : v.resetLikes}
              </button>
            </form>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="text-sm font-medium text-foreground">{v.dislikesOnlyTitle}</h3>
            <form
              action={dislikesAction}
              className="space-y-3"
              onSubmit={(e) => {
                if (!window.confirm(v.confirmDislikes)) {
                  e.preventDefault();
                }
              }}
            >
              <AdminHiddenUiLocale />
              {dislikesState.error ? (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {dislikesState.error}
                </p>
              ) : null}
              {dislikesState.ok ? (
                <p className="text-sm text-[var(--admin-success-fg)]" role="status">
                  {dislikesState.count !== undefined
                    ? v.deletedDislikes(dislikesState.count)
                    : v.resetDislikesFallback}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={dislikesPending}
                className="rounded-lg border border-violet-400/50 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-950 transition hover:bg-violet-100 disabled:opacity-60 dark:border-violet-500/40 dark:bg-violet-950/40 dark:text-violet-100 dark:hover:bg-violet-950/70"
              >
                {dislikesPending ? "…" : v.resetDislikes}
              </button>
            </form>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <h3 className="text-sm font-medium text-foreground">{v.allTitle}</h3>
            <form
              action={allVotesAction}
              className="space-y-3"
              onSubmit={(e) => {
                if (!window.confirm(v.confirmAll)) {
                  e.preventDefault();
                }
              }}
            >
              <AdminHiddenUiLocale />
              {allVotesState.error ? (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {allVotesState.error}
                </p>
              ) : null}
              {allVotesState.ok ? (
                <p className="text-sm text-[var(--admin-success-fg)]" role="status">
                  {allVotesState.count !== undefined
                    ? v.deletedAll(allVotesState.count)
                    : v.resetAllFallback}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={allVotesPending}
                className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-800 transition hover:bg-red-100 disabled:opacity-60 dark:border-red-800/70 dark:bg-red-950/50 dark:text-red-200 dark:hover:bg-red-950/80"
              >
                {allVotesPending ? "…" : v.resetAll}
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
        <AdminRecipeDisplayLocalePanel initialLocale={initialRecipeDisplayLocale} />
        <AdminAppearancePanel initial={initialAppearance} />
      </div>

      <div
        role="tabpanel"
        id={taxonomyPanelId}
        aria-labelledby={taxonomyTabId}
        hidden={tab !== "taxonomy"}
        className="pt-6"
      >
        <AdminTaxonomyPanel
          initialCategories={initialCategoryDefs}
          initialDietKinds={initialDietKindDefs}
        />
      </div>

      <form action={adminLogoutAction} className="mt-8">
        <button type="submit" className="admin-btn-secondary">
          {p.logout}
        </button>
      </form>
    </div>
  );
}
