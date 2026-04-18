"use client";

import type { ReactNode } from "react";
import { RecipeFavoritesProvider } from "@/components/RecipeFavoritesProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return <RecipeFavoritesProvider>{children}</RecipeFavoritesProvider>;
}
