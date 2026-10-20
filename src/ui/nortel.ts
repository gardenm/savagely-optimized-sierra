import type { Dispatch, GameState } from '../game/model';
import { linkRestored, strapWorn, type NortelAction, type NortelState } from '../game/rooms/nortel';
import { required } from './dom';
import { icon } from './icons';

export const renderNortel = () => '';

/** Scene props and a recoverable hardware fault; puzzle rules remain in the reducer. */
export function createNortelView(root: HTMLElement, dispatch: Dispatch<NortelAction>) {
  const stage = required(root, '#stage');
  const character = required(root, '#character');
  const characterLabel = character.getAttribute('aria-label')!;
  const strapHotspot = required<HTMLButtonElement>(root, '[data-prop="strap"]');
  const cableHotspot = required<HTMLButtonElement>(root, '[data-prop="cable"]');
  const props = document.createElement('div');
  props.className = 'nortel-props';
  props.setAttribute('aria-hidden', 'true');
  props.innerHTML = `<img class="nortel-strap" src="/art/antistatic-strap.webp" alt="" width="1536" height="1024" draggable="false" />
    <img class="nortel-cable" src="/art/loose-cable.webp" alt="" width="1024" height="1536" draggable="false" />
    <span class="nortel-link-lamp"></span>`;
  stage.append(props);
  const strap = required<HTMLImageElement>(props, '.nortel-strap');
  const cable = required<HTMLImageElement>(props, '.nortel-cable');
  const lamp = required(props, '.nortel-link-lamp');
  const shock = document.createElement('span');
  shock.className = 'static-spark';
  shock.setAttribute('aria-hidden', 'true');
  shock.innerHTML = icon('spark');
  shock.hidden = true;
  character.append(shock);
  let tripped = false;
  let recoveryTimer: ReturnType<typeof setTimeout> | undefined;
  let shockTimer: ReturnType<typeof setTimeout> | undefined;

  function clearFault() {
    clearTimeout(recoveryTimer);
    clearTimeout(shockTimer);
    recoveryTimer = undefined;
    tripped = false;
    stage.classList.remove('is-tripped');
    character.classList.remove('is-shocked');
    shock.hidden = true;
  }

  return {
    isOpen: false,
    render(state: GameState<NortelState>) {
      const owned = state.progress.inventory.includes('strap');
      const worn = strapWorn(state.progress);
      const linked = linkRestored(state.progress);
      strap.hidden = owned;
      strapHotspot.hidden = owned;
      cable.hidden = linked;
      cableHotspot.setAttribute('aria-label', linked ? 'Connected cable' : 'Loose cable');
      character.setAttribute('aria-label', characterLabel + (worn ? ', wearing a grounded anti-static wrist strap' : ''));
      lamp.classList.toggle('is-connected', linked && !state.room.tripped);
      if (state.room.tripped && !tripped) {
        tripped = true;
        stage.classList.add('is-tripped');
        character.classList.add('is-shocked');
        shock.hidden = false;
        shockTimer = setTimeout(() => {
          character.classList.remove('is-shocked');
          shock.hidden = true;
        }, 650);
        recoveryTimer = setTimeout(() => dispatch({ type: 'room', action: { type: 'reset-equipment' } }), 1800);
      } else if (!state.room.tripped && tripped) clearFault();
    },
    reset: clearFault,
    dispose() { clearFault(); props.remove(); shock.remove(); },
  };
}
