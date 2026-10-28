import type { Game } from "../game/types";
import { characters } from "./characters";
const answer = (g: Game, id: string, choice: string) =>
  g.responses.some(
    (r) => r.eventId === `meeting:story-${id}` && r.choiceId === choice,
  );
function custody(g: Game, name: string) {
  return (
    g.decisions
      .filter(
        (d) =>
          d.subject === name &&
          (d.action === "detain" || d.action === "release"),
      )
      .at(-1)?.action === "detain"
  );
}
export function characterEpilogue(g: Game, id: string): string {
  const c = characters.find((x) => x.id === id);
  if (!c) return "";
  const name = c.name.replace(/^(Coronel |Major |Dr\. )/, "");
  const close = g.relations[id].trust >= 60;
  const arrested =
    custody(g, name) ||
    (id === "yuri" &&
      answer(g, "18", "address") &&
      !g.decisions.some(
        (d) =>
          d.day >= 24 && d.subject === "Yuri Petrov" && d.action === "release",
      ));
  if (arrested) {
    const held: Record<string, string> = {
      volkov:
        "Volkov perdeu o gabinete e passou a responder pelas ordens que assinou. Sua família recebeu apenas o número do processo. As outras assinaturas da cadeia não desapareceram com a dele.",
      irina:
        "O fichário de Irina foi lacrado depois de sua detenção. O registro do irmão permaneceu dentro dele. As cópias que ela já havia separado são agora o único caminho para continuar a busca.",
      mikhail:
        "Orlov deixou de atender os contatos. A ordem de custódia encerrou seu trabalho no departamento, mas não informou o destino das pessoas abrigadas pela rede.",
      nadia:
        "Nadia foi afastada e colocada sob custódia. As famílias que dependiam de suas visitas perderam o canal de notícias. O nome dela sobrevive nas ordens de campo que você preservou.",
      elena:
        "Elena não viu a última edição fora da custódia. A gráfica continuou sem sua autora. O que circulou depois dependeu das chapas e das pessoas que você deixou livres.",
      serebrov:
        "Serebrov foi detido, e suas contas passaram à comissão. Os recibos permitiram identificar o desvio, mas não devolveram os anos nem as moradias às famílias prejudicadas.",
      lev: "Antonov continuou sob custódia depois da sua ordem. A filha recebeu notícia por uma via indireta. Os cadernos podem sustentar uma investigação, mas não substituem a voz que foi retirada dela.",
      yuri: "Yuri permaneceu na custódia distrital. A família continuou procurando um destino que a versão de fuga havia apagado. O endereço entregue à segurança não pôde ser retirado da ordem depois da visita.",
      karpov:
        "Karpov perdeu acesso ao arquivo e recebeu uma ficha de custódia em seu próprio nome. Os relatórios que adulterou continuaram existindo, com as assinaturas e os destinatários que os fizeram circular.",
    };
    return held[id];
  }
  switch (id) {
    case "irina":
      return g.ending === "reformer"
        ? "Irina recebeu acesso formal à lista do vagão seis. Sobre o irmão, obteve um local e uma data, não uma reparação completa. Organizou os nomes para que as famílias não precisassem começar a busca de novo."
        : g.flags.preserved >= 5
          ? "Irina conservou cópias fora da estante que seria lacrada. O nome de Sergei permaneceu ligado a uma ordem verificável. A busca continuou com menos silêncio e sem a promessa de um retorno."
          : "Irina encontrou lacunas onde deveriam estar as segundas vias. Conservou os nomes que ainda podia provar. Sobre Sergei, restaram mais perguntas do que documentos.";
    case "volkov":
      return g.ending === "hero"
        ? "Volkov assinou sua promoção. A terceira página da ordem continuou com a rubrica dele; o novo gabinete ofereceu uma distância maior entre essa assinatura e quem cobrava respostas."
        : answer(g, "22", "bargain")
          ? "Volkov cobrou a palavra dada para manter sua participação reservada. O acordo não apagou a rubrica, mas tornou mais difícil entregá-la sem expor também a negociação que você aceitou."
          : g.flags.exposed >= 4
            ? "Volkov precisou depor sobre as próprias ordens. A colaboração alcançou outros gabinetes, sem transformar sua participação em um detalhe administrativo."
            : "Volkov permaneceu na cadeia de comando. Tratou a investigação como um problema de custódia documental e conservou aliados suficientes para continuar sendo ouvido.";
    case "mikhail":
      return g.ending === "escape"
        ? answer(g, "26", "companion")
          ? "Orlov sustentou os dois pontos da passagem. O segundo lugar não ficou vazio. Os nomes de quem ajudou permaneceram fora do recibo, e a rede teve de fechar parte dos contatos depois da travessia."
          : "Orlov confirmou uma passagem individual. Depois da fronteira, o canal foi encerrado. Você saiu; as pessoas que apoiaram a rota continuaram ao alcance do departamento."
        : g.ending === "shadow"
          ? "Orlov permaneceu como intermediário de uma rede maior. Os favores passaram a circular pelo seu arquivo. A proteção oferecida pela rede também criou novas dívidas e novas formas de obediência."
          : close
            ? "Orlov manteve um canal reservado para as pessoas que ainda precisavam sair de uma lista. A confiança acumulada preservou a rede, mas não tornou inocentes todos os negócios que a financiaram."
            : "Orlov reduziu os contatos e deixou de compartilhar a rota completa. O telefone continuou funcionando para outras pessoas; para você, as respostas se tornaram mais curtas.";
    case "nadia":
      return answer(g, "29", "commission")
        ? "Nadia acompanhou a entrega à comissão e guardou o recibo. Seu nome passou a ligar os documentos às pessoas de campo. Continuou buscando respostas para famílias que não apareceriam no anúncio oficial."
        : g.flags.protected >= 8
          ? "Nadia conseguiu manter abertas visitas que seriam substituídas por ordens de captura. Algumas famílias voltaram a receber notícias. Ela recusou transformar isso em uma declaração de que o trabalho estava terminado."
          : "Nadia continuou recebendo ordens com nomes que conhecia. A falta de proteção acumulada estreitou o espaço entre cumprir uma missão e abandonar alguém. Ela preservou os relatos que ainda podia assinar.";
    case "elena":
      return answer(g, "28", "full")
        ? "A edição levou nomes e endereços para fora da gráfica. As famílias puderam reconhecer os seus desaparecidos, e a segurança pôde localizar quem ainda estava vivo. Elena anotou que a escolha de circulação também tinha um autor."
        : answer(g, "28", "redact")
          ? "A edição conservou os nomes e retirou os endereços familiares. Elena guardou a prova da revisão junto às chapas. A publicação documentou os desaparecimentos sem entregar uma lista de casas à segurança."
          : g.ending === "conscience"
            ? "Elena fez circular os nomes que conseguiu confirmar nas cópias recebidas. A falta de uma revisão registrada deixou perguntas sobre quem mais teria acesso aos dados familiares. A matéria saiu sem uma promessa de segurança."
            : "Elena preservou parte das chapas para uma edição que não pôde fechar. Sem uma decisão sobre a circulação, os nomes continuaram dependendo de cópias dispersas e de contatos que ainda aceitassem lê-las.";
    case "serebrov":
      return g.ending === "reformer"
        ? "Serebrov perdeu o cargo e teve os repasses suspensos pela comissão. O ato encerrou o financiamento conhecido de Zarya. Não explicou sozinho por que tantas repartições aceitaram a mesma destinação falsa."
        : g.ending === "hero"
          ? "Serebrov apareceu no comunicado que elogiou a eficiência do departamento. O orçamento dos alojamentos continuou carregando cifras que as famílias nunca viram convertidas em moradia."
          : "Serebrov procurou distância das contas com sua rubrica. A força da cobrança dependeu das cópias preservadas e de quem ainda podia demonstrar a diferença entre a verba declarada e o material entregue.";
    case "lev":
      return answer(g, "12", "redact")
        ? "Antonov confirmou os procedimentos sem fazer circular o endereço da filha. A separação entre prova técnica e identificação familiar permitiu que seu testemunho chegasse com uma exposição menor de quem não participou dos testes."
        : g.ending === "reformer"
          ? "Antonov depôs diante da comissão. Teve de reconhecer os resultados e a participação do laboratório. O encerramento de Zarya impediu novos ensaios conhecidos, sem lhe oferecer uma absolvição científica."
          : close
            ? "Antonov deixou um caderno em custódia verificável e aceitou esclarecer as anotações. O medo permaneceu, mas já não era a única voz no registro da entrevista."
            : "Antonov limitou o depoimento ao que podia confirmar por escrito. A família continuou exposta nas cópias comuns. Seus cadernos sobreviveram com mais segurança que sua disposição de voltar a falar.";
    case "yuri":
      return answer(g, "18", "shelter")
        ? "Yuri encontrou abrigo com a família por meio da rede. O endereço não entrou no pedido da segurança. Continuou devendo a proteção a pessoas que também passaram a correr risco por recebê-lo."
        : g.decisions.some(
              (d) => d.subject === "Yuri Petrov" && d.action === "recruit",
            )
          ? "Yuri permaneceu ligado ao canal que você abriu. Os horários que forneceu ajudaram a reconstituir o transporte, mas o recrutamento não lhe garantiu uma casa nem retirou a família do alcance de uma visita."
          : "Yuri voltou ao trabalho sem confiar no livro de entrevistas. Conservou os horários que podia provar. A família continuou sendo a razão para falar e também para retirar o que havia dito.";
    case "karpov":
      return answer(g, "15", "trade")
        ? "Karpov guardou a recomendação de promoção como um recibo de outra natureza. O favor lhe deu acesso ao seu silêncio. Ele não precisou negar o relógio toda vez que quis lembrar quem havia ajudado a sua carreira."
        : g.flags.exposed >= 4
          ? "Karpov passou a responder por relatórios que antes usava para interrogar outros. Perdeu a exclusividade sobre as cópias. A investigação atingiu o método, sem demonstrar que ele era o único a usá-lo."
          : "Karpov conservou espaço para chamar inconsistência de suspeita. Parte dos documentos foi preservada, mas a circulação restrita permitiu que continuasse escolhendo quais versões chegariam primeiro aos superiores.";
    default:
      return "";
  }
}
export function civilianEpilogues(g: Game) {
  const mirovHeld = custody(g, "Alexei Mirov"),
    veraHeld = custody(g, "Vera Kuznetsova"),
    annaHeld = custody(g, "Anna Lebedeva");
  return [
    {
      name: "Alexei e Anna Mirova",
      text: mirovHeld
        ? "Anna continuou pedindo revisão da ordem contra o filho. A confissão não apagou o registro de Tula; a existência dessa cópia impediu que a pergunta sobre sua prisão desaparecesse com o processo."
        : "Alexei pôde estar com a mãe. A família conservou a lembrança de uma ordem que poderia ter separado os dois e de um registro de turno que precisou ser tratado como prova.",
    },
    {
      name: "Vera e os pacientes da clínica",
      text: veraHeld
        ? "Vera permaneceu sob custódia. A clínica continuou precisando responder pelas retiradas posteriores, e os pacientes ficaram fora das justificativas usadas para a primeira venda."
        : "A liberdade de Vera não devolveu as ampolas aos pacientes. Os recibos de carvão e as receitas sem atendimento permaneceram como partes da mesma decisão.",
    },
    {
      name: "Anna Lebedeva e seu filho",
      text: annaHeld
        ? "O filho de Anna deixou de receber notícias regulares da mãe. O processo registrou a entrega da cópia, mas não ofereceu proteção contra a ameaça que a antecedeu."
        : answer(g, "8", "protect")
          ? "A família teve um canal de contato preparado por Orlov. A promessa ficou registrada como responsabilidade, sem se tornar uma garantia de que ninguém mais poderia ameaçá-los."
          : "Anna soube que o contato não vinha com garantia para o filho. A decisão de colaborar ou permanecer distante continuou ligada a esse limite.",
    },
  ];
}
