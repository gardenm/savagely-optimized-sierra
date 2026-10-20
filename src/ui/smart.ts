import type { GameState } from '../game/model';
import type { StoryRoomState } from '../game/story/model';
import { required } from './dom';

export const renderSmart = () => '';

/** The scene reflects reducer facts; falling/collection has no timing requirement. */
export function createSmartView(root: HTMLElement) {
  const stage = required(root, '#stage');
  const hotspot = required<HTMLButtonElement>(root, '[data-prop="stylus"]');
  const props = document.createElement('div');
  props.className = 'smart-props';
  props.setAttribute('aria-hidden', 'true');
  props.innerHTML = `<img class="smart-stylus" src="/art/smart-stylus.webp" alt="" width="1774" height="887" draggable="false" />
    <div class="smart-board-content" hidden><span class="smart-board-example">2 coffees · $3 each</span><span class="smart-board-equation">2 × $3 → $6</span></div>`;
  stage.append(props);
  const stylus = required<HTMLImageElement>(props, '.smart-stylus');
  const board = required<HTMLElement>(props, '.smart-board-content');
  const equation = required<HTMLElement>(props, '.smart-board-equation');
  let down: boolean | undefined;

  return {
    isOpen: false,
    render(state: GameState<StoryRoomState>) {
      const fallen = state.progress.flags?.stylusDown === true;
      const owned = state.progress.inventory.includes('stylus');
      // Initial/restored state is placed immediately; only the actual hit gets a fall.
      if (down === false && fallen) props.classList.add('stylus-falling');
      if (!fallen) props.classList.remove('stylus-falling');
      down = fallen;
      props.classList.toggle('stylus-down', fallen);
      stylus.hidden = owned;
      hotspot.hidden = owned;
      hotspot.setAttribute('aria-label', fallen ? 'Stylus on the floor' : 'Stylus on the ledge');
      hotspot.style.left = fallen ? '68%' : '67%';
      hotspot.style.top = fallen ? '78%' : '8%';
      board.hidden = state.progress.flags?.exampleOnBoard !== true;
      equation.hidden = !state.progress.inventory.includes('checkout-plan');
    },
    reset() { down = undefined; props.classList.remove('stylus-falling'); },
    dispose() { props.remove(); },
  };
}
