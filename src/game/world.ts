import { dateFor } from "./document-generator";
import type { Game } from "./types";
// Fatos históricos não dependem das ações do jogador. Notícias do Zarya são ficção.
export const historicalNews = [
  {
    date: "1983-09-26",
    title: "A vigilância continua",
    text: "Após semanas de tensão internacional, os sistemas de alerta seguem sob observação. Os detalhes dos incidentes militares permanecem fora da imprensa pública.",
  },
  {
    date: "1983-11-02",
    title: "Exercícios no Ocidente",
    text: "A OTAN prepara o exercício de comando Able Archer 83. A redação acompanha os comunicados diplomáticos.",
  },
  {
    date: "1983-11-07",
    title: "Aniversário da Revolução",
    text: "Moscou marca o aniversário da Revolução de Outubro, celebrado em 7 de novembro no calendário atual. No Ocidente, começa o exercício de comando Able Archer 83.",
  },
  {
    date: "1983-11-11",
    title: "Terminam os exercícios da OTAN",
    text: "O exercício Able Archer 83 chegou ao fim. A desconfiança entre os blocos permanece.",
  },
];
export function newsFor(g: Game) {
  const eligible = historicalNews.filter((n) => n.date <= dateFor(g.day));
  return {
    historical: eligible.at(-1)!,
    local: [
      "Preparativos para o inverno avançam nos bairros da capital.",
      "Teatro anuncia nova temporada; ingressos nas bilheterias.",
      "Oficinas ferroviárias recebem remessa de peças.",
      "Moradores organizam reparos nos sistemas de aquecimento.",
    ][g.day % 4],
    fictional: g.events
      .filter((e) => e.day <= g.day)
      .map((e, index) => ({ ...e, index }))
      .sort((a, b) => a.day - b.day || a.index - b.index)
      .slice(-2)
      .map((e) => e.text),
  };
}
