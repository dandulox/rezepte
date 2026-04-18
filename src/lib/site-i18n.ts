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
    navAria: string;
    chooseCategory: string;
    recipeCount: (n: number) => string;
    empty: (opts: {
      hasQuery: boolean;
      hasDiet: boolean;
      query: string;
    }) => string;
  };
  admin: {
    login: {
      heading: string;
      intro: (defaultPin: string) => string;
      pinLabel: string;
      submit: string;
      backLink: string;
    };
    panel: {
      title: string;
      subtitle: string;
      tabListAria: string;
      tabSecurity: string;
      tabVotes: string;
      tabAppearance: string;
      tabTaxonomy: string;
      logout: string;
    };
    security: {
      title: string;
      hint: string;
      currentPin: string;
      newPin: string;
      confirmPin: string;
      savePin: string;
      pinChanged: string;
    };
    votes: {
      sectionTitle: string;
      sectionHint: string;
      likesOnlyTitle: string;
      dislikesOnlyTitle: string;
      allTitle: string;
      confirmLikes: string;
      confirmDislikes: string;
      confirmAll: string;
      resetLikes: string;
      resetDislikes: string;
      resetAll: string;
      deletedLikes: (n: number) => string;
      deletedDislikes: (n: number) => string;
      deletedAll: (n: number) => string;
      resetLikesFallback: string;
      resetDislikesFallback: string;
      resetAllFallback: string;
    };
    appearance: {
      panelTitle: string;
      panelHint: string;
      colorSchemeAria: string;
      light: string;
      dark: string;
      saveColors: string;
      colorsSaved: string;
      resetHint: string;
      resetConfirm: string;
      resetDefaults: string;
      defaultsRestored: string;
      accent: string;
      accentHover: string;
      buttonText: string;
      successMsgs: string;
    };
    recipeDisplay: {
      title: string;
      hint: string;
      displayLanguage: string;
      optionDe: string;
      targetEn: string;
      targetFr: string;
      targetIt: string;
      targetEs: string;
      targetPl: string;
      saved: string;
      save: string;
      backfillHint: string;
      backfillConfirm: string;
      backfillButton: string;
      backfillDone: (created: number, skipped: number, failed: number) => string;
    };
    taxonomy: {
      title: string;
      hint: string;
      categoriesTitle: string;
      dietTitle: string;
      slug: string;
      slugHint: string;
      labelDe: string;
      labelEn: string;
      sortOrder: string;
      isMeat: string;
      searchExtra: string;
      searchExtraHint: string;
      addCategory: string;
      addDiet: string;
      saveRow: string;
      delete: string;
      deleteCategoryConfirm: string;
      deleteDietConfirm: string;
      savedCategory: string;
      savedDiet: string;
      deletedOk: string;
    };
    serverErrors: {
      sessionExpired: string;
      pinMustBe4: string;
      wrongPin: string;
      allPinsMustBe4: string;
      pinMismatch: string;
      currentPinWrong: string;
      invalidThemeColor: (key: string) => string;
      invalidDisplayLocale: string;
      backfillNeedsNonDe: string;
      invalidTaxonomySlug: string;
      duplicateTaxonomyId: string;
      categoryInUse: (n: number) => string;
      dietInUse: (n: number) => string;
      taxonomyMissingLabels: string;
    };
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
    navAria: "Kategorienavigation",
    chooseCategory: "Kategorie wählen",
    recipeCount: (n) => (n === 1 ? "1 Rezept" : `${n} Rezepte`),
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
  admin: {
    login: {
      heading: "Admin",
      intro: (defaultPin) =>
        `Melde dich mit der 4-stelligen PIN an. Standard nach Ersteinrichtung: ${defaultPin} — bitte im Adminbereich ändern.`,
      pinLabel: "Admin-PIN (4 Ziffern)",
      submit: "Anmelden",
      backLink: "Zurück zur Startseite",
    },
    panel: {
      title: "Adminbereich",
      subtitle: "Sicherheit, Darstellung und Bewertungen.",
      tabListAria: "Adminbereich",
      tabSecurity: "Sicherheit",
      tabVotes: "Bewertungen",
      tabAppearance: "Darstellung",
      tabTaxonomy: "Kategorien & Ernährung",
      logout: "Abmelden",
    },
    security: {
      title: "PIN ändern",
      hint: "Aktuellen PIN eingeben, dann viermal die neue PIN (nur Ziffern).",
      currentPin: "Aktueller PIN",
      newPin: "Neuer PIN",
      confirmPin: "Neuer PIN (Wiederholung)",
      savePin: "PIN speichern",
      pinChanged: "PIN wurde geändert.",
    },
    votes: {
      sectionTitle: "Likes & Dislikes",
      sectionHint:
        "Zähler pro Art zurücksetzen oder alle Bewertungen auf einmal entfernen. Gilt für alle Rezepte.",
      likesOnlyTitle: "Nur Likes",
      dislikesOnlyTitle: "Nur Dislikes",
      allTitle: "Alles",
      confirmLikes:
        "Alle Like-Einträge unwiderruflich löschen? Dislikes bleiben erhalten.",
      confirmDislikes:
        "Alle Dislike-Einträge unwiderruflich löschen? Likes bleiben erhalten.",
      confirmAll:
        "Alle Likes und Dislikes unwiderruflich löschen? Dies betrifft alle Rezepte.",
      resetLikes: "Alle Likes zurücksetzen",
      resetDislikes: "Alle Dislikes zurücksetzen",
      resetAll: "Alle Likes & Dislikes zurücksetzen",
      deletedLikes: (n) => `${n} Like-Einträge gelöscht.`,
      deletedDislikes: (n) => `${n} Dislike-Einträge gelöscht.`,
      deletedAll: (n) => `${n} Einträge gelöscht.`,
      resetLikesFallback: "Likes zurückgesetzt.",
      resetDislikesFallback: "Dislikes zurückgesetzt.",
      resetAllFallback: "Zähler zurückgesetzt.",
    },
    appearance: {
      panelTitle: "Darstellung",
      panelHint:
        "Akzentfarben für den Adminbereich (inkl. Login). Werte im Format #RRGGBB — getrennt für helles und dunkles Erscheinungsbild.",
      colorSchemeAria: "Farbschema",
      light: "Hell",
      dark: "Dunkel",
      saveColors: "Farben speichern",
      colorsSaved: "Farben gespeichert.",
      resetHint:
        "Setzt alle Farben auf die mitgelieferten Standardwerte (Indigo) zurück.",
      resetConfirm: "Alle Admin-Farben auf Standard zurücksetzen?",
      resetDefaults: "Standard wiederherstellen",
      defaultsRestored: "Standardfarben wiederhergestellt.",
      accent: "Akzent",
      accentHover: "Akzent (Hover)",
      buttonText: "Schrift auf Buttons",
      successMsgs: "Erfolgsmeldungen",
    },
    recipeDisplay: {
      title: "Rezept-Anzeige",
      hint:
        "Sprache für Rezepttexte (Titel, Zutaten, Schritte) auf allen Rezeptseiten. Übersetzungen werden lokal gespeichert; ohne gespeicherte Übersetzung wird das deutsche Original angezeigt.",
      displayLanguage: "Anzeigesprache",
      optionDe: "Deutsch (Original)",
      targetEn: "Englisch",
      targetFr: "Französisch",
      targetIt: "Italienisch",
      targetEs: "Spanisch",
      targetPl: "Polnisch",
      saved: "Anzeigesprache gespeichert.",
      save: "Speichern",
      backfillHint:
        "Erzeugt fehlende Übersetzungen nur für die gespeicherte Anzeigesprache (nicht Deutsch). Bereits vorhandene Übersetzungen werden übersprungen.",
      backfillConfirm:
        "Für alle Rezepte fehlende Übersetzungen in der aktuell gespeicherten Anzeigesprache erzeugen? Das kann je nach Anzahl der Rezepte und Übersetzungsdienst einige Minuten dauern und ruft einen externen Dienst auf.",
      backfillButton: "Fehlende Übersetzungen erzeugen",
      backfillDone: (created, skipped, failed) =>
        `Fertig: ${created} neu, ${skipped} schon vorhanden${failed ? `, ${failed} fehlgeschlagen` : ""}.`,
    },
    taxonomy: {
      title: "Kategorien & Ernährung",
      hint:
        "Interne Kurz-IDs (Slug) für Rezepte; Anzeigenamen für Deutsch und Englisch. Änderungen gelten sofort für Formulare und Listen.",
      categoriesTitle: "Gerichtskategorien",
      dietTitle: "Ernährungsarten",
      slug: "Kurz-ID (Slug)",
      slugHint: "Nur a–z, Ziffern und Unterstrich; beginnt mit Buchstabe.",
      labelDe: "Name (Deutsch)",
      labelEn: "Name (Englisch)",
      sortOrder: "Sortierung",
      isMeat: "Enthält Fleisch (für Filter „Fleisch“)",
      searchExtra: "Zusatzbegriffe für Suche",
      searchExtraHint: "Optional: Synonyme, durch Leerzeichen getrennt.",
      addCategory: "Kategorie hinzufügen",
      addDiet: "Ernährungsart hinzufügen",
      saveRow: "Speichern",
      delete: "Löschen",
      deleteCategoryConfirm: "Diese Kategorie wirklich löschen?",
      deleteDietConfirm: "Diese Ernährungsart wirklich löschen?",
      savedCategory: "Kategorie gespeichert.",
      savedDiet: "Ernährungsart gespeichert.",
      deletedOk: "Gelöscht.",
    },
    serverErrors: {
      sessionExpired: "Sitzung abgelaufen. Bitte erneut anmelden.",
      pinMustBe4: "PIN muss genau 4 Ziffern sein.",
      wrongPin: "Falscher PIN.",
      allPinsMustBe4: "Alle PINs müssen genau 4 Ziffern sein.",
      pinMismatch: "Neue PIN und Wiederholung stimmen nicht überein.",
      currentPinWrong: "Aktueller PIN ist falsch.",
      invalidThemeColor: (key) =>
        `Ungültige Farbe: „${key}“ muss als #RRGGBB angegeben werden.`,
      invalidDisplayLocale: "Ungültige Anzeigesprache.",
      backfillNeedsNonDe:
        "Für „Deutsch (Original)“ werden keine Übersetzungen gespeichert. Bitte zuerst eine andere Anzeigesprache wählen und speichern.",
      invalidTaxonomySlug:
        "Ungültige Kurz-ID: nur Kleinbuchstaben, Ziffern und Unterstrich, maximal 64 Zeichen, beginnt mit Buchstabe.",
      duplicateTaxonomyId: "Diese Kurz-ID existiert bereits.",
      categoryInUse: (n) =>
        `Kategorie wird noch von ${n} Rezept(en) verwendet — zuerst zuweisen oder Rezepte ändern.`,
      dietInUse: (n) =>
        `Ernährungsart wird noch von ${n} Rezept(en) verwendet — zuerst zuweisen oder Rezepte ändern.`,
      taxonomyMissingLabels: "Deutsche und englische Bezeichnung dürfen nicht leer sein.",
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
    navAria: "Category navigation",
    chooseCategory: "Choose category",
    recipeCount: (n) => (n === 1 ? "1 recipe" : `${n} recipes`),
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
  admin: {
    login: {
      heading: "Admin",
      intro: (defaultPin) =>
        `Sign in with your 4-digit PIN. Default after first setup: ${defaultPin} — please change it in the admin area.`,
      pinLabel: "Admin PIN (4 digits)",
      submit: "Sign in",
      backLink: "Back to home",
    },
    panel: {
      title: "Admin",
      subtitle: "Security, appearance and ratings.",
      tabListAria: "Admin area",
      tabSecurity: "Security",
      tabVotes: "Ratings",
      tabAppearance: "Appearance",
      tabTaxonomy: "Categories & diet",
      logout: "Sign out",
    },
    security: {
      title: "Change PIN",
      hint: "Enter your current PIN, then the new PIN twice (digits only).",
      currentPin: "Current PIN",
      newPin: "New PIN",
      confirmPin: "New PIN (repeat)",
      savePin: "Save PIN",
      pinChanged: "PIN has been changed.",
    },
    votes: {
      sectionTitle: "Likes & dislikes",
      sectionHint:
        "Reset counts by type or remove all ratings at once. Applies to all recipes.",
      likesOnlyTitle: "Likes only",
      dislikesOnlyTitle: "Dislikes only",
      allTitle: "All",
      confirmLikes:
        "Delete all like entries permanently? Dislikes will be kept.",
      confirmDislikes:
        "Delete all dislike entries permanently? Likes will be kept.",
      confirmAll:
        "Delete all likes and dislikes permanently? This affects every recipe.",
      resetLikes: "Reset all likes",
      resetDislikes: "Reset all dislikes",
      resetAll: "Reset all likes & dislikes",
      deletedLikes: (n) => `${n} like entries deleted.`,
      deletedDislikes: (n) => `${n} dislike entries deleted.`,
      deletedAll: (n) => `${n} entries deleted.`,
      resetLikesFallback: "Likes reset.",
      resetDislikesFallback: "Dislikes reset.",
      resetAllFallback: "Counts reset.",
    },
    appearance: {
      panelTitle: "Appearance",
      panelHint:
        "Accent colours for the admin area (including login). Use #RRGGBB — separate sets for light and dark mode.",
      colorSchemeAria: "Colour scheme",
      light: "Light",
      dark: "Dark",
      saveColors: "Save colours",
      colorsSaved: "Colours saved.",
      resetHint: "Resets all colours to the built-in defaults (indigo).",
      resetConfirm: "Reset all admin colours to defaults?",
      resetDefaults: "Restore defaults",
      defaultsRestored: "Default colours restored.",
      accent: "Accent",
      accentHover: "Accent (hover)",
      buttonText: "Text on buttons",
      successMsgs: "Success messages",
    },
    recipeDisplay: {
      title: "Recipe display",
      hint:
        "Language for recipe text (title, ingredients, steps) on every recipe page. Translations are stored locally; without a saved translation the German original is shown.",
      displayLanguage: "Display language",
      optionDe: "German (original)",
      targetEn: "English",
      targetFr: "French",
      targetIt: "Italian",
      targetEs: "Spanish",
      targetPl: "Polish",
      saved: "Display language saved.",
      save: "Save",
      backfillHint:
        "Creates missing translations only for the saved display language (not German). Existing translations are skipped.",
      backfillConfirm:
        "Create missing translations for all recipes in the currently saved display language? This may take several minutes depending on recipe count and calls an external service.",
      backfillButton: "Create missing translations",
      backfillDone: (created, skipped, failed) =>
        `Done: ${created} new, ${skipped} already present${failed ? `, ${failed} failed` : ""}.`,
    },
    taxonomy: {
      title: "Categories & diet",
      hint:
        "Short internal IDs (slugs) for recipes; display names in German and English. Changes apply immediately in forms and lists.",
      categoriesTitle: "Dish categories",
      dietTitle: "Diet types",
      slug: "Short ID (slug)",
      slugHint: "Lowercase letters, digits and underscore only; must start with a letter.",
      labelDe: "Name (German)",
      labelEn: "Name (English)",
      sortOrder: "Sort order",
      isMeat: "Contains meat (for “Meat dishes” filter)",
      searchExtra: "Extra search terms",
      searchExtraHint: "Optional: synonyms, space-separated.",
      addCategory: "Add category",
      addDiet: "Add diet type",
      saveRow: "Save",
      delete: "Delete",
      deleteCategoryConfirm: "Really delete this category?",
      deleteDietConfirm: "Really delete this diet type?",
      savedCategory: "Category saved.",
      savedDiet: "Diet type saved.",
      deletedOk: "Deleted.",
    },
    serverErrors: {
      sessionExpired: "Session expired. Please sign in again.",
      pinMustBe4: "PIN must be exactly 4 digits.",
      wrongPin: "Incorrect PIN.",
      allPinsMustBe4: "All PINs must be exactly 4 digits.",
      pinMismatch: "New PIN and confirmation do not match.",
      currentPinWrong: "Current PIN is incorrect.",
      invalidThemeColor: (key) =>
        `Invalid colour: “${key}” must be #RRGGBB.`,
      invalidDisplayLocale: "Invalid display language.",
      backfillNeedsNonDe:
        "No translations are stored for “German (original)”. Please choose another display language and save first.",
      invalidTaxonomySlug:
        "Invalid short ID: lowercase letters, digits and underscore only, max 64 characters, must start with a letter.",
      duplicateTaxonomyId: "This short ID already exists.",
      categoryInUse: (n) =>
        `Category is still used by ${n} recipe(s) — reassign or edit recipes first.`,
      dietInUse: (n) =>
        `Diet type is still used by ${n} recipe(s) — reassign or edit recipes first.`,
      taxonomyMissingLabels: "German and English names must not be empty.",
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
