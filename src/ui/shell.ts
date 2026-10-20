import { renderPages } from './pages';
import { icon } from './icons';
import { required, setText } from './dom';

export function renderShell(chapterMarkup: string): string {
  return `
  <header class="site-header">
    <a class="wordmark" href="#adventure" aria-label="Savagely Optimized home">savagely<span>optimized<span class="wordmark-dot">.</span></span></a>
    <nav aria-label="Main navigation">
      <a href="#adventure" data-nav="adventure">The adventure</a>
      <a href="#chapters" data-nav="chapters">Chapter map</a>
      <a href="#cv" data-nav="cv">The short version ${icon('arrow')}</a>
    </nav>
    <button class="sound-toggle" data-sound aria-pressed="false" aria-label="Turn on ambient sound">${icon('muted')}<span>Sound off</span></button>
  </header>
  <main id="main" tabindex="-1">
    <div id="room-host" data-view="adventure">${chapterMarkup}</div>
    ${renderPages()}
    <span class="sr-only" id="save-status" role="status"></span>
  </main>
  <footer class="site-footer"><button id="domain-joke" title="Examine the domain">savagelyoptimized.co ${icon('spark')}</button><button id="reset-progress" title="Restart the entire adventure">Restart</button></footer>
  <div class="toast" id="toast" role="status" hidden></div>
  `;
}

export function createShellView(root: HTMLElement, onSound: () => void, onRestart: () => void) {
  const events = new AbortController();
  const options = { signal: events.signal };
  const soundButtons = root.querySelectorAll<HTMLButtonElement>('[data-sound]');
  const toast = required<HTMLElement>(root, '#toast');
  const saveStatus = required(root, '#save-status');
  let toastTimer: ReturnType<typeof setTimeout> | undefined;

  function showToast(text: string) {
    clearTimeout(toastTimer);
    setText(toast, text);
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 6000);
  }
  soundButtons.forEach(button => button.addEventListener('click', onSound, options));
  required(root, '#reset-progress').addEventListener('click', onRestart, options);
  required(root, '#domain-joke').addEventListener('click', () => showToast('Originally .com. The M was deemed nonessential.'), options);

  return {
    sound(enabled: boolean) {
      soundButtons.forEach(button => {
        button.innerHTML = `${icon(enabled ? 'sound' : 'muted')}<span>Sound ${enabled ? 'on' : 'off'}</span>`;
        button.setAttribute('aria-pressed', String(enabled));
        button.setAttribute('aria-label', `Turn ${enabled ? 'off' : 'on'} ambient sound`);
      });
    },
    saveStatus(message: string) { setText(saveStatus, message); },
    showToast,
    dispose() { events.abort(); clearTimeout(toastTimer); },
  };
}
