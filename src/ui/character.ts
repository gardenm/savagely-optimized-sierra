import type { Effect } from '../game/model';
import { required } from './dom';

type Walk = Extract<Effect, { type: 'walk' }>;

export function renderCharacter(): string {
  return `<div class="character" id="character" role="img" aria-label="Cartoon adventurer with swept brown hair, a full brown beard, tortoiseshell glasses, a sage V-neck shirt, and a left-arm Japanese tattoo sleeve">
    <img class="character-idle character-right" src="/art/adventurer-right.webp" alt="" width="1024" height="1536" draggable="false" />
    <img class="character-idle character-left" src="/art/adventurer-left.webp" alt="" width="1024" height="1536" draggable="false" />
    <span class="character-walk" aria-hidden="true"></span>
  </div>`;
}

/** Sprite playback is presentation state; movement and saved positions stay in the reducer. */
export function createCharacterView(root: HTMLElement) {
  const character = required<HTMLElement>(root, '#character');
  const marker = required<HTMLElement>(root, '#floor-marker');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  let walkTimer: ReturnType<typeof setTimeout> | undefined;

  // Decode before swapping away from the idle pose, including on slow connections.
  const atlases = ['right', 'left'].map(direction => {
    const image = new Image();
    image.src = `/art/adventurer-walk-${direction}.webp`;
    return image;
  });
  void Promise.all(atlases.map(image => image.decode())).then(() => {
    if (!events.signal.aborted) character.classList.add('walk-ready');
  }).catch(() => { /* Idle art remains available if an atlas fails. */ });

  function stop() {
    clearTimeout(walkTimer);
    character.classList.remove('walking');
  }
  motion.addEventListener('change', stop, { signal: events.signal });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); }, { signal: events.signal });

  return {
    position(point: { x: number; y: number }) {
      character.style.left = `${point.x}%`;
      character.style.top = `${point.y}%`;
    },
    walk(effect: Walk) {
      // Vertical moves and repeated clicks retain the last horizontal facing.
      if (effect.to.x !== effect.from.x) character.classList.toggle('facing-left', effect.to.x < effect.from.x);
      character.style.setProperty('--walk-duration', `${effect.duration}s`);
      clearTimeout(walkTimer);
      const moved = effect.to.x !== effect.from.x || effect.to.y !== effect.from.y;
      if (moved && !motion.matches && !document.hidden) {
        // Retargeting preserves the cycle phase instead of restarting the same footfall.
        character.classList.add('walking');
        walkTimer = setTimeout(stop, effect.duration * 1000);
      } else stop();
      if (effect.marker) {
        marker.style.left = `${effect.to.x}%`;
        marker.style.top = `${effect.to.y}%`;
        marker.classList.remove('visible');
        void marker.offsetWidth;
        marker.classList.add('visible');
      }
    },
    stop,
    dispose() { stop(); events.abort(); },
  };
}
