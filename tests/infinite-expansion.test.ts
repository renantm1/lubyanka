import { createHash } from "node:crypto";
import { describe, it, expect } from "vitest";
import { generateCase, validateCase } from "../src/game/case-generator";
import {
  beginShift,
  createGame,
  casesFor,
  applyReport,
  endDay,
  nextDay,
} from "../src/game/engine";
import {
  updateInstitution,
  respondToNotice,
  noticeOptions,
  noticeDeadline,
  noticeKind,
} from "../src/game/institution";
import { linkClues } from "../src/game/engine";
import { documentAccess } from "../src/game/evidence";
import { contactsPaused } from "../src/game/contacts";
import { serialize, deserialize, validDocument } from "../src/game/save-system";
import type { Game } from "../src/game/types";

function infinite(day = 2): Game {
  return { ...beginShift(createGame("TULA", "infinite")), day };
}
function lowTrust() {
  const g = infinite();
  g.stats.trust = 20;
  return g;
}
function solve(g: Game) {
  const c = casesFor(g)[0],
    ids = c.documents
      .filter((d) => !documentAccess(g, d))
      .flatMap((d) => d.clues.map((x) => x.id));
  return applyReport({ ...g, board: ids }, c, c.truth, "watch", ids, "");
}
// Gerados pelo código publicado em bcc954b (0.4), executado separadamente.
const legacyFixtures = [
  [
    "TULA",
    1,
    "67ea408f9fb11ce5464537da262d7f6b11da44481c6ec9a7ad2f6e7dd7ad1321",
  ],
  [
    "TULA",
    9,
    "d9c797c47e31051590c948a7d9d998810d012103ad196b9742668fca281137b7",
  ],
  [
    "MOSCOU-1983",
    17,
    "b6e2da8a2135071aa56733e32859272bf9f003b345add2ed9e6121e78b570542",
  ],
  [
    "MOSCOU-1983",
    25,
    "98da99d52ba483d55378697ee5c8f89fef3c393e602e40691ea9cfc7dbb41f8a",
  ],
  [
    "infinito",
    60,
    "470227112a3c0f754e63b794d72d02a31202b2f9e9caf548bebef5f587c5ef28",
  ],
] as const;

describe("catálogo ampliado e compatibilidade", () => {
  it("valida 1.536 processos novos, com 48 situações e fontes suficientes em todos os estágios", () => {
    const seen = new Set<string>(),
      proofs = new Set<string>();
    for (let seed = 0; seed < 16; seed++)
      for (let day = 1; day <= 96; day++) {
        const c = generateCase(`expansao-${seed}`, day, 2);
        expect(validateCase(c)).toEqual([]);
        seen.add(`${c.archetype}:${c.variant}`);
        proofs.add(
          c.documents.find((d) => d.id === `${c.id}-record`)!.clues[0].text,
        );
        const [first, last] = c.subject.split(" ");
        expect(last.endsWith("a")).toBe(
          ["Sofia", "Lidia", "Nina", "Tatiana"].includes(first),
        );
      }
    expect(seen.size).toBe(48);
    expect(proofs.size).toBe(48);
  });
  it("percorre seis variantes de cada arquétipo por rodada e evita repetição na transição", () => {
    for (const seed of ["TULA", "NEVA", "ZARYA"]) {
      const previous = new Map<string, number>();
      for (let block = 0; block < 3; block++) {
        const seen = new Map<string, Set<number>>();
        for (let offset = 1; offset <= 48; offset++) {
          const c = generateCase(seed, block * 48 + offset, 2);
          expect(c.variant).not.toBe(previous.get(c.archetype!));
          previous.set(c.archetype!, c.variant!);
          const variants = seen.get(c.archetype!) ?? new Set();
          variants.add(c.variant!);
          seen.set(c.archetype!, variants);
        }
        expect(seen.size).toBe(8);
        for (const variants of seen.values()) expect(variants.size).toBe(6);
      }
    }
  });
  it("reproduz a mesma seed e varia a ordem entre partidas", () => {
    const route = (seed: string) =>
      Array.from({ length: 96 }, (_, i) => generateCase(seed, i + 1, 2));
    expect(route("TULA")).toEqual(route("TULA"));
    expect(route("TULA")).not.toEqual(route("NEVA"));
  });
  it("preserva byte a byte os casos publicados, inclusive após migrar um save sem a versão das regras", () => {
    for (const [seed, day, digest] of legacyFixtures) {
      const legacy = generateCase(seed, day, 1);
      expect(
        createHash("sha256").update(JSON.stringify(legacy)).digest("hex"),
      ).toBe(digest);
      const raw = JSON.parse(
        serialize({
          ...createGame(seed, day > 30 ? "infinite" : "campaign"),
          day,
          chapterIntro: null,
        }),
      );
      delete raw.game.rulesVersion;
      const migrated = deserialize(JSON.stringify(raw));
      expect(migrated.rulesVersion).toBe(1);
      expect(casesFor(migrated)[day > 30 ? 0 : 1]).toEqual(legacy);
    }
  });
  it("salva a edição das novas partidas e recusa versões desconhecidas", () => {
    const g = infinite();
    expect(deserialize(serialize(g)).rulesVersion).toBe(2);
    for (const invalid of [null, 0, 3, "2"]) {
      const raw = JSON.parse(serialize(g));
      raw.game.rulesVersion = invalid;
      expect(() => deserialize(JSON.stringify(raw))).toThrow(
        "Regras de partida incompatíveis",
      );
    }
  });
  it("mantém 120 dias solucionáveis, com quatro fontes no estágio final e pressão renovada", () => {
    let g = infinite(1);
    for (let day = 1; day <= 120; day++) {
      const c = casesFor(g)[0];
      expect(validateCase(c)).toEqual([]);
      if (day >= 25) expect(c.minimumSources).toBe(4);
      g = nextDay(endDay(solve(g)));
      if (day % 12 === 0) g = deserialize(serialize(g));
    }
    expect(g.day).toBe(121);
    expect(g.decisions).toHaveLength(120);
    expect(g.ending).toBeNull();
    expect(
      g.events.filter(
        (e) => noticeKind(e.id ?? "") === "institution-surveillance",
      ).length,
    ).toBeGreaterThan(1);
  });
});
describe("rodadas institucionais no Arquivo Infinito", () => {
  it("a credencial permite consultar perícias avançadas sem dispensar a cadeia documental nem a confiança", () => {
    let g = infinite(17);
    const c = casesFor(g)[0],
      audit = c.documents.find((d) => d.id === `${c.id}-audit`)!;
    expect(audit.access).toEqual({ prestige: 65, trust: 35 });
    expect(documentAccess(g, audit)).toContain("Requisição pendente");
    g.board = [`${c.id}-claim`, `${c.id}-proof`];
    g = linkClues(
      g,
      g.board[0],
      g.board[1],
      c.truth === "responsible" ? "support" : "conflict",
    );
    expect(documentAccess(g, audit)).toContain("prestígio");
    g.stats.prestige = 70;
    g = updateInstitution(g);
    g.stats.prestige = 35;
    expect(documentAccess(g, audit)).toBeNull();
    expect(documentAccess({ ...g, day: 23 }, audit)).toContain("prestígio");
    expect(
      documentAccess({ ...g, stats: { ...g.stats, trust: 20 } }, audit),
    ).toContain("chefia");
  });
  it("renova após doze expedientes se a condição persistir, sem repetir na mesma manhã", () => {
    let g = updateInstitution(lowTrust());
    g = respondToNotice(g, "institution-audit", "supervision");
    expect(updateInstitution({ ...g, day: 13 }).events).toHaveLength(1);
    g = updateInstitution({ ...g, day: 14 });
    expect(g.events.map((e) => e.id)).toEqual([
      "institution-audit",
      "institution-audit:day-14",
    ]);
    expect(g.pressure.auditUntil).toBe(17);
    expect(g.events[1].document!.title).toContain("rodada 2");
    expect(updateInstitution(deserialize(serialize(g)))).toEqual(g);
    expect(g.events.every((e) => validDocument(e.document))).toBe(true);
  });
  it("preserva a política de uma ocorrência na campanha e nos saves anteriores", () => {
    for (const [mode, rulesVersion] of [
      ["campaign", 2],
      ["infinite", 1],
    ] as const) {
      let g = { ...lowTrust(), mode, rulesVersion };
      g = updateInstitution(g);
      g = respondToNotice(g, "institution-audit", "supervision");
      expect(updateInstitution({ ...g, day: 26 }).events).toHaveLength(1);
    }
  });
  it("não reabre quando o indicador se recupera nem sobrepõe uma janela ainda ativa", () => {
    const g = updateInstitution(lowTrust());
    expect(
      updateInstitution({ ...g, day: 14, stats: { ...g.stats, trust: 50 } })
        .events,
    ).toHaveLength(1);
    expect(
      updateInstitution({
        ...g,
        day: 14,
        pressure: { ...g.pressure, auditUntil: 18 },
      }).events,
    ).toHaveLength(1);
  });
  it("não permite responder a uma ordem antiga usando o prazo da nova rodada", () => {
    let g = updateInstitution(lowTrust());
    g = updateInstitution({ ...g, day: 14 });
    expect(noticeDeadline(g, "institution-audit")).toBe(5);
    expect(noticeDeadline(g, "institution-audit:day-14")).toBe(17);
    expect(() =>
      respondToNotice(g, "institution-audit", "supervision"),
    ).toThrow("prazo");
    g.flags.preserved = 2;
    const answered = respondToNotice(
      g,
      "institution-audit:day-14",
      "documents",
    );
    expect(answered.pressure.auditUntil).toBe(0);
    expect(answered.responses[0].eventId).toBe("institution-audit:day-14");
    expect(() =>
      respondToNotice(answered, "institution-audit:day-14", "documents"),
    ).toThrow("já registrada");
  });
  it("aplica a exposição uma vez por rodada e reconhece a pausa dos contatos na ordem renovada", () => {
    let g = infinite();
    g.stats.paranoia = 70;
    g = updateInstitution(g);
    expect(g.stats.exposure).toBe(14);
    g = updateInstitution({ ...g, day: 14 });
    expect(g.stats.exposure).toBe(18);
    expect(updateInstitution(deserialize(serialize(g))).stats.exposure).toBe(
      18,
    );
    g = respondToNotice(g, "institution-surveillance:day-14", "pause");
    expect(contactsPaused(g)).toBe(true);
    expect(casesFor(g)[0].actions).not.toContain("recruit");
    expect(contactsPaused({ ...g, day: 15 })).toBe(true);
    expect(contactsPaused({ ...g, day: 16 })).toBe(false);
  });
  it("renova a credencial com resposta própria e permite estender apenas a nova janela", () => {
    let g = infinite();
    g.stats.prestige = 70;
    g = updateInstitution(g);
    g = respondToNotice(g, "institution-clearance", "share");
    expect(g.pressure.clearanceUntil).toBe(10);
    g = updateInstitution({ ...g, day: 14 });
    expect(g.pressure.clearanceUntil).toBe(19);
    expect(() => respondToNotice(g, "institution-clearance", "share")).toThrow(
      "já registrada",
    );
    g = respondToNotice(g, "institution-clearance:day-14", "share");
    expect(g.pressure.clearanceUntil).toBe(22);
    expect(g.responses).toHaveLength(2);
    expect(deserialize(serialize(g))).toEqual(g);
  });
  it("mantém requisitos da rede e alterna três comunicados com prazos próprios", () => {
    let g = infinite();
    g.stats.paranoia = 70;
    for (const day of [2, 14, 26]) g = updateInstitution({ ...g, day });
    expect(new Set(g.events.map((e) => e.text)).size).toBe(3);
    expect(noticeOptions("institution-surveillance:day-26")).toHaveLength(3);
    expect(() =>
      respondToNotice(g, "institution-surveillance:day-26", "reroute"),
    ).toThrow("três contatos");
    expect(noticeOptions("institution-surveillance:day-0")).toEqual([]);
    expect(noticeOptions("story-1:late")).toEqual([]);
    expect(noticeKind("institution-audit:day-14-extra")).toBeNull();
    expect(noticeDeadline(g, "institution-audit:day-14")).toBeNull();
  });
});
