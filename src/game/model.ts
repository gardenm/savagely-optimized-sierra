import type { AgentEvidence } from './story/model';

export const verbs = {
  give: 'Give', pickup: 'Pick up', use: 'Use', open: 'Open', look: 'Look at',
  push: 'Push', close: 'Close', talk: 'Talk to', pull: 'Pull',
} as const;

export type Mode = 'walk' | keyof typeof verbs;
export type Point = Readonly<{ x: number; y: number }>;
export type Bounds = Readonly<{ left: number; right: number; top: number; bottom: number }>;
export type Link = Readonly<{ label: string; url: string }>;
export type Dialogue = Readonly<{ text: string; link?: Link }>;

/** Only this part of the state is saved between visits. */
export type Progress = Readonly<{
  inventory: readonly string[];
  completed: boolean;
  position: Point;
  flags?: Readonly<Record<string, boolean>>;
  agent?: AgentEvidence;
}>;

export type GameState<RoomState> = Readonly<{
  progress: Progress;
  mode: Mode;
  activeProp: string | null;
  selectedItem: string | null;
  dialogue: Dialogue;
  room: RoomState;
}>;

export type Action<RoomAction> =
  | { type: 'select-mode'; mode: Mode }
  | { type: 'point-at'; prop: string | null }
  | { type: 'walk'; to: Point }
  | { type: 'move'; by: Point }
  | { type: 'interact'; prop: string }
  | { type: 'select-item'; item: string }
  | { type: 'use-item'; item: string; target?: string }
  | { type: 'room'; action: RoomAction }
  | { type: 'restart' };

/** Requests to the browser. The reducer never performs these operations itself. */
export type Effect =
  | { type: 'persist' }
  | { type: 'walk'; from: Point; to: Point; duration: number; marker: boolean }
  | { type: 'leave-room'; nextRoom?: string }
  | { type: 'toggle-sound' };

export type Transition<RoomState> = Readonly<{
  state: GameState<RoomState>;
  effects: readonly Effect[];
}>;

export type PropDefinition = Readonly<{
  id: string;
  name: string;
  label: string;
  area: Readonly<{ left: number; top: number; width: number; height: number }>;
  destination: Point;
}>;

export type ItemDefinition = Readonly<{
  id: string; name: string; label: string; icon: string;
  worn?: Readonly<{ flag: string; label: string }>;
}>;

export interface RoomDefinition<RoomState, RoomAction> {
  readonly id: string;
  readonly title: string;
  readonly label: string;
  readonly gameLabel: string;
  readonly art: Readonly<{ src: string; alt: string; width: number; height: number }>;
  readonly spawn: Point;
  readonly bounds: Bounds;
  readonly props: readonly PropDefinition[];
  readonly items: readonly ItemDefinition[];
  initialState(progress: Progress): RoomState;
  interact(state: GameState<RoomState>, prop: string): Transition<RoomState>;
  useInventoryItem?(state: GameState<RoomState>, item: string, target?: string): Transition<RoomState> | undefined;
  update(state: GameState<RoomState>, action: RoomAction): Transition<RoomState>;
}

export type Dispatch<RoomAction> = (action: Action<RoomAction>) => void;

export function freshProgress(spawn: Point): Progress {
  return { inventory: [], completed: false, position: { ...spawn } };
}

export function clampPoint(point: Point, bounds: Bounds, fallback: Point): Point {
  return {
    x: Number.isFinite(point.x) ? Math.max(bounds.left, Math.min(bounds.right, point.x)) : fallback.x,
    y: Number.isFinite(point.y) ? Math.max(bounds.top, Math.min(bounds.bottom, point.y)) : fallback.y,
  };
}

export function say<S>(state: GameState<S>, text: string, link?: Link): Transition<S> {
  return { state: { ...state, dialogue: link ? { text, link } : { text } }, effects: [] };
}

export function assertNever(value: never): never {
  throw new Error(`Unhandled action: ${JSON.stringify(value)}`);
}
