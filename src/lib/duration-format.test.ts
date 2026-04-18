import { describe, expect, it } from "vitest";
import { formatRecipeDurationLabel } from "@/lib/duration-format";

describe("formatRecipeDurationLabel", () => {
  it("formatiert PT30M", () => {
    expect(formatRecipeDurationLabel("PT30M")).toBe("30 Min.");
  });

  it("formatiert PT1H30M", () => {
    expect(formatRecipeDurationLabel("PT1H30M")).toBe("1 Std. 30 Min.");
  });

  it("formatiert P1DT2H", () => {
    expect(formatRecipeDurationLabel("P1DT2H")).toBe("1 Tag 2 Std.");
  });

  it("gibt Freitext zurück", () => {
    expect(formatRecipeDurationLabel("ca. 20 Minuten")).toBe("ca. 20 Minuten");
  });

  it("gibt bei leer null zurück", () => {
    expect(formatRecipeDurationLabel(null)).toBeNull();
    expect(formatRecipeDurationLabel("")).toBeNull();
  });
});
