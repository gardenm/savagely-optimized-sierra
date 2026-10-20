import { assertNever, clampPoint, freshProgress, say, type GameState, type Progress, type RoomDefinition, type Transition } from '../model';

export const ports = [1, 2, 3, 4] as const;
export type Port = typeof ports[number];
export type NortelState = Readonly<{
  patchbayOpen: boolean;
  a: Port | null;
  b: Port | null;
  feedback: string;
}>;
export type NortelAction =
  | { type: 'close-patchbay' }
  | { type: 'patch-port'; rack: 'a' | 'b'; port: Port };

const sourcePort: Port = 3;
const destinationPort: Port = 2;
export const circuit = { service: 'PDH', sourceShelf: 2, sourcePort, destinationShelf: 1, destinationPort } as const;
export const linkRestored = (progress: Progress) => progress.flags?.linkRestored === true;
export const configured = (progress: Progress) => linkRestored(progress) && progress.flags?.configured === true;
type State = GameState<NortelState>;

function openPatchbay(state: State): Transition<NortelState> {
  return { state: { ...state, room: { ...state.room, patchbayOpen: true, feedback: '' } }, effects: [] };
}

function interact(state: State, prop: string): Transition<NortelState> {
  const { mode } = state;
  if (state.selectedItem === 'fibre' && (mode === 'use' || mode === 'give')) {
    if ((prop === 'ome-a' || prop === 'ome-b') && mode === 'use') return openPatchbay(state);
    return say(state, '“Fibre has its uses. That isn’t one of them.”');
  }
  if (mode === 'pickup') {
    if (prop !== 'fibre') return say(state, '“I’d rather not carry a whole rack.”');
    if (linkRestored(state.progress)) return say(state, '“The patch lead is already earning its keep.”');
    if (state.progress.inventory.includes('fibre')) return say(state, '“One patch lead is plenty.”');
    return {
      state: { ...state, progress: { ...state.progress, inventory: [...state.progress.inventory, 'fibre'] }, dialogue: { text: '“A spare fibre. Positively luxurious.”' } },
      effects: [{ type: 'persist' }],
    };
  }
  if (mode === 'push' || mode === 'pull') return say(state, '“Gentle curves. This stuff is not garden hose.”');
  if (mode === 'talk') return say(state, '“The fans are doing most of the talking.”');
  if (mode === 'give') return say(state, '“A generous offer. No takers.”');
  if (mode === 'close') return say(state, '“Some things are best left connected.”');

  if (prop === 'door' && (mode === 'open' || mode === 'use')) {
    if (!configured(state.progress)) return say(state, linkRestored(state.progress) ? '“The link is up. The service isn’t.”' : '“Still an alarm behind me. That would bother me.”');
    return {
      state: { ...state, progress: { ...state.progress, completed: true }, selectedItem: null, dialogue: { text: '“Connected. On to the next thing.”' } },
      effects: [{ type: 'persist' }, { type: 'leave-room' }],
    };
  }
  if (prop === 'console' && (mode === 'use' || mode === 'open')) {
    if (!linkRestored(state.progress)) return say(state, '“No carrier. Even software needs something to work with.”');
    return {
      state: {
        ...state, progress: { ...state.progress, flags: { ...state.progress.flags, configured: true } },
        dialogue: { text: '“PDH configuration applied. A very satisfying absence of alarms.”' },
      },
      effects: [{ type: 'persist' }],
    };
  }
  if (prop === 'ome-a' || prop === 'ome-b') return openPatchbay(state);
  if (mode === 'open') return say(state, '“Nothing to open.”');
  switch (prop) {
    case 'circuit':
      return say(state, '“PDH circuit: OME A, shelf 2, port 3 → OME B, shelf 1, port 2.”');
    case 'fibre':
      return say(state, '“Yellow patch leads. More spare length than strictly necessary.”');
    case 'console':
      return say(state, '“The PDH configuration console. All the glamour of metro networking.”');
    case 'door':
      return say(state, '“There’s always another connection to make.”');
    default:
      return { state, effects: [] };
  }
}

function update(state: State, action: NortelAction): Transition<NortelState> {
  switch (action.type) {
    case 'close-patchbay':
      return { state: { ...state, room: { ...state.room, patchbayOpen: false } }, effects: [] };
    case 'patch-port': {
      if (!state.room.patchbayOpen || linkRestored(state.progress) || !ports.includes(action.port)) return { state, effects: [] };
      if (!state.progress.inventory.includes('fibre')) return { state: { ...state, room: { ...state.room, feedback: 'No patch lead.' } }, effects: [] };
      const selected = { ...state.room, [action.rack]: state.room[action.rack] === action.port ? null : action.port, feedback: '' };
      if (selected.a === null || selected.b === null) return { state: { ...state, room: selected }, effects: [] };
      if (selected.a !== sourcePort || selected.b !== destinationPort) return { state: { ...state, room: { ...selected, feedback: 'No carrier.' } }, effects: [] };
      return {
        state: {
          ...state, selectedItem: null,
          progress: { ...state.progress, inventory: state.progress.inventory.filter(item => item !== 'fibre'), flags: { ...state.progress.flags, linkRestored: true } },
          room: { ...selected, feedback: 'Carrier restored.' },
          dialogue: { text: '“There’s the light.”' },
        },
        effects: [{ type: 'persist' }],
      };
    }
    default:
      return assertNever(action);
  }
}

export const nortel: RoomDefinition<NortelState, NortelAction> = {
  id: 'nortel', title: 'Nortel', label: 'Nortel optical equipment lab', gameLabel: 'Playable Nortel room',
  art: {
    src: '/art/nortel-lab.webp', width: 1536, height: 1024,
    alt: 'A crooked cartoon telecom lab with teal OME racks, cream optical shelves, loops of yellow fibre, a patch bench, a circuit sheet, and a purple exit door.',
  },
  spawn: { x: 57, y: 87 }, bounds: { left: 38, right: 85, top: 73, bottom: 95 },
  props: [
    { id: 'ome-a', name: 'OME A', label: 'OME A', area: { left: 30, top: 12, width: 17, height: 44 }, destination: { x: 43, y: 78 } },
    { id: 'ome-b', name: 'OME B', label: 'OME B', area: { left: 52, top: 15, width: 17, height: 44 }, destination: { x: 62, y: 78 } },
    { id: 'fibre', name: 'spare fibre', label: 'Spare fibre', area: { left: 19, top: 49, width: 16, height: 13 }, destination: { x: 39, y: 86 } },
    { id: 'console', name: 'configuration console', label: 'Configuration console', area: { left: 6, top: 38, width: 16, height: 13 }, destination: { x: 38, y: 82 } },
    { id: 'circuit', name: 'circuit sheet', label: 'Circuit sheet', area: { left: 73, top: 15, width: 12, height: 28 }, destination: { x: 76, y: 78 } },
    { id: 'door', name: 'door', label: 'Door', area: { left: 86, top: 10, width: 14, height: 57 }, destination: { x: 84, y: 77 } },
  ],
  items: [{ id: 'fibre', name: 'fibre', label: 'Fibre patch lead', icon: 'fibre' }],
  initialState: progress => ({ patchbayOpen: false, a: linkRestored(progress) ? sourcePort : null, b: linkRestored(progress) ? destinationPort : null, feedback: '' }),
  interact, update,
};

export const nortelSave = {
  key: 'savagely-optimized:nortel:v1',
  decode(value: unknown): Progress {
    if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1) return freshProgress(nortel.spawn);
    const linked = 'linkRestored' in value && value.linkRestored === true;
    const service = linked && 'configured' in value && value.configured === true;
    return {
      inventory: !linked && 'fibre' in value && value.fibre === true ? ['fibre'] : [],
      completed: service && 'completed' in value && value.completed === true,
      position: clampPoint({ x: 'x' in value && typeof value.x === 'number' ? value.x : NaN, y: 'y' in value && typeof value.y === 'number' ? value.y : NaN }, nortel.bounds, nortel.spawn),
      flags: { linkRestored: linked, configured: service },
    };
  },
  encode(progress: Progress) {
    return { version: 1, fibre: progress.inventory.includes('fibre'), linkRestored: linkRestored(progress), configured: configured(progress), completed: progress.completed, x: progress.position.x, y: progress.position.y };
  },
};
