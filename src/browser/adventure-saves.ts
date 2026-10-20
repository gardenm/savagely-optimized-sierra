import { adventureSave, freshAdventure, importLegacy, type AdventureProgress } from '../game/adventure';
import { mcgillSave } from '../game/rooms/mcgill';
import { nortelSave } from '../game/rooms/nortel';
export interface SaveStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export type LoadResult = Readonly<{ progress: AdventureProgress; status: 'ready' | 'protected' | 'unavailable' }>;
const parseLegacy = (stored: string | null): unknown => {
  try { return stored === null ? null : JSON.parse(stored); } catch { return null; }
};

/** Import once. Preserve corrupt/future saves until an explicit whole-adventure restart. */
export function createAdventureSaveStore(getStorage: () => SaveStorage = () => localStorage) {
  let protectedSave = false;
  function save(progress: AdventureProgress): boolean {
    if (protectedSave) return false;
    try {
      getStorage().setItem(adventureSave.key, JSON.stringify(adventureSave.encode(progress)));
      return true;
    } catch { return false; }
  }
  return {
    load(): LoadResult {
      protectedSave = false;
      try {
        const storage = getStorage();
        const stored = storage.getItem(adventureSave.key);
        if (stored !== null) {
          let decoded: AdventureProgress | null = null;
          try { decoded = adventureSave.decode(JSON.parse(stored)); } catch { /* Preserve malformed bytes too. */ }
          if (decoded) return { progress: decoded, status: 'ready' };
          protectedSave = true;
          return { progress: freshAdventure(), status: 'protected' };
        }
        const progress = importLegacy(parseLegacy(storage.getItem(mcgillSave.key)), parseLegacy(storage.getItem(nortelSave.key)));
        return { progress, status: save(progress) ? 'ready' : 'unavailable' };
      } catch {
        // A failed read is not permission to replace an unseen save.
        protectedSave = true;
        return { progress: freshAdventure(), status: 'unavailable' };
      }
    },
    save,
    restart(progress: AdventureProgress): boolean { protectedSave = false; return save(progress); },
  };
}
