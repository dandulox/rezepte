import { describe, expect, it } from "vitest";
import {
  ImportError,
  lineLooksLikeNutritionLine,
  parseRecipeFromHtml,
  partitionIngredientsAndNutrition,
} from "@/lib/recipe-import";

const fixtureHtml = `<!doctype html>
<html><head>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Recipe",
  "name": "Testkuchen",
  "image": "https://example.com/img.jpg",
  "description": "Lecker",
  "recipeYield": "6",
  "prepTime": "PT15M",
  "cookTime": "PT30M",
  "totalTime": "PT45M",
  "recipeCategory": "Dessert",
  "recipeIngredient": ["200 g Mehl", "2 EL Zucker"],
  "recipeInstructions": [
    { "@type": "HowToStep", "text": "Mehl sieben." },
    { "@type": "HowToStep", "text": "Backen." }
  ]
}
</script>
</head><body></body></html>`;

describe("parseRecipeFromHtml", () => {
  it("liest JSON-LD Recipe aus HTML", () => {
    const r = parseRecipeFromHtml(fixtureHtml, "https://quelle.example/rezept");
    expect(r.title).toBe("Testkuchen");
    expect(r.servingsBase).toBe(6);
    expect(r.prepTime).toBe("PT15M");
    expect(r.cookTime).toBe("PT30M");
    expect(r.totalTime).toBe("PT45M");
    expect(r.ingredients).toEqual(["200 g Mehl", "2 EL Zucker"]);
    expect(r.nutritionLines).toEqual([]);
    expect(r.instructions).toEqual(["Mehl sieben.", "Backen."]);
    expect(r.imageUrl).toBe("https://example.com/img.jpg");
    expect(r.sourceUrl).toBe("https://quelle.example/rezept");
    expect(r.category).toBe("dessert");
  });

  it("wirft ImportError ohne Rezept", () => {
    expect(() => parseRecipeFromHtml("<html></html>", "https://x.test")).toThrow(ImportError);
  });

  it("findet Recipe in JSON-LD WebPage.mainEntity (REWE)", () => {
    const reweSnippet = `<script type="application/ld+json" id="recipe-schema">
{"@context":"http://schema.org","@type":"Webpage","name":"Demo","mainEntity":{"@type":"Recipe","name":"Demo-Rezept","recipeYield":"2","totalTime":"PT30M","recipeIngredient":["1.0 EL Öl","Salz"],"recipeInstructions":[{"@type":"HowToStep","text":"Mischen."}]}}
</script>`;
    const r = parseRecipeFromHtml(reweSnippet, "https://www.rewe.de/rezepte/demo/");
    expect(r.title).toBe("Demo-Rezept");
    expect(r.servingsBase).toBe(2);
    expect(r.totalTime).toBe("PT30M");
    expect(r.prepTime).toBeNull();
    expect(r.ingredients).toEqual(["1 EL Öl", "Salz"]);
    expect(r.nutritionLines).toEqual([]);
    expect(r.instructions).toEqual(["Mischen."]);
    expect(r.category).toBeNull();
  });

  it("filtert Nährwert-Zeilen aus recipeIngredient", () => {
    const html = `<!doctype html><script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Recipe",
  "name": "Mix",
  "recipeIngredient": [
    "200 g Mehl",
    "Energie: 2000 kJ / 480 kcal",
    "Fett: 12 g"
  ],
  "recipeInstructions": [{ "@type": "HowToStep", "text": "Mischen." }]
}
</script>`;
    const r = parseRecipeFromHtml(html, "https://example.com/r");
    expect(r.ingredients).toEqual(["200 g Mehl"]);
    expect(r.nutritionLines).toEqual(["Energie: 2000 kJ / 480 kcal", "Fett: 12 g"]);
  });

  it("liest nutrition aus JSON-LD", () => {
    const html = `<!doctype html><script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Recipe",
  "name": "Kuchen",
  "recipeIngredient": ["100 g Zucker"],
  "nutrition": {
    "@type": "NutritionInformation",
    "calories": "300 kcal",
    "fatContent": { "value": 10, "unitText": "g" }
  },
  "recipeInstructions": []
}
</script>`;
    const r = parseRecipeFromHtml(html, "https://example.com/k");
    expect(r.ingredients).toEqual(["100 g Zucker"]);
    expect(r.nutritionLines).toContain("Kalorien: 300 kcal");
    expect(r.nutritionLines).toContain("Fett: 10 g");
  });
});

describe("partitionIngredientsAndNutrition", () => {
  it("erkennt typische Nährwertzeilen", () => {
    expect(lineLooksLikeNutritionLine("200 g Mehl")).toBe(false);
    expect(lineLooksLikeNutritionLine("Energie: 100 kJ / 20 kcal")).toBe(true);
    expect(partitionIngredientsAndNutrition(["1 EL Öl", "Nährwerte pro Portion", "kcal: 100"])).toEqual({
      ingredients: ["1 EL Öl"],
      nutritionLines: ["Nährwerte pro Portion", "kcal: 100"],
    });
  });
});
