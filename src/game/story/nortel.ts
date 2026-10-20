import { say, type GameState, type Transition } from '../model';
import type { StoryRoomState } from './model';
import { collect, fact, mark, owns, replace, wearStrap } from './progress';

type State = GameState<StoryRoomState>;
const tripLine = '“Pop. Ah. Static electricity. It’s running a self-test…”';

export function resetStoryEquipment(state: State): Transition<StoryRoomState> {
  return state.room.tripped ? {
    state: { ...state, room: { ...state.room, tripped: false }, dialogue: state.dialogue.text === tripLine ? { text: '“Self-test passed. Nothing permanently fried.”' } : state.dialogue },
    effects: [],
  } : { state, effects: [] };
}

export function inspectNortel(state: State, prop: string): Transition<StoryRoomState> {
  switch (prop) {
    case 'power-lead': return say(state, fact(state.progress, 'powerLeadTaken') ? '“An empty space on the bench.”' : '“A spare computer power lead. The racks have their own.”');
    case 'mount': return say(state, fact(state.progress, 'clipMounted') ? '“The retainer is firmly mounted.”' : '“A broken mounting point. The external retaining clip is missing.”');
    case 'cable': return say(state, fact(state.progress, 'linkRestored') ? '“Connected. Steady green lights.”' : '“Loose fibre. Nothing to hold it in place.”');
    case 'strap': return say(state, '“An anti-static wrist strap, with grounding lead.”');
    case 'console': return say(state, state.room.tripped ? '“A self-test, and a reset button.”' : fact(state.progress, 'linkRestored') ? '“The test network is online.”' : '“Loss of signal.”');
    default: return say(state, '“An OME rack. Plenty of connections.”');
  }
}

export function interactNortel(state: State, prop: string): Transition<StoryRoomState> {
  if (state.mode === 'pickup' && prop === 'power-lead') return collect(state, 'power-lead', 'powerLeadTaken');
  if (prop === 'strap' && (state.mode === 'pickup' || (state.mode === 'use' && !state.selectedItem))) {
    const collected = collect(state, 'strap');
    return state.mode === 'use' ? wearStrap(collected.state) : collected;
  }
  if (state.mode === 'use' && state.selectedItem === 'strap') return wearStrap(state);
  if (prop === 'console' && !state.selectedItem && ['use', 'open', 'push'].includes(state.mode)) {
    return state.room.tripped ? resetStoryEquipment(state) : inspectNortel(state, prop);
  }
  if (['ome-a', 'ome-b', 'mount', 'cable'].includes(prop) && ['use', 'open', 'close', 'pickup', 'push', 'pull'].includes(state.mode)) {
    if (state.room.tripped) return say(state, '“Still running its self-test.”');
    if (!owns(state.progress, 'strap') || !fact(state.progress, 'strapWorn')) {
      return { state: { ...state, selectedItem: null, room: { ...state.room, tripped: true }, dialogue: { text: tripLine } }, effects: [] };
    }
    if (prop === 'mount' && state.mode === 'use' && state.selectedItem === 'sticky-clip') {
      if (fact(state.progress, 'clipMounted')) return say(state, '“The mount is already repaired.”');
      return replace(state, ['sticky-clip'], [], '“The gum holds the back of the clip. The connector stays clean.”', { clipMounted: true });
    }
    if (state.selectedItem) return say(state, '“That won’t help with this.”');
    if (prop === 'cable' && (state.mode === 'use' || state.mode === 'push')) {
      if (fact(state.progress, 'linkRestored')) return say(state, '“Already snug.”');
      if (!fact(state.progress, 'clipMounted')) return say(state, '“It slips straight back out.”');
      return mark(state, { linkRestored: true }, '“Click. There’s the light.”');
    }
  }
  return inspectNortel(state, prop);
}
