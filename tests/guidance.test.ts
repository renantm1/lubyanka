import { describe, it, expect } from "vitest";
import {
  beginShift,
  createGame,
  casesFor,
  linkClues,
  applyReport,
  endDay,
  nextDay,
} from "../src/game/engine";
import {
  boardEntries,
  clueTopic,
  pairGuidance,
  suggestedPair,
  nextStep,
  tutorialStep,
} from "../src/game/guidance";
import {
  addExcerpt,
  compareValues,
  documentAccess,
} from "../src/game/evidence";
import { serialize, deserialize } from "../src/game/save-system";
import { requestInquiry } from "../src/game/inquiries";
import { validateCase } from "../src/game/case-generator";
import type { Game } from "../src/game/types";
const at = (day = 1): Game => ({ ...beginShift(createGame()), day });
describe("tutorial do primeiro expediente", () => {
  it("acompanha seis etapas reais e termina ao avançar para o segundo dia", () => {
    let g = at();
    const c = casesFor(g)[0];
    expect(tutorialStep(g, c)?.number).toBe(1);
    g.board = ["story-1-claim"];
    expect(tutorialStep(g, c)?.number).toBe(2);
    g.board.push("story-1-proof");
    expect(tutorialStep(g, c)?.number).toBe(3);
    g = linkClues(g, g.board[0], g.board[1], "conflict");
    expect(tutorialStep(g, c)?.number).toBe(4);
    g = applyReport(g, c, "innocent", "release", g.board, "");
    expect(tutorialStep(g, c)?.number).toBe(5);
    g = endDay(g);
    expect(tutorialStep(g, c)?.number).toBe(6);
    g = nextDay(g);
    expect(g.tutorial).toBe("completed");
    expect(tutorialStep(g, casesFor(g)[0])).toBeNull();
  });
  it("permite pular sem apagar provas e mantém a escolha no save", () => {
    const g = at();
    g.board = ["story-1-claim"];
    const skipped = deserialize(serialize({ ...g, tutorial: "skipped" }));
    expect(skipped.board).toEqual(g.board);
    expect(tutorialStep(skipped, casesFor(skipped)[0])).toBeNull();
    expect(
      tutorialStep({ ...skipped, tutorial: "active" }, casesFor(skipped)[0])
        ?.number,
    ).toBe(2);
    expect(createGame("infinito", "infinite").tutorial).toBe("skipped");
  });
  it("orienta saves antigos no primeiro dia, respeita partidas avançadas e valida o novo campo", () => {
    const raw = JSON.parse(serialize(at()));
    delete raw.game.tutorial;
    expect(deserialize(JSON.stringify(raw)).tutorial).toBe("active");
    raw.game.day = 2;
    expect(deserialize(JSON.stringify(raw)).tutorial).toBe("skipped");
    raw.game.tutorial = "desconhecido";
    expect(() => deserialize(JSON.stringify(raw))).toThrow("Tutorial inválido");
  });
});
describe("orientação para investigar", () => {
  it("conduz da pasta ao registro e ao relatório sem exigir uma ligação", () => {
    let g = at();
    const c = casesFor(g)[0];
    expect(nextStep(g, c)).toMatchObject({
      action: "document",
      document: { id: "story-1-report" },
      sources: 0,
    });
    g.opened = ["story-1-report"];
    g.board = ["story-1-claim"];
    expect(nextStep(g, c)).toMatchObject({
      document: { id: "story-1-record" },
      sources: 1,
    });
    g.opened.push("story-1-record");
    g.board.push("story-1-proof");
    expect(nextStep(g, c)).toMatchObject({
      action: "report",
      sources: 2,
      minimum: 2,
    });
    expect(g.links).toEqual([]);
    g = applyReport(g, c, "innocent", "release", g.board, "");
    expect(nextStep(g, c).action).toBe("finish");
  });
  it("conta documentos, mantém processos separados e ignora IDs ausentes", () => {
    const g = at(),
      [c, other] = casesFor(g);
    g.board = ["story-1-claim", `${other.id}-claim`, "ausente"];
    expect(boardEntries(g, c).map((e) => e.clue.id)).toEqual(["story-1-claim"]);
    expect(boardEntries(g, other).map((e) => e.clue.id)).toEqual([
      `${other.id}-claim`,
    ]);
    g.opened = ["story-1-report"];
    const quote = c.documents.find((d) => d.id === "story-1-report")!.clues[0]
      .text;
    const withQuote = addExcerpt(g, c, "story-1-report", quote);
    expect(nextStep(withQuote, c).sources).toBe(1);
    expect(
      clueTopic(
        c,
        c.documents.find((d) => d.id === "story-1-letter")!.clues[0],
      ),
    ).toBe("Contexto e motivação");
  });
  it("orienta os estágios com três ou quatro fontes sem depender de um laudo restrito", () => {
    const g = { ...at(25), mode: "infinite" as const },
      c = casesFor(g)[0];
    g.opened = [`${c.id}-report`, `${c.id}-record`];
    g.board = [`${c.id}-claim`, `${c.id}-proof`];
    expect(nextStep(g, c)).toMatchObject({
      sources: 2,
      minimum: 4,
      action: "document",
    });
    g.board.push(`${c.id}-context`, `${c.id}-hearsay`);
    expect(nextStep(g, c)).toMatchObject({
      sources: 4,
      minimum: 4,
      action: "report",
    });
  });
  it("explica falta de seleção, assuntos diferentes e seleção livre antes de tentar ligar", () => {
    let g = at();
    const c = casesFor(g)[0];
    g.board = ["story-1-claim", "story-1-proof", "story-1-context"];
    expect(pairGuidance(g, c, []).ready).toBe(false);
    expect(pairGuidance(g, c, ["story-1-claim"]).text).toContain(
      "Fonte A escolhida",
    );
    expect(
      pairGuidance(g, c, ["story-1-claim", "story-1-context"]).text,
    ).toContain("assuntos diferentes");
    expect(pairGuidance(g, c, ["story-1-claim", "story-1-proof"]).ready).toBe(
      true,
    );
    g.opened = ["story-1-report"];
    g = addExcerpt(g, c, "story-1-report", "Mirov foi visto na plataforma 4");
    expect(
      pairGuidance(g, c, [g.excerpts[0].id, "story-1-proof"]),
    ).toMatchObject({
      ready: false,
      text: expect.stringContaining("texto livre"),
    });
  });
  it("sugere fontes disponíveis e depois avança para a cadeia de custódia, sem alterar a partida", () => {
    let g = at(22);
    const before = serialize(g);
    const c = casesFor(g)[0];
    expect(suggestedPair(g, c)).toEqual({
      a: "story-22-claim",
      b: "story-22-proof",
      relation: "conflict",
    });
    expect(serialize(g)).toBe(before);
    g.board = ["story-22-claim", "story-22-proof"];
    g = linkClues(g, ...(g.board as [string, string]), "conflict");
    expect(suggestedPair(g, casesFor(g)[0])).toEqual({
      a: "story-22-annex-trace",
      b: "story-22-custody-trace",
      relation: "support",
    });
  });
});
describe("correções do quadro", () => {
  it("a defesa de Volkov conflita com o anexo sem mudar a conclusão de responsabilidade", () => {
    let g = at(22);
    const c = casesFor(g)[0],
      annex = c.documents.find((d) => d.id === "story-22-annex")!;
    expect(c.truth).toBe("responsible");
    expect(validateCase(c)).toEqual([]);
    g.board = ["story-22-claim", "story-22-proof"];
    expect(() =>
      linkClues(g, ...(g.board as [string, string]), "support"),
    ).toThrow("não é sustentada");
    g = linkClues(g, ...(g.board as [string, string]), "conflict");
    expect(documentAccess(g, annex)).toBeNull();
  });
  it("inverter A e B não duplica a ligação nem a comparação do mesmo detalhe", () => {
    let g = at();
    const c = casesFor(g)[0];
    g.board = ["story-1-claim", "story-1-proof"];
    g = linkClues(g, g.board[0], g.board[1], "conflict");
    g = linkClues(g, g.board[1], g.board[0], "conflict");
    expect(g.links).toHaveLength(1);
    g = compareValues(
      g,
      [c],
      g.board[0],
      g.board[1],
      "date",
      "31 de outubro",
      "31/10/1983",
      "Primeira nota",
    );
    g = compareValues(
      g,
      [c],
      g.board[1],
      g.board[0],
      "date",
      "31/10/1983",
      "31 de outubro",
      "Nota revista",
    );
    expect(g.comparisons).toHaveLength(1);
    expect(g.comparisons[0].note).toBe("Nota revista");
  });
  it("não permite alterar cruzamentos depois de encerrar o expediente", () => {
    const g = at(),
      c = casesFor(g)[0];
    g.board = ["story-1-claim", "story-1-proof"];
    for (const phase of ["night", "ending"] as const) {
      expect(() =>
        linkClues(
          { ...g, phase },
          ...(g.board as [string, string]),
          "conflict",
        ),
      ).toThrow("encerrado");
      expect(() =>
        compareValues(
          { ...g, phase },
          [c],
          g.board[0],
          g.board[1],
          "date",
          "31 de outubro",
          "31/10/1983",
          "",
        ),
      ).toThrow("encerrado");
    }
  });
  it("a comparação livre respeita a suspensão de uma fonte especial", () => {
    let g = at(22);
    g.stats.prestige = 70;
    g.board = [
      "story-22-claim",
      "story-22-proof",
      "story-22-annex-trace",
      "story-22-custody-trace",
      "story-22-reserved-note",
    ];
    g = linkClues(g, g.board[0], g.board[1], "conflict");
    g = linkClues(g, g.board[2], g.board[3], "support");
    const c = casesFor(g)[0],
      a = c.documents.find((d) => d.id === "story-22-record")!.clues[0],
      b = c.documents.find((d) => d.id === "story-22-reserved")!.clues[0];
    g.stats.prestige = 30;
    expect(() =>
      compareValues(g, [c], a.id, b.id, "text", a.text, b.text, ""),
    ).toThrow("não está disponível");
    expect(
      boardEntries(g, c).find((e) => e.clue.id === b.id)!.denied,
    ).toContain("prestígio");
  });
  it("migra a ligação antiga de Volkov, documentos e diligências, preservando o anexo e os indicadores", () => {
    let g = at(22);
    g.opened = ["story-22-report"];
    g = requestInquiry(g, "story-22", "formal");
    const c = casesFor(g)[0];
    g.discovered = c.documents.filter((d) =>
      ["story-22-record", "story-22-annex", "story-22-inquiry-formal"].includes(
        d.id,
      ),
    );
    g.links = [
      { a: "story-22-claim", b: "story-22-proof", relation: "support" },
      { a: "story-22-proof", b: "story-22-claim", relation: "support" },
    ];
    const raw = JSON.parse(serialize(g));
    raw.game.inquiries[0].document.clues[0].value = "alegacao";
    for (const doc of raw.game.discovered) {
      if (doc.id !== "story-22-annex") doc.clues[0].value = "alegacao";
      if (doc.unlock) doc.unlock.relation = "support";
    }
    const loaded = deserialize(JSON.stringify(raw)),
      current = casesFor(loaded)[0];
    expect(loaded.stats).toEqual(g.stats);
    expect(loaded.decisions).toEqual(g.decisions);
    expect(loaded.links).toEqual([
      { a: "story-22-claim", b: "story-22-proof", relation: "conflict" },
    ]);
    expect(
      documentAccess(
        loaded,
        current.documents.find((d) => d.id === "story-22-annex")!,
      ),
    ).toBeNull();
    expect(loaded.inquiries[0].document.clues[0].value).toBe("refutacao");
    const id = loaded.inquiries[0].document.clues[0].id;
    loaded.board = ["story-22-proof", id];
    expect(() =>
      linkClues(loaded, "story-22-proof", id, "support"),
    ).not.toThrow();
    expect(deserialize(serialize(loaded))).toEqual(loaded);
  });
});
