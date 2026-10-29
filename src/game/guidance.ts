import type { Case, Clue, Game } from "./types";
import { cluesFor, documentAccess, sourceFor } from "./evidence";
export const tutorialActive = (g: Game) =>
  g.mode === "campaign" && g.day === 1 && g.tutorial === "active";
export function tutorialStep(g: Game, c: Case) {
  if (!tutorialActive(g) || c.id !== "story-1") return null;
  if (g.phase === "night")
    return {
      number: 6,
      action: "advance",
      title: "Avance para a manhã seguinte",
      text: "Seu primeiro relatório foi registrado. Clique em Avançar para a manhã para começar o segundo dia. Suas decisões podem aparecer na correspondência.",
      label: "Avançar para a manhã",
    };
  if (g.decisions.some((d) => d.caseId === c.id))
    return {
      number: 5,
      action: "finish",
      title: "Encerre seu primeiro expediente",
      text: "Relatório enviado! Você concluiu o processo prioritário. Agora feche o expediente. O processo complementar pode ficar para outra partida.",
      label: "Fechar primeiro expediente",
    };
  if (!g.board.includes("story-1-claim"))
    return {
      number: 1,
      action: "document",
      document: c.documents.find((d) => d.id === "story-1-report"),
      title: "Leia a acusação e fixe uma prova",
      text: "Vamos juntos no primeiro dia. Abra o relato de Karpov. Role até Trechos para confronto e clique em Fixar trecho. Não é preciso selecionar palavras com o mouse.",
      label: "Começar pela pasta",
    };
  if (!g.board.includes("story-1-proof"))
    return {
      number: 2,
      action: "document",
      document: c.documents.find((d) => d.id === "story-1-record"),
      title: "Confira uma fonte independente",
      text: "A primeira prova está no quadro. Agora leia o livro de ponto de Tula, no Arquivo central, e fixe o trecho sobre a presença de Mirov. Você terá duas fontes diferentes.",
      label: "Consultar o livro de ponto de Tula",
    };
  if (
    !g.links.some(
      (l) =>
        [l.a, l.b].includes("story-1-claim") &&
        [l.a, l.b].includes("story-1-proof") &&
        l.relation === "conflict",
    )
  )
    return {
      number: 3,
      action: "board",
      title: "Compare as duas provas no quadro",
      text: "Karpov coloca Mirov em Moscou; o ponto o coloca em Tula naquela noite. No quadro, selecione os dois cartões e clique em São contraditórios. Use Selecionar fontes do tutorial se precisar.",
      label: "Abrir quadro do tutorial",
    };
  return {
    number: 4,
    action: "report",
    title: "Escreva seu primeiro relatório",
    text: "A comparação foi registrada. Neste caso, escolha A acusação não se sustenta, mantenha as duas provas marcadas e recomende Liberar o investigado. Depois clique em Assinar e enviar relatório.",
    label: "Preparar meu primeiro relatório",
  };
}
export function boardEntries(g: Game, c: Case) {
  return cluesFor(g, [c])
    .filter((clue) => g.board.includes(clue.id))
    .map((clue) => {
      const document = sourceFor(c, g, clue.id)!;
      return {
        clue,
        document,
        free: g.excerpts.some((e) => e.id === clue.id),
        denied: documentAccess(g, document),
      };
    });
}
export function clueTopic(c: Case, clue: Clue) {
  if (clue.key === `${c.id}-alegacao`) return "Acusação e verificação";
  if (clue.key === `${c.id}-cadeia`) return "Origem e circulação do anexo";
  if (clue.key === `${c.id}-contexto`) return "Contexto e motivação";
  if (clue.key.includes("-autoria-")) return "Ato individual";
  if (clue.key.endsWith("-testemunha")) return "Relato da testemunha";
  if (clue.key.endsWith("-procedencia")) return "Procedência da fonte";
  if (clue.key.endsWith("-encaminhamento")) return "Parecer de revisão";
  return "Detalhe do documento";
}
export function suggestedPair(g: Game, c: Case) {
  const clues = cluesFor(g, [c]),
    available = (id: string) => {
      const doc = sourceFor(c, g, id);
      return !!doc && !documentAccess(g, doc);
    };
  const requirements = c.documents.flatMap((d) =>
    d.unlock ? [d.unlock, ...(d.unlockAlternatives ?? [])] : [],
  );
  const missing = requirements.filter(
    (r) =>
      available(r.a) &&
      available(r.b) &&
      !g.links.some(
        (l) =>
          ((l.a === r.a && l.b === r.b) || (l.b === r.a && l.a === r.b)) &&
          l.relation === r.relation,
      ),
  );
  const next =
    missing.find((r) => g.board.includes(r.a) && g.board.includes(r.b)) ??
    missing[0];
  if (next) return next;
  const a = clues.find((e) => e.id === `${c.id}-claim`),
    b = clues.find((e) => e.id === `${c.id}-proof`);
  return a && b
    ? {
        a: a.id,
        b: b.id,
        relation:
          a.value === b.value ? ("support" as const) : ("conflict" as const),
      }
    : null;
}
export function pairGuidance(g: Game, c: Case, pair: string[]) {
  const entries = boardEntries(g, c),
    selected = pair
      .map((id) => entries.find((e) => e.clue.id === id))
      .filter((e) => !!e);
  if (!selected.length)
    return {
      ready: false,
      text: "Clique em um cartão para escolher a fonte A e em outro para escolher a fonte B. Você precisa selecionar dois trechos.",
    };
  if (selected.length < 2)
    return {
      ready: false,
      text: "Fonte A escolhida. Agora selecione outro cartão para a fonte B. Prefira um documento independente sobre o mesmo fato.",
    };
  if (selected.some((e) => e.denied))
    return {
      ready: false,
      text: "Uma fonte está temporariamente indisponível. Consulte o motivo no cartão ou escolha outra fonte.",
    };
  if (selected.some((e) => e.free))
    return {
      ready: false,
      text: "Você selecionou texto livre. Use Comparar detalhes abaixo para confrontar datas, horários ou referências. Esse registro não libera anexos automaticamente.",
    };
  if (selected[0].clue.key !== selected[1].clue.key)
    return {
      ready: false,
      text: `Os trechos tratam de assuntos diferentes: ${clueTopic(c, selected[0].clue).toLowerCase()} e ${clueTopic(c, selected[1].clue).toLowerCase()}. Eles podem ser citados no relatório, mas esta dupla não fundamenta uma ligação guiada. Peça uma dica para encontrar dois trechos sobre o mesmo fato.`,
    };
  return {
    ready: true,
    text: "Duas fontes sobre o mesmo fato selecionadas. São contraditórios quando uma versão impede a outra; se corroboram quando concordam sobre esse fato. A redação pode ser diferente.",
  };
}
export function nextStep(g: Game, c: Case) {
  const entries = boardEntries(g, c).filter((e) => !e.denied),
    sourceIds = new Set(entries.map((e) => e.document.id));
  const minimum = c.minimumSources ?? 2,
    report = c.documents.find((d) => d.id === `${c.id}-report`)!;
  if (g.decisions.some((d) => d.caseId === c.id))
    return {
      action: "finish" as const,
      text: "Relatório enviado. Encerre o expediente depois de concluir o processo prioritário. A correspondência dos próximos dias traz consequências.",
      label: "Conferir encerramento",
      sources: sourceIds.size,
      minimum,
    };
  if (!g.opened.includes(report.id) || !sourceIds.size)
    return {
      action: "document" as const,
      document: report,
      text: "Comece pela pasta: leia a acusação e clique em Fixar trecho no fim do documento. Isso leva uma prova ao quadro.",
      label: "Abrir acusação inicial",
      sources: sourceIds.size,
      minimum,
    };
  const independent = c.documents.find((d) => d.id === `${c.id}-record`)!;
  if (!g.opened.includes(independent.id) || !sourceIds.has(independent.id))
    return {
      action: "document" as const,
      document: independent,
      text: "Confira uma fonte independente. Leia o registro de verificação e fixe seu trecho; dois trechos do mesmo papel continuam sendo uma única fonte.",
      label: "Abrir registro independente",
      sources: sourceIds.size,
      minimum,
    };
  if (sourceIds.size < minimum) {
    const document = c.documents.find(
      (d) => d.clues.length && !sourceIds.has(d.id) && !documentAccess(g, d),
    );
    return {
      action: "document" as const,
      document,
      text: `Você reuniu ${sourceIds.size} de ${minimum} fontes exigidas. Leia outro documento e fixe um trecho antes de redigir.`,
      label: "Examinar outra fonte",
      sources: sourceIds.size,
      minimum,
    };
  }
  return {
    action: "report" as const,
    text: "Você já reuniu as fontes mínimas. Pode redigir o relatório; usar o quadro é opcional e ajuda a abrir anexos. A conclusão e a recomendação continuam sendo suas.",
    label: "Redigir relatório",
    sources: sourceIds.size,
    minimum,
  };
}
