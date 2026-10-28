"use client";
import type { Game } from "../game/types";
import { chapterFor, chapters } from "../content/campaign";
import { Insignia } from "./Artwork";
const prologues: Record<number, { scene: string; paragraphs: string[] }> = {
  1: {
    scene: "Moscou · 1º de novembro de 1983",
    paragraphs: [
      "A mesa estava ocupada ontem. A gaveta está vazia hoje. Ninguém explica o intervalo.",
      "O coronel entrega uma pasta e pede uma conclusão antes do anoitecer. Você ainda não sabe quais nomes serão lembrados por uma assinatura.",
    ],
  },
  8: {
    scene: "Uma semana depois · Diretoria II",
    paragraphs: [
      "Os processos começaram a compartilhar os mesmos números. A sigla Z-17 reaparece onde deveria haver assuntos sem relação.",
      "Os corredores ficaram mais atentos às suas visitas ao arquivo. Algumas pessoas já sabem como você costuma responder a uma ordem.",
    ],
  },
  16: {
    scene: "O terceiro fichário · Moscou",
    paragraphs: [
      "Já não basta descobrir se uma folha é verdadeira. Agora é preciso saber por que ela foi entregue a você.",
      "As testemunhas têm memória. Os gabinetes também. O que você protegeu, expôs ou deixou sem resposta começa a voltar à mesa.",
    ],
  },
  24: {
    scene: "A última semana · O arquivo permanece aberto",
    paragraphs: [
      "A conspiração tem uma cadeia de ordens, pagamentos e destinos. Você não é mais uma pessoa de fora dessa cadeia.",
      "Há cópias que sobreviveram, pessoas que ainda podem falar e promessas que serão cobradas antes do último relatório.",
    ],
  },
};
export default function ChapterIntro({
  game,
  begin,
}: {
  game: Game;
  begin: () => void;
}) {
  const chapter = chapterFor(game.chapterIntro ?? game.day),
    content = prologues[chapter.start];
  return (
    <section
      className="chapter-screen"
      role="dialog"
      aria-modal="true"
      aria-label={`Abertura do capítulo ${chapters.indexOf(chapter) + 1}`}
    >
      <div className="chapter-rule" />
      <Insignia />
      <span className="eyebrow">
        CAPÍTULO {["I", "II", "III", "IV"][chapters.indexOf(chapter)]} · DIAS{" "}
        {chapter.start}–{chapter.end}
      </span>
      <h1>{chapter.title}</h1>
      <p className="chapter-place">{content.scene}</p>
      {content.paragraphs.map((p) => (
        <p key={p} className="chapter-prose">
          {p}
        </p>
      ))}
      <button className="red-button" onClick={begin} autoFocus>
        Iniciar expediente →
      </button>
      <small>ENTER iniciar · ESC pular abertura</small>
    </section>
  );
}
