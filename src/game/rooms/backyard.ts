import { say, type Action, type GameState, type RoomDefinition, type Transition } from '../model';
import { update } from '../update';

export const HOT_DOG_LINE = "What's the rush? I'll cook the hot dogs a little later";

export type BackyardState = Readonly<{ replyIndex: number }>;
export type BackyardAction = { type: 'postpone' };

const postponed: Readonly<Record<string, string>> = {
  bbq: "I'll cook the hot dogs a little later.",
  hotdogs: "I don't want to open those yet.",
  table: "I'll deal with the table later.",
  fence: "I don't want to do yard work right now.",
  gate: "I'll go out a little later.",
};

function postpone(state: GameState<BackyardState>, prop?: string): Transition<BackyardState> {
  const replies = [
    postponed[prop ?? ''] ?? HOT_DOG_LINE,
    "I don't want to.",
    'After I play some Street Fighter.',
    "I'll do that later.",
  ];
  return say({ ...state, room: { replyIndex: (state.room.replyIndex + 1) % replies.length } }, replies[state.room.replyIndex]);
}

/** An isolated joke scene, deliberately absent from the adventure room/save registry. */
export const backyard: RoomDefinition<BackyardState, BackyardAction> = {
  id: 'backyard', title: 'Backyard', label: 'Backyard', gameLabel: 'Backyard scene',
  art: {
    src: '/art/backyard-hotdogs-dott.png', width: 1536, height: 1024,
    alt: 'An exaggerated cartoon backyard with a leaning purple house, bent fence and trees, a squat closed barbecue, and an unopened package of hot dogs on a crooked picnic table.',
  },
  spawn: { x: 52, y: 90 }, bounds: { left: 26, right: 80, top: 79, bottom: 91 },
  props: [
    { id: 'fence', name: 'fence', label: 'Fence', area: { left: 27, top: 23, width: 35, height: 20 }, destination: { x: 52, y: 79 } },
    { id: 'gate', name: 'garden gate', label: 'Garden gate', area: { left: 92, top: 20, width: 8, height: 40 }, destination: { x: 80, y: 82 } },
    { id: 'table', name: 'picnic table', label: 'Picnic table', area: { left: 7, top: 48, width: 34, height: 24 }, destination: { x: 38, y: 84 } },
    { id: 'bbq', name: 'barbecue', label: 'Barbecue', area: { left: 61, top: 29, width: 30, height: 40 }, destination: { x: 68, y: 83 } },
    { id: 'hotdogs', name: 'package of hot dogs', label: 'Package of hot dogs', area: { left: 18, top: 40, width: 15, height: 9 }, destination: { x: 32, y: 82 } },
  ],
  items: [],
  initialState: () => ({ replyIndex: 0 }),
  interact: postpone,
  update: state => postpone(state),
};

/** Normal movement and verb controls, with only transient position and postponement replies. */
export function updateBackyard(state: GameState<BackyardState>, action: Action<BackyardAction>): Transition<BackyardState> {
  const result = update(state, action, backyard);
  let next = result.state;
  // Default object clicks approach and answer, even before choosing a verb.
  if (action.type === 'interact' && state.mode === 'walk' && backyard.props.some(prop => prop.id === action.prop)) {
    next = postpone(next, action.prop).state;
  } else if (action.type === 'restart') {
    next = { ...next, dialogue: { text: HOT_DOG_LINE } };
  }
  return {
    state: next,
    // The shared reducer requests saving movement; this isolated scene never saves or exits.
    effects: result.effects.filter(effect => effect.type === 'walk'),
  };
}
