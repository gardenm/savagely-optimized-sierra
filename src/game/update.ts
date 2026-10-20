import {
  assertNever, clampPoint, freshProgress, verbs,
  type Action, type GameState, type Mode, type Point,
  type RoomDefinition, type Transition,
} from './model';

export function createInitialState<S, A>(room: RoomDefinition<S, A>, progress = freshProgress(room.spawn)): GameState<S> {
  return {
    progress, mode: 'walk', activeProp: null, selectedItem: null,
    dialogue: { text: '' }, room: room.initialState(progress),
  };
}

function selectMode<S>(state: GameState<S>, mode: Mode): GameState<S> {
  return { ...state, mode, selectedItem: mode === 'use' || mode === 'give' ? state.selectedItem : null };
}

function move<S, A>(state: GameState<S>, to: Point, room: RoomDefinition<S, A>, marker = false): Transition<S> {
  const from = state.progress.position;
  to = clampPoint(to, room.bounds, room.spawn);
  const duration = Math.min(1.7, Math.max(.15, Math.hypot(to.x - from.x, to.y - from.y) / 21));
  return {
    state: { ...state, progress: { ...state.progress, position: to } },
    effects: [{ type: 'walk', from, to, duration, marker }, { type: 'persist' }],
  };
}

export function update<S, A>(state: GameState<S>, action: Action<A>, room: RoomDefinition<S, A>): Transition<S> {
  switch (action.type) {
    case 'select-mode':
      return { state: selectMode(state, action.mode), effects: [] };
    case 'point-at':
      return { state: { ...state, activeProp: room.props.some(prop => prop.id === action.prop) ? action.prop : null }, effects: [] };
    case 'walk': {
      const next = selectMode({ ...state, activeProp: null, dialogue: { text: '' } }, 'walk');
      return move(next, action.to, room, true);
    }
    case 'move':
      return move(state, {
        x: state.progress.position.x + action.by.x,
        y: state.progress.position.y + action.by.y,
      }, room);
    case 'interact': {
      const prop = room.props.find(prop => prop.id === action.prop);
      if (!prop) return { state, effects: [] };
      const movement = move({ ...state, activeProp: prop.id }, prop.destination, room);
      const result = state.mode === 'walk'
        ? { state: { ...movement.state, dialogue: { text: '' } }, effects: [] }
        : room.interact(movement.state, prop.id);
      return { state: result.state, effects: [...movement.effects, ...result.effects] };
    }
    case 'select-item': {
      if (!state.progress.inventory.includes(action.item)) return { state, effects: [] };
      if (state.mode === 'use') {
        const result = room.useInventoryItem?.(state, action.item);
        if (result) return result;
      }
      const selectedItem = state.selectedItem === action.item ? null : action.item;
      return {
        state: { ...state, selectedItem, mode: selectedItem && state.mode !== 'give' ? 'use' : state.mode },
        effects: [],
      };
    }
    case 'use-item': {
      if (!state.progress.inventory.includes(action.item)
        || (action.target !== undefined && !state.progress.inventory.includes(action.target))) return { state, effects: [] };
      return room.useInventoryItem?.(state, action.item, action.target) ?? { state, effects: [] };
    }
    case 'room':
      return room.update(state, action.action);
    case 'restart':
      return { state: createInitialState(room), effects: [{ type: 'persist' }] };
    default:
      return assertNever(action);
  }
}

export function commandText<S, A>(state: GameState<S>, room: RoomDefinition<S, A>): string {
  const action = state.mode === 'walk' ? 'Walk to' : verbs[state.mode];
  const item = room.items.find(item => item.id === state.selectedItem);
  const prefix = item && (state.mode === 'use' || state.mode === 'give')
    ? `${action} ${item.name} ${state.mode === 'give' ? 'to' : 'with'}` : action;
  const prop = room.props.find(prop => prop.id === state.activeProp);
  return prop ? `${prefix} ${prop.name}` : state.mode === 'walk' ? '' : prefix;
}
