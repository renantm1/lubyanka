import type { Case, Game } from "../game/types";
export function dialogueFor(g: Game, c: Case): string {
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
  };
  if (g.mode === "campaign" && lines[g.day]) return lines[g.day];
  return g.relations[c.character].trust >= 55
    ? `Você já sabe por que insisto em guardar as cópias. Neste processo, preste atenção à fonte reservada: “${c.documents.find((d) => d.kind === "letter")?.paragraphs[1] ?? c.briefing}” Não use minha confiança como substituto de prova.`
    : `A minha versão não pode ser a única que você cita. O registro independente está no arquivo. Se pedir um anexo, primeiro documente o que justifica a requisição.`;
}
