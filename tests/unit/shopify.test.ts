import { describe, expect, it } from 'vitest';
import { shopify } from '../../src/game/rooms/shopify';
import { createInitialState, update } from '../../src/game/update';

describe('Shopify home office', () => {
  it('opens silently and supplies one reusable pick for the Lightspeed drawer', () => {
    let state = createInitialState(shopify);
    expect(state.dialogue.text).toBe('');
    state = update(state, { type: 'select-mode', mode: 'pickup' }, shopify).state;
    state = update(state, { type: 'interact', prop: 'pick' }, shopify).state;
    state = update(state, { type: 'interact', prop: 'pick' }, shopify).state;
    expect(state.progress.inventory).toEqual(['guitar-pick']);
    expect(state.progress.completed).toBe(false);
  });

  it('gives the personal furniture and portraits distinct responses without collecting them', () => {
    const descriptions = { guitar: 'Birch Green Jazzmaster', cabinet: 'cabinet', turntable: 'Silvertone', wife: 'wife', son: 'son', dog: 'sheepadoodle' };
    for (const [prop, description] of Object.entries(descriptions)) {
      let state = createInitialState(shopify);
      state = update(state, { type: 'select-mode', mode: 'look' }, shopify).state;
      state = update(state, { type: 'interact', prop }, shopify).state;
      expect(state.dialogue.text).toContain(description);
      expect(state.progress.inventory).toEqual([]);
    }
  });

  it('keeps the chapter exit free and does not use an inventory item on the door', () => {
    let state = createInitialState(shopify);
    state = update(state, { type: 'select-mode', mode: 'open' }, shopify).state;
    expect(update(state, { type: 'interact', prop: 'door' }, shopify).effects).toContainEqual({ type: 'leave-room' });
    state = { ...state, mode: 'use', selectedItem: 'guitar-pick', progress: { ...state.progress, inventory: ['guitar-pick'] } };
    expect(update(state, { type: 'interact', prop: 'door' }, shopify).effects).not.toContainEqual({ type: 'leave-room' });
  });
});
