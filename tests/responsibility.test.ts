import { describe, it, expect } from "vitest";
import {
  createGame,
  beginShift,
  casesFor,
  applyReport,
  characterEpilogue,
} from "../src/game/engine";
import { validateCase } from "../src/game/case-generator";
import { documentAccess, addExcerpt } from "../src/game/evidence";
import { personInCustody, contactUnavailable } from "../src/game/contacts";
import { deliverConsequences } from "../src/game/consequences";
import { serialize, deserialize } from "../src/game/save-system";
import type { Action, Case, Game } from "../src/game/types";
const at = (day: number): Game => ({ ...beginShift(createGame()), day });
function evidence(g: Game, c = casesFor(g)[0]) {
  return c.documents
    .filter((d) => !documentAccess(g, d))
    .flatMap((d) => d.clues.map((x) => x.id));
}
function report(
  g: Game,
  targetId: string,
  action: Action = "detain",
  ids = evidence(g),
) {
  const c = casesFor(g)[0];
  return applyReport(
    { ...g, board: ids },
    c,
    c.truth,
    action,
    ids,
    "Análise nominal.",
    targetId,
  );
}
function prior(g: Game, day: number, subject: string, action: Action) {
  g.decisions.push({
    day,
    caseId: `story-${day}`,
    subject,
    action,
    conclusion: "coverup",
    evidence: [],
    correct: true,
    response: "",
    note: "",
  });
  return g;
}
describe("autoria individual em quatro processos", () => {
  it("há três pessoas, fontes próprias e responsáveis distintos sem alterar a verdade da acusação inicial", () => {
    for (const day of [2, 5, 15, 24]) {
      const g = at(day),
        c = casesFor(g)[0];
      expect(c.suspects).toHaveLength(3);
      expect(c.suspects!.filter((s) => s.truth === "responsible")).toHaveLength(
        1,
      );
      expect(new Set(c.suspects!.map((s) => s.documentId)).size).toBe(3);
      expect(c.suspects!.find((s) => s.id === "primary")!.name).toBe(c.subject);
      expect(validateCase(c)).toEqual([]);
      const responsible = c.suspects!.find((s) => s.truth === "responsible")!;
      expect(report(g, responsible.id).decisions[0].correct).toBe(true);
    }
    for (const day of [1, 3, 4, 6, 8, 16, 30])
      expect(casesFor(at(day))[0].suspects).toBeUndefined();
  });
  it("encaminha o diretor à custódia sem prender o operador em cujo nome o processo começou", () => {
    const g = report(at(2), "baranov"),
      d = g.decisions[0];
    expect(d).toMatchObject({
      subject: "Leonid Baranov",
      caseSubject: "Boris Zaitsev",
      targetId: "baranov",
      targetSupported: true,
      correct: true,
    });
    expect(personInCustody(g, "Leonid Baranov")).toBe(true);
    expect(personInCustody(g, "Boris Zaitsev")).toBe(false);
    expect(d.response).toContain(
      "Leonid Baranov recebeu uma ordem de custódia",
    );
  });
  it("acertar o encobrimento não torna correta a detenção de uma pessoa sem responsabilidade", () => {
    const correct = report(at(2), "baranov"),
      wrong = report(at(2), "svetlana");
    expect(wrong.decisions[0].conclusion).toBe("coverup");
    expect(wrong.decisions[0].targetSupported).toBe(false);
    expect(wrong.decisions[0].correct).toBe(false);
    expect(wrong.stats.integrity).toBeLessThan(correct.stats.integrity);
    expect(wrong.stats.prestige).toBeLessThan(correct.stats.prestige);
    expect(personInCustody(wrong, "Svetlana Danilina")).toBe(true);
    expect(
      wrong.events.find((e) => e.id === "story-2:nominal")!.text,
    ).toContain("não sustentam essa responsabilidade individual");
  });
  it("exige citar o ato individual, mesmo quando há várias fontes genéricas no quadro", () => {
    const g = at(5),
      c = casesFor(g)[0];
    const ids = evidence(g).filter((id) => !id.includes("-person-serebrov-"));
    expect(
      report(g, "serebrov", "detain", ids).decisions[0].targetSupported,
    ).toBe(false);
    const supported = report(g, "serebrov");
    expect(supported.decisions[0].correct).toBe(true);
    expect(supported.relations.serebrov.memories.at(-1)).toContain(
      "Pavel Serebrov",
    );
    expect(c.truth).toBe("coverup");
  });
  it("aceita a declaração completa como seleção livre, sem tratar apenas o nome como prova", () => {
    let g = at(2);
    const c = casesFor(g)[0],
      person = c.suspects!.find((s) => s.id === "baranov")!,
      doc = c.documents.find((d) => d.id === person.documentId)!;
    g.opened = [doc.id];
    g = addExcerpt(g, c, doc.id, person.name);
    const nameOnly = g.excerpts[0].id;
    expect(
      report(g, "baranov", "detain", [
        "story-2-claim",
        "story-2-proof",
        nameOnly,
      ]).decisions[0].targetSupported,
    ).toBe(false);
    g = addExcerpt(g, c, doc.id, doc.clues[0].text);
    const full = g.excerpts[1].id;
    expect(
      report(g, "baranov", "detain", ["story-2-proof", full]).decisions[0]
        .targetSupported,
    ).toBe(true);
  });
  it("a prova nominal não corrige uma conclusão errada automaticamente", () => {
    const g = at(2),
      c = casesFor(g)[0],
      ids = evidence(g);
    const result = applyReport(
      { ...g, board: ids },
      c,
      "responsible",
      "detain",
      ids,
      "",
      "baranov",
    );
    expect(result.decisions[0]).toMatchObject({
      conclusion: "responsible",
      targetSupported: true,
      correct: false,
    });
  });
  it("uma medida documental não imputa culpa nem altera o nome do processo", () => {
    const g = report(at(5), "serebrov", "preserve");
    expect(g.decisions[0]).toMatchObject({
      subject: "Tamara Volkova",
      action: "preserve",
      correct: true,
    });
    expect(g.decisions[0].targetId).toBeUndefined();
    expect(personInCustody(g, "Pavel Serebrov")).toBe(false);
    expect(g.flags.preserved).toBe(1);
  });
  it("libera a pessoa escolhida, mantendo a conclusão sobre a acusação original", () => {
    const g = prior(at(5), 1, "Boris Safonov", "detain");
    const next = report(g, "safonov", "release");
    expect(next.decisions.at(-1)!).toMatchObject({
      subject: "Boris Safonov",
      caseSubject: "Tamara Volkova",
      correct: true,
    });
    expect(personInCustody(next, "Boris Safonov")).toBe(false);
  });
  it("não aceita pessoa externa nem um perfil falsificado no objeto recebido", () => {
    const g = at(2),
      c = casesFor(g)[0],
      ids = evidence(g);
    expect(() =>
      applyReport(
        { ...g, board: ids },
        {
          ...c,
          suspects: [
            ...c.suspects!,
            { ...c.suspects![0], id: "intruso", name: "Pessoa inventada" },
          ],
        },
        c.truth,
        "detain",
        ids,
        "",
        "intruso",
      ),
    ).toThrow("pessoa deste processo");
    expect(g.decisions).toHaveLength(0);
    const sent = report(g, "baranov");
    expect(() => report(sent, "svetlana")).toThrow("Relatório indisponível");
  });
  it("o retorno chega uma vez e conserva a ficha de custódia no nome escolhido", () => {
    const g = report(at(2), "baranov"),
      before = g.stats;
    expect(deliverConsequences({ ...g, day: 3 }).appliedEvents).not.toContain(
      "story-2:nominal",
    );
    const returned = deliverConsequences({ ...g, day: 4 });
    expect(returned.stats.prestige).toBe(before.prestige + 2);
    expect(returned.stats.exposure).toBe(before.exposure + 1);
    expect(
      returned.events.find((e) => e.id === "story-2:nominal")!.document!
        .paragraphs[1],
    ).toContain("ficha de custódia pertence a Leonid Baranov");
    expect(deliverConsequences(deserialize(serialize(returned)))).toEqual(
      returned,
    );
  });
});
describe("ramificações e memória das pessoas escolhidas", () => {
  it("na rota do mensageiro, pode responsabilizar Karpov sem prender Petr", () => {
    const g = prior(at(15), 9, "Petr Gusev", "expose"),
      c = casesFor(g)[0];
    expect(c.subject).toBe("Petr Gusev");
    expect(c.suspects!.find((s) => s.id === "primary")!.truth).toBe("innocent");
    const next = report(g, "karpov");
    expect(next.decisions.at(-1)!).toMatchObject({
      subject: "Oleg Karpov",
      caseSubject: "Petr Gusev",
      correct: true,
    });
    expect(contactUnavailable({ ...next, day: 16 }, "karpov")).toBe(true);
    expect(personInCustody(next, "Petr Gusev")).toBe(false);
    expect(characterEpilogue(next, "karpov")).toContain(
      "recebeu uma ficha de custódia em seu próprio nome",
    );
  });
  it("a nova ordem do dia 29 não pode ser assinada pelo major já detido", () => {
    const held = report(at(15), "primary");
    const c = casesFor({ ...held, day: 29 })[0];
    expect(c.subject).toBe("Anatoli Chernov");
    expect(c.title).toBe("A assinatura do substituto");
    expect(
      c.documents.find((d) => d.id === "story-29-record")!.paragraphs.join(" "),
    ).toContain("assinada por Anatoli Chernov");
    expect(validateCase(c)).toEqual([]);
  });
  it("se o primeiro substituto também foi detido, a continuidade tem outro signatário", () => {
    let g = report(at(15), "primary");
    g = report({ ...g, day: 24 }, "chernov");
    expect(casesFor({ ...g, day: 29 })[0].subject).toBe("Alexandr Malinin");
    g.responses.push({
      eventId: "meeting:story-22",
      choiceId: "bargain",
      day: 22,
      text: "",
    });
    expect(casesFor({ ...g, day: 29 })[0].subject).toBe("Viktor Volkov");
  });
  it("na rota da casa vazia, liberar o chefe do turno não liberta Yuri", () => {
    const g = at(24);
    g.responses.push({
      eventId: "meeting:story-18",
      choiceId: "address",
      day: 18,
      text: "",
    });
    const c = casesFor(g)[0];
    expect(c.subject).toBe("Yuri Petrov");
    expect(validateCase(c)).toEqual([]);
    expect(
      characterEpilogue(report(g, "chernov", "release"), "yuri"),
    ).toContain("Yuri permaneceu na custódia");
    expect(
      characterEpilogue(report(g, "primary", "release"), "yuri"),
    ).not.toContain("Yuri permaneceu na custódia");
    expect(report(g, "chernov", "expose").decisions[0].correct).toBe(true);
  });
  it("migra saves 0.5 sem adicionar pessoas ou alterar relatórios antigos", () => {
    for (const day of [2, 5, 15, 24]) {
      const raw = JSON.parse(serialize(at(day)));
      delete raw.game.investigationVersion;
      const loaded = deserialize(JSON.stringify(raw));
      expect(loaded.investigationVersion).toBe(0);
      expect(casesFor(loaded)[0].suspects).toBeUndefined();
    }
    const nominal = report(at(5), "serebrov");
    expect(deserialize(serialize(nominal))).toEqual(nominal);
    for (const value of [-1, 2, null, "1"]) {
      const raw = JSON.parse(serialize(at(2)));
      raw.game.investigationVersion = value;
      expect(() => deserialize(JSON.stringify(raw))).toThrow(
        "Versão de investigação incompatível",
      );
    }
    for (const field of ["caseSubject", "targetId", "targetSupported"]) {
      const raw = JSON.parse(serialize(nominal));
      raw.game.decisions[0][field] = null;
      expect(() => deserialize(JSON.stringify(raw))).toThrow(
        "Decisões inválidas",
      );
    }
  });
});
