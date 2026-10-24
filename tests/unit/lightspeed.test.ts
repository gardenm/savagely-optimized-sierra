import { describe, expect, it } from 'vitest';
import { adventureRooms, adventureSave, applyRoomProgress, freshAdventure, roomProgress } from '../../src/game/adventure';
import type { Action } from '../../src/game/model';
import type { StoryAction } from '../../src/game/story/model';
import { createInitialState, update } from '../../src/game/update';

const room = adventureRooms.lightspeed;
describe('Lightspeed scene integration', () => {
  it('prints one readable faulty receipt and carries it into the real SMART scene', () => {
    let state = createInitialState(room, roomProgress(freshAdventure('lightspeed'), 'lightspeed'));
    const step = (action: Action<StoryAction>) => { const result = update(state, action, room); state = result.state; return result; };
    expect(state.dialogue.text).toBe('');
    step({ type: 'select-mode', mode: 'use' });
    step({ type: 'interact', prop: 'till' });
    expect(state.dialogue.text).toContain('Two coffees at $3 each. Total: $3.00');
    step({ type: 'interact', prop: 'till' });
    expect(state.progress.inventory).toEqual(['faulty-receipt']);
    step({ type: 'select-mode', mode: 'look' });
    step({ type: 'interact', prop: 'printer' });
    expect(state.dialogue.text).toContain('2 coffees × $3.00. Total: $3.00');
    const world = applyRoomProgress(freshAdventure('lightspeed'), 'lightspeed', state.progress);
    expect(adventureSave.decode(adventureSave.encode(world))).toEqual(world);
    const board = adventureRooms.smart;
    let smart = createInitialState(board, roomProgress(world, 'smart'));
    smart = update(smart, { type: 'select-item', item: 'faulty-receipt' }, board).state;
    smart = update(smart, { type: 'interact', prop: 'whiteboard' }, board).state;
    expect(smart.progress.flags?.exampleOnBoard).toBe(true);
    expect(smart.progress.inventory).toEqual(['faulty-receipt']);
    expect(smart.progress.completed).toBe(false);
  });

  it('requires the future pick, retains it, exhausts the clip source and leaves travel free', () => {
    let state = createInitialState(room, { ...roomProgress(freshAdventure(), 'lightspeed'), inventory: ['ticket', 'guitar-pick'] });
    const step = (action: Action<StoryAction>) => { const result = update(state, action, room); state = result.state; return result; };
    step({ type: 'select-mode', mode: 'open' });
    step({ type: 'interact', prop: 'drawer' });
    expect(state.dialogue.text).toContain('Jammed');
    step({ type: 'select-mode', mode: 'pickup' });
    step({ type: 'interact', prop: 'clip' });
    expect(state.progress.inventory).not.toContain('retaining-clip');
    step({ type: 'select-item', item: 'ticket' });
    step({ type: 'interact', prop: 'drawer' });
    expect(state.progress.flags?.drawerOpen).not.toBe(true);
    step({ type: 'select-mode', mode: 'walk' });
    step({ type: 'select-item', item: 'guitar-pick' });
    step({ type: 'interact', prop: 'drawer' });
    step({ type: 'select-mode', mode: 'pickup' });
    step({ type: 'interact', prop: 'clip' });
    step({ type: 'interact', prop: 'clip' });
    expect(state.progress.inventory).toEqual(['ticket', 'guitar-pick', 'retaining-clip']);
    const saved = applyRoomProgress(freshAdventure('lightspeed'), 'lightspeed', state.progress);
    expect(adventureSave.decode(adventureSave.encode(saved))).toEqual(saved);
    step({ type: 'select-mode', mode: 'open' });
    expect(step({ type: 'interact', prop: 'door' }).effects).toContainEqual({ type: 'leave-room' });
    expect(state.progress.completed).toBe(false);
  });

  it.each([1, 2])('preserves a deployed v%s world while adding the Lightspeed position', version => {
    const before = { version, currentRoom: 'nortel', inventory: ['ticket', 'strap'], completed: false,
      positions: { mcgill: { x: 65, y: 90 }, nortel: { x: 60, y: 85 }, smart: { x: 62, y: 86 } },
      flags: { strapWorn: true, linkRestored: true } };
    const restored = adventureSave.decode(before)!;
    expect(restored).toMatchObject({ inventory: before.inventory, flags: before.flags, positions: before.positions });
    expect(restored.positions.lightspeed).toEqual(room.spawn);
    expect(adventureSave.encode(restored).version).toBe(3);
    expect(adventureSave.key).toBe('savagely-optimized:adventure:v1');
  });

  it('protects impossible drawer states and unsupported payloads instead of dropping items', () => {
    const saved = adventureSave.encode(freshAdventure('lightspeed'));
    for (const invalid of [
      { ...saved, version: 4 },
      { ...saved, version: 2 },
      { ...saved, inventory: ['retaining-clip'] },
      { ...saved, flags: { ...saved.flags, clipTaken: true, drawerOpen: true } },
      { ...saved, inventory: ['retaining-clip'], flags: { ...saved.flags, clipTaken: true } },
      { ...saved, flags: { ...saved.flags, drawerOpen: 'yes' } },
    ]) expect(adventureSave.decode(invalid)).toBeNull();
  });
});
