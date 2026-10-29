"use client";
import { useEffect, useState } from "react";
import type { Case, ComparisonField } from "../game/types";
import { cluesFor, compareValues, valuesFor } from "../game/evidence";
import { useGame } from "../game/store";
const labels: Record<ComparisonField, string> = {
  name: "Nomes",
  date: "Datas",
  time: "Horários",
  reference: "Referências",
  text: "Texto completo",
};
export default function EvidenceComparator({
  pair,
  cases,
}: {
  pair: string[];
  cases: Case[];
}) {
  const { game, setGame } = useGame();
  const [field, setField] = useState<ComparisonField>("reference"),
    [a, setA] = useState(""),
    [b, setB] = useState(""),
    [note, setNote] = useState(""),
    [error, setError] = useState(""),
    [expanded, setExpanded] = useState(false);
  const left = game
      ? cluesFor(game, cases).find((c) => c.id === pair[0])
      : undefined,
    right = game
      ? cluesFor(game, cases).find((c) => c.id === pair[1])
      : undefined;
  const leftValues = left ? valuesFor(left, field) : [],
    rightValues = right ? valuesFor(right, field) : [];
  const pairKey = pair.join(":");
  useEffect(() => {
    setA(leftValues.length === 1 ? leftValues[0] : "");
    setB(rightValues.length === 1 ? rightValues[0] : "");
    setError("");
  }, [field, pairKey]);
  useEffect(() => {
    setNote("");
    if (game?.excerpts.some((e) => pair.includes(e.id))) setExpanded(true);
    if (
      left &&
      right &&
      (!valuesFor(left, field).length || !valuesFor(right, field).length)
    ) {
      const compatible = (
        ["date", "time", "reference", "name", "text"] as ComparisonField[]
      ).find((f) => valuesFor(left, f).length && valuesFor(right, f).length);
      if (compatible) setField(compatible);
    }
  }, [pairKey]);
  if (!game) return null;
  return (
    <section className="comparison-workbench">
      <details
        open={expanded}
        onToggle={(e) => setExpanded(e.currentTarget.open)}
      >
        <summary>Comparar detalhes (opcional)</summary>
        <span className="eyebrow">MESA DE CONFRONTO</span>
        <h3>Compare um detalhe, não uma impressão.</h3>
        <p>
          Fixe também seleções livres dos documentos. Uma data diferente pode
          importar; um horário diferente pode ser apenas outro evento. Registre
          sua interpretação.
        </p>
        <label className="field-label">
          O QUE COMPARAR
          <select
            value={field}
            onChange={(e) => setField(e.target.value as ComparisonField)}
          >
            {Object.entries(labels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <div className="comparison-columns">
          {[
            {
              side: "a",
              values: leftValues,
              source: left,
              value: a,
              set: setA,
            },
            {
              side: "b",
              values: rightValues,
              source: right,
              value: b,
              set: setB,
            },
          ].map((s) => (
            <label className="field-label" key={s.side}>
              FONTE {s.side.toUpperCase()} ·{" "}
              {s.source?.source ?? "SELECIONE UM TRECHO NO QUADRO"}
              <select
                value={s.value}
                onChange={(e) => s.set(e.target.value)}
                disabled={!s.values.length}
              >
                <option value="">
                  {s.source && !s.values.length
                    ? "Nenhum valor deste tipo no trecho"
                    : "Escolha o valor a confrontar"}
                </option>
                {s.values.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <label className="field-label">
          O QUE ESSA COMPARAÇÃO SIGNIFICA?
          <textarea
            value={note}
            maxLength={400}
            rows={2}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex.: A etiqueta e o lacre identificam volumes diferentes."
          />
        </label>
        <button
          className="outline-button"
          disabled={!a || !b || pair.length !== 2}
          onClick={() => {
            try {
              setGame(
                compareValues(game, cases, pair[0], pair[1], field, a, b, note),
              );
              setError("");
              setNote("");
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          Registrar comparação
        </button>
        {error && (
          <p role="status" className="warning">
            {error}
          </p>
        )}
      </details>
      {game.comparisons
        .filter((c) => {
          const ids = new Set(cluesFor(game, cases).map((e) => e.id));
          return ids.has(c.a) && ids.has(c.b);
        })
        .map((c, i) => (
          <article key={i} className="comparison-result">
            <span>
              {labels[c.field]} ·{" "}
              {c.result === "same"
                ? "VALORES COINCIDENTES"
                : "VALORES DIFERENTES"}
            </span>
            <p>
              {c.valueA} <b>↔</b> {c.valueB}
            </p>
            {c.note && <blockquote>{c.note}</blockquote>}
          </article>
        ))}
    </section>
  );
}
