import type { Case, Decision, Game, WorldEvent } from "./types";
import { dateFor } from "./document-generator";

export function delayedConsequences(c: Case, d: Decision): WorldEvent[] {
  const base = { id: `${c.id}:late`, day: d.day + 3, character: c.character };
  if (c.id === "story-1") {
    const detained = d.action === "detain";
    return [
      {
        ...base,
        text: detained
          ? "Anna Mirova pediu revisão da sua ordem. A confissão do filho será examinada no processo de hoje."
          : "Alexei Mirov enviou uma cópia do registro de escuta que circulava na oficina. Ele diz que lembrar de uma pessoa tem um preço menor que apagá-la.",
        effects: detained ? { exposure: 2, integrity: -2 } : {},
        document: {
          id: "dispatch-mirov",
          kind: "letter",
          date: dateFor(base.day),
          title: detained
            ? "Pedido de Anna Mirova"
            : "Telegrama de Alexei Mirov",
          subtitle: "CORRESPONDÊNCIA RECEBIDA · DIA 4",
          author: detained ? "Anna Mirova" : "Alexei Mirov",
          paragraphs: detained
            ? [
                "O senhor assinou a ordem. Eu não sei quem mais pode retirá-la. Não peço um favor. Peço que escute a gravação antes de acreditar na confissão.",
              ]
            : [
                "Voltei para casa. Guardei o número do rolo: R-12. A voz é de um homem pedindo uma ambulância. Se disserem outra coisa, procure a gravação inteira.",
              ],
          clues: [],
        },
      },
    ];
  }
  if (c.id === "story-3" && d.action === "detain")
    return [
      {
        ...base,
        day: 9,
        text: "A clínica usou a detenção de Vera para justificar uma segunda falta no estoque. Nadia pede que as datas sejam revistas.",
        effects: { paranoia: 2 },
        character: "nadia",
      },
    ];
  if (c.id === "story-5" && d.action === "preserve")
    return [
      {
        ...base,
        day: 7,
        text: "Irina cruzou a cópia que você preservou com a lista ferroviária. O processo Z-17 agora contém nomes.",
        effects: { prestige: 2 },
        character: "irina",
      },
    ];
  if (c.id === "story-8" && d.action === "recruit")
    return [
      {
        ...base,
        day: 12,
        text: "Anna respondeu ao canal reservado. Um armário do laboratório ainda conserva as fichas originais.",
        effects: { exposure: 2 },
      },
    ];
  if (
    c.id === "story-12" &&
    d.subject === "Lev Antonov" &&
    d.action === "detain"
  )
    return [
      {
        ...base,
        day: 20,
        text: "O cientista continua sob custódia. A ausência de Antonov abriu espaço para uma nova versão sobre o desaparecimento do caderno.",
        character: "elena",
        effects: { paranoia: 3 },
      },
    ];
  if (d.action === "expose" || d.action === "confront")
    return [
      {
        ...base,
        day: d.day + 4,
        text: `A comissão voltou ao caso de ${c.subject}. ${d.thorough ? "O anexo pericial permitiu conservar a cadeia de custódia." : "A chefia exige uma segunda fonte antes de responsabilizar um gabinete."}`,
        effects: d.thorough ? { prestige: 2 } : { paranoia: 2 },
      },
    ];
  return [];
}
export function deliverConsequences(g: Game): Game {
  const next: Game = structuredClone(g);
  for (const event of [...g.events].sort((a, b) => a.day - b.day)) {
    if (!event.id || event.day > g.day || next.appliedEvents.includes(event.id))
      continue;
    for (const [key, value] of Object.entries(event.effects ?? {})) {
      const stat = key as keyof Game["stats"];
      next.stats[stat] = Math.max(0, Math.min(100, next.stats[stat] + value));
    }
    next.appliedEvents.push(event.id);
    if (event.effects && Object.keys(event.effects).length)
      next.relations[event.character].memories.push(
        `Dia ${event.day}: ${event.text}`,
      );
  }
  return next;
}
