import type { Case, Document, Game } from "../game/types";
import { annexForCase } from "./later-investigations";

// Anexos específicos. Uma relação registrada gera uma requisição, não uma conclusão automática.
const annexes: Record<
  number,
  {
    title: string;
    kind: Document["kind"];
    author: string;
    text: string;
    clue: string;
    code: string;
    scene: Document["scene"];
  }
> = {
  1: {
    title: "Laudo de fita · laboratório 6",
    kind: "report",
    author: "Perito Leonid Arseniev",
    text: "O relato de Kievsky foi produzido em duas máquinas. O corpo usa fita violeta; o nome Alexei Mirov foi inserido depois, em fita preta. A fotografia não permite reconhecer o rosto. A ordem de substituição leva a referência K-14.",
    clue: "A inserção de Alexei Mirov é posterior ao corpo do relatório; ordem de substituição K-14.",
    code: "K-14",
    scene: "railway",
  },
  2: {
    title: "Laudo da válvula · prensa 2",
    kind: "report",
    author: "Engenheira Zoya Danilova",
    text: "A válvula V-22 estava rompida antes do turno de Boris Zaitsev. A parada das 14h evitou uma descarga de vapor sobre três operários. A reabertura foi exigida pelo diretor para manter a meta mensal.",
    clue: "V-22: ruptura anterior ao turno. Ordem de parada às 14h; reabertura exigida pela direção às 14h30.",
    code: "V-22",
    scene: "factory",
  },
  3: {
    title: "Receitas e racionamento",
    kind: "record",
    author: "Diretora de enfermaria Raisa Tolstova",
    text: "O lote M-08 foi vendido. Duas receitas carimbadas ficaram sem atendimento. O recibo do carvão confirma a compra para o alojamento. Consta uma terceira receita emitida depois do inventário: ela não prova outra retirada.",
    clue: "A venda do lote M-08 pagou carvão. Duas receitas anteriores ficaram sem atendimento; a terceira é posterior ao inventário.",
    code: "M-08",
    scene: "laboratory",
  },
  4: {
    title: "Transcrição integral · posto de escuta",
    kind: "telegram",
    author: "Operadora Galina Artemova",
    text: "20h00 — “Equipe de busca, aqui R-12. O caminhão caiu no gelo. Precisamos de uma ambulância.” 20h04 — o posto confirma a chamada. O marcador local estava duas horas adiantado. A ficha R-21 pertence a um teste sem voz.",
    clue: "R-12: pedido de ambulância às 20h. R-21: teste de equipamento, sem voz registrada.",
    code: "R-12",
    scene: "street",
  },
  5: {
    title: "Segunda via · requisição Z-17",
    kind: "record",
    author: "Arquivo de pagamentos do Partido",
    text: "Pagamento Z-17: rubrica de Pavel Serebrov. Os materiais não foram entregues aos alojamentos previstos no orçamento. O recibo de transporte aponta um centro de pesquisa fora da cidade. A via precisa ser preservada para ser citada depois do expurgo.",
    clue: "A rubrica de Pavel Serebrov autoriza Z-17; a entrega foi para um centro de pesquisa, não para os alojamentos.",
    code: "Z-17",
    scene: "laboratory",
  },
  6: {
    title: "Livro de bagagens · lacre C-41",
    kind: "record",
    author: "Despachante Polina Gracheva",
    text: "O lacre C-41 foi aplicado à mala de Nikolai Fomin antes de a etiqueta ser trocada. O volume que continha moeda tinha lacre C-14. O carregador registrou as duas referências no mesmo formulário para se proteger de uma acusação.",
    clue: "Mala de Nikolai Fomin: C-41. Volume com moeda: C-14. As etiquetas foram trocadas depois do lacre.",
    code: "C-41",
    scene: "railway",
  },
  7: {
    title: "Lista de escolta · vagão seis",
    kind: "telegram",
    author: "Cópia reservada de Irina Sokolova",
    text: "Onze passageiros transferidos para Z-17. Sergei Sokolov consta sem assinatura de ciência. A guia diz “voluntários”, mas exige escolta armada e proíbe notificar os familiares. O formulário financeiro remete à requisição Z-17.",
    clue: "Sergei Sokolov: sem assinatura de ciência. Transferência Z-17 exige escolta e impede aviso à família.",
    code: "Z-17",
    scene: "railway",
  },
};
export function deepenInvestigation(c: Case, g?: Game): Case {
  const data = c.day <= 7 ? annexes[c.day] : annexForCase(c);
  if (!data) return c;
  const id = `${c.id}-annex`,
    first = c.documents.find((d) => d.id === `${c.id}-report`)!,
    proof = c.documents.find((d) => d.archive)!;
  const documents = c.documents.map((d) =>
    d.kind === "photo" ? { ...d, scene: data.scene } : d,
  );
  documents.push({
    id,
    kind: data.kind,
    title: data.title,
    subtitle: `REQUISIÇÃO CRUZADA · ANEXO ${data.code}`,
    date: first.date,
    author: data.author,
    archive: true,
    unlock: {
      a: first.clues[0].id,
      b: proof.clues[0].id,
      relation:
        first.clues[0].value === proof.clues[0].value ? "support" : "conflict",
    },
    paragraphs: [
      data.text,
      "Não distribua este anexo sem registrar quem terá acesso à cópia.",
    ],
    clues: [
      {
        id: `${id}-trace`,
        text: data.clue,
        key: `${c.id}-cadeia`,
        value: data.code,
        source: data.title,
      },
    ],
  });
  if (
    "chain" in data &&
    typeof data.chain === "string" &&
    "custody" in data &&
    typeof data.custody === "string"
  ) {
    const custodyId = `${c.id}-custody`;
    documents.push({
      id: custodyId,
      kind: "record",
      title: `Livro de custódia · ${data.code}`,
      subtitle: "ORIGEM, GUARDA E TRANSFERÊNCIA",
      date: first.date,
      author: "Arquivo central · registro de circulação",
      archive: true,
      paragraphs: [
        data.chain,
        "Registre o número do anexo ao citar esta via. Duas versões copiadas de uma mesma fonte não se tornam independentes por receberem carimbos diferentes.",
      ],
      clues: [
        {
          id: `${custodyId}-trace`,
          text: data.chain,
          key: `${c.id}-cadeia`,
          value: data.code,
          source: `Livro de custódia ${data.code}`,
        },
      ],
    });
    documents.push({
      id: `${c.id}-reserved`,
      kind: "report",
      title: `Parecer reservado · ${data.code}`,
      subtitle: "CIRCULAÇÃO ESPECIAL · COMISSÃO DE REVISÃO",
      date: first.date,
      author: "Auditora Sofia Belyaeva",
      archive: true,
      unlock: {
        a: `${id}-trace`,
        b: `${custodyId}-trace`,
        relation: "support",
      },
      access: { prestige: 65, trust: 35 },
      paragraphs: [
        data.custody,
        "Este parecer não substitui a conclusão do analista. Explicite a responsabilidade que as provas permitem sustentar e as pessoas que o encaminhamento pode atingir.",
      ],
      clues: [
        {
          id: `${c.id}-reserved-note`,
          text: data.custody,
          key: `${c.id}-encaminhamento`,
          value: "revisao",
          source: "Comissão de revisão",
        },
      ],
    });
  }
  if (
    c.day === 7 &&
    g?.decisions.some((d) => d.caseId === "story-5" && d.action === "preserve")
  )
    documents.push({
      id: `${c.id}-finance-link`,
      kind: "record",
      title: "Ligação financeira · Z-17",
      subtitle: "CÓPIA PRESERVADA DO PROCESSO 005/83",
      author: "Irina Sokolova",
      date: first.date,
      archive: true,
      paragraphs: [
        "A segunda via que você preservou no processo de Tamara registra o pagamento Z-17. A referência coincide com a guia da escolta de Sergei Sokolov.",
        "A rubrica de Serebrov atravessa a requisição de material e a transferência de pacientes. Sem esta cópia, o arquivo central preserva a lista, mas não esse vínculo financeiro.",
      ],
      clues: [
        {
          id: `${c.id}-finance`,
          text: "A requisição Z-17 preservada no dia 5 financia a escolta de Sergei Sokolov; a rubrica é de Pavel Serebrov.",
          key: `${c.id}-cadeia`,
          value: "Z-17",
          source: "Cópia financeira preservada",
        },
      ],
    });
  return {
    ...c,
    documents,
    minimumSources: c.day >= 16 ? 3 : c.minimumSources,
  };
}
