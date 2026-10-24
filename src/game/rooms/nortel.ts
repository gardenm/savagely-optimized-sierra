import { assertNever, clampPoint, freshProgress, say, type GameState, type Progress, type RoomDefinition, type Transition } from '../model';

export type NortelState = Readonly<{ tripped: boolean }>;
export type NortelAction = { type: 'reset-equipment' };
export const linkRestored = (progress: Progress) => progress.flags?.linkRestored === true;
export const strapWorn = (progress: Progress) => progress.inventory.includes('strap') && progress.flags?.strapWorn === true;
const tripLine = '“Pop. Ah. Static electricity. It’s running a self-test…”';
type State = GameState<NortelState>;

function wearStrap(state: State): Transition<NortelState> {
  if (strapWorn(state.progress)) return say(state, '“Already strapped in and grounded.”');
  return {
    state: {
      ...state, selectedItem: null,
      progress: { ...state.progress, inventory: state.progress.inventory.includes('strap') ? state.progress.inventory : [...state.progress.inventory, 'strap'], flags: { ...state.progress.flags, strapWorn: true } },
      dialogue: { text: '“Strapped in. Grounded. Fashionable.”' },
    },
    effects: [{ type: 'persist' }],
  };
}

function resetEquipment(state: State): Transition<NortelState> {
  if (!state.room.tripped) return { state, effects: [] };
  return {
    state: { ...state, room: { tripped: false }, dialogue: state.dialogue.text === tripLine ? { text: '“Self-test passed. Nothing permanently fried.”' } : state.dialogue },
    effects: [],
  };
}

function interact(state: State, prop: string): Transition<NortelState> {
  const { mode } = state;
  if (state.selectedItem && state.selectedItem !== 'strap' && (mode === 'use' || mode === 'give')) return say(state, '“That won’t help with this.”');
  if (prop === 'strap') {
    if (mode === 'use') return wearStrap(state);
    if (mode === 'pickup') {
      if (state.progress.inventory.includes('strap')) return say(state, '“I’ve got it.”');
      return {
        state: { ...state, progress: { ...state.progress, inventory: [...state.progress.inventory, 'strap'] }, dialogue: { text: '“An anti-static wrist strap.”' } },
        effects: [{ type: 'persist' }],
      };
    }
    return say(state, '“An anti-static wrist strap, complete with grounding lead.”');
  }
  if (prop === 'console' && (mode === 'use' || mode === 'push' || mode === 'open')) {
    if (state.room.tripped) {
      const reset = resetEquipment(state);
      return { ...reset, state: { ...reset.state, dialogue: { text: '“Reset. Fans spinning. Crisis downgraded.”' } } };
    }
    return say(state, linkRestored(state.progress) ? '“No alarms. A beautiful sight.”' : '“Loss of signal. Somewhere, a connection is missing.”');
  }
  const electronics = prop === 'ome-a' || prop === 'ome-b' || prop === 'cable';
  const touching = mode === 'use' || mode === 'open' || mode === 'close' || mode === 'pickup' || mode === 'push' || mode === 'pull';
  if (electronics && touching) {
    if (state.selectedItem === 'strap' && mode === 'use') return wearStrap(state);
    if (state.room.tripped) return say(state, '“Still running its self-test.”');
    if (!strapWorn(state.progress)) return { state: { ...state, selectedItem: null, room: { tripped: true }, dialogue: { text: tripLine } }, effects: [] };
    if (prop === 'cable' && (mode === 'use' || mode === 'push')) {
      if (linkRestored(state.progress)) return say(state, '“Already snug.”');
      return {
        state: { ...state, selectedItem: null, progress: { ...state.progress, flags: { ...state.progress.flags, linkRestored: true } }, dialogue: { text: '“Click. There’s the light.”' } },
        effects: [{ type: 'persist' }],
      };
    }
    return say(state, prop === 'cable' ? '“The other end is already connected.”' : '“Cards seated. Best leave them there.”');
  }
  if (prop === 'door' && (mode === 'open' || mode === 'use')) {
    return {
      state: { ...state, selectedItem: null, dialogue: { text: linkRestored(state.progress) ? '“Connected. On to the next thing.”' : '“A change of scene.”' } },
      effects: [{ type: 'leave-room' }],
    };
  }
  if (mode === 'talk') return say(state, '“The fans are doing most of the talking.”');
  if (mode === 'give') return say(state, '“A generous offer. No takers.”');
  switch (prop) {
    case 'ome-a': case 'ome-b': return say(state, state.room.tripped ? '“A temporarily very expensive paperweight.”' : linkRestored(state.progress) ? '“Steady green lights. Lovely.”' : '“An OME rack. One rather insistent alarm.”');
    case 'cable': return say(state, linkRestored(state.progress) ? '“Connected.”' : '“A loose fibre connector. That would explain it.”');
    case 'circuit': return say(state, '“A circuit diagram. Somehow there are always more cables than lines.”');
    case 'console': return say(state, '“The lab console. Complete with reset button.”');
    case 'door': return say(state, '“There’s always another connection to make.”');
    default: return { state, effects: [] };
  }
}

export const nortel: RoomDefinition<NortelState, NortelAction> = {
  id: 'nortel', title: 'Nortel', label: 'Nortel optical equipment lab', gameLabel: 'Playable Nortel room',
  art: {
    src: '/art/nortel-lab-dott.png', width: 1536, height: 1024,
    alt: 'A crooked cartoon telecom lab with teal OME racks, cream optical shelves, loops of yellow fibre, a patch bench, a circuit sheet, and a purple exit door.',
  },
  spawn: { x: 57, y: 87 }, bounds: { left: 38, right: 85, top: 73, bottom: 95 },
  props: [
    { id: 'ome-a', name: 'OME A', label: 'OME A', area: { left: 30, top: 12, width: 14, height: 44 }, destination: { x: 43, y: 78 } },
    { id: 'ome-b', name: 'OME B', label: 'OME B', area: { left: 56, top: 15, width: 13, height: 44 }, destination: { x: 62, y: 78 } },
    { id: 'strap', name: 'anti-static strap', label: 'Anti-static strap', area: { left: 6, top: 53, width: 13, height: 12 }, destination: { x: 39, y: 86 } },
    { id: 'cable', name: 'loose cable', label: 'Loose cable', area: { left: 44, top: 44, width: 10, height: 15 }, destination: { x: 49, y: 79 } },
    { id: 'console', name: 'lab console', label: 'Lab console', area: { left: 6, top: 38, width: 16, height: 13 }, destination: { x: 38, y: 82 } },
    { id: 'circuit', name: 'circuit sheet', label: 'Circuit sheet', area: { left: 73, top: 15, width: 12, height: 28 }, destination: { x: 76, y: 78 } },
    { id: 'door', name: 'door', label: 'Door', area: { left: 86, top: 10, width: 14, height: 57 }, destination: { x: 84, y: 77 } },
  ],
  items: [{ id: 'strap', name: 'anti-static strap', label: 'Anti-static strap in inventory', icon: 'strap', worn: { flag: 'strapWorn', label: 'Anti-static strap, worn and grounded' } }],
  initialState: () => ({ tripped: false }),
  interact,
  useInventoryItem: (state, item, target) => item === 'strap' && target === undefined ? wearStrap(state) : undefined,
  update(state, action) {
    switch (action.type) {
      case 'reset-equipment': return resetEquipment(state);
      default: return assertNever(action.type);
    }
  },
};

export const nortelSave = {
  // Keep the original storage location; the payload version handles migration.
  key: 'savagely-optimized:nortel:v1',
  decode(value: unknown): Progress {
    if (!value || typeof value !== 'object' || !('version' in value) || (value.version !== 1 && value.version !== 2)) return freshProgress(nortel.spawn);
    const oldLinked = value.version === 1 && 'linkRestored' in value && value.linkRestored === true;
    const strap = oldLinked || ('strap' in value && value.strap === true);
    const worn = strap && (oldLinked || ('strapWorn' in value && value.strapWorn === true));
    const linked = worn && 'linkRestored' in value && value.linkRestored === true;
    return {
      inventory: strap ? ['strap'] : [],
      completed: linked && 'completed' in value && value.completed === true,
      position: clampPoint({ x: 'x' in value && typeof value.x === 'number' ? value.x : NaN, y: 'y' in value && typeof value.y === 'number' ? value.y : NaN }, nortel.bounds, nortel.spawn),
      flags: { strapWorn: worn, linkRestored: linked },
    };
  },
  encode(progress: Progress) {
    return { version: 2, strap: progress.inventory.includes('strap'), strapWorn: strapWorn(progress), linkRestored: linkRestored(progress), completed: progress.completed, x: progress.position.x, y: progress.position.y };
  },
};
