import { required } from '../ui/dom';

export type RoomRoute = 'adventure' | 'nortel' | 'smart' | 'lightspeed' | 'shopify';
export type Route = RoomRoute | 'chapters' | 'cv';
export const isRoomRoute = (route: Route): route is RoomRoute => route !== 'chapters' && route !== 'cv';

export function parseRoute(hash: string): Route {
  const requested = hash.replace(/^#/, '');
  return requested === 'nortel' || requested === 'smart' || requested === 'lightspeed' || requested === 'shopify' || requested === 'chapters' || requested === 'cv' ? requested : 'adventure';
}

export function createNavigation(root: HTMLElement, titles: Record<Route, string>, onChange: (route: Route) => void = () => undefined) {
  const events = new AbortController();
  let current: Route | undefined;
  const views = root.querySelectorAll<HTMLElement>('[data-view]');
  const links = root.querySelectorAll<HTMLAnchorElement>('[data-nav]');
  const main = required<HTMLElement>(root, '#main');

  function render() {
    const next = parseRoute(location.hash);
    if (current && current !== next) onChange(next);
    const view = isRoomRoute(next) ? 'adventure' : next;
    views.forEach(element => { element.hidden = element.dataset.view !== view; });
    links.forEach(link => {
      if (link.dataset.nav === view) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
      if (link.dataset.nav === 'adventure' && view === 'adventure') link.href = `#${next}`;
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
    rememberRoom(route: RoomRoute) {
      links.forEach(link => { if (link.dataset.nav === 'adventure') link.href = `#${route}`; });
      root.querySelectorAll<HTMLAnchorElement>('[data-return-adventure]').forEach(link => { link.href = `#${route}`; });
    },
    dispose() { events.abort(); },
  };
}
