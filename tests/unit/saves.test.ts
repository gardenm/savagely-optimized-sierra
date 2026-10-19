import { describe, expect, it, vi } from 'vitest';
import { createSaveStore, type SaveStorage } from '../../src/browser/saves';
import { mcgill, mcgillSave } from '../../src/game/rooms/mcgill';
import { freshProgress } from '../../src/game/model';

describe('browser save adapter', () => {
  it('reads and writes only the room’s save key and round-trips valid progress', () => {
    const values = new Map([['unrelated', 'keep me']]);
    const storage: SaveStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } };
    const saves = createSaveStore(mcgillSave, () => storage);
    const progress = { inventory: ['ticket'], completed: false, position: { x: 60, y: 80 } };
    expect(saves.save(progress)).toBe(true);
    expect(saves.load()).toEqual(progress);
    expect(values.get('unrelated')).toBe('keep me');
    expect(values.size).toBe(2);
  });

  it.each([null, '{broken json', 'null', '[]', '42'])('falls back safely for absent or malformed storage: %s', stored => {
    const saves = createSaveStore(mcgillSave, () => ({ getItem: () => stored, setItem: vi.fn() }));
    expect(saves.load()).toEqual(freshProgress(mcgill.spawn));
  });

  it('survives denied storage access and reports a failed save without throwing', () => {
    const saves = createSaveStore(mcgillSave, () => { throw new Error('SecurityError'); });
    expect(saves.load()).toEqual(freshProgress(mcgill.spawn));
    expect(saves.save(freshProgress(mcgill.spawn))).toBe(false);
  });

  it('reports quota failures without overwriting existing progress', () => {
    const saved = JSON.stringify({ ticket: true, completed: false, x: 60, y: 80 });
    const saves = createSaveStore(mcgillSave, () => ({ getItem: () => saved, setItem: () => { throw new Error('QuotaExceededError'); } }));
    expect(saves.save(freshProgress(mcgill.spawn))).toBe(false);
    expect(saves.load().inventory).toEqual(['ticket']);
  });
});
