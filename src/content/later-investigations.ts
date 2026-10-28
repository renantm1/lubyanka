import type { Case, Document } from "../game/types";
export interface AnnexData {
  title: string;
  kind: Document["kind"];
  author: string;
  text: string;
  clue: string;
  code: string;
  scene: Document["scene"];
  chain: string;
  custody: string;
}
const a = (
  title: string,
  author: string,
  text: string,
  clue: string,
  code: string,
  chain: string,
  custody: string,
  scene: Document["scene"] = "street",
): AnnexData => ({
  title,
  kind: "report",
  author,
  text,
  clue,
  code,
  chain,
  custody,
  scene,
});
export const laterAnnexes: Record<number, AnnexData> = {
  8: a(
    "Termo de coação · cópia N-08",
    "Escrivã Larisa Vetrova",
    "O recibo identifica Anna como portadora da cópia N-08. A ameaça contra o filho chegou dois dias antes da entrega. O remetente conhecia o número da escola e o horário da saída. Não há autorização para uma operação controlada.",
    "A ameaça N-08 antecede a entrega da cópia; o contato sabia onde encontrar o filho de Anna.",
    "N-08",
    "O envelope da ameaça e o recibo de entrega foram fotografados sob a mesma referência N-08.",
    "A escola pediu que o endereço da criança fosse retirado das cópias de circulação. A declaração de Anna não autoriza expor a família.",
  ),
  9: a(
    "Exame do negativo integral",
    "Técnica de revelação Vera Denisova",
    "A imagem P-09 foi cortada depois da revelação. O negativo mostra a fila postal, o balcão e o mesmo envelope sendo pesado por uma atendente. A anotação de Karpov não constava do recibo do laboratório.",
    "P-09: o negativo integral mostra uma entrega postal; a legenda foi acrescentada depois.",
    "P-09",
    "O recibo de revelação P-09 tem data e número iguais aos impressos na borda do negativo.",
    "A versão recortada continuou a circular mesmo depois do laboratório informar que a legenda não era sua.",
  ),
  10: a(
    "Guia de mudança de destino",
    "Despachante Alexei Rudenko",
    "A ordem V-10 original leva o vagão ao depósito declarado. Um anexo posterior muda o destino para Z-17 e dispensa confirmação de chegada. A assinatura de Markov foi reproduzida da primeira via; a alteração tem rubrica própria do gabinete.",
    "V-10 recebeu uma alteração de destino para Z-17 depois da assinatura de Markov.",
    "V-10",
    "O livro de tráfego registra V-10 passando pelo desvio de Z-17, sem passar pelo depósito público.",
    "A ausência de recibo final foi exigida pela mesma autoridade que assinou a mudança. Não é prova de que a carga deixou de chegar.",
    "railway",
  ),
  11: a(
    "Catálogo das marcas de cópia",
    "Perito Leonid Arseniev",
    "A marca C-11 do papel de carbono coincide com a máquina usada por Olga. A lista, porém, não contém apenas nomes: há certidões emitidas antes das internações. O original foi requisitado pelo gabinete assim que a cópia apareceu.",
    "C-11 confirma a cópia de Olga e preserva certidões anteriores às internações.",
    "C-11",
    "O protocolo C-11 mantém a ordem dos nomes na cópia e no livro de internação.",
    "Responsabilizar a datilógrafa pela cópia não esclarece por que o documento original continha datas incompatíveis.",
  ),
  12: a(
    "Registro elétrico do laboratório",
    "Engenheira Zoya Danilova",
    "O lacre E-12 do interruptor permaneceu intacto. O corte veio do quadro de segurança, cujo acesso exige chave do gabinete. A refrigeração perdeu alimentação antes de o cientista receber o alarme.",
    "E-12: a energia foi cortada pelo quadro de segurança, antes do alarme de Antonov.",
    "E-12",
    "A equipe de manutenção encontrou E-12 intacto e fotografou o quadro externo sem o fusível.",
    "O corte apagou amostras e registros de pacientes. O livro de chaves ainda identifica quem autorizou a entrada na sala de segurança.",
    "laboratory",
  ),
  13: a(
    "Nota de escolta · onze passageiros",
    "Ferroviário Alexei Mirov",
    "A nota T-13 registra onze passageiros no vagão seis. Nenhum possui bilhete individual. O funcionário de escolta assinou o número de pessoas, mas deixou em branco os nomes. Yuri indicou esse vagão antes de ter acesso à nota.",
    "T-13 confirma onze passageiros sem bilhete no vagão que Yuri indicou.",
    "T-13",
    "A posição de T-13 no livro de tráfego é anterior à retratação do ferroviário.",
    "A família de Yuri recebeu uma visita da segurança entre a primeira entrevista e a retratação. A ordem de visita não esclarece seu objetivo.",
    "railway",
  ),
  14: a(
    "Autorização de incineração",
    "Arquivista Irina Sokolova",
    "O protocolo I-14 autoriza destruir onze fichas. A justificativa é sigilo; não há menção a inundação. O campo de ciência da médica está vazio. O transporte das fichas foi feito por um veículo do gabinete.",
    "I-14 autoriza incineração por sigilo, sem ciência da médica e sem registro de inundação.",
    "I-14",
    "O recibo do forno lista I-14 no mesmo intervalo em que o veículo do gabinete esteve no local.",
    "A médica pode responder por não ter reagido, mas a decisão de destruir as fichas tem outra cadeia de comando.",
    "laboratory",
  ),
  15: a(
    "Recibo da relojoaria",
    "Contador Gennadi Lisov",
    "O pagamento R-15 do relógio saiu da conta do fornecedor. A ordem de liberação da apreensão cita R-15 no campo reservado a despesas diplomáticas. A visita não envolveu missão estrangeira registrada.",
    "R-15 liga o pagamento do relógio à ordem que liberou a carga do fornecedor.",
    "R-15",
    "A segunda via de R-15 foi guardada pela relojoaria para justificar o recebimento em moeda estrangeira.",
    "O presente permitiu liberar a carga, mas um funcionário subalterno recebeu a instrução de assumir a entrega se houvesse auditoria.",
  ),
  16: a(
    "Conteúdo do envelope interceptado",
    "Agente de campo Nadia Belova",
    "O envelope F-16 contém nomes de pacientes e endereços de parentes. O inventário de pessoal confirma que nenhum nome pertence à rede de agentes. A segurança registrou apenas o título da lista, não seu conteúdo.",
    "F-16 contém pacientes e parentes; nenhum dos nomes consta do inventário de agentes.",
    "F-16",
    "A abertura de F-16 foi testemunhada por dois funcionários, que assinaram o inventário antes da classificação como lista de agentes.",
    "A exposição dos endereços pode alcançar as famílias mesmo se a acusação contra Nadia for rejeitada.",
  ),
  17: a(
    "Laudo do arquivo espelho",
    "Especialista Lidia Cherkasova",
    "A cópia A-17 foi lacrada antes do acesso de Karpov. O lacre não apresenta violação e os registros coincidem com as notas de Irina. A credencial do major realizou uma segunda gravação depois da data oficial de encerramento.",
    "A-17 preserva a versão anterior; a alteração posterior usou a credencial de Karpov.",
    "A-17",
    "O lacre A-17 aparece em duas fotografias independentes: na coleta e na abertura para perícia.",
    "Uma credencial identifica um acesso, mas não prova sozinha quem a segurava. A folha de entrega da credencial deve acompanhar a acusação.",
  ),
  18: a(
    "Extrato da identidade de cobertura",
    "Analista financeiro Gennadi Lisov",
    "A transação B-18 coincide com a retirada de uma identidade do cofre. O beneficiário indicado por Orlov é um contato civil. A conta também pagou alojamento e passagens para duas famílias, sem autorização formal.",
    "B-18 vincula a venda de uma identidade a uma rede que também transportou civis.",
    "B-18",
    "A ficha da identidade retirada do cofre cita B-18 e conserva a assinatura de recebimento de Orlov.",
    "Fechar a rede impede novas vendas e também deixa sem rota quem dependia dela. Não há lista completa das pessoas abrigadas.",
  ),
  19: a(
    "Inventário de tipos da gráfica",
    "Tipógrafa Daria Rozanova",
    "As chapas G-19 contêm depoimentos e pedidos de notícia de desaparecidos. A página atribuída à gráfica usa um tipo que não consta do inventário. Sua numeração de margem foi aplicada com outra régua.",
    "G-19 contém depoimentos; a página de sabotagem usa um tipo ausente do inventário.",
    "G-19",
    "Daria manteve o inventário G-19 para conferir a devolução dos tipos depois de cada turno.",
    "A gráfica não pode provar uma negativa absoluta, mas os materiais efetivamente apreendidos contradizem a versão distribuída pela segurança.",
  ),
  20: a(
    "Laudo toxicológico · onze fichas",
    "Médica Marina Ivanova",
    "O composto L-20 aparece nas onze amostras. As radiografias não mostram o trauma que seria esperado em uma colisão. As certidões foram preenchidas com a mesma causa antes de o laboratório terminar os exames.",
    "L-20 aparece nas onze amostras; as certidões de acidente precedem os resultados dos exames.",
    "L-20",
    "As amostras L-20 foram divididas entre dois laboratórios antes da emissão das certidões.",
    "Roschin assinou sob ameaça. Isso explica sua conduta sem transformar a assinatura falsa em um registro médico confiável.",
    "laboratory",
  ),
  21: a(
    "Conferência das transcrições vendidas",
    "Intérprete Sofia Belyaeva",
    "Os pagamentos D-21 seguem a sequência dos resumos entregues por Denisov. Três erros de tradução se repetem na cópia recuperada com o comprador. Karpov recebeu relatórios sobre as reuniões, mas não registrou a autorização verbal alegada.",
    "D-21 acompanha resumos com os mesmos três erros da cópia entregue ao comprador.",
    "D-21",
    "O caderno D-21 foi recolhido com recibo de custódia antes de Denisov prestar depoimento.",
    "A ausência de uma autorização escrita não prova que o comando nada soubesse. Os relatórios enviados ao gabinete precisam ser preservados.",
  ),
  22: a(
    "Terceira página do anexo de transporte",
    "Arquivista Irina Sokolova",
    "A folha V-22 identifica os pacientes e o destino Z-17. Volkov rubricou a parte inferior, atravessando a emenda entre as páginas. Não é possível retirar a terceira página sem romper a rubrica que a liga à ordem anterior.",
    "V-22 liga a rubrica de Volkov à lista de pacientes e ao destino Z-17.",
    "V-22",
    "A cópia V-22 foi registrada antes da primeira entrevista em que o coronel negou conhecer o destino.",
    "Volkov pode testemunhar contra outros gabinetes e também responder pelas próprias ordens. Uma colaboração não apaga a responsabilidade já documentada.",
    "railway",
  ),
  23: a(
    "Sequência de autorização da auditoria",
    "Escrivã Larisa Vetrova",
    "A autorização S-23 tem selo válido. O cancelamento foi emitido depois do pedido de Sofia para consultar as verbas do Zarya. A justificativa de falta de credencial foi redigida só depois do cancelamento.",
    "S-23 era válida quando Sofia pediu as verbas; a justificativa de falta de credencial é posterior.",
    "S-23",
    "O livro de saída do gabinete registra S-23 e a resposta negativa em horários diferentes, ambos anteriores à chegada da auditora.",
    "Uma inspeção cancelada não absolve nem condena a auditora. A sequência mostra quem impediu a consulta e quando decidiu fazê-lo.",
  ),
  24: a(
    "Requisição da segunda chave",
    "Enfermeira Raisa Tolstova",
    "A ficha C-24 mantém Romanov na enfermaria desde as 22h. A segunda chave foi retirada com autorização do gabinete antes das 3h. O cofre não apresenta marca de arrombamento.",
    "C-24 confirma a internação; uma segunda chave saiu do gabinete antes da abertura do cofre.",
    "C-24",
    "A enfermaria registrou duas administrações de medicamento em C-24, com assinaturas de profissionais diferentes.",
    "O nome atribuído a uma chave não prova que o seu titular esteve com ela. A requisição da duplicata precisa acompanhar a ficha de internação.",
  ),
  25: a(
    "Conferência física das entregas",
    "Contadora Tamara Volkova",
    "A verba O-25 foi apresentada como reconstrução civil. Os recibos físicos descrevem equipamento de contenção entregue em Z-17. Nenhum alojamento da lista recebeu o material. A divergência foi comunicada antes de as contas serem aprovadas.",
    "O-25 foi aprovada para alojamentos, mas os recibos físicos destinam contenção e material experimental a Z-17.",
    "O-25",
    "A planilha O-25 confere com os recibos guardados pelos motoristas, inclusive os pesos das caixas.",
    "As famílias continuaram esperando moradia enquanto a verba financiava o centro. A investigação precisa conservar a diferença entre orçamento declarado e entrega real.",
    "laboratory",
  ),
  26: a(
    "Recibo cifrado da passagem",
    "Agente de fronteira Nikolai Voronin",
    "O código F-26 identifica a troca de cópias por documentos de saída. O recibo não garante proteção a familiares que permaneçam no país. A rota admite uma mala e um acompanhante se houver apoio nos dois pontos de passagem.",
    "F-26 troca cópias por saída; o acordo não garante a proteção das pessoas que ficam.",
    "F-26",
    "A primeira metade de F-26 foi confirmada por um contato de Orlov antes de o envelope cruzar a fronteira.",
    "Um acordo verdadeiro ainda pode falhar. O controle da rota depende de relações e preparativos anteriores, não apenas da decisão de partir.",
    "railway",
  ),
  27: a(
    "Avaliação independente de Antonov",
    "Médica Marina Ivanova",
    "O caderno A-27 foi lacrado antes do confinamento. Ele descreve os mesmos procedimentos encontrados nas amostras. A avaliação independente registra lucidez, orientação e temor de represálias; não sustenta a classificação de delírio.",
    "A-27 antecede o confinamento e coincide com as amostras; a avaliação registra lucidez.",
    "A-27",
    "O selo A-27 foi conferido por um laboratório que não participou dos testes originais.",
    "O medo pode alterar a disposição para depor. Não equivale a incapacidade de reconhecer os fatos do próprio trabalho.",
    "laboratory",
  ),
  28: a(
    "Prova tipográfica da última edição",
    "Tipógrafa Daria Rozanova",
    "A prova P-28 confere os onze nomes com notas de escolta e fichas médicas. Os endereços das famílias estão numa coluna separada, marcada para revisão. É possível publicar os nomes sem distribuir essa coluna.",
    "P-28 confirma os nomes e permite retirar os endereços familiares antes da impressão.",
    "P-28",
    "A revisão P-28 separa a coluna de endereços do texto principal, sem alterar os nomes confirmados.",
    "A edição pode documentar os desaparecimentos e ainda assim expor pessoas vivas. O que será retirado antes da impressão também é uma decisão editorial.",
  ),
  29: a(
    "Exame da ordem de apreensão",
    "Auditora Sofia Belyaeva",
    "A ordem K-29 determina destruir cópias e dispensa recibos. O campo destinado ao órgão recebedor está vazio. A comissão de auditoria informa não ter solicitado esse descarte.",
    "K-29 exige destruição sem recibo; a comissão não reconhece o pedido de descarte.",
    "K-29",
    "A cópia K-29 conserva a assinatura de quem a emitiu e a sequência de encaminhamentos ao gabinete.",
    "Encaminhar uma cópia à comissão preserva uma rota institucional. Ela depende da credibilidade de quem entrega e das testemunhas que ainda podem falar.",
  ),
  30: a(
    "Inventário final do Zarya",
    "Arquivo conjunto de Irina Sokolova e Sofia Belyaeva",
    "O inventário Z-30 liga transporte, amostras, certidões e verba. Há pessoas vivas capazes de reconhecer partes da cadeia, mas a disponibilidade delas depende do que ocorreu nas investigações. O arquivo não substitui esses testemunhos.",
    "Z-30 reúne transporte, mortes e financiamento; as cópias e testemunhas preservadas sustentam o encaminhamento.",
    "Z-30",
    "As folhas Z-30 listam a origem de cada cópia e distinguem originais, segundas vias e depoimentos.",
    "O último relatório não muda sozinho o que foi feito durante o mês. Ele determina a destinação de uma cadeia que pode estar inteira, comprometida ou reduzida ao que restou.",
    "laboratory",
  ),
};
export function annexForCase(c: Case): AnnexData | undefined {
  const base = laterAnnexes[c.day];
  if (!base) return;
  if (c.day === 9 && c.subject === "Vera Kuznetsova")
    return {
      ...base,
      title: "Conferência de custódia e estoque",
      author: "Agente Nadia Belova",
      text: "Vera assinou a entrada em custódia antes da retirada do lote M-08. O motorista recebeu uma ordem do diretor para usar o nome dela. A ocorrência anterior foi usada para tornar crível uma acusação incompatível com a data.",
      clue: "M-08 foi retirado enquanto Vera estava sob custódia; a ordem partiu do diretor.",
      code: "M-08",
      chain:
        "O recibo M-08 conserva a rubrica do diretor e a hora da retirada.",
      custody:
        "A primeira venda continua documentada. Ela não autoriza atribuir uma segunda retirada a alguém que não podia estar no local.",
      scene: "laboratory",
    };
  if (c.day === 12 && c.subject === "Anna Lebedeva")
    return {
      ...base,
      title: "Conferência da chave L-17",
      text: "A chave L-17 abre o armário preservado por Anna. O recibo anterior coincide com a identificação da fechadura. O material foi localizado pelo canal reservado e ainda precisa de custódia verificável.",
      clue: "L-17 corresponde à fechadura e ao recibo anterior; Anna entregou a chave correta.",
      code: "L-17",
      chain:
        "O recibo L-17 foi assinado antes da denúncia e confere com a fechadura intacta.",
      custody:
        "O filho de Anna continua vulnerável. A chave abre um armário; o recrutamento não lhe deu proteção automática.",
    };
  if (c.day === 20 && c.subject === "Lev Antonov")
    return {
      ...base,
      title: "Livro de visitas da custódia",
      text: "O livro A-20 mantém Antonov detido durante a retirada do caderno L-04. O recibo de saída do laboratório identifica um oficial do gabinete. A nova acusação depende de ignorar a ordem de custódia anterior.",
      clue: "A-20 mantém Antonov em custódia quando o gabinete retirou L-04.",
      code: "A-20",
      chain:
        "A-20 possui registro de alimentação e visita médica no intervalo da retirada do caderno.",
      custody:
        "Sem acesso ao cientista, a apuração depende de cópias e de quem as preservou. A custódia virou parte do mecanismo de silêncio.",
    };
  if (c.day === 18 && c.subject === "Yuri Petrov")
    return {
      ...base,
      title: "Entrega da identidade B-18",
      text: "A identidade B-18 saiu do cofre por assinatura de Orlov. O livro de contato registra a entrega a Yuri depois do recrutamento. A cobertura foi fornecida pela mesma organização que agora a apresenta como prova de uma missão estrangeira.",
      clue: "B-18 foi entregue a Yuri por Orlov depois do recrutamento; o envelope contém horários ferroviários.",
      chain:
        "O livro B-18 conserva a assinatura de Orlov na retirada e o registro posterior do contato com Yuri.",
      custody:
        "Um recrutamento pode transformar uma necessidade de proteção em outra forma de controle. Yuri não conhecia a cadeia inteira que passou a usar sua identidade.",
    };
  if (c.day === 23 && c.subject === "Nadia Belova")
    return {
      ...base,
      title: "Duas vias de S-23",
      text: "A primeira via de S-23 registra o cancelamento pelo gabinete. A segunda omite o horário e atribui a decisão a Nadia, que estava em uma visita de campo. O mensageiro guardou a via que recebeu primeiro.",
      clue: "S-23 foi cancelada pelo gabinete; o horário omitido na segunda via contradiz a autoria atribuída a Nadia.",
      chain:
        "A primeira via de S-23 foi recebida antes da versão que cita Nadia. O livro de visitas confirma sua ausência.",
      custody:
        "A reação ao confronto com Volkov atingiu uma agente de campo. Conservar as duas vias permite demonstrar a sequência da atribuição falsa.",
    };
  if (c.day === 24 && c.subject === "Yuri Petrov")
    return {
      ...base,
      title: "Entrada de Yuri na custódia distrital",
      text: "C-24 registra a entrega de Yuri à custódia pela equipe que declarou ter encontrado a casa vazia. O registro foi feito no mesmo turno da visita. Não há recibo de transferência posterior.",
      clue: "C-24 registra Yuri em custódia depois da visita ao endereço entregue à segurança.",
      chain:
        "C-24 tem a assinatura do chefe da equipe e a do funcionário que recebeu o detido.",
      custody:
        "O endereço entregou um contato à equipe. A versão de fuga apagou seu destino do conhecimento da família. A ficha impede que essa ausência seja confundida com uma travessia voluntária.",
    };
  return base;
}
