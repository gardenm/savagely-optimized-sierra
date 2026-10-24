import type { GameState } from '../game/model';
import type { StoryRoomState } from '../game/story/model';
import { required } from './dom';

export const renderLightspeed = () => '';

/** Props follow persistent facts. No animation timer controls collection or travel. */
export function createLightspeedView(root: HTMLElement) {
  const stage = required(root, '#stage');
  const drawerHotspot = required<HTMLButtonElement>(root, '[data-prop="drawer"]');
  const clipHotspot = required<HTMLButtonElement>(root, '[data-prop="clip"]');
  const props = document.createElement('div');
  props.className = 'lightspeed-props';
  props.setAttribute('aria-hidden', 'true');
  props.innerHTML = `<img class="lightspeed-drawer" src="/art/lightspeed-drawer.webp" alt="" draggable="false" hidden />
    <img class="lightspeed-clip" src="/art/retaining-clip.webp" alt="" draggable="false" hidden />
    <div class="lightspeed-receipt" hidden><span>2 × $3.00</span><strong>TOTAL $3.00</strong></div>`;
  stage.append(props);
  const drawer = required<HTMLImageElement>(props, '.lightspeed-drawer');
  const clip = required<HTMLImageElement>(props, '.lightspeed-clip');
  const receipt = required<HTMLElement>(props, '.lightspeed-receipt');
  let printed: boolean | undefined;

  return {
    isOpen: false,
    render(state: GameState<StoryRoomState>) {
      const opened = state.progress.flags?.drawerOpen === true;
      const taken = state.progress.flags?.clipTaken === true;
      const hasReceipt = state.progress.inventory.includes('faulty-receipt');
      drawer.hidden = !opened;
      clip.hidden = clipHotspot.hidden = !opened || taken;
      // A single target covers the drawer's contents, even on a small touch screen.
      drawerHotspot.hidden = opened && !taken;
      drawerHotspot.setAttribute('aria-label', opened ? 'Open counter drawer' : 'Counter drawer');
      receipt.hidden = !hasReceipt;
      if (printed === false && hasReceipt) receipt.classList.add('receipt-printing');
      if (!hasReceipt) receipt.classList.remove('receipt-printing');
      printed = hasReceipt;
    },
    reset() { printed = undefined; receipt.classList.remove('receipt-printing'); },
    dispose() { props.remove(); },
  };
}
