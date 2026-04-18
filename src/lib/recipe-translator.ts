/**
 * Rezepttext übersetzen: optional LibreTranslate (LIBRETRANSLATE_URL),
 * sonst MyMemory (kostenlos, Tageslimit / Längenbeschränkung).
 */

function chunkByLength(text: string, maxLen: number): string[] {
  const t = text.trim();
  if (!t) return [];
  if (t.length <= maxLen) return [t];
  const out: string[] = [];
  let rest = t;
  const minBreak = (n: number) => Math.floor(n * 0.35);
  while (rest.length > maxLen) {
    const slice = rest.slice(0, maxLen);
    let cut = maxLen;
    const nn = slice.lastIndexOf("\n\n");
    if (nn >= minBreak(maxLen)) cut = nn + 2;
    else {
      const n1 = slice.lastIndexOf("\n");
      if (n1 >= minBreak(maxLen)) cut = n1 + 1;
      else {
        const dot = slice.lastIndexOf(". ");
        if (dot >= minBreak(maxLen)) cut = dot + 2;
        else {
          const sp = slice.lastIndexOf(" ");
          if (sp >= minBreak(maxLen)) cut = sp + 1;
        }
      }
    }
    const part = rest.slice(0, cut).trim();
    if (part) out.push(part);
    rest = rest.slice(cut).trimStart();
  }
  if (rest) out.push(rest);
  return out;
}

async function translateMyMemoryChunk(
  text: string,
  from: string,
  to: string,
): Promise<string> {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", `${from}|${to}`);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`MyMemory HTTP ${res.status}`);
  }
  const data = (await res.json()) as {
    responseStatus?: number;
    responseData?: { translatedText?: string };
  };
  const status = data.responseStatus;
  if (status && status !== 200) {
    throw new Error(
      data.responseData?.translatedText?.includes("MYMEMORY WARNING")
        ? "MyMemory-Limit erreicht. Bitte LIBRETRANSLATE_URL konfigurieren oder später erneut versuchen."
        : `MyMemory-Fehler (Status ${status})`,
    );
  }
  const translated = data.responseData?.translatedText;
  if (typeof translated !== "string" || !translated) {
    throw new Error("MyMemory lieferte keine Übersetzung.");
  }
  return translated;
}

async function translateLibreTranslate(
  text: string,
  from: string,
  to: string,
): Promise<string> {
  const base = (process.env.LIBRETRANSLATE_URL ?? "").replace(/\/$/, "");
  if (!base) throw new Error("LIBRETRANSLATE_URL fehlt.");
  const key = process.env.LIBRETRANSLATE_API_KEY ?? "";
  const res = await fetch(`${base}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: text,
      source: from,
      target: to,
      format: "text",
      api_key: key,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`LibreTranslate HTTP ${res.status}`);
  }
  const data = (await res.json()) as { translatedText?: string };
  if (typeof data.translatedText !== "string") {
    throw new Error("LibreTranslate lieferte keine Übersetzung.");
  }
  return data.translatedText;
}

export async function translateRecipeText(
  text: string,
  from: string,
  to: string,
): Promise<string> {
  if (!text.trim()) return text;
  if (from === to) return text;

  const useLibre = Boolean(process.env.LIBRETRANSLATE_URL?.trim());

  if (useLibre) {
    const chunks = chunkByLength(text, 1200);
    const parts: string[] = [];
    for (const c of chunks) {
      parts.push(await translateLibreTranslate(c, from, to));
    }
    return parts.join("\n\n");
  }

  const chunks = chunkByLength(text, 420);
  const parts: string[] = [];
  for (const c of chunks) {
    parts.push(await translateMyMemoryChunk(c, from, to));
    await new Promise((r) => setTimeout(r, 350));
  }
  return parts.join("\n\n");
}

async function mapPool<T, R>(
  items: readonly T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) return [];
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker() {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i]!, i);
    }
  }

  const n = Math.max(1, Math.min(concurrency, items.length));
  await Promise.all(Array.from({ length: n }, () => worker()));
  return results;
}

/** Einzelne kurze Zeilen (Zutaten, Schritte) mit moderatem Parallelgrad. */
export async function translateRecipeLines(
  lines: readonly string[],
  from: string,
  to: string,
): Promise<string[]> {
  if (lines.length === 0) return [];
  if (from === to) return [...lines];

  return mapPool(lines, 3, async (line) => {
    if (!line.trim()) return line;
    return translateRecipeText(line, from, to);
  });
}
