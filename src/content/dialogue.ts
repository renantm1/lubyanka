import type { Case, Game } from "../game/types";
import { contactUnavailable, contactsPaused } from "../game/contacts";
export function dialogueFor(g: Game, c: Case): string {
  if (contactsPaused(g))
    return "A seção informa que as conversas reservadas foram suspensas por dois expedientes. Consultas oficiais ao arquivo continuam disponíveis. A suspensão não apaga respostas nem cópias que já foram registradas.";
  if (contactUnavailable(g, c.character))
    return "A ligação não é completada. O contato está sob custódia e não pode manter um canal reservado. O operador indica os registros já existentes no arquivo; uma assinatura anterior não se tornou uma nova entrevista.";
  if (c.id === "story-4" && c.subject === "Alexei Mirov")
    return "Anna está na portaria desde antes do amanhecer. Você não pode devolver esses três dias, mas ainda pode escutar o rolo certo. Procure R-12. Uma confissão não corrige um relatório fabricado.";
  if (c.id === "story-9" && c.subject === "Vera Kuznetsova")
    return "Vera vendeu as primeiras ampolas. Isso não a torna autora de todas as retiradas que a direção quiser atribuir a ela. Compare a data da nova entrega com a sua própria ordem de custódia.";
  if (c.id === "story-12" && c.subject === "Anna Lebedeva")
    return "Anna confiou no canal que você abriu. A chave é real; o risco para o filho também. Quando um informante entrega mais do que prometeu, pergunte quem vai pagar por essa confiança.";
  if (c.id === "story-20" && c.subject === "Lev Antonov")
    return "O cientista não pode atravessar uma porta trancada. Escreva essa frase num papel e compare com a versão do gabinete. Depois pense no motivo pelo qual precisaram tirá-lo da sala.";
  const lines: Record<number, string> = {
    1: "O major quer uma assinatura rápida. Eu quero que você procure o nome dele no arquivo. Um registro de turno vale mais que a urgência de um superior. Se os documentos não coincidirem, registre a diferença: o laboratório só atende requisições fundamentadas.",
    2: "Eu vi a válvula no chão. Três homens trabalhavam debaixo dela. A direção chama a parada de sabotagem porque uma meta não pode depor. Compare a ordem com o laudo antes de decidir quem pôs a fábrica em risco.",
    3: "O carvão chegou ao alojamento. As ampolas não chegaram aos pacientes. Os dois recibos são verdadeiros. Não escolha um deles só porque é mais fácil de carimbar.",
    4: "O posto tinha um relógio ruim e um operador com medo de registrar a falha. Corrija o horário, mas não apague o erro do livro. É assim que começam as versões que ninguém consegue desmontar depois.",
    5: "O incêndio foi conveniente para muita gente. Se encontrar a segunda via, faça uma cópia. Sem ela, na semana que vem Z-17 pode voltar a ser apenas uma sigla sem dono.",
    6: "Uma etiqueta cabe em qualquer mala. Um lacre deixa marca quando é trocado. Compare C-41 e C-14 no livro de bagagens. Depois pergunte quem teve acesso aos volumes entre o despacho e a revista.",
    7: g.decisions.some(
      (d) => d.caseId === "story-5" && d.action === "preserve",
    )
      ? "A cópia que você guardou chegou. Eu a cruzei com a lista de escolta. Sergei está entre os onze. Agora preciso que você decida quanto desse papel vai sobreviver ao seu relatório."
      : "Reconheci o nome do meu irmão sob a tinta. Não vou pedir que você acredite em mim por causa disso. Registre a diferença entre as assinaturas e peça a lista de escolta. Quero uma prova que sobreviva a nós dois.",
    8: "Um recibo pode provar uma entrega e não contar nada sobre a ameaça que a precedeu. Anna sabe o que fez. Pergunte quem sabia onde encontrar o filho antes de dizer que ela tinha uma escolha livre.",
    9: "O negativo tem mais bordas que a versão entregue ao gabinete. Se a imagem resolve tudo rápido demais, procure o pedaço que alguém decidiu deixar de fora.",
    10: "Uma assinatura na primeira via não autoriza toda alteração que alguém grampeie depois. O vagão passou por um desvio. O livro de tráfego pode dizer mais que o endereço datilografado.",
    11: "Olga copiou a folha. Eu não vou fingir que o carbono surgiu sozinho. Mas as certidões já tinham datas erradas antes que ela tocasse na máquina. Uma autoria não explica a outra.",
    12: "O fusível saiu da sala de segurança. Meu interruptor continuou lacrado. Não estou pedindo que me absolva do trabalho no laboratório. Estou pedindo que não confunda o que fiz com a destruição ordenada depois.",
    13: "Eu disse vagão seis antes de me mostrarem a nota. Depois vieram à minha casa. Se vai guardar uma versão da entrevista, guarde também a ordem em que elas foram dadas.",
    14: "Uma ficha queimada não desaparece de todos os recibos. O veículo saiu, o forno recebeu o material e alguém assinou os dois movimentos. A palavra inundação não explica uma incineração.",
    15: "O embrulho chegou ao gabinete. O dinheiro saiu de uma conta. A decisão de liberar a carga veio depois. Não aceite que o último nome a tocar no pacote vire o dono de toda a sequência.",
    16: "Nomes de pacientes não viram nomes de agentes quando alguém troca o título da lista. Abra o envelope e faça o inventário. E lembre que os endereços que encontrará pertencem a pessoas que continuam em casa.",
    17: "A cópia selada mostra a versão anterior. A credencial mostra um acesso. Para acusar uma pessoa, guarde também a folha que diz a quem a credencial foi entregue. Não pule o elo mais difícil.",
    18: "A rede vendeu uma identidade e também levou famílias para fora de um lugar perigoso. Os mesmos contatos fazem os dois trabalhos. Fechar uma porta pode interromper o negócio e deixar alguém do lado de dentro.",
    19: "As chapas estão aqui. O inventário dos tipos também. Quem quiser me atribuir outra página precisa explicar onde eu teria encontrado a letra com que a imprimiram.",
    20: "Os exames não mostram o acidente das certidões. Roschin recebeu uma ameaça e assinou. Nenhum desses fatos transforma a causa registrada numa verdade médica.",
    21: "Um erro de tradução repetido pode atravessar fronteiras melhor que um nome. Há três iguais nas cópias. Preserve os resumos que também foram enviados ao gabinete antes de escolher um único responsável.",
    22: "Eu rubriquei a terceira página. Você precisa decidir o que fazer com isso. Não confunda minha disposição de falar com a afirmação de que eu não sabia o destino dos pacientes.",
    23: "Uma autorização pode ter sido válida antes de alguém decidir cancelá-la. Compare os horários das duas vias. A explicação escrita depois não muda quem tomou a primeira decisão.",
    24: "A ficha de entrada tem duas assinaturas. O relato que circulou depois tem uma ausência. Comece por quem recebeu a pessoa ou a chave, antes de repetir o destino que anunciaram.",
    25: "As caixas tinham peso e destino. Os alojamentos tinham nomes de famílias. Uma planilha pode alinhar os números sem fazer esses dois lugares coincidirem. Procure os recibos dos motoristas.",
    26: "A passagem é verdadeira. A promessa de proteger quem fica não está nela. Não entregue uma responsabilidade tão grande a uma linha que ninguém escreveu no recibo.",
    27: "O caderno foi lacrado antes de eu ser afastado. O medo veio depois. Ele pode me fazer hesitar ao falar; não muda o procedimento que já estava escrito.",
    28: "A coluna de endereços sai sem tirar um nome da lista. Eu posso fazer a revisão, mas quero saber quem vai assinar a decisão de circulação. Há gente viva por trás desses números de porta.",
    29: "A comissão não pediu a destruição. Se alguém diz que é uma transferência, peça o nome de quem vai receber e o recibo que fica com quem entrega. Uma caixa vazia não é uma cadeia de custódia.",
    30: "Eu organizei o que restou. Algumas folhas chegaram porque você guardou uma cópia; algumas pessoas já não atendem porque uma ordem saiu desta mesa. O último relatório precisa reconhecer as duas coisas.",
  };
  if (g.mode === "campaign" && c.id === `story-${g.day}` && lines[g.day])
    return lines[g.day];
  return g.relations[c.character].trust >= 55
    ? `Você já sabe por que insisto em guardar as cópias. Neste processo, preste atenção à fonte reservada: “${c.documents.find((d) => d.kind === "letter")?.paragraphs[1] ?? c.briefing}” Não use minha confiança como substituto de prova.`
    : `A minha versão não pode ser a única que você cita. O registro independente está no arquivo. Se pedir um anexo, primeiro documente o que justifica a requisição.`;
}
