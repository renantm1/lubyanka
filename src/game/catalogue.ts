import type { Document } from "./types";
// Um mesmo protocolo pode ter versões diferentes em rotas distintas.
// A coleção conserva ambas, enquanto o processo em andamento mantém seus IDs estáveis.
export function collectDocuments(
  previous: Document[],
  current: Document[],
): Document[] {
  const identity = (d: Document) =>
    JSON.stringify([d.id, d.title, d.author, d.date, d.paragraphs, d.clues]);
  return [
    ...new Map([...previous, ...current].map((d) => [identity(d), d])).values(),
  ];
}
