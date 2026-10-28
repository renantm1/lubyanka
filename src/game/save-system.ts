import type { Document, Game } from "./types";
import { createGame } from "./engine";
export const SAVE_KEY = "lubyanka-save-v1";
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export function serialize(game: Game) {
  return JSON.stringify({ format: "lubyanka", version: 1, game });
}
const strings = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === "string");
export function validDocument(v: unknown): v is Document {
  if (!v || typeof v !== "object") return false;
  const d = v as Document;
  return (
    ["report", "letter", "record", "photo", "telegram", "newspaper"].includes(
      d.kind,
    ) &&
    [d.id, d.title, d.subtitle, d.date, d.author].every(
      (s) => typeof s === "string",
    ) &&
    strings(d.paragraphs) &&
    Array.isArray(d.clues) &&
    d.clues.every(
      (c) =>
        c &&
        [c.id, c.text, c.key, c.value, c.source].every(
          (s) => typeof s === "string",
        ),
    )
  );
}
export function deserialize(raw: string): Game {
  const parsed = JSON.parse(raw),
    g = parsed?.game;
  if (
    parsed?.format !== "lubyanka" ||
    parsed.version !== 1 ||
    !g ||
    g.version !== 1 ||
    typeof g.seed !== "string" ||
    !Number.isSafeInteger(g.day) ||
    g.day < 1 ||
    !["campaign", "infinite"].includes(g.mode) ||
    (g.mode === "campaign" && g.day > 30)
  )
    throw new Error("Arquivo de salvamento incompatível.");
  const base = createGame();
  // Migração aditiva: os saves publicados na versão 0.1 não tinham estes campos.
  if (g.excerpts === undefined) g.excerpts = [];
  if (g.comparisons === undefined) g.comparisons = [];
  if (g.appliedEvents === undefined) g.appliedEvents = [];
  if (
    !["morning", "work", "night", "ending"].includes(g.phase) ||
    !["decisions", "events", "board", "opened", "discovered", "links"].every(
      (k) => Array.isArray(g[k]),
    ) ||
    !g.flags ||
    !g.positions ||
    !g.relations
  )
    throw new Error("Salvamento incompleto.");
  if (
    !Object.keys(base.stats).every(
      (k) =>
        Number.isFinite(g.stats?.[k]) && g.stats[k] >= 0 && g.stats[k] <= 100,
    ) ||
    !Object.keys(base.relations).every(
      (k) =>
        Number.isFinite(g.relations[k]?.trust) &&
        Array.isArray(g.relations[k]?.memories),
    )
  )
    throw new Error("Estado de jogo inválido.");
  if (
    !Object.keys(base.flags).every((k) =>
      k === "escape"
        ? typeof g.flags[k] === "boolean"
        : Number.isSafeInteger(g.flags[k]) && g.flags[k] >= 0,
    )
  )
    throw new Error("Histórico inválido.");
  if (
    !g.decisions.every(
      (d: Game["decisions"][number]) =>
        typeof d.caseId === "string" &&
        Number.isInteger(d.day) &&
        d.day >= 1 &&
        d.day <= g.day &&
        strings(d.evidence) &&
        typeof d.response === "string" &&
        typeof d.subject === "string" &&
        typeof d.note === "string" &&
        typeof d.correct === "boolean" &&
        ["innocent", "responsible", "coverup"].includes(d.conclusion) &&
        [
          "release",
          "detain",
          "watch",
          "recruit",
          "expose",
          "conceal",
          "preserve",
          "confront",
          "escape",
        ].includes(d.action),
    )
  )
    throw new Error("Decisões inválidas.");
  if (
    !strings(g.board) ||
    !strings(g.opened) ||
    !g.discovered.every(validDocument) ||
    !g.events.every(
      (e: Game["events"][number]) =>
        e &&
        Number.isInteger(e.day) &&
        typeof e.text === "string" &&
        typeof e.character === "string" &&
        Object.hasOwn(base.relations, e.character),
    ) ||
    !g.links.every(
      (l: Game["links"][number]) =>
        l &&
        typeof l.a === "string" &&
        typeof l.b === "string" &&
        ["conflict", "support"].includes(l.relation),
    )
  )
    throw new Error("Documentos ou evidências inválidos.");
  if (
    !Array.isArray(g.excerpts) ||
    !g.excerpts.every(
      (e: Game["excerpts"][number]) =>
        e &&
        [e.id, e.text, e.key, e.value, e.source, e.documentId, e.caseId].every(
          (x) => typeof x === "string",
        ) &&
        e.text.length >= 8 &&
        e.text.length <= 600,
    ) ||
    !strings(g.appliedEvents) ||
    !Array.isArray(g.comparisons) ||
    !g.comparisons.every(
      (c: Game["comparisons"][number]) =>
        c &&
        [c.a, c.b, c.valueA, c.valueB, c.note].every(
          (x) => typeof x === "string",
        ) &&
        ["name", "date", "time", "reference", "text"].includes(c.field) &&
        ["same", "different"].includes(c.result),
    )
  )
    throw new Error("Anotações de investigação inválidas.");
  if (
    !g.events.every(
      (e: Game["events"][number]) =>
        (e.id === undefined || typeof e.id === "string") &&
        (e.document === undefined || validDocument(e.document)) &&
        (e.effects === undefined ||
          (e.effects &&
            Object.entries(e.effects).every(
              ([key, value]) =>
                Object.keys(base.stats).includes(key) &&
                Number.isFinite(value) &&
                Math.abs(value!) <= 100,
            ))),
    )
  )
    throw new Error("Consequências inválidas.");
  if (
    !Object.values(g.positions).every((v) => {
      const p = v as { x: number; y: number };
      return (
        p &&
        Number.isFinite(p.x) &&
        Number.isFinite(p.y) &&
        Math.abs(p.x) <= 170 &&
        Math.abs(p.y) <= 110
      );
    })
  )
    throw new Error("Posições de documentos inválidas.");
  if (
    !Object.values(g.relations).every((v) => {
      const r = v as Game["relations"][string];
      return r && r.trust >= 0 && r.trust <= 100 && strings(r.memories);
    })
  )
    throw new Error("Relacionamentos inválidos.");
  if (
    (g.ending !== null &&
      ![
        "hero",
        "shadow",
        "conscience",
        "traitor",
        "escape",
        "reformer",
      ].includes(g.ending)) ||
    (g.phase === "ending" &&
      (g.day !== 30 || g.mode !== "campaign" || g.ending === null))
  )
    throw new Error("Desfecho inválido.");
  return g as Game;
}
export function writeSave(storage: StorageLike, g: Game) {
  storage.setItem(SAVE_KEY, serialize(g));
}
export function readSave(storage: StorageLike): Game | null {
  const raw = storage.getItem(SAVE_KEY);
  return raw ? deserialize(raw) : null;
}
