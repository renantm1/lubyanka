"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, MotionConfig, useDragControls } from "motion/react";
import { useGame } from "../game/store";
import type {
  Action,
  Conclusion,
  Document,
  Game as GameState,
} from "../game/types";
import {
  actionLabels,
  applyReport,
  casesFor,
  beginShift,
  conclusionLabels,
  endDay,
  endingInfo,
  nextDay,
} from "../game/engine";
import { chapterFor, chapters } from "../content/campaign";
import { characters } from "../content/characters";
import { dateFor } from "../game/document-generator";
import { deserialize, serialize } from "../game/save-system";
import { newsFor } from "../game/world";
import { Building, EvidencePhoto, Insignia, Portrait } from "./Artwork";
import Modal from "./Modal";
import DocumentView from "./DocumentView";
import Ambience from "./Ambience";
import EvidenceBoard from "./EvidenceBoard";
import DeskGuide from "./DeskGuide";
import HelpGuide from "./HelpGuide";
import { tutorialActive } from "../game/guidance";
import Dispatches from "./Dispatches";
import { dialogueFor } from "../content/dialogue";
import ChapterIntro from "./ChapterIntro";
import EndingView from "./EndingView";
import MeetingPanel from "./MeetingPanel";
import InquiryPanel from "./InquiryPanel";
import PeoplePanel from "./PeoplePanel";
import { nominalAction } from "../game/responsibility";
import { deskSound } from "../game/desk-sound";
import { cluesFor, documentAccess, sourceFor } from "../game/evidence";
type Tool =
  | "settings"
  | "credits"
  | "archive"
  | "terminal"
  | "board"
  | "report"
  | "phone"
  | "collection"
  | "chapters"
  | "new"
  | "dispatches"
  | "help"
  | null;
const roman = ["I", "II", "III", "IV"];
function PaperObject({
  doc,
  index,
  onOpen,
}: {
  doc: Document;
  index: number;
  onOpen: () => void;
}) {
  const controls = useDragControls();
  const { game, setGame } = useGame();
  const offset = game?.positions[doc.id] ?? { x: 0, y: 0 };
  return (
    <motion.div
      className={`desk-object object-${index} kind-${doc.kind}`}
      drag
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      initial={false}
      animate={{ x: offset.x, y: offset.y }}
      onDragEnd={(_, info) => {
        if (game)
          setGame({
            ...game,
            positions: {
              ...game.positions,
              [doc.id]: {
                x: Math.max(-170, Math.min(170, offset.x + info.offset.x)),
                y: Math.max(-110, Math.min(110, offset.y + info.offset.y)),
              },
            },
          });
      }}
    >
      <div
        className="drag-handle"
        onPointerDown={(e) => controls.start(e)}
        title="Arrastar documento"
      >
        ⋮⋮ <span>ARRASTAR</span>
      </div>
      <button
        className="object-open"
        onClick={onOpen}
        aria-label={`Examinar ${doc.title}`}
      >
        {doc.kind === "report" && (
          <>
            <span className="file-tab">
              ДЕЛО / {String(game?.day).padStart(3, "0")}
            </span>
            <div className="folder-mark">КГБ</div>
            <div className="folder-rule" />
            <span className="eyebrow">COMITÊ DE SEGURANÇA DO ESTADO</span>
            <h2>{doc.title}</h2>
            <span className="folder-id">DIRETORIA II · MOSCOU</span>
            <div className="ink-stamp">СЕКРЕТНО</div>
            <span className="object-hint">ABRIR PROCESSO ↗</span>
          </>
        )}
        {doc.kind === "letter" && (
          <>
            <div className="postage">
              ПОЧТА
              <br />
              СССР
              <br />
              <b>5 к.</b>
            </div>
            <span className="letter-routing">CORRESPONDÊNCIA RETIDA</span>
            <div className="envelope-address">
              {game?.day === 1 ? "Anna Mirova" : "Ao oficial responsável"}
              <br />
              <small>
                {game?.day === 1
                  ? "Rua Sadovaya, 12 · Tula"
                  : "Moscou · Diretoria II"}
              </small>
            </div>
            <span className="envelope-seal">
              {game?.opened.includes(doc.id) ? "ABERTO" : "LACRADO"}
            </span>
            <span className="object-hint">
              {game?.opened.includes(doc.id)
                ? "LER CORRESPONDÊNCIA"
                : "ROMPER O LACRE"}{" "}
              ↗
            </span>
          </>
        )}
        {doc.kind === "photo" && (
          <>
            <EvidencePhoto scene={doc.scene} />
            <span className="photo-caption">
              NEG. 04 / {dateFor(game?.day ?? 1)} <b>⌕</b>
            </span>
          </>
        )}
      </button>
    </motion.div>
  );
}
export default function Game() {
  const {
    game,
    meta,
    settings,
    ready,
    error,
    hydrate,
    start,
    setGame,
    open,
    configure,
    clearError,
  } = useGame();
  const [screen, setScreen] = useState<"menu" | "desk">("menu"),
    [tool, setTool] = useState<Tool>(null),
    [doc, setDoc] = useState<Document | null>(null),
    [selectedCase, setSelectedCase] = useState(0),
    [query, setQuery] = useState(""),
    [notice, setNotice] = useState(""),
    [seed, setSeed] = useState("MOSCOU-1983"),
    [conclusion, setConclusion] = useState<Conclusion | " ">(" "),
    [action, setAction] = useState<Action>("release"),
    [targetId, setTargetId] = useState("primary"),
    [note, setNote] = useState(""),
    [evidence, setEvidence] = useState<string[]>([]),
    [showConsequences, setShowConsequences] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => hydrate(), [hydrate]);
  const close = useCallback(() => {
    setTool(null);
    setDoc(null);
    setNotice("");
  }, []);
  const cases = game ? casesFor(game) : [],
    active = cases[Math.min(selectedCase, cases.length - 1)],
    chapter = chapterFor(game?.day ?? 1);
  const clues = game && active ? cluesFor(game, [active]) : [],
    pinned = clues.filter((e) => game?.board.includes(e.id));
  const activeEvidence = pinned.filter((p) => {
    const source = game && active && sourceFor(active, game, p.id);
    return !!source && !documentAccess(game!, source);
  });
  useEffect(() => {
    setQuery("");
    setTargetId("primary");
  }, [game?.day, selectedCase, game?.seed, game?.investigationVersion]);
  const selectedTarget =
    active?.suspects?.find((s) => s.id === targetId) ?? active?.suspects?.[0];
  const sourceCount =
    game && active
      ? new Set(
          evidence.map((id) => sourceFor(active, game, id)?.id).filter(Boolean),
        ).size
      : 0;
  function showTool(t: Tool) {
    if (t === "report") setEvidence(activeEvidence.map((p) => p.id));
    if (t === "phone") deskSound("phone", settings);
    setDoc(null);
    setNotice("");
    setTool(t);
  }
  function view(d: Document) {
    if (game && cases.some((c) => c.documents.some((x) => x.id === d.id))) {
      const denied = documentAccess(game, d);
      if (denied) {
        setNotice(denied);
        return;
      }
    }
    deskSound(
      d.sealed && !game?.opened.includes(d.id) ? "envelope" : "paper",
      settings,
    );
    open(d);
    setTool(null);
    setDoc(d);
    setNotice("");
  }
  function attempt(fn: () => void) {
    setNotice("");
    try {
      fn();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Não foi possível concluir.");
    }
  }
  function launch(mode: GameState["mode"] = "campaign") {
    setConclusion(" ");
    setAction("release");
    setNote("");
    setEvidence([]);
    start(seed, mode);
    setSelectedCase(0);
    setScreen("desk");
    close();
  }
  function advance() {
    if (!game) return;
    setConclusion(" ");
    setAction("release");
    setNote("");
    setEvidence([]);
    attempt(() => {
      const g = nextDay(game);
      setGame(g);
      if ([8, 16, 24].includes(g.day))
        try {
          localStorage.setItem(`lubyanka-chapter-${g.day}`, serialize(g));
        } catch {
          /* save principal já tratado */
        }
      setSelectedCase(0);
      setShowConsequences(false);
    });
  }
  function exportSave() {
    if (!game) return;
    const url = URL.createObjectURL(
      new Blob([serialize(game)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `lubyanka-dia-${game.day}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  async function importSave(file: File) {
    try {
      const g = deserialize(await file.text());
      setGame(g);
      setSelectedCase(0);
      setScreen("desk");
      close();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Save inválido.");
    }
  }
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey
      )
        return;
      if (tool || doc) return;
      if (
        screen === "desk" &&
        game?.chapterIntro !== null &&
        game?.chapterIntro !== undefined
      ) {
        if (e.key === "Enter" || e.key === "Escape") {
          e.preventDefault();
          setGame(beginShift(game));
        }
        return;
      }
      if (e.key === "Escape" && screen === "desk") {
        setScreen("menu");
        return;
      }
      if (
        screen === "desk" &&
        game?.phase !== "ending" &&
        game?.phase !== "night"
      ) {
        const shortcuts: Record<string, Tool> = {
          a: "archive",
          t: "terminal",
          q: "board",
          r: "report",
          j: "dispatches",
          h: "help",
        };
        if (shortcuts[e.key.toLowerCase()]) {
          e.preventDefault();
          showTool(shortcuts[e.key.toLowerCase()]);
        }
      }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [
    screen,
    tool,
    doc,
    game?.phase,
    game?.chapterIntro,
    game,
    setGame,
    selectedCase,
  ]);
  const currentReport = game?.decisions.find((d) => d.caseId === active?.id);
  const archiveDocs = active?.documents.filter((d) => d.archive) ?? [];
  const news = game ? newsFor(game) : null;
  return (
    <MotionConfig reducedMotion={settings.reducedMotion ? "always" : "user"}>
      <main
        className={`game-shell ${settings.reducedMotion ? "reduce-motion" : ""}`}
      >
        <Ambience />
        <div className="grain" aria-hidden="true" />
        {screen === "menu" ? (
          <section className="main-menu">
            <Building />
            <div className="menu-vignette" />
            <header className="menu-top">
              <span>ИНФОРМАЦИЯ — ЭТО ВЛАСТЬ</span>
              <span>
                MOSCOU, 1983 <i className="live-dot" />
              </span>
            </header>
            <div className="menu-content">
              <div className="menu-kicker">
                <span className="red-rule" /> UM JOGO SOBRE O QUE FICA NO PAPEL
              </div>
              <Insignia />
              <h1>
                LUBYANKA<span>АРХИВЫ КГБ</span>
              </h1>
              <p className="menu-subtitle">ARQUIVOS DA KGB</p>
              <div className="menu-divider" />
              <nav aria-label="Menu principal" className="menu-options">
                <button
                  className="menu-primary"
                  disabled={!ready}
                  onClick={() => showTool("new")}
                >
                  <span>01</span> Novo jogo <b>→</b>
                </button>
                <button
                  disabled={!ready || !game}
                  onClick={() => {
                    setScreen("desk");
                    setSelectedCase(0);
                  }}
                >
                  <span>02</span> Continuar{" "}
                  {game && (
                    <small>DIA {String(game.day).padStart(2, "0")}</small>
                  )}
                </button>
                <button
                  disabled={meta.unlockedDay < 8}
                  onClick={() => showTool("chapters")}
                >
                  <span>03</span> Selecionar capítulo{" "}
                  {meta.unlockedDay < 8 && <small>🔒</small>}
                </button>
                <button
                  disabled={!ready}
                  onClick={() => showTool("collection")}
                >
                  <span>04</span> Arquivos descobertos{" "}
                  <small>
                    {String(meta.documents.length).padStart(2, "0")}
                  </small>
                </button>
                <button disabled={!ready} onClick={() => showTool("settings")}>
                  <span>05</span> Configurações
                </button>
                <button disabled={!ready} onClick={() => showTool("credits")}>
                  <span>06</span> Créditos
                </button>
                <button disabled={!ready} onClick={() => showTool("help")}>
                  <span>07</span> Como jogar
                </button>
                {meta.endings.length > 0 && (
                  <button onClick={() => launch("infinite")}>
                    <span>∞</span> Arquivo infinito
                  </button>
                )}
              </nav>
            </div>
            <aside className="menu-quote">
              <span>СОВЕРШЕННО СЕКРЕТНО</span>
              <p>
                “A verdade não desaparece.
                <br />
                Ela é arquivada.”
              </p>
              <small>DEPARTAMENTO DE ANÁLISE · DIRETORIA II</small>
            </aside>
            <footer className="menu-footer">
              <span>FICÇÃO HISTÓRICA · EXPERIÊNCIA SINGLE-PLAYER</span>
              <span>
                VERSÃO 0.7 <b>✦</b> SALVAMENTO LOCAL
              </span>
            </footer>
          </section>
        ) : game && active ? (
          <>
            <header className="desk-header" inert={game.chapterIntro !== null}>
              <button
                className="brand"
                onClick={() => setScreen("menu")}
                aria-label="Voltar ao menu"
              >
                <Insignia small />
                <span>
                  LUBYANKA<small>ARQUIVOS DA KGB</small>
                </span>
              </button>
              <div className="desk-chapter">
                <span>
                  {game.mode === "infinite"
                    ? `EXPEDIENTE ${game.day} / SEÇÃO DISTRITAL`
                    : `CAPÍTULO ${roman[chapters.indexOf(chapter)]} / ${chapter.title.toUpperCase()}`}
                </span>
                <b>
                  {game.mode === "infinite"
                    ? "ARQUIVO INFINITO"
                    : `DIA ${String(game.day).padStart(2, "0")} DE 30`}
                </b>
              </div>
              <div className="desk-date">
                {new Date(`${dateFor(game.day)}T12:00:00Z`).toLocaleDateString(
                  "pt-BR",
                  {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  },
                )}
                <small>
                  {game.phase === "morning"
                    ? "08:15 · MANHÃ"
                    : game.phase === "night"
                      ? "19:40 · ENCERRAMENTO"
                      : "14:30 · EXPEDIENTE"}
                </small>
              </div>
              <button
                className="help-shortcut"
                aria-label="Como jogar"
                onClick={() => showTool("help")}
              >
                ?
              </button>
              <button
                className="settings-shortcut"
                aria-label="Configurações"
                onClick={() => showTool("settings")}
              >
                ⚙
              </button>
            </header>
            <div className="desk-layout" inert={game.chapterIntro !== null}>
              <aside className="case-sidebar">
                <div className="sidebar-heading">
                  ENTRADA DE PROCESSOS <span>{cases.length}</span>
                </div>
                {cases.map((c, i) => (
                  <button
                    key={c.id}
                    className={`case-tab ${i === selectedCase ? "active" : ""}`}
                    onClick={() => {
                      setSelectedCase(i);
                      setConclusion(" ");
                      setEvidence([]);
                      setNote("");
                      setAction("release");
                    }}
                  >
                    <span className="eyebrow">
                      {i === 0 ? "PRIORITÁRIO" : "COMPLEMENTAR"} ·{" "}
                      {String(game.day).padStart(3, "0")}/83
                    </span>
                    <h3>{c.title}</h3>
                    <span className="case-tab-status">
                      {game.decisions.some((d) => d.caseId === c.id)
                        ? "✓ RELATÓRIO ENVIADO"
                        : "● AGUARDANDO ANÁLISE"}
                    </span>
                  </button>
                ))}
                <div className="sidebar-note">
                  <span>LEMBRETE DO OFICIAL</span>
                  <p>
                    {game.day === 1
                      ? "Uma acusação não é uma prova. Compare o relato de Karpov com um registro independente."
                      : "O arquivo guarda versões. Você decide quais delas merecem uma assinatura."}
                  </p>
                  <div className="pencil-signature">Não assine no escuro.</div>
                </div>
                <div className="sidebar-bottom">
                  <span>
                    ACESSO{" "}
                    {game.pressure.auditUntil >= game.day
                      ? "SOB SINDICÂNCIA"
                      : game.stats.trust < 25
                        ? "SUPERVISIONADO"
                        : game.stats.prestige >= 65
                          ? "ESPECIAL"
                          : "NÍVEL II"}
                  </span>
                  <small>
                    {game.pressure.surveillanceUntil >= game.day
                      ? "Seus contatos estão sob vigilância interna."
                      : game.stats.exposure >= 65
                        ? "Seu trabalho está sob apuração."
                        : game.stats.paranoia >= 65
                          ? "Há rumores nos corredores."
                          : "Nenhuma mensagem urgente."}
                  </small>
                  <button onClick={() => showTool("phone")}>
                    ☎ CONTATAR O DEPARTAMENTO
                  </button>
                </div>
              </aside>
              <section
                className={`workplace phase-${game.phase}`}
                aria-label="Mesa do analista"
              >
                <div className="desk-caption">
                  <span>
                    MESA 07 <i /> DIRETORIA II
                  </span>
                  <span>
                    ARQUIVO DE TRABALHO · {active.category.toUpperCase()}
                  </span>
                </div>
                <DeskGuide
                  game={game}
                  investigation={active}
                  view={view}
                  report={() => showTool("report")}
                  help={() => showTool("help")}
                  board={() => showTool("board")}
                  finish={() => attempt(() => setGame(endDay(game)))}
                  principal={() => setSelectedCase(0)}
                />
                <div className="desk-scroll">
                  <div className="physical-desk">
                    <div className="light-pool" />
                    <div className="desk-blotter" />
                    <div className="lamp" aria-hidden="true">
                      <div className="lamp-neck" />
                      <div className="lamp-shade" />
                      <div className="lamp-base" />
                    </div>
                    <div className="identity-note paper">
                      <div>
                        <span className="eyebrow">FICHA DO INVESTIGADO</span>
                        <h3>{active.subject}</h3>
                        <p>
                          {active.occupation}
                          <br />
                          {active.age} anos · URSS
                        </p>
                        <span className="red-label">
                          {currentReport ? "CONCLUÍDO" : "EM ANÁLISE"}
                        </span>
                      </div>
                      <Portrait variant={game.day} />
                    </div>
                    {active.documents
                      .filter((d) => d.kind === "report")
                      .slice(0, 1)
                      .map((d) => (
                        <PaperObject
                          key={d.id}
                          doc={d}
                          index={0}
                          onOpen={() =>
                            view(
                              active.documents.find((x) =>
                                x.id.endsWith("report"),
                              ) ?? d,
                            )
                          }
                        />
                      ))}
                    <PaperObject
                      key={active.id + "letter"}
                      doc={active.documents.find((d) => d.kind === "letter")!}
                      index={1}
                      onOpen={() =>
                        view(active.documents.find((d) => d.kind === "letter")!)
                      }
                    />
                    <PaperObject
                      key={active.id + "photo"}
                      doc={active.documents.find((d) => d.kind === "photo")!}
                      index={2}
                      onOpen={() =>
                        view(active.documents.find((d) => d.kind === "photo")!)
                      }
                    />
                    <button
                      className="newspaper-object paper"
                      onClick={() =>
                        setDoc({
                          id: `news-${game.day}`,
                          kind: "newspaper",
                          date: dateFor(game.day),
                          title: "Pravda · Edição da manhã",
                          subtitle: "ÓRGÃO DO COMITÊ CENTRAL · MOSCOU",
                          author: "Redação · recorte de trabalho",
                          paragraphs: [
                            news!.historical.title,
                            news!.historical.text,
                            "NA CIDADE",
                            news!.local,
                            ...news!.fictional.map(
                              (t) => `NOTA DISTRITAL (ficção): ${t}`,
                            ),
                          ],
                          clues: [],
                        })
                      }
                    >
                      <span className="newspaper-masthead">ПРАВДА</span>
                      <span className="newspaper-date">
                        MOSCOU · {dateFor(game.day)}
                      </span>
                      <h3>{news?.historical.title}</h3>
                      <div className="newspaper-columns">
                        <p>{news?.historical.text}</p>
                        <p>{news?.local}</p>
                      </div>
                      <span className="object-hint">LER EDIÇÃO ↗</span>
                    </button>
                    <button
                      className="terminal-object"
                      onClick={() => showTool("terminal")}
                    >
                      <div className="terminal-screen">
                        <span>АРХИВ / ARQUIVO</span>
                        <b>CONSULTA DE REGISTROS</b>
                        <span className="terminal-cursor">&gt; _</span>
                      </div>
                      <div className="terminal-keys">▦ ▦ ▦ ▦ ▦ ▦ ▦ ▦</div>
                      <span>
                        TERMINAL М-83 <b>[ T ]</b>
                      </span>
                    </button>
                    <button
                      className="report-object"
                      onClick={() => {
                        showTool("report");
                      }}
                    >
                      <div className="stamp-handle" />
                      <div className="stamp-base" />
                      <span>
                        {currentReport ? "VER RELATÓRIO" : "REDIGIR RELATÓRIO"}{" "}
                        ↗
                      </span>
                    </button>
                    <div className="pencil" aria-hidden="true" />
                    <div className="paperclip" aria-hidden="true" />
                    <div className="desk-instruction">
                      {game.day === 1 && !currentReport
                        ? "01 Abra a pasta  ·  02 Busque Mirov no terminal  ·  03 Fixe e compare as provas"
                        : currentReport
                          ? "Sua assinatura já está no papel. O expediente pode ser encerrado."
                          : "Arraste pela borda dos papéis · Clique para examinar · Fixe trechos no quadro"}
                    </div>
                  </div>
                </div>
                <nav
                  className="desk-tools"
                  aria-label="Ferramentas de investigação"
                >
                  <button onClick={() => showTool("archive")}>
                    <span>▤</span> Arquivo central <kbd>A</kbd>
                  </button>
                  <button onClick={() => showTool("board")}>
                    <span>⌁</span> Quadro de evidências <b>{pinned.length}</b>
                    <kbd>Q</kbd>
                  </button>
                  <button onClick={() => showTool("dispatches")}>
                    <span>✉</span> Correspondência{" "}
                    <b>
                      {game.events.filter((e) => e.day === game.day).length}
                    </b>
                    <kbd>J</kbd>
                  </button>
                  <button
                    className="phone-tool"
                    onClick={() => showTool("phone")}
                  >
                    <span>☎</span> Linha interna
                  </button>
                  <button
                    onClick={() => {
                      showTool("report");
                    }}
                  >
                    <span>⌑</span> Relatório <kbd>R</kbd>
                  </button>
                  <button
                    className="end-day"
                    disabled={
                      !game.decisions.some((d) => d.caseId === cases[0].id)
                    }
                    onClick={() => attempt(() => setGame(endDay(game)))}
                  >
                    Encerrar expediente <span>→</span>
                  </button>
                </nav>
              </section>
            </div>
            {game.phase === "night" && (
              <div className="day-transition">
                <span className="eyebrow">O EXPEDIENTE TERMINOU</span>
                <h2>O que fica no papel.</h2>
                <p>Uma assinatura nunca termina nesta sala.</p>
                {tutorialActive(game) && (
                  <aside className="tutorial-callout">
                    <b>Tutorial · passo 6 de 6</b>
                    <p>
                      Primeiro expediente concluído. Use Avançar para a manhã
                      seguinte para terminar o tutorial e iniciar o segundo dia.
                    </p>
                  </aside>
                )}
                <div className="day-results">
                  {game.decisions
                    .filter((d) => d.day === game.day)
                    .map((d) => (
                      <article key={d.caseId}>
                        <span>
                          {d.subject} / {actionLabels[d.action]}
                        </span>
                        <p>{d.response}</p>
                        {showConsequences && (
                          <small>
                            {d.correct
                              ? "Análise sustentada pelas provas."
                              : "A conclusão diverge do registro independente."}{" "}
                            {cases.find((c) => c.id === d.caseId)?.rationale}
                          </small>
                        )}
                      </article>
                    ))}
                </div>
                <button
                  className="text-button"
                  onClick={() => setShowConsequences((v) => !v)}
                >
                  {showConsequences ? "Ocultar" : "Revisar"} análise das provas
                </button>
                <button className="red-button" onClick={advance}>
                  {game.day === 30 && game.mode === "campaign"
                    ? "O último relatório"
                    : "Avançar para a manhã seguinte"}{" "}
                  →
                </button>
                <button
                  className="text-button"
                  onClick={() => setScreen("menu")}
                >
                  Salvar e voltar ao menu
                </button>
              </div>
            )}
            {game.phase === "ending" && game.ending && (
              <EndingView
                game={game}
                onInfinite={() => launch("infinite")}
                onMenu={() => setScreen("menu")}
              />
            )}
            {game.chapterIntro !== null && game.phase !== "ending" && (
              <ChapterIntro
                game={game}
                begin={() => setGame(beginShift(game))}
              />
            )}
          </>
        ) : null}
        {(notice || error) && (
          <div className="toast" role="status">
            {notice || error}
            <button
              aria-label="Fechar aviso"
              onClick={() => {
                setNotice("");
                clearError();
              }}
            >
              ×
            </button>
          </div>
        )}
        {doc && (
          <Modal title="EXAME DE DOCUMENTO" close={close}>
            <DocumentView
              doc={doc}
              readonly={screen === "menu"}
              onBoard={() => showTool("board")}
            />
          </Modal>
        )}
        {tool && (
          <Modal
            title={
              {
                settings: "CONFIGURAÇÕES",
                credits: "EXPEDIENTE / CRÉDITOS",
                archive: "ARQUIVO CENTRAL",
                terminal: "TERMINAL DE CONSULTA",
                board: "QUADRO DE EVIDÊNCIAS",
                report: "RELATÓRIO DE DECISÃO",
                phone: "LINHA INTERNA",
                dispatches: "CORRESPONDÊNCIA RECEBIDA",
                collection: "ARQUIVOS DESCOBERTOS",
                chapters: "SELECIONAR CAPÍTULO",
                new: "NOVA PARTIDA",
                help: "COMO JOGAR",
              }[tool]
            }
            close={close}
            wide={tool === "board" || tool === "collection"}
          >
            {tool === "help" && (
              <HelpGuide
                onTutorial={
                  game?.mode === "campaign" && game.day === 1
                    ? () => {
                        setGame({ ...game, tutorial: "active" });
                        setScreen("desk");
                        setSelectedCase(0);
                        close();
                      }
                    : undefined
                }
              />
            )}
            {tool === "new" && (
              <div className="modal-content">
                <span className="eyebrow">01 NOVEMBRO 1983 · MOSCOU</span>
                <h2>Seu primeiro expediente.</h2>
                <p>
                  Você foi transferido para a Diretoria II. Na mesa, uma carta
                  interceptada. No relatório, uma acusação. Ainda falta a sua
                  assinatura.
                </p>
                <label className="field-label">
                  SEED DA PARTIDA
                  <input
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    maxLength={60}
                  />
                </label>
                <p className="muted">
                  A seed reproduz os casos complementares. A campanha é
                  ficcional e trata de repressão, desaparecimentos e escolhas
                  com consequências humanas. Não há conteúdo gráfico.
                </p>
                {game && (
                  <p className="warning">
                    Iniciar substitui a partida atual. Exporte seu save nas
                    configurações para guardá-la.
                  </p>
                )}
                <button className="red-button" onClick={() => launch()}>
                  Entrar no departamento →
                </button>
              </div>
            )}
            {tool === "settings" && (
              <div className="modal-content">
                <h2>Dentro desta sala.</h2>
                <label className="toggle-line">
                  <span>
                    Som ambiente
                    <small>Ventilação, papéis e carimbos do departamento</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.sound}
                    onChange={(e) => configure({ sound: e.target.checked })}
                  />
                </label>
                <label className="field-label">
                  VOLUME · {Math.round(settings.volume * 100)}%
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.volume}
                    onChange={(e) =>
                      configure({ volume: Number(e.target.value) })
                    }
                  />
                </label>
                <label className="toggle-line">
                  <span>
                    Reduzir movimento
                    <small>Desativa oscilações e transições ambientais</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.reducedMotion}
                    onChange={(e) =>
                      configure({ reducedMotion: e.target.checked })
                    }
                  />
                </label>
                <div className="save-actions">
                  <button
                    className="outline-button"
                    disabled={!game}
                    onClick={exportSave}
                  >
                    Exportar save
                  </button>
                  <button
                    className="outline-button"
                    onClick={() => inputRef.current?.click()}
                  >
                    Importar save
                  </button>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="application/json,.json"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void importSave(f);
                      e.target.value = "";
                    }}
                  />
                </div>
                <p className="muted">
                  Salvamento automático neste navegador. Um arquivo importado
                  substitui a partida atual. A exportação permite guardar uma
                  cópia.
                </p>
                <p className="keyboard-help">
                  TAB navegar · ENTER acionar · ESC voltar
                  <br />A arquivo · T terminal · Q quadro · R relatório
                </p>
              </div>
            )}
            {tool === "credits" && (
              <div className="modal-content">
                <Insignia small />
                <h2>LUBYANKA</h2>
                <p>Arquivos da KGB · versão 0.7</p>
                <p>
                  Uma obra de ficção histórica sobre a distância entre um
                  registro oficial e uma vida. Personagens, projeto Zarya e
                  casos são ficcionais. A repressão política não é uma medida de
                  êxito moral.
                </p>
                <p>
                  Arte vetorial e áudio sintetizado localmente para o projeto.
                  Fontes: Cormorant Garamond, de Christian Thalmann, e IBM Plex
                  Mono, da IBM, distribuídas sob SIL Open Font License. Código:
                  Next.js, React, Motion e Zustand.
                </p>
                <p className="muted">
                  Campanha compacta de 30 dias, com oito famílias de casos
                  complementares. Conteúdo e polimento ainda estão em
                  desenvolvimento; consulte o README para o escopo desta versão.
                </p>
              </div>
            )}
            {(tool === "terminal" || tool === "archive") && game && (
              <div
                className={
                  tool === "terminal" ? "terminal-panel" : "modal-content"
                }
              >
                <span className="eyebrow">
                  {tool === "terminal"
                    ? "СИСТЕМА М-83 / CONEXÃO LOCAL"
                    : "DIRETORIA II · REGISTROS DO PROCESSO"}
                </span>
                <h2>
                  {tool === "terminal"
                    ? "Consultar cidadão"
                    : "Arquivo central"}
                </h2>
                <p>
                  {tool === "terminal"
                    ? "Busque pelo nome do investigado, profissão ou título do registro."
                    : "Compare fontes independentes. A assinatura em um relatório não transforma uma hipótese em fato."}
                </p>
                <label className="field-label">
                  BUSCA
                  <input
                    autoFocus
                    placeholder={`Ex.: ${active?.subject.split(" ")[1]}`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                {active && <InquiryPanel investigation={active} view={view} />}
                {active && <PeoplePanel investigation={active} view={view} />}
                <div className="archive-results">
                  {archiveDocs
                    .filter(
                      (d) =>
                        !query ||
                        `${d.title} ${d.paragraphs.join(" ")}`
                          .toLowerCase()
                          .includes(query.toLowerCase()),
                    )
                    .map((d) => (
                      <button
                        key={d.id}
                        disabled={!!documentAccess(game, d)}
                        title={documentAccess(game, d) ?? "Abrir documento"}
                        onClick={() => view(d)}
                      >
                        <span>▤</span>
                        <div>
                          <b>{d.title}</b>
                          <small>
                            {active?.subject} · {d.date}
                            {documentAccess(game, d) && (
                              <em>{documentAccess(game, d)}</em>
                            )}
                          </small>
                        </div>
                        <span>
                          {documentAccess(game, d)
                            ? "REQUISIÇÃO PENDENTE"
                            : "ABRIR →"}
                        </span>
                      </button>
                    ))}
                  {query &&
                    !archiveDocs.some((d) =>
                      `${d.title} ${d.paragraphs.join(" ")}`
                        .toLowerCase()
                        .includes(query.toLowerCase()),
                    ) && (
                      <p>
                        Nenhum registro neste processo. Verifique a grafia do
                        nome.
                      </p>
                    )}
                </div>
                {tool === "archive" && (
                  <>
                    <h3>Documentos de entrada</h3>
                    {active?.documents
                      .filter((d) => !d.archive)
                      .map((d) => (
                        <button
                          className="archive-line"
                          key={d.id}
                          onClick={() => view(d)}
                        >
                          {d.title} <span>↗</span>
                        </button>
                      ))}
                  </>
                )}
              </div>
            )}
            {tool === "board" && game && active && (
              <EvidenceBoard
                key={active.id}
                investigation={active}
                view={view}
                report={() => showTool("report")}
              />
            )}
            {tool === "report" && game && active && (
              <div className="modal-content report-form">
                <span className="eyebrow">
                  PROTOCOLO {active.id.toUpperCase()} / {active.subject}
                </span>
                <h2>O peso da assinatura.</h2>
                {tutorialActive(game) &&
                  active.id === "story-1" &&
                  !currentReport && (
                    <aside
                      className="tutorial-callout"
                      aria-label="Tutorial do relatório"
                    >
                      <b>Passo 4 de 6 · Seu primeiro relatório</b>
                      <p>
                        O ponto de Tula contradiz o relato de Karpov. Escolha{" "}
                        <strong>A acusação não se sustenta</strong>, confira as
                        duas provas e a recomendação{" "}
                        <strong>Liberar o investigado</strong>. Termine em{" "}
                        <strong>Assinar e enviar relatório</strong>.
                      </p>
                    </aside>
                  )}
                {currentReport ? (
                  <>
                    <div className="ink-stamp">ENVIADO</div>
                    <p>{conclusionLabels[currentReport.conclusion]}</p>
                    <p>{actionLabels[currentReport.action]}</p>
                    {currentReport.targetId && (
                      <p>Encaminhamento nominal: {currentReport.subject}.</p>
                    )}
                    <blockquote>
                      {currentReport.note || "Sem observações adicionais."}
                    </blockquote>
                    <p>{currentReport.response}</p>
                  </>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      attempt(() => {
                        if (conclusion === " ")
                          throw new Error("Escolha uma conclusão.");
                        setGame(
                          applyReport(
                            game,
                            active,
                            conclusion,
                            action,
                            evidence,
                            note,
                            selectedTarget?.id,
                          ),
                        );
                        deskSound("stamp", settings);
                        close();
                      });
                    }}
                  >
                    <fieldset>
                      <legend>01 / CONCLUSÃO DO ANALISTA</legend>
                      {active.suspects && (
                        <p className="muted">
                          Avalie a acusação inicial contra {active.subject}. A
                          pessoa que receberá a recomendação é escolhida
                          separadamente abaixo.
                        </p>
                      )}
                      {(Object.keys(conclusionLabels) as Conclusion[]).map(
                        (c) => (
                          <label key={c} className="radio-line">
                            <input
                              type="radio"
                              name="conclusion"
                              value={c}
                              checked={conclusion === c}
                              onChange={() => setConclusion(c)}
                            />
                            {conclusionLabels[c]}
                          </label>
                        ),
                      )}
                    </fieldset>
                    <fieldset>
                      <legend>
                        02 / EVIDÊNCIAS CITADAS · {active.minimumSources ?? 2}{" "}
                        FONTES DIFERENTES
                      </legend>
                      {activeEvidence.map((p) => (
                        <label
                          key={p.id}
                          className="radio-line evidence-option"
                        >
                          <input
                            type="checkbox"
                            checked={evidence.includes(p.id)}
                            onChange={() =>
                              setEvidence((v) =>
                                v.includes(p.id)
                                  ? v.filter((x) => x !== p.id)
                                  : [...v, p.id],
                              )
                            }
                          />
                          {p.text}
                        </label>
                      ))}
                      {activeEvidence.length === 0 && (
                        <p className="warning">
                          Fixe trechos dos documentos e do arquivo central antes
                          de enviar.
                        </p>
                      )}
                    </fieldset>
                    <label className="field-label">
                      03 / RECOMENDAÇÃO
                      <select
                        value={action}
                        onChange={(e) => setAction(e.target.value as Action)}
                      >
                        {active.actions.map((a) => (
                          <option key={a} value={a}>
                            {actionLabels[a]}
                          </option>
                        ))}
                      </select>
                    </label>
                    {active.suspects && nominalAction(action) && (
                      <fieldset className="target-choice">
                        <legend>04 / ENCAMINHAMENTO NOMINAL</legend>
                        <p>
                          A recomendação será emitida em nome da pessoa
                          escolhida. Para imputar responsabilidade, cite a fonte
                          que demonstra o ato individual.
                        </p>
                        {active.suspects.map((person) => (
                          <label
                            className="radio-line target-option"
                            key={person.id}
                          >
                            <input
                              type="radio"
                              name="target"
                              value={person.id}
                              checked={selectedTarget?.id === person.id}
                              onChange={() => setTargetId(person.id)}
                            />
                            <span>
                              <b>{person.name}</b>
                              <small>{person.occupation}</small>
                            </span>
                          </label>
                        ))}
                      </fieldset>
                    )}
                    <label className="field-label">
                      OBSERVAÇÕES DO ANALISTA
                      <textarea
                        rows={3}
                        value={note}
                        maxLength={1200}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="O que deve ficar registrado?"
                      />
                    </label>
                    <p className="muted">
                      A conclusão e a recomendação são independentes. Uma
                      detenção pode afetar pessoas mesmo quando a acusação não
                      se sustenta.
                    </p>
                    <button
                      className="red-button"
                      type="submit"
                      disabled={
                        conclusion === " " ||
                        sourceCount < (active.minimumSources ?? 2)
                      }
                    >
                      Assinar e enviar relatório →
                    </button>
                  </form>
                )}
              </div>
            )}
            {tool === "phone" && game && (
              <div className="modal-content">
                <span className="eyebrow">RAMAL 02 · LIGAÇÃO INTERNA</span>
                <h2>
                  {characters.find((c) => c.id === active?.character)?.name}
                </h2>
                <p className="dialogue">“{dialogueFor(game, active)}”</p>
                <p className="muted">
                  {game.relations[active?.character ?? "irina"].memories.at(
                    -1,
                  ) || "Esta pessoa ainda não tem memória de uma decisão sua."}
                </p>
                {active && <MeetingPanel investigation={active} />}
                {active && <InquiryPanel investigation={active} view={view} />}
                <button
                  className="outline-button"
                  onClick={() => showTool("archive")}
                >
                  Solicitar o registro independente →
                </button>
              </div>
            )}
            {tool === "dispatches" && game && (
              <Dispatches game={game} view={view} />
            )}
            {tool === "collection" && (
              <div className="modal-content collection">
                <h2>O que não foi apagado.</h2>
                <p>
                  {meta.documents.length} documentos · {meta.endings.length} de
                  6 finais registrados
                </p>
                <div className="achievements">
                  {meta.achievements.map((a) => (
                    <span key={a}>✦ {a}</span>
                  ))}
                </div>
                {!meta.documents.length && (
                  <p className="empty-state">
                    Os documentos examinados serão preservados aqui entre
                    partidas.
                  </p>
                )}
                {meta.documents.map((d, index) => (
                  <button
                    className="archive-line"
                    key={`${d.id}:${index}`}
                    onClick={() => {
                      setTool(null);
                      setDoc(d);
                    }}
                  >
                    {d.title}
                    <small>{d.date} ↗</small>
                  </button>
                ))}
                {meta.endings.map((e) => (
                  <p className="collected-ending" key={e}>
                    ✦ {endingInfo[e].title}
                  </p>
                ))}
              </div>
            )}
            {tool === "chapters" && (
              <div className="modal-content">
                <h2>Voltar a um ponto no tempo.</h2>
                <p>
                  Restaura o estado salvo na entrada do capítulo, com as
                  decisões anteriores. Substitui a partida atual; exporte seu
                  save para preservá-la.
                </p>
                {chapters.map((c, i) => (
                  <button
                    className="chapter-option"
                    key={c.start}
                    disabled={meta.unlockedDay < c.start}
                    onClick={() =>
                      attempt(() => {
                        if (c.start === 1) {
                          start(seed);
                        } else {
                          const raw = localStorage.getItem(
                            `lubyanka-chapter-${c.start}`,
                          );
                          if (!raw)
                            throw new Error(
                              "Este navegador não tem o checkpoint deste capítulo. Continue a campanha para criá-lo.",
                            );
                          setGame(deserialize(raw));
                        }
                        setScreen("desk");
                        setSelectedCase(0);
                        close();
                      })
                    }
                  >
                    <span>
                      CAPÍTULO {roman[i]} · DIAS {c.start}–{c.end}
                    </span>
                    <h3>{c.title}</h3>
                    <span>
                      {meta.unlockedDay < c.start ? "BLOQUEADO" : "REVISITAR →"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Modal>
        )}
      </main>
    </MotionConfig>
  );
}
