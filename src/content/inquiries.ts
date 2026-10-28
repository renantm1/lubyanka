import type { Case, Document, Game } from "../game/types";

export interface InquiryOption {
  route: "formal" | "reserved";
  label: string;
  contact: string;
  title: string;
  author: string;
  paragraphs: string[];
  clue: string;
  response: string;
  followup: string;
}
type Source = Omit<InquiryOption, "route" | "contact">;
interface Inquiry {
  subject: string;
  contact: string;
  formal: Source;
  reserved: Source;
}
// Fontes independentes do registro central. Cada via apura o mesmo fato por outro caminho.
const inquiries: Record<number, Inquiry> = {
  1: {
    subject: "Alexei Mirov",
    contact: "irina",
    formal: {
      label: "Requisitar o livro da distribuição elétrica",
      title: "Livro de manobras · subestação de Tula",
      author: "Eletricista Galina Voronina",
      paragraphs: [
        "31/10/1983, 20h48: Alexei Mirov pediu o desligamento do circuito da oficina de Tula. Às 21h12, assinou a devolução da chave após o reparo. Os horários pertencem ao relógio da subestação, conferido por telefone às 18h.",
        "O livro é guardado fora da oficina. A cópia foi feita em resposta a uma requisição nominal do departamento.",
      ],
      clue: "Mirov assinou a devolução da chave em Tula às 21h12 de 31/10/1983, após pedir o corte às 20h48.",
      response:
        "A subestação entregou o livro de manobras. O nome de Galina consta na requisição; o documento pode corroborar o ponto de Tula.",
      followup:
        "Galina foi chamada a explicar por que seu livro apareceu numa apuração em Moscou. Ela mantém os horários e pede uma cópia do recibo da requisição.",
    },
    reserved: {
      label: "Pedir a Irina o recibo da farmácia de Tula",
      title: "Recibo de balcão · farmácia de Tula",
      author: "Farmacêutica Lidia Orlova",
      paragraphs: [
        "A via de caixa registra o atendimento pessoal de Alexei Mirov às 21h05 de 31/10/1983. O medicamento exigia assinatura do comprador. Lidia reconhece a assinatura e conserva o canhoto numerado F-31.",
        "Irina recebeu uma cópia sem o endereço residencial da farmacêutica. O original permanece no livro da farmácia; não é uma reprodução do ponto da oficina.",
      ],
      clue: "F-31: Alexei Mirov assinou pessoalmente a compra de remédios em Tula às 21h05 de 31/10/1983.",
      response:
        "Irina trouxe F-31. A origem pode ser conferida, mas você terá de explicar por que a consulta passou fora da requisição oficial.",
      followup:
        "Lidia guardou o original F-31. Aceita confirmar a venda se for chamada formalmente, mas não autoriza circular o endereço da família.",
    },
  },
  3: {
    subject: "Vera Kuznetsova",
    contact: "nadia",
    formal: {
      label: "Ouvir o intermediário sob protocolo",
      title: "Termo do intermediário · lote M-08",
      author: "Escrivão Anatoli Belov",
      paragraphs: [
        "O intermediário apresenta a via de compra de doze ampolas M-08, assinada por Vera. A guia do transportador registra a coleta na mesma data; nenhum volume retornou à clínica.",
        "Ele confirma ter pago pelo lote. O protocolo conserva seu nome e o local de trabalho. A destinação do dinheiro não é comprovada por este depoimento.",
      ],
      clue: "A guia do transportador e a via do comprador confirmam a entrega de doze ampolas M-08 por Vera.",
      response:
        "O termo e a guia de coleta chegaram. Confirmam a venda, sem transformar a necessidade de aquecimento em prova de autorização.",
      followup:
        "O intermediário foi intimado para nova oitiva. A clínica pede que a revisão inclua as receitas não atendidas; a falta de tratamento continua documentada.",
    },
    reserved: {
      label: "Pedir a Nadia a via guardada pelo motorista",
      title: "Canhoto de coleta · motorista do lote M-08",
      author: "Motorista Stepan Iliev",
      paragraphs: [
        "Stepan guardou um canhoto do frete: doze ampolas M-08 saíram da clínica, entregues por Vera ao comprador. O peso e a numeração foram anotados antes de o livro de vendas ser apreendido.",
        "O motorista confirma o transporte, não o motivo da enfermeira. Nadia omitiu o endereço da garagem da cópia de circulação; o canhoto original permanece identificável.",
      ],
      clue: "O canhoto de Stepan registra a coleta das doze ampolas M-08 entregues por Vera ao comprador.",
      response:
        "Nadia trouxe o canhoto do frete por um canal reservado. A entrega é verificável; a consulta ainda não passou pela chefia.",
      followup:
        "Stepan conserva o canhoto e pede que a garagem não seja usada como ponto de encontro. A equipe da clínica continua cobrando os medicamentos que faltaram.",
    },
  },
  8: {
    subject: "Anna Lebedeva",
    contact: "mikhail",
    formal: {
      label: "Ouvir o recepcionista sob protocolo",
      title: "Termo de recepção · cópia N-08",
      author: "Escrivã Larisa Vetrova",
      paragraphs: [
        "O recepcionista que estava no balcão às 17h reconhece Anna Lebedeva e descreve a entrega de N-08. Ele anotou o número no livro de portaria antes de encaminhar a portadora à recepção. A escala confirma seu turno; o livro não é uma cópia do recibo apreendido.",
        "A oitiva nominal corrobora a entrega por outra testemunha; não demonstra que Anna agiu sem coação. A ameaça contra o filho deve ser examinada em fonte própria.",
      ],
      clue: "O recepcionista e seu livro de portaria identificam Anna como portadora de N-08 às 17h.",
      response:
        "O termo do recepcionista e seu registro de portaria corroboram a entrega. O pedido nominal passa a integrar a circulação oficial.",
      followup:
        "A recepção pediu a lista de pessoas autorizadas a consultar N-08. A escola do filho de Anna continua sem autorização para divulgar o endereço da criança.",
    },
    reserved: {
      label: "Pedir a Orlov o registro do mensageiro",
      title: "Caderno do mensageiro · N-08",
      author: "Mensageiro Ilya Savin",
      paragraphs: [
        "Ilya anotou N-08 antes de acompanhá-la ao balcão. Anna apresentou o próprio documento e assinou a entrega às 17h. O caderno conserva a impressão do carbono da folha anterior, sem cópia do recibo apreendido.",
        "Orlov entregou a via sem identificar os outros passageiros do trajeto. A confirmação da entrega não elimina a ameaça contra o filho de Anna.",
      ],
      clue: "O caderno de Ilya confirma que Anna apresentou documento e assinou a entrega de N-08 às 17h.",
      response:
        "Orlov trouxe a anotação do mensageiro. Os demais passageiros ficaram fora da cópia; a origem continua sujeita a conferência.",
      followup:
        "O mensageiro não fará outra viagem para esse balcão. Mantém a anotação original e pede que a rede não prometa uma proteção que ainda não consegue oferecer.",
    },
  },
  17: {
    subject: "Irina Sokolova",
    contact: "nadia",
    formal: {
      label: "Requisitar o inventário do depósito externo",
      title: "Inventário externo · lacre A-17",
      author: "Depositária Marina Kareva",
      paragraphs: [
        "A depositária registrou o lacre A-17 intacto antes do acesso posterior atribuído à credencial de Karpov. O inventário transcreve as entradas de Z-17 na mesma ordem preservada pelas notas de Irina.",
        "A verificação ocorreu no depósito, sem consultar o arquivo central já alterado. A requisição identifica a depositária e o lugar onde a via permanece guardada.",
      ],
      clue: "O inventário externo A-17, anterior ao acesso de Karpov, coincide com as notas de Irina sobre Z-17.",
      response:
        "O depósito entregou seu inventário. Ele permite conferir a versão anterior por uma guarda independente do arquivo central.",
      followup:
        "O depósito recebeu ordem de registrar todos os visitantes de A-17. Marina recusou substituir a folha anterior por uma via sem data.",
    },
    reserved: {
      label: "Pedir a Nadia a fotografia anterior à alteração",
      title: "Contato fotográfico · arquivo A-17",
      author: "Agente Nadia Belova",
      paragraphs: [
        "A sequência do rolo A-17 mostra a página de entradas antes de o lacre ser rompido. A numeração nas bordas acompanha as fotografias do inventário externo; os nomes coincidem com as notas de Irina.",
        "Nadia manteve o negativo fora da sala em que a credencial de Karpov foi usada. A cópia não traz a localização atual do negativo.",
      ],
      clue: "O rolo A-17 fotografa, antes da ruptura do lacre, a versão que coincide com as notas de Irina.",
      response:
        "Nadia entregou o contato fotográfico. A localização do negativo ficou reservada, mas a sequência do rolo permite verificar sua origem.",
      followup:
        "Nadia mudou a guarda do negativo A-17. A cópia continua disponível; ela pede que nenhuma visita seja anunciada pelo ramal do gabinete.",
    },
  },
  22: {
    subject: "Viktor Volkov",
    contact: "irina",
    formal: {
      label: "Requisitar o recibo do setor de transporte",
      title: "Recibo do transporte · anexo V-22",
      author: "Despachante Valentina Smirnova",
      paragraphs: [
        "Valentina recebeu a ordem V-22 com a página dos onze pacientes rubricada por Volkov. O recibo do setor discrimina os passageiros e foi emitido antes da saída do veículo.",
        "O recibo preservado pelo transporte não depende da cópia do gabinete. A requisição leva o nome do analista e será comunicada à autoridade que assinou a ordem.",
      ],
      clue: "O transporte recebeu V-22 com os onze pacientes identificados e a página rubricada por Volkov antes da saída.",
      response:
        "O transporte entregou o recibo. Volkov será informado de quem requisitou a via que identifica os pacientes.",
      followup:
        "O gabinete perguntou por que o recibo V-22 foi requisitado. Valentina preservou o protocolo de entrada da sua ordem e exige que sua via também seja conservada.",
    },
    reserved: {
      label: "Pedir a Irina a folha guardada pela datilógrafa",
      title: "Carbono da datilógrafa · V-22",
      author: "Datilógrafa Alina Korotkova",
      paragraphs: [
        "Alina conservou a folha de carbono do anexo V-22. Os onze pacientes já estavam datilografados quando o coronel rubricou a página. A pressão da rubrica atravessa o carbono no espaço correspondente ao nome de Volkov.",
        "Irina conferiu a numeração e retirou o endereço residencial de Alina da cópia. A folha não é uma reprodução do registro central: saiu da máquina antes da circulação da ordem.",
      ],
      clue: "O carbono V-22 conserva os onze pacientes e a pressão da rubrica de Volkov feita depois da datilografia.",
      response:
        "Irina trouxe o carbono. A cópia resguarda o endereço da datilógrafa e conserva a identificação necessária para conferir a origem.",
      followup:
        "Alina deixou de datilografar anexos de transporte. O carbono V-22 continua guardado; ela não autoriza que seu endereço acompanhe uma denúncia pública.",
    },
  },
  28: {
    subject: "Elena Morozova",
    contact: "nadia",
    formal: {
      label: "Requisitar a conferência nominal ao cartório",
      title: "Conferência nominal · onze famílias",
      author: "Registradora Nina Vorontsova",
      paragraphs: [
        "O cartório conferiu os onze nomes da lista com registros civis anteriores à operação. As identidades existem e coincidem com as fichas médicas e as notas de escolta; não foram inventadas para a edição.",
        "A requisição nominal gera um registro oficial de acesso. Os endereços ficam no cartório e não integram a certidão de conferência.",
      ],
      clue: "Os onze nomes da lista conferem com registros civis anteriores à operação e com a documentação de transporte e clínica.",
      response:
        "A certidão confirma os nomes sem copiar os endereços. O cartório registra quem pediu a conferência das onze famílias.",
      followup:
        "O cartório recebeu pedidos de acesso aos endereços após a conferência. Nina reteve os pedidos sem autorização; a certidão nominal continua válida.",
    },
    reserved: {
      label: "Pedir a Nadia a conferência com as famílias",
      title: "Conferência reservada · onze nomes",
      author: "Agente Nadia Belova",
      paragraphs: [
        "Nadia comparou os nomes com certidões guardadas por três famílias e com as vias de transporte que elas receberam. Os registros são anteriores à edição; as identidades e os números de matrícula coincidem.",
        "A cópia conserva a referência de cada certidão e omite os endereços. As famílias aceitam confirmar as identidades por um canal que não publique sua localização.",
      ],
      clue: "Certidões anteriores à edição e vias de transporte guardadas pelas famílias confirmam os onze nomes publicados.",
      response:
        "Nadia entregou a conferência reservada. Os endereços ficaram com as famílias; a consulta não tem a autorização habitual da chefia.",
      followup:
        "As famílias autorizaram a confirmação dos nomes por Nadia. Pedem ser consultadas antes de qualquer encontro com uma comissão; reconhecer um nome não equivale a aceitar exposição pública.",
    },
  },
};

export function inquiryOptions(c: Case): InquiryOption[] {
  if (c.id !== `story-${c.day}`) return [];
  const data = inquiries[c.day];
  if (
    !data ||
    (c.subject !== data.subject &&
      !(c.day === 28 && c.subject === "Daria Rozanova"))
  )
    return [];
  return (["formal", "reserved"] as const).map((route) => {
    const option = { ...data[route], route, contact: data.contact };
    if (c.day === 28 && c.subject === "Daria Rozanova") {
      // A autenticidade dos nomes não absolve Daria da impressão que realizou.
      option.paragraphs = [
        ...option.paragraphs,
        "A prova P-28 conserva as correções de Daria Rozanova e coincide com a edição recolhida. As fontes confirmam a impressão por Daria; a autenticidade dos nomes é uma questão separada.",
      ];
      option.clue =
        "As correções de Daria na prova P-28 correspondem à edição recolhida; os onze nomes têm confirmação independente.";
    }
    return option;
  });
}

export function withInquiryDocuments(c: Case, g: Game): Case {
  const record = g.inquiries.find((r) => r.caseId === c.id && r.day === c.day);
  if (!record) return c;
  const proof = c.documents.find((d) => d.id === `${c.id}-record`)?.clues[0];
  if (!proof) return c;
  return {
    ...c,
    documents: [
      ...c.documents.map(
        (d): Document =>
          d.id === `${c.id}-annex`
            ? {
                ...d,
                unlockAlternatives: [
                  {
                    a: proof.id,
                    b: record.document.clues[0].id,
                    relation: "support",
                  },
                ],
              }
            : d,
      ),
      record.document,
    ],
  };
}
