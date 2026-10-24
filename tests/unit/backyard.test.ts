import { describe, expect, it } from 'vitest';
import { isBackyardRequest } from '../../src/browser/secret-scene';
import { parseRoute } from '../../src/browser/navigation';
import { adventureRooms, freshAdventure } from '../../src/game/adventure';
import { verbs, type Action } from '../../src/game/model';
import { backyard, HOT_DOG_LINE, updateBackyard } from '../../src/game/rooms/backyard';
import { createInitialState } from '../../src/game/update';

describe('URL-only hot dog Easter egg', () => {
  it('requires the specific query and is absent from normal routes and saved rooms', () => {
    expect(isBackyardRequest('?scene=hotdogs')).toBe(true);
    expect(isBackyardRequest('?other=1&scene=hotdogs')).toBe(true);
    for (const query of ['', '?scene=backyard', '?hotdogs', '?scene=HOTDOGS']) expect(isBackyardRequest(query)).toBe(false);
    expect(parseRoute('#backyard')).toBe('adventure');
    expect(adventureRooms).not.toHaveProperty('backyard');
    expect(freshAdventure().positions).not.toHaveProperty('backyard');
  });

  it('returns the exact line for every action and never changes progress or emits effects', () => {
    const state = createInitialState(backyard);
    const actions: Action<never>[] = [
      ...Object.keys(verbs).map(mode => ({ type: 'select-mode' as const, mode: mode as keyof typeof verbs })),
      { type: 'select-mode', mode: 'walk' }, { type: 'walk', to: { x: 85, y: 95 } },
      { type: 'move', by: { x: 3, y: -2 } }, { type: 'select-item', item: 'guitar-pick' },
      { type: 'use-item', item: 'guitar-pick', target: 'hotdogs' }, { type: 'restart' },
      ...backyard.props.flatMap(prop => [{ type: 'point-at' as const, prop: prop.id }, { type: 'interact' as const, prop: prop.id }]),
    ];
    for (const action of actions) {
      const result = updateBackyard(state, action);
      expect(result.state.dialogue.text).toBe(HOT_DOG_LINE);
      expect(result.state.progress).toBe(state.progress);
      expect(result.effects).toEqual([]);
    }
    expect(HOT_DOG_LINE).toBe("What's the rush? I'll cook the hot dogs a little later");
  });
});
