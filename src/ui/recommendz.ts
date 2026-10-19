import { genres, type McGillAction, type McGillState } from '../game/rooms/mcgill';
import type { Dispatch, GameState } from '../game/model';
import { required, setText } from './dom';
import { icon } from './icons';

export function renderRecommendz(): string {
  return `
  <dialog id="computer-dialog" aria-labelledby="terminal-heading">
    <div class="terminal-window"><div class="terminal-top"><span>Recommendz</span><button id="close-terminal" aria-label="Close Recommendz">${icon('close')}</button></div><div class="terminal-body"><h2 id="terminal-heading">One last recommendation.</h2><p class="terminal-intro"><strong>A funny adventure. A little science fiction.</strong></p><fieldset id="genre-options"><legend>Genres</legend>${genres.map(g => `<label><input type="checkbox" name="genre" value="${g}" /><span>${g}</span></label>`).join('')}</fieldset><p id="terminal-feedback" role="status"></p><button id="recommend-button" class="terminal-button">Recommend ${icon('arrow')}</button><div id="recommendation" hidden><h3>Back to the Future</h3><p>A little science. A questionable plan.</p><div class="printed-ticket">${icon('ticket')}<div>ONE ADMITTANCE<span>The next chapter</span></div></div><button id="take-ticket" class="terminal-button">Take the ticket ${icon('hand')}</button></div></div></div>
  </dialog>
  `;
}

export function createRecommendzView(root: HTMLElement, dispatch: Dispatch<McGillAction>) {
  const events = new AbortController();
  const options = { signal: events.signal };
  const dialog = required<HTMLDialogElement>(root, '#computer-dialog');
  const close = required<HTMLButtonElement>(dialog, '#close-terminal');
  const recommendation = required<HTMLElement>(dialog, '#recommendation');
  const choices = required<HTMLElement>(dialog, '#genre-options');
  const recommend = required<HTMLButtonElement>(dialog, '#recommend-button');
  const take = required<HTMLButtonElement>(dialog, '#take-ticket');
  const feedback = required(dialog, '#terminal-feedback');
  const inputs = dialog.querySelectorAll<HTMLInputElement>('input[name="genre"]');
  let lastFocus: HTMLElement | null = null;
  let rendered: McGillState | undefined;

  close.addEventListener('click', () => dispatch({ type: 'room', action: { type: 'close-computer' } }), options);
  // Update state before native focus restoration can dispatch a hotspot focus event.
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    dispatch({ type: 'room', action: { type: 'close-computer' } });
  }, options);
  dialog.addEventListener('close', () => {
    if (dialog.open) return; // Ignore a queued close event if the dialog has reopened.
    if (rendered?.computerOpen) dispatch({ type: 'room', action: { type: 'close-computer' } });
    if (lastFocus?.isConnected) lastFocus.focus();
  }, options);
  recommend.addEventListener('click', () => dispatch({
    type: 'room', action: { type: 'recommend', genres: [...inputs].filter(input => input.checked).map(input => input.value) },
  }), options);
  take.addEventListener('click', () => dispatch({ type: 'room', action: { type: 'take-ticket' } }), options);

  return {
    get isOpen() { return dialog.open; },
    render(state: GameState<McGillState>) {
      const previous = rendered;
      rendered = state.room;
      const result = state.room.recommendation;
      const matched = result === 'match' || result === 'claimed';
      recommendation.hidden = !matched;
      choices.hidden = matched;
      recommend.hidden = matched;
      setText(take, result === 'claimed' ? 'Back to the lab →' : 'Take the ticket →');
      setText(feedback, {
        initial: '', incomplete: 'Choose three genres.', 'no-match': 'No match.',
        match: 'Match found. The future looks promising.', claimed: 'Ticket printed.',
      }[result]);
      if (state.room.computerOpen && !dialog.open) {
        lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        dialog.showModal();
        close.focus();
      } else if (!state.room.computerOpen && dialog.open) {
        dialog.close();
      } else if (state.room.computerOpen && result === 'match' && previous?.recommendation !== 'match') {
        take.focus();
      }
    },
    reset() { inputs.forEach(input => { input.checked = false; }); },
    dispose() { events.abort(); if (dialog.open) dialog.close(); },
  };
}
