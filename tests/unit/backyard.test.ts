import { describe, expect, it } from 'vitest';
import { isBackyardRequest } from '../../src/browser/secret-scene';
import { parseRoute } from '../../src/browser/navigation';
import { adventureRooms, freshAdventure } from '../../src/game/adventure';
import { verbs, type Mode } from '../../src/game/model';
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

  it('walks across the patio and clamps keyboard movement without requesting saves', () => {
    const initial = createInitialState(backyard);
    const walked = updateBackyard(initial, { type: 'walk', to: { x: 32, y: 88 } });
    expect(walked.state.progress.position).toEqual({ x: 32, y: 88 });
    expect(walked.effects).toEqual([expect.objectContaining({
      type: 'walk', from: backyard.spawn, to: { x: 32, y: 88 }, marker: true,
    })]);
    const moved = updateBackyard(walked.state, { type: 'move', by: { x: -100, y: 100 } });
    expect(moved.state.progress.position).toEqual({ x: backyard.bounds.left, y: backyard.bounds.bottom });
    expect(moved.effects).toEqual([expect.objectContaining({ type: 'walk', marker: false })]);
    expect(initial.progress.position).toEqual(backyard.spawn);
    expect(moved.state.progress.inventory).toEqual([]);
    expect(moved.state.progress.completed).toBe(false);
  });

  it('approaches every object and postpones every verb, including default clicks', () => {
    const modes: Mode[] = ['walk', ...Object.keys(verbs) as (keyof typeof verbs)[]];
    for (const mode of modes) for (const prop of backyard.props) {
      const state = { ...createInitialState(backyard), mode };
      const result = updateBackyard(state, { type: 'interact', prop: prop.id });
      expect(result.state.progress.position).toEqual(prop.destination);
      expect(result.state.dialogue.text).toMatch(/later|don't want|Street Fighter/);
      expect(result.state.progress.inventory).toEqual([]);
      expect(result.state.progress.completed).toBe(false);
      expect(result.state.progress.flags).toBeUndefined();
      expect(result.effects).toEqual([expect.objectContaining({ type: 'walk' })]);
    }
  });

  it('varies repeated interactions, with no cooking or collecting progress', () => {
    let state = createInitialState(backyard);
    const replies: string[] = [];
    for (let i = 0; i < 4; i++) {
      state = updateBackyard(state, { type: 'interact', prop: 'bbq' }).state;
      replies.push(state.dialogue.text);
    }
    expect(new Set(replies).size).toBe(4);
    expect(replies).toContain('After I play some Street Fighter.');
    expect(replies).toContain("I don't want to.");
    expect(replies).toContain("I'll do that later.");
    expect(state.progress.inventory).toEqual([]);
    expect(state.progress.completed).toBe(false);
  });

  it('does not answer or advance the joke just from hovering or selecting a verb', () => {
    const state = updateBackyard(createInitialState(backyard), { type: 'interact', prop: 'bbq' }).state;
    const selected = updateBackyard(state, { type: 'select-mode', mode: 'open' });
    const hovered = updateBackyard(selected.state, { type: 'point-at', prop: 'gate' });
    expect(hovered.state.mode).toBe('open');
    expect(hovered.state.activeProp).toBe('gate');
    expect(hovered.state.dialogue).toBe(state.dialogue);
    expect(hovered.state.room).toBe(state.room);
    expect(hovered.state.progress).toBe(state.progress);
    expect(hovered.effects).toEqual([]);
  });

  it('resets only its transient state and cannot select or use normal inventory', () => {
    const initial = createInitialState(backyard);
    const changed = updateBackyard(initial, { type: 'interact', prop: 'gate' }).state;
    const reset = updateBackyard(changed, { type: 'restart' });
    expect(reset.state.progress).toEqual(initial.progress);
    expect(reset.state.room).toEqual(initial.room);
    expect(reset.state.dialogue.text).toBe(HOT_DOG_LINE);
    expect(reset.effects).toEqual([]);
    for (const action of [
      { type: 'select-item' as const, item: 'guitar-pick' },
      { type: 'use-item' as const, item: 'guitar-pick', target: 'hotdogs' },
      { type: 'interact' as const, prop: 'unknown' },
    ]) expect(updateBackyard(initial, action)).toEqual({ state: initial, effects: [] });
  });
});
