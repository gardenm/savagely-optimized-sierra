import { createAmbientAudio } from './browser/audio';
import { createNavigation } from './browser/navigation';
import { createSaveStore } from './browser/saves';
import { profile } from './content/career';
import { assertNever, type Action } from './game/model';
import { mcgill, mcgillSave, type McGillAction } from './game/rooms/mcgill';
import { createInitialState, update } from './game/update';
import { createAdventureView } from './ui/adventure';
import { createRecommendzView, renderRecommendz } from './ui/recommendz';
import { createShellView, renderShell } from './ui/shell';

/** Composition root: reducer state, mounted views, and explicit browser effects. */
export function startApp(root: HTMLElement): () => void {
  root.innerHTML = renderShell(mcgill, renderRecommendz());
  const events = new AbortController();
  const saves = createSaveStore(mcgillSave);
  const audio = createAmbientAudio();
  const navigation = createNavigation(root, { adventure: mcgill.title, chapters: 'Chapter map', cv: profile.name });
  let state = createInitialState(mcgill, saves.load());
  let disposed = false;

  const shell = createShellView(root, toggleSound, () => {
    if (window.confirm('Restart the McGill chapter? This only resets your adventure progress in this browser.')) {
      dispatch({ type: 'restart' });
      navigation.navigate('adventure');
    }
  });
  const computer = createRecommendzView(root, dispatch);
  const adventure = createAdventureView(root, mcgill, dispatch, () => navigation.route === 'adventure' && !computer.isOpen);

  function audioFailed() {
    if (disposed) return;
    shell.sound(false);
    shell.showToast('Audio could not start in this browser. The adventure works without it.');
  }

  function toggleSound() {
    void audio.toggle().then(enabled => { if (!disposed) shell.sound(enabled); }).catch(audioFailed);
  }

  function dispatch(action: Action<McGillAction>) {
    if (disposed) return;
    const result = update(state, action, mcgill);
    state = result.state;
    // Set duration before moving the existing character node to its new position.
    for (const effect of result.effects) if (effect.type === 'walk') adventure.walk(effect);
    if (action.type === 'restart') computer.reset();
    adventure.render(state);
    computer.render(state);
    if (result.effects.some(effect => effect.type === 'persist') && !saves.save(state.progress)) shell.saveFailed();
    for (const effect of result.effects) {
      switch (effect.type) {
        case 'leave-room': navigation.navigate('chapters'); break;
        case 'toggle-sound': toggleSound(); break;
        case 'persist': case 'walk': break;
        default: assertNever(effect);
      }
    }
  }

  document.addEventListener('visibilitychange', () => {
    void audio.setHidden(document.hidden).catch(audioFailed);
  }, { signal: events.signal });
  adventure.render(state);
  computer.render(state);

  return () => {
    disposed = true;
    events.abort();
    adventure.dispose();
    computer.dispose();
    shell.dispose();
    navigation.dispose();
    audio.dispose();
    root.replaceChildren();
  };
}
