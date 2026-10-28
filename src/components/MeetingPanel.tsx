"use client";
import { useState } from "react";
import type { Case } from "../game/types";
import { answerMeeting, meetingBlocked, meetingFor } from "../content/meetings";
import { useGame } from "../game/store";
export default function MeetingPanel({
  investigation,
}: {
  investigation: Case;
}) {
  const { game, setGame } = useGame(),
    [error, setError] = useState("");
  if (!game) return null;
  const meeting = meetingFor(game, investigation);
  if (!meeting) return null;
  const answered = game.responses.find(
    (r) => r.eventId === `meeting:${investigation.id}`,
  );
  return (
    <section className="meeting-panel">
      <span className="eyebrow">CONVERSA RESERVADA · {meeting.speaker}</span>
      <p>{meeting.prompt}</p>
      {answered ? (
        <blockquote role="status">{answered.text}</blockquote>
      ) : (
        <div className="meeting-choices">
          {meeting.choices.map((option) => (
            <div key={option.id}>
              <button
                className="outline-button"
                disabled={!!meetingBlocked(game, investigation, option)}
                onClick={() => {
                  try {
                    setGame(answerMeeting(game, investigation, option.id));
                    setError("");
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                {option.label} →
              </button>
              {meetingBlocked(game, investigation, option) && (
                <small>{meetingBlocked(game, investigation, option)}</small>
              )}
            </div>
          ))}
        </div>
      )}
      {error && (
        <p className="warning" role="status">
          {error}
        </p>
      )}
    </section>
  );
}
