import type { GameState } from '../game/model';
import type { StoryRoomState } from '../game/story/model';
import { required } from './dom';

export const renderShopify = () => '';

/** The pick is a separate prop so collecting it leaves no painted duplicate. */
export function createShopifyView(root: HTMLElement) {
  const stage = required(root, '#stage');
  const pickHotspot = required<HTMLButtonElement>(root, '[data-prop="pick"]');
  const props = document.createElement('div');
  props.className = 'shopify-props';
  props.setAttribute('aria-hidden', 'true');
  props.innerHTML = `<svg class="shopify-pick" viewBox="0 0 100 100"><path d="M17 24Q47 6 82 24Q96 40 54 88Q38 99 17 56Q6 34 17 24Z" fill="#ffd36b" stroke="#30213e" stroke-width="7"/><path d="m32 34 30 3" stroke="#fff2d3" stroke-width="6" stroke-linecap="round"/></svg>
    <div class="shopify-screen" hidden><span class="shopify-screen-brief"></span><span class="shopify-screen-result"></span></div>`;
  stage.append(props);
  const pick = required<SVGElement>(props, '.shopify-pick');
  const screen = required<HTMLElement>(props, '.shopify-screen');
  const brief = required<HTMLElement>(props, '.shopify-screen-brief');
  const result = required<HTMLElement>(props, '.shopify-screen-result');
  return {
    isOpen: false,
    render(state: GameState<StoryRoomState>) {
      const taken = state.progress.inventory.includes('guitar-pick');
      pick.style.display = taken ? 'none' : '';
      pickHotspot.hidden = taken;
      const plan = state.progress.flags?.agentHasPlan === true;
      const example = state.progress.flags?.agentHasExample === true;
      screen.hidden = !plan && !example;
      brief.textContent = [plan ? 'PLAN' : '', example ? 'EXAMPLE' : ''].filter(Boolean).join(' + ');
      result.textContent = state.progress.completed ? 'REVIEWED' : state.progress.agent?.candidate ? 'CANDIDATE' : '';
    },
    reset() {},
    dispose() { props.remove(); },
  };
}
