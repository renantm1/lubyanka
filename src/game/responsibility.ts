import type {
  Action,
  Case,
  Decision,
  Game,
  Suspect,
  WorldEvent,
} from "./types";
import { normalizeText, sourceFor } from "./evidence";
import { dateFor } from "./document-generator";

export const nominalAction = (action: Action) =>
  ["release", "detain", "watch", "recruit", "expose", "confront"].includes(
    action,
  );
export const accusatoryAction = (action: Action) =>
  ["detain", "expose", "confront"].includes(action);
export function targetFor(
  c: Case,
  action: Action,
  id?: string,
): Suspect | undefined {
  if (!c.suspects?.length || !nominalAction(action)) return;
  const target = c.suspects.find((s) => s.id === (id ?? "primary"));
  if (!target)
    throw new Error("Escolha uma pessoa deste processo para o encaminhamento.");
  return target;
}
export function supportsTarget(
  g: Game,
  c: Case,
  target: Suspect,
  evidence: string[],
): boolean {
  if (target.truth !== "responsible") return false;
  return evidence.some((id) => {
    if (target.basis.includes(id)) return true;
    const excerpt = g.excerpts.find((e) => e.id === id && e.caseId === c.id);
    const doc = excerpt && sourceFor(c, g, id);
    return !!doc?.clues.some(
      (clue) =>
        target.basis.includes(clue.id) &&
        normalizeText(excerpt!.text).includes(normalizeText(clue.text)),
    );
  });
}
export function responsibilityConsequences(
  c: Case,
  decision: Decision,
  target: Suspect | undefined,
): WorldEvent[] {
  if (!target || !accusatoryAction(decision.action)) return [];
  const supported = decision.targetSupported === true,
    text = supported
      ? `A revisão do processo de ${c.subject} recebeu a imputação nominal a ${target.name}. A fonte citada identifica o ato atribuído; a secretaria registrou seu nome como responsável pelo encaminhamento.`
      : `A revisão pediu que você justifique a imputação a ${target.name} no processo de ${c.subject}. As fontes citadas não sustentam essa responsabilidade individual. A medida já emitida não é anulada automaticamente.`;
  return [
    {
      id: `${c.id}:nominal`,
      day: decision.day + 2,
      text,
      character: target.character ?? c.character,
      effects: supported
        ? { prestige: 2, exposure: 1 }
        : { prestige: -3, paranoia: 2, exposure: 2 },
      document: {
        id: `${c.id}-nominal-return`,
        kind: "letter",
        title: `Revisão do encaminhamento · ${target.name}`,
        date: dateFor(decision.day + 2),
        author: "Secretaria de revisão nominal",
        subtitle: "ATO INDIVIDUAL E FONTE CITADA",
        paragraphs: [
          text,
          decision.action === "detain"
            ? `A ficha de custódia pertence a ${target.name}. O registro não foi lançado em nome de ${c.subject === target.name ? "outra pessoa" : c.subject}.`
            : `O encaminhamento foi emitido em nome de ${target.name}; reconhecer um problema institucional não identifica, por si só, seu autor.`,
        ],
        clues: [],
      },
    },
  ];
}
