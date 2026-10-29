"use client";
import { useRef, useState } from "react";
import type { Document } from "../game/types";
import { useGame } from "../game/store";
import { casesFor } from "../game/engine";
import { addExcerpt } from "../game/evidence";
import { tutorialActive } from "../game/guidance";
import { EvidencePhoto, Insignia, Portrait } from "./Artwork";
export default function DocumentView({
  doc,
  readonly = false,
  onBoard,
}: {
  doc: Document;
  readonly?: boolean;
  onBoard?: () => void;
}) {
  const { game, pin, setGame } = useGame();
  const copy = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState("");
  const [message, setMessage] = useState("");
  const [freeOpen, setFreeOpen] = useState(false);
  const owner = game
    ? casesFor(game).find((c) => c.documents.some((d) => d.id === doc.id))
    : undefined;
  function captureSelection() {
    const value = window.getSelection();
    if (
      value?.rangeCount &&
      copy.current?.contains(value.getRangeAt(0).commonAncestorContainer)
    ) {
      setSelection(value.toString().trim());
      if (value.toString().trim().length >= 8) setFreeOpen(true);
    }
  }
  return (
    <article className={`document-body paper doc-${doc.kind}`}>
      <div className="document-topline">
        <span>СССР / КГБ</span>
        <span>
          {new Date(`${doc.date}T12:00:00Z`).toLocaleDateString("pt-BR", {
            timeZone: "UTC",
          })}
        </span>
      </div>
      {doc.kind === "report" && <Insignia small />}
      <div className="document-classification">
        {doc.kind === "letter"
          ? "CORRESPONDÊNCIA PESSOAL"
          : "СОВЕРШЕННО СЕКРЕТНО"}
      </div>
      <h2>{doc.title}</h2>
      <div className="document-subtitle">{doc.subtitle}</div>
      {owner && doc.id === `${owner.id}-report` && (
        <aside className="case-briefing">
          <span className="eyebrow">INSTRUÇÃO DO EXPEDIENTE</span>
          <p>{owner.briefing}</p>
        </aside>
      )}
      {doc.kind === "photo" && <EvidencePhoto scene={doc.scene} />}
      {doc.kind === "record" && (
        <div className="record-portrait">
          <Portrait variant={doc.id.length} />
          <span>
            IDENTIFICAÇÃO
            <br />
            ARQUIVO CENTRAL
          </span>
        </div>
      )}
      <div
        className="document-copy"
        ref={copy}
        onMouseUp={captureSelection}
        onKeyUp={captureSelection}
      >
        {doc.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {doc.clues.length > 0 && (
        <section className="clue-section">
          {!readonly &&
            game &&
            tutorialActive(game) &&
            owner?.id === "story-1" &&
            ["story-1-report", "story-1-record"].includes(doc.id) && (
              <aside className="tutorial-callout paper-tutorial">
                <b>Tutorial · fixe esta prova</b>
                <p>
                  Clique no trecho abaixo, em <strong>Fixar trecho</strong>. Não
                  precisa arrastar nem selecionar palavras. Depois feche esta
                  janela para ver o próximo passo.
                </p>
              </aside>
            )}
          <div className="eyebrow">TRECHOS PARA CONFRONTO</div>
          {doc.clues.map((clue) => (
            <button
              key={clue.id}
              className={`clue ${game?.board.includes(clue.id) ? "pinned" : ""}`}
              disabled={readonly}
              onClick={() => {
                pin(clue.id);
                setMessage(
                  game?.board.includes(clue.id)
                    ? "Trecho retirado do quadro."
                    : "Trecho fixado no quadro. Abra outra fonte ou consulte o quadro para comparar.",
                );
              }}
            >
              <span>{clue.text}</span>
              {!readonly && (
                <small>
                  {game?.board.includes(clue.id)
                    ? "✓ FIXADO NO QUADRO"
                    : "＋ FIXAR TRECHO"}
                </small>
              )}
            </button>
          ))}
        </section>
      )}
      {!readonly && owner && (
        <details
          className="selection-tool"
          open={freeOpen}
          onToggle={(e) => setFreeOpen(e.currentTarget.open)}
        >
          <summary>Selecionar texto livre (opcional)</summary>
          <span className="eyebrow">LÁPIS DO ANALISTA</span>
          <p>
            Selecione qualquer trecho do texto com o mouse ou teclado para
            levá-lo ao quadro.
          </p>
          {selection && <blockquote>{selection.slice(0, 600)}</blockquote>}
          <button
            className="outline-button"
            disabled={selection.length < 8 || selection.length > 600}
            onClick={() => {
              try {
                setGame(addExcerpt(game!, owner, doc.id, selection));
                setMessage("Seleção fixada no quadro.");
                setSelection("");
              } catch (e) {
                setMessage((e as Error).message);
              }
            }}
          >
            Fixar seleção
          </button>
        </details>
      )}
      {message && (
        <p className="document-feedback" role="status">
          {message}
        </p>
      )}
      {!readonly &&
        owner &&
        onBoard &&
        (doc.clues.some((c) => game?.board.includes(c.id)) ||
          game?.excerpts.some(
            (e) => e.documentId === doc.id && game.board.includes(e.id),
          )) && (
          <button className="outline-button" onClick={onBoard}>
            Ver quadro de evidências →
          </button>
        )}
      <footer className="document-signature">
        {doc.author}
        <span>Via nº 01 · Não reproduzir</span>
      </footer>
      <div className="ink-stamp">
        {doc.kind === "letter" ? "CENSURADO" : "ARQUIVADO"}
      </div>
    </article>
  );
}
