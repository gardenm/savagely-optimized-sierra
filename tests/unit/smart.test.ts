import { describe, expect, it } from 'vitest';
import { adventureRooms, adventureSave, applyRoomProgress, freshAdventure, roomProgress } from '../../src/game/adventure';
import { createInitialState, update } from '../../src/game/update';
import type { Action } from '../../src/game/model';
import type { StoryAction } from '../../src/game/story/model';

const room = adventureRooms.smart;
describe('SMART scene integration', () => {
  it('offers era-appropriate office props and free travel without inventing puzzle sources', () => {
    let state = createInitialState(room);
    const step = (action: Action<StoryAction>) => { const result = update(state, action, room); state = result.state; return result; };
    expect(state.dialogue.text).toBe('');
    expect(room.props.map(prop => prop.id)).toEqual(expect.arrayContaining(['imac', 'pc', 'cubicles', 'whiteboard', 'ledge', 'stylus', 'door']));
    step({ type: 'select-mode', mode: 'use' });
    step({ type: 'interact', prop: 'imac' });
    expect(state.dialogue.text).toContain('SMART Notebook for Mac');
    step({ type: 'select-mode', mode: 'pickup' });
    step({ type: 'interact', prop: 'stylus' });
    expect(state.progress.inventory).toEqual([]);
    expect(state.dialogue.text).toContain('Can’t reach');
    step({ type: 'select-mode', mode: 'open' });
    expect(step({ type: 'interact', prop: 'door' }).effects).toContainEqual({ type: 'leave-room' });
    expect(state.progress.completed).toBe(false);
  });

  it('uses the real scene for the plane, stylus, copied receipt and retained checkout sketch', () => {
    const world = { ...freshAdventure('smart'), inventory: ['ticket', 'strap', 'paper-plane', 'faulty-receipt'], flags: { strapWorn: true, linkRestored: true } };
    let state = createInitialState(room, roomProgress(world, 'smart'));
    const step = (action: Action<StoryAction>) => { state = update(state, action, room).state; };
    const use = (item: string, prop: string) => {
      step({ type: 'select-mode', mode: 'walk' }); step({ type: 'select-item', item }); step({ type: 'interact', prop });
    };
    use('paper-plane', 'ledge');
    expect(state.progress.flags?.stylusDown).toBe(true);
    expect(state.progress.inventory).not.toContain('paper-plane');
    step({ type: 'select-mode', mode: 'pickup' }); step({ type: 'interact', prop: 'stylus' });
    use('stylus', 'whiteboard');
    expect(state.progress.inventory).not.toContain('checkout-plan');
    use('faulty-receipt', 'whiteboard');
    use('stylus', 'whiteboard');
    use('stylus', 'whiteboard');
    expect(state.progress.inventory).toEqual(['ticket', 'strap', 'faulty-receipt', 'stylus', 'checkout-plan']);
    step({ type: 'select-mode', mode: 'look' }); step({ type: 'interact', prop: 'whiteboard' });
    expect(state.dialogue.text).toContain('total $6');
    const saved = applyRoomProgress(world, 'smart', state.progress);
    expect(adventureSave.decode(adventureSave.encode(saved))).toEqual(saved);
    expect(roomProgress(saved, 'nortel').inventory).toContain('checkout-plan');
    expect(saved.flags.strapWorn).toBe(true);
  });

  it('adds a SMART spawn to a deployed v1 world and upgrades the payload while keeping the key', () => {
    const old = { version: 1, currentRoom: 'nortel', inventory: ['ticket', 'strap'], completed: false,
      positions: { mcgill: { x: 65, y: 90 }, nortel: { x: 60, y: 85 } }, flags: { strapWorn: true, linkRestored: true } };
    const restored = adventureSave.decode(old)!;
    expect(restored).not.toBeNull();
    expect(restored.positions.smart).toEqual(room.spawn);
    expect(restored.positions.mcgill).toEqual(old.positions.mcgill);
    expect(restored.inventory).toEqual(old.inventory);
    expect(adventureSave.encode(restored).version).toBe(2);
    expect(adventureSave.key).toBe('savagely-optimized:adventure:v1');
  });

  it('protects future payloads and inconsistent SMART states without dropping items', () => {
    const saved = adventureSave.encode(freshAdventure('smart'));
    for (const invalid of [
      { ...saved, version: 3 },
      { ...saved, inventory: ['stylus'] },
      { ...saved, inventory: ['paper-plane'], flags: { ...saved.flags, stylusDown: true } },
      { ...saved, inventory: ['checkout-plan'] },
      { ...saved, flags: { ...saved.flags, exampleOnBoard: true } },
      { ...saved, flags: { ...saved.flags, futureMilestone: true } },
    ]) expect(adventureSave.decode(invalid)).toBeNull();
  });
});
