import { verbs, type Dispatch, type Effect, type GameState, type Mode, type RoomDefinition } from '../game/model';
import { commandText } from '../game/update';
import { escapeHtml, required, setText } from './dom';
import { icon } from './icons';

export function renderAdventure<S, A>(room: RoomDefinition<S, A>): string {
  return `
    <section id="adventure-view" data-room="${escapeHtml(room.id)}" aria-labelledby="adventure-heading">
      <h1 class="scene-title" id="adventure-heading">${escapeHtml(room.title)}</h1>
      <div class="adventure-layout">
        <div class="game-window" tabindex="0" role="group" aria-label="${escapeHtml(room.gameLabel)}" aria-keyshortcuts="W L U">
          <div class="stage" id="stage" aria-label="${escapeHtml(room.label)}">
            <img class="room-art" src="${escapeHtml(room.art.src)}" alt="${escapeHtml(room.art.alt)}" width="${room.art.width}" height="${room.art.height}" fetchpriority="high" draggable="false" />
            ${room.props.map(prop => `<button class="hotspot ${escapeHtml(prop.id)}" data-prop="${escapeHtml(prop.id)}" aria-label="${escapeHtml(prop.label)}" style="left:${prop.area.left}%;top:${prop.area.top}%;width:${prop.area.width}%;height:${prop.area.height}%"></button>`).join('')}
            <div class="character" id="character" role="img" aria-label="Cartoon adventurer with swept brown hair, a full brown beard, tortoiseshell glasses, a sage V-neck shirt, and a left-arm Japanese tattoo sleeve"><img class="character-right" src="/art/adventurer-right.webp" alt="" width="1024" height="1536" draggable="false" /><img class="character-left" src="/art/adventurer-left.webp" alt="" width="1024" height="1536" draggable="false" /></div>
            <div class="floor-marker" id="floor-marker" aria-hidden="true"></div>
            <div class="dialogue"><p id="dialogue-text" role="status" aria-live="polite" aria-atomic="true"></p><a class="paper-link" id="dialogue-link" target="_blank" rel="noopener" hidden><span class="paper-link-label"></span> ${icon('arrow')}<span class="sr-only"> (opens in a new tab)</span></a></div>
          </div>
          <div class="command-line"><span id="command-text"></span></div>
          <div class="game-controls">
            <div class="verbs" role="group" aria-label="Choose an action">
              ${Object.entries(verbs).map(([key, label]) => `<button data-mode="${key}" aria-pressed="false"${key === 'look' ? ' aria-keyshortcuts="L"' : key === 'use' ? ' aria-keyshortcuts="U"' : ''}>${label}</button>`).join('')}
            </div>
            <div class="inventory" role="group" aria-label="Inventory">${room.items.map(item => `<button id="${escapeHtml(item.id)}" class="ticket-item" data-item="${escapeHtml(item.id)}" aria-label="${escapeHtml(item.label)}" aria-pressed="false" hidden>${icon(item.icon as Parameters<typeof icon>[0])}${item.worn ? `<span class="worn-marker" data-worn-marker aria-hidden="true" hidden>${icon('check')}</span>` : ''}</button>`).join('')}</div>
          </div>
        </div>
      </div>
    </section>`;
}

/** Mount once and patch existing nodes, preserving focus, dialogs, and animation. */
export function createAdventureView<S, A>(root: HTMLElement, room: RoomDefinition<S, A>, dispatch: Dispatch<A>, isActive: () => boolean) {
  const events = new AbortController();
  const options = { signal: events.signal };
  const game = required<HTMLElement>(root, '.game-window');
  const stage = required<HTMLElement>(root, '#stage');
  const character = required<HTMLElement>(root, '#character');
  const marker = required<HTMLElement>(root, '#floor-marker');
  const command = required(root, '#command-text');
  const speech = required(root, '#dialogue-text');
  const link = required<HTMLAnchorElement>(root, '#dialogue-link');
  const linkLabel = required(link, '.paper-link-label');
  const verbButtons = game.querySelectorAll<HTMLButtonElement>('[data-mode]');
  const items = game.querySelectorAll<HTMLButtonElement>('[data-item]');
  let motionTimer: ReturnType<typeof setTimeout> | undefined;

  verbButtons.forEach(button => button.addEventListener('click', () => {
    dispatch({ type: 'select-mode', mode: button.dataset.mode as Mode });
  }, options));
  game.querySelectorAll<HTMLButtonElement>('[data-prop]').forEach(button => {
    const prop = button.dataset.prop!;
    button.addEventListener('click', () => dispatch({ type: 'interact', prop }), options);
    for (const event of ['pointerenter', 'focus']) button.addEventListener(event, () => dispatch({ type: 'point-at', prop }), options);
    for (const event of ['pointerleave', 'blur']) button.addEventListener(event, () => dispatch({ type: 'point-at', prop: null }), options);
  });
  items.forEach(button => button.addEventListener('click', () => {
    dispatch({ type: 'select-item', item: button.dataset.item! });
  }, options));
  stage.addEventListener('click', event => {
    if ((event.target as Element).closest('button, a')) return;
    const rect = stage.getBoundingClientRect();
    const to = { x: (event.clientX - rect.left) / rect.width * 100, y: (event.clientY - rect.top) / rect.height * 100 };
    if (to.y >= 64) dispatch({ type: 'walk', to });
  }, options);
  game.addEventListener('keydown', event => {
    if (!isActive() || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    if ((event.target as Element).closest('input,textarea,select,summary,details')) return;
    const movement = { ArrowLeft: { x: -3, y: 0 }, ArrowRight: { x: 3, y: 0 }, ArrowUp: { x: 0, y: -2 }, ArrowDown: { x: 0, y: 2 } };
    if (Object.hasOwn(movement, event.key)) {
      event.preventDefault();
      dispatch({ type: 'move', by: movement[event.key as keyof typeof movement] });
    } else {
      const mode = ({ w: 'walk', l: 'look', u: 'use' } as const)[event.key.toLowerCase() as 'w' | 'l' | 'u'];
      if (mode) dispatch({ type: 'select-mode', mode });
    }
  }, options);

  return {
    render(state: GameState<S>) {
      setText(command, commandText(state, room));
      setText(speech, state.dialogue.text);
      link.hidden = !state.dialogue.link;
      if (state.dialogue.link) {
        link.href = state.dialogue.link.url;
        setText(linkLabel, state.dialogue.link.label);
      }
      verbButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === state.mode)));
      items.forEach(button => {
        const item = room.items.find(item => item.id === button.dataset.item)!;
        const worn = !!item.worn && state.progress.flags?.[item.worn.flag] === true;
        button.setAttribute('aria-label', worn ? item.worn!.label : item.label);
        const marker = button.querySelector<HTMLElement>('[data-worn-marker]');
        if (marker) marker.hidden = !worn;
        button.hidden = !state.progress.inventory.includes(button.dataset.item!);
        button.setAttribute('aria-pressed', String(button.dataset.item === state.selectedItem));
      });
      character.style.left = `${state.progress.position.x}%`;
      character.style.top = `${state.progress.position.y}%`;
    },
    walk(effect: Extract<Effect, { type: 'walk' }>) {
      character.classList.toggle('facing-left', effect.to.x < effect.from.x);
      character.style.setProperty('--walk-duration', `${effect.duration}s`);
      character.classList.add('walking');
      clearTimeout(motionTimer);
      motionTimer = setTimeout(() => character.classList.remove('walking'), effect.duration * 1000);
      if (effect.marker) {
        marker.style.left = `${effect.to.x}%`;
        marker.style.top = `${effect.to.y}%`;
        marker.classList.remove('visible');
        void marker.offsetWidth;
        marker.classList.add('visible');
      }
    },
    reset() {
      clearTimeout(motionTimer);
      character.classList.remove('walking');
      character.style.setProperty('--walk-duration', '0s');
      marker.classList.remove('visible');
    },
    dispose() {
      events.abort();
      clearTimeout(motionTimer);
    },
  };
}
