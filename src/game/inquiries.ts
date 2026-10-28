import type { Case, Game, InquiryRecord } from "./types";
import { casesFor } from "./engine";
import { inquiryOptions, type InquiryOption } from "../content/inquiries";
import { contactUnavailable, contactsPaused } from "./contacts";
import { dateFor } from "./document-generator";

export function inquiryBlocked(
  g: Game,
  c: Case,
  option: InquiryOption,
): string | null {
  if (g.phase === "night" || g.phase === "ending" || c.day !== g.day)
    return "O expediente deste processo já foi encerrado.";
  if (g.decisions.some((d) => d.caseId === c.id))
    return "O relatório já foi enviado; novas diligências exigiriam outro processo.";
  if (g.inquiries.some((r) => r.caseId === c.id))
    return "Uma via já foi escolhida para este processo.";
  const required =
    option.route === "formal" ? `${c.id}-report` : `${c.id}-letter`;
  if (!g.opened.includes(required))
    return option.route === "formal"
      ? "Leia a declaração preliminar antes de fundamentar o pedido."
      : "Leia a correspondência ou o depoimento reservado antes de procurar o contato.";
  if (option.route === "reserved") {
    if (g.pressure.auditUntil >= g.day)
      return "O canal reservado está suspenso durante a sindicância.";
    if (contactsPaused(g))
      return "Os contatos estão pausados por sua resposta à vigilância.";
    if (contactUnavailable(g, option.contact))
      return "O contato está sob custódia e não pode fazer esta consulta.";
    if ((g.relations[option.contact]?.trust ?? 0) < 40)
      return "O contato exige confiança de pelo menos 40 para procurar esta fonte.";
  }
  return null;
}

export function requestInquiry(
  g: Game,
  caseId: string,
  route: InquiryRecord["route"],
): Game {
  const c = casesFor(g).find((x) => x.id === caseId),
    option = c && inquiryOptions(c).find((o) => o.route === route);
  if (!c || !option) throw new Error("Diligência indisponível neste processo.");
  const denied = inquiryBlocked(g, c, option);
  if (denied) throw new Error(denied);
  const proof = c.documents.find((d) => d.id === `${c.id}-record`)!.clues[0];
  const id = `${c.id}-inquiry-${route}`;
  const record: InquiryRecord = {
    caseId,
    day: g.day,
    route,
    response: option.response,
    document: {
      id,
      kind: route === "formal" ? "record" : "letter",
      archive: true,
      title: option.title,
      subtitle:
        route === "formal"
          ? "DILIGÊNCIA DEFERIDA · VIA NOMINAL"
          : "DILIGÊNCIA RESERVADA · ORIGEM CONFERÍVEL",
      date: dateFor(g.day),
      author: option.author,
      paragraphs: option.paragraphs,
      clues: [
        {
          id: `${id}-fact`,
          text: option.clue,
          key: proof.key,
          value: proof.value,
          source: option.title,
        },
      ],
    },
  };
  const next: Game = structuredClone(g),
    clamp = (n: number) => Math.max(0, Math.min(100, n));
  next.phase = "work";
  next.inquiries.push(record);
  next.stats.exposure = clamp(
    next.stats.exposure +
      (route === "formal" ? 3 : 1) +
      (g.pressure.surveillanceUntil >= g.day ? 2 : 0),
  );
  next.stats.trust = clamp(next.stats.trust + (route === "formal" ? 1 : -2));
  if (route === "reserved") {
    next.relations[option.contact].trust = clamp(
      next.relations[option.contact].trust - 2,
    );
    next.relations[option.contact].memories.push(
      `Dia ${g.day}: você pediu uma diligência reservada sobre ${c.subject}.`,
    );
  }
  next.events.push({
    id: `${id}:reply`,
    day: g.day + 2,
    character: option.contact,
    text: option.followup,
    effects: route === "formal" ? { paranoia: 1 } : { integrity: 1 },
    document: {
      id: `${id}-reply`,
      kind: "letter",
      title: `Retorno da diligência · ${c.subject}`,
      subtitle: "DOIS DIAS APÓS A CONSULTA",
      date: dateFor(g.day + 2),
      author: option.author,
      paragraphs: [
        option.followup,
        `Referência: ${option.title}. O retorno não modifica por si só o relatório já assinado.`,
      ],
      clues: [],
    },
  });
  return next;
}
