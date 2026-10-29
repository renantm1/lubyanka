"use client";
import { useEffect, useRef, useState } from "react";
import type { Case, Document } from "../game/types";
import { useGame } from "../game/store";
import { casesFor, linkClues } from "../game/engine";
import { documentAccess, sourceFor } from "../game/evidence";
import {
  boardEntries,
  clueTopic,
  pairGuidance,
  suggestedPair,
  tutorialStep,
} from "../game/guidance";
import EvidenceComparator from "./EvidenceComparator";

export default function EvidenceBoard({
  investigation: c,
  view,
  report,
}: {
  investigation: Case;
  view: (d: Document) => void;
  report: () => void;
}) {
  const { game, setGame, pin } = useGame();
  const feedback = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string[]>([]),
    [hint, setHint] = useState(0),
    [message, setMessage] = useState(""),
    [unlocked, setUnlocked] = useState<Document[]>([]);
  useEffect(() => {
    if (message) feedback.current?.scrollIntoView({ block: "nearest" });
  }, [message]);
  if (!game) return null;
  const entries = boardEntries(game, c),
    pair = selected.filter((id) =>
      entries.some((e) => e.clue.id === id && !e.denied),
    ),
    guidance = pairGuidance(game, c, pair),
    suggestion = suggestedPair(game, c),
    suggestedIds = suggestion ? [suggestion.a, suggestion.b] : [],
    sources = new Set(
      entries.filter((e) => !e.denied).map((e) => e.document.id),
    ).size,
    canReport = sources >= (c.minimumSources ?? 2),
    ids = new Set(c.documents.flatMap((d) => d.clues.map((e) => e.id)));
  const tutorial = tutorialStep(game, c);
  const link = (relation: "support" | "conflict") => {
    try {
      const before = new Map(
        c.documents.map((d) => [d.id, documentAccess(game, d)]),
      );
      const next = linkClues(game, pair[0], pair[1], relation);
      const nextCase = casesFor(next).find((x) => x.id === c.id)!;
      const opened = nextCase.documents.filter(
        (d) => before.get(d.id) && !documentAccess(next, d),
      );
      const awaiting = nextCase.documents
        .filter((d) => {
          const denied = documentAccess(next, d);
          return denied && before.get(d.id) !== denied;
        })
        .map((d) => `${d.title}: ${documentAccess(next, d)}`);
      setGame(next);
      setUnlocked(opened);
      setMessage(
        `${relation === "conflict" ? "Contradição documentada: as fontes divergem sobre o mesmo fato." : "Corroboração documentada: as fontes sustentam a mesma alegação."} ${opened.length ? `Documento liberado: ${opened.map((d) => d.title).join("; ")}.` : awaiting.length ? awaiting.join(" ") : "A ligação foi registrada. Ela não envia o relatório nem escolhe sua conclusão."}`,
      );
    } catch (e) {
      setUnlocked([]);
      setMessage(
        `${(e as Error).message} Releia as fontes A e B ou avance nas dicas abaixo.`,
      );
    }
  };
  return (
    <div className="board-panel">
      <span className="eyebrow">
        PROCESSO ATIVO · {c.subject.toUpperCase()}
      </span>
      <h2>O que as fontes dizem?</h2>
      <p>
        Primeiro selecione dois cartões. Depois escolha a relação entre o que
        eles afirmam. Você também pode citar as provas no relatório sem criar
        uma ligação.
      </p>
      {tutorial && (
        <aside className="tutorial-callout" aria-label="Tutorial do quadro">
          <b>Tutorial · passo {tutorial.number} de 6</b>
          <p>{tutorial.text}</p>
          {tutorial.action === "document" && tutorial.document && (
            <button
              className="outline-button"
              onClick={() => view(tutorial.document!)}
            >
              Ler próximo documento do tutorial →
            </button>
          )}
          {tutorial.action === "board" && (
            <button
              className="red-button"
              onClick={() => {
                setSelected(["story-1-claim", "story-1-proof"]);
                setMessage("");
              }}
            >
              Selecionar fontes do tutorial
            </button>
          )}
          {tutorial.action === "report" && !message && (
            <button className="red-button" onClick={report}>
              Continuar tutorial no relatório →
            </button>
          )}
        </aside>
      )}
      <div className="board-selection" aria-live="polite">
        <b>{pair.length}/2 trechos selecionados</b>
        <p>{guidance.text}</p>
        {pair.length > 0 && (
          <button
            className="outline-button"
            onClick={() => {
              setSelected([]);
              setMessage("");
            }}
          >
            Limpar seleção
          </button>
        )}
      </div>
      <section className="board-hints" aria-label="Dicas do quadro">
        <span className="eyebrow">
          AJUDA GRADUAL · VOCÊ ESCOLHE QUANTO REVELAR
        </span>
        <button
          className="outline-button"
          onClick={() => setHint((value) => Math.min(3, value + 1))}
        >
          {hint === 0
            ? "Pedir uma dica"
            : hint === 1
              ? "Mostrar quais documentos comparar"
              : "Mostrar como ligar os trechos"}
        </button>
        {hint > 0 && (
          <p>
            Não é preciso ligar todos os cartões. Contexto, motivação e autoria
            podem ajudar seu relatório mesmo sem formar uma dupla guiada. Para
            começar, compare a acusação com o registro independente; para
            aprofundar, compare a origem dos anexos.
          </p>
        )}
        {hint >= 2 && suggestion && (
          <div>
            <p>Compare estes documentos sobre o mesmo fato:</p>
            {suggestedIds.map((id) => {
              const doc = sourceFor(c, game, id)!;
              return (
                <p key={id}>
                  <b>{doc.title}</b>
                  {!game.board.includes(id) && (
                    <>
                      {" "}
                      — abra e fixe o trecho guiado.{" "}
                      <button className="text-button" onClick={() => view(doc)}>
                        Ler documento →
                      </button>
                    </>
                  )}
                </p>
              );
            })}
            {suggestedIds.every((id) => game.board.includes(id)) && (
              <button
                className="outline-button"
                onClick={() => {
                  setSelected(suggestedIds);
                  setMessage("");
                }}
              >
                Selecionar os trechos sugeridos
              </button>
            )}
          </div>
        )}
        {hint >= 3 && suggestion && (
          <p className="explicit-hint">
            Para esta dupla, use{" "}
            <b>
              {suggestion.relation === "conflict"
                ? "São contraditórios"
                : "Se corroboram"}
            </b>
            . Isso registra a relação entre as fontes; você ainda escolhe a
            conclusão e a recomendação no relatório.
          </p>
        )}
      </section>
      {!entries.length && (
        <div className="empty-state">
          <p>
            O quadro ainda está vazio. No documento, role até Trechos para
            confronto e clique em Fixar trecho.
          </p>
          <button
            className="outline-button"
            onClick={() =>
              view(c.documents.find((d) => d.id === `${c.id}-report`)!)
            }
          >
            Abrir acusação inicial →
          </button>
        </div>
      )}
      <div className="evidence-board">
        {entries.map(({ clue, document, free, denied }, i) => (
          <div className="evidence-item" key={clue.id}>
            <button
              style={{ rotate: `${i % 2 ? 1 : -1}deg` }}
              aria-pressed={pair.includes(clue.id)}
              disabled={!!denied}
              className={`paper evidence-card ${pair.includes(clue.id) ? "selected" : ""}`}
              onClick={() => {
                setMessage("");
                if (pair.includes(clue.id))
                  setSelected(pair.filter((id) => id !== clue.id));
                else if (pair.length >= 2)
                  setMessage(
                    "Já há duas fontes selecionadas. Desmarque um cartão ou use Limpar seleção para escolher outra dupla.",
                  );
                else setSelected([...pair, clue.id]);
              }}
            >
              <span className="pin-head" />
              <small>{clue.source}</small>
              <span className="clue-topic">
                {free
                  ? "SELEÇÃO LIVRE · COMPARAR DETALHES"
                  : `TRECHO GUIADO · ${clueTopic(c, clue)}`}
              </span>
              <p>{clue.text}</p>
              <span className="eyebrow">
                {pair.includes(clue.id)
                  ? `FONTE ${pair.indexOf(clue.id) === 0 ? "A" : "B"} · SELECIONADO`
                  : "SELECIONAR TRECHO"}
              </span>
            </button>
            {denied && <p className="warning">{denied}</p>}
            <button
              className="remove-evidence"
              aria-label={`Retirar do quadro: ${clue.source}`}
              onClick={() => {
                pin(clue.id);
                setMessage("");
              }}
            >
              Retirar do quadro
            </button>
            <small className="evidence-origin">
              Documento: {document.title}
            </small>
          </div>
        ))}
      </div>
      <div className="board-actions">
        <button
          className={`outline-button ${tutorial?.number === 3 && guidance.ready && pair.includes("story-1-claim") && pair.includes("story-1-proof") ? "tutorial-target" : ""}`}
          disabled={!guidance.ready}
          onClick={() => link("conflict")}
        >
          São contraditórios
        </button>
        <button
          className="outline-button"
          disabled={!guidance.ready}
          onClick={() => link("support")}
        >
          Se corroboram
        </button>
      </div>
      {message && (
        <div ref={feedback}>
          <p className="board-feedback" role="status">
            {message}
          </p>
          {tutorial?.action === "report" && (
            <button className="red-button" onClick={report}>
              Continuar tutorial no relatório →
            </button>
          )}
        </div>
      )}
      {unlocked.map((doc) => (
        <button
          className="outline-button"
          key={doc.id}
          onClick={() => view(doc)}
        >
          Abrir {doc.title} →
        </button>
      ))}
      {game.links
        .filter((l) => ids.has(l.a) && ids.has(l.b))
        .map((l, i) => (
          <p className="linked-evidence" key={i}>
            {l.relation === "conflict" ? "↯ CONTRADIÇÃO" : "⟷ CORROBORAÇÃO"} ·{" "}
            {entries.find((e) => e.clue.id === l.a)?.clue.source ??
              sourceFor(c, game, l.a)?.title}{" "}
            /{" "}
            {entries.find((e) => e.clue.id === l.b)?.clue.source ??
              sourceFor(c, game, l.b)?.title}
          </p>
        ))}
      <EvidenceComparator pair={pair} cases={[c]} />
      <section className="board-report">
        <b>
          {sources}/{c.minimumSources ?? 2} fontes documentais reunidas
        </b>
        <p>
          {canReport
            ? "Você já pode preparar o relatório. Escolha a conclusão, confira as provas marcadas e indique a recomendação."
            : "Fixe trechos de documentos diferentes para habilitar o relatório. Duas citações do mesmo papel contam como uma fonte."}
        </p>
        <button className="red-button" disabled={!canReport} onClick={report}>
          Redigir relatório →
        </button>
      </section>
    </div>
  );
}
