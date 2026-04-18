import { describe, expect, it, vi, afterEach } from "vitest";
import {
  planWeekSectionHeading,
  toISODateLocal,
  weekMondayFromParam,
  weekMondayIsoForDate,
} from "@/lib/week";

describe("weekMondayIsoForDate", () => {
  it("liefert den Montag der Kalenderwoche (ISO-Datum)", () => {
    expect(weekMondayIsoForDate("2026-04-15")).toBe("2026-04-13");
    expect(weekMondayIsoForDate("2026-04-13")).toBe("2026-04-13");
  });
});

describe("planWeekSectionHeading", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("nutzt Nächste Woche und Übernächste Woche für Offset 1 und 2", () => {
    expect(planWeekSectionHeading(1, "2026-04-13")).toBe("Nächste Woche");
    expect(planWeekSectionHeading(2, "2026-04-13")).toBe("Übernächste Woche");
  });

  it("Offset 0: Diese Woche wenn Anker der aktuellen Kalenderwoche entspricht", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 15, 12, 0, 0));
    const anchor = toISODateLocal(weekMondayFromParam("2026-04-13"));
    expect(planWeekSectionHeading(0, anchor)).toBe("Diese Woche");
  });

  it("Offset 0: Ausgewählte Woche wenn Anker nicht die aktuelle Woche ist", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 15, 12, 0, 0));
    expect(planWeekSectionHeading(0, "2026-03-30")).toBe("Ausgewählte Woche");
  });
});
