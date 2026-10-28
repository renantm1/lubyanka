import { describe, it, expect } from "vitest";
import {
  archetypes,
  generateCase,
  validateCase,
} from "../src/game/case-generator";
import {
  applyReport,
  casesFor,
  createGame,
  endDay,
  linkClues,
  nextDay,
} from "../src/game/engine";
import { dateFor, storyCase } from "../src/game/document-generator";
import {
  deserialize,
  readSave,
  serialize,
  writeSave,
} from "../src/game/save-system";
import { historicalNews, newsFor } from "../src/game/world";
import type { Action, Ending, Game } from "../src/game/types";
function resolve(g: Game, action: Action) {
  const c = casesFor(g)[0],
    evidence = c.documents.flatMap((d) => d.clues).map((e) => e.id);
  return applyReport(
    { ...g, board: evidence },
    c,
    c.truth,
    action,
    evidence,
    "Análise de teste baseada nas fontes.",
  );
}
const routes: Record<Ending, (day: number) => Action> = {
  hero: () => "detain",
  shadow: (d) => (d < 3 ? "watch" : "recruit"),
  conscience: (d) =>
    d <= 8 ? "release" : d <= 10 ? "expose" : d <= 12 ? "preserve" : "watch",
  reformer: (d) =>
    d >= 5 && d <= 10 ? "preserve" : d >= 11 && d <= 14 ? "expose" : "watch",
  escape: (d) =>
    d >= 5 && d <= 8
      ? "preserve"
      : d >= 9 && d <= 13
        ? "recruit"
        : d === 26
          ? "escape"
          : "watch",
  traitor: (d) => (d < 16 ? "watch" : "confront"),
};
describe("casos e cronologia", () => {
  it("a mesma seed e o mesmo dia reproduzem todos os documentos", () =>
    expect(generateCase("TULA", 9)).toEqual(generateCase("TULA", 9)));
  it("valida 1.920 casos e cobre as 24 variantes reais dos oito arquétipos", () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 64; seed++)
      for (let day = 1; day <= 30; day++) {
        const c = generateCase(`seed-${seed}`, day);
        expect(validateCase(c)).toEqual([]);
        seen.add(`${c.archetype}:${c.variant}`);
      }
    expect(seen.size).toBe(
      archetypes.reduce((n, a) => n + a.variants.length, 0),
    );
  });
  it("todos os 30 dias escritos têm prova e fonte independente", () => {
    for (let day = 1; day <= 30; day++)
      expect(validateCase(storyCase(day))).toEqual([]);
  });
  it("detecta documento futuro e prova insuficiente", () => {
    const c = storyCase(1);
    c.documents[0].date = "1983-12-01";
    c.documents = c.documents.filter((d) => !d.archive);
    expect(validateCase(c)).toContain("Documento menciona data futura");
    expect(validateCase(c)).toContain(
      "Fontes insuficientes para testar a alegação",
    );
  });
  it("não publica acontecimentos históricos futuros", () => {
    for (let day = 1; day <= 30; day++) {
      const n = newsFor({ ...createGame(), day }).historical;
      expect(n.date <= dateFor(day)).toBe(true);
    }
    expect(historicalNews.some((n) => n.date === "1983-11-02")).toBe(true);
  });
});
describe("investigação e consequências", () => {
  it("não encerra o dia sem relatório e não avança antes do encerramento", () => {
    expect(() => endDay(createGame())).toThrow();
    expect(() => nextDay(createGame())).toThrow();
  });
  it("abrir todos os documentos não resolve o caso", () => {
    const g = createGame();
    g.opened = casesFor(g).flatMap((c) => c.documents.map((d) => d.id));
    expect(() => endDay(g)).toThrow();
  });
  it("exige duas evidências distintas e fixadas do processo correto", () => {
    const g = createGame(),
      c = storyCase(1),
      ids = c.documents.flatMap((d) => d.clues).map((e) => e.id);
    expect(() => applyReport(g, c, "innocent", "release", ids, "")).toThrow();
    expect(() =>
      applyReport(
        { ...g, board: ids },
        c,
        "innocent",
        "release",
        [ids[0], ids[0]],
        "",
      ),
    ).toThrow();
  });
  it("registra e testa a contradição entre Karpov e o livro de ponto", () => {
    const g = createGame(),
      c = storyCase(1);
    g.board = c.documents.flatMap((d) => d.clues).map((e) => e.id);
    const a = g.board[0],
      b = g.board[2];
    expect(linkClues(g, a, b, "conflict").links).toHaveLength(1);
    expect(() => linkClues(g, a, b, "support")).toThrow();
  });
  it("não aceita decisões indisponíveis nem envio duplicado", () => {
    const g = createGame(),
      c = storyCase(1);
    g.board = c.documents.flatMap((d) => d.clues).map((e) => e.id);
    expect(() =>
      applyReport(g, c, "innocent", "escape", g.board, ""),
    ).toThrow();
    const n = resolve(g, "release");
    expect(() => resolve(n, "release")).toThrow();
  });
  it("guarda memória, notícia futura e custo humano de prender um inocente", () => {
    const g = resolve(createGame(), "detain");
    expect(g.stats.integrity).toBeLessThan(50);
    expect(g.relations.irina.memories).toHaveLength(1);
    expect(newsFor(g).fictional).toHaveLength(0);
    const next = nextDay(endDay(g));
    expect(newsFor(next).fictional.join(" ")).toContain("família");
  });
  it("permite resolver o secundário sem dispensar o processo principal", () => {
    let g = createGame();
    const c = casesFor(g)[1];
    g.board = c.documents.flatMap((d) => d.clues).map((e) => e.id);
    g = applyReport(g, c, c.truth, "watch", g.board, "");
    expect(() => endDay(g)).toThrow();
  });
});
describe("campanha e seis finais", () => {
  for (const [ending, policy] of Object.entries(routes))
    it(`alcança ${ending} jogando os 30 dias com ações permitidas`, () => {
      let g = createGame();
      for (let day = 1; day <= 30; day++) {
        expect(g.day).toBe(day);
        g = nextDay(endDay(resolve(g, policy(day))));
      }
      expect(g.phase).toBe("ending");
      expect(g.ending).toBe(ending);
      expect(g.decisions).toHaveLength(30);
    });
  it("mantém o modo infinito após o dia 30", () => {
    let g = createGame("infinito", "infinite");
    for (let day = 1; day <= 35; day++)
      g = nextDay(endDay(resolve(g, "watch")));
    expect(g.day).toBe(36);
    expect(g.ending).toBeNull();
  });
});
describe("persistência", () => {
  it("recupera posição dos papéis, provas, ligações e consequências", () => {
    let g = resolve(createGame(), "release");
    g.positions = { "story-1-report": { x: 20, y: 15 } };
    g = nextDay(endDay(g));
    expect(deserialize(serialize(g))).toEqual(g);
  });
  it("grava e lê pelo contrato real de armazenamento", () => {
    const data = new Map<string, string>(),
      storage = {
        getItem: (k: string) => data.get(k) ?? null,
        setItem: (k: string, v: string) => {
          data.set(k, v);
        },
      };
    expect(readSave(storage)).toBeNull();
    const g = resolve(createGame(), "detain");
    writeSave(storage, g);
    expect(readSave(storage)).toEqual(g);
  });
  it("rejeita save corrompido, versão incompatível e estado impossível", () => {
    expect(() => deserialize("{")).toThrow();
    expect(() =>
      deserialize(
        JSON.stringify({ format: "lubyanka", version: 99, game: createGame() }),
      ),
    ).toThrow();
    expect(() =>
      deserialize(serialize({ ...createGame(), day: 31 })),
    ).toThrow();
    const g = createGame();
    g.stats.trust = NaN;
    expect(() => deserialize(serialize(g))).toThrow();
  });
  it("rejeita documentos e posições que quebrariam a interface", () => {
    const g = createGame();
    g.discovered = [
      { ...storyCase(1).documents[0], paragraphs: null as never },
    ];
    expect(() => deserialize(serialize(g))).toThrow();
    g.discovered = [];
    g.positions = { x: { x: 999999, y: 0 } };
    expect(() => deserialize(serialize(g))).toThrow();
  });
  it("a prisão de Mirov não é atribuída à arquivista no epílogo", async () => {
    const { characterEpilogue } = await import("../src/game/engine");
    expect(
      characterEpilogue(resolve(createGame(), "detain"), "irina"),
    ).not.toContain("detenção");
  });
});
