import { describe, expect, it } from 'vitest';
import { say, type Action, type GameState, type RoomDefinition } from '../../src/game/model';
import { commandText, createInitialState, update } from '../../src/game/update';

// A different room proves the shared reducer has no dependency on McGill's puzzle.
type WorkshopState = Readonly<{ lightOn: boolean }>;
type WorkshopAction = { type: 'switch-light' };
const workshop: RoomDefinition<WorkshopState, WorkshopAction> = {
  id: 'workshop', title: 'Workshop', label: 'A workshop', gameLabel: 'Playable workshop',
  art: { src: '/workshop.webp', alt: 'Workshop', width: 100, height: 100 },
  spawn: { x: 20, y: 30 }, bounds: { left: 0, right: 100, top: 10, bottom: 90 },
  props: [{ id: 'lamp', name: 'lamp', label: 'Lamp', area: { left: 1, top: 1, width: 10, height: 10 }, destination: { x: 50, y: 50 } }],
  items: [{ id: 'key', name: 'key', label: 'Key', icon: 'key' }],
  initialState: () => ({ lightOn: false }),
  interact: state => say(state, 'A lamp.'),
  update: state => ({ state: { ...state, room: { lightOn: !state.room.lightOn } }, effects: [] }),
};
const initial = () => createInitialState(workshop);
const step = (state: GameState<WorkshopState>, action: Action<WorkshopAction>) => update(state, action, workshop);

function freeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

describe('shared game reducer', () => {
  it('keeps independent sessions and computes deterministic transitions without mutating input', () => {
    const before = freeze(initial());
    const action = { type: 'interact', prop: 'lamp' } as const;
    expect(step(before, action)).toEqual(step(before, action));
    expect(before.progress.position).toEqual({ x: 20, y: 30 });
    expect(initial()).toEqual(before);
  });

  it('walking approaches an object without inspecting it', () => {
    const result = step(initial(), { type: 'interact', prop: 'lamp' });
    expect(result.state.progress.position).toEqual({ x: 50, y: 50 });
    expect(result.state.dialogue.text).toBe('');
    expect(result.effects).toContainEqual({ type: 'persist' });
  });

  it('delegates an inspection and custom actions to the supplied room', () => {
    const looking = step(initial(), { type: 'select-mode', mode: 'look' }).state;
    expect(step(looking, { type: 'interact', prop: 'lamp' }).state.dialogue.text).toBe('A lamp.');
    expect(step(initial(), { type: 'room', action: { type: 'switch-light' } }).state.room.lightOn).toBe(true);
  });

  it('clamps walking to this room’s bounds and clears temporary selection and speech', () => {
    const before = { ...initial(), mode: 'use' as const, selectedItem: 'key', dialogue: { text: 'Earlier response.' } };
    const result = step(before, { type: 'walk', to: { x: -500, y: 500 } });
    expect(result.state.progress.position).toEqual({ x: 0, y: 90 });
    expect(result.state).toMatchObject({ mode: 'walk', selectedItem: null, activeProp: null, dialogue: { text: '' } });
    expect(result.effects).toContainEqual(expect.objectContaining({ type: 'walk', marker: true }));
  });

  it('bounds keyboard movement and finite animation durations, including invalid coordinates', () => {
    const result = step(initial(), { type: 'move', by: { x: 500, y: -500 } });
    expect(result.state.progress.position).toEqual({ x: 100, y: 10 });
    const movement = result.effects.find(effect => effect.type === 'walk');
    expect(movement).toMatchObject({ duration: 1.7, marker: false });
    expect(step(initial(), { type: 'walk', to: { x: NaN, y: Infinity } }).state.progress.position).toEqual(workshop.spawn);
  });

  it('rejects unowned items and unknown objects without moving or saving', () => {
    const state = initial();
    expect(step(state, { type: 'select-item', item: 'key' })).toEqual({ state, effects: [] });
    expect(step(state, { type: 'interact', prop: 'missing' })).toEqual({ state, effects: [] });
  });

  it('keeps an inventory selection for Give and Use, clears it for other verbs, and supports deselection', () => {
    const carrying = { ...initial(), progress: { ...initial().progress, inventory: ['key'] } };
    const selected = step(carrying, { type: 'select-item', item: 'key' }).state;
    expect(selected).toMatchObject({ mode: 'use', selectedItem: 'key' });
    const giving = step(selected, { type: 'select-mode', mode: 'give' }).state;
    expect(giving.selectedItem).toBe('key');
    expect(step(giving, { type: 'select-item', item: 'key' }).state).toMatchObject({ mode: 'give', selectedItem: null });
    expect(step(selected, { type: 'select-mode', mode: 'look' }).state.selectedItem).toBeNull();
  });

  it('derives contextual sentences without saving hover state', () => {
    const state = step(initial(), { type: 'point-at', prop: 'lamp' });
    expect(commandText(initial(), workshop)).toBe('');
    expect(commandText(state.state, workshop)).toBe('Walk to lamp');
    expect(state.effects).toEqual([]);
    const carrying = { ...state.state, mode: 'give' as const, selectedItem: 'key' };
    expect(commandText(carrying, workshop)).toBe('Give key to lamp');
    expect(commandText({ ...carrying, mode: 'use' }, workshop)).toBe('Use key with lamp');
  });

  it('validates both item-use operands and delegates a valid atomic recipe without moving', () => {
    const room: RoomDefinition<WorkshopState, WorkshopAction> = {
      ...workshop,
      useInventoryItem: (state, item, target) => ({
        state: { ...state, dialogue: { text: `${item} with ${target}` } }, effects: [],
      }),
    };
    const carrying = { ...initial(), progress: { ...initial().progress, inventory: ['key', 'lock'] } };
    expect(update(carrying, { type: 'use-item', item: 'missing', target: 'lock' }, room)).toEqual({ state: carrying, effects: [] });
    expect(update(carrying, { type: 'use-item', item: 'key', target: 'missing' }, room)).toEqual({ state: carrying, effects: [] });
    const used = update(carrying, { type: 'use-item', item: 'key', target: 'lock' }, room);
    expect(used.state.dialogue.text).toBe('key with lock');
    expect(used.state.progress).toBe(carrying.progress);
    expect(used.effects).toEqual([]);
  });

  it('restarts both room progress and temporary state without sharing previous references', () => {
    const state = { ...initial(), room: { lightOn: true }, progress: { inventory: ['key'], completed: true, position: { x: 50, y: 50 } } };
    const result = step(state, { type: 'restart' });
    expect(result.state).toEqual(initial());
    expect(result.state.progress).not.toBe(state.progress);
    expect(result.effects).toEqual([{ type: 'persist' }]);
  });
});
