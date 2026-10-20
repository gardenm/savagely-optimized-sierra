import type { Dispatch, GameState } from '../game/model';
import { circuit, configured, linkRestored, ports, type NortelAction, type NortelState, type Port } from '../game/rooms/nortel';
import { required, setText } from './dom';
import { icon } from './icons';

export function renderPatchbay(): string {
  return `<dialog id="patchbay-dialog" class="patchbay-dialog" aria-labelledby="patchbay-heading">
    <div class="terminal-window patchbay-window">
      <div class="terminal-top"><span>Nortel · OME</span><button id="close-patchbay" aria-label="Close patch bay">${icon('close')}</button></div>
      <div class="terminal-body"><h2 id="patchbay-heading">Optical shelves.</h2>
        <div class="patchbay-shelves">
          ${(['a', 'b'] as const).map(rack => `<section class="optical-shelf" role="group" aria-label="OME ${rack.toUpperCase()}, shelf ${rack === 'a' ? circuit.sourceShelf : circuit.destinationShelf}">
            <h3>OME ${rack.toUpperCase()}<span>Shelf ${rack === 'a' ? circuit.sourceShelf : circuit.destinationShelf}</span></h3>
            <div class="optical-ports">${ports.map(port => `<button class="optical-port" data-rack="${rack}" data-port="${port}" aria-label="OME ${rack.toUpperCase()} shelf ${rack === 'a' ? circuit.sourceShelf : circuit.destinationShelf} port ${port}" aria-pressed="false"><span class="port-socket" aria-hidden="true"></span><span>${port}</span></button>`).join('')}</div>
          </section>`).join('')}
          <svg class="patch-cable" aria-hidden="true"><path /></svg>
        </div>
        <div class="patchbay-status"><span class="carrier-light" aria-hidden="true"></span><span id="carrier-status">No carrier</span><span class="service-status">PDH</span></div>
        <p id="patchbay-feedback" role="status" aria-live="polite"></p>
      </div>
    </div>
  </dialog>`;
}

export function createPatchbayView(root: HTMLElement, dispatch: Dispatch<NortelAction>) {
  const events = new AbortController();
  const options = { signal: events.signal };
  const dialog = required<HTMLDialogElement>(root, '#patchbay-dialog');
  const close = required<HTMLButtonElement>(dialog, '#close-patchbay');
  const shelves = required<HTMLElement>(dialog, '.patchbay-shelves');
  const cable = required<SVGSVGElement>(shelves, '.patch-cable');
  const path = required<SVGPathElement>(cable, 'path');
  const buttons = [...shelves.querySelectorAll<HTMLButtonElement>('[data-port]')];
  const feedback = required(dialog, '#patchbay-feedback');
  const carrier = required(dialog, '#carrier-status');
  const lamp = document.createElement('span');
  lamp.className = 'nortel-link-lamp';
  lamp.setAttribute('aria-hidden', 'true');
  required(root, '#stage').append(lamp);
  let lastFocus: HTMLElement | null = null;
  let rendered: GameState<NortelState> | undefined;
  let frame = 0;

  function drawCable() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const a = buttons.find(button => button.dataset.rack === 'a' && button.getAttribute('aria-pressed') === 'true');
      const b = buttons.find(button => button.dataset.rack === 'b' && button.getAttribute('aria-pressed') === 'true');
      if (!dialog.open || !a || !b) { path.removeAttribute('d'); return; }
      const box = shelves.getBoundingClientRect();
      const first = required(a, '.port-socket').getBoundingClientRect();
      const second = required(b, '.port-socket').getBoundingClientRect();
      const x1 = first.x + first.width / 2 - box.x;
      const x2 = second.x + second.width / 2 - box.x;
      const y1 = first.y + first.height / 2 - box.y;
      const y2 = second.y + second.height / 2 - box.y;
      cable.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
      path.setAttribute('d', `M ${x1} ${y1} C ${x1} ${box.height + 22}, ${x2} ${box.height + 22}, ${x2} ${y2}`);
    });
  }
  const observer = new ResizeObserver(drawCable);
  observer.observe(shelves);
  close.addEventListener('click', () => dispatch({ type: 'room', action: { type: 'close-patchbay' } }), options);
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    dispatch({ type: 'room', action: { type: 'close-patchbay' } });
  }, options);
  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    if (rendered?.room.patchbayOpen) dispatch({ type: 'room', action: { type: 'close-patchbay' } });
    if (lastFocus?.isConnected) lastFocus.focus();
  }, options);
  buttons.forEach(button => button.addEventListener('click', () => dispatch({
    type: 'room', action: { type: 'patch-port', rack: button.dataset.rack as 'a' | 'b', port: Number(button.dataset.port) as Port },
  }), options));

  return {
    get isOpen() { return dialog.open; },
    render(state: GameState<NortelState>) {
      const previouslyLinked = rendered && linkRestored(rendered.progress);
      rendered = state;
      const linked = linkRestored(state.progress);
      buttons.forEach(button => {
        button.setAttribute('aria-pressed', String(state.room[button.dataset.rack as 'a' | 'b'] === Number(button.dataset.port)));
        button.disabled = linked;
      });
      dialog.classList.toggle('has-carrier', linked);
      lamp.classList.toggle('is-connected', linked);
      lamp.classList.toggle('is-configured', configured(state.progress));
      setText(carrier, linked ? 'Carrier restored' : 'No carrier');
      setText(feedback, state.room.feedback);
      if (state.room.patchbayOpen && !dialog.open) {
        lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        dialog.showModal();
        close.focus();
      } else if (!state.room.patchbayOpen && dialog.open) dialog.close();
      else if (state.room.patchbayOpen && linked && !previouslyLinked) close.focus();
      drawCable();
    },
    reset() { path.removeAttribute('d'); },
    dispose() { events.abort(); observer.disconnect(); cancelAnimationFrame(frame); if (dialog.open) dialog.close(); lamp.remove(); },
  };
}
