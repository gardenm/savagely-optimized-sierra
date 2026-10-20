import { assertNever, say, type GameState, type Transition } from '../model';
import { inspectStoryItem } from './inventory';
import { inspectLightspeed, interactLightspeed } from './lightspeed';
import { inspectMcGill, interactMcGill, rateFilm } from './mcgill';
import { type StoryAction, type StoryRoomId, type StoryRoomState } from './model';
import { inspectNortel, interactNortel, resetStoryEquipment } from './nortel';
import { owns } from './progress';
import { inspectShopify, interactShopify } from './shopify';
import { inspectSmart, interactSmart } from './smart';

const rules = {
  mcgill: { inspect: inspectMcGill, interact: interactMcGill },
  nortel: { inspect: inspectNortel, interact: interactNortel },
  smart: { inspect: inspectSmart, interact: interactSmart },
  lightspeed: { inspect: inspectLightspeed, interact: interactLightspeed },
  shopify: { inspect: inspectShopify, interact: interactShopify },
};

/** Scene adapters supply real geometry and views later; these are the shared puzzle rules. */
export function interactStory(room: StoryRoomId, state: GameState<StoryRoomState>, prop: string): Transition<StoryRoomState> {
  if (prop === 'door' && (state.mode === 'open' || state.mode === 'use')) {
    return { state: { ...state, selectedItem: null, dialogue: { text: '“A change of scene.”' } }, effects: [{ type: 'leave-room' }] };
  }
  if (state.mode === 'look') return rules[room].inspect(state, prop);
  if (state.selectedItem && !owns(state.progress, state.selectedItem)) return say(state, '“I don’t have that.”');
  return rules[room].interact(state, prop);
}

export function updateStoryRoom(room: StoryRoomId, state: GameState<StoryRoomState>, action: StoryAction): Transition<StoryRoomState> {
  switch (action.type) {
    case 'rate-film': return room === 'mcgill' ? rateFilm(state, action) : { state, effects: [] };
    case 'close-computer': return room === 'mcgill' ? { state: { ...state, room: { ...state.room, computerOpen: false } }, effects: [] } : { state, effects: [] };
    case 'reset-equipment': return room === 'nortel' ? resetStoryEquipment(state) : { state, effects: [] };
    case 'inspect-item': return inspectStoryItem(state, action.item);
    default: return assertNever(action);
  }
}
