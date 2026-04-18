import type { RecipeViewLang } from "@/lib/recipe-translate-locales";

type RecipeViewStrings = {
  ingredients: string;
  nutrition: string;
  tabListAria: string;
  servings: string;
  decreaseServings: string;
  increaseServings: string;
  edit: string;
  sourceLink: string;
  translationBar: string;
  languageLabel: string;
  optionOriginal: string;
  translateButton: string;
  translating: string;
  translateErrorPrefix: string;
  translateHintNoCache: string;
  preparation: string;
  stepSingular: string;
  stepPlural: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
};

function stepsLabel(lang: RecipeViewLang, n: number): string {
  const s = STRINGS[lang];
  const word = n === 1 ? s.stepSingular : s.stepPlural;
  return `${n} ${word}`;
}

const STRINGS: Record<RecipeViewLang, RecipeViewStrings> = {
  de: {
    ingredients: "Zutaten",
    nutrition: "Nährwerte",
    tabListAria: "Zutaten oder Nährwerte",
    servings: "Portionen",
    decreaseServings: "Portionen verringern",
    increaseServings: "Portionen erhöhen",
    edit: "Bearbeiten",
    sourceLink: "Zur Originalquelle",
    translationBar: "Sprache",
    languageLabel: "Anzeigesprache",
    optionOriginal: "Deutsch (Original)",
    translateButton: "Übersetzung erstellen",
    translating: "Übersetze…",
    translateErrorPrefix: "Übersetzung fehlgeschlagen",
    translateHintNoCache:
      "Es gibt noch keine gespeicherte Übersetzung. Die Übersetzung wird über einen externen Dienst abgerufen und lokal gespeichert.",
    preparation: "Zubereitung",
    stepSingular: "Schritt",
    stepPlural: "Schritte",
    prepTime: "Vorbereitung",
    cookTime: "Arbeitszeit",
    totalTime: "Gesamt",
  },
  en: {
    ingredients: "Ingredients",
    nutrition: "Nutrition",
    tabListAria: "Ingredients or nutrition",
    servings: "Servings",
    decreaseServings: "Decrease servings",
    increaseServings: "Increase servings",
    edit: "Edit",
    sourceLink: "Original source",
    translationBar: "Language",
    languageLabel: "Display language",
    optionOriginal: "German (original)",
    translateButton: "Create translation",
    translating: "Translating…",
    translateErrorPrefix: "Translation failed",
    translateHintNoCache:
      "No saved translation yet. Text is fetched from an external service and stored locally.",
    preparation: "Instructions",
    stepSingular: "step",
    stepPlural: "steps",
    prepTime: "Prep",
    cookTime: "Active time",
    totalTime: "Total",
  },
  fr: {
    ingredients: "Ingrédients",
    nutrition: "Valeurs nutritionnelles",
    tabListAria: "Ingrédients ou valeurs nutritionnelles",
    servings: "Portions",
    decreaseServings: "Diminuer les portions",
    increaseServings: "Augmenter les portions",
    edit: "Modifier",
    sourceLink: "Source d’origine",
    translationBar: "Langue",
    languageLabel: "Langue d’affichage",
    optionOriginal: "Allemand (original)",
    translateButton: "Créer une traduction",
    translating: "Traduction…",
    translateErrorPrefix: "Échec de la traduction",
    translateHintNoCache:
      "Aucune traduction enregistrée pour l’instant. Le texte est récupéré via un service externe puis stocké localement.",
    preparation: "Préparation",
    stepSingular: "étape",
    stepPlural: "étapes",
    prepTime: "Préparation",
    cookTime: "Temps actif",
    totalTime: "Total",
  },
  it: {
    ingredients: "Ingredienti",
    nutrition: "Valori nutrizionali",
    tabListAria: "Ingredienti o valori nutrizionali",
    servings: "Porzioni",
    decreaseServings: "Riduci porzioni",
    increaseServings: "Aumenta porzioni",
    edit: "Modifica",
    sourceLink: "Fonte originale",
    translationBar: "Lingua",
    languageLabel: "Lingua di visualizzazione",
    optionOriginal: "Tedesco (originale)",
    translateButton: "Crea traduzione",
    translating: "Traduzione…",
    translateErrorPrefix: "Traduzione non riuscita",
    translateHintNoCache:
      "Non c’è ancora una traduzione salvata. Il testo viene recuperato da un servizio esterno e memorizzato in locale.",
    preparation: "Preparazione",
    stepSingular: "passo",
    stepPlural: "passi",
    prepTime: "Preparazione",
    cookTime: "Tempo attivo",
    totalTime: "Totale",
  },
  es: {
    ingredients: "Ingredientes",
    nutrition: "Información nutricional",
    tabListAria: "Ingredientes o información nutricional",
    servings: "Raciones",
    decreaseServings: "Reducir raciones",
    increaseServings: "Aumentar raciones",
    edit: "Editar",
    sourceLink: "Fuente original",
    translationBar: "Idioma",
    languageLabel: "Idioma de visualización",
    optionOriginal: "Alemán (original)",
    translateButton: "Crear traducción",
    translating: "Traduciendo…",
    translateErrorPrefix: "Error de traducción",
    translateHintNoCache:
      "Aún no hay traducción guardada. El texto se obtiene de un servicio externo y se guarda localmente.",
    preparation: "Preparación",
    stepSingular: "paso",
    stepPlural: "pasos",
    prepTime: "Preparación",
    cookTime: "Tiempo activo",
    totalTime: "Total",
  },
  pl: {
    ingredients: "Składniki",
    nutrition: "Wartości odżywcze",
    tabListAria: "Składniki lub wartości odżywcze",
    servings: "Porcje",
    decreaseServings: "Zmniejsz porcje",
    increaseServings: "Zwiększ porcje",
    edit: "Edytuj",
    sourceLink: "Oryginalne źródło",
    translationBar: "Język",
    languageLabel: "Język wyświetlania",
    optionOriginal: "Niemiecki (oryginał)",
    translateButton: "Utwórz tłumaczenie",
    translating: "Tłumaczenie…",
    translateErrorPrefix: "Tłumaczenie nie powiodło się",
    translateHintNoCache:
      "Nie ma jeszcze zapisanego tłumaczenia. Tekst jest pobierany z zewnętrznej usługi i zapisywany lokalnie.",
    preparation: "Przygotowanie",
    stepSingular: "krok",
    stepPlural: "kroki",
    prepTime: "Przygotowanie",
    cookTime: "Czas aktywny",
    totalTime: "Łącznie",
  },
};

export function recipeViewStrings(lang: RecipeViewLang): RecipeViewStrings {
  return STRINGS[lang];
}

export function recipeViewStepsCaption(lang: RecipeViewLang, stepCount: number): string {
  return stepsLabel(lang, stepCount);
}
