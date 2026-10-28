import type { Game } from "./types";
import { characters } from "../content/characters";
import { noticeKind } from "./institution";
export function contactsPaused(g: Game): boolean {
  return g.responses.some(
    (r) =>
      noticeKind(r.eventId) === "institution-surveillance" &&
      r.choiceId === "pause" &&
      g.day <= r.day + 1,
  );
}
export function personInCustody(
  g: Game,
  name: string,
  previousDaysOnly = false,
): boolean {
  const last = g.decisions
    .filter(
      (d) =>
        d.subject === name &&
        (!previousDaysOnly || d.day < g.day) &&
        (d.action === "detain" || d.action === "release"),
    )
    .at(-1);
  return last?.action === "detain";
}
export function contactUnavailable(g: Game, id: string): boolean {
  const c = characters.find((x) => x.id === id);
  if (!c) return true;
  return personInCustody(
    g,
    c.name.replace(/^(Coronel |Major |Dr\. )/, ""),
    true,
  );
}
