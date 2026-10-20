import { say, type GameState, type Transition } from '../model';
import { researchPaper } from '../rooms/mcgill';
import { films, type StoryAction, type StoryRoomState } from './model';
import { collect, fact, owns, replace } from './progress';

type State = GameState<StoryRoomState>;

export function inspectMcGill(state: State, prop: string): Transition<StoryRoomState> {
  switch (prop) {
    case 'computer': return say(state, fact(state.progress, 'computerPowered') ? '“Recommendz is ready for an opinion.”' : '“The computer has an empty power socket.”');
    case 'gum': return say(state, fact(state.progress, 'gumTaken') ? '“Only the wrapper left.”' : '“A piece of gum on the desk.”');
    case 'papers': return say(state, '“An MSc earned. Papers published. Two years of a PhD. Quite a stack.”', researchPaper);
    case 'board': return say(state, '“A note from the high-school CS class I mentor.”');
    case 'records': return say(state, '“Good code deserves a good soundtrack.”');
    default: return say(state, '“A change of scene is always possible.”');
  }
}

export function interactMcGill(state: State, prop: string): Transition<StoryRoomState> {
  if (state.mode === 'pickup' && prop === 'gum') return collect(state, 'gum', 'gumTaken');
  if (state.mode === 'use' && state.selectedItem === 'power-lead' && prop === 'computer') {
    if (fact(state.progress, 'computerPowered')) return say(state, '“Already plugged in.”');
    return replace(state, ['power-lead'], [], '“A small connection. A promising hum.”', { computerPowered: true });
  }
  if (state.selectedItem) return say(state, '“That won’t help with this.”');
  if ((state.mode === 'use' || state.mode === 'open') && prop === 'computer') {
    return fact(state.progress, 'computerPowered')
      ? { state: { ...state, room: { ...state.room, computerOpen: true }, dialogue: { text: '' } }, effects: [] }
      : say(state, '“No power.”');
  }
  if (state.mode === 'use' && prop === 'records') return { ...inspectMcGill(state, prop), effects: [{ type: 'toggle-sound' }] };
  return inspectMcGill(state, prop);
}

export function rateFilm(state: State, action: Extract<StoryAction, { type: 'rate-film' }>): Transition<StoryRoomState> {
  if (!state.room.computerOpen || !fact(state.progress, 'computerPowered')) return { state, effects: [] };
  if (!films.includes(action.film) || !Number.isInteger(action.rating) || action.rating < 1 || action.rating > 5) return say(state, '“That rating didn’t register.”');
  if (fact(state.progress, 'stylusDown')) return say(state, '“The printer has done its part.”');
  if (owns(state.progress, 'recommendation') || owns(state.progress, 'paper-plane')) return say(state, '“One research output at a time.”');
  const printed = replace(state, [], ['recommendation'], '“One opinion in. One recommendation out.”');
  return { ...printed, state: { ...printed.state, room: { ...state.room, computerOpen: false } } };
}
