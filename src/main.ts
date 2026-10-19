import '@fontsource/lilita-one/latin-400.css';
import '@fontsource/comic-neue/latin-400.css';
import '@fontsource/comic-neue/latin-700.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import './style.css';

const icons = {
  arrow: '<path d="M4 12h15m-5-5 5 5-5 5"/>',
  hand: '<path d="M8 12V5a2 2 0 0 1 4 0v6-3a2 2 0 0 1 4 0v4-2a2 2 0 0 1 4 0v6c0 4-3 6-6 6h-1c-2 0-3-1-4-2l-5-6a2 2 0 0 1 3-3l2 2"/>',
  sound: '<path d="M11 4 6 8H3v8h3l5 4Zm5 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  muted: '<path d="M11 4 6 8H3v8h3l5 4Zm5 5 6 6m0-6-6 6"/>',
  ticket: '<path d="M3 7h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4Zm12 0v3m0 3v2m0 2v2"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  spark: '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/>',
};
function icon(name: keyof typeof icons, cls = '') {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
}

const verbs = { give: 'Give', pickup: 'Pick up', use: 'Use', open: 'Open', look: 'Look at', push: 'Push', close: 'Close', talk: 'Talk to', pull: 'Pull' } as const;
type Mode = 'walk' | keyof typeof verbs;
type Prop = 'computer' | 'papers' | 'board' | 'records' | 'door';
const propNames: Record<Prop, string> = { computer: 'computer', papers: 'research papers', board: 'noticeboard', records: 'record player', door: 'door' };
type Progress = { ticket: boolean; completed: boolean; x: number; y: number };
const storageKey = 'savagely-optimized:mcgill:v1';
const freshProgress = (): Progress => ({ ticket: false, completed: false, x: 57, y: 86 });
function readProgress(): Progress {
  try {
    const p = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (p && typeof p.ticket === 'boolean' && typeof p.completed === 'boolean') {
      return { ticket: p.ticket, completed: p.completed && p.ticket,
        x: Number.isFinite(p.x) ? Math.max(40, Math.min(80, p.x)) : 57,
        y: Number.isFinite(p.y) ? Math.max(72, Math.min(94, p.y)) : 86 };
    }
  } catch { /* Storage is optional; the adventure still works. */ }
  return freshProgress();
}
let progress = readProgress();
let mode: Mode = 'walk';
let activeProp: Prop | null = null;
let selectedTicket = false;
let soundEnabled = false;
let audio: AudioContext | undefined;
let audioGain: GainNode | undefined;
let motionTimer: ReturnType<typeof setTimeout> | undefined;
let lastFocus: HTMLElement | null = null;
let route = '';
const $ = <T extends HTMLElement = HTMLElement>(selector: string) => document.querySelector<T>(selector)!;

const chapters = [
  { title: 'Timney Lab', place: 'UWO', summary: 'A high-school co-op placement, followed by a first programming job while at university. Vision tests and Gabor patches.', note: 'Optional prologue', playable: false },
  { title: 'McGill University, 2006', place: 'McGill / CIM', summary: 'Movie recommendations, Recommendz, an MSc, and a decision to move into industry.', note: 'Chapter 01 · Playable', playable: true },
  { title: 'Making connections.', place: 'Nortel', summary: 'PDH configuration on OME metro equipment. Somewhere, a cable needs a home.', note: 'Chapter 02 · Planned', playable: false },
  { title: 'A blank canvas.', place: 'SMART Technologies', summary: 'SMART Notebook for Mac. A whiteboard with a few ideas of its own.', note: 'Chapter 03 · Planned', playable: false },
  { title: 'Open for business.', place: 'Lightspeed', summary: 'iOS point of sale. Building the software on the other side of the counter.', note: 'Chapter 04 · Planned', playable: false },
  { title: 'A little more agency.', place: 'Shopify', summary: 'Retail point of sale, learning agentic engineering, and figuring out how to direct the next generation of tools.', note: 'Chapter 05 · Planned', playable: false },
];

$('#app').innerHTML = `
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
    <section id="adventure-view" data-view="adventure" aria-labelledby="adventure-heading">
      <h1 class="scene-title" id="adventure-heading">McGill University, 2006</h1>
      <div class="adventure-layout">
        <div class="game-window" tabindex="0" role="group" aria-label="Playable McGill room" aria-keyshortcuts="W L U">
          <div class="stage" id="stage" aria-label="McGill research lab">
            <img class="room-art" src="/art/mcgill-lab.webp" alt="A goofy cartoon university lab with crooked purple walls, a giant green CRT, leaning papers, a record player, and a lopsided door above chunky orange floorboards." width="1536" height="1024" fetchpriority="high" draggable="false" />
            <button class="hotspot computer" data-prop="computer" aria-label="Computer"></button>
            <button class="hotspot papers" data-prop="papers" aria-label="Research papers"></button>
            <button class="hotspot board" data-prop="board" aria-label="Noticeboard"></button>
            <button class="hotspot records" data-prop="records" aria-label="Record player"></button>
            <button class="hotspot door" data-prop="door" aria-label="Door"></button>
            <div class="character" id="character" role="img" aria-label="Cartoon adventurer with swept brown hair, a full brown beard, tortoiseshell glasses, a sage V-neck shirt, and a left-arm Japanese tattoo sleeve"><img class="character-right" src="/art/adventurer-right.webp" alt="" width="1024" height="1536" draggable="false" /><img class="character-left" src="/art/adventurer-left.webp" alt="" width="1024" height="1536" draggable="false" /></div>
            <div class="floor-marker" id="floor-marker" aria-hidden="true"></div>
            <p class="dialogue" id="dialogue-text" role="status" aria-live="polite" aria-atomic="true"></p>
          </div>
          <div class="command-line"><span id="command-text"></span></div>
          <div class="game-controls">
            <div class="verbs" role="group" aria-label="Choose an action">
              ${Object.entries(verbs).map(([key, label]) => `<button data-mode="${key}" aria-pressed="false"${key === 'look' ? ' aria-keyshortcuts="L"' : key === 'use' ? ' aria-keyshortcuts="U"' : ''}>${label}</button>`).join('')}
            </div>
            <div class="inventory" role="group" aria-label="Inventory"><button id="ticket" class="ticket-item" aria-label="Next-chapter ticket" aria-pressed="false" hidden>${icon('ticket')}</button></div>
          </div>
        </div>
      </div>
      <span class="sr-only" id="save-status" role="status"></span>
    </section>
    <section data-view="chapters" class="reading-view" hidden aria-labelledby="map-heading">
      <a href="#adventure" class="back-link">← Back to the lab</a><div class="reading-heading"><h1 id="map-heading">Every job.<br />A different room.</h1><p>A career under one slightly improbable roof. The McGill room is playable; the rest of the building is still taking shape.</p></div>
      <div class="chapter-list">${chapters.map((c, i) => `<article class="chapter-row ${c.playable ? 'is-playable' : ''}"><span class="chapter-number">${i === 0 ? icon('arrow') : String(i).padStart(2, '0')}</span><div><p class="chapter-place">${c.place}</p><h2>${c.title}</h2><p>${c.summary}</p></div><div class="chapter-state">${c.playable ? `<a class="primary-button" href="#adventure">Enter the lab ${icon('arrow')}</a>` : `<span>${c.note}</span>`}</div></article>`).join('')}</div>
      <div class="side-quests"><h2>A few things come along for the ride.</h2><p>More than a decade mentoring high-school CS students. A love of art and music.</p></div>
    </section>
    <section data-view="cv" class="reading-view" hidden aria-labelledby="cv-heading">
      <a href="#adventure" class="back-link">← Back to the adventure</a><div class="reading-heading"><h1 id="cv-heading">The short version.</h1><p>Software, research, retail, and a long-running interest in helping people learn.</p></div>
      <div class="bio-layout"><div class="bio-timeline">
        <article><h2>Shopify</h2><p>Retail point of sale. Learning agentic engineering is a significant part of the work today.</p></article>
        <article><h2>Lightspeed</h2><p>iOS development for point-of-sale software.</p></article>
        <article><h2>SMART Technologies</h2><p>Developing SMART Notebook for Mac, the software for SMART’s interactive whiteboards.</p></article>
        <article><h2>Nortel</h2><p>PDH configuration on OME metro equipment.</p></article>
        <article><h2>McGill / CIM</h2><p>Movie-recommendation research with Greg Dudek, including the Recommendz system and several publications. Earned an MSc, then left the PhD after two years to work in industry.</p></article>
        <article><h2>Timney Lab / UWO</h2><p>A few months as a high-school co-op student, then my first programming job while at university, programming vision tests including Gabor patches.</p><p>Dr. Timney offered me the job when he came into Shoppers Drug Mart for cold medicine. I was working there as a stockboy and cashier supervisor.</p></article>
      </div><aside class="bio-aside"><h2>Outside the job description.</h2><p>Over a decade mentoring students in a high-school computer science class.</p><p class="content-note">This is the first draft. Name, dates, publication links, and contact details are still to come.</p><button class="text-button" id="print-cv">Print this overview ${icon('arrow')}</button></aside></div>
    </section>
  </main>
  <footer class="site-footer"><button id="domain-joke" title="Examine the domain">savagelyoptimized.co ${icon('spark')}</button><button id="reset-progress" title="Restart the McGill chapter">Restart</button></footer>
  <dialog id="computer-dialog" aria-labelledby="terminal-heading">
    <div class="terminal-window"><div class="terminal-top"><span>Recommendz</span><button id="close-terminal" aria-label="Close Recommendz">${icon('close')}</button></div><div class="terminal-body"><h2 id="terminal-heading">One last recommendation.</h2><p class="terminal-intro"><strong>A funny adventure. A little science fiction.</strong></p><fieldset id="genre-options"><legend>Genres</legend>${['Adventure','Comedy','Sci-fi','Horror','Documentary','Romance'].map(g => `<label><input type="checkbox" name="genre" value="${g}" /><span>${g}</span></label>`).join('')}</fieldset><p id="terminal-feedback" role="status"></p><button id="recommend-button" class="terminal-button">Recommend ${icon('arrow')}</button><div id="recommendation" hidden><h3>Back to the Future</h3><p>A little science. A questionable plan.</p><div class="printed-ticket">${icon('ticket')}<div>ONE ADMITTANCE<span>The next chapter</span></div></div><button id="take-ticket" class="terminal-button">Take the ticket ${icon('hand')}</button></div></div></div>
  </dialog>
  <div class="toast" id="toast" role="status" hidden></div>
`;

function saveProgress() {
  try { localStorage.setItem(storageKey, JSON.stringify(progress)); }
  catch { $('#save-status').textContent = 'Browser storage is unavailable. Progress will not be saved.'; }
}
function updateProgress() {
  $('#ticket').hidden = !progress.ticket;
  $('#ticket').setAttribute('aria-pressed', String(selectedTicket));
  $('#character').style.left = `${progress.x}%`;
  $('#character').style.top = `${progress.y}%`;
}
function tell(text: string) {
  $('#dialogue-text').textContent = text;
}
function updateCommand() {
  const action = mode === 'walk' ? 'Walk to' : verbs[mode];
  const prefix = selectedTicket && (mode === 'use' || mode === 'give') ? `${action} ticket ${mode === 'give' ? 'to' : 'with'}` : action;
  $('#command-text').textContent = activeProp ? `${prefix} ${propNames[activeProp]}` : mode === 'walk' ? '' : prefix;
}
function setMode(next: Mode) {
  mode = next;
  if (next !== 'use' && next !== 'give') selectedTicket = false;
  document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
  updateProgress();
  updateCommand();
}
function walkTo(x: number, y: number) {
  const c = $('#character');
  const nextX = Math.max(40, Math.min(80, x));
  const nextY = Math.max(72, Math.min(94, y));
  c.classList.toggle('facing-left', nextX < progress.x);
  const distance = Math.hypot(nextX-progress.x, nextY-progress.y);
  c.style.setProperty('--walk-duration', `${Math.min(1.7, Math.max(.15, distance / 21))}s`);
  c.classList.add('walking');
  clearTimeout(motionTimer);
  motionTimer = setTimeout(() => c.classList.remove('walking'), Math.min(1700, Math.max(150, distance/21*1000)));
  progress.x = nextX;
  progress.y = nextY;
  updateProgress();
  saveProgress();
}
function openComputer() {
  const dialog = $<HTMLDialogElement>('#computer-dialog');
  lastFocus = document.activeElement as HTMLElement;
  $('#recommendation').hidden = !progress.ticket;
  $('#genre-options').hidden = progress.ticket;
  $('#recommend-button').hidden = progress.ticket;
  $('#take-ticket').textContent = progress.ticket ? 'Back to the lab →' : 'Take the ticket →';
  $('#terminal-feedback').textContent = progress.ticket ? 'Ticket printed.' : '';
  dialog.showModal();
  $('#close-terminal').focus();
}
function closeComputer() {
  $<HTMLDialogElement>('#computer-dialog').close();
}
function leaveRoom() {
  if (!progress.ticket) {
    tell('“An unlocked door. A very big decision.”');
    return;
  }
  progress.completed = true;
  selectedTicket = false;
  saveProgress();
  updateProgress();
  tell('');
  location.hash = 'chapters';
}
function interact(prop: Prop) {
  activeProp = prop;
  updateCommand();
  const destinations = { computer: [43,83], papers: [46,81], board: [40,78], records: [79,88], door: [76,75] };
  const [x,y] = destinations[prop];
  walkTo(x,y);
  if (mode === 'walk') { tell(''); return; }
  if ((mode === 'use' || mode === 'give') && selectedTicket) {
    if (prop === 'door') { leaveRoom(); return; }
    tell('“That doesn’t look like a ticket reader.”');
    return;
  }
  if (mode === 'pickup') { tell(prop === 'papers' ? '“I’m travelling light.”' : '“That can stay here.”'); return; }
  if (mode === 'push' || mode === 'pull') { tell(prop === 'papers' ? '“Peer pressure won’t improve them.”' : '“It’s fine where it is.”'); return; }
  if (mode === 'close') { tell(prop === 'door' ? '“I’ve spent long enough in this room.”' : '“It’s already closed.”'); return; }
  if (mode === 'give') { tell('“I came here to give my two cents. They kept the change.”'); return; }
  if (mode === 'talk') {
    if (prop === 'computer') openComputer();
    else tell('“No reply. A familiar peer-review experience.”');
    return;
  }
  if (mode === 'open') {
    if (prop === 'door') leaveRoom();
    else if (prop === 'computer') openComputer();
    else tell('“Nothing to open.”');
    return;
  }
  if (prop === 'computer') {
    if (mode === 'use') { openComputer(); return; }
    tell('“Recommendz. Movie research with Greg Dudek, and a computer that has watched none of these films.”');
  } else if (prop === 'papers') {
    tell('“An MSc earned. Papers published. Two years of a PhD. Quite a stack.”');
  } else if (prop === 'board') {
    tell('“A note from the high-school CS class I mentor. Helping someone figure it out never gets old.”');
  } else if (prop === 'records') {
    if (mode === 'use') void toggleSound();
    tell('“Good code deserves a good soundtrack.”');
  } else if (prop === 'door') {
    if (mode === 'use' && progress.ticket) { leaveRoom(); return; }
    tell('“An unlocked door. A very big decision.”');
  }
}

document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b => b.addEventListener('click', () => { setMode(b.dataset.mode as Mode); }));
document.querySelectorAll<HTMLButtonElement>('[data-prop]').forEach(b => {
  b.addEventListener('click', () => interact(b.dataset.prop as Prop));
  for (const event of ['pointerenter', 'focus']) b.addEventListener(event, () => { activeProp = b.dataset.prop as Prop; updateCommand(); });
  for (const event of ['pointerleave', 'blur']) b.addEventListener(event, () => { activeProp = null; updateCommand(); });
});
$('#stage').addEventListener('click', (event) => {
  if ((event.target as HTMLElement).closest('button')) return;
  const rect = $('#stage').getBoundingClientRect();
  const x = (event.clientX-rect.left)/rect.width*100;
  const y = (event.clientY-rect.top)/rect.height*100;
  if (y < 64) return;
  activeProp = null;
  setMode('walk');
  tell('');
  walkTo(x,y);
  const marker = $('#floor-marker');
  marker.style.left = `${progress.x}%`;
  marker.style.top = `${progress.y}%`;
  marker.classList.remove('visible');
  void marker.offsetWidth;
  marker.classList.add('visible');
});
$('#ticket').addEventListener('click', () => {
  selectedTicket = !selectedTicket;
  if (selectedTicket) setMode(mode === 'give' ? 'give' : 'use');
  else setMode(mode);
  updateProgress();
});
$('#close-terminal').addEventListener('click', closeComputer);
$<HTMLDialogElement>('#computer-dialog').addEventListener('close', () => lastFocus?.focus());
$('#recommend-button').addEventListener('click', () => {
  const chosen = [...document.querySelectorAll<HTMLInputElement>('input[name="genre"]:checked')].map(i => i.value);
  if (chosen.length !== 3 || !['Adventure','Comedy','Sci-fi'].every(g => chosen.includes(g))) {
    $('#terminal-feedback').textContent = chosen.length !== 3 ? 'Choose three genres.' : 'No match.';
    return;
  }
  $('#genre-options').hidden = true;
  $('#recommend-button').hidden = true;
  $('#terminal-feedback').textContent = 'Match found. The future looks promising.';
  $('#recommendation').hidden = false;
  $('#take-ticket').focus();
});
$('#take-ticket').addEventListener('click', () => {
  progress.ticket = true;
  selectedTicket = true;
  saveProgress();
  updateProgress();
  setMode('use');
  closeComputer();
  tell('“One admission. Destination unspecified.”');
});
$('#reset-progress').addEventListener('click', () => {
  if (!window.confirm('Restart the McGill chapter? This only resets your adventure progress in this browser.')) return;
  progress = freshProgress();
  selectedTicket = false;
  activeProp = null;
  document.querySelectorAll<HTMLInputElement>('input[name="genre"]').forEach(i=>{i.checked=false;});
  setMode('walk');
  saveProgress();
  updateProgress();
  tell('');
  location.hash = 'adventure';
});
async function toggleSound() {
  try {
    if (!audio) {
      audio = new AudioContext();
      audioGain = audio.createGain();
      audioGain.gain.value = .0001;
      audioGain.connect(audio.destination);
      const filter = audio.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 600;
      filter.connect(audioGain);
      [130.81,164.81,196,246.94].forEach((frequency,i) => {
        const oscillator = audio!.createOscillator();
        const voice = audio!.createGain();
        oscillator.type = 'triangle';
        oscillator.frequency.value = frequency;
        oscillator.detune.value = i % 2 ? -3 : 3;
        voice.gain.value = .2;
        oscillator.connect(voice);
        voice.connect(filter);
        oscillator.start();
      });
    }
    soundEnabled = !soundEnabled;
    await audio.resume();
    audioGain!.gain.cancelScheduledValues(audio.currentTime);
    audioGain!.gain.setTargetAtTime(soundEnabled ? .07 : .0001, audio.currentTime, .25);
    document.querySelectorAll('[data-sound]').forEach(b => {
      b.innerHTML = `${icon(soundEnabled?'sound':'muted')}<span>Sound ${soundEnabled?'on':'off'}</span>`;
      b.setAttribute('aria-pressed', String(soundEnabled));
      b.setAttribute('aria-label', `Turn ${soundEnabled?'off':'on'} ambient sound`);
    });
  } catch {
    soundEnabled = false;
    showToast('Audio could not start in this browser. The adventure works without it.');
  }
}
document.querySelectorAll('[data-sound]').forEach(b=>b.addEventListener('click',()=>{void toggleSound();}));
document.addEventListener('visibilitychange', () => {
  if (!audio) return;
  if (document.hidden) void audio.suspend();
  else if (soundEnabled) void audio.resume();
});
let toastTimer: ReturnType<typeof setTimeout>;
function showToast(text: string) {
  clearTimeout(toastTimer);
  $('#toast').textContent = text;
  $('#toast').hidden = false;
  toastTimer = setTimeout(()=>{$('#toast').hidden=true;},6000);
}
$('#domain-joke').addEventListener('click',()=>showToast('Originally .com. The M was deemed nonessential.'));
$('#print-cv').addEventListener('click',()=>window.print());
function showRoute() {
  const requested = location.hash.slice(1);
  const next = ['adventure','chapters','cv'].includes(requested) ? requested : 'adventure';
  document.querySelectorAll<HTMLElement>('[data-view]').forEach(v=>{v.hidden=v.dataset.view!==next;});
  document.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach(n=>{
    if(n.dataset.nav===next)n.setAttribute('aria-current','page');
    else n.removeAttribute('aria-current');
  });
  document.title = `Savagely Optimized — ${next==='chapters'?'Chapter map':next==='cv'?'The short version':'McGill University, 2006'}`;
  if(route && route!==next){window.scrollTo({top:0,behavior:'instant'});$('#main').focus({preventScroll:true});}
  route=next;
}
window.addEventListener('hashchange',showRoute);
document.addEventListener('keydown',e=>{
  if ($<HTMLDialogElement>('#computer-dialog').open || route !== 'adventure' || e.altKey || e.ctrlKey || e.metaKey) return;
  if (!(e.target as HTMLElement).closest('.game-window')) return;
  if ((e.target as HTMLElement).closest('input,textarea,select,summary,details')) return;
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) {
    e.preventDefault();
    walkTo(progress.x+(e.key==='ArrowLeft'?-3:e.key==='ArrowRight'?3:0),progress.y+(e.key==='ArrowUp'?-2:e.key==='ArrowDown'?2:0));
  } else if (['w','l','u'].includes(e.key.toLowerCase())) setMode(({w:'walk',l:'look',u:'use'} as const)[e.key.toLowerCase() as 'w'|'l'|'u']);
});
updateProgress();
showRoute();
