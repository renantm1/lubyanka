"use client";
import { useState } from "react";
import { useGame } from "../game/store";
import {
  noticeBlocked,
  noticeOptions,
  noticeDeadline,
  respondToNotice,
} from "../game/institution";
export default function NoticeResponses({ eventId }: { eventId: string }) {
  const { game, setGame } = useGame(),
    [error, setError] = useState("");
  const options = noticeOptions(eventId);
  if (!game || !options.length) return null;
  const answered = game.responses.find((r) => r.eventId === eventId);
  const deadline = noticeDeadline(game, eventId);
  return (
    <div className="notice-responses">
      {answered ? (
        <blockquote role="status">{answered.text}</blockquote>
      ) : deadline !== null && game.day > deadline ? (
        <p className="muted">
          Prazo encerrado no expediente {deadline}. Esta ordem permanece no
          arquivo.
        </p>
      ) : (
        <>
          <small>Resposta até o expediente {deadline}, inclusive.</small>
          {options.map((option) => (
            <div key={option.id}>
              <button
                className="outline-button"
                disabled={
                  !!noticeBlocked(game, eventId, option) ||
                  game.phase === "night" ||
                  game.phase === "ending"
                }
                onClick={() => {
                  try {
                    setGame(respondToNotice(game, eventId, option.id));
                    setError("");
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                {option.label} →
              </button>
              {noticeBlocked(game, eventId, option) && (
                <small>{noticeBlocked(game, eventId, option)}</small>
              )}
            </div>
          ))}
        </>
      )}
      {error && (
        <p className="warning" role="status">
          {error}
        </p>
      )}
    </div>
  );
}
