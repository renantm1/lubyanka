"use client";
import type { Case, Document, Game } from "../game/types";
import { nextStep, tutorialActive, tutorialStep } from "../game/guidance";
import { useGame } from "../game/store";
import { casesFor } from "../game/engine";
export default function DeskGuide({
  game,
  investigation,
  view,
  report,
  finish,
  principal,
  help,
  board,
}: {
  game: Game;
  investigation: Case;
  view: (d: Document) => void;
  report: () => void;
  finish: () => void;
  principal: () => void;
  help: () => void;
  board: () => void;
}) {
  const { setGame } = useGame();
  if (game.phase === "night" || game.phase === "ending") return null;
  if (tutorialActive(game)) {
    const tutorial = tutorialStep(game, casesFor(game)[0])!;
    return (
      <section className="tutorial-guide" aria-label="Tutorial do primeiro dia">
        <span className="eyebrow">
          TUTORIAL DO PRIMEIRO DIA · PASSO {tutorial.number} DE 6
        </span>
        <h2>{tutorial.title}</h2>
        <p>{tutorial.text}</p>
        <button
          className="red-button"
          onClick={() => {
            if (investigation.id !== "story-1") {
              principal();
              return;
            }
            if (tutorial.action === "document" && tutorial.document)
              view(tutorial.document);
            else if (tutorial.action === "board") board();
            else if (tutorial.action === "report") report();
            else if (tutorial.action === "finish") finish();
          }}
        >
          {investigation.id === "story-1"
            ? tutorial.label
            : "Voltar à investigação de Mirov"}{" "}
          →
        </button>
        <button
          className="text-button"
          onClick={() => setGame({ ...game, tutorial: "skipped" })}
        >
          Pular tutorial
        </button>
      </section>
    );
  }
  const step = nextStep(game, investigation),
    mainDone = game.decisions.some((d) => d.caseId === casesFor(game)[0].id);
  return (
    <details className="desk-guide" open>
      <summary>
        Orientação do expediente · {step.sources}/{step.minimum} fontes
      </summary>
      <div>
        <p>{step.text}</p>
        <button
          className="outline-button"
          onClick={() => {
            if (step.action === "document" && step.document)
              view(step.document);
            else if (step.action === "report") report();
            else if (step.action === "finish")
              mainDone ? finish() : principal();
          }}
        >
          {step.action === "finish" && !mainDone
            ? "Voltar ao processo prioritário"
            : step.label}{" "}
          →
        </button>
        <button className="text-button" onClick={help}>
          Como jogar
        </button>
      </div>
    </details>
  );
}
