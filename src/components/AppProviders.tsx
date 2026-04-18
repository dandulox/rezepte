"use client";

import type { ReactNode } from "react";
import { RecipeFavoritesProvider } from "@/components/RecipeFavoritesProvider";
import { UiLocaleProvider } from "@/components/UiLocaleProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <UiLocaleProvider>
      <RecipeFavoritesProvider>{children}</RecipeFavoritesProvider>
    </UiLocaleProvider>
  );
}
