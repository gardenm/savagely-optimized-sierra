import { describe, expect, it } from 'vitest';
import { adventureRooms, adventureSave, applyRoomProgress, enterRoom, freshAdventure, importLegacy, roomProgress } from '../../src/game/adventure';
import { createInitialState, update } from '../../src/game/update';
import { strapWorn } from '../../src/game/rooms/nortel';
import { parseRoute } from '../../src/browser/navigation';
import { chapters } from '../../src/content/career';

function freeze<T>(value: T): T {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}

describe('shared adventure progress', () => {
  it('makes Shopify a navigable chapter with its own persisted position and no duplicate item owners', () => {
    expect(parseRoute('#shopify')).toBe('shopify');
    expect(chapters.find(chapter => chapter.place.startsWith('Shopify'))).toMatchObject({ playable: true, route: '#shopify', linkLabel: 'Enter Shopify' });
    expect(Object.keys(freshAdventure().positions)).toEqual(['mcgill', 'nortel', 'smart', 'lightspeed', 'shopify']);
    expect(adventureRooms.shopify.items.filter(item => item.id === 'guitar-pick')).toHaveLength(1);
    const world = freshAdventure('shopify');
    expect(adventureSave.decode(adventureSave.encode(world))).toEqual(world);
  });
  it('carries candidate evidence between rooms and writes the v4 shared payload', () => {
    const agent = { candidate: { id: 1 }, receipt: null };
    const world = applyRoomProgress(freshAdventure(), 'lightspeed', { ...roomProgress(freshAdventure(), 'lightspeed'), agent });
    expect(roomProgress(world, 'mcgill').agent).toEqual(agent);
    expect(adventureSave.encode(world)).toMatchObject({ version: 4, agent });
    expect(freshAdventure()).toMatchObject({ agent: { candidate: null, receipt: null } });
  });
  it('projects shared inventory and milestones with an independent position per room', () => {
    const before = freeze(freshAdventure());
    const lab = { ...roomProgress(before, 'mcgill'), inventory: ['ticket'], position: { x: 65, y: 90 } };
    const after = applyRoomProgress(before, 'mcgill', lab);
    expect(after.positions.nortel).toEqual(adventureRooms.nortel.spawn);
    expect(roomProgress(enterRoom(after, 'nortel'), 'nortel').inventory).toEqual(['ticket']);
    expect(before.inventory).toEqual([]);
    expect(after.positions.mcgill).toEqual({ x: 65, y: 90 });
    expect(enterRoom(after, 'mcgill')).toBe(after);
  });

  it('collecting and wearing the strap preserves an item carried from McGill', () => {
    const room = adventureRooms.nortel;
    let state = createInitialState(room, { ...roomProgress(freshAdventure(), 'nortel'), inventory: ['ticket'] });
    for (const mode of ['pickup', 'use'] as const) {
      state = update(state, { type: 'select-mode', mode }, room).state;
      state = update(state, { type: 'interact', prop: 'strap' }, room).state;
      expect(state.progress.inventory).toEqual(['ticket', 'strap']);
    }
    const world = applyRoomProgress(freshAdventure(), 'nortel', state.progress);
    expect(strapWorn(roomProgress(world, 'mcgill'))).toBe(true);
    expect(createInitialState(adventureRooms.mcgill, roomProgress(world, 'mcgill')).progress.inventory).toEqual(['ticket', 'strap']);
  });

  it('earning a McGill ticket preserves the carried strap and shared Nortel milestones', () => {
    const room = adventureRooms.mcgill;
    const progress = { ...roomProgress(freshAdventure(), 'mcgill'), inventory: ['strap'], flags: { strapWorn: true, linkRestored: true } };
    let state = createInitialState(room, progress);
    state = update(state, { type: 'select-mode', mode: 'use' }, room).state;
    state = update(state, { type: 'interact', prop: 'computer' }, room).state;
    state = update(state, { type: 'room', action: { type: 'recommend', genres: ['Adventure', 'Comedy', 'Sci-fi'] } }, room).state;
    state = update(state, { type: 'room', action: { type: 'take-ticket' } }, room).state;
    expect(state.progress.inventory).toEqual(['strap', 'ticket']);
    expect(state.progress.flags).toEqual(progress.flags);
  });

  it('foreign items cannot accidentally solve a puzzle or open the computer', () => {
    let lab = createInitialState(adventureRooms.mcgill, { ...roomProgress(freshAdventure(), 'mcgill'), inventory: ['strap'] });
    lab = update(lab, { type: 'select-item', item: 'strap' }, adventureRooms.mcgill).state;
    lab = update(lab, { type: 'interact', prop: 'computer' }, adventureRooms.mcgill).state;
    expect(lab.room.computerOpen).toBe(false);
    let rack = createInitialState(adventureRooms.nortel, { ...roomProgress(freshAdventure(), 'nortel'), inventory: ['ticket', 'strap'], flags: { strapWorn: true } });
    rack = update(rack, { type: 'select-item', item: 'ticket' }, adventureRooms.nortel).state;
    rack = update(rack, { type: 'interact', prop: 'cable' }, adventureRooms.nortel).state;
    expect(rack.progress.flags?.linkRestored).not.toBe(true);
    expect(rack.progress.inventory).toEqual(['ticket', 'strap']);
  });

  it('round-trips world progress without transient UI or static-fault state', () => {
    const world = { ...freshAdventure('nortel'), inventory: ['ticket', 'strap'], flags: { strapWorn: true, linkRestored: true }, positions: { ...freshAdventure().positions, mcgill: { x: 65, y: 90 }, nortel: { x: 60, y: 85 } } };
    const encoded = adventureSave.encode(world);
    expect(adventureSave.decode(encoded)).toEqual(world);
    expect(Object.keys(encoded).sort()).toEqual(['agent', 'completed', 'currentRoom', 'flags', 'inventory', 'positions', 'version']);
  });

  it.each([1, 2])('imports both legacy rooms including Nortel payload version %s without completing the adventure', version => {
    const world = importLegacy({ ticket: true, completed: true, x: 65, y: 90 }, { version, strap: true, strapWorn: true, linkRestored: true, configured: true, completed: true, x: 60, y: 85 });
    expect(world).toMatchObject({ inventory: ['ticket', 'strap'], completed: false, flags: { strapWorn: true, linkRestored: true }, positions: { mcgill: { x: 65, y: 90 }, nortel: { x: 60, y: 85 } } });
  });

  it('repairs duplicate items, inconsistent grounding and invalid coordinates', () => {
    const world = adventureSave.decode({ ...adventureSave.encode(freshAdventure()), inventory: ['ticket', 'ticket'], flags: { strapWorn: true, linkRestored: true }, positions: { mcgill: { x: 999, y: -1 }, nortel: { x: '60', y: null } } });
    expect(world).toMatchObject({ inventory: ['ticket'], flags: { strapWorn: false, linkRestored: false }, positions: { mcgill: { x: 80, y: 72 }, nortel: adventureRooms.nortel.spawn } });
  });

  it('protects a save containing an unrecognized item rather than dropping it', () => {
    expect(adventureSave.decode({ ...adventureSave.encode(freshAdventure()), inventory: ['ticket', 'future-item'] })).toBeNull();
  });

  it.each([1, 2, 3])('reads deployed v%s with empty agent evidence and a Shopify spawn', version => {
    const { agent: _agent, ...old } = adventureSave.encode(freshAdventure('nortel'));
    expect(adventureSave.decode({ ...old, version, positions: { nortel: { x: 60, y: 85 } } })).toMatchObject({
      currentRoom: 'nortel', agent: { candidate: null, receipt: null },
      positions: { nortel: { x: 60, y: 85 }, shopify: adventureRooms.shopify.spawn },
    });
  });

  it('round-trips reviewed evidence and an offline queued candidate without full story migration', () => {
    const world = { ...freshAdventure('shopify'),
      inventory: ['ticket', 'strap', 'faulty-receipt', 'stylus', 'checkout-plan', 'test-receipt'],
      flags: { strapWorn: true, linkRestored: true, stylusDown: true, exampleOnBoard: true, agentHasPlan: true, agentHasExample: true, reviewComplete: true },
      agent: { candidate: { id: 1 }, receipt: { candidateId: 1, sale: { quantity: 3, unitPriceCents: 300, totalCents: 900 } } }, completed: true };
    expect(adventureSave.decode(adventureSave.encode(world))).toEqual(world);
    const queued = { ...world, inventory: world.inventory.filter(item => item !== 'test-receipt'), completed: false,
      flags: { ...world.flags, linkRestored: false, reviewComplete: false }, agent: { candidate: { id: 1 }, receipt: null } };
    expect(adventureSave.decode(adventureSave.encode(queued))).toEqual(queued);
    for (const agent of [
      { ...world.agent, receipt: { ...world.agent.receipt, candidateId: 2 } },
      { ...world.agent, receipt: { ...world.agent.receipt, sale: { quantity: 2, unitPriceCents: 300, totalCents: 600 } } },
      { ...world.agent, receipt: { ...world.agent.receipt, sale: { quantity: 3, unitPriceCents: 300, totalCents: 300 } } },
    ]) expect(adventureSave.decode(adventureSave.encode({ ...world, agent }))).toBeNull();
  });

  it('rejects malformed evidence and impossible Shopify prerequisites instead of losing progress', () => {
    const saved = adventureSave.encode(freshAdventure());
    for (const invalid of [
      { ...saved, version: 5 }, { ...saved, agent: undefined }, { ...saved, agent: {} },
      { ...saved, agent: { candidate: { id: 0 }, receipt: null } },
      { ...saved, agent: { candidate: { id: 1 }, receipt: null } },
      { ...saved, inventory: ['test-receipt'] },
      { ...saved, flags: { agentHasPlan: true } }, { ...saved, flags: { agentHasExample: true } },
      { ...saved, flags: { reviewComplete: true } },
      { ...saved, agent: { candidate: null, receipt: { candidateId: 1, sale: { quantity: 3, unitPriceCents: 300, totalCents: 900 } } } },
      { ...saved, agent: { candidate: null, receipt: { candidateId: 1, sale: { quantity: -3, unitPriceCents: 300, totalCents: 900 } } } },
    ]) expect(adventureSave.decode(invalid)).toBeNull();
  });

  it.each([null, [], {}, { version: 2 }, { version: 1, inventory: [] }])('rejects invalid and unsupported world formats: %j', value => {
    expect(adventureSave.decode(value)).toBeNull();
  });

  it('a whole-adventure restart creates independent empty progress for every room', () => {
    const before = freshAdventure('nortel');
    const after = freshAdventure('nortel');
    expect(after).toEqual(before);
    expect(after.positions).not.toBe(before.positions);
    expect(after.inventory).not.toBe(before.inventory);
    expect(after.completed).toBe(false);
  });
});
