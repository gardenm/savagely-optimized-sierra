import { createAmbientAudio } from './browser/audio';
import { createNavigation, parseRoute, type Route } from './browser/navigation';
import type { ChapterSession } from './chapter';
import { isChapterId, playableChapters, type ChapterId } from './chapters';
import { profile } from './content/career';
import { required } from './ui/dom';
import { createShellView, renderShell } from './ui/shell';

/** Composition root for persistent site services and one typed room session. */
export function startApp(root: HTMLElement): () => void {
  let currentId: ChapterId = parseRoute(location.hash) === 'nortel' ? 'nortel' : 'mcgill';
  root.innerHTML = renderShell(playableChapters[currentId].render());
  const host = required<HTMLElement>(root, '#room-host');
  const events = new AbortController();
  const audio = createAmbientAudio();
  let disposed = false;
  let session: ChapterSession;

  const shell = createShellView(root, toggleSound, () => {
    if (window.confirm(`Restart the ${playableChapters[currentId].name} chapter? This only resets this chapter’s progress in this browser.`)) {
      session.restart();
      navigation.navigate(currentId === 'nortel' ? 'nortel' : 'adventure');
    }
  });
  const navigation = createNavigation(root, {
    adventure: playableChapters.mcgill.title, nortel: playableChapters.nortel.title,
    chapters: 'Chapter map', cv: profile.name,
  }, changeRoute);

  function mountCurrent() {
    shell.chapter(playableChapters[currentId].name);
    session = playableChapters[currentId].mount(host, {
      isActive: () => navigation.route === (currentId === 'nortel' ? 'nortel' : 'adventure'),
      leave: nextRoom => {
        if (nextRoom && isChapterId(nextRoom)) navigation.navigate(nextRoom === 'mcgill' ? 'adventure' : nextRoom);
        else navigation.navigate('chapters');
      },
      toggleSound, saveFailed: shell.saveFailed,
    });
  }

  function changeRoute(route: Route) {
    if (route !== 'adventure' && route !== 'nortel') { session.cancelExit(); return; }
    const nextId: ChapterId = route === 'nortel' ? 'nortel' : 'mcgill';
    if (nextId === currentId) return;
    session.dispose();
    currentId = nextId;
    host.innerHTML = playableChapters[currentId].render();
    host.classList.add('room-entering');
    mountCurrent();
  }

  function audioFailed() {
    if (disposed) return;
    shell.sound(false);
    shell.showToast('Audio could not start in this browser. The adventure works without it.');
  }
  function toggleSound() {
    void audio.toggle().then(enabled => { if (!disposed) shell.sound(enabled); }).catch(audioFailed);
  }
  document.addEventListener('visibilitychange', () => {
    void audio.setHidden(document.hidden).catch(audioFailed);
  }, { signal: events.signal });
  mountCurrent();

  return () => {
    disposed = true;
    events.abort();
    session.dispose();
    shell.dispose();
    navigation.dispose();
    audio.dispose();
    root.replaceChildren();
  };
}
