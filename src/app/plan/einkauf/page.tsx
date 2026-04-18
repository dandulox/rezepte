import { ShoppingWeekClient } from "../ShoppingWeekClient";
import { loadEinkaufPageData } from "./load-einkauf-data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Einkaufsliste · Rezeptbuch",
};

export default async function PlanEinkaufPage({
  searchParams,
}: {
  searchParams: Promise<{ w?: string }>;
}) {
  const { w } = await searchParams;
  const { weekAnchor, meals, shopping } = await loadEinkaufPageData(w);

  return (
    <ShoppingWeekClient weekAnchor={weekAnchor} meals={meals} shopping={shopping} />
  );
}
