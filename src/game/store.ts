"use client";
import { create } from "zustand";
import type { Document, Game, Meta, Settings } from "./types";
import { createGame } from "./engine";
import { readSave, writeSave } from "./save-system";
const initialMeta: Meta = {
  unlockedDay: 1,
  endings: [],
  achievements: [],
  documents: [],
};
interface Store {
  game: Game | null;
  meta: Meta;
  settings: Settings;
  ready: boolean;
  error: string;
  hydrate: () => void;
  start: (seed: string, mode?: Game["mode"]) => void;
  setGame: (g: Game) => void;
  open: (doc: Document) => void;
  pin: (id: string) => void;
  configure: (s: Partial<Settings>) => void;
  clearError: () => void;
}
export const useGame = create<Store>((set, get) => ({
  game: null,
  meta: initialMeta,
  settings: { volume: 0.22, sound: false, reducedMotion: false },
  ready: false,
  error: "",
  hydrate: () => {
    try {
      const game = readSave(localStorage);
      let meta = initialMeta,
        settings = get().settings;
      try {
        const m = JSON.parse(localStorage.getItem("lubyanka-meta") || "null");
        if (
          m &&
          Array.isArray(m.endings) &&
          Array.isArray(m.documents) &&
          Array.isArray(m.achievements) &&
          Number.isInteger(m.unlockedDay)
        )
          meta = m;
        const s = JSON.parse(
          localStorage.getItem("lubyanka-settings") || "null",
        );
        if (
          s &&
          typeof s.sound === "boolean" &&
          typeof s.reducedMotion === "boolean" &&
          typeof s.volume === "number"
        )
          settings = s;
      } catch {
        /* configurações podem ser restauradas independentemente */
      }
      set({ game, meta, settings, ready: true });
    } catch {
      set({
        ready: true,
        error:
          "Não foi possível recuperar o save. O arquivo original foi mantido. Você pode iniciar uma nova partida ou importar uma cópia válida.",
      });
    }
  },
  start: (seed, mode = "campaign") =>
    get().setGame(createGame(seed || "MOSCOU-1983", mode)),
  setGame: (game) => {
    const previous = get().meta;
    const endings = game.ending
      ? [...new Set([...previous.endings, game.ending])]
      : previous.endings;
    const achievements = [
      ...new Set([
        ...previous.achievements,
        ...(game.decisions.length ? ["Primeira assinatura"] : []),
        ...(game.links.length ? ["Entrelinhas"] : []),
        ...(game.flags.preserved >= 5 ? ["Memória de papel"] : []),
        ...(game.ending ? ["O preço do silêncio"] : []),
      ]),
    ];
    const meta = {
      ...previous,
      unlockedDay: Math.max(previous.unlockedDay, Math.min(game.day, 30)),
      endings,
      achievements,
      documents: [
        ...new Map(
          [...previous.documents, ...game.discovered].map((d) => [d.id, d]),
        ).values(),
      ],
    };
    set({ game, meta });
    try {
      writeSave(localStorage, game);
      localStorage.setItem("lubyanka-meta", JSON.stringify(meta));
    } catch {
      set({
        error:
          "O navegador recusou o salvamento. Exporte uma cópia no menu antes de sair.",
      });
    }
  },
  open: (doc) => {
    const g = get().game;
    if (!g) return;
    get().setGame({
      ...g,
      phase: g.phase === "morning" ? "work" : g.phase,
      opened: [...new Set([...g.opened, doc.id])],
      discovered: [
        ...new Map([...g.discovered, doc].map((d) => [d.id, d])).values(),
      ],
    });
  },
  pin: (id) => {
    const g = get().game;
    if (!g) return;
    get().setGame({
      ...g,
      board: g.board.includes(id)
        ? g.board.filter((e) => e !== id)
        : [...g.board, id],
    });
  },
  configure: (s) => {
    const settings = { ...get().settings, ...s };
    set({ settings });
    try {
      localStorage.setItem("lubyanka-settings", JSON.stringify(settings));
    } catch {
      set({ error: "Configurações não puderam ser salvas neste navegador." });
    }
  },
  clearError: () => set({ error: "" }),
}));
