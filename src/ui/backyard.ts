import type { Dispatch } from '../game/model';
import { backyard, HOT_DOG_LINE, updateBackyard } from '../game/rooms/backyard';
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
  restart.addEventListener('click', answer, options);
  required(root, '#domain-joke').addEventListener('click', answer, options);
  // Even clicks on empty scenery keep the same response, including the upper half of the yard.
  required(root, '#stage').addEventListener('click', answer, options);

  function answer() { dispatch({ type: 'restart' }); }
  function dispatch(action: Parameters<Dispatch<never>>[0]) {
    state = updateBackyard(state, action).state;
    view.render(state);
  }
  view.render(state);
  return () => { events.abort(); view.dispose(); robot.remove(); root.replaceChildren(); };
}
