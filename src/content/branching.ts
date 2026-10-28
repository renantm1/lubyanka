import { beats } from "./campaign";
import type { Beat, Game } from "../game/types";

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
  return base;
}
