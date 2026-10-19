import { required } from '../ui/dom';

export type Route = 'adventure' | 'chapters' | 'cv';

export function parseRoute(hash: string): Route {
  const requested = hash.replace(/^#/, '');
  return requested === 'chapters' || requested === 'cv' ? requested : 'adventure';
}

export function createNavigation(root: HTMLElement, titles: Record<Route, string>) {
  const events = new AbortController();
  let current: Route | undefined;
  const views = root.querySelectorAll<HTMLElement>('[data-view]');
  const links = root.querySelectorAll<HTMLAnchorElement>('[data-nav]');
  const main = required<HTMLElement>(root, '#main');

  function render() {
    const next = parseRoute(location.hash);
    views.forEach(view => { view.hidden = view.dataset.view !== next; });
    links.forEach(link => {
      if (link.dataset.nav === next) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.title = `Savagely Optimized — ${titles[next]}`;
    if (current && current !== next) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      main.focus({ preventScroll: true });
    }
    current = next;
  }

  window.addEventListener('hashchange', render, { signal: events.signal });
  render();
  return {
    get route(): Route { return current!; },
    navigate(route: Route) { location.hash = route; },
    dispose() { events.abort(); },
  };
}
