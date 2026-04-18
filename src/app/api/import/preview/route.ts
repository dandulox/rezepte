import { NextResponse } from "next/server";
import { ImportError, importRecipeFromUrl } from "@/lib/recipe-import";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger JSON-Body." }, { status: 400 });
  }

  const url =
    body &&
    typeof body === "object" &&
    "url" in body &&
    typeof (body as { url: unknown }).url === "string"
      ? (body as { url: string }).url.trim()
      : "";

  if (!url) {
    return NextResponse.json({ error: "URL fehlt." }, { status: 400 });
  }

  try {
    const draft = await importRecipeFromUrl(url);
    return NextResponse.json(draft);
  } catch (e) {
    if (e instanceof ImportError) {
      const status =
        e.code === "HTTP_ERROR" || e.code === "NO_RECIPE" || e.code === "INVALID_URL"
          ? 422
          : e.code === "TIMEOUT" || e.code === "TOO_LARGE"
            ? 413
            : 502;
      return NextResponse.json({ error: e.message, code: e.code }, { status });
    }
    console.error(e);
    return NextResponse.json({ error: "Import fehlgeschlagen." }, { status: 500 });
  }
}
