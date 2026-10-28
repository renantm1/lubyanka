import type { Action, Case, Conclusion, Ending, Game, Stats } from "./types";
import { characters } from "../content/characters";
import { storyCase } from "./document-generator";
import { generateCase } from "./case-generator";
export const actionLabels: Record<Action, string> = {
  release: "Liberar o investigado",
  detain: "Recomendar detenção",
  watch: "Solicitar vigilância",
  recruit: "Recrutar como informante",
  expose: "Denunciar à comissão",
  conceal: "Omitir a prova do relatório",
  preserve: "Preservar cópia reservada",
  confront: "Confrontar a chefia",
  escape: "Acionar rota de saída",
};
export const conclusionLabels: Record<Conclusion, string> = {
  innocent: "A acusação não se sustenta",
  responsible: "Há responsabilidade comprovada",
  coverup: "Há encobrimento institucional",
};
export const endingInfo: Record<Ending, { title: string; text: string }> = {
  hero: {
    title: "Herói da União Soviética",
    text: "O novo gabinete tem janelas maiores. O arquivo dos detidos, não. Sua promoção é anunciada enquanto famílias continuam esperando respostas. O aparelho aprendeu a usar a sua eficiência.",
  },
  shadow: {
    title: "O homem das sombras",
    text: "Ninguém assina as ordens que agora passam por você. Os contatos de Orlov sobrevivem, os favores se acumulam e o arquivo se torna moeda. Algumas pessoas foram salvas; outras apenas mudaram de dono.",
  },
  conscience: {
    title: "A consciência",
    text: "As cópias chegam às famílias. Você perde a credencial antes de receber qualquer agradecimento. Há nomes que não puderam ser devolvidos à vida, mas já não podem ser apagados do papel.",
  },
  traitor: {
    title: "Traidor da pátria",
    text: "Seu nome aparece no formulário que você costumava preencher. A porta fecha pelo lado de fora. Parte do arquivo desaparece com você; o que saiu da sala depende das cópias que preservou.",
  },
  escape: {
    title: "Deserção",
    text: "Do outro lado da fronteira, o envelope continua pesado. A liberdade não retira seu nome dos relatórios nem protege automaticamente quem ficou. Você terá de decidir a quem entregar os documentos.",
  },
  reformer: {
    title: "O reformista",
    text: "A comissão confirma a cadeia de ordens. Zarya é encerrado, algumas famílias recebem respostas e os responsáveis perdem cargos. A estrutura permanece. A mudança é limitada, real e reversível.",
  },
};
export function createGame(
  seed = "MOSCOU-1983",
  mode: Game["mode"] = "campaign",
): Game {
  return {
    version: 1,
    seed,
    mode,
    day: 1,
    phase: "morning",
    stats: {
      prestige: 35,
      trust: 60,
      paranoia: 15,
      integrity: 50,
      exposure: 10,
    },
    relations: Object.fromEntries(
      characters.map((c) => [c.id, { trust: 40, memories: [] }]),
    ),
    decisions: [],
    events: [],
    board: [],
    opened: [],
    discovered: [],
    links: [],
    positions: {},
    flags: {
      preserved: 0,
      network: 0,
      exposed: 0,
      protected: 0,
      detained: 0,
      escape: false,
    },
    ending: null,
  };
}
export const casesFor = (g: Game): Case[] =>
  g.mode === "campaign"
    ? [storyCase(g.day), generateCase(g.seed, g.day)]
    : [generateCase(g.seed, g.day)];
const clamp = (n: number) => Math.max(0, Math.min(100, n));
export function applyReport(
  g: Game,
  c: Case,
  conclusion: Conclusion,
  action: Action,
  evidence: string[],
  note: string,
): Game {
  if (
    g.phase === "night" ||
    g.phase === "ending" ||
    g.day !== c.day ||
    !casesFor(g).some((x) => x.id === c.id) ||
    g.decisions.some((d) => d.caseId === c.id)
  )
    throw new Error("Relatório indisponível");
  if (!c.actions.includes(action)) throw new Error("Ação indisponível");
  const valid = new Set(c.documents.flatMap((d) => d.clues.map((e) => e.id)));
  const unique = [...new Set(evidence)].filter(
    (e) => valid.has(e) && g.board.includes(e),
  );
  if (unique.length < 2)
    throw new Error("Selecione pelo menos dois trechos deste caso no quadro.");
  const next: Game = structuredClone(g),
    correct = conclusion === c.truth;
  const delta: Stats = {
    prestige: correct ? 3 : -4,
    trust: correct ? 1 : -3,
    paranoia: 0,
    integrity: 0,
    exposure: 0,
  };
  const human = c.truth === "innocent";
  switch (action) {
    case "release":
      delta.integrity = human ? 5 : 1;
      delta.trust = -2;
      delta.prestige -= human ? 0 : 3;
      next.flags.protected++;
      break;
    case "detain":
      delta.trust = 5;
      delta.integrity = human ? -9 : -3;
      delta.paranoia = 3;
      next.flags.detained++;
      break;
    case "watch":
      delta.trust = 2;
      delta.paranoia = 3;
      delta.integrity = -1;
      break;
    case "recruit":
      next.flags.network++;
      delta.paranoia = 2;
      delta.integrity = -1;
      break;
    case "preserve":
      next.flags.preserved++;
      delta.exposure = 2;
      delta.integrity = 3;
      break;
    case "conceal":
      delta.trust = 2;
      delta.integrity = -5;
      next.flags.network++;
      delta.paranoia = 2;
      break;
    case "expose":
      next.flags.exposed++;
      delta.trust = -4;
      delta.exposure = 4;
      delta.integrity = 5;
      delta.prestige = correct ? 5 : -5;
      break;
    case "confront":
      delta.trust = -7;
      delta.exposure = 8;
      delta.integrity = 3;
      next.flags.exposed++;
      break;
    case "escape":
      next.flags.escape = true;
      delta.exposure = 12;
      delta.trust = -8;
      break;
  }
  for (const k of Object.keys(delta) as (keyof Stats)[])
    next.stats[k] = clamp(next.stats[k] + delta[k]);
  const relation = next.relations[c.character];
  relation.trust = clamp(
    relation.trust + (correct ? 5 : -8) + (action === "detain" ? -5 : 0),
  );
  relation.memories.push(
    `Dia ${g.day}: ${actionLabels[action]} — ${c.subject}.`,
  );
  const response =
    action === "detain"
      ? `${c.subject} foi encaminhado à custódia. ${human ? "A família pediu uma revisão. O pedido não suspende a ordem." : "A apuração continua; a detenção não substitui o devido exame das provas."}`
      : action === "release"
        ? `${c.subject} pôde voltar para casa. ${correct ? "Uma carta de agradecimento pode ser interceptada pelo próprio departamento." : "A chefia pede que você justifique as lacunas do relatório."}`
        : action === "preserve"
          ? "Uma cópia foi registrada fora da cadeia habitual. Irina sabe onde procurá-la."
          : action === "recruit"
            ? `${c.subject} aceita conversar, sob a expectativa de proteção. Isso cria uma dívida.`
            : action === "expose" || action === "confront"
              ? "A comissão recebeu sua acusação. O gabinete também sabe que ela existe."
              : action === "escape"
                ? "Orlov recebeu o sinal. Uma rota exige confiança, contatos e cópias suficientes."
                : "A ordem foi registrada. O silêncio também deixa rastros.";
  next.decisions.push({
    day: g.day,
    caseId: c.id,
    subject: c.subject,
    conclusion,
    action,
    evidence: unique,
    correct,
    note: note.slice(0, 1200),
    response,
  });
  next.events.push({ day: g.day + 1, text: response, character: c.character });
  next.phase = "work";
  return next;
}
export function chooseEnding(g: Game): Ending {
  const f = g.flags,
    s = g.stats;
  if (
    f.escape &&
    f.network >= 4 &&
    f.preserved >= 3 &&
    g.relations.mikhail.trust >= 45 &&
    s.exposure < 90
  )
    return "escape";
  if (s.trust < 15 || s.exposure >= 90) return "traitor";
  if (
    f.preserved >= 5 &&
    f.exposed >= 4 &&
    s.trust >= 35 &&
    s.prestige >= 55 &&
    g.relations.irina.trust >= 50 &&
    g.relations.volkov.trust >= 45
  )
    return "reformer";
  if (
    f.protected >= 8 &&
    s.integrity >= 65 &&
    f.exposed >= 2 &&
    f.preserved >= 2
  )
    return "conscience";
  if (f.network >= 8 && g.relations.mikhail.trust >= 45) return "shadow";
  return s.prestige >= 50 && s.trust >= 35 ? "hero" : "traitor";
}
export function endDay(g: Game): Game {
  const required = casesFor(g)[0];
  if (!g.decisions.some((d) => d.caseId === required.id))
    throw new Error(
      "Envie o relatório do processo principal antes de encerrar.",
    );
  return { ...g, phase: "night" };
}
export function nextDay(g: Game): Game {
  if (g.phase !== "night")
    throw new Error("O expediente ainda não foi encerrado.");
  if (g.mode === "campaign" && g.day === 30)
    return { ...g, phase: "ending", ending: chooseEnding(g) };
  return {
    ...g,
    day: g.day + 1,
    phase: "morning",
    board: [],
    links: [],
    positions: {},
  };
}
export function linkClues(
  g: Game,
  a: string,
  b: string,
  relation: "conflict" | "support",
): Game {
  const clues = casesFor(g).flatMap((c) => c.documents.flatMap((d) => d.clues));
  const ca = clues.find((e) => e.id === a),
    cb = clues.find((e) => e.id === b);
  if (a === b || !g.board.includes(a) || !g.board.includes(b) || !ca || !cb)
    throw new Error("Escolha dois trechos diferentes fixados no quadro.");
  if (ca.key !== cb.key)
    throw new Error(
      "Esses trechos tratam de fatos diferentes. Procure fontes sobre a mesma alegação.",
    );
  if ((ca.value !== cb.value) !== (relation === "conflict"))
    throw new Error(
      "A relação proposta não é sustentada pelos trechos. Compare o que cada fonte afirma.",
    );
  return {
    ...g,
    links: [
      ...g.links.filter((l) => !(l.a === a && l.b === b)),
      { a, b, relation },
    ],
  };
}
export function characterEpilogue(g: Game, id: string): string {
  const r = g.relations[id],
    character = characters.find((c) => c.id === id)!;
  const related = g.decisions.filter(
    (d) => casesForHistoryCharacter(d.day) === id,
  );
  const detained = g.decisions.some(
    (d) => character.name.includes(d.subject) && d.action === "detain",
  );
  if (detained)
    return "Foi alcançado por uma ordem de detenção. O registro permanece nos arquivos; a família pede notícias.";
  if (g.ending === "traitor")
    return r.trust >= 60
      ? "Tentou preservar uma cópia antes de seu afastamento. O contato foi interrompido."
      : "Negou conhecer os detalhes do seu trabalho.";
  if (g.ending === "escape")
    return r.trust >= 60
      ? "Ficou para proteger a rede. A última mensagem não confirma se conseguiu."
      : "Passou a responder perguntas sobre a sua fuga.";
  return r.trust >= 60
    ? "A confiança construída nos encontros permitiu que seu testemunho sobrevivesse."
    : related.length
      ? "Sobreviveu à investigação, mas manteve distância. As escolhas deixaram marcas."
      : "Permaneceu à margem das decisões que você registrou.";
}
function casesForHistoryCharacter(day: number) {
  return storyCase(Math.min(day, 30)).character;
}
