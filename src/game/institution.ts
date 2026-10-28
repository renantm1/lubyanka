import type { Game, Stats, WorldEvent } from "./types";
export interface NoticeChoice {
  id: string;
  label: string;
  reply: string;
  effects: Partial<Stats>;
  needs?: { copies?: number; network?: number };
  rel?: { id: string; delta: number };
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
export function updateInstitution(g: Game): Game {
  const next = structuredClone(g);
  const add = (id: string, text: string, character: string) => {
    const event: WorldEvent = {
      id,
      day: g.day,
      text,
      character,
      document: {
        id: `${id}-memo`,
        kind: "telegram",
        date: new Date(Date.UTC(1983, 10, g.day)).toISOString().slice(0, 10),
        title:
          id === "institution-audit"
            ? "Ordem de sindicância"
            : id === "institution-surveillance"
              ? "Comunicado de vigilância interna"
              : "Credenciamento da comissão",
        subtitle: "ORDEM INTERNA · RESPOSTA DO OFICIAL SOLICITADA",
        author: "Gabinete da Diretoria II",
        paragraphs: [text],
        clues: [],
      },
    };
    next.events.push(event);
    next.appliedEvents.push(id);
  };
  if (
    g.stats.trust < 25 &&
    !g.events.some((e) => e.id === "institution-audit")
  ) {
    next.pressure.auditUntil = g.day + 3;
    add(
      "institution-audit",
      "A chefia abriu uma sindicância de quatro expedientes. Anexos especiais e novos recrutamentos estão suspensos. As fontes essenciais dos processos permanecem disponíveis. Apresente as cópias, aceite supervisão ou exija uma ordem assinada.",
      "volkov",
    );
  }
  if (
    g.stats.paranoia >= 65 &&
    !g.events.some((e) => e.id === "institution-surveillance")
  ) {
    next.pressure.surveillanceUntil = g.day + 3;
    next.stats.exposure = Math.min(100, next.stats.exposure + 4);
    add(
      "institution-surveillance",
      "Foi confirmada vigilância interna sobre os seus contatos por quatro expedientes. Recrutar alguém durante esse prazo aumenta a exposição do encontro. A rede pode ajudar a mudar o ponto de contato.",
      "karpov",
    );
  }
  if (
    g.stats.prestige >= 65 &&
    g.stats.trust >= 35 &&
    !g.events.some((e) => e.id === "institution-clearance")
  ) {
    next.pressure.clearanceUntil = g.day + 5;
    add(
      "institution-clearance",
      "A comissão concedeu uma janela de seis expedientes para consultar pareceres especiais. A credencial dispensa o requisito de prestígio, mas não as relações documentadas nem a confiança mínima.",
      "irina",
    );
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
  const deadline =
    eventId === "institution-audit"
      ? g.pressure.auditUntil
      : eventId === "institution-surveillance"
        ? g.pressure.surveillanceUntil
        : g.pressure.clearanceUntil;
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
  const choice = noticeChoices[eventId]?.find((x) => x.id === choiceId);
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
  if (eventId === "institution-audit" && choiceId !== "order")
    next.pressure.auditUntil = 0;
  if (eventId === "institution-surveillance")
    next.pressure.surveillanceUntil = choiceId === "challenge" ? g.day + 1 : 0;
  if (eventId === "institution-clearance")
    next.pressure.clearanceUntil += choiceId === "share" ? 3 : 0;
  next.responses.push({ eventId, choiceId, day: g.day, text: choice.reply });
  return next;
}
