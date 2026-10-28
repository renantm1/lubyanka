import type { Case, Document, Game, Stats } from "../game/types";
import { contactUnavailable, contactsPaused } from "../game/contacts";
export interface MeetingChoice {
  id: string;
  label: string;
  reply: string;
  effects: Partial<Stats>;
  relationship: number;
  needs?: { network?: number; opened?: string };
  copy?: boolean;
}
export interface Meeting {
  speaker: string;
  character: string;
  prompt: string;
  choices: MeetingChoice[];
}
const choice = (
  id: string,
  label: string,
  reply: string,
  effects: Partial<Stats>,
  relationship: number,
  needs?: MeetingChoice["needs"],
  copy = false,
): MeetingChoice => ({ id, label, reply, effects, relationship, needs, copy });
export function meetingFor(g: Game, c: Case): Meeting | undefined {
  if (g.mode !== "campaign" || c.id !== `story-${g.day}`) return;
  const meetings: Record<number, Meeting> = {
    8: {
      speaker: "Orlov, em nome de Anna",
      character: "mikhail",
      prompt:
        "Anna aceita conversar, mas pergunta o que acontecerá com o filho se o contato for descoberto. Que promessa você está disposto a registrar?",
      choices: [
        choice(
          "protect",
          "Preparar um contato seguro para a família",
          "Orlov separa um canal para a família. A promessa não impede uma represália; ela cria uma responsabilidade que agora pode ser cobrada.",
          { exposure: 2, integrity: 2 },
          4,
        ),
        choice(
          "no-promise",
          "Não prometer uma proteção que não posso garantir",
          "Orlov transmite uma resposta sem garantias. Anna sabe o limite do acordo e decide se ainda quer conversar.",
          { trust: 1 },
          -1,
        ),
      ],
    },
    12: {
      speaker: "Dr. Lev Antonov",
      character: "lev",
      prompt:
        "O cientista reconhece a referência do arquivo e pede que sua filha não seja citada nos relatórios de circulação. Você aceita separar a identificação familiar da prova técnica?",
      choices: [
        choice(
          "redact",
          "Retirar o endereço familiar das cópias",
          "Antonov confirma o contato técnico sem identificar a filha. A declaração preserva o conteúdo e separa o endereço da circulação comum.",
          { integrity: 2, exposure: 1 },
          5,
        ),
        choice(
          "complete",
          "Manter todas as identificações no protocolo",
          "O protocolo será completo. Antonov pede que conste também quem autorizou a circulação dos dados familiares.",
          { trust: 2, integrity: -2 },
          -4,
        ),
      ],
    },
    15: {
      speaker: "Major Oleg Karpov",
      character: "karpov",
      prompt:
        "Karpov oferece uma recomendação para promoção se a origem do relógio não sair do gabinete. O recibo continua no arquivo. O acordo é sobre quem poderá vê-lo.",
      choices: [
        choice(
          "refuse",
          "Recusar e registrar a oferta",
          "Karpov encerra a ligação. A oferta permanece anotada, e o major sabe que você guardou mais que o recibo.",
          { prestige: 1, exposure: 3, integrity: 2 },
          -6,
        ),
        choice(
          "trade",
          "Aceitar o apoio à promoção",
          "A recomendação segue para a chefia. A origem do favor fica entre vocês; isso também dá a Karpov uma informação que pode usar contra você.",
          { prestige: 3, trust: 3, integrity: -6, exposure: 2 },
          5,
        ),
      ],
    },
    17: {
      speaker: "Irina Sokolova",
      character: "irina",
      prompt:
        "A cópia espelho sobreviveu. Irina pede que a folha de entrega da credencial seja guardada fora da mesma estante. É preciso examinar o laudo antes de fazer a cópia.",
      choices: [
        choice(
          "copy",
          "Preservar uma segunda via da entrega",
          "Irina separa a folha da credencial. Uma cópia identifica o acesso; a outra registra quem recebeu a credencial naquele turno.",
          { exposure: 2 },
          4,
          { opened: "story-17-annex" },
          true,
        ),
        choice(
          "official",
          "Manter tudo na cadeia oficial",
          "As vias permanecem juntas. Há um recibo único para o conjunto e um único ponto em que todas podem ser recolhidas.",
          { trust: 2 },
          -2,
        ),
      ],
    },
    18: {
      speaker: "Mikhail Orlov",
      character: "mikhail",
      prompt:
        "Yuri precisa de um lugar para ficar com a família. Orlov conhece uma casa, mas usá-la compromete mais um contato. A segurança também quer esse endereço.",
      choices: [
        choice(
          "shelter",
          "Abrigar a família pela rede",
          "A casa recebe a família. Orlov confirma que um dos contatos ficará responsável pela chegada; agora ele também está exposto.",
          { exposure: 3, integrity: 2 },
          5,
          { network: 2 },
        ),
        choice(
          "address",
          "Entregar o endereço à segurança",
          "O gabinete recebe o endereço. Orlov não confirma se a família conseguiu sair antes da visita.",
          { trust: 4, integrity: -6, paranoia: 2 },
          -7,
        ),
        choice(
          "decline",
          "Recusar usar ou entregar a casa",
          "A casa permanece fora dos dois circuitos. Orlov terá de procurar outra solução, sem a sua promessa de apoio.",
          {},
          -1,
        ),
      ],
    },
    22: {
      speaker: "Coronel Viktor Volkov",
      character: "volkov",
      prompt:
        "Volkov oferece depor sobre a cadeia de comando se você separar sua participação do processo principal. A terceira página tem a rubrica dele. Sua resposta ficará registrada.",
      choices: [
        choice(
          "accountability",
          "Aceitar o depoimento sem apagar sua responsabilidade",
          "Volkov aceita falar, sabendo que a própria assinatura seguirá junto. A colaboração não se tornou uma absolvição.",
          { integrity: 2, exposure: 2 },
          2,
        ),
        choice(
          "bargain",
          "Prometer que sua participação ficará reservada",
          "Volkov mantém o canal aberto. A promessa deixa uma segunda cadeia de compromissos, que não aparece no relatório oficial.",
          { trust: 4, integrity: -5, exposure: 2 },
          5,
        ),
      ],
    },
    26: {
      speaker: "Mikhail Orlov",
      character: "mikhail",
      prompt:
        "A rota admite uma mala. Há uma segunda passagem se a rede puder sustentar os dois pontos de apoio. Partir não protege automaticamente quem permanece em Moscou.",
      choices: [
        choice(
          "alone",
          "Preparar uma saída individual",
          "Orlov reserva um lugar e uma mala. Os contatos recebem apenas o necessário para essa travessia.",
          { integrity: -1 },
          1,
        ),
        choice(
          "companion",
          "Preparar a segunda passagem pela rede",
          "A segunda passagem está preparada. O apoio em ambos os pontos amplia a chance de sair acompanhado e o número de pessoas que conhecem a rota.",
          { exposure: 4, integrity: 2 },
          3,
          { network: 4 },
        ),
        choice(
          "stay",
          "Não acionar preparativos de viagem",
          "Orlov mantém os documentos sem marcar a travessia. Você poderá escolher outro encaminhamento para o arquivo.",
          { trust: 1 },
          0,
        ),
      ],
    },
    28: {
      speaker: "Daria Rozanova, na gráfica",
      character: "elena",
      prompt:
        "A prova tipográfica tem uma coluna só para endereços. Os nomes já foram conferidos. O que deve circular com a edição?",
      choices: [
        choice(
          "redact",
          "Publicar os nomes, retirar endereços familiares",
          "A tipógrafa retira a coluna de endereços e conserva os nomes confirmados. A revisão fica guardada com o original para demonstrar o que foi alterado.",
          { integrity: 3, exposure: 1 },
          5,
        ),
        choice(
          "full",
          "Fazer circular a prova integral",
          "Os endereços acompanham os nomes. A edição fica mais fácil de rastrear até as famílias, inclusive para quem quer silenciá-las.",
          { exposure: 4, integrity: -5 },
          -6,
        ),
      ],
    },
    29: {
      speaker: "Nadia Belova",
      character: "nadia",
      prompt:
        "Nadia pode acompanhar a entrega dos documentos à comissão ou conservar uma via com a rede. Uma entrega assinada identifica também quem a realizou.",
      choices: [
        choice(
          "commission",
          "Entregar uma via com recibo à comissão",
          "Nadia acompanha a entrega. A comissão assina a custódia da via recebida; as demais cópias conservam seus próprios destinos.",
          { prestige: 2, exposure: 2 },
          3,
        ),
        choice(
          "network",
          "Guardar uma via fora do gabinete",
          "Uma via permanece fora da apreensão oficial. O contato responsável sabe o que recebeu e o risco que assumiu ao aceitar.",
          { exposure: 3, integrity: 1 },
          2,
        ),
      ],
    },
  };
  const meeting = meetings[g.day];
  return meeting &&
    !contactsPaused(g) &&
    !contactUnavailable(g, meeting.character)
    ? meeting
    : undefined;
}
export function meetingBlocked(
  g: Game,
  c: Case,
  option: MeetingChoice,
): string | null {
  if (g.responses.some((r) => r.eventId === `meeting:${c.id}`))
    return "Resposta já registrada.";
  if (option.needs?.network && g.flags.network < option.needs.network)
    return `São necessários ${option.needs.network} contatos na rede.`;
  if (option.needs?.opened && !g.opened.includes(option.needs.opened))
    return "Examine o laudo deste processo antes de preservar esta via.";
  return null;
}
export function answerMeeting(g: Game, c: Case, choiceId: string): Game {
  const meeting = meetingFor(g, c),
    option = meeting?.choices.find((x) => x.id === choiceId);
  if (
    !meeting ||
    !option ||
    g.day !== c.day ||
    g.phase === "night" ||
    g.phase === "ending"
  )
    throw new Error("Conversa indisponível neste expediente.");
  const denied = meetingBlocked(g, c, option);
  if (denied) throw new Error(denied);
  const next = structuredClone(g);
  for (const [key, value] of Object.entries(option.effects)) {
    const k = key as keyof Stats;
    next.stats[k] = Math.max(0, Math.min(100, next.stats[k] + value));
  }
  next.relations[meeting.character].trust = Math.max(
    0,
    Math.min(
      100,
      next.relations[meeting.character].trust + option.relationship,
    ),
  );
  next.relations[meeting.character].memories.push(
    `Dia ${g.day}: ${option.reply}`,
  );
  if (option.copy) next.flags.preserved++;
  next.responses.push({
    eventId: `meeting:${c.id}`,
    choiceId,
    day: g.day,
    text: option.reply,
  });
  return next;
}
export function meetingDocuments(g: Game, c: Case): Document[] {
  const answer = g.responses.find((r) => r.eventId === `meeting:${c.id}`);
  if (!answer) return [];
  let title = "",
    text = "",
    code = "";
  if (c.day === 17 && answer.choiceId === "copy") {
    title = "Folha de entrega da credencial";
    text =
      "A credencial usada na alteração A-17 foi entregue ao gabinete de Karpov antes do segundo acesso. A cópia de Irina conserva o recibo da entrega e o horário de devolução.";
    code = "A-17";
  }
  if (c.day === 26 && answer.choiceId === "companion") {
    title = "Guia da segunda passagem";
    text =
      "A guia F-26 reserva uma segunda passagem condicionada ao apoio nos dois pontos da rota. Não contém nomes de familiares para não os vincular ao recibo de fronteira.";
    code = "F-26";
  }
  if (c.day === 28 && answer.choiceId === "redact") {
    title = "Prova P-28 sem endereços";
    text =
      "Os onze nomes permanecem na edição P-28. A coluna de endereços foi retirada e preservada separadamente com o registro da revisão.";
    code = "P-28";
  }
  if (!title) return [];
  return [
    {
      id: `${c.id}-meeting-copy`,
      title,
      kind: "record",
      subtitle: "VIA PRODUZIDA APÓS CONVERSA RESERVADA",
      author: meetingFor(g, c)?.speaker ?? "Arquivo de conversas reservadas",
      date: new Date(Date.UTC(1983, 10, g.day)).toISOString().slice(0, 10),
      archive: true,
      paragraphs: [text],
      clues: [
        {
          id: `${c.id}-meeting-clue`,
          text,
          key: `${c.id}-cadeia`,
          value: code,
          source: title,
        },
      ],
    },
  ];
}
