import { describe, expect, it } from 'vitest';
import type { Action, GameState } from '../../src/game/model';
import { configured, linkRestored, nortel, nortelSave, type NortelAction, type NortelState } from '../../src/game/rooms/nortel';
import { createInitialState, update } from '../../src/game/update';

const initial = () => createInitialState(nortel);
const room = (action: NortelAction): Action<NortelAction> => ({ type: 'room', action });
function act(state: GameState<NortelState>, ...actions: Action<NortelAction>[]) {
  return actions.reduce((state, action) => update(state, action, nortel).state, state);
}
const carrying = () => act(initial(), { type: 'select-mode', mode: 'pickup' }, { type: 'interact', prop: 'fibre' });
const open = () => act(carrying(), { type: 'select-item', item: 'fibre' }, { type: 'interact', prop: 'ome-a' });
const link = () => act(open(), room({ type: 'patch-port', rack: 'a', port: 3 }), room({ type: 'patch-port', rack: 'b', port: 2 }));
const configure = () => act(link(), room({ type: 'close-patchbay' }), { type: 'interact', prop: 'console' });

describe('Nortel optical lab', () => {
  it('reveals the circuit endpoints through inspection without granting progress', () => {
    const state = act(initial(), { type: 'select-mode', mode: 'look' }, { type: 'interact', prop: 'circuit' });
    expect(state.dialogue.text).toContain('OME A, shelf 2, port 3');
    expect(state.dialogue.text).toContain('OME B, shelf 1, port 2');
    expect(linkRestored(state.progress)).toBe(false);
  });

  it('picks up one lead and selects it through the shared inventory rules', () => {
    const state = act(carrying(), { type: 'interact', prop: 'fibre' }, { type: 'select-item', item: 'fibre' });
    expect(state.progress.inventory).toEqual(['fibre']);
    expect(state).toMatchObject({ mode: 'use', selectedItem: 'fibre' });
  });

  it('allows inspecting shelves but requires a lead to connect ports', () => {
    const state = act(initial(), { type: 'select-mode', mode: 'look' }, { type: 'interact', prop: 'ome-a' }, room({ type: 'patch-port', rack: 'a', port: 3 }), room({ type: 'patch-port', rack: 'b', port: 2 }));
    expect(state.room.patchbayOpen).toBe(true);
    expect(state.room.feedback).toBe('No patch lead.');
    expect(linkRestored(state.progress)).toBe(false);
  });

  it('requires an open patch bay before port actions can change state', () => {
    const state = carrying();
    expect(act(state, room({ type: 'patch-port', rack: 'a', port: 3 }))).toEqual(state);
  });

  it.each([[1, 1], [3, 1], [1, 2], [4, 4]] as const)('rejects the wrong optical path %s → %s', (a, b) => {
    const state = act(open(), room({ type: 'patch-port', rack: 'a', port: a }), room({ type: 'patch-port', rack: 'b', port: b }));
    expect(state.room.feedback).toBe('No carrier.');
    expect(linkRestored(state.progress)).toBe(false);
    expect(state.progress.inventory).toEqual(['fibre']);
  });

  it('restores carrier only for the complete correct path, consuming one lead', () => {
    const partial = act(open(), room({ type: 'patch-port', rack: 'a', port: 3 }));
    expect(linkRestored(partial.progress)).toBe(false);
    const result = update(partial, room({ type: 'patch-port', rack: 'b', port: 2 }), nortel);
    expect(linkRestored(result.state.progress)).toBe(true);
    expect(result.state.progress.inventory).toEqual([]);
    expect(result.state.selectedItem).toBeNull();
    expect(result.effects).toContainEqual({ type: 'persist' });
    expect(configured(result.state.progress)).toBe(false);
  });

  it('does not let the console configure an absent optical path', () => {
    const state = act(initial(), { type: 'select-mode', mode: 'use' }, { type: 'interact', prop: 'console' });
    expect(configured(state.progress)).toBe(false);
    expect(state.dialogue.text).toContain('No carrier');
  });

  it('preserves the completed patch and applies PDH configuration at the console', () => {
    const linked = link();
    expect(act(linked, room({ type: 'patch-port', rack: 'a', port: 1 }))).toEqual(linked);
    expect(configured(configure().progress)).toBe(true);
  });

  it.each([initial, link])('keeps the exit unavailable before the service is configured', create => {
    const state = act(create(), room({ type: 'close-patchbay' }), { type: 'select-mode', mode: 'open' });
    const result = update(state, { type: 'interact', prop: 'door' }, nortel);
    expect(result.state.progress.completed).toBe(false);
    expect(result.effects.some(effect => effect.type === 'leave-room')).toBe(false);
  });

  it('completes the chapter after configuration and returns to the chapter map', () => {
    const result = update(configure(), { type: 'interact', prop: 'door' }, nortel);
    expect(result.state.progress.completed).toBe(true);
    expect(result.effects).toContainEqual({ type: 'leave-room' });
  });

  it('persists link/configuration milestones and restores sockets without opening the dialog', () => {
    const progress = configure().progress;
    const loaded = nortelSave.decode(nortelSave.encode(progress));
    expect(loaded).toEqual(progress);
    expect(createInitialState(nortel, loaded).room).toMatchObject({ patchbayOpen: false, a: 3, b: 2 });
    expect(nortelSave.key).toBe('savagely-optimized:nortel:v1');
  });

  it('repairs inconsistent saves and rejects unknown formats and inventory', () => {
    expect(nortelSave.decode({ version: 2, configured: true })).toEqual(initial().progress);
    const progress = nortelSave.decode({ version: 1, configured: true, completed: true, fibre: 'true', x: 999, y: -10 });
    expect(configured(progress)).toBe(false);
    expect(progress.completed).toBe(false);
    expect(progress.inventory).toEqual([]);
    expect(progress.position).toEqual({ x: 85, y: 73 });
  });

  it('restart clears this chapter’s progress and patch selections', () => {
    expect(act(configure(), { type: 'restart' })).toEqual(initial());
  });
});
