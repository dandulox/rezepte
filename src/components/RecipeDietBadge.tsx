import type { ComponentType } from "react";
import { useUiLocale } from "@/components/UiLocaleProvider";
import {
  isRecipeDietKindInDefs,
  recipeDietKindDisplayLabel,
} from "@/lib/recipe-diet";
import type { RecipeDietKindDefPublic } from "@/lib/recipe-taxonomy";

function IconVegan({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20v-3.5" />
      <path d="M12 16.5c-3.5-2.5-6-6.5-3.5-10.5 2.5 0 4 2.5 3.5 6" />
      <path d="M12 16.5c3.5-2.5 6-6.5 3.5-10.5-2.5 0-4 2.5-3.5 6" />
    </svg>
  );
}

function IconVegetarisch({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20s-5.5-4-5.5-10.5C6.5 6 10 4 12 4s5.5 2 5.5 5.5C17.5 16 12 20 12 20Z" />
      <path d="M12 9v8" />
    </svg>
  );
}

function IconHuhn({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10.5 5.5L11 8l1.2-1.8L13.5 8l.5-2.5" />
      <path d="M11.8 8.2c-2.2.2-3.8 1.8-4 4.2-.2 2.5 1.5 4.5 4 4.8 3 .4 5.5-1.8 5.5-4.8 0-1.6-.7-3-2-3.8" />
      <path d="M17.3 9.4l2.2-.6-.4 2.1-1.8-.8" />
      <path d="M9 17.2c-.6 1-1.8 1.6-3 1.4" />
    </svg>
  );
}

function IconSchwein({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <ellipse cx="5.1" cy="13.3" rx="2.2" ry="1.65" />
      <path d="M7 12.5c0-3 2.8-5.2 6-5.2s6.2 2.5 6.2 5.8c0 2.6-2 4.7-4.6 4.7-1.8 0-3.4-.9-4.2-2.4" />
      <path d="M9.5 8.8c-.7-1.5-2-2.6-3.6-3" />
      <path d="M17.8 11.2c1.4 0 2.4 1.1 2.4 2.4 0 2-1.8 3.4-3.6 2.6a2.4 2.4 0 0 1-1.4-2.2" />
    </svg>
  );
}

function IconRind({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 4.2L6.2 2M16 4.2l1.8-2.2" />
      <ellipse cx="12" cy="12" rx="4.9" ry="6.1" />
      <path d="M9.7 14.6a1 1.05 0 0 0 2 0M12.3 14.6a1 1.05 0 0 0 2 0" />
      <path d="M10.6 16.6h2.8" />
    </svg>
  );
}

function IconFleischAndere({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 8c0-2 1.5-3.5 4-3.5S16 6 16 8v2c2 0 3 1.5 3 3.5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3C5 9.5 6 8 8 8Z" />
      <path d="M12 8.5V12" />
    </svg>
  );
}

function IconGeneric({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}

const DIET_ICONS: Partial<Record<string, ComponentType<{ className?: string }>>> = {
  vegan: IconVegan,
  vegetarisch: IconVegetarisch,
  fleisch_huhn: IconHuhn,
  fleisch_schwein: IconSchwein,
  fleisch_rind: IconRind,
  fleisch_andere: IconFleischAndere,
};

/**
 * Kleines Overlay oben links auf Rezeptbildern (Startseite, Kategorien, Rezeptdetail).
 */
export function RecipeDietImageBadge({
  dietKind,
  dietKindDefs,
  className = "",
}: {
  dietKind: string | null | undefined;
  dietKindDefs: readonly RecipeDietKindDefPublic[];
  className?: string;
}) {
  const { locale } = useUiLocale();
  const uiLocale = locale === "en" ? "en" : "de";
  if (!dietKind || !isRecipeDietKindInDefs(dietKind, dietKindDefs)) return null;
  const label = recipeDietKindDisplayLabel(dietKind, uiLocale, dietKindDefs);
  const Icon = DIET_ICONS[dietKind] ?? IconGeneric;
  const dietWord = locale === "en" ? "Diet" : "Ernährung";
  return (
    <div
      role="img"
      aria-label={label ? `${dietWord}: ${label}` : undefined}
      className={`pointer-events-none absolute left-2 top-2 flex items-center gap-1.5 rounded-lg bg-black/60 px-2 py-1 text-white shadow-md backdrop-blur-[2px] ${className}`}
      title={label ?? undefined}
    >
      <Icon className="shrink-0 text-white" />
      <span className="max-w-[9rem] truncate text-[0.7rem] font-medium leading-tight sm:max-w-[11rem] sm:text-xs">
        {label}
      </span>
    </div>
  );
}
