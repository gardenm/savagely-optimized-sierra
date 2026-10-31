import type { Action } from '../game/model';
import { backyard, HOT_DOG_LINE, updateBackyard, type BackyardAction } from '../game/rooms/backyard';
import { createInitialState } from '../game/update';
import { createAdventureView, renderAdventure } from './adventure';
import { required } from './dom';
import { renderShell } from './shell';

/** URL-only, without opening the normal adventure store or borrowing its inventory. */
export function startBackyard(root: HTMLElement): () => void {
  root.innerHTML = renderShell(renderAdventure(backyard));
  document.title = 'Savagely Optimized — Backyard';
  const events = new AbortController();
  const options = { signal: events.signal };
  const robot = document.createElement('meta');
  robot.name = 'robots';
  robot.content = 'noindex, nofollow';
  document.head.append(robot);
  let state = { ...createInitialState(backyard), dialogue: { text: HOT_DOG_LINE } };
  const view = createAdventureView(root, backyard, dispatch, () => true);
  const normal = new URL(location.href);
  normal.searchParams.delete('scene');
  normal.hash = '';
  root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(link => {
    const target = new URL(normal);
    // The normal adventure resumes its own saved room; this scene is never saved as one.
    if (link.getAttribute('href') !== '#adventure') target.hash = link.getAttribute('href')!;
    link.href = target.href;
  });
  required<HTMLAnchorElement>(root, '[data-nav="adventure"]').setAttribute('aria-current', 'page');
  required<HTMLElement>(root, '[data-sound]').hidden = true;
  const restart = required<HTMLButtonElement>(root, '#reset-progress');
  restart.title = 'Restart this scene';
  restart.addEventListener('click', () => dispatch({ type: 'restart' }), options);
  required(root, '#domain-joke').addEventListener('click', () => dispatch({ type: 'room', action: { type: 'postpone' } }), options);

  function dispatch(action: Action<BackyardAction>) {
    const result = updateBackyard(state, action);
    state = result.state;
    if (action.type === 'restart') view.reset();
    for (const effect of result.effects) if (effect.type === 'walk') view.walk(effect);
    view.render(state);
  }
  view.render(state);
  return () => { events.abort(); view.dispose(); robot.remove(); root.replaceChildren(); };
}
