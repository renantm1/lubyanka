import { describe, it, expect } from "vitest";
import {
  applyReport,
  beginShift,
  casesFor,
  createGame,
  endDay,
  linkClues,
  nextDay,
} from "../src/game/engine";
import { inquiryOptions } from "../src/content/inquiries";
import { inquiryBlocked, requestInquiry } from "../src/game/inquiries";
import { documentAccess } from "../src/game/evidence";
import { deliverConsequences } from "../src/game/consequences";
import { deserialize, serialize } from "../src/game/save-system";
import { validateCase } from "../src/game/case-generator";
import type { Game } from "../src/game/types";
const days = [1, 3, 8, 17, 22, 28];
function at(day = 1): Game {
  return {
    ...beginShift(createGame()),
    day,
    opened: [`story-${day}-report`, `story-${day}-letter`],
  };
}
function solve(g: Game): Game {
  const c = casesFor(g)[0],
    ids = c.documents
      .filter((d) => !documentAccess(g, d))
      .flatMap((d) => d.clues.map((x) => x.id));
  return applyReport({ ...g, board: ids }, c, c.truth, "watch", ids, "");
}
describe("diligências e fontes alternativas", () => {
  it("oferece duas fontes próprias em seis processos e mantém os demais casos intactos", () => {
    const titles = new Set<string>();
    for (let day = 1; day <= 30; day++) {
      const g = at(day),
        cases = casesFor(g);
      expect(inquiryOptions(cases[0])).toHaveLength(days.includes(day) ? 2 : 0);
      expect(inquiryOptions(cases[1])).toEqual([]);
      for (const option of inquiryOptions(cases[0])) {
        const next = requestInquiry(g, cases[0].id, option.route),
          c = casesFor(next)[0];
        titles.add(next.inquiries[0].document.title);
        expect(validateCase(c)).toEqual([]);
        expect(c.truth).toBe(cases[0].truth);
        expect(
          c.documents.some((d) => d.id === next.inquiries[0].document.id),
        ).toBe(true);
      }
    }
    expect(titles.size).toBe(12);
  });
  it("exige a leitura que fundamenta cada canal e recusa pedidos fora do catálogo", () => {
    const g = at();
    g.opened = [];
    expect(() => requestInquiry(g, "story-1", "formal")).toThrow(
      "declaração preliminar",
    );
    expect(() => requestInquiry(g, "story-1", "reserved")).toThrow(
      "depoimento reservado",
    );
    expect(() => requestInquiry(at(2), "story-2", "formal")).toThrow(
      "indisponível",
    );
    expect(() =>
      requestInquiry(at(), "story-1", "inventada" as "formal"),
    ).toThrow("indisponível");
    expect(() => requestInquiry(at(), "story-3", "formal")).toThrow(
      "indisponível",
    );
  });
  it("cobra custos diferentes e não altera o estado anterior", () => {
    const g = at(),
      formal = requestInquiry(g, "story-1", "formal"),
      reserved = requestInquiry(g, "story-1", "reserved");
    expect(formal.stats.exposure).toBe(g.stats.exposure + 3);
    expect(formal.stats.trust).toBe(g.stats.trust + 1);
    expect(formal.relations.irina.trust).toBe(g.relations.irina.trust);
    expect(reserved.stats.exposure).toBe(g.stats.exposure + 1);
    expect(reserved.stats.trust).toBe(g.stats.trust - 2);
    expect(reserved.relations.irina.trust).toBe(g.relations.irina.trust - 2);
    expect(g.inquiries).toEqual([]);
  });
  it("cobra vigilância adicional e mantém indicadores nos limites", () => {
    const g = at();
    g.pressure.surveillanceUntil = 3;
    g.stats.trust = 100;
    expect(requestInquiry(g, "story-1", "formal").stats.exposure).toBe(15);
    g.stats.exposure = 99;
    expect(requestInquiry(g, "story-1", "formal").stats).toMatchObject({
      exposure: 100,
      trust: 100,
    });
  });
  it("bloqueia o canal reservado por confiança, custódia, sindicância ou pausa; preserva a via formal", () => {
    for (const reason of ["trust", "custody", "audit", "pause"]) {
      const g = at(22);
      if (reason === "trust") g.relations.irina.trust = 39;
      if (reason === "custody")
        g.decisions.push({
          caseId: "story-17",
          day: 17,
          subject: "Irina Sokolova",
          conclusion: "coverup",
          action: "detain",
          evidence: [],
          correct: true,
          note: "",
          response: "",
        });
      if (reason === "audit") g.pressure.auditUntil = 24;
      if (reason === "pause")
        g.responses.push({
          eventId: "institution-surveillance",
          choiceId: "pause",
          day: 21,
          text: "",
        });
      const c = casesFor(g)[0];
      expect(inquiryBlocked(g, c, inquiryOptions(c)[1])).toBeTruthy();
      expect(() => requestInquiry(g, c.id, "reserved")).toThrow();
      expect(() => requestInquiry(g, c.id, "formal")).not.toThrow();
    }
  });
  it("não permite repetir ou trocar a via após salvar", () => {
    const g = deserialize(
      serialize(requestInquiry(at(), "story-1", "reserved")),
    );
    for (const route of ["formal", "reserved"] as const)
      expect(() => requestInquiry(g, "story-1", route)).toThrow(
        "via já foi escolhida",
      );
    expect(g.events).toHaveLength(1);
  });
  it("recusa novos pedidos depois da assinatura ou do encerramento", () => {
    expect(() => requestInquiry(solve(at()), "story-1", "formal")).toThrow(
      "relatório já foi enviado",
    );
    expect(() =>
      requestInquiry({ ...at(), phase: "night" }, "story-1", "formal"),
    ).toThrow("encerrado");
    expect(() =>
      requestInquiry({ ...at(), phase: "ending" }, "story-1", "formal"),
    ).toThrow("encerrado");
  });
  it("abre o anexo por corroboração alternativa sem registrar a relação original", () => {
    for (const day of days)
      for (const route of ["formal", "reserved"] as const) {
        let g = requestInquiry(at(day), `story-${day}`, route);
        const doc = g.inquiries[0].document,
          c = casesFor(g)[0],
          annex = c.documents.find((d) => d.id === `${c.id}-annex`)!;
        expect(documentAccess(g, annex)).toContain("diligência recebida");
        const ids = [`${c.id}-proof`, doc.clues[0].id];
        g.board = ids;
        expect(() => linkClues(g, ids[0], ids[1], "conflict")).toThrow(
          "não é sustentada",
        );
        g = linkClues(g, ids[0], ids[1], "support");
        expect(documentAccess(g, annex)).toBeNull();
        expect(g.links).toHaveLength(1);
        expect(g.links[0].a).not.toContain("claim");
        expect(casesFor(g)[0].truth).toBe(c.truth);
      }
  });
  it("a via antiga continua disponível sem contratar uma diligência", () => {
    let g = at();
    g.board = ["story-1-claim", "story-1-proof"];
    g = linkClues(g, ...(g.board as [string, string]), "conflict");
    expect(
      documentAccess(
        g,
        casesFor(g)[0].documents.find((d) => d.id === "story-1-annex")!,
      ),
    ).toBeNull();
    expect(g.inquiries).toEqual([]);
  });
  it("permite citar a nova fonte sem confundir dois trechos do mesmo documento com duas fontes", () => {
    const g = requestInquiry(at(22), "story-22", "formal"),
      c = casesFor(g)[0],
      fact = g.inquiries[0].document.clues[0].id;
    const ids = ["story-22-claim", "story-22-proof", fact];
    const next = applyReport(
      { ...g, board: ids },
      c,
      c.truth,
      "watch",
      ids,
      "",
    );
    expect(next.decisions[0].correct).toBe(true);
    expect(next.decisions[0].evidence).toContain(fact);
    expect(() =>
      applyReport(
        { ...g, board: [fact] },
        c,
        c.truth,
        "watch",
        [fact, fact, fact],
        "",
      ),
    ).toThrow();
  });
  it("o retorno chega em dois dias e aplica seus efeitos uma única vez após recarregar", () => {
    for (const route of ["formal", "reserved"] as const) {
      let g = requestInquiry(at(), "story-1", route);
      const event = g.events[0],
        stat = route === "formal" ? "paranoia" : "integrity";
      const initial = g.stats[stat];
      expect(event.day).toBe(3);
      expect(deliverConsequences(g).stats[stat]).toBe(initial);
      g = nextDay(endDay(solve(g)));
      expect(g.appliedEvents).not.toContain(event.id);
      const beforeReturn = endDay(solve(g));
      g = nextDay(beforeReturn);
      expect(g.stats[stat]).toBe(beforeReturn.stats[stat] + 1);
      expect(g.appliedEvents.filter((id) => id === event.id)).toHaveLength(1);
      expect(
        g.events.find((e) => e.id === event.id)?.document?.paragraphs[0],
      ).toBe(event.text);
      expect(deliverConsequences(deserialize(serialize(g)))).toEqual(g);
    }
  });
  it("a edição de Daria confirma autoria e não é tratada como uma acusação falsa contra Elena", () => {
    const g = at(28);
    g.decisions.push({
      day: 19,
      caseId: "story-19",
      subject: "Elena Morozova",
      conclusion: "responsible",
      action: "detain",
      evidence: [],
      correct: true,
      response: "",
      note: "",
    });
    for (const route of ["formal", "reserved"] as const) {
      const next = requestInquiry(g, "story-28", route),
        c = casesFor(next)[0],
        doc = next.inquiries[0].document;
      expect(c.subject).toBe("Daria Rozanova");
      expect(c.truth).toBe("responsible");
      expect(doc.clues[0]).toMatchObject({
        value: "alegacao",
        text: expect.stringContaining("Daria"),
      });
      expect(validateCase(c)).toEqual([]);
      expect(solve(next).decisions.at(-1)!.correct).toBe(true);
    }
  });
  it("migra saves anteriores sem pedidos retroativos e valida novos registros", () => {
    const legacy = JSON.parse(serialize(at()));
    delete legacy.game.inquiries;
    expect(deserialize(JSON.stringify(legacy)).inquiries).toEqual([]);
    const raw = JSON.parse(
      serialize(requestInquiry(at(), "story-1", "formal")),
    );
    for (const malformed of [
      null,
      [null],
      [{ ...raw.game.inquiries[0], day: 31 }],
      [raw.game.inquiries[0], raw.game.inquiries[0]],
      [
        {
          ...raw.game.inquiries[0],
          document: { ...raw.game.inquiries[0].document, clues: [] },
        },
      ],
    ]) {
      expect(() =>
        deserialize(
          JSON.stringify({
            ...raw,
            game: { ...raw.game, inquiries: malformed },
          }),
        ),
      ).toThrow("Diligências inválidas");
    }
  });
});
