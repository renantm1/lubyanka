export type Conclusion = "innocent" | "responsible" | "coverup";
export type Action =
  | "release"
  | "detain"
  | "watch"
  | "recruit"
  | "expose"
  | "conceal"
  | "preserve"
  | "confront"
  | "escape";
export type Ending =
  | "hero"
  | "shadow"
  | "conscience"
  | "traitor"
  | "escape"
  | "reformer";
export type DocumentKind =
  | "report"
  | "letter"
  | "record"
  | "photo"
  | "telegram"
  | "newspaper";
export interface Clue {
  id: string;
  text: string;
  key: string;
  value: string;
  source: string;
}
export interface Document {
  id: string;
  kind: DocumentKind;
  title: string;
  subtitle: string;
  date: string;
  author: string;
  paragraphs: string[];
  clues: Clue[];
  sealed?: boolean;
  archive?: boolean;
  scene?: "railway" | "factory" | "laboratory" | "street";
  unlock?: { a: string; b: string; relation: "conflict" | "support" };
  access?: { prestige?: number; trust?: number };
}
export interface Case {
  id: string;
  day: number;
  title: string;
  category: string;
  subject: string;
  occupation: string;
  age: number;
  briefing: string;
  truth: Conclusion;
  rationale: string;
  documents: Document[];
  actions: Action[];
  consequence: Record<Conclusion, string>;
  character: string;
  archetype?: string;
  variant?: number;
  difficulty?: number;
  minimumSources?: number;
}
export interface Character {
  id: string;
  name: string;
  role: string;
  personality: string;
  interest: string;
  secret: string;
}
export interface Stats {
  prestige: number;
  trust: number;
  paranoia: number;
  integrity: number;
  exposure: number;
}
export interface Relation {
  trust: number;
  memories: string[];
}
export interface Decision {
  day: number;
  caseId: string;
  subject: string;
  conclusion: Conclusion;
  action: Action;
  evidence: string[];
  correct: boolean;
  note: string;
  response: string;
  thorough?: boolean;
}
export interface WorldEvent {
  id?: string;
  day: number;
  text: string;
  character: string;
  effects?: Partial<Stats>;
  document?: Document;
}
export interface Excerpt extends Clue {
  documentId: string;
  caseId: string;
}
export type ComparisonField = "name" | "date" | "time" | "reference" | "text";
export interface Comparison {
  a: string;
  b: string;
  field: ComparisonField;
  valueA: string;
  valueB: string;
  result: "same" | "different";
  note: string;
}
export interface Game {
  version: 1;
  seed: string;
  mode: "campaign" | "infinite";
  day: number;
  phase: "morning" | "work" | "night" | "ending";
  stats: Stats;
  relations: Record<string, Relation>;
  decisions: Decision[];
  events: WorldEvent[];
  board: string[];
  opened: string[];
  discovered: Document[];
  links: { a: string; b: string; relation: "conflict" | "support" }[];
  excerpts: Excerpt[];
  comparisons: Comparison[];
  appliedEvents: string[];
  positions: Record<string, { x: number; y: number }>;
  flags: {
    preserved: number;
    network: number;
    exposed: number;
    protected: number;
    detained: number;
    escape: boolean;
  };
  ending: Ending | null;
}
export interface Settings {
  volume: number;
  sound: boolean;
  reducedMotion: boolean;
}
export interface Meta {
  unlockedDay: number;
  endings: Ending[];
  achievements: string[];
  documents: Document[];
}
export interface Beat {
  title: string;
  subject: string;
  occupation: string;
  briefing: string;
  accusation: string;
  proof: string;
  witness: string;
  truth: Conclusion;
  rationale: string;
  character: string;
}
