import { describe, it, expect } from "vitest";
import {
  createGame,
  casesFor,
  applyReport,
  endDay,
  nextDay,
  beginShift,
  linkClues,
  characterEpilogue,
} from "../src/game/engine";
import { documentAccess } from "../src/game/evidence";
import {
  answerMeeting,
  meetingFor,
  meetingBlocked,
  meetingDocuments,
} from "../src/content/meetings";
import { updateInstitution, respondToNotice } from "../src/game/institution";
import { deserialize, serialize } from "../src/game/save-system";
import { validateCase } from "../src/game/case-generator";
import { civilianEpilogues } from "../src/content/epilogues";
import type { Game, Action } from "../src/game/types";
function solve(g: Game, action: Action = "watch") {
  const c = casesFor(g)[0],
    ids = c.documents
      .filter((d) => !documentAccess(g, d))
      .flatMap((d) => d.clues)
      .map((x) => x.id);
  return applyReport({ ...g, board: ids }, c, c.truth, action, ids, "");
}
function until(day: number, choices: Record<number, Action> = {}) {
  let g = beginShift(createGame());
  while (g.day < day)
    g = beginShift(nextDay(endDay(solve(g, choices[g.day] ?? "watch"))));
  return g;
}
function at(day: number): Game {
  return { ...createGame(), day, chapterIntro: null };
}
describe("trinta processos aprofundados", () => {
  it("cada dia tem um anexo próprio e os capítulos seguintes têm livros de custódia", () => {
    const titles = new Set();
    for (let day = 1; day <= 30; day++) {
      const c = casesFor(at(day))[0],
        annex = c.documents.find((d) => d.id === `story-${day}-annex`);
      expect(annex).toBeDefined();
      titles.add(annex!.title);
      expect(validateCase(c)).toEqual([]);
      if (day >= 8) {
        expect(c.documents.some((d) => d.id === `story-${day}-custody`)).toBe(
          true,
        );
        expect(c.documents.some((d) => d.access)).toBe(true);
      }
    }
    expect(titles.size).toBe(30);
  });
  it("abre o parecer reservado por duas relações verificadas, sem adivinhar IDs bloqueados", () => {
    let g = at(22);
    g.stats.prestige = 70;
    const c = casesFor(g)[0],
      reserved = c.documents.find((d) => d.access)!;
    g.board = ["story-22-annex-trace", "story-22-custody-trace"];
    expect(() =>
      linkClues(g, ...(g.board as [string, string]), "support"),
    ).toThrow("não está disponível");
    g.board.push("story-22-claim", "story-22-proof");
    g = linkClues(g, "story-22-claim", "story-22-proof", "conflict");
    expect(documentAccess(g, reserved)).toContain("Requisição pendente");
    g = linkClues(
      g,
      "story-22-annex-trace",
      "story-22-custody-trace",
      "support",
    );
    expect(documentAccess(g, reserved)).toBeNull();
  });
  it("os dias 16–30 exigem três fontes diferentes", () => {
    const g = at(20),
      c = casesFor(g)[0],
      ids = ["story-20-claim", "story-20-proof"];
    expect(() =>
      applyReport({ ...g, board: ids }, c, c.truth, "watch", ids, ""),
    ).toThrow("3 fontes");
    expect(solve(g).decisions).toHaveLength(1);
  });
});
describe("pressão institucional", () => {
  it("abre sindicância por confiança baixa e impede recrutamento sem bloquear provas essenciais", () => {
    let g = at(18);
    g.stats.trust = 20;
    g = updateInstitution(g);
    const c = casesFor(g)[0];
    expect(g.events.some((e) => e.id === "institution-audit")).toBe(true);
    expect(c.actions).not.toContain("recruit");
    expect(c.actions).not.toContain("conceal");
    expect(
      documentAccess(g, c.documents.find((d) => d.id === "story-18-record")!),
    ).toBeNull();
    expect(solve(g).decisions).toHaveLength(1);
  });
  it("permite responder com cópias, recupera acesso e impede repetir o benefício", () => {
    let g = at(18);
    g.stats.trust = 20;
    g.flags.preserved = 2;
    g = updateInstitution(g);
    g = respondToNotice(g, "institution-audit", "documents");
    expect(g.pressure.auditUntil).toBe(0);
    expect(casesFor(g)[0].actions).toContain("recruit");
    expect(() => respondToNotice(g, "institution-audit", "documents")).toThrow(
      "já registrada",
    );
    expect(deserialize(serialize(g))).toEqual(g);
  });
  it("recusa provas inexistentes e respostas após o prazo", () => {
    let g = at(18);
    g.stats.trust = 20;
    g = updateInstitution(g);
    expect(() => respondToNotice(g, "institution-audit", "documents")).toThrow(
      "duas cópias",
    );
    expect(() =>
      respondToNotice({ ...g, day: 22 }, "institution-audit", "supervision"),
    ).toThrow("prazo");
  });
  it("a vigilância aumenta o custo de recrutar e pode ser desviada pela rede", () => {
    let g = at(18);
    g.stats.paranoia = 70;
    g.flags.network = 3;
    g = updateInstitution(g);
    const watched = solve(g, "recruit");
    const rerouted = respondToNotice(g, "institution-surveillance", "reroute");
    expect(rerouted.pressure.surveillanceUntil).toBe(0);
    expect(solve(rerouted, "recruit").stats.exposure).toBeLessThan(
      watched.stats.exposure,
    );
  });
  it("não reabre o mesmo evento nem repete a exposição ao recarregar", () => {
    let g = at(18);
    g.stats.paranoia = 70;
    g = updateInstitution(g);
    expect(updateInstitution(deserialize(serialize(g)))).toEqual(g);
  });
  it("o credenciamento permite consulta por uma janela e expira", () => {
    let g = at(18);
    g.stats.prestige = 65;
    g = updateInstitution(g);
    expect(g.pressure.clearanceUntil).toBe(23);
    g.stats.prestige = 40;
    const doc = {
      ...casesFor(g)[0].documents.find((d) => d.access)!,
      unlock: undefined,
    };
    expect(documentAccess(g, doc)).toBeNull();
    expect(documentAccess({ ...g, day: 24 }, doc)).toContain("prestígio");
  });
});
describe("conversas com compromissos", () => {
  it("registra uma decisão, altera a relação e impede repetir a conversa", () => {
    const g = at(28),
      c = casesFor(g)[0],
      next = answerMeeting(g, c, "redact");
    expect(next.responses).toHaveLength(1);
    expect(next.relations.elena.trust).toBeGreaterThan(g.relations.elena.trust);
    expect(() => answerMeeting(next, c, "full")).toThrow("já registrada");
    expect(meetingDocuments(next, c)[0].title).toBe("Prova P-28 sem endereços");
  });
  it("exige examinar a fonte antes de preservar a cópia de Irina", () => {
    let g = at(17);
    const c = casesFor(g)[0],
      option = meetingFor(g, c)!.choices[0];
    expect(meetingBlocked(g, c, option)).toContain("Examine");
    g.opened = ["story-17-annex"];
    g = answerMeeting(g, c, "copy");
    expect(g.flags.preserved).toBe(1);
    expect(meetingDocuments(g, c)).toHaveLength(1);
  });
  it("uma segunda passagem exige contatos acumulados e sobrevive ao save", () => {
    const g = at(26),
      c = casesFor(g)[0];
    expect(() => answerMeeting(g, c, "companion")).toThrow("4 contatos");
    g.flags.network = 4;
    const next = answerMeeting(g, c, "companion");
    expect(deserialize(serialize(next))).toEqual(next);
    expect(meetingDocuments(next, c)[0].title).toBe("Guia da segunda passagem");
  });
  it("um acordo com Volkov altera o processo do dia 29", () => {
    let g = at(22);
    g = answerMeeting(g, casesFor(g)[0], "bargain");
    g = { ...g, day: 29 };
    expect(casesFor(g)[0].subject).toBe("Viktor Volkov");
    expect(casesFor(g)[0].truth).toBe("responsible");
    expect(validateCase(casesFor(g)[0])).toEqual([]);
  });
  it("entregar o endereço faz Yuri reaparecer na custódia, com um caminho de revisão", () => {
    let g = at(18);
    g = answerMeeting(g, casesFor(g)[0], "address");
    g = { ...g, day: 24 };
    expect(casesFor(g)[0].title).toBe("A visita à casa vazia");
    expect(characterEpilogue(g, "yuri")).toContain("custódia distrital");
    g = solve(g, "release");
    expect(characterEpilogue(g, "yuri")).not.toContain(
      "permaneceu na custódia",
    );
  });
});
describe("novas rotas e epílogos", () => {
  it("o confronto com Volkov provoca uma acusação contra Nadia", () => {
    const g = until(23, { 22: "confront" });
    expect(casesFor(g)[0].subject).toBe("Nadia Belova");
    expect(casesFor(g)[0].truth).toBe("coverup");
    expect(validateCase(casesFor(g)[0])).toEqual([]);
  });
  it("a denúncia do recorte desloca o caso do relógio para o mensageiro", () => {
    const g = until(15, { 9: "expose" });
    expect(casesFor(g)[0].subject).toBe("Petr Gusev");
    expect(casesFor(g)[0].truth).toBe("coverup");
  });
  it("o recrutamento de Yuri abre a casa do ferroviário", () =>
    expect(casesFor(until(18, { 13: "recruit" }))[0].title).toBe(
      "A casa do ferroviário",
    ));
  it("a detenção da jornalista mantém a edição nas mãos de Daria", () => {
    const g = until(28, { 19: "detain" });
    expect(casesFor(g)[0].subject).toBe("Daria Rozanova");
    expect(casesFor(g)[0].truth).toBe("responsible");
    expect(characterEpilogue(g, "elena")).toContain("custódia");
  });
  it("a circulação dos endereços produz epílogos diferentes e específicos", () => {
    let g = at(28);
    g.ending = "conscience";
    const c = casesFor(g)[0];
    g.ending = null;
    const redacted = answerMeeting(g, c, "redact"),
      full = answerMeeting(g, c, "full");
    redacted.ending = full.ending = "conscience";
    expect(characterEpilogue(redacted, "elena")).toContain(
      "retirou os endereços",
    );
    expect(characterEpilogue(full, "elena")).toContain(
      "segurança pôde localizar",
    );
    expect(characterEpilogue(full, "irina")).not.toBe(
      characterEpilogue(full, "elena"),
    );
  });
  it("uma libertação posterior muda o epílogo civil de Mirov", () => {
    const g = until(4, { 1: "detain" });
    expect(civilianEpilogues(g)[0].text).toContain("revisão");
    expect(civilianEpilogues(solve(g, "release"))[0].text).toContain(
      "pôde estar",
    );
  });
  it("apresenta as quatro aberturas sem introduzi-las no modo infinito", () => {
    let g = createGame();
    expect(g.chapterIntro).toBe(1);
    g = beginShift(g);
    expect(g.chapterIntro).toBeNull();
    for (let day = 1; day < 30; day++) {
      g = nextDay(endDay(solve(g)));
      expect(g.chapterIntro).toBe([8, 16, 24].includes(g.day) ? g.day : null);
      g = beginShift(g);
    }
    expect(createGame("arquivo", "infinite").chapterIntro).toBeNull();
  });
  it("migra saves 0.2 sem criar penalidades ou abrir capítulos retroativamente", () => {
    const raw = JSON.parse(serialize(until(17)));
    delete raw.game.pressure;
    delete raw.game.responses;
    delete raw.game.chapterIntro;
    const restored = deserialize(JSON.stringify(raw));
    expect(restored.pressure).toEqual({
      auditUntil: 0,
      surveillanceUntil: 0,
      clearanceUntil: 0,
    });
    expect(restored.responses).toEqual([]);
    expect(restored.chapterIntro).toBeNull();
    expect(restored.decisions).toEqual(raw.game.decisions);
  });
});

describe("limites dos contatos detidos", () => {
  it("Orlov detido não oferece uma nova passagem reservada", () => {
    const g = until(26, { 18: "detain" });
    expect(meetingFor(g, casesFor(g)[0])).toBeUndefined();
  });
  it("um acordo não mantém Volkov emitindo ordens depois de preso", () => {
    let g = at(22);
    g = answerMeeting(g, casesFor(g)[0], "bargain");
    g = solve(g, "detain");
    g = { ...g, day: 29 };
    expect(casesFor(g)[0].subject).toBe("Oleg Karpov");
  });
});

describe("suspensão efetiva dos contatos", () => {
  it("suspende conversas e recrutamento por dois expedientes e depois permite retomá-los", () => {
    let g = at(26);
    g.stats.paranoia = 70;
    g = updateInstitution(g);
    g = respondToNotice(g, "institution-surveillance", "pause");
    expect(meetingFor(g, casesFor(g)[0])).toBeUndefined();
    expect(casesFor(g)[0].actions).not.toContain("recruit");
    expect(casesFor({ ...g, day: 28 })[0].actions).toContain("recruit");
  });
  it("não apaga a cópia editorial nem quebra o processo se a conversa já aconteceu", () => {
    let g = at(28);
    const c = casesFor(g)[0];
    g = answerMeeting(g, c, "redact");
    g.stats.paranoia = 70;
    g = updateInstitution(g);
    g = respondToNotice(g, "institution-surveillance", "pause");
    expect(
      casesFor(g)[0].documents.some(
        (d) => d.title === "Prova P-28 sem endereços",
      ),
    ).toBe(true);
  });
});
