"use client";
import type { Document, Game } from "../game/types";
export default function Dispatches({
  game,
  view,
}: {
  game: Game;
  view: (d: Document) => void;
}) {
  const events = game.events
    .filter((e) => e.day <= game.day)
    .map((e, index) => ({ ...e, index }))
    .sort((a, b) => b.day - a.day || b.index - a.index);
  return (
    <div className="modal-content dispatches">
      <span className="eyebrow">CAIXA DE CORRESPONDÊNCIA · DIRETORIA II</span>
      <h2>O passado bate à porta.</h2>
      <p>
        Respostas, pedidos de revisão e notícias de casos anteriores. Uma
        decisão pode reaparecer quando você já estiver cuidando de outra coisa.
      </p>
      {!events.length && (
        <p className="empty-state">
          Ainda não há respostas aos seus relatórios.
        </p>
      )}
      {events.map((e) => (
        <article
          key={e.id ?? `${e.day}:${e.index}`}
          className={e.id ? "dispatch delayed" : "dispatch"}
        >
          <span className="eyebrow">
            DIA {String(e.day).padStart(2, "0")} ·{" "}
            {e.id
              ? "DESDOBRAMENTO DE UM CASO ANTERIOR"
              : "DEVOLUTIVA DO DEPARTAMENTO"}
          </span>
          <p>{e.text}</p>
          {e.document && (
            <button
              className="outline-button"
              onClick={() => view(e.document!)}
            >
              Abrir {e.document.title} →
            </button>
          )}
        </article>
      ))}
    </div>
  );
}
