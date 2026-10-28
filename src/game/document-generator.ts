import type { Beat, Case, Document } from "./types";
import { beats } from "../content/campaign";
export const dateFor = (day: number) =>
  new Date(Date.UTC(1983, 10, day)).toISOString().slice(0, 10);
export function storyCase(day: number): Case {
  const beat = beats[day - 1];
  if (!beat) throw new Error("Dia fora da campanha");
  return fromBeat(beat, day, `story-${day}`);
}
export function fromBeat(beat: Beat, day: number, id: string): Case {
  const date = dateFor(day),
    prefix = id;
  const clue = (
    suffix: string,
    text: string,
    value: string,
    source: string,
  ) => ({
    id: `${prefix}-${suffix}`,
    text,
    key: `${prefix}-alegacao`,
    value,
    source,
  });
  const documents: Document[] = [
    {
      id: `${prefix}-order`,
      kind: "report",
      title: "Ordem de investigação",
      subtitle: `DIRETORIA II · PROTOCOLO ${String(day).padStart(3, "0")}/83`,
      date,
      author: "Gabinete do coronel Volkov",
      paragraphs: [
        beat.briefing,
        "Apresente uma conclusão fundamentada e uma recomendação. A leitura de um documento não comprova a veracidade de seu conteúdo.",
      ],
      clues: [],
    },
    {
      id: `${prefix}-report`,
      kind: "report",
      title: day === 1 ? "Relatório de vigilância" : "Declaração preliminar",
      subtitle: "VIA OFICIAL · CIRCULAÇÃO RESTRITA",
      date,
      author: day === 1 ? "Major Oleg Karpov" : "Seção de segurança interna",
      paragraphs: [
        `Assunto: ${beat.subject}. ${beat.accusation}`,
        "Recomendação preliminar: manter o investigado à disposição. O signatário assume a responsabilidade pelo conteúdo deste relato.",
      ],
      clues: [clue("claim", beat.accusation, "alegacao", "Declaração oficial")],
    },
    {
      id: `${prefix}-letter`,
      kind: "letter",
      title:
        day === 1 ? "Correspondência interceptada" : "Depoimento reservado",
      subtitle:
        day === 1
          ? "DE: A. MIROV · PARA: ANNA MIROVA"
          : "CÓPIA MANUSCRITA · NÃO DISTRIBUIR",
      date: dateFor(Math.max(1, day - 1)),
      author: day === 1 ? "Alexei Mirov" : "Fonte protegida",
      sealed: true,
      paragraphs:
        day === 1
          ? [
              "Mamãe,",
              "O frio chegou antes do salário. Na terça, depois do turno, levo os remédios. Se o trem atrasar, peça à vizinha para acender o fogão.",
              "Não se preocupe comigo. Ainda há gente boa na oficina.",
              "Seu filho, Alexei.",
            ]
          : [
              "Ao oficial responsável,",
              beat.witness,
              "Peço que considere o que acontecerá às pessoas citadas se esta cópia circular.",
            ],
      clues: [
        {
          id: `${prefix}-context`,
          text: beat.witness,
          key: `${prefix}-contexto`,
          value: "contexto",
          source: "Depoimento reservado",
        },
      ],
    },
    {
      id: `${prefix}-record`,
      kind: "record",
      title:
        day === 1
          ? "Livro de ponto · oficina de Tula"
          : "Registro de verificação",
      subtitle: "ARQUIVO CENTRAL · CÓPIA CERTIFICADA",
      date,
      author:
        day === 1
          ? "Inspetor de turno A. Novikov"
          : "Irina Sokolova · Arquivista",
      archive: true,
      paragraphs: [
        `Cidadão: ${beat.subject}. Ocupação: ${beat.occupation}.`,
        beat.proof,
        "Certifico que esta cópia corresponde ao registro preservado. A classificação de um documento não garante a precisão das afirmações nele contidas.",
      ],
      clues: [
        clue(
          "proof",
          beat.proof,
          beat.truth === "responsible" ? "alegacao" : "refutacao",
          "Registro independente",
        ),
      ],
    },
    {
      id: `${prefix}-photo`,
      kind: "photo",
      title: day === 1 ? "Plataforma 4 · Kievsky" : "Anexo fotográfico",
      subtitle: "NEGATIVO 04 · AMPLIAR PARA EXAMINAR",
      date: dateFor(Math.max(1, day - 1)),
      author: "Laboratório fotográfico da Diretoria II",
      paragraphs: [
        day === 1
          ? "O relógio da plataforma marca 21h. O rosto junto ao vagão está oculto. A fotografia, isoladamente, não identifica Mirov."
          : "Registro de contexto da operação. A imagem não identifica, por si só, os responsáveis.",
      ],
      clues: [],
    },
  ];
  return {
    id,
    day,
    title: beat.title,
    subject: beat.subject,
    occupation: beat.occupation,
    age: day === 1 ? 34 : 28 + ((day * 7) % 31),
    category: day === 1 ? "Correspondência interceptada" : "Operação Zarya",
    briefing: beat.briefing,
    truth: beat.truth,
    rationale: beat.rationale,
    documents,
    character: beat.character,
    actions: [
      "release",
      "detain",
      "watch",
      ...(day >= 3 ? ["recruit" as const] : []),
      ...(day >= 5 ? ["preserve" as const] : []),
      ...(day >= 8 ? ["conceal" as const, "expose" as const] : []),
      ...(day >= 16 ? ["confront" as const] : []),
      ...(day >= 26 ? ["escape" as const] : []),
    ],
    consequence: {
      innocent:
        "A conclusão de inocência fica registrada. Um nome deixa de ser apenas uma linha em uma lista.",
      responsible:
        "A imputação segue para a chefia. A decisão de responsabilizar alguém pode ser usada além do escopo deste caso.",
      coverup:
        "A divergência institucional foi registrada. Agora há uma cópia que alguém preferiria não encontrar.",
    },
  };
}
