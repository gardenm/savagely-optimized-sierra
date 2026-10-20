import { say, type GameState, type Progress, type Transition } from '../model';
import { itemNames, type StoryFlag, type StoryItem, type StoryProgress } from './model';

export const fact = (progress: Progress, flag: StoryFlag): boolean => progress.flags?.[flag] === true;
export const owns = (progress: Progress, item: string): boolean => progress.inventory.includes(item);
export const agentEvidence = (progress: Progress) => progress.agent ?? { candidate: null, receipt: null };

export function freshStoryProgress(): StoryProgress {
  return {
    inventory: [], completed: false, agent: { candidate: null, receipt: null },
    flags: {
      powerLeadTaken: false, computerPowered: false, gumTaken: false, drawerOpen: false, clipTaken: false,
      stylusDown: false, strapWorn: false, clipMounted: false, linkRestored: false, exampleOnBoard: false,
      agentHasPlan: false, agentHasExample: false, reviewComplete: false,
    },
  };
}

export function changed<S>(state: GameState<S>, patch: Partial<Progress>, text: string): Transition<S> {
  return {
    state: { ...state, selectedItem: null, progress: { ...state.progress, ...patch }, dialogue: { text } },
    effects: [{ type: 'persist' }],
  };
}

export function mark<S>(state: GameState<S>, flags: Partial<Record<StoryFlag, boolean>>, text: string): Transition<S> {
  return changed(state, { flags: { ...state.progress.flags, ...flags } }, text);
}

/** Ownership and replacement are checked together; failed recipes keep every ingredient. */
export function replace<S>(state: GameState<S>, consumed: readonly StoryItem[], produced: readonly StoryItem[],
  text: string, flags: Partial<Record<StoryFlag, boolean>> = {}): Transition<S> {
  if (!consumed.every(item => owns(state.progress, item))) return say(state, '“I don’t have that.”');
  const inventory = [...new Set([...state.progress.inventory.filter(item => !consumed.includes(item as StoryItem)), ...produced])];
  return changed(state, { inventory, flags: { ...state.progress.flags, ...flags } }, text);
}

export function collect<S>(state: GameState<S>, item: StoryItem, source?: StoryFlag): Transition<S> {
  if (owns(state.progress, item) || (source && fact(state.progress, source))) return say(state, '“Already taken.”');
  return replace(state, [], [item], `“${itemNames[item]}. Mine now.”`, source ? { [source]: true } : {});
}

export function wearStrap<S>(state: GameState<S>): Transition<S> {
  if (!owns(state.progress, 'strap')) return say(state, '“I don’t have that.”');
  return fact(state.progress, 'strapWorn') ? say(state, '“Already grounded.”')
    : mark(state, { strapWorn: true }, '“Strapped in. Grounded. Fashionable.”');
}
