import { describe, it, expect } from "vitest";
import { collectDocuments } from "../src/game/catalogue";
import {
  createGame,
  casesFor,
  applyReport,
  endDay,
  nextDay,
  linkClues,
} from "../src/game/engine";
import {
  addExcerpt,
  cluesFor,
  compareValues,
  documentAccess,
  valuesFor,
} from "../src/game/evidence";
import { deliverConsequences } from "../src/game/consequences";
import { deserialize, serialize } from "../src/game/save-system";
import { validateCase } from "../src/game/case-generator";
import { generateCase } from "../src/game/case-generator";
import type { Action, Game } from "../src/game/types";
function report(g: Game, action: Action) {
  const c = casesFor(g)[0],
    ids = c.documents
      .filter((d) => !d.unlock)
      .flatMap((d) => d.clues)
      .map((e) => e.id);
  return applyReport({ ...g, board: ids }, c, c.truth, action, ids, "");
}
function until(day: number, choices: Record<number, Action> = {}) {
  let g = createGame();
  while (g.day < day) g = nextDay(endDay(report(g, choices[g.day] ?? "watch")));
  return g;
}
describe("ramificações e tempo", () => {
  it("a detenção de Mirov altera o processo do dia 4 e entrega o pedido da mãe", () => {
    const detained = until(4, { 1: "detain" }),
      released = until(4, { 1: "release" });
    expect(casesFor(detained)[0].subject).toBe("Alexei Mirov");
    expect(casesFor(detained)[0].truth).toBe("coverup");
    expect(casesFor(released)[0].subject).toBe("Dmitri Levin");
    expect(
      detained.events.find((e) => e.id === "story-1:late")?.document?.title,
    ).toBe("Pedido de Anna Mirova");
    expect(detained.appliedEvents).toContain("story-1:late");
  });
  it("a custódia de Vera pode ser usada em uma acusação posterior impossível", () => {
    const g = until(9, { 3: "detain" });
    const c = casesFor(g)[0];
    expect(c.title).toBe("As ampolas que ficaram");
    expect(c.truth).toBe("coverup");
    expect(c.documents.flatMap((d) => d.paragraphs).join(" ")).toContain(
      "06/11/1983",
    );
    expect(validateCase(c)).toEqual([]);
  });
  it("recrutar Anna abre uma investigação de laboratório diferente", () => {
    const recruited = until(12, { 8: "recruit" }),
      other = until(12);
    expect(casesFor(recruited)[0].title).toBe("A chave de Anna");
    expect(casesFor(recruited)[0].truth).toBe("innocent");
    expect(casesFor(other)[0].subject).toBe("Lev Antonov");
  });
  it("a detenção do cientista altera o dia 20, sem confundir Anna com Antonov", () => {
    expect(casesFor(until(20, { 12: "detain" }))[0].title).toBe(
      "O depoimento ausente",
    );
    expect(casesFor(until(20, { 8: "recruit", 12: "detain" }))[0].title).toBe(
      "Onze certidões",
    );
  });
  it("preservar a cópia do dia 5 produz informação nova no dia 7", () => {
    const saved = until(7, { 5: "preserve" });
    expect(casesFor(saved)[0].briefing).toContain("cópia financeira");
    expect(saved.appliedEvents).toContain("story-5:late");
  });
  it("não aplica uma consequência antes do dia marcado nem duas vezes depois", () => {
    let g = report(createGame(), "detain");
    const before = g.stats.exposure;
    g = deliverConsequences(g);
    expect(g.stats.exposure).toBe(before);
    g = { ...g, day: 4 };
    const applied = deliverConsequences(g);
    expect(applied.stats.exposure).toBe(before + 2);
    expect(deliverConsequences(applied)).toEqual(applied);
  });
  it("todas as ramificações preservam a consistência dos 30 dias", () => {
    for (const choices of [
      { 1: "detain", 3: "detain", 12: "detain" },
      { 5: "preserve", 8: "recruit" },
    ] as Record<number, Action>[]) {
      let g = createGame();
      for (let day = 1; day <= 30; day++) {
        expect(validateCase(casesFor(g)[0])).toEqual([]);
        g = nextDay(endDay(report(g, choices[day] ?? "watch")));
      }
    }
  });
});
describe("provas e seleções livres", () => {
  it("libera o anexo pericial somente após registrar a relação correta", () => {
    let g = createGame();
    const c = casesFor(g)[0],
      annex = c.documents.find((d) => d.unlock)!;
    expect(documentAccess(g, annex)).toContain("Requisição pendente");
    g.board = ["story-1-claim", "story-1-proof"];
    g = linkClues(g, g.board[0], g.board[1], "conflict");
    expect(documentAccess(g, annex)).toBeNull();
  });
  it("não aceita usar um anexo ainda bloqueado como evidência", () => {
    const g = createGame(),
      c = casesFor(g)[0];
    const ids = [
      "story-1-claim",
      c.documents.find((d) => d.unlock)!.clues[0].id,
    ];
    expect(() =>
      applyReport({ ...g, board: ids }, c, c.truth, "release", ids, ""),
    ).toThrow();
  });
  it("fixa trechos originais de documentos abertos e evita duplicação", () => {
    let g = createGame();
    const c = casesFor(g)[0],
      doc = c.documents.find((d) => d.id === "story-1-record")!;
    const quote = "a 180 km de Moscou";
    expect(() => addExcerpt(g, c, doc.id, quote)).toThrow();
    g.opened = [doc.id];
    g = addExcerpt(g, c, doc.id, quote);
    expect(g.excerpts[0].text).toBe(quote);
    expect(addExcerpt(g, c, doc.id, quote).excerpts).toHaveLength(1);
    expect(() =>
      addExcerpt(g, c, doc.id, "Um texto que não está no documento."),
    ).toThrow();
  });
  it("não confunde dois trechos da mesma fonte com confirmação independente", () => {
    let g = createGame();
    const c = casesFor(g)[0],
      d = c.documents.find((d) => d.id === "story-1-record")!;
    g.opened = [d.id];
    g = addExcerpt(g, c, d.id, "a 180 km de Moscou");
    g = addExcerpt(g, c, d.id, "das 18h às 23h");
    expect(() => applyReport(g, c, c.truth, "release", g.board, "")).toThrow(
      "2 fontes diferentes",
    );
  });
  it("compara datas em formatos diferentes sem transformar diferença textual em contradição", () => {
    let g = createGame();
    const c = casesFor(g)[0];
    g.board = ["story-1-claim", "story-1-proof"];
    g = compareValues(
      g,
      [c],
      g.board[0],
      g.board[1],
      "date",
      "31 de outubro",
      "31/10/1983",
      "As fontes tratam da mesma noite.",
    );
    expect(g.comparisons[0].result).toBe("same");
    expect(g.links).toHaveLength(0);
  });
  it("recusa valores ausentes e extrai referências sem inventá-las", () => {
    const c = casesFor(until(6))[0],
      annex = c.documents.find((d) => d.unlock)!;
    expect(valuesFor(annex.clues[0], "reference")).toEqual(["C-41", "C-14"]);
    let g = createGame();
    g.board = ["story-1-claim", "story-1-proof"];
    expect(() =>
      compareValues(
        g,
        casesFor(g),
        g.board[0],
        g.board[1],
        "date",
        "01/01/1900",
        "31/10/1983",
        "",
      ),
    ).toThrow();
  });
  it("uma seleção livre continua sendo uma citação, não uma conclusão automática", () => {
    let g = createGame();
    const c = casesFor(g)[0];
    g.opened = ["story-1-report", "story-1-record"];
    g = addExcerpt(g, c, "story-1-report", "Mirov foi visto na plataforma 4");
    g = addExcerpt(g, c, "story-1-record", "a 180 km de Moscou");
    expect(() => linkClues(g, g.board[0], g.board[1], "conflict")).toThrow(
      "mesa de confronto",
    );
    expect(cluesFor(g, [c])).toHaveLength(6);
    expect(reportWithQuotes(g).decisions).toHaveLength(1);
  });
});
function reportWithQuotes(g: Game) {
  const c = casesFor(g)[0];
  return applyReport(g, c, "innocent", "release", g.board, "");
}
describe("migração de saves", () => {
  it("importa um save 0.1 sem apagar decisões, provas ou estatísticas", () => {
    const g = report(createGame(), "detain"),
      raw = JSON.parse(serialize(g));
    delete raw.game.excerpts;
    delete raw.game.comparisons;
    delete raw.game.appliedEvents;
    const migrated = deserialize(JSON.stringify(raw));
    expect(migrated.decisions).toEqual(g.decisions);
    expect(migrated.stats).toEqual(g.stats);
    expect(migrated.board).toEqual(g.board);
    expect(migrated.excerpts).toEqual([]);
  });
  it("recupera seleções, comparações e entregas já aplicadas", () => {
    let g = until(4, { 1: "detain" });
    const c = casesFor(g)[0],
      doc = c.documents.find((d) => d.id === "story-4-record")!;
    g.opened = [doc.id];
    g = addExcerpt(g, c, doc.id, doc.paragraphs[1]);
    expect(deserialize(serialize(g))).toEqual(g);
    expect(deliverConsequences(deserialize(serialize(g)))).toEqual(g);
  });
  it("rejeita anotações e efeitos malformados em vez de quebrar a interface", () => {
    const raw = JSON.parse(serialize(createGame()));
    raw.game.excerpts = null;
    expect(() => deserialize(JSON.stringify(raw))).toThrow();
    raw.game.excerpts = [];
    raw.game.events = [
      {
        id: "bad",
        day: 1,
        character: "irina",
        text: "x",
        effects: { trust: "texto" },
      },
    ];
    expect(() => deserialize(JSON.stringify(raw))).toThrow();
  });
});
describe("identidade e documentos exclusivos", () => {
  it("mantém as idades dos personagens que reaparecem", () => {
    expect(casesFor(until(4, { 1: "detain" }))[0].age).toBe(34);
    expect(casesFor(until(9, { 3: "detain" }))[0].age).toBe(
      casesFor(until(3))[0].age,
    );
  });
  it("a cópia preservada abre um documento financeiro que não existe na outra rota", () => {
    const saved = casesFor(until(7, { 5: "preserve" }))[0],
      lost = casesFor(until(7))[0];
    expect(
      saved.documents.some((d) => d.title === "Ligação financeira · Z-17"),
    ).toBe(true);
    expect(
      lost.documents.some((d) => d.title === "Ligação financeira · Z-17"),
    ).toBe(false);
  });
});
describe("complexidade procedural", () => {
  it("aumenta as fontes e introduz entrevistas e laudos sem mudar a seed", () => {
    const early = generateCase("TULA", 1),
      middle = generateCase("TULA", 17),
      late = generateCase("TULA", 25);
    expect(early.minimumSources).toBe(2);
    expect(middle.minimumSources).toBe(3);
    expect(late.minimumSources).toBe(4);
    expect(
      late.documents.some(
        (d) => d.title === "Transcrição da segunda entrevista",
      ),
    ).toBe(true);
    expect(late.documents.some((d) => d.unlock)).toBe(true);
  });
  it("exige quatro documentos no estágio avançado sem obrigar a obter um anexo bloqueado", () => {
    let g = { ...createGame("TULA", "infinite"), day: 25 };
    const c = casesFor(g)[0],
      ids = c.documents
        .filter((d) => !d.unlock)
        .flatMap((d) => d.clues)
        .map((e) => e.id);
    g = { ...g, board: ids };
    expect(() =>
      applyReport(g, c, c.truth, "watch", ids.slice(0, 2), ""),
    ).toThrow("4 fontes diferentes");
    expect(applyReport(g, c, c.truth, "watch", ids, "").decisions).toHaveLength(
      1,
    );
  });
  it("continua solucionável depois de centenas de dias", () => {
    for (let day = 100; day <= 500; day += 20) {
      const c = generateCase("longo", day);
      expect(validateCase(c)).toEqual([]);
      expect(
        c.documents.filter((d) => !d.unlock && d.clues.length).length,
      ).toBeGreaterThanOrEqual(c.minimumSources!);
    }
  });
});

describe("coleção entre partidas", () => {
  it("conserva versões de um protocolo em rotas distintas sem repetir cópias iguais", () => {
    const original = casesFor(createGame())[0].documents[0];
    const altered = {
      ...original,
      paragraphs: ["Outra versão do mesmo protocolo."],
    };
    const documents = collectDocuments([original], [original, altered]);
    expect(documents).toHaveLength(2);
    expect(documents.map((d) => d.id)).toEqual([original.id, original.id]);
  });
});
