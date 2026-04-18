import {
  parseIngredientLine,
  type ParsedIngredientLine,
} from "@/lib/ingredient-parse";

/** Reihenfolge der Gruppen in der Zutatenliste (Lebensmittel zuerst, Gewürze zuletzt). */
export const INGREDIENT_GROUP_ORDER = [
  "fleisch",
  "fisch",
  "milch",
  "eier",
  "getreide",
  "huelsenfruechte",
  "gemuese",
  "obst",
  "oele",
  "sonstiges",
  "gewuerze",
] as const;

export type IngredientGroupId = (typeof INGREDIENT_GROUP_ORDER)[number];

export const INGREDIENT_GROUP_LABEL: Record<IngredientGroupId, string> = {
  fleisch: "Fleisch & Geflügel",
  fisch: "Fisch & Meeresfrüchte",
  milch: "Milchprodukte & Käse",
  eier: "Eier",
  getreide: "Getreide, Mehl & Nudeln",
  huelsenfruechte: "Hülsenfrüchte & Tofu",
  gemuese: "Gemüse, Pilze & Kräuter",
  obst: "Obst",
  oele: "Öle, Fette & Essig",
  sonstiges: "Sonstiges",
  gewuerze: "Gewürze & Würzmittel",
};

function haystack(rawText: string, parsed: ParsedIngredientLine): string {
  const t = rawText.trim().toLowerCase();
  if (parsed.kind === "none") return t;
  return `${parsed.name} ${t}`.trim().toLowerCase();
}

/** Umlaute/ß → ae/oe/ue/ss für robustes Substring-Matching. */
export function normalizeDeAscii(s: string): string {
  return s
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

/** Typografische Apostrophe vereinheitlichen (z. B. Piment d'Espelette). */
function normalizeApostrophes(s: string): string {
  return s.replace(/\u2019/g, "'").replace(/\u2018/g, "'");
}

/** Kombiniert Original-Kleinbuchstaben-Text und ASCII-Variante (z. B. Möhren + mohren). */
function matchHaystack(rawText: string, parsed: ParsedIngredientLine): string {
  const h = normalizeApostrophes(haystack(rawText, parsed));
  const a = normalizeDeAscii(h);
  return a === h ? h : `${h} ${a}`;
}

function has(h: string, needles: readonly string[]): boolean {
  return needles.some((n) => h.includes(n));
}

/** Grüne/Buschbohnen als Gemüse, nicht als Hülsenfrucht-Trockenware. */
function isGreenBeanVegetable(h: string): boolean {
  return (
    h.includes("grüne bohnen") ||
    h.includes("gruene bohnen") ||
    h.includes("grüne bohne") ||
    h.includes("gruene bohne") ||
    h.includes("buschbohnen") ||
    h.includes("buschbohne") ||
    h.includes("brechbohnen") ||
    h.includes("brechbohne")
  );
}

/** Echter Piment (Allspice), nicht Piment d’Espelette. */
function matchesGermanAllspicePiment(h: string): boolean {
  if (/\bpiment\s+d['\u2019]/i.test(h)) return false;
  if (h.includes("espelette")) return false;
  if (
    h.includes("pimentkörner") ||
    h.includes("pimentkoerner") ||
    h.includes("gemahlener piment") ||
    h.includes("piment gemahlen") ||
    h.includes("pimentpulver") ||
    h.includes("allpiment")
  ) {
    return true;
  }
  return /\bpiment\b/i.test(h);
}

/** Paprika-Gemüse vs. Paprika-Gewürz */
function isPaprikaSpice(h: string): boolean {
  if (!h.includes("paprika")) return false;
  return (
    h.includes("paprikapulver") ||
    h.includes("paprika pul") ||
    h.includes("edelsü") ||
    h.includes("edelsue") ||
    h.includes("rosenscharf") ||
    h.includes("gemahlene paprika") ||
    h.includes("paprika, gemahlen")
  );
}

/** Chili-Schote vs. Chilipulver/-flocken */
function isChiliSpice(h: string): boolean {
  if (h.includes("chilipulver") || h.includes("chili pul")) return true;
  if (h.includes("chiliflock") || h.includes("chili flock")) return true;
  if (h.includes("cayenne")) return true;
  return false;
}

function isSpiceGroup(h: string): boolean {
  if (isPaprikaSpice(h) || isChiliSpice(h)) return true;

  const spiceNeedles = [
    "salz",
    "pfeffer",
    "pfefferkorn",
    "muskat",
    "zimt",
    "kurkuma",
    "kreuzkümmel",
    "kreuzkuemmel",
    "cumin",
    "koriander, gemahlen",
    "koriander gemahlen",
    "gemahlener koriander",
    "currypulver",
    "curry paste",
    "garam masala",
    "lorbeer",
    "nelke",
    "nelken",
    "sternanis",
    "kardamom",
    "wacholder",
    "sumach",
    "za'atar",
    "ras el hanout",
    "vanillezucker",
    "vanillepulver",
    "vanille extrakt",
    "backpulver",
    "natron",
    "brühepulver",
    "bruehepulver",
    "brühwürfel",
    "bruehwuerfel",
    "gemahlene muskat",
    "getrockneter majoran",
    "getrockneter oregano",
    "getrocknetes basilikum",
    "getrocknete petersilie",
    "essenz",
    "aroma",
    "würze",
    "wuerze",
    "worcester",
    "fischsauce",
    "sojasauce",
    "soja sauce",
    "tamari",
    "miso",
    "senfkorn",
    "senfpulver",
    "kümmel",
    "kuemmel",
    "bohnenkraut",
    "estragon",
    "kerbel",
    "bärlauch",
    "baerlauch",
  ] as const;

  if (has(h, spiceNeedles)) return true;

  if (matchesGermanAllspicePiment(h)) return true;

  if (h.includes("gemahlen") && (h.includes("ingwer") || h.includes("knoblauch"))) {
    return true;
  }

  return false;
}

export function classifyIngredientGroup(
  rawText: string,
  parsed: ParsedIngredientLine,
): IngredientGroupId {
  const h = matchHaystack(rawText, parsed);

  if (isSpiceGroup(h)) return "gewuerze";

  const fish = [
    "lachs",
    "forelle",
    "thunfisch",
    "thun",
    "kabeljau",
    "dorsch",
    "seelachs",
    "rotbarsch",
    "zander",
    "heilbutt",
    "makrele",
    "hering",
    "matjes",
    "sardelle",
    "sardine",
    "anchovis",
    "garnele",
    "garnelen",
    "krabbe",
    "krebs",
    "hummer",
    "muschel",
    "miesmuschel",
    "tintenfisch",
    "oktopus",
    "octopus",
    "kalmar",
    "sepia",
    "fischfilet",
    "fischstäbchen",
    "fischstaebchen",
    "surimi",
    "shrimps",
    "shrimp",
  ] as const;
  if (has(h, fish) || /\bfisch\b/.test(h)) return "fisch";

  const meat = [
    "rind",
    "schwein",
    "lamm",
    "kalb",
    "hähnchen",
    "haehnchen",
    "huhn",
    "pute",
    "truthahn",
    "ente",
    "gans",
    "geflügel",
    "gefluegel",
    "hackfleisch",
    "fleisch",
    "braten",
    "filet",
    "steak",
    "kotelett",
    "schnitzel",
    "gyros",
    "speck",
    "schinken",
    "bacon",
    "pancetta",
    "prosciutto",
    "salami",
    "wurst",
    "würstchen",
    "wuerstchen",
    "leber",
    "nierchen",
    "ragout",
    "corned beef",
    "pastrami",
    "mett",
    "bratwurst",
    "merguez",
    "chorizo",
    "minced",
  ] as const;
  if (has(h, meat)) return "fleisch";

  const milk = [
    "milch",
    "sahne",
    "schmand",
    "crème fraîche",
    "creme fraiche",
    "joghurt",
    "jogurt",
    "quark",
    "skyr",
    "frischkäse",
    "frischkaese",
    "butter",
    "margarine",
    "parmesan",
    "mozzarella",
    "feta",
    "ricotta",
    "mascarpone",
    "gorgonzola",
    "brie",
    "camembert",
    "cheddar",
    "emmentaler",
    "gouda",
    "gruyère",
    "gruyere",
    "pecorino",
    "käse",
    "kaese",
    "buttermilch",
    "dickmilch",
    "sauerrahm",
    "schlagsahne",
    "kokosmilch",
    "kokoscreme",
    "mandelmilch",
    "hafermilch",
    "sojamilch",
  ] as const;
  if (has(h, milk)) return "milch";

  const eggs = [" ei", "eier", "ei,", "ei.", "eigelb", "eiweiß", "eiweiss", "verquirlte eier"];
  if (eggs.some((n) => h.includes(n)) || /^eier?\b/.test(h)) return "eier";

  const grain = [
    "mehl",
    "stärke",
    "staerke",
    "grieß",
    "griess",
    "reis",
    "nudel",
    "pasta",
    "spaghetti",
    "penne",
    "fusilli",
    "rigatoni",
    "lasagne",
    "haferflocken",
    "couscous",
    "bulgur",
    "quinoa",
    "polenta",
    "grütze",
    "gruetze",
    "brot",
    "panko",
    "tortilla",
    "wrap",
    "semolina",
    "dinkel",
    "vollkorn",
  ] as const;
  if (has(h, grain)) return "getreide";

  if (isGreenBeanVegetable(h)) return "gemuese";

  const legume = [
    "linse",
    "bohne",
    "kidney",
    "schwarze bohne",
    "weiße bohne",
    "weisse bohne",
    "kichererbse",
    "sojabohnen",
    "tofu",
    "tempeh",
    "edamame",
    "erbsen aus der dose",
    "kidneybohne",
  ] as const;
  if (has(h, legume)) return "huelsenfruechte";

  const oil = [
    "öl",
    "oel",
    "olivenöl",
    "olivenoel",
    "rapsöl",
    "rapsoel",
    "sonnenblumenöl",
    "sesamöl",
    "sesamoel",
    "kokosöl",
    "trüffelöl",
    "schmalz",
    "ghee",
    "essig",
    "balsamico",
    "weißweinessig",
    "weissweinessig",
    "apfelessig",
  ] as const;
  if (has(h, oil)) return "oele";

  const fruit = [
    "apfel",
    "banane",
    "orange",
    "zitrone",
    "limette",
    "lime",
    "erdbeere",
    "himbeere",
    "brombeere",
    "heidelbeere",
    "blaubeere",
    "johannisbeere",
    "stachelbeere",
    "birne",
    "pfirsich",
    "nektarine",
    "aprikose",
    "mango",
    "ananas",
    "granatapfel",
    "traube",
    "kirsche",
    "sauerkirsche",
    "pflaume",
    "zwetschge",
    "dattel",
    "feige",
    "rosine",
    "korinthen",
    "cranberry",
    "passionsfrucht",
    "kiwi",
    "melone",
    "wassermelone",
    "kokosnuss",
    "kokosraspel",
  ] as const;
  if (has(h, fruit)) return "obst";

  const veg = [
    "tomate",
    "zwiebel",
    "knoblauch",
    "karotte",
    "karotten",
    "möhre",
    "moehre",
    "möhren",
    "moehren",
    "mohre",
    "mohren",
    "kartoffel",
    "sellerie",
    "lauch",
    "porree",
    "gurke",
    "salat",
    "rucola",
    "feldsalat",
    "eisbergsalat",
    "kopfsalat",
    "chicorée",
    "chicoree",
    "radicchio",
    "endivie",
    "spinat",
    "mangold",
    "brokkoli",
    "blumenkohl",
    "zucchini",
    "aubergine",
    "kürbis",
    "kuerbis",
    "pilz",
    "champignon",
    "shiitake",
    "mais",
    "radieschen",
    "rote bete",
    "fenchel",
    "spargel",
    "artischocke",
    "kohl",
    "rosenkohl",
    "wirsing",
    "chinakohl",
    "pak choi",
    "bok choy",
    "ingwer",
    "chili schote",
    "chillischote",
    "jalapeño",
    "jalapeno",
    "peperoni",
    "paprika",
    "peperoncini",
    "petersilie",
    "dill",
    "basilikum",
    "koriander",
    "minze",
    "salbei",
    "thymian",
    "rosmarin",
    "oregano",
    "majoran",
    "schnittlauch",
    "liebstöckel",
    "liebstoecke",
    "piment d'espelette",
    "kapern",
    "olive",
    "frühlingszwiebel",
    "fruehlingszwiebel",
    "schalotte",
    "meerrettich",
    "wasabi",
    "rettich",
    "daikon",
    "staudensellerie",
    "pastinake",
    "topinambur",
    "schwarzwurzel",
    "palmherz",
    "palmherzen",
    "sprossen",
    "sojasprossen",
    "mungbohnensprossen",
    "bambussprossen",
    "erbsen",
    "zuckerschoten",
    "bohnen",
    "grüne bohnen",
    "gruene bohnen",
  ] as const;
  if (has(h, veg)) return "gemuese";

  if (isSpiceGroup(h)) return "gewuerze";

  return "sonstiges";
}

/** Gruppiert Zutaten für die Anzeige; Reihenfolge innerhalb einer Gruppe bleibt erhalten. */
export function groupIngredientsForDisplay(
  ingredients: { id: string; rawText: string }[],
): { groupId: IngredientGroupId; items: { id: string; rawText: string }[] }[] {
  const buckets = new Map<IngredientGroupId, { id: string; rawText: string }[]>();
  for (const id of INGREDIENT_GROUP_ORDER) buckets.set(id, []);

  for (const ing of ingredients) {
    const parsed = parseIngredientLine(ing.rawText);
    const g = classifyIngredientGroup(ing.rawText, parsed);
    buckets.get(g)!.push(ing);
  }

  const out: { groupId: IngredientGroupId; items: { id: string; rawText: string }[] }[] = [];
  for (const gid of INGREDIENT_GROUP_ORDER) {
    const items = buckets.get(gid)!;
    if (items.length) out.push({ groupId: gid, items });
  }
  return out;
}
