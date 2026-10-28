"use client";
import { useState } from "react";
import type { Case, Document } from "../game/types";
import { useGame } from "../game/store";
import { inquiryOptions } from "../content/inquiries";
import { inquiryBlocked, requestInquiry } from "../game/inquiries";
import { characters } from "../content/characters";

export default function InquiryPanel({
  investigation,
  view,
}: {
  investigation: Case;
  view: (doc: Document) => void;
}) {
  const { game, setGame } = useGame(),
    [error, setError] = useState("");
  if (!game) return null;
  const options = inquiryOptions(investigation);
  if (!options.length) return null;
  const record = game.inquiries.find((r) => r.caseId === investigation.id);
  const watched = game.pressure.surveillanceUntil >= game.day;
  return (
    <section
      className="inquiry-panel"
      aria-labelledby={`inquiry-${investigation.id}`}
    >
      <span className="eyebrow">
        DILIGÊNCIA OPCIONAL · {investigation.id.toUpperCase()}
      </span>
      <h3 id={`inquiry-${investigation.id}`}>Por onde procurar?</h3>
      <p>
        Uma consulta adicional pode trazer outra fonte. Escolha uma via por
        processo; a fonte chega neste expediente. O retorno vem pela
        correspondência dois dias depois.
      </p>
      {record ? (
        <div className="inquiry-received">
          <p role="status">{record.response}</p>
          <button
            className="outline-button"
            onClick={() => view(record.document)}
          >
            Ler documento da diligência →
          </button>
          <small>
            No quadro, corrobore este documento com o registro independente para
            fundamentar uma requisição alternativa ao anexo.
          </small>
        </div>
      ) : (
        <div className="inquiry-options">
          {options.map((option) => {
            const denied = inquiryBlocked(game, investigation, option);
            return (
              <div className="inquiry-option" key={option.route}>
                <span className="eyebrow">
                  {option.route === "formal"
                    ? "VIA FORMAL · PROTOCOLO NOMINAL"
                    : `VIA RESERVADA · ${characters.find((c) => c.id === option.contact)?.name}`}
                </span>
                <p>
                  {option.route === "formal"
                    ? "A instituição conhece o pedido e a origem da fonte."
                    : "O contato procura uma fonte sem a autorização habitual da chefia."}
                </p>
                <small>
                  {option.route === "formal"
                    ? `Exposição +${3 + (watched ? 2 : 0)} · confiança da chefia +1. No retorno: paranoia +1.`
                    : `Exposição +${1 + (watched ? 2 : 0)} · confiança da chefia −2 · confiança do contato −2. No retorno: integridade +1.`}
                </small>
                {watched && (
                  <small>
                    A vigilância acrescenta 2 de exposição à consulta.
                  </small>
                )}
                <button
                  className="outline-button"
                  disabled={!!denied}
                  onClick={() => {
                    try {
                      setGame(
                        requestInquiry(game, investigation.id, option.route),
                      );
                      setError("");
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                >
                  {option.label} →
                </button>
                {denied && <small>{denied}</small>}
              </div>
            );
          })}
        </div>
      )}
      {error && (
        <p className="warning" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
