import { describe, expect, it } from 'vitest';
import { createAdventureSaveStore, type SaveStorage } from '../../src/browser/adventure-saves';
import { adventureSave, freshAdventure } from '../../src/game/adventure';

const mcgillKey = 'savagely-optimized:mcgill:v1';
const nortelKey = 'savagely-optimized:nortel:v1';
function memory(values = new Map<string, string>()) {
  const storage: SaveStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } };
  return { values, storage, saves: createAdventureSaveStore(() => storage) };
}

describe('whole-adventure storage', () => {
  it('imports legacy keys once, preserves their bytes and leaves unrelated storage alone', () => {
    const old = JSON.stringify({ ticket: true, completed: true, x: 65, y: 90 });
    const { values, saves } = memory(new Map([[mcgillKey, old], ['unrelated', 'keep me']]));
    const loaded = saves.load();
    expect(loaded).toMatchObject({ status: 'ready', progress: { inventory: ['ticket'], completed: false } });
    expect(values.get(mcgillKey)).toBe(old);
    expect(values.get('unrelated')).toBe('keep me');
    expect(values.has(adventureSave.key)).toBe(true);
    values.set(mcgillKey, JSON.stringify({ ticket: false, completed: false }));
    expect(saves.load().progress.inventory).toEqual(['ticket']);
  });

  it('a valid new save wins over legacy keys and restart never resurrects old progress', () => {
    const { saves, values } = memory(new Map([[mcgillKey, JSON.stringify({ ticket: true, completed: true })], [nortelKey, JSON.stringify({ version: 1, linkRestored: true, configured: true })]]));
    expect(saves.load().progress.inventory).toEqual(['ticket', 'strap']);
    expect(saves.restart(freshAdventure('nortel'))).toBe(true);
    expect(saves.load().progress).toEqual(freshAdventure('nortel'));
    expect(values.has(mcgillKey)).toBe(true);
    expect(values.has(nortelKey)).toBe(true);
  });

  it('malformed legacy data does not discard the other valid room', () => {
    const { saves } = memory(new Map([[mcgillKey, '{broken'], [nortelKey, JSON.stringify({ version: 2, strap: true, strapWorn: false })]]));
    expect(saves.load()).toMatchObject({ status: 'ready', progress: { inventory: ['strap'], flags: { strapWorn: false } } });
  });

  it.each(['{broken json', 'null', '[]', '42', '{"version":99}', '{"version":1}'])('protects invalid/future bytes until explicit restart: %s', stored => {
    const { saves, values } = memory(new Map([[adventureSave.key, stored], [mcgillKey, JSON.stringify({ ticket: true, completed: true })]]));
    expect(saves.load()).toEqual({ status: 'protected', progress: freshAdventure() });
    expect(saves.save({ ...freshAdventure(), inventory: ['strap'] })).toBe(false);
    expect(values.get(adventureSave.key)).toBe(stored);
    expect(saves.restart(freshAdventure())).toBe(true);
    expect(saves.load()).toEqual({ status: 'ready', progress: freshAdventure() });
  });

  it('handles denied access and permits a deliberate restart after storage recovers', () => {
    let denied = true;
    const { storage } = memory();
    const saves = createAdventureSaveStore(() => { if (denied) throw new Error('SecurityError'); return storage; });
    expect(saves.load()).toEqual({ status: 'unavailable', progress: freshAdventure() });
    denied = false;
    expect(saves.save(freshAdventure())).toBe(false);
    expect(saves.restart(freshAdventure())).toBe(true);
    expect(saves.load().status).toBe('ready');
  });

  it('preserves imported progress on quota failure and can save once space is available', () => {
    const { values, storage } = memory(new Map([[mcgillKey, JSON.stringify({ ticket: true, completed: false })]]));
    let full = true;
    const saves = createAdventureSaveStore(() => ({ ...storage, setItem(key, value) { if (full) throw new Error('QuotaExceededError'); storage.setItem(key, value); } }));
    const loaded = saves.load();
    expect(loaded).toMatchObject({ status: 'unavailable', progress: { inventory: ['ticket'] } });
    expect(values.has(adventureSave.key)).toBe(false);
    expect(saves.save(loaded.progress)).toBe(false);
    full = false;
    expect(saves.save(loaded.progress)).toBe(true);
    expect(saves.load().progress.inventory).toEqual(['ticket']);
  });
});
