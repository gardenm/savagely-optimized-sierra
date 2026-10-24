import { createAmbientAudio } from './browser/audio';
import { createAdventureSaveStore } from './browser/adventure-saves';
import { createNavigation, isRoomRoute, parseRoute, type Route } from './browser/navigation';
import type { ChapterSession } from './chapter';
import { isChapterId, playableChapters, type ChapterId } from './chapters';
import { applyRoomProgress, enterRoom, freshAdventure, roomProgress } from './game/adventure';
import { profile } from './content/career';
import { required } from './ui/dom';
import { createShellView, renderShell } from './ui/shell';

const roomRoute = (room: ChapterId) => room === 'mcgill' ? 'adventure' : room;

/** One adventure owns progress; mounted room sessions only project it into their views. */
export function startApp(root: HTMLElement): () => void {
  const saves = createAdventureSaveStore();
  const loaded = saves.load();
  let progress = loaded.progress;
  let protectedSave = loaded.status === 'protected';
  const requested = parseRoute(location.hash);
  let currentId: ChapterId = requested === 'nortel' || requested === 'smart' || requested === 'lightspeed' ? requested
    : requested === 'adventure' && location.hash ? 'mcgill' : progress.currentRoom;
  if (!location.hash && currentId !== 'mcgill') history.replaceState(null, '', `#${roomRoute(currentId)}`);
  root.innerHTML = renderShell(playableChapters[currentId].render());
  const host = required<HTMLElement>(root, '#room-host');
  const events = new AbortController();
  const audio = createAmbientAudio();
  let disposed = false;
  let session: ChapterSession;

  const shell = createShellView(root, toggleSound, () => {
    if (window.confirm('Restart the entire adventure? This clears your items and progress in every room in this browser.')) {
      progress = freshAdventure(currentId);
      protectedSave = false;
      reportSaved(saves.restart(progress));
      session.restart();
      navigation.navigate(roomRoute(currentId));
    }
  });
  const navigation = createNavigation(root, {
    adventure: playableChapters.mcgill.title, nortel: playableChapters.nortel.title,
    smart: playableChapters.smart.title,
    lightspeed: playableChapters.lightspeed.title,
    chapters: 'Chapter map', cv: profile.name,
  }, changeRoute);

  function reportSaved(saved: boolean) {
    shell.saveStatus(saved ? '' : protectedSave
      ? 'Saved progress could not be loaded. This visit will not replace it. Restart begins a new adventure.'
      : 'Browser storage is unavailable. Progress will not be saved.');
  }
  function persist() { reportSaved(saves.save(progress)); }

  function mountCurrent() {
    const id = currentId;
    navigation.rememberRoom(roomRoute(id));
    session = playableChapters[id].mount(host, {
      isActive: () => navigation.route === roomRoute(id),
      progress: () => roomProgress(progress, id),
      changed(next, shouldSave) {
        progress = applyRoomProgress(progress, id, next);
        if (shouldSave) persist();
      },
      leave: nextRoom => {
        if (nextRoom && isChapterId(nextRoom)) navigation.navigate(roomRoute(nextRoom));
        else navigation.navigate('chapters');
      },
      toggleSound,
    });
  }

  function changeRoute(route: Route) {
    if (!isRoomRoute(route)) { session.cancelExit(); return; }
    const nextId: ChapterId = route === 'adventure' ? 'mcgill' : route;
    if (nextId === currentId) return;
    session.dispose();
    currentId = nextId;
    progress = enterRoom(progress, nextId);
    host.innerHTML = playableChapters[nextId].render();
    host.classList.add('room-entering');
    mountCurrent();
    persist();
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
  const previous = progress;
  progress = enterRoom(progress, currentId);
  mountCurrent();
  if (progress !== previous) persist();
  else if (loaded.status !== 'ready') reportSaved(false);

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
