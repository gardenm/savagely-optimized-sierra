import { say, type GameState, type Transition } from '../model';
import type { StoryRoomState } from './model';
import { collect, fact, mark, owns, replace } from './progress';

type State = GameState<StoryRoomState>;

export function inspectSmart(state: State, prop: string): Transition<StoryRoomState> {
  if (prop === 'stylus' || prop === 'ledge') return say(state, owns(state.progress, 'stylus') ? '“The ledge looks less smug now.”'
    : fact(state.progress, 'stylusDown') ? '“The stylus is on the floor.”' : '“A stylus on a high ledge. Well out of reach.”');
  return say(state, fact(state.progress, 'exampleOnBoard') ? '“SMART Notebook. Two coffees, unit price $3.00. An unfinished checkout flow.”'
    : '“SMART Notebook on a Mac. An unfinished checkout flow on the whiteboard.”');
}

export function interactSmart(state: State, prop: string): Transition<StoryRoomState> {
  if (state.mode === 'use' && state.selectedItem === 'paper-plane' && (prop === 'ledge' || prop === 'stylus')) {
    if (fact(state.progress, 'stylusDown')) return say(state, '“It’s already down.”');
    return replace(state, ['paper-plane'], [], '“Direct hit. The stylus lands on the floor.”', { stylusDown: true });
  }
  if (state.mode === 'pickup' && prop === 'stylus') return fact(state.progress, 'stylusDown')
    ? collect(state, 'stylus') : say(state, '“Can’t reach it.”');
  if ((state.mode === 'use' || state.mode === 'give') && state.selectedItem === 'faulty-receipt' && prop === 'whiteboard') {
    return fact(state.progress, 'exampleOnBoard') ? say(state, '“The example is already copied.”')
      : mark(state, { exampleOnBoard: true }, '“Two coffees. One charged. An example worth drawing out.”');
  }
  if (state.mode === 'use' && state.selectedItem === 'stylus' && prop === 'whiteboard') {
    if (!fact(state.progress, 'exampleOnBoard')) return say(state, '“The flow needs a concrete transaction.”');
    return owns(state.progress, 'checkout-plan') ? say(state, '“I’ve got the sketch.”')
      : replace(state, [], ['checkout-plan'], '“Quantity times unit price. A plan, on paper.”');
  }
  if (state.selectedItem) return say(state, '“That won’t help with this.”');
  return inspectSmart(state, prop);
}
