"use client";
import type { Game } from "../game/types";
import { characters } from "../content/characters";
import { characterEpilogue, civilianEpilogues } from "../content/epilogues";
import { actionLabels, endingInfo } from "../game/engine";
import { Insignia } from "./Artwork";
const artifact = {
  hero: "DECRETO DE PROMOÇÃO",
  shadow: "ENVELOPE SEM REMETENTE",
  conscience: "CÓPIA ENTREGUE ÀS FAMÍLIAS",
  traitor: "ORDEM DE CUSTÓDIA",
  escape: "PASSAGEM DE FRONTEIRA",
  reformer: "ATA DA COMISSÃO",
};
export default function EndingView({
  game,
  onInfinite,
  onMenu,
}: {
  game: Game;
  onInfinite: () => void;
  onMenu: () => void;
}) {
  if (!game.ending) return null;
  return (
    <section className={`ending-screen ending-${game.ending}`}>
      <div className="ending-artifact paper">
        <span>{artifact[game.ending]}</span>
        <div className="ink-stamp">30 / XI / 1983</div>
      </div>
      <Insignia />
      <span className="eyebrow">MOSCOU · DEPOIS DO ÚLTIMO RELATÓRIO</span>
      <h1>{endingInfo[game.ending].title}</h1>
      <p className="ending-story">{endingInfo[game.ending].text}</p>
      <div className="epilogues">
        {characters.map((c) => (
          <article key={c.id}>
            <span className="eyebrow">{c.role}</span>
            <h3>{c.name}</h3>
            <p>{characterEpilogue(game, c.id)}</p>
          </article>
        ))}
      </div>
      <div className="civilian-epilogues">
        <span className="eyebrow">OS NOMES FORA DOS COMUNICADOS</span>
        {civilianEpilogues(game).map((c) => (
          <article key={c.name}>
            <h3>{c.name}</h3>
            <p>{c.text}</p>
          </article>
        ))}
      </div>
      <details className="decision-history">
        <summary>
          Rever as assinaturas deste mês · {game.decisions.length} relatórios
        </summary>
        <ol>
          {game.decisions.map((d) => (
            <li key={d.caseId}>
              <span>
                DIA {String(d.day).padStart(2, "0")} · {d.subject}
              </span>
              <h3>{actionLabels[d.action]}</h3>
              <p>{d.response}</p>
              {d.note && <blockquote>{d.note}</blockquote>}
            </li>
          ))}
        </ol>
      </details>
      <div className="ending-actions">
        <button className="red-button" onClick={onInfinite}>
          Iniciar Arquivo Infinito →
        </button>
        <button className="outline-button" onClick={onMenu}>
          Voltar ao menu
        </button>
      </div>
    </section>
  );
}
