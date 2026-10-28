import { fromBeat, dateFor } from "./document-generator";
import type { Beat, Case } from "./types";
// Cada variante define a verdade e a cadeia de evidência ANTES dos documentos.
export const archetypes = [
  {
    name: "Sabotagem industrial",
    occupation: "Operador de máquinas",
    variants: [
      [
        "innocent",
        "Desligou um motor para interromper a produção.",
        "A ordem de manutenção anterior manda desligar o motor por vazamento.",
        "O supervisor omitiu a ordem para conservar o prêmio da fábrica.",
      ],
      [
        "responsible",
        "Removeu uma peça do motor sem autorização.",
        "A peça com número de série foi encontrada na sua bancada com um recibo de venda.",
        "O salário atrasado explica a venda; não elimina o risco aos colegas.",
      ],
      [
        "coverup",
        "Foi responsável por uma explosão na linha.",
        "A inspeção anterior condenava a tubulação; a direção assinou a reabertura.",
        "O livro de inspeção foi retirado depois do acidente.",
      ],
    ],
  },
  {
    name: "Mercado negro",
    occupation: "Responsável por almoxarifado",
    variants: [
      [
        "responsible",
        "Vendeu alimentos de um estoque público.",
        "Cupons apreendidos no mercado correspondem ao lote retirado por sua assinatura.",
        "Parte do dinheiro pagou o tratamento de um parente.",
      ],
      [
        "innocent",
        "Retirou oito caixas sem registro.",
        "O recibo do hospital comprova entrega emergencial autorizada das oito caixas.",
        "O transporte saiu antes de o formulário chegar ao almoxarifado.",
      ],
      [
        "coverup",
        "Ocultou o desaparecimento de uma remessa.",
        "O caminhão foi requisitado pela direção antes de chegar ao depósito.",
        "O relatório atribuiu a perda a quem nunca recebeu a carga.",
      ],
    ],
  },
  {
    name: "Vazamento de documentos",
    occupation: "Tradutor técnico",
    variants: [
      [
        "responsible",
        "Entregou uma cópia restrita a um contato externo.",
        "O fragmento recuperado conserva sua marca individual de cópia e uma dedicatória.",
        "A entrega pretendia denunciar um experimento clandestino.",
      ],
      [
        "innocent",
        "Copiou um relatório restrito.",
        "O registro de impressão mostra que o relatório já era público na data.",
        "Uma classificação posterior foi aplicada retroativamente.",
      ],
      [
        "coverup",
        "Roubou um caderno da biblioteca técnica.",
        "O recibo comprova que o caderno foi entregue ao gabinete do diretor.",
        "O conteúdo compromete o financiamento de uma operação.",
      ],
    ],
  },
  {
    name: "Deserção",
    occupation: "Mecânico militar",
    variants: [
      [
        "innocent",
        "Abandonou o posto e comprou uma passagem para a fronteira.",
        "A licença assinada autoriza visita à mãe no hospital da região.",
        "A passagem foi comprada pelo hospital, junto à licença.",
      ],
      [
        "responsible",
        "Tentou cruzar a fronteira com documentos de serviço.",
        "Os documentos e o plano de travessia foram encontrados no mesmo envelope assinado.",
        "Um contato prometeu retirar sua família depois.",
      ],
      [
        "coverup",
        "Deixou o quartel levando códigos de rádio.",
        "O livro de missão mostra que a saída foi ordenada pelo comando.",
        "O comando negou a missão após uma transmissão falhar.",
      ],
    ],
  },
  {
    name: "Corrupção",
    occupation: "Fiscal de obras",
    variants: [
      [
        "responsible",
        "Aceitou dinheiro para aprovar uma obra.",
        "A ordem de pagamento cita a aprovação assinada no mesmo dia.",
        "A obra tem rachaduras registradas antes da aprovação.",
      ],
      [
        "coverup",
        "Desviou cimento de alojamentos.",
        "As guias mostram uma requisição militar assinada pelo diretor regional.",
        "Os moradores ficaram sem aquecimento para preservar uma verba secreta.",
      ],
      [
        "innocent",
        "Forjou uma inspeção de segurança.",
        "A cópia selada preserva sua reprovação; a versão aprovada tem outra assinatura.",
        "O empreiteiro imprimiu uma segunda página.",
      ],
    ],
  },
  {
    name: "Denúncia política",
    occupation: "Bibliotecário",
    variants: [
      [
        "innocent",
        "Distribuiu material proibido.",
        "O catálogo e o selo de aquisição autorizam a circulação da mesma edição.",
        "O denunciante disputa o apartamento do investigado.",
      ],
      [
        "responsible",
        "Imprimiu uma edição clandestina.",
        "As chapas com sua correção manuscrita correspondem à edição apreendida.",
        "A publicação pede notícia de parentes desaparecidos, sem instruções violentas.",
      ],
      [
        "coverup",
        "Extraviou registros de leitores.",
        "A guia de descarte foi emitida pela segurança do distrito.",
        "Os registros citam membros da direção como leitores do mesmo material.",
      ],
    ],
  },
  {
    name: "Desaparecimento",
    occupation: "Funcionário de estação",
    variants: [
      [
        "coverup",
        "Ocultou o destino de um passageiro.",
        "A ordem de transferência reservada exige apagar o desembarque.",
        "A família recebeu uma carta com data posterior, escrita por outra pessoa.",
      ],
      [
        "innocent",
        "Ajudou um passageiro a sumir.",
        "O registro do hospital confirma atendimento emergencial após o desembarque.",
        "A família foi avisada por telegrama que não chegou.",
      ],
      [
        "responsible",
        "Usou identidade alheia para comprar uma passagem.",
        "A impressão digital na ficha corresponde ao investigado.",
        "A identidade pertencia a um parente morto; a viagem foi para buscar o filho.",
      ],
    ],
  },
  {
    name: "Irregularidade militar",
    occupation: "Intendente",
    variants: [
      [
        "responsible",
        "Trocou material de serviço por combustível.",
        "Os números de série no posto civil constam no recibo assinado por ele.",
        "O combustível aqueceu um alojamento isolado, mas deixou a unidade sem reserva.",
      ],
      [
        "innocent",
        "Reduziu o inventário de peças sem justificativa.",
        "O novo manual manda contabilizar conjuntos completos em vez de peças.",
        "A conversão de unidades explica exatamente a diferença.",
      ],
      [
        "coverup",
        "Enviou equipamento para uma unidade inexistente.",
        "A unidade consta em um anexo reservado autorizado pela direção.",
        "O código é uma cobertura para transportar pacientes a um centro de testes.",
      ],
    ],
  },
] as const;
export function random(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function generateCase(seed: string, day: number): Case {
  const rng = random(`${seed}:${day}`),
    index = (day - 1 + Math.floor(random(seed)() * 8)) % 8;
  const archetype = archetypes[index],
    variant = Math.floor(rng() * archetype.variants.length);
  const [truth, accusation, proof, witness] = archetype.variants[variant];
  const first = [
    "Anatoli",
    "Sofia",
    "Petr",
    "Lidia",
    "Vasili",
    "Nina",
    "Grigori",
    "Tatiana",
  ];
  const last = [
    "Fedorov",
    "Romanova",
    "Pavlov",
    "Sidorova",
    "Belyaev",
    "Nikitina",
    "Melnikov",
    "Alekseeva",
  ];
  const subject = `${first[Math.floor(rng() * first.length)]} ${last[Math.floor(rng() * last.length)]}`;
  const beat: Beat = {
    title: `${archetype.name} · processo ${String(day).padStart(3, "0")}`,
    subject,
    occupation: archetype.occupation,
    briefing: `Um novo processo chegou da seção distrital. Há uma alegação, uma versão reservada e um registro independente. Determine o que pode ser sustentado.`,
    accusation,
    proof,
    witness,
    truth,
    rationale: `${proof} ${witness}`,
    character: ["nadia", "mikhail", "irina", "yuri"][Math.floor(rng() * 4)],
  };
  return {
    ...fromBeat(beat, day, `proc-${day}`),
    category: archetype.name,
    archetype: archetype.name,
    variant,
  };
}
export function validateCase(c: Case): string[] {
  const errors: string[] = [],
    ids = new Set<string>();
  for (const doc of c.documents) {
    if (ids.has(doc.id)) errors.push("Documento duplicado");
    ids.add(doc.id);
    if (doc.date > dateFor(c.day))
      errors.push("Documento menciona data futura");
    for (const clue of doc.clues) {
      if (ids.has(clue.id)) errors.push("Pista duplicada");
      ids.add(clue.id);
      if (!clue.text.trim()) errors.push("Pista vazia");
    }
  }
  const claims = c.documents
    .flatMap((d) => d.clues)
    .filter((e) => e.key.endsWith("alegacao"));
  if (claims.length < 2)
    errors.push("Fontes insuficientes para testar a alegação");
  if (
    claims.length >= 2 &&
    (claims[0].value === claims[1].value) !== (c.truth === "responsible")
  )
    errors.push("Prova incompatível com a verdade interna");
  if (!c.rationale || !c.subject || !c.documents.some((d) => d.archive))
    errors.push("Caso incompleto");
  return errors;
}
