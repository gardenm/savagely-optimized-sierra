import { describe, expect, it } from 'vitest';
import type { Action, GameState } from '../../src/game/model';
import { mcgill, mcgillSave, researchPaper, type McGillAction, type McGillState } from '../../src/game/rooms/mcgill';
import { createInitialState, update } from '../../src/game/update';

const initial = () => createInitialState(mcgill);
function act(state: GameState<McGillState>, ...actions: Action<McGillAction>[]) {
  return actions.reduce((state, action) => update(state, action, mcgill).state, state);
}
const roomAction = (action: McGillAction): Action<McGillAction> => ({ type: 'room', action });
function openComputer() {
  return act(initial(), { type: 'select-mode', mode: 'use' }, { type: 'interact', prop: 'computer' });
}
function solve() {
  return act(openComputer(), roomAction({ type: 'recommend', genres: ['Sci-fi', 'Adventure', 'Comedy'] }));
}
const claim = () => act(solve(), roomAction({ type: 'take-ticket' }));

describe('McGill puzzle', () => {
  it.each(['use', 'open', 'talk'] as const)('opens Recommendz using %s', mode => {
    expect(act(initial(), { type: 'select-mode', mode }, { type: 'interact', prop: 'computer' }).room.computerOpen).toBe(true);
  });

  it.each([
    { genres: [], result: 'incomplete' },
    { genres: ['Adventure', 'Comedy'], result: 'incomplete' },
    { genres: ['Adventure', 'Adventure', 'Sci-fi'], result: 'incomplete' },
    { genres: ['Adventure', 'Comedy', 'Sci-fi', 'Horror'], result: 'incomplete' },
    { genres: ['Horror', 'Documentary', 'Romance'], result: 'no-match' },
    { genres: ['Adventure', 'Comedy', 'unknown'], result: 'no-match' },
  ])('rejects invalid recommendations: $genres', ({ genres, result }) => {
    const state = act(openComputer(), roomAction({ type: 'recommend', genres }), roomAction({ type: 'take-ticket' }));
    expect(state.room.recommendation).toBe(result);
    expect(state.progress.inventory).toEqual([]);
  });

  it('requires an open computer and a correct answer before awarding a ticket', () => {
    const state = act(initial(), roomAction({ type: 'recommend', genres: ['Adventure', 'Comedy', 'Sci-fi'] }), roomAction({ type: 'take-ticket' }));
    expect(state).toEqual(initial());
    expect(act(openComputer(), roomAction({ type: 'take-ticket' })).progress.inventory).toEqual([]);
    expect(solve().progress.inventory).toEqual([]);
    expect(claim()).toMatchObject({ mode: 'use', selectedItem: 'ticket', room: { computerOpen: false }, progress: { inventory: ['ticket'] } });
  });

  it('clears a previous successful match when the computer closes and reopens without claiming', () => {
    const reopened = act(solve(), roomAction({ type: 'close-computer' }), { type: 'interact', prop: 'computer' });
    expect(reopened.room.recommendation).toBe('initial');
    expect(act(reopened, roomAction({ type: 'take-ticket' })).progress.inventory).toEqual([]);
  });

  it.each(['use', 'open'] as const)('keeps the exit unavailable using %s until the ticket is claimed', mode => {
    const state = act(initial(), { type: 'select-mode', mode });
    const result = update(state, { type: 'interact', prop: 'door' }, mcgill);
    expect(result.state.progress.completed).toBe(false);
    expect(result.effects.some(effect => effect.type === 'leave-room')).toBe(false);
  });

  it.each(['use', 'give', 'open'] as const)('completes the chapter using %s after the ticket is claimed', mode => {
    const state = act(claim(), { type: 'select-mode', mode });
    const result = update(state, { type: 'interact', prop: 'door' }, mcgill);
    expect(result.state.progress.completed).toBe(true);
    expect(result.state.selectedItem).toBeNull();
    expect(result.effects).toContainEqual({ type: 'leave-room', nextRoom: 'nortel' });
  });

  it('does not duplicate tickets when reopening the completed computer', () => {
    const state = act(claim(), { type: 'select-mode', mode: 'talk' }, { type: 'interact', prop: 'computer' });
    expect(state.room.recommendation).toBe('claimed');
    const result = act(state, roomAction({ type: 'take-ticket' }), roomAction({ type: 'take-ticket' }));
    expect(result.progress.inventory).toEqual(['ticket']);
  });

  it('keeps paper links contextual and expresses audio as an effect', () => {
    const papers = act(initial(), { type: 'select-mode', mode: 'look' }, { type: 'interact', prop: 'papers' });
    expect(papers.dialogue.link).toEqual(researchPaper);
    expect(act(papers, { type: 'interact', prop: 'board' }).dialogue.link).toBeUndefined();
    const state = act(initial(), { type: 'select-mode', mode: 'use' });
    expect(update(state, { type: 'interact', prop: 'records' }, mcgill).effects).toContainEqual({ type: 'toggle-sound' });
  });

  it('preserves the deployed v1 save contract and excludes transient state', () => {
    const saved = { ticket: true, completed: true, x: 65, y: 90 };
    const progress = mcgillSave.decode(saved);
    expect(mcgillSave.key).toBe('savagely-optimized:mcgill:v1');
    expect(mcgillSave.encode(progress)).toEqual(saved);
    expect(createInitialState(mcgill, progress)).toMatchObject({ mode: 'walk', selectedItem: null, activeProp: null, dialogue: { text: '' }, room: { computerOpen: false } });
  });

  it.each([null, [], 'bad', 5, {}, { ticket: 'true', completed: true }])('rejects invalid save data: %j', value => {
    expect(mcgillSave.decode(value)).toEqual(initial().progress);
  });

  it('repairs inconsistent completion and clamps out-of-bounds or invalid saved coordinates', () => {
    expect(mcgillSave.decode({ ticket: false, completed: true, x: 999, y: -500 })).toMatchObject({ completed: false, position: { x: 80, y: 72 } });
    expect(mcgillSave.decode({ ticket: true, completed: false, x: '65', y: Infinity }).position).toEqual(mcgill.spawn);
  });
});
