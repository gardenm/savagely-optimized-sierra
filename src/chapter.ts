import type { Action, Dispatch, GameState, Progress, RoomDefinition } from './game/model';
import { assertNever } from './game/model';
import { createInitialState, update } from './game/update';
import { createAdventureView } from './ui/adventure';

export interface PuzzleView<S> {
  readonly isOpen: boolean;
  render(state: GameState<S>): void;
  reset(): void;
  dispose(): void;
}
export interface ChapterServices {
  isActive(): boolean;
  leave(nextRoom?: string): void;
  toggleSound(): void;
  progress(): Progress;
  changed(progress: Progress, persist: boolean): void;
}
export interface ChapterSession { restart(): void; cancelExit(): void; dispose(): void }

/** One mounted room projection of shared adventure progress; puzzle state stays typed. */
export function mountChapter<S, A>(root: HTMLElement, room: RoomDefinition<S, A>,
  mountPuzzle: (root: HTMLElement, dispatch: Dispatch<A>) => PuzzleView<S>, services: ChapterServices): ChapterSession {
  let state = createInitialState(room, services.progress());
  let disposed = false;
  let leaving = false;
  let exitTimer: ReturnType<typeof setTimeout> | undefined;
  const puzzle = mountPuzzle(root, dispatch);
  const adventure = createAdventureView(root, room, dispatch, () => !leaving && services.isActive() && !puzzle.isOpen);

  function stopExit() {
    clearTimeout(exitTimer);
    leaving = false;
    root.classList.remove('is-leaving');
    root.removeAttribute('aria-busy');
  }

  function dispatch(action: Action<A>) {
    if (disposed || (leaving && action.type !== 'room')) return;
    const before = state.progress;
    const result = update(state, action, room);
    state = result.state;
    for (const effect of result.effects) if (effect.type === 'walk') adventure.walk(effect);
    if (action.type === 'restart') puzzle.reset();
    adventure.render(state);
    puzzle.render(state);
    const shouldSave = result.effects.some(effect => effect.type === 'persist');
    if (state.progress !== before || shouldSave) services.changed(state.progress, shouldSave);
    for (const effect of result.effects) {
      switch (effect.type) {
        case 'leave-room': {
          leaving = true;
          root.classList.add('is-leaving');
          root.setAttribute('aria-busy', 'true');
          const walk = result.effects.find(effect => effect.type === 'walk');
          const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : (walk?.duration ?? .3) * 1000;
          exitTimer = setTimeout(() => {
            const active = !disposed && services.isActive();
            stopExit();
            if (active) services.leave(effect.nextRoom);
          }, delay);
          break;
        }
        case 'toggle-sound': services.toggleSound(); break;
        case 'persist': case 'walk': break;
        default: assertNever(effect);
      }
    }
  }

  adventure.render(state);
  puzzle.render(state);
  return {
    cancelExit: stopExit,
    restart() {
      stopExit();
      state = createInitialState(room, services.progress());
      puzzle.reset();
      adventure.reset();
      adventure.render(state);
      puzzle.render(state);
    },
    dispose() {
      disposed = true;
      stopExit();
      adventure.dispose();
      puzzle.dispose();
    },
  };
}
