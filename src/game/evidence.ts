import type { Case, Clue, ComparisonField, Document, Game } from "./types";

export const normalizeText = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
export function documentAccess(g: Game, doc: Document): string | null {
  if (
    doc.unlock &&
    ![doc.unlock, ...(doc.unlockAlternatives ?? [])].some((required) =>
      g.links.some(
        (l) =>
          ((l.a === required.a && l.b === required.b) ||
            (l.a === required.b && l.b === required.a)) &&
          l.relation === required.relation,
      ),
    )
  )
    return doc.unlock.a.endsWith("annex-trace")
      ? "Requisição pendente: cruze o anexo com o livro de custódia no quadro."
      : doc.unlockAlternatives?.length
        ? "Requisição pendente: confronte a declaração com o registro independente ou corrobore o registro com a diligência recebida."
        : "Requisição pendente: registre no quadro a relação entre a declaração e o registro independente.";
  if (doc.access && g.pressure.auditUntil >= g.day)
    return "Consulta a pareceres especiais suspensa durante a sindicância. Responda à ordem na correspondência ou aguarde o prazo.";
  if (
    doc.access?.prestige &&
    g.stats.prestige < doc.access.prestige &&
    g.pressure.clearanceUntil < g.day
  )
    return "Autorização especial: seu prestígio ainda não permite consultar este anexo opcional.";
  if (doc.access?.trust && g.stats.trust < doc.access.trust)
    return "Consulta suspensa pela chefia. As provas essenciais continuam disponíveis.";
  return null;
}
export function cluesFor(g: Game, cases: Case[]): Clue[] {
  return [
    ...cases.flatMap((c) => c.documents.flatMap((d) => d.clues)),
    ...g.excerpts.filter((e) =>
      cases.some(
        (c) =>
          c.id === e.caseId &&
          c.documents.some(
            (d) => d.id === e.documentId && excerptExists(d, e.text),
          ),
      ),
    ),
  ];
}
export function sourceFor(c: Case, g: Game, id: string): Document | undefined {
  const excerpt = g.excerpts.find((e) => e.id === id && e.caseId === c.id);
  return c.documents.find(
    (d) => d.clues.some((e) => e.id === id) || d.id === excerpt?.documentId,
  );
}
export function excerptExists(doc: Document, text: string) {
  return normalizeText(
    [...doc.paragraphs, ...doc.clues.map((c) => c.text)].join(" "),
  ).includes(normalizeText(text));
}
export function addExcerpt(
  g: Game,
  c: Case,
  documentId: string,
  text: string,
): Game {
  if (g.phase === "night" || g.phase === "ending")
    throw new Error("O expediente já foi encerrado.");
  const doc = c.documents.find((d) => d.id === documentId),
    quote = text.replace(/\s+/g, " ").trim();
  if (!doc || c.day !== g.day || !g.opened.includes(documentId))
    throw new Error(
      "Abra um documento do processo atual antes de fixar uma seleção.",
    );
  const denied = documentAccess(g, doc);
  if (denied) throw new Error(denied);
  if (quote.length < 8 || quote.length > 600 || !excerptExists(doc, quote))
    throw new Error(
      "Selecione de 8 a 600 caracteres do texto original deste documento.",
    );
  const previous = g.excerpts.find(
    (e) => e.documentId === documentId && e.text === quote,
  );
  if (previous) return { ...g, board: [...new Set([...g.board, previous.id])] };
  const id = `excerpt-${c.id}-${g.excerpts.length + 1}`;
  return {
    ...g,
    board: [...g.board, id],
    excerpts: [
      ...g.excerpts,
      {
        id,
        text: quote,
        key: `${c.id}-selecao`,
        value: quote,
        source: doc.title,
        documentId,
        caseId: c.id,
      },
    ],
  };
}

const months = [
  "janeiro",
  "fevereiro",
  "marco",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];
function canonicalDate(v: string) {
  const text = normalizeText(v),
    numeric = text.match(/^(\d{1,2})[/.](\d{1,2})(?:[/.](\d{2,4}))?$/);
  if (numeric)
    return `${numeric[3] ? (numeric[3].length === 2 ? "19" + numeric[3] : numeric[3]) : "1983"}-${numeric[2].padStart(2, "0")}-${numeric[1].padStart(2, "0")}`;
  const words = text.match(/^(\d{1,2}) de ([a-z]+)(?: de (\d{4}))?$/);
  if (words && months.includes(words[2]))
    return `${words[3] || "1983"}-${String(months.indexOf(words[2]) + 1).padStart(2, "0")}-${words[1].padStart(2, "0")}`;
  return text;
}
export function valuesFor(clue: Clue, field: ComparisonField): string[] {
  let values: string[] = [];
  switch (field) {
    case "date":
      values =
        clue.text.match(
          /\b\d{1,2}[/.]\d{1,2}(?:[/.]\d{2,4})?\b|\b\d{1,2} de [a-zçã]+(?: de \d{4})?/gi,
        ) ?? [];
      break;
    case "time":
      values = clue.text.match(/\b\d{1,2}(?:h\d{2}|h|:\d{2})\b/g) ?? [];
      break;
    case "reference":
      values =
        clue.text.match(/\b[A-Z]{1,5}[-/]\d{1,5}(?:\/\d{2,4})?\b/g) ?? [];
      break;
    case "name":
      values =
        clue.text.match(
          /\b[A-ZÀ-Ý][a-zà-ÿ]+(?: (?:de |da |do )?[A-ZÀ-Ý][a-zà-ÿ]+)+\b/g,
        ) ?? [];
      break;
    case "text":
      values = [clue.text];
      break;
  }
  return [...new Set(values)];
}
export function compareValues(
  g: Game,
  cases: Case[],
  a: string,
  b: string,
  field: ComparisonField,
  valueA: string,
  valueB: string,
  note: string,
): Game {
  const clues = cluesFor(g, cases),
    left = clues.find((c) => c.id === a),
    right = clues.find((c) => c.id === b);
  if (
    a === b ||
    !left ||
    !right ||
    !g.board.includes(a) ||
    !g.board.includes(b)
  )
    throw new Error("Escolha dois trechos diferentes do quadro.");
  if (
    !valuesFor(left, field).includes(valueA) ||
    !valuesFor(right, field).includes(valueB)
  )
    throw new Error("Escolha valores presentes nos trechos selecionados.");
  const canonical = (v: string) =>
    field === "date"
      ? canonicalDate(v)
      : field === "time"
        ? v.replace(/h$/, ":00").replace("h", ":").padStart(5, "0")
        : normalizeText(v);
  const comparison = {
    a,
    b,
    field,
    valueA,
    valueB,
    result:
      canonical(valueA) === canonical(valueB)
        ? ("same" as const)
        : ("different" as const),
    note: note.trim().slice(0, 400),
  };
  return {
    ...g,
    comparisons: [
      ...g.comparisons.filter(
        (x) =>
          !(
            x.a === a &&
            x.b === b &&
            x.field === field &&
            x.valueA === valueA &&
            x.valueB === valueB
          ),
      ),
      comparison,
    ],
  };
}
