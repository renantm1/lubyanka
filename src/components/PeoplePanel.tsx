"use client";
import type { Case, Document } from "../game/types";
export default function PeoplePanel({
  investigation,
  view,
}: {
  investigation: Case;
  view: (d: Document) => void;
}) {
  if (!investigation.suspects?.length) return null;
  return (
    <section
      className="people-panel"
      aria-label="Pessoas envolvidas neste processo"
    >
      <span className="eyebrow">AUTORIA E CADEIA DE ORDENS</span>
      <h3>Quem fez o quê?</h3>
      <p>
        O processo começou com {investigation.subject}. As fontes também
        mencionam outras pessoas. Examine cada ato antes de escolher quem
        receberá a recomendação.
      </p>
      {investigation.suspects.map((person) => (
        <article key={person.id}>
          <h4>{person.name}</h4>
          <small>{person.occupation}</small>
          <p>{person.statement}</p>
          <button
            className="outline-button"
            onClick={() =>
              view(
                investigation.documents.find(
                  (d) => d.id === person.documentId,
                )!,
              )
            }
          >
            Examinar fonte de {person.name} →
          </button>
        </article>
      ))}
    </section>
  );
}
