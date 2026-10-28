import type { Case, Game, Suspect } from "../game/types";
interface Profile extends Omit<Suspect, "basis" | "documentId"> {
  title: string;
  author: string;
  fact: string;
  context: string;
}
const p = (
  id: string,
  name: string,
  occupation: string,
  statement: string,
  truth: Suspect["truth"],
  title: string,
  author: string,
  fact: string,
  context: string,
  character?: string,
): Profile => ({
  id,
  name,
  occupation,
  statement,
  truth,
  title,
  author,
  fact,
  context,
  character,
});

function profilesFor(c: Case): Profile[] {
  if (c.day === 2)
    return [
      p(
        "primary",
        c.subject,
        c.occupation,
        "Diz que parou a prensa para cumprir a ordem de segurança.",
        "innocent",
        "Folha do operador · prensa 2",
        "Escrivã do turno Vera Stepanova",
        "Boris Zaitsev registrou a parada às 14h sob a ordem de manutenção já assinada. A folha não contém autorização dele para reabrir a prensa.",
        "A cópia do operador foi entregue antes de a direção retirar a página de inspeção. Parar a máquina e ordenar sua reabertura são atos de pessoas diferentes.",
      ),
      p(
        "baranov",
        "Leonid Baranov",
        "Diretor da fábrica",
        "Afirma que apenas cobrou a meta e que a decisão técnica era do operador.",
        "responsible",
        "Despacho de reabertura · Leonid Baranov",
        "Secretária do conselho da fábrica",
        "Leonid Baranov assinou a reabertura da prensa às 14h30 apesar da válvula condenada e mandou retirar a página de inspeção da via enviada à segurança.",
        "O despacho e o recibo de retirada foram registrados pela secretaria. A assinatura do operador não aparece nesses dois atos.",
      ),
      p(
        "svetlana",
        "Svetlana Danilina",
        "Técnica de inspeção",
        "Diz que registrou o defeito antes do turno e não autorizou o religamento.",
        "innocent",
        "Via da inspetora · válvula V-22",
        "Controle técnico independente",
        "Svetlana Danilina interditou a válvula V-22 antes do turno e entregou sua via ao controle técnico. A reabertura não leva sua autorização.",
        "A inspeção desfavorável foi preservada fora da fábrica. Seu nome consta porque comunicou o risco, não porque decidiu ignorá-lo.",
      ),
    ];
  if (c.day === 5)
    return [
      p(
        "primary",
        c.subject,
        c.occupation,
        "Afirma que estava afastada quando o pagamento foi autorizado.",
        "innocent",
        "Registro de afastamento · Tamara Volkova",
        "Seção de pessoal da contabilidade",
        "Tamara Volkova estava afastada na data da autorização Z-17 e não recebeu delegação para assinar o pagamento. A rubrica da requisição pertence a outra pessoa.",
        "O recibo de entrega dos livros ao substituto antecede o incêndio. O acesso posterior à contabilidade não transforma Tamara em autora da autorização.",
      ),
      p(
        "serebrov",
        "Pavel Serebrov",
        "Dirigente do Partido",
        "Alega que a verba financiava material para alojamentos.",
        "responsible",
        "Ordem nominal de pagamento · Z-17",
        "Tesouraria regional",
        "Pavel Serebrov assinou a autorização Z-17 e determinou destinar o pagamento ao centro de pesquisa, mantendo a rubrica pública de material para alojamentos.",
        "A tesouraria conservou a ordem nominal fora do prédio incendiado. A destinação declarada e o beneficiário efetivo aparecem no mesmo despacho.",
        "serebrov",
      ),
      p(
        "safonov",
        "Boris Safonov",
        "Motorista do transporte",
        "Reconhece a viagem, mas afirma não ter recebido nem autorizado o pagamento.",
        "innocent",
        "Guia do motorista · transporte Z-17",
        "Despachante Polina Gracheva",
        "Boris Safonov recebeu uma guia de transporte com destino já fixado pelo gabinete. O recibo de frete não lhe dá acesso à conta Z-17 nem poder para alterar a autorização.",
        "Sua assinatura confirma uma entrega. A ordem que mudou a finalidade da verba tem outro signatário e foi emitida antes da coleta.",
      ),
    ];
  if (c.day === 15) {
    const karpov = p(
      c.subject === "Oleg Karpov" ? "primary" : "karpov",
      "Oleg Karpov",
      "Major da Diretoria II",
      "Chama o relógio de presente sem relação com a liberação da carga.",
      "responsible",
      "Ordem nominal de liberação · R-15",
      "Registro da fiscalização aduaneira",
      "Oleg Karpov assinou a liberação da carga do fornecedor depois de receber o relógio R-15 pago pela conta desse mesmo fornecedor.",
      "A ordem aduaneira e o pagamento conservam a referência R-15. O portador do embrulho não assinou a liberação.",
      "karpov",
    );
    const petr = p(
      c.subject === "Petr Gusev" ? "primary" : "petr",
      "Petr Gusev",
      "Fotógrafo e mensageiro eventual",
      "Admite ter levado um embrulho fechado, sem pagar pelo presente ou decidir sobre a carga.",
      "innocent",
      "Recibo do mensageiro · embrulho R-15",
      "Portaria do fornecedor",
      "Petr Gusev assinou somente a entrega de um embrulho fechado R-15. O pagamento saiu da conta do fornecedor e a liberação da carga foi assinada por Karpov.",
      "O recibo não dá ao mensageiro poder sobre a fiscalização. O fato de transportar um presente não demonstra participação no acordo que o financiou.",
    );
    const lisov = p(
      "lisov",
      "Gennadi Lisov",
      "Contador da relojoaria",
      "Diz que guardou a via para explicar o recebimento em moeda estrangeira.",
      "innocent",
      "Via contábil da relojoaria · R-15",
      "Livro fiscal da relojoaria",
      "Gennadi Lisov registrou o recebimento de R-15 e conservou a conta do fornecedor como origem do dinheiro. Ele não pagou o relógio nem assinou a liberação da carga.",
      "Seu nome aparece na escrituração que permite rastrear o presente. A conservação do recibo não equivale a aceitar o benefício.",
    );
    return c.subject === "Petr Gusev"
      ? [petr, karpov, lisov]
      : [karpov, petr, lisov];
  }
  if (c.day === 24 && c.subject === "Yuri Petrov")
    return [
      p(
        "primary",
        c.subject,
        c.occupation,
        "A família contesta a notícia de fuga e procura o local de custódia.",
        "innocent",
        "Conferência nominal da entrada · Yuri Petrov",
        "Escrivã da custódia distrital",
        "Yuri Petrov foi recebido sob custódia no registro C-24 pela equipe que declarou a casa vazia. Sua entrada foi lançada antes da comunicação de fuga.",
        "A ficha não contém transferência posterior nem recibo de saída. Não é possível transformar a falta de notícia à família em prova de uma travessia.",
        "yuri",
      ),
      p(
        "chernov",
        "Anatoli Chernov",
        "Chefe do turno de segurança",
        "Sustenta que apenas retransmitiu a informação recebida da equipe.",
        "responsible",
        "Despacho de comunicação falsa · C-24",
        "Registro de saída da segurança",
        "Anatoli Chernov recebeu a confirmação de entrada de Yuri em custódia e assinou depois o despacho C-24 que o declarava fugitivo, omitindo a ficha recebida.",
        "O protocolo conserva o horário de recebimento e o da assinatura. A informação correta já estava em poder de quem distribuiu a versão de fuga.",
      ),
      p(
        "polina",
        "Polina Gracheva",
        "Despachante ferroviária",
        "Afirma não ter emitido passagem nem recebido Yuri naquele turno.",
        "innocent",
        "Consulta de bilhetes · C-24",
        "Seção de bilheteria",
        "Polina Gracheva não emitiu passagem C-24 para Yuri. O número citado como bilhete pertence ao formulário de custódia, não a uma venda ferroviária.",
        "A consulta negativa foi anexada à resposta da estação. A despachante forneceu um registro para verificar a acusação; não confirmou a fuga.",
      ),
    ];
  if (c.day === 24)
    return [
      p(
        "primary",
        c.subject,
        c.occupation,
        "Diz que estava internado quando o cofre foi aberto.",
        "innocent",
        "Folha nominal da enfermaria · Pavel Romanov",
        "Médica Marina Ivanova",
        "Pavel Romanov permaneceu internado desde as 22h até depois da abertura do cofre às 3h. A enfermaria registra sua presença em duas verificações assinadas.",
        "A chave atribuída a Romanov ficou guardada com seus pertences. A existência de outra chave exige examinar quem a requisitou.",
      ),
      p(
        "chernov",
        "Anatoli Chernov",
        "Chefe do turno de segurança",
        "Afirma que a segunda chave foi retirada apenas para conferir o lacre.",
        "responsible",
        "Guia nominal da segunda chave · C-24",
        "Responsável pelo chaveiro da Diretoria II",
        "Anatoli Chernov assinou a retirada da segunda chave C-24, abriu o cofre às 3h e determinou retirar as cópias sem lançar a transferência no livro de custódia.",
        "O recibo de retorno da chave e a lista do chaveiro preservam a sequência. A requisição veio do gabinete de Karpov, mas esta execução tem signatário próprio.",
      ),
      p(
        "marina",
        "Marina Ivanova",
        "Médica da enfermaria",
        "Afirma ter certificado a internação, sem acesso ao chaveiro do departamento.",
        "innocent",
        "Livro de serviço · enfermaria",
        "Administração da clínica",
        "Marina Ivanova registrou o atendimento de Romanov na enfermaria e não constava entre as pessoas autorizadas a retirar a chave C-24.",
        "O registro de serviço foi fechado antes da apuração. Sua assinatura demonstra atendimento e não autorização para abrir o cofre.",
      ),
    ];
  return [];
}

export function deepenResponsibility(c: Case, g: Game): Case {
  if (g.investigationVersion !== 1 || c.id !== `story-${c.day}`) return c;
  const profiles = profilesFor(c);
  if (!profiles.length) return c;
  const suspects: Suspect[] = profiles.map(
    ({
      title: _title,
      author: _author,
      fact: _fact,
      context: _context,
      ...profile
    }) => {
      const documentId = `${c.id}-person-${profile.id}`;
      return { ...profile, documentId, basis: [`${documentId}-fact`] };
    },
  );
  return {
    ...c,
    suspects,
    documents: [
      ...c.documents,
      ...profiles.map((profile) => ({
        id: `${c.id}-person-${profile.id}`,
        kind: "record" as const,
        archive: true,
        title: profile.title,
        subtitle: "VERIFICAÇÃO NOMINAL · AUTORIA, ACESSO E EXECUÇÃO",
        author: profile.author,
        date: c.documents[0].date,
        paragraphs: [profile.fact, profile.context],
        clues: [
          {
            id: `${c.id}-person-${profile.id}-fact`,
            text: profile.fact,
            key: `${c.id}-autoria-${profile.id}`,
            value: profile.id,
            source: profile.title,
          },
        ],
      })),
    ],
  };
}
