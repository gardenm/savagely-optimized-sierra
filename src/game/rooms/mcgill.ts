import { assertNever, clampPoint, freshProgress, say, type GameState, type Progress, type RoomDefinition, type Transition } from '../model';

export type McGillState = Readonly<{
  computerOpen: boolean;
  recommendation: 'initial' | 'incomplete' | 'no-match' | 'match' | 'claimed';
}>;
export type McGillAction =
  | { type: 'close-computer' }
  | { type: 'recommend'; genres: readonly string[] }
  | { type: 'take-ticket' };

export const researchPaper = {
  label: 'Read the paper (PDF)',
  url: 'https://cim.mcgill.ca/~mrl/pubs/mgarden/garden-semantic-eee05.pdf',
} as const;

export const genres = ['Adventure', 'Comedy', 'Sci-fi', 'Horror', 'Documentary', 'Romance'] as const;
const solution = ['Adventure', 'Comedy', 'Sci-fi'];

function hasTicket(state: GameState<McGillState>): boolean {
  return state.progress.inventory.includes('ticket');
}

function openComputer(state: GameState<McGillState>): Transition<McGillState> {
  return {
    state: { ...state, room: { computerOpen: true, recommendation: hasTicket(state) ? 'claimed' : 'initial' } },
    effects: [],
  };
}

function leaveRoom(state: GameState<McGillState>): Transition<McGillState> {
  if (!hasTicket(state)) return say(state, '“An unlocked door. A very big decision.”');
  return {
    state: { ...state, progress: { ...state.progress, completed: true }, selectedItem: null, dialogue: { text: '“Time for a change of scene.”' } },
    effects: [{ type: 'persist' }, { type: 'leave-room', nextRoom: 'nortel' }],
  };
}

function interact(state: GameState<McGillState>, prop: string): Transition<McGillState> {
  const { mode } = state;
  if ((mode === 'use' || mode === 'give') && state.selectedItem === 'ticket') {
    return prop === 'door' ? leaveRoom(state) : say(state, '“That doesn’t look like a ticket reader.”');
  }
  if (mode === 'pickup') return say(state, prop === 'papers' ? '“I’m travelling light.”' : '“That can stay here.”');
  if (mode === 'push' || mode === 'pull') return say(state, prop === 'papers' ? '“Peer pressure won’t improve them.”' : '“It’s fine where it is.”');
  if (mode === 'close') return say(state, prop === 'door' ? '“I’ve spent long enough in this room.”' : '“It’s already closed.”');
  if (mode === 'give') return say(state, '“I came here to give my two cents. They kept the change.”');
  if (mode === 'talk') return prop === 'computer' ? openComputer(state) : say(state, '“No reply. A familiar peer-review experience.”');
  if (mode === 'open') {
    if (prop === 'door') return leaveRoom(state);
    return prop === 'computer' ? openComputer(state) : say(state, '“Nothing to open.”');
  }
  switch (prop) {
    case 'computer':
      return mode === 'use' ? openComputer(state) : say(state, '“Recommendz. Movie research with Greg Dudek, and a computer that has watched none of these films.”');
    case 'papers':
      return say(state, '“An MSc earned. Papers published. Two years of a PhD. Quite a stack.”', researchPaper);
    case 'board':
      return say(state, '“A note from the high-school CS class I mentor. Helping someone figure it out never gets old.”');
    case 'records': {
      const result = say(state, '“Good code deserves a good soundtrack.”');
      return mode === 'use' ? { ...result, effects: [{ type: 'toggle-sound' }] } : result;
    }
    case 'door':
      return mode === 'use' && hasTicket(state) ? leaveRoom(state) : say(state, '“An unlocked door. A very big decision.”');
    default:
      return { state, effects: [] };
  }
}

function update(state: GameState<McGillState>, action: McGillAction): Transition<McGillState> {
  switch (action.type) {
    case 'close-computer':
      return { state: { ...state, room: { ...state.room, computerOpen: false } }, effects: [] };
    case 'recommend': {
      if (!state.room.computerOpen || hasTicket(state)) return { state, effects: [] };
      const unique = new Set(action.genres);
      const recommendation = unique.size !== 3 || action.genres.length !== 3 ? 'incomplete'
        : solution.every(genre => unique.has(genre)) ? 'match' : 'no-match';
      return { state: { ...state, room: { ...state.room, recommendation } }, effects: [] };
    }
    case 'take-ticket': {
      if (!state.room.computerOpen || !['match', 'claimed'].includes(state.room.recommendation)) return { state, effects: [] };
      return {
        state: {
          ...state, mode: 'use', selectedItem: 'ticket',
          progress: { ...state.progress, inventory: hasTicket(state) ? state.progress.inventory : [...state.progress.inventory, 'ticket'] },
          room: { ...state.room, computerOpen: false },
          dialogue: { text: '“One admission. Destination unspecified.”' },
        },
        effects: [{ type: 'persist' }],
      };
    }
    default:
      return assertNever(action);
  }
}

export const mcgill: RoomDefinition<McGillState, McGillAction> = {
  id: 'mcgill', title: 'McGill University, 2006', label: 'McGill research lab', gameLabel: 'Playable McGill room',
  art: {
    src: '/art/mcgill-lab.webp', width: 1536, height: 1024,
    alt: 'A goofy cartoon university lab with crooked purple walls, a giant green CRT, leaning papers, a record player, and a lopsided door above chunky orange floorboards.',
  },
  spawn: { x: 57, y: 86 }, bounds: { left: 40, right: 80, top: 72, bottom: 94 },
  props: [
    { id: 'computer', name: 'computer', label: 'Computer', area: { left: 11, top: 33, width: 16, height: 19 }, destination: { x: 43, y: 83 } },
    { id: 'papers', name: 'research papers', label: 'Research papers', area: { left: 28, top: 39, width: 16, height: 13 }, destination: { x: 46, y: 81 } },
    { id: 'board', name: 'noticeboard', label: 'Noticeboard', area: { left: 1, top: 2, width: 19, height: 30 }, destination: { x: 40, y: 78 } },
    { id: 'records', name: 'record player', label: 'Record player', area: { left: 86, top: 33, width: 14, height: 20 }, destination: { x: 79, y: 88 } },
    { id: 'door', name: 'door', label: 'Door', area: { left: 74, top: 4, width: 15, height: 57 }, destination: { x: 76, y: 75 } },
  ],
  items: [{ id: 'ticket', name: 'ticket', label: 'Next-chapter ticket', icon: 'ticket' }],
  initialState: () => ({ computerOpen: false, recommendation: 'initial' }),
  interact, update,
};

/** Preserve the deployed v1 wire format and key; transient UI state is never saved. */
export const mcgillSave = {
  key: 'savagely-optimized:mcgill:v1',
  decode(value: unknown): Progress {
    if (!value || typeof value !== 'object' || !('ticket' in value) || !('completed' in value)
      || typeof value.ticket !== 'boolean' || typeof value.completed !== 'boolean') return freshProgress(mcgill.spawn);
    const position = clampPoint({
      x: 'x' in value && typeof value.x === 'number' ? value.x : NaN,
      y: 'y' in value && typeof value.y === 'number' ? value.y : NaN,
    }, mcgill.bounds, mcgill.spawn);
    return { inventory: value.ticket ? ['ticket'] : [], completed: value.completed && value.ticket, position };
  },
  encode(progress: Progress) {
    return { ticket: progress.inventory.includes('ticket'), completed: progress.completed, x: progress.position.x, y: progress.position.y };
  },
};
