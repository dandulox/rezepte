import { describe, expect, it } from "vitest";
import {
  inferRecipeCategoryFromBlob,
  parseJsonLdRecipeCategory,
  recipeCategoryFromLabel,
  resolveImportedRecipeCategory,
} from "@/lib/recipe-category";

describe("recipeCategoryFromLabel", () => {
  it("erkennt deutsche und englische JSON-LD-Labels", () => {
    expect(recipeCategoryFromLabel("Hauptgericht")).toBe("hauptgericht");
    expect(recipeCategoryFromLabel("Main course")).toBe("hauptgericht");
    expect(recipeCategoryFromLabel("Vorspeise")).toBe("vorspeise");
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
    expect(inferRecipeCategoryFromBlob("Tomatensuppe mit Basilikum")).toBe("suppe");
    expect(inferRecipeCategoryFromBlob("Grüner Salat mit Dressing")).toBe("salat");
  });
});

describe("resolveImportedRecipeCategory", () => {
  it("bevorzugt JSON-LD gegenüber Heuristik", () => {
    expect(
      resolveImportedRecipeCategory({
        jsonLdRecipeCategory: "Beilage",
        title: "Tomatensuppe",
        description: null,
        ingredients: [],
        instructions: [],
      }),
    ).toBe("beilage");
  });
});
