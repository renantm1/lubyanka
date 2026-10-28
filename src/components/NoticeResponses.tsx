"use client";
import { useState } from "react";
import { useGame } from "../game/store";
import {
  noticeBlocked,
  noticeChoices,
  respondToNotice,
} from "../game/institution";
export default function NoticeResponses({ eventId }: { eventId: string }) {
  const { game, setGame } = useGame(),
    [error, setError] = useState("");
  if (!game || !noticeChoices[eventId]) return null;
  const answered = game.responses.find((r) => r.eventId === eventId);
  return (
    <div className="notice-responses">
      {answered ? (
        <blockquote role="status">{answered.text}</blockquote>
      ) : (
        noticeChoices[eventId].map((option) => (
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
        ))
      )}
      {error && (
        <p className="warning" role="status">
          {error}
        </p>
      )}
    </div>
  );
}
