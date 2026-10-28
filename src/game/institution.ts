import type { Game, Stats, WorldEvent } from "./types";
export interface NoticeChoice {
  id: string;
  label: string;
  reply: string;
  effects: Partial<Stats>;
  needs?: { copies?: number; network?: number };
  rel?: { id: string; delta: number };
}
export type NoticeKind =
  | "institution-audit"
  | "institution-surveillance"
  | "institution-clearance";
export function noticeKind(eventId: string): NoticeKind | null {
  const match = eventId.match(
    /^(institution-(?:audit|surveillance|clearance))(?::day-[1-9]\d*)?$/,
  );
  return match ? (match[1] as NoticeKind) : null;
}
export const noticeChoices: Record<string, NoticeChoice[]> = {
  "institution-audit": [
    {
      id: "documents",
      label: "Apresentar as cópias de custódia",
      reply:
        "A sindicância recebe cópias com origem identificada e suspende a supervisão direta. Os originais continuam sob sua guarda.",
      effects: { trust: 8, exposure: -4 },
      needs: { copies: 2 },
    },
    {
      id: "supervision",
      label: "Aceitar a supervisão da chefia",
      reply:
        "O supervisor encerra a sindicância aberta, mas leva uma relação dos seus contatos. O expediente continua com essa concessão registrada.",
      effects: { trust: 3, integrity: -3, paranoia: 2 },
    },
    {
      id: "order",
      label: "Exigir uma ordem assinada",
      reply:
        "A chefia assina a ordem. A consulta a anexos especiais permanece suspensa pelo prazo original; agora o responsável pela restrição tem um nome no papel.",
      effects: { trust: -2, exposure: 2, integrity: 2 },
    },
  ],
  "institution-surveillance": [
    {
      id: "pause",
      label: "Suspender encontros por segurança",
      reply:
        "Os encontros reservados são suspensos por dois expedientes. A vigilância perde o contato imediato; Orlov entende a cautela como uma retirada de apoio.",
      effects: { exposure: -2, trust: 1 },
      rel: { id: "mikhail", delta: -4 },
    },
    {
      id: "reroute",
      label: "Mudar o ponto de encontro pela rede",
      reply:
        "A rede confirma outro ponto de encontro. A vigilância permanece no endereço antigo. A troca também deixa novas pessoas cientes da operação.",
      effects: { exposure: -4, paranoia: 2 },
      needs: { network: 3 },
      rel: { id: "mikhail", delta: 3 },
    },
    {
      id: "challenge",
      label: "Contestar a ordem de vigilância",
      reply:
        "O gabinete confirma que a vigilância é interna. A ordem termina amanhã, mas sua contestação passa a integrar o dossiê do oficial.",
      effects: { exposure: 6, trust: -3, integrity: 1 },
    },
  ],
  "institution-clearance": [
    {
      id: "register",
      label: "Registrar acesso à comissão",
      reply:
        "O credenciamento especial foi registrado. Os pareceres continuam sujeitos à comprovação da cadeia de custódia.",
      effects: { exposure: 1 },
    },
    {
      id: "share",
      label: "Estender a guarda das cópias com Irina",
      reply:
        "Irina recebe uma via do credenciamento e amplia a janela de consulta. A decisão conserva as cópias, mas vincula seu nome ao uso do arquivo.",
      effects: { exposure: 3 },
      rel: { id: "irina", delta: 3 },
    },
  ],
};
export function noticeOptions(eventId: string): NoticeChoice[] {
  const kind = noticeKind(eventId);
  return kind ? noticeChoices[kind] : [];
}
export function noticeDeadline(g: Game, eventId: string): number | null {
  const kind = noticeKind(eventId),
    event = g.events.find((e) => e.id === eventId);
  return kind && event ? event.day + notices[kind].duration - 1 : null;
}
const notices: Record<
  NoticeKind,
  { title: string; character: string; duration: number; texts: string[] }
> = {
  "institution-audit": {
    title: "Ordem de sindicância",
    character: "volkov",
    duration: 4,
    texts: [
      "A chefia abriu uma sindicância de quatro expedientes. Anexos especiais e novos recrutamentos estão suspensos. As fontes essenciais dos processos permanecem disponíveis. Apresente as cópias, aceite supervisão ou exija uma ordem assinada.",
      "A revisão distrital encontrou novas divergências entre suas recomendações e as ordens da chefia. Uma nova sindicância suspende pareceres especiais, recrutamento e omissão por quatro expedientes. A resposta à ordem anterior permanece no arquivo; esta rodada exige uma resposta própria.",
      "O controle regional devolveu o dossiê do oficial com uma nova exigência de supervisão. Por quatro expedientes, pareceres especiais, recrutamento e omissão ficam suspensos. As fontes essenciais permanecem abertas. Cópias de origem identificada podem fundamentar sua resposta.",
    ],
  },
  "institution-surveillance": {
    title: "Comunicado de vigilância interna",
    character: "karpov",
    duration: 4,
    texts: [
      "Foi confirmada vigilância interna sobre os seus contatos por quatro expedientes. Recrutar alguém durante esse prazo aumenta a exposição do encontro. A rede pode ajudar a mudar o ponto de contato.",
      "Uma nova equipe passou a acompanhar a circulação dos seus contatos. O desvio ou a pausa da rodada anterior não protege os encontros atuais. A vigilância dura quatro expedientes; novos recrutamentos durante esse prazo aumentam a exposição.",
      "O gabinete requisitou outra conferência dos endereços usados pela sua rede. A vigilância interna foi reaberta por quatro expedientes. Você pode suspender encontros, negociar outro ponto pela rede ou contestar a nova ordem; cada resposta fica vinculada a esta rodada.",
    ],
  },
  "institution-clearance": {
    title: "Credenciamento da comissão",
    character: "irina",
    duration: 6,
    texts: [
      "A comissão concedeu uma janela de seis expedientes para consultar pareceres especiais. A credencial dispensa o requisito de prestígio, mas não as relações documentadas nem a confiança mínima.",
      "A comissão renovou seu credenciamento por seis expedientes para uma nova remessa de processos distritais. A autorização anterior continua registrada com seu prazo próprio. A nova via dispensa prestígio mínimo, mas exige confiança e uma cadeia documental demonstrável.",
      "A seção regional abriu outra janela de seis expedientes para revisão de processos. Seu credenciamento foi renovado; o uso da via continua nominal. O acesso dispensa prestígio mínimo, sem dispensar confiança nem a fundamentação das requisições.",
    ],
  },
};
export function updateInstitution(g: Game): Game {
  const next = structuredClone(g);
  const eligible = (kind: NoticeKind) => {
    const previous = g.events
      .filter((e) => noticeKind(e.id ?? "") === kind)
      .sort((a, b) => b.day - a.day)[0];
    return (
      !previous ||
      (g.mode === "infinite" &&
        g.rulesVersion === 2 &&
        g.day - previous.day >= 12)
    );
  };
  const add = (kind: NoticeKind) => {
    const previous = g.events.filter((e) => noticeKind(e.id ?? "") === kind),
      data = notices[kind],
      id = previous.length ? `${kind}:day-${g.day}` : kind,
      text = data.texts[previous.length % data.texts.length];
    const event: WorldEvent = {
      id,
      day: g.day,
      text,
      character: data.character,
      document: {
        id: `${id}-memo`,
        kind: "telegram",
        date: new Date(Date.UTC(1983, 10, g.day)).toISOString().slice(0, 10),
        title:
          data.title +
          (previous.length ? ` · rodada ${previous.length + 1}` : ""),
        subtitle: "ORDEM INTERNA · RESPOSTA DO OFICIAL SOLICITADA",
        author: "Gabinete da Diretoria II",
        paragraphs: [
          text,
          `Prazo desta ordem: até o expediente ${g.day + data.duration - 1}, inclusive. Uma ordem posterior não reabre o prazo desta via.`,
        ],
        clues: [],
      },
    };
    next.events.push(event);
    next.appliedEvents.push(id);
  };
  if (
    g.stats.trust < 25 &&
    eligible("institution-audit") &&
    g.pressure.auditUntil < g.day
  ) {
    next.pressure.auditUntil = g.day + 3;
    add("institution-audit");
  }
  if (
    g.stats.paranoia >= 65 &&
    eligible("institution-surveillance") &&
    g.pressure.surveillanceUntil < g.day
  ) {
    next.pressure.surveillanceUntil = g.day + 3;
    next.stats.exposure = Math.min(100, next.stats.exposure + 4);
    add("institution-surveillance");
  }
  if (
    g.stats.prestige >= 65 &&
    g.stats.trust >= 35 &&
    eligible("institution-clearance") &&
    g.pressure.clearanceUntil < g.day
  ) {
    next.pressure.clearanceUntil = g.day + 5;
    add("institution-clearance");
  }
  return next;
}
export function noticeBlocked(
  g: Game,
  eventId: string,
  choice: NoticeChoice,
): string | null {
  if (g.responses.some((r) => r.eventId === eventId))
    return "Resposta já registrada.";
  const e = g.events.find((x) => x.id === eventId && x.day <= g.day);
  if (!e) return "O comunicado ainda não chegou.";
  const kind = noticeKind(eventId);
  if (!kind) return "Este comunicado não solicita uma resposta institucional.";
  const deadline = noticeDeadline(g, eventId)!;
  if (g.day > deadline) return "O prazo deste comunicado terminou.";
  if (choice.needs?.copies && g.flags.preserved < choice.needs.copies)
    return "São necessárias duas cópias preservadas em decisões anteriores.";
  if (choice.needs?.network && g.flags.network < choice.needs.network)
    return "São necessários três contatos na rede.";
  return null;
}
export function respondToNotice(
  g: Game,
  eventId: string,
  choiceId: string,
): Game {
  if (g.phase === "night" || g.phase === "ending")
    throw new Error("Responda durante o expediente.");
  const kind = noticeKind(eventId),
    choice = noticeOptions(eventId).find((x) => x.id === choiceId);
  if (!choice) throw new Error("Resposta indisponível.");
  const denied = noticeBlocked(g, eventId, choice);
  if (denied) throw new Error(denied);
  const next = structuredClone(g);
  for (const [key, value] of Object.entries(choice.effects)) {
    const k = key as keyof Stats;
    next.stats[k] = Math.max(0, Math.min(100, next.stats[k] + value));
  }
  if (choice.rel) {
    const rel = next.relations[choice.rel.id];
    rel.trust = Math.max(0, Math.min(100, rel.trust + choice.rel.delta));
    rel.memories.push(`Dia ${g.day}: ${choice.reply}`);
  }
  if (kind === "institution-audit" && choiceId !== "order")
    next.pressure.auditUntil = 0;
  if (kind === "institution-surveillance")
    next.pressure.surveillanceUntil = choiceId === "challenge" ? g.day + 1 : 0;
  if (kind === "institution-clearance")
    next.pressure.clearanceUntil += choiceId === "share" ? 3 : 0;
  next.responses.push({ eventId, choiceId, day: g.day, text: choice.reply });
  return next;
}
