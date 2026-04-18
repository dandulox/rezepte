"use client";

import { useActionState, useId, useMemo } from "react";
import {
  adminCreateRecipeCategoryAction,
  adminCreateRecipeDietKindAction,
  adminDeleteRecipeCategoryAction,
  adminDeleteRecipeDietKindAction,
  adminUpdateRecipeCategoryAction,
  adminUpdateRecipeDietKindAction,
  type AdminTaxonomyActionState,
} from "@/app/admin/actions";
import { AdminHiddenUiLocale } from "@/components/AdminHiddenUiLocale";
import { useUiLocale } from "@/components/UiLocaleProvider";

const initial: AdminTaxonomyActionState = {};

type CategoryRow = {
  id: string;
  labelDe: string;
  labelEn: string;
  sortOrder: number;
};

type DietRow = {
  id: string;
  labelDe: string;
  labelEn: string;
  sortOrder: number;
  isMeat: boolean;
  searchExtra: string;
};

export function AdminTaxonomyPanel({
  initialCategories,
  initialDietKinds,
}: {
  initialCategories: CategoryRow[];
  initialDietKinds: DietRow[];
}) {
  const { strings: s } = useUiLocale();
  const t = s.admin.taxonomy;

  const [createCat, createCatAction, createCatPending] = useActionState(
    adminCreateRecipeCategoryAction,
    initial,
  );
  const [updCat, updCatAction, updCatPending] = useActionState(
    adminUpdateRecipeCategoryAction,
    initial,
  );
  const [delCat, delCatAction, delCatPending] = useActionState(
    adminDeleteRecipeCategoryAction,
    initial,
  );

  const [createDiet, createDietAction, createDietPending] = useActionState(
    adminCreateRecipeDietKindAction,
    initial,
  );
  const [updDiet, updDietAction, updDietPending] = useActionState(
    adminUpdateRecipeDietKindAction,
    initial,
  );
  const [delDiet, delDietAction, delDietPending] = useActionState(
    adminDeleteRecipeDietKindAction,
    initial,
  );

  const sortedCategories = useMemo(
    () =>
      [...initialCategories].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id, "de"),
      ),
    [initialCategories],
  );
  const sortedDietKinds = useMemo(
    () =>
      [...initialDietKinds].sort(
        (a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id, "de"),
      ),
    [initialDietKinds],
  );

  const nextSortCat =
    sortedCategories.length === 0
      ? 0
      : Math.max(...sortedCategories.map((c) => c.sortOrder)) + 1;
  const nextSortDiet =
    sortedDietKinds.length === 0 ? 0 : Math.max(...sortedDietKinds.map((d) => d.sortOrder)) + 1;

  const catAddId = useId();
  const dietAddId = useId();

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-medium text-foreground">{t.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.hint}</p>
      </div>

      <section className="admin-surface space-y-4">
        <h3 className="text-base font-medium text-foreground">{t.categoriesTitle}</h3>

        {createCat.error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {createCat.error}
          </p>
        ) : null}
        {createCat.ok ? (
          <p className="text-sm text-[var(--admin-success-fg)]" role="status">
            {t.savedCategory}
          </p>
        ) : null}

        <form action={createCatAction} className="grid gap-3 border-b border-border pb-6 sm:grid-cols-2 lg:grid-cols-6">
          <AdminHiddenUiLocale />
          <div className="lg:col-span-2">
            <label htmlFor={`${catAddId}-slug`} className="mb-1 block text-xs font-medium text-label">
              {t.slug}
            </label>
            <input
              id={`${catAddId}-slug`}
              name="newCategoryId"
              required
              pattern="[a-z][a-z0-9_]{0,63}"
              className="admin-input w-full font-mono text-sm"
              placeholder="z. B. pasta"
            />
            <p className="mt-0.5 text-xs text-muted-foreground">{t.slugHint}</p>
          </div>
          <div>
            <label htmlFor={`${catAddId}-de`} className="mb-1 block text-xs font-medium text-label">
              {t.labelDe}
            </label>
            <input
              id={`${catAddId}-de`}
              name="newCategoryLabelDe"
              required
              className="admin-input w-full"
            />
          </div>
          <div>
            <label htmlFor={`${catAddId}-en`} className="mb-1 block text-xs font-medium text-label">
              {t.labelEn}
            </label>
            <input
              id={`${catAddId}-en`}
              name="newCategoryLabelEn"
              required
              className="admin-input w-full"
            />
          </div>
          <div>
            <label htmlFor={`${catAddId}-sort`} className="mb-1 block text-xs font-medium text-label">
              {t.sortOrder}
            </label>
            <input
              id={`${catAddId}-sort`}
              name="newCategorySortOrder"
              type="number"
              defaultValue={nextSortCat}
              className="admin-input w-full"
            />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={createCatPending} className="admin-btn-primary w-full sm:w-auto">
              {createCatPending ? "…" : t.addCategory}
            </button>
          </div>
        </form>

        {updCat.error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {updCat.error}
          </p>
        ) : null}
        {updCat.ok ? (
          <p className="text-sm text-[var(--admin-success-fg)]" role="status">
            {t.savedCategory}
          </p>
        ) : null}
        {delCat.error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {delCat.error}
          </p>
        ) : null}
        {delCat.ok ? (
          <p className="text-sm text-[var(--admin-success-fg)]" role="status">
            {t.deletedOk}
          </p>
        ) : null}

        <ul className="space-y-4">
          {sortedCategories.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-border bg-card-muted/40 p-4 dark:bg-card-muted/20"
            >
              <div className="mb-2 font-mono text-xs text-muted-foreground">{c.id}</div>
              <form action={updCatAction} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                <AdminHiddenUiLocale />
                <input type="hidden" name="categoryId" value={c.id} />
                <div>
                  <label className="mb-1 block text-xs font-medium text-label">{t.labelDe}</label>
                  <input
                    name="labelDe"
                    required
                    defaultValue={c.labelDe}
                    className="admin-input w-full"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-label">{t.labelEn}</label>
                  <input
                    name="labelEn"
                    required
                    defaultValue={c.labelEn}
                    className="admin-input w-full"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-label">{t.sortOrder}</label>
                  <input
                    name="sortOrder"
                    type="number"
                    defaultValue={c.sortOrder}
                    className="admin-input w-full"
                  />
                </div>
                <div className="flex flex-wrap items-end gap-2 lg:col-span-2">
                  <button type="submit" disabled={updCatPending} className="admin-btn-primary">
                    {updCatPending ? "…" : t.saveRow}
                  </button>
                </div>
              </form>
              <form
                action={delCatAction}
                className="mt-3"
                onSubmit={(e) => {
                  if (!window.confirm(t.deleteCategoryConfirm)) e.preventDefault();
                }}
              >
                <AdminHiddenUiLocale />
                <input type="hidden" name="categoryId" value={c.id} />
                <button
                  type="submit"
                  disabled={delCatPending}
                  className="text-sm font-medium text-red-600 underline-offset-2 hover:underline dark:text-red-400"
                >
                  {delCatPending ? "…" : t.delete}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-surface space-y-4">
        <h3 className="text-base font-medium text-foreground">{t.dietTitle}</h3>

        {createDiet.error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {createDiet.error}
          </p>
        ) : null}
        {createDiet.ok ? (
          <p className="text-sm text-[var(--admin-success-fg)]" role="status">
            {t.savedDiet}
          </p>
        ) : null}

        <form
          action={createDietAction}
          className="grid gap-3 border-b border-border pb-6 lg:grid-cols-2 xl:grid-cols-12"
        >
          <AdminHiddenUiLocale />
          <div className="xl:col-span-2">
            <label htmlFor={`${dietAddId}-slug`} className="mb-1 block text-xs font-medium text-label">
              {t.slug}
            </label>
            <input
              id={`${dietAddId}-slug`}
              name="newDietId"
              required
              pattern="[a-z][a-z0-9_]{0,63}"
              className="admin-input w-full font-mono text-sm"
            />
          </div>
          <div className="xl:col-span-2">
            <label htmlFor={`${dietAddId}-de`} className="mb-1 block text-xs font-medium text-label">
              {t.labelDe}
            </label>
            <input id={`${dietAddId}-de`} name="newDietLabelDe" required className="admin-input w-full" />
          </div>
          <div className="xl:col-span-2">
            <label htmlFor={`${dietAddId}-en`} className="mb-1 block text-xs font-medium text-label">
              {t.labelEn}
            </label>
            <input id={`${dietAddId}-en`} name="newDietLabelEn" required className="admin-input w-full" />
          </div>
          <div className="xl:col-span-2">
            <label htmlFor={`${dietAddId}-sort`} className="mb-1 block text-xs font-medium text-label">
              {t.sortOrder}
            </label>
            <input
              id={`${dietAddId}-sort`}
              name="newDietSortOrder"
              type="number"
              defaultValue={nextSortDiet}
              className="admin-input w-full"
            />
          </div>
          <div className="flex items-center gap-2 xl:col-span-2">
            <input id={`${dietAddId}-meat`} name="newDietIsMeat" type="checkbox" className="h-4 w-4 rounded" />
            <label htmlFor={`${dietAddId}-meat`} className="text-sm text-label">
              {t.isMeat}
            </label>
          </div>
          <div className="xl:col-span-2">
            <label htmlFor={`${dietAddId}-extra`} className="mb-1 block text-xs font-medium text-label">
              {t.searchExtra}
            </label>
            <input
              id={`${dietAddId}-extra`}
              name="newDietSearchExtra"
              className="admin-input w-full text-sm"
            />
            <p className="mt-0.5 text-xs text-muted-foreground">{t.searchExtraHint}</p>
          </div>
          <div className="flex items-end xl:col-span-12">
            <button type="submit" disabled={createDietPending} className="admin-btn-primary">
              {createDietPending ? "…" : t.addDiet}
            </button>
          </div>
        </form>

        {updDiet.error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {updDiet.error}
          </p>
        ) : null}
        {updDiet.ok ? (
          <p className="text-sm text-[var(--admin-success-fg)]" role="status">
            {t.savedDiet}
          </p>
        ) : null}
        {delDiet.error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {delDiet.error}
          </p>
        ) : null}
        {delDiet.ok ? (
          <p className="text-sm text-[var(--admin-success-fg)]" role="status">
            {t.deletedOk}
          </p>
        ) : null}

        <ul className="space-y-4">
          {sortedDietKinds.map((d) => (
            <li
              key={d.id}
              className="rounded-xl border border-border bg-card-muted/40 p-4 dark:bg-card-muted/20"
            >
              <div className="mb-2 font-mono text-xs text-muted-foreground">{d.id}</div>
              <form action={updDietAction} className="grid gap-3 lg:grid-cols-2 xl:grid-cols-12">
                <AdminHiddenUiLocale />
                <input type="hidden" name="dietId" value={d.id} />
                <div className="xl:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-label">{t.labelDe}</label>
                  <input name="labelDe" required defaultValue={d.labelDe} className="admin-input w-full" />
                </div>
                <div className="xl:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-label">{t.labelEn}</label>
                  <input name="labelEn" required defaultValue={d.labelEn} className="admin-input w-full" />
                </div>
                <div className="xl:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-label">{t.sortOrder}</label>
                  <input
                    name="sortOrder"
                    type="number"
                    defaultValue={d.sortOrder}
                    className="admin-input w-full"
                  />
                </div>
                <div className="flex items-center gap-2 xl:col-span-2">
                  <input
                    name="isMeat"
                    type="checkbox"
                    defaultChecked={d.isMeat}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm text-label">{t.isMeat}</span>
                </div>
                <div className="xl:col-span-4">
                  <label className="mb-1 block text-xs font-medium text-label">{t.searchExtra}</label>
                  <input
                    name="searchExtra"
                    defaultValue={d.searchExtra}
                    className="admin-input w-full text-sm"
                  />
                </div>
                <div className="flex flex-wrap items-end gap-2 xl:col-span-12">
                  <button type="submit" disabled={updDietPending} className="admin-btn-primary">
                    {updDietPending ? "…" : t.saveRow}
                  </button>
                </div>
              </form>
              <form
                action={delDietAction}
                className="mt-3"
                onSubmit={(e) => {
                  if (!window.confirm(t.deleteDietConfirm)) e.preventDefault();
                }}
              >
                <AdminHiddenUiLocale />
                <input type="hidden" name="dietId" value={d.id} />
                <button
                  type="submit"
                  disabled={delDietPending}
                  className="text-sm font-medium text-red-600 underline-offset-2 hover:underline dark:text-red-400"
                >
                  {delDietPending ? "…" : t.delete}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
