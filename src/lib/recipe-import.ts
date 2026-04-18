import { execFile } from "node:child_process";
import { promisify } from "node:util";
import * as cheerio from "cheerio";
import { parseIngredientLine } from "@/lib/ingredient-parse";
import {
  resolveImportedRecipeCategory,
  type RecipeCategoryId,
} from "@/lib/recipe-category";
import type { RecipeDietKindId } from "@/lib/recipe-diet";

const execFileAsync = promisify(execFile);

export class ImportError extends Error {
  constructor(
    message: string,
    public code:
      | "INVALID_URL"
      | "FETCH"
      | "HTTP_ERROR"
      | "TOO_LARGE"
      | "TIMEOUT"
      | "NO_RECIPE",
  ) {
    super(message);
    this.name = "ImportError";
  }
}

const MAX_BYTES = 2_000_000;
const TIMEOUT_MS = 15_000;

export type ParsedRecipeDraft = {
  title: string;
  description: string | null;
  imageUrl: string | null;
  prepTime: string | null;
  cookTime: string | null;
  totalTime: string | null;
  sourceUrl: string;
  servingsBase: number;
  /** Automatisch aus JSON-LD recipeCategory und Textheuristik */
  category: RecipeCategoryId | null;
  /** Beim Import nicht gesetzt — manuell im Formular wählbar */
  dietKind: RecipeDietKindId | null;
  ingredients: string[];
  /** Aus JSON-LD nutrition und aus recipeIngredient herausgefiltert */
  nutritionLines: string[];
  instructions: string[];
};

function isRecipeType(type: unknown): boolean {
  if (type === "Recipe") return true;
  if (Array.isArray(type)) return type.includes("Recipe");
  return false;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return null;
}

function findRecipeObject(data: unknown): Record<string, unknown> | null {
  const obj = asRecord(data);
  if (!obj) {
    if (Array.isArray(data)) {
      for (const item of data) {
        const found = findRecipeObject(item);
        if (found) return found;
      }
    }
    return null;
  }

  if (isRecipeType(obj["@type"])) {
    return obj;
  }

  /** z. B. REWE: JSON-LD WebPage/Webpage mit eingebettetem Recipe */
  const mainEntity = obj["mainEntity"];
  if (mainEntity) {
    const fromMain = findRecipeObject(mainEntity);
    if (fromMain) return fromMain;
  }

  const graph = obj["@graph"];
  if (Array.isArray(graph)) {
    for (const item of graph) {
      const found = findRecipeObject(item);
      if (found) return found;
    }
  }

  for (const value of Object.values(obj)) {
    const found = findRecipeObject(value);
    if (found) return found;
  }

  return null;
}

function parseJsonLdScripts(html: string): unknown[] {
  const $ = cheerio.load(html);
  const out: unknown[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const text = $(el).text().trim();
    if (!text) return;
    try {
      out.push(JSON.parse(text));
    } catch {
      /* einzelne Blöcke können Trailing-Kommas o. Ä. haben */
    }
  });
  return out;
}

function firstImageUrl(image: unknown, baseUrl: string): string | null {
  if (typeof image === "string" && image.startsWith("http")) return image;
  if (typeof image === "string" && image.startsWith("//")) return `https:${image}`;
  if (Array.isArray(image)) {
    for (const item of image) {
      const u = firstImageUrl(item, baseUrl);
      if (u) return u;
    }
    return null;
  }
  const o = asRecord(image);
  if (o) {
    const url = o.url;
    if (typeof url === "string") {
      return absolutize(url, baseUrl);
    }
  }
  return null;
}

function absolutize(pathOrUrl: string, baseUrl: string): string {
  try {
    return new URL(pathOrUrl, baseUrl).href;
  } catch {
    return pathOrUrl;
  }
}

function parseYield(yield_: unknown): number {
  if (typeof yield_ === "number" && Number.isFinite(yield_)) {
    return yield_;
  }
  if (typeof yield_ === "string") {
    const m = yield_.match(/(\d+(?:[.,]\d+)?)/);
    if (m) {
      return parseFloat(m[1].replace(",", "."));
    }
  }
  return 4;
}

function normalizeInstructions(raw: unknown): string[] {
  if (raw == null) return [];
  if (typeof raw === "string") {
    return raw
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (!Array.isArray(raw)) return [];

  const lines: string[] = [];
  for (const item of raw) {
    if (typeof item === "string") {
      lines.push(item.trim());
      continue;
    }
    const o = asRecord(item);
    if (!o) continue;
    if (o["@type"] === "HowToStep" || (Array.isArray(o["@type"]) && o["@type"].includes("HowToStep"))) {
      const t = o.text;
      if (typeof t === "string") lines.push(t.trim());
      continue;
    }
    if (o["@type"] === "HowToSection") {
      const steps = o.itemListElement;
      lines.push(...normalizeInstructions(steps));
    }
  }
  return lines.filter(Boolean);
}

function optionalIsoOrText(raw: unknown): string | null {
  if (raw == null) return null;
  if (typeof raw === "string") {
    const t = raw.trim();
    return t || null;
  }
  return null;
}

function normalizeIngredients(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => {
      if (typeof x !== "string") return "";
      let s = x.trim();
      if (!s) return "";
      /** REWE liefert z. B. „2.0 EL Öl“ – .0 vor Leerzeichen entfernen */
      s = s.replace(/^(\d+)\.0+(?=\s)/, "$1");
      return s;
    })
    .filter(Boolean);
}

function stripIngredientBullet(line: string): string {
  return line.replace(/^[•\-\*:]\s*/, "").trim();
}

/**
 * Heuristik für Zeilen, die Seiten fälschlich in recipeIngredient mischen
 * (Nährwerttabellen, kcal/kJ-Zeilen).
 */
export function lineLooksLikeNutritionLine(line: string): boolean {
  const t = stripIngredientBullet(line);
  if (!t) return false;
  if (/\b(kcal|kj)\b/i.test(t)) return true;
  if (/^nährwert/i.test(t)) return true;
  if (/^(energie|brennwert)\s*[:\-]/i.test(t)) return true;
  if (/^davon\s+(gesättigte|zucker|mehrwertige|einfach|zugesetzte)/i.test(t)) return true;
  if (/^(kohlenhydrate|ballaststoffe)\s*[:\-]/i.test(t)) return true;
  if (/^fett\s*[:\-]\s*\d/i.test(t)) return true;
  if (/^salz\s*[:\-]\s*\d/i.test(t)) return true;
  if (/^zucker\s*[:\-]\s*\d/i.test(t)) return true;
  if (/^eiwei(ß|ss)\s*[:\-]\s*\d/i.test(t)) return true;
  if (/^protein\s*[:\-]\s*\d/i.test(t)) return true;
  if (/^(cholesterin|cholesterol|natrium)\s*[:\-]/i.test(t)) return true;
  return false;
}

export function partitionIngredientsAndNutrition(lines: string[]): {
  ingredients: string[];
  nutritionLines: string[];
} {
  const ingredients: string[] = [];
  const nutritionLines: string[] = [];
  for (const line of lines) {
    if (lineLooksLikeNutritionLine(line)) nutritionLines.push(line);
    else ingredients.push(line);
  }
  return { ingredients, nutritionLines };
}

function formatSchemaQuantity(raw: unknown): string | null {
  if (raw == null) return null;
  if (typeof raw === "string") {
    const t = raw.trim();
    return t || null;
  }
  if (typeof raw === "number" && Number.isFinite(raw)) return String(raw);
  const o = asRecord(raw);
  if (!o) return null;
  const val = o.value;
  const minV = o.minValue;
  const maxV = o.maxValue;
  const unitText = typeof o.unitText === "string" ? o.unitText.trim() : "";
  const unitCode = typeof o.unitCode === "string" ? o.unitCode.trim() : "";
  const unit = unitText || unitCode;
  if (typeof val === "number") return unit ? `${val} ${unit}` : String(val);
  if (typeof minV === "number" && typeof maxV === "number")
    return unit ? `${minV}–${maxV} ${unit}` : `${minV}–${maxV}`;
  return null;
}

const NUTRITION_SCHEMA_FIELDS: { key: string; label: string }[] = [
  { key: "calories", label: "Kalorien" },
  { key: "carbohydrateContent", label: "Kohlenhydrate" },
  { key: "proteinContent", label: "Eiweiß" },
  { key: "fatContent", label: "Fett" },
  { key: "saturatedFatContent", label: "davon gesättigte Fettsäuren" },
  { key: "fiberContent", label: "Ballaststoffe" },
  { key: "sugarContent", label: "Zucker" },
  { key: "sodiumContent", label: "Natrium" },
  { key: "cholesterolContent", label: "Cholesterin" },
];

function nutritionLinesFromSchemaNutrition(raw: unknown): string[] {
  if (raw == null) return [];
  if (typeof raw === "string") {
    return raw
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  const o = asRecord(raw);
  if (!o) return [];

  const lines: string[] = [];
  const serving = formatSchemaQuantity(o.servingSize);
  if (serving) lines.push(`Portionsgröße: ${serving}`);

  for (const { key, label } of NUTRITION_SCHEMA_FIELDS) {
    const formatted = formatSchemaQuantity(o[key]);
    if (formatted) lines.push(`${label}: ${formatted}`);
  }

  return lines;
}

function mergeUniqueLines(buckets: string[][]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const bucket of buckets) {
    for (const line of bucket) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const key = trimmed.replace(/\s+/g, " ").toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(trimmed);
    }
  }
  return out;
}

export function recipeFromJsonLd(
  recipe: Record<string, unknown>,
  sourceUrl: string,
): ParsedRecipeDraft {
  const title = typeof recipe.name === "string" ? recipe.name : "Unbenanntes Rezept";
  const description =
    typeof recipe.description === "string"
      ? recipe.description.trim() || null
      : null;

  const imageUrl = firstImageUrl(recipe.image, sourceUrl);
  const servingsBase = parseYield(recipe.recipeYield);
  const rawIngredientStrings = normalizeIngredients(recipe.recipeIngredient);
  const { ingredients, nutritionLines: nutritionFromList } =
    partitionIngredientsAndNutrition(rawIngredientStrings);
  const nutritionFromSchema = nutritionLinesFromSchemaNutrition(recipe.nutrition);
  const nutritionLines = mergeUniqueLines([nutritionFromSchema, nutritionFromList]);

  const instructions = normalizeInstructions(recipe.recipeInstructions);

  const category = resolveImportedRecipeCategory({
    jsonLdRecipeCategory: recipe.recipeCategory,
    title,
    description,
    ingredients,
    instructions,
  });

  return {
    title,
    description,
    imageUrl: imageUrl ? absolutize(imageUrl, sourceUrl) : null,
    prepTime: optionalIsoOrText(recipe.prepTime),
    cookTime: optionalIsoOrText(recipe.cookTime),
    totalTime: optionalIsoOrText(recipe.totalTime),
    sourceUrl,
    servingsBase: servingsBase > 0 ? servingsBase : 4,
    category,
    dietKind: null,
    ingredients,
    nutritionLines,
    instructions,
  };
}

export function parseRecipeFromHtml(html: string, sourceUrl: string): ParsedRecipeDraft {
  const blocks = parseJsonLdScripts(html);
  for (const block of blocks) {
    const recipe = findRecipeObject(block);
    if (recipe) {
      return recipeFromJsonLd(recipe, sourceUrl);
    }
  }
  throw new ImportError("Kein Rezept (JSON-LD) auf der Seite gefunden.", "NO_RECIPE");
}

function isReweHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === "rewe.de" || h.endsWith(".rewe.de");
}

/** Grobe Erkennung, ob die HTML-Antwort das REWE-Rezept-JSON-LD enthält (nicht die 403/Shop-Fallback-Seite). */
function htmlLikelyHasRecipeJsonLd(html: string): boolean {
  return (
    html.includes("application/ld+json") &&
    (html.includes('"@type":"Recipe"') ||
      html.includes("recipe-schema") ||
      html.includes('"mainEntity"'))
  );
}

/**
 * REWE (und ähnliche CDN-Regeln) liefern für manche Node-/Fetch-TLS-Stacks HTTP 403,
 * während das System-`curl` die Seite wie ein Browser laden kann.
 */
async function fetchHtmlWithCurl(url: string): Promise<string> {
  const curlBin = process.platform === "win32" ? "curl.exe" : "curl";
  const timeoutSec = Math.max(5, Math.ceil(TIMEOUT_MS / 1000));
  try {
    const { stdout } = await execFileAsync(
      curlBin,
      [
        "-sL",
        "--compressed",
        "-A",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "--max-time",
        String(timeoutSec),
        url,
      ],
      { maxBuffer: MAX_BYTES + 1, encoding: "utf8" },
    );
    return stdout;
  } catch {
    throw new ImportError(
      "Seite konnte nicht geladen werden. Ist curl installiert und erreichbar?",
      "FETCH",
    );
  }
}

export async function fetchRecipeHtml(url: string): Promise<string> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new ImportError("Ungültige URL.", "INVALID_URL");
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new ImportError("Nur http(s)-URLs sind erlaubt.", "INVALID_URL");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(parsed.href, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
      },
    });

    let html = "";
    if (res.ok) {
      const buf = await res.arrayBuffer();
      if (buf.byteLength > MAX_BYTES) {
        throw new ImportError("HTML-Antwort ist zu groß.", "TOO_LARGE");
      }
      html = new TextDecoder("utf-8").decode(buf);
    }

    if (
      isReweHost(parsed.hostname) &&
      (!res.ok || !htmlLikelyHasRecipeJsonLd(html))
    ) {
      clearTimeout(timer);
      const viaCurl = await fetchHtmlWithCurl(parsed.href);
      if (viaCurl.length > MAX_BYTES) {
        throw new ImportError("HTML-Antwort ist zu groß.", "TOO_LARGE");
      }
      return viaCurl;
    }

    if (!res.ok) {
      throw new ImportError(`Seite antwortet mit HTTP ${res.status}.`, "HTTP_ERROR");
    }

    return html;
  } catch (e) {
    if (e instanceof ImportError) throw e;
    if (e instanceof Error && e.name === "AbortError") {
      throw new ImportError("Zeitüberschreitung beim Laden.", "TIMEOUT");
    }
    throw new ImportError("Seite konnte nicht geladen werden.", "FETCH");
  } finally {
    clearTimeout(timer);
  }
}

export async function importRecipeFromUrl(url: string): Promise<ParsedRecipeDraft> {
  const html = await fetchRecipeHtml(url);
  return parseRecipeFromHtml(html, url);
}

/** Für Persistenz: Zutaten mit optionalem Parsing in quantity/unit/name */
export function ingredientsForDb(lines: string[]) {
  return lines.map((rawText, sortOrder) => {
    const p = parseIngredientLine(rawText);
    if (p.kind === "single") {
      return {
        rawText,
        quantity: p.quantity,
        unit: p.unit,
        name: p.name,
        sortOrder,
      };
    }
    if (p.kind === "range") {
      return {
        rawText,
        quantity: (p.min + p.max) / 2,
        unit: p.unit,
        name: p.name,
        sortOrder,
      };
    }
    return { rawText, quantity: null, unit: null, name: null, sortOrder };
  });
}
