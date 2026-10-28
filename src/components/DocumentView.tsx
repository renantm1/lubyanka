"use client";
import type { Document } from "../game/types";
import { useGame } from "../game/store";
import { EvidencePhoto, Insignia, Portrait } from "./Artwork";
export default function DocumentView({
  doc,
  readonly = false,
}: {
  doc: Document;
  readonly?: boolean;
}) {
  const { game, pin } = useGame();
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
      {doc.kind === "photo" && <EvidencePhoto />}
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
      <div className="document-copy">
        {doc.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {doc.clues.length > 0 && (
        <section className="clue-section">
          <div className="eyebrow">TRECHOS PARA CONFRONTO</div>
          {doc.clues.map((clue) => (
            <button
              key={clue.id}
              className={`clue ${game?.board.includes(clue.id) ? "pinned" : ""}`}
              disabled={readonly}
              onClick={() => pin(clue.id)}
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
