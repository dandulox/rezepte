import { describe, expect, it } from "vitest";
import { classifyIngredientGroup, normalizeDeAscii } from "@/lib/ingredient-category";
import { parseIngredientLine } from "@/lib/ingredient-parse";

function groupForLine(raw: string) {
  return classifyIngredientGroup(raw, parseIngredientLine(raw));
}

describe("normalizeDeAscii", () => {
  it("ersetzt Umlaute und ß", () => {
    expect(normalizeDeAscii("grüße")).toBe("gruesse");
    expect(normalizeDeAscii("möhren")).toBe("moehren");
  });
});

describe("classifyIngredientGroup", () => {
  it("ordnet Möhren und Karotten dem Gemüse zu", () => {
    expect(groupForLine("300 g Möhren")).toBe("gemuese");
    expect(groupForLine("2 Karotten")).toBe("gemuese");
    expect(groupForLine("200 g Mohren")).toBe("gemuese");
    expect(groupForLine("1 Bund Möhren")).toBe("gemuese");
  });

  it("ordnet grüne Bohnen dem Gemüse zu, nicht Hülsenfrüchten", () => {
    expect(groupForLine("250 g grüne Bohnen")).toBe("gemuese");
    expect(groupForLine("400 g Buschbohnen")).toBe("gemuese");
  });

  it("unterscheidet Piment (Gewürz) und Piment d'Espelette (Gemüse/Chili)", () => {
    expect(groupForLine("1 TL Piment")).toBe("gewuerze");
    expect(groupForLine("2 Piment d'Espelette")).toBe("gemuese");
    expect(groupForLine("1 Piment d\u2019Espelette")).toBe("gemuese");
  });

  it("erkennt Kidneybohnen weiter als Hülsenfrucht", () => {
    expect(groupForLine("1 Dose Kidneybohnen")).toBe("huelsenfruechte");
  });
});
