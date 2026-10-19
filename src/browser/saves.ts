import type { Progress } from '../game/model';

export interface SaveCodec {
  readonly key: string;
  decode(value: unknown): Progress;
  encode(progress: Progress): unknown;
}

export interface SaveStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function createSaveStore(codec: SaveCodec, getStorage: () => SaveStorage = () => localStorage) {
  return {
    load(): Progress {
      try {
        const stored = getStorage().getItem(codec.key);
        return codec.decode(stored === null ? null : JSON.parse(stored));
      } catch {
        return codec.decode(null);
      }
    },
    save(progress: Progress): boolean {
      try {
        getStorage().setItem(codec.key, JSON.stringify(codec.encode(progress)));
        return true;
      } catch {
        return false;
      }
    },
  };
}
