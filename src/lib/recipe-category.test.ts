import { describe, expect, it } from "vitest";
import {
  inferRecipeCategoryFromBlob,
  parseJsonLdRecipeCategory,
  recipeCategoryFromLabel,
  resolveImportedRecipeCategory,
  RECIPE_CATEGORY_SEED_IDS,
} from "@/lib/recipe-category";

const seedIds = new Set<string>(RECIPE_CATEGORY_SEED_IDS);

describe("recipeCategoryFromLabel", () => {
  it("erkennt deutsche und englische JSON-LD-Labels", () => {
    expect(recipeCategoryFromLabel("Hauptgericht", seedIds)).toBe("hauptgericht");
    expect(recipeCategoryFromLabel("Main course", seedIds)).toBe("hauptgericht");
    expect(recipeCategoryFromLabel("Vorspeise", seedIds)).toBe("vorspeise");
  });
});

describe("parseJsonLdRecipeCategory", () => {
  it("liest String und Arrays", () => {
    expect(parseJsonLdRecipeCategory("Salat")).toBe("Salat");
    expect(parseJsonLdRecipeCategory(["Hauptgericht", "Fleisch"])).toBe("Hauptgericht Fleisch");
    expect(parseJsonLdRecipeCategory(null)).toBeNull();
  });
});

describe("inferRecipeCategoryFromBlob", () => {
  it("leitet aus Titel und Text ab", () => {
    expect(inferRecipeCategoryFromBlob("Tomatensuppe mit Basilikum", seedIds)).toBe("suppe");
    expect(inferRecipeCategoryFromBlob("Grüner Salat mit Dressing", seedIds)).toBe("salat");
  });
});

describe("resolveImportedRecipeCategory", () => {
  it("bevorzugt JSON-LD gegenüber Heuristik", () => {
    expect(
      resolveImportedRecipeCategory(
        {
          jsonLdRecipeCategory: "Beilage",
          title: "Tomatensuppe",
          description: null,
          ingredients: [],
          instructions: [],
        },
        seedIds,
      ),
    ).toBe("beilage");
  });
});
