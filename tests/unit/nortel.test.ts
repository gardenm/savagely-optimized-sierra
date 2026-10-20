import { describe, expect, it } from 'vitest';
import type { Action, GameState, Mode } from '../../src/game/model';
import { linkRestored, strapWorn, nortel, nortelSave, type NortelAction, type NortelState } from '../../src/game/rooms/nortel';
import { createInitialState, update } from '../../src/game/update';

const initial = () => createInitialState(nortel);
function act(state: GameState<NortelState>, ...actions: Action<NortelAction>[]) {
  return actions.reduce((state, action) => update(state, action, nortel).state, state);
}
const touch = (prop: string, mode: Mode = 'use'): Action<NortelAction>[] => [{ type: 'select-mode', mode }, { type: 'interact', prop }];
const carrying = () => act(initial(), ...touch('strap', 'pickup'));
const grounded = () => act(initial(), ...touch('strap'));
const connected = () => act(grounded(), ...touch('cable'));
const reset: Action<NortelAction> = { type: 'room', action: { type: 'reset-equipment' } };

describe('Nortel static and loose cable puzzle', () => {
  it.each(['look', 'walk', 'talk'] as const)('allows %s without a static discharge', mode => {
    for (const prop of ['ome-a', 'ome-b', 'cable']) expect(act(initial(), ...touch(prop, mode)).room.tripped).toBe(false);
  });

  it.each(['use', 'open', 'close', 'pickup', 'push', 'pull'] as const)('trips on %s of ungrounded electronics without granting progress', mode => {
    for (const prop of ['ome-a', 'ome-b', 'cable']) {
      const state = act(initial(), ...touch(prop, mode));
      expect(state.room.tripped).toBe(true);
      expect(linkRestored(state.progress)).toBe(false);
      expect(state.dialogue.text).toContain('Pop.');
    }
  });

  it('carrying the strap does not protect you until you wear it', () => {
    expect(strapWorn(carrying().progress)).toBe(false);
    expect(act(carrying(), ...touch('cable')).room.tripped).toBe(true);
    expect(strapWorn(grounded().progress)).toBe(true);
    expect(grounded().progress.inventory).toEqual(['strap']);
  });

  it('wears a collected strap from inventory and never duplicates it', () => {
    const state = act(carrying(), { type: 'select-mode', mode: 'use' }, { type: 'select-item', item: 'strap' });
    expect(strapWorn(state.progress)).toBe(true);
    expect(state.selectedItem).toBeNull();
    expect(act(state, { type: 'select-item', item: 'strap' }).progress.inventory).toEqual(['strap']);
    expect(act(initial(), { type: 'select-item', item: 'strap' }).progress.inventory).toEqual([]);
  });

  it('can also use a selected strap on the rack before touching its electronics', () => {
    const state = act(carrying(), { type: 'select-item', item: 'strap' }, { type: 'interact', prop: 'ome-a' });
    expect(strapWorn(state.progress)).toBe(true);
    expect(state.room.tripped).toBe(false);
  });

  it('blocks reconnecting during a fault, even after putting the strap on', () => {
    const fault = act(initial(), ...touch('cable'), ...touch('strap'), ...touch('cable'));
    expect(fault.room.tripped).toBe(true);
    expect(linkRestored(fault.progress)).toBe(false);
    expect(linkRestored(act(fault, reset, ...touch('cable')).progress)).toBe(true);
  });

  it('self-test restores equipment and an ungrounded second touch trips it again', () => {
    const state = act(initial(), ...touch('ome-a'), reset);
    expect(state.room.tripped).toBe(false);
    expect(state.dialogue.text).toContain('Nothing permanently fried');
    expect(act(state, ...touch('ome-b')).room.tripped).toBe(true);
  });

  it('console resets immediately, and automatic recovery preserves newer inspection dialogue', () => {
    const fault = act(initial(), ...touch('ome-a'));
    const inspected = act(fault, ...touch('circuit', 'look'));
    expect(act(inspected, reset).dialogue).toEqual(inspected.dialogue);
    expect(act(fault, ...touch('console'))).toMatchObject({ room: { tripped: false }, dialogue: { text: '“Reset. Fans spinning. Crisis downgraded.”' } });
  });

  it('only needs a grounded reconnection, with no configuration step', () => {
    const state = connected();
    expect(linkRestored(state.progress)).toBe(true);
    expect(state.room.tripped).toBe(false);
    const result = update(act(state, { type: 'select-mode', mode: 'open' }), { type: 'interact', prop: 'door' }, nortel);
    expect(result.state.progress.completed).toBe(true);
    expect(result.effects).toContainEqual({ type: 'leave-room' });
    expect(act(state, ...touch('cable')).progress).toEqual(state.progress);
  });

  it('keeps the door closed until connected and clears transient faults on reload', () => {
    for (const state of [initial(), act(initial(), ...touch('ome-a'))]) {
      expect(update(act(state, { type: 'select-mode', mode: 'open' }), { type: 'interact', prop: 'door' }, nortel).effects).not.toContainEqual({ type: 'leave-room' });
    }
    const fault = act(initial(), ...touch('cable'));
    const loaded = createInitialState(nortel, nortelSave.decode(nortelSave.encode(fault.progress)));
    expect(loaded.room.tripped).toBe(false);
    expect(linkRestored(loaded.progress)).toBe(false);
  });

  it('round-trips each new progress milestone and migrates old completed or linked saves', () => {
    for (const state of [carrying(), grounded(), connected()]) {
      const loaded = nortelSave.decode(nortelSave.encode(state.progress));
      expect(loaded.inventory).toEqual(state.progress.inventory);
      expect(strapWorn(loaded)).toBe(strapWorn(state.progress));
      expect(linkRestored(loaded)).toBe(linkRestored(state.progress));
    }
    const legacy = nortelSave.decode({ version: 1, linkRestored: true, configured: true, completed: true, x: 60, y: 85 });
    expect(legacy).toMatchObject({ inventory: ['strap'], completed: true, flags: { strapWorn: true, linkRestored: true } });
    expect(linkRestored(nortelSave.decode({ version: 1, linkRestored: true, configured: false }))).toBe(true);
    expect(nortelSave.key).toBe('savagely-optimized:nortel:v1');
    expect(nortelSave.encode(legacy).version).toBe(2);
  });

  it('rejects unknown formats and repairs inconsistent flags, inventory and coordinates', () => {
    expect(nortelSave.decode({ version: 3 })).toEqual(initial().progress);
    const progress = nortelSave.decode({ version: 2, strap: 'true', strapWorn: true, linkRestored: true, completed: true, inventory: ['fibre'], x: 999, y: -10 });
    expect(progress).toMatchObject({ inventory: [], completed: false, flags: { strapWorn: false, linkRestored: false }, position: { x: 85, y: 73 } });
  });

  it('restart clears both saved milestones and a pending fault', () => {
    expect(act(connected(), { type: 'restart' })).toEqual(initial());
    expect(act(initial(), ...touch('cable'), { type: 'restart' })).toEqual(initial());
  });
});
