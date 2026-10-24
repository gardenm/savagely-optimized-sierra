import { say, type Action, type GameState, type RoomDefinition, type Transition } from '../model';

export const HOT_DOG_LINE = "What's the rush? I'll cook the hot dogs a little later";

/** An isolated joke scene, deliberately absent from the adventure room/save registry. */
export const backyard: RoomDefinition<null, never> = {
  id: 'backyard', title: 'Backyard', label: 'Backyard', gameLabel: 'Backyard scene',
  art: {
    src: '/art/backyard-hotdogs-dott.png', width: 1536, height: 1024,
    alt: 'An exaggerated cartoon backyard with a leaning purple house, bent fence and trees, a squat closed barbecue, and an unopened package of hot dogs on a crooked picnic table.',
  },
  spawn: { x: 52, y: 90 }, bounds: { left: 44, right: 85, top: 74, bottom: 96 },
  props: [
    { id: 'fence', name: 'fence', label: 'Fence', area: { left: 27, top: 23, width: 35, height: 20 }, destination: { x: 52, y: 90 } },
    { id: 'gate', name: 'garden gate', label: 'Garden gate', area: { left: 92, top: 20, width: 8, height: 40 }, destination: { x: 52, y: 90 } },
    { id: 'table', name: 'picnic table', label: 'Picnic table', area: { left: 7, top: 48, width: 34, height: 24 }, destination: { x: 52, y: 90 } },
    { id: 'bbq', name: 'barbecue', label: 'Barbecue', area: { left: 61, top: 29, width: 30, height: 40 }, destination: { x: 52, y: 90 } },
    { id: 'hotdogs', name: 'package of hot dogs', label: 'Package of hot dogs', area: { left: 18, top: 40, width: 15, height: 9 }, destination: { x: 52, y: 90 } },
  ],
  items: [],
  initialState: () => null,
  interact: state => say(state, HOT_DOG_LINE),
  update: state => say(state, HOT_DOG_LINE),
};

/** Every input gets the same answer. No moving, cooking, collecting, saving or progression. */
export function updateBackyard(state: GameState<null>, action: Action<never>): Transition<null> {
  return {
    state: {
      ...state,
      mode: action.type === 'select-mode' ? action.mode : action.type === 'walk' ? 'walk' : state.mode,
      activeProp: action.type === 'point-at' ? action.prop : action.type === 'walk' ? null : state.activeProp,
      selectedItem: null,
      dialogue: { text: HOT_DOG_LINE },
    },
    effects: [],
  };
}
