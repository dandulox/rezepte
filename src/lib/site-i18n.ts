import type { SiteLocale } from "@/lib/ui-locale-storage";

export type SiteStrings = {
  nav: {
    siteTitle: string;
    categories: string;
    favorites: string;
    weekPlan: string;
    shopping: string;
    newRecipe: string;
    mainNavAria: string;
    mobileMenuAria: string;
    menuPointsAria: string;
    openMenu: string;
    closeMenu: string;
    localeGroupAria: string;
    localeDe: string;
    localeEn: string;
  };
  footer: {
    navAria: string;
    categories: string;
    statistics: string;
    weekPlan: string;
    shopping: string;
    newRecipe: string;
    admin: string;
  };
  theme: {
    dark: string;
    light: string;
    system: string;
    fallback: string;
    cycleAria: (label: string) => string;
    cycleTitle: string;
  };
  common: {
    noImage: string;
    servingsIngredients: (servings: number, ingCount: number) => string;
    likesDislikesSr: (likes: number, dislikes: number) => string;
    recipeWordOne: string;
    recipeWordMany: string;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    searchLabel: string;
    searchPlaceholder: string;
    noRecipes: string;
    noHits: (q: string) => string;
    allFavoritesCarousel: string;
    lastCooked: string;
    lastCookedFallback: string;
    mostCooked: string;
    stillUndiscovered: string;
    notRated: string;
    cookedNTimes: (n: number) => string;
    lastTimePrefix: string;
    scrollRecentlyCooked: string;
    scrollMostCooked: string;
    scrollUntouched: string;
    carouselRegion: string;
    carouselLabel: string;
    slideRegion: string;
    justNow: string;
  };
  favorites: {
    loading: string;
    title: string;
    empty: string;
    toOverview: string;
    countLine: (n: number) => string;
  };
  import: {
    title: string;
    intro: string;
    placeholder: string;
    preview: string;
    loading: string;
    previewSectionTitle: string;
    previewSectionHint: string;
    errorNetwork: string;
    errorStatus: (code: number) => string;
  };
  categories: {
    title: string;
    backHome: string;
    filterGroupAria: string;
    vegetarian: string;
    vegan: string;
    meat: string;
    searchLabel: string;
    searchPlaceholder: string;
    uncategorized: string;
    empty: (opts: {
      hasQuery: boolean;
      hasDiet: boolean;
      query: string;
    }) => string;
  };
};

const DE: SiteStrings = {
  nav: {
    siteTitle: "Rezeptbuch",
    categories: "Kategorien",
    favorites: "Favoriten",
    weekPlan: "Wochenplan",
    shopping: "Einkauf",
    newRecipe: "Neues Rezept",
    mainNavAria: "Hauptnavigation",
    mobileMenuAria: "Mobilmenü",
    menuPointsAria: "Menüpunkte",
    openMenu: "Menü öffnen",
    closeMenu: "Menü schließen",
    localeGroupAria: "Sprache der Oberfläche",
    localeDe: "Deutsch",
    localeEn: "English",
  },
  footer: {
    navAria: "Fußzeilen-Navigation",
    categories: "Kategorien",
    statistics: "Statistik",
    weekPlan: "Wochenplan",
    shopping: "Einkauf",
    newRecipe: "Neues Rezept",
    admin: "Admin",
  },
  theme: {
    dark: "Dunkel",
    light: "Hell",
    system: "System",
    fallback: "Farbschema",
    cycleAria: (label) => `Farbschema: ${label}. Klicken zum Wechseln.`,
    cycleTitle: "Zu Hell, Dunkel oder System wechseln",
  },
  common: {
    noImage: "Kein Bild",
    servingsIngredients: (servings, ingCount) =>
      `${servings} Portionen · ${ingCount} Zutaten`,
    likesDislikesSr: (likes, dislikes) =>
      `${likes} Likes, ${dislikes} Dislikes`,
    recipeWordOne: "Rezept",
    recipeWordMany: "Rezepte",
  },
  home: {
    heroTitle: "Rezeptbuch",
    heroSubtitle:
      "Importiere Rezepte von bekannten Seiten oder lege sie manuell an. Portionen kannst du auf der Rezeptseite anpassen.",
    searchLabel: "Rezepte durchsuchen",
    searchPlaceholder: "Titel, Kategorie, Ernährung, Zutaten…",
    noRecipes: "Noch keine Rezepte.",
    noHits: (q) =>
      `Keine Treffer für „${q}“. Anderen Suchbegriff versuchen.`,
    allFavoritesCarousel:
      "Alle Treffer sind Favoriten — im Karussell werden nur nicht-gemerkte Rezepte vorgeschlagen.",
    lastCooked: "Zuletzt gekocht",
    lastCookedFallback: "Zuletzt gekocht",
    mostCooked: "Am häufigsten gekocht",
    stillUndiscovered: "Noch unentdeckt",
    notRated: "Noch nicht bewertet",
    cookedNTimes: (n) => `${n}× gekocht`,
    lastTimePrefix: "zuletzt",
    scrollRecentlyCooked:
      "Zuletzt gekochte Rezepte. Bereich fokussieren, dann mit den Pfeiltasten nach links und rechts scrollen.",
    scrollMostCooked:
      "Am häufigsten gekochte Rezepte. Bereich fokussieren, dann mit den Pfeiltasten nach links und rechts scrollen.",
    scrollUntouched:
      "Rezepte ohne Bewertung und ohne Koch-Historie. Bereich fokussieren, dann mit den Pfeiltasten nach links und rechts scrollen.",
    carouselRegion: "Karussell",
    carouselLabel: "Rezepte, endlos automatisch",
    slideRegion: "Folie",
    justNow: "gerade eben",
  },
  favorites: {
    loading: "Lade Favoriten…",
    title: "Favoriten",
    empty:
      "Noch keine Favoriten. Stern auf der Startseite oder Rezeptseite tippen, um Rezepte zu merken.",
    toOverview: "Zur Übersicht",
    countLine: (n) =>
      `${n} ${n === 1 ? "Rezept" : "Rezepte"} gespeichert in diesem Browser.`,
  },
  import: {
    title: "Rezept importieren",
    intro:
      "Viele Seiten liefern strukturierte Daten (JSON-LD), u. a. Chefkoch und REWE.de/rezepte. Gib die Rezept-URL ein, prüfe die Vorschau und speichere das Rezept lokal.",
    placeholder: "https://www.chefkoch.de/… oder https://www.rewe.de/rezepte/…",
    preview: "Vorschau",
    loading: "Laden…",
    previewSectionTitle: "Vorschau und Speichern",
    previewSectionHint:
      "Daten vor dem Speichern anpassen. Bilder verlinken oft auf die Quelle (Hotlink).",
    errorNetwork: "Netzwerkfehler beim Import.",
    errorStatus: (code) => `Fehler ${code}`,
  },
  categories: {
    title: "Nach Kategorie",
    backHome: "Zur Hauptseite",
    filterGroupAria: "Nach Ernährungsart filtern",
    vegetarian: "Vegetarisch",
    vegan: "Vegan",
    meat: "Fleischgerichte",
    searchLabel: "Rezepte durchsuchen",
    searchPlaceholder: "Suche nach Titel, Kategorie, Ernährung, Zutaten…",
    uncategorized: "Ohne Kategorie",
    empty: ({ hasQuery, hasDiet, query }) => {
      if (hasQuery && hasDiet) {
        return `Keine Treffer für „${query}“ mit dem gewählten Ernährungsfilter.`;
      }
      if (hasQuery) {
        return `Keine Treffer für „${query}“.`;
      }
      if (hasDiet) {
        return "Keine Rezepte mit dieser Ernährungsart (oder keine passende Klassifizierung).";
      }
      return "Keine Rezepte.";
    },
  },
};

const EN: SiteStrings = {
  nav: {
    siteTitle: "Recipe book",
    categories: "Categories",
    favorites: "Favorites",
    weekPlan: "Week plan",
    shopping: "Shopping",
    newRecipe: "New recipe",
    mainNavAria: "Main navigation",
    mobileMenuAria: "Mobile menu",
    menuPointsAria: "Menu items",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    localeGroupAria: "Interface language",
    localeDe: "German",
    localeEn: "English",
  },
  footer: {
    navAria: "Footer navigation",
    categories: "Categories",
    statistics: "Statistics",
    weekPlan: "Week plan",
    shopping: "Shopping",
    newRecipe: "New recipe",
    admin: "Admin",
  },
  theme: {
    dark: "Dark",
    light: "Light",
    system: "System",
    fallback: "Theme",
    cycleAria: (label) => `Color theme: ${label}. Click to cycle.`,
    cycleTitle: "Switch between light, dark, and system",
  },
  common: {
    noImage: "No image",
    servingsIngredients: (servings, ingCount) =>
      `${servings} servings · ${ingCount} ingredients`,
    likesDislikesSr: (likes, dislikes) =>
      `${likes} likes, ${dislikes} dislikes`,
    recipeWordOne: "recipe",
    recipeWordMany: "recipes",
  },
  home: {
    heroTitle: "Recipe book",
    heroSubtitle:
      "Import recipes from popular sites or add them manually. You can scale servings on each recipe page.",
    searchLabel: "Search recipes",
    searchPlaceholder: "Title, category, diet, ingredients…",
    noRecipes: "No recipes yet.",
    noHits: (q) => `No results for “${q}”. Try another search.`,
    allFavoritesCarousel:
      "All matches are favorites — the carousel only suggests recipes you have not starred.",
    lastCooked: "Recently cooked",
    lastCookedFallback: "Recently cooked",
    mostCooked: "Most cooked",
    stillUndiscovered: "Still undiscovered",
    notRated: "Not rated yet",
    cookedNTimes: (n) => `Cooked ${n}×`,
    lastTimePrefix: "last",
    scrollRecentlyCooked:
      "Recently cooked recipes. Focus the region, then use arrow keys to scroll left and right.",
    scrollMostCooked:
      "Most cooked recipes. Focus the region, then use arrow keys to scroll left and right.",
    scrollUntouched:
      "Recipes without ratings or cook history. Focus the region, then use arrow keys to scroll left and right.",
    carouselRegion: "Carousel",
    carouselLabel: "Recipes, auto-scrolling",
    slideRegion: "Slide",
    justNow: "just now",
  },
  favorites: {
    loading: "Loading favorites…",
    title: "Favorites",
    empty:
      "No favorites yet. Tap the star on the home or recipe page to save recipes.",
    toOverview: "Back to overview",
    countLine: (n) =>
      `${n} ${n === 1 ? "recipe" : "recipes"} saved in this browser.`,
  },
  import: {
    title: "Import recipe",
    intro:
      "Many sites expose structured data (JSON-LD), including Chefkoch and REWE.de/recipes. Paste the recipe URL, check the preview, and save the recipe locally.",
    placeholder: "https://… recipe URL …",
    preview: "Preview",
    loading: "Loading…",
    previewSectionTitle: "Preview and save",
    previewSectionHint:
      "Adjust data before saving. Images often hotlink to the source site.",
    errorNetwork: "Network error while importing.",
    errorStatus: (code) => `Error ${code}`,
  },
  categories: {
    title: "By category",
    backHome: "Back to home",
    filterGroupAria: "Filter by diet",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    meat: "Meat dishes",
    searchLabel: "Search recipes",
    searchPlaceholder: "Search title, category, diet, ingredients…",
    uncategorized: "Uncategorized",
    empty: ({ hasQuery, hasDiet, query }) => {
      if (hasQuery && hasDiet) {
        return `No results for “${query}” with the selected diet filter.`;
      }
      if (hasQuery) {
        return `No results for “${query}”.`;
      }
      if (hasDiet) {
        return "No recipes for this diet (or missing classification).";
      }
      return "No recipes.";
    },
  },
};

export function getSiteStrings(locale: SiteLocale): SiteStrings {
  return locale === "en" ? EN : DE;
}

/** Relative time in the past (e.g. last cooked). */
export function formatPastRelative(iso: string, locale: SiteLocale): string {
  const thenMs = Date.parse(iso);
  if (!Number.isFinite(thenMs)) return "";
  const diffMs = Date.now() - thenMs;
  const locTag = locale === "en" ? "en-US" : "de-DE";
  const locRtf = locale === "en" ? "en" : "de";
  if (diffMs < 0) {
    return new Date(thenMs).toLocaleDateString(locTag, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  const rtf = new Intl.RelativeTimeFormat(locRtf, { numeric: "auto" });
  const sec = Math.floor(diffMs / 1000);
  const just = locale === "en" ? "just now" : "gerade eben";
  if (sec < 45) return just;
  const min = Math.floor(sec / 60);
  if (min < 60) return rtf.format(-min, "minute");
  const hr = Math.floor(min / 60);
  if (hr < 24) return rtf.format(-hr, "hour");
  const day = Math.floor(hr / 24);
  if (day < 7) return rtf.format(-day, "day");
  const week = Math.floor(day / 7);
  if (week < 5) return rtf.format(-week, "week");
  const month = Math.floor(day / 30);
  if (month < 12) return rtf.format(-month, "month");
  const year = Math.floor(day / 365);
  return rtf.format(-year, "year");
}
