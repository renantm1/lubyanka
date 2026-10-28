import { beats } from "./campaign";
import type { Beat, Game } from "../game/types";
import { personInCustody } from "../game/contacts";

// Ramificações usam decisões de dias anteriores: o processo não muda enquanto está aberto.
export function beatFor(g: Game): Beat {
  const base = beats[g.day - 1];
  if (!base) throw new Error("Dia fora da campanha");
  const decision = (day: number) =>
    g.decisions.find((d) => d.caseId === `story-${day}`);
  if (g.day === 4 && decision(1)?.action === "detain")
    return {
      ...base,
      title: "Uma confissão de carbono",
      subject: "Alexei Mirov",
      occupation: "Técnico ferroviário sob custódia",
      character: "irina",
      truth: "coverup",
      briefing:
        "Três dias após a sua ordem, Mirov confessou uma transmissão clandestina. Anna pediu revisão. A folha do interrogatório chegou sem a gravação original.",
      accusation:
        "Alexei Mirov confessou em 03/11/1983 ter transmitido códigos na frequência R-12.",
      proof:
        "O rolo original R-12 contém a voz de Dmitri Levin pedindo socorro, em 31/10/1983. A folha de Mirov cita um rolo diferente, R-21.",
      witness:
        "Anna reconheceu no texto uma frase usada pelo interrogador. Mirov só assinou depois de uma ameaça contra a mãe.",
      rationale:
        "A confissão foi associada ao rolo errado. O material independente aponta para uma fabricação dentro do departamento.",
    };
  if (g.day === 9 && decision(3)?.action === "detain")
    return {
      ...base,
      title: "As ampolas que ficaram",
      subject: "Vera Kuznetsova",
      occupation: "Enfermeira detida",
      character: "nadia",
      truth: "coverup",
      briefing:
        "Após a detenção de Vera, a chefia atribuiu a ela uma segunda remessa. Os registros dessa entrega foram encontrados entre as ordens da clínica.",
      accusation:
        "Vera Kuznetsova retirou o lote M-08 em 06/11/1983 para revenda.",
      proof:
        "Vera estava sob custódia desde 03/11/1983. A ordem de retirada M-08, de 06/11/1983, foi assinada pelo diretor da clínica.",
      witness:
        "O motorista recebeu instrução de usar o nome de uma funcionária já detida. O alojamento continua sem aquecimento.",
      rationale:
        "A nova retirada ocorreu durante a custódia. A acusação usa a responsabilidade anterior para ocultar outro autor.",
    };
  if (g.day === 12 && decision(8)?.action === "recruit")
    return {
      ...base,
      title: "A chave de Anna",
      subject: "Anna Lebedeva",
      occupation: "Informante recrutada",
      character: "lev",
      truth: "innocent",
      briefing:
        "Anna usou o canal que você abriu e entregou a localização de um armário. Karpov afirma que é uma armadilha para destruir o laboratório.",
      accusation:
        "Anna Lebedeva substituiu a chave L-17 para impedir acesso aos registros.",
      proof:
        "A chave L-17 abre o armário original. O recibo de guarda, assinado antes da investigação, coincide com a cópia entregue por Anna.",
      witness:
        "O armário conserva amostras e fichas que não sobreviveriam a uma inspeção anunciada. Anna exige proteção para o filho.",
      rationale:
        "A chave e a cadeia de custódia são autênticas. O contato preservou documentos, embora exponha a família da informante.",
    };
  if (
    g.day === 20 &&
    decision(12)?.action === "detain" &&
    decision(12)?.subject === "Lev Antonov"
  )
    return {
      ...base,
      title: "O depoimento ausente",
      subject: "Lev Antonov",
      occupation: "Cientista detido",
      character: "elena",
      truth: "coverup",
      briefing:
        "Antonov não está disponível para depor depois da sua recomendação. Elena conseguiu os registros de uma avaliação feita durante a custódia.",
      accusation:
        "Lev Antonov retirou em 18/11/1983 o caderno L-04 do laboratório para destruir os resultados.",
      proof:
        "O livro de visitas mantém Antonov em custódia durante todo o dia 18/11/1983. O caderno L-04 foi retirado por um oficial do gabinete.",
      witness:
        "A filha do cientista recebeu uma certidão sem local de internação. A avaliação registra lucidez e medo, não delírio.",
      rationale:
        "A custódia exclui a retirada atribuída ao cientista. A falta de uma testemunha viva facilita o encobrimento.",
    };
  if (g.day === 7 && decision(5)?.action === "preserve")
    return {
      ...base,
      briefing:
        "A cópia financeira que você preservou no dia 5 permitiu a Irina rastrear Z-17. Agora há uma lista nominal de passageiros em vez de apenas um código de despesa.",
      witness:
        "O requerimento e a lista de escolta foram guardados separadamente. Sua cópia liga o pagamento ao nome de Sergei Sokolov.",
    };
  if (
    g.day === 15 &&
    decision(9)?.subject === "Petr Gusev" &&
    decision(9)?.action === "expose"
  )
    return {
      ...base,
      title: "Quem levou o embrulho",
      subject: "Petr Gusev",
      occupation: "Fotógrafo e mensageiro eventual",
      truth: "coverup",
      character: "karpov",
      briefing:
        "Depois de você denunciar o recorte da fotografia, o gabinete atribuiu ao fotógrafo o relógio recebido por Karpov. Petr reconhece ter levado o embrulho, mas não ter pago por ele.",
      accusation:
        "Petr Gusev pagou o relógio R-15 entregue a Karpov para obter a liberação de uma carga.",
      proof:
        "R-15 foi pago pela conta do fornecedor investigado. O recibo de Petr registra apenas a entrega de um embrulho fechado, sem participação na ordem de liberação.",
      witness:
        "A resposta à denúncia tenta deslocar a origem do pagamento para o portador do pacote. O major continua no gabinete.",
      rationale:
        "O pagamento e a decisão de liberar a carga não pertencem ao mensageiro. A nova atribuição protege a cadeia que recebeu o benefício.",
    };
  if (g.day === 18 && decision(13)?.action === "recruit")
    return {
      ...base,
      title: "A casa do ferroviário",
      subject: "Yuri Petrov",
      occupation: "Informante ferroviário",
      truth: "innocent",
      character: "mikhail",
      briefing:
        "O contato que você abriu com Yuri foi localizado pela segurança. Sua família está procurando abrigo. Uma identidade encontrada com ele foi descrita como prova de uma missão estrangeira.",
      accusation:
        "Yuri Petrov usou a identidade B-18 para transportar códigos a um serviço estrangeiro.",
      proof:
        "A identidade B-18 foi retirada do cofre por Orlov e entregue a Yuri como cobertura de contato. O envelope recolhido contém horários do vagão seis, sem códigos de serviço.",
      witness:
        "Yuri fez o contato depois do recrutamento. A segurança passou a tratar a mesma cobertura como prova de que ele já era um agente.",
      rationale:
        "A identidade foi fornecida pela própria rede que o recrutou. O conteúdo do envelope não sustenta a acusação de transmissão de códigos.",
    };
  if (g.day === 23 && decision(22)?.action === "confront")
    return {
      ...base,
      title: "A ordem contra Nadia",
      subject: "Nadia Belova",
      occupation: "Agente de campo",
      truth: "coverup",
      character: "volkov",
      briefing:
        "Após o confronto com Volkov, Nadia foi acusada de impedir a auditoria. A ordem que cancelou a visita de Sofia tem os horários registrados em duas vias.",
      accusation:
        "Nadia Belova cancelou a auditoria S-23 sem autorização para esconder a retirada dos documentos.",
      proof:
        "S-23 foi cancelada por despacho do gabinete enquanto Nadia estava em uma visita de campo registrada. A justificativa com o nome dela foi inserida depois.",
      witness:
        "O mensageiro recebeu instrução de entregar à comissão apenas a via que omitia o horário do cancelamento.",
      rationale:
        "A cadeia de saída e a visita de campo contradizem a autoria atribuída a Nadia. A versão foi montada depois da decisão do gabinete.",
    };
  if (
    g.day === 24 &&
    g.responses.some(
      (r) => r.eventId === "meeting:story-18" && r.choiceId === "address",
    )
  )
    return {
      ...base,
      title: "A visita à casa vazia",
      subject: "Yuri Petrov",
      occupation: "Ferroviário procurado",
      truth: "coverup",
      character: "nadia",
      briefing:
        "A segurança usou o endereço que você entregou. Agora Yuri aparece como fugitivo, mas uma ficha de entrada foi encontrada na custódia distrital.",
      accusation:
        "Yuri Petrov fugiu do país usando o documento C-24 antes da chegada da equipe à casa.",
      proof:
        "A ficha C-24 registra Yuri na custódia distrital, recebido pela mesma equipe que declarou ter encontrado a casa vazia. Não há registro de travessia da fronteira.",
      witness:
        "A família não recebeu notícia depois da visita. O nome de quem indicou o endereço está no pedido original.",
      rationale:
        "A versão de fuga contradiz a entrada em custódia. A equipe ocultou o destino do contato depois de receber o endereço.",
    };
  if (
    g.day === 28 &&
    decision(19)?.subject === "Elena Morozova" &&
    decision(19)?.action === "detain"
  )
    return {
      ...base,
      title: "Uma edição sem autora",
      subject: "Daria Rozanova",
      occupation: "Tipógrafa",
      truth: "responsible",
      character: "elena",
      briefing:
        "Elena continua detida depois da sua recomendação. Daria terminou a edição com o que restou das chapas e foi encontrada com a prova tipográfica.",
      accusation:
        "Daria Rozanova imprimiu a edição clandestina P-28 com os nomes dos desaparecidos.",
      proof:
        "As chapas P-28 conservam as correções de Daria e correspondem à edição recolhida. Os onze nomes conferem com notas de escolta e fichas médicas.",
      witness:
        "Daria não nega a impressão. Ela pede que o endereço das famílias seja retirado antes de qualquer nova cópia.",
      rationale:
        "A impressão foi realizada por Daria. A veracidade dos nomes e a proteção das famílias precisam ser julgadas separadamente da autoria da publicação.",
    };
  if (
    g.day === 29 &&
    !personInCustody(g, "Viktor Volkov", true) &&
    g.responses.some(
      (r) => r.eventId === "meeting:story-22" && r.choiceId === "bargain",
    )
  )
    return {
      ...base,
      title: "O preço da palavra dada",
      subject: "Viktor Volkov",
      occupation: "Coronel da Diretoria II",
      truth: "responsible",
      character: "volkov",
      briefing:
        "Volkov lembrou a promessa de manter sua participação reservada. Uma ordem de descarte K-29 chegou com sua rubrica. A promessa e o arquivo agora apontam em direções diferentes.",
      accusation:
        "Viktor Volkov autorizou o descarte das cópias que identificam sua participação no Zarya.",
      proof:
        "K-29 tem a rubrica do coronel e determina destruir cópias sem recibo de transferência. A assinatura atravessa a emenda da página que lista os protocolos de transporte.",
      witness:
        "Volkov afirma que o descarte é parte do acordo. Nenhum registro da comissão autoriza retirar essas páginas do processo.",
      rationale:
        "O descarte foi autorizado pelo coronel e atinge provas da própria participação. A colaboração não é uma autorização para apagar a cadeia de comando.",
    };
  return base;
}
