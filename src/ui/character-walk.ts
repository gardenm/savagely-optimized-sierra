/** Animate the approved raster's lower legs; never redraw or scale the head. */
const WIDTH = 512;
const HEIGHT = 768;
const STILL_HEIGHT = 528; // Below both hands/pockets in the 1024 × 1536 originals.
const FRAME_MS = 90;
const ROWS = [528, 560, 592, 624, 656, 688, 704, 736, 768];
const SPLIT = {
  right: [245, 245, 256, 266, 274, 277, 278, 276, 270],
  left: [245, 247, 256, 265, 271, 272, 270, 269, 266],
};
// Contact, planted return, passing, lifted return; opposite feet alternate.
const STRIDE = [-17, -9, 0, 9, 17, 9, 0, -9];
const LIFT = [0, 0, 0, 0, 0, 4, 10, 6];
type Facing = keyof typeof SPLIT;
type Vertex = Readonly<{ x: number; y: number }>;

function triangle(ctx: CanvasRenderingContext2D, source: HTMLCanvasElement,
  original: readonly [Vertex, Vertex, Vertex], moved: readonly [Vertex, Vertex, Vertex]) {
  const [p, q, r] = original;
  const [u, v, w] = moved;
  const sx = q.x - p.x, sy = q.y - p.y, tx = r.x - p.x, ty = r.y - p.y;
  const dx = v.x - u.x, dy = v.y - u.y, ex = w.x - u.x, ey = w.y - u.y;
  const det = sx * ty - tx * sy;
  const a = (dx * ty - ex * sy) / det, c = (ex * sx - dx * tx) / det;
  const b = (dy * ty - ey * sy) / det, d = (ey * sx - dy * tx) / det;
  const centre = { x: (u.x + v.x + w.x) / 3, y: (u.y + v.y + w.y) / 3 };
  ctx.save();
  ctx.beginPath();
  moved.forEach((point, index) => {
    // A subpixel overlap prevents antialiased cracks between adjacent triangles.
    const length = Math.hypot(point.x - centre.x, point.y - centre.y);
    const x = point.x + (point.x - centre.x) / length * .25;
    const y = point.y + (point.y - centre.y) / length * .25;
    if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.clip();
  ctx.setTransform(a, b, c, d, u.x - a * p.x - c * p.y, u.y - b * p.x - d * p.y);
  ctx.drawImage(source, 0, 0);
  ctx.restore();
}

function framesFor(image: HTMLImageElement, facing: Facing): HTMLCanvasElement[] | null {
  const source = document.createElement('canvas');
  source.width = WIDTH;
  source.height = HEIGHT;
  const sourceContext = source.getContext('2d');
  if (!sourceContext) return null;
  sourceContext.drawImage(image, 0, 0, WIDTH, HEIGHT);
  const pixels = sourceContext.getImageData(0, 0, WIDTH, HEIGHT).data;
  if (!pixels.some((value, index) => index % 4 === 3 && value > 0)) return null;
  return STRIDE.map((_, frame) => {
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingQuality = 'high';
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, STILL_HEIGHT, WIDTH, HEIGHT - STILL_HEIGHT);
    ctx.clip();
    for (const leg of [0, 1]) {
      const phase = (frame + leg * 4) % STRIDE.length;
      const shift = STRIDE[phase] * (facing === 'left' ? -1 : 1);
      const lift = LIFT[phase];
      const original: Vertex[][] = [], moved: Vertex[][] = [];
      ROWS.forEach((y, row) => {
        // Feet translate rigidly; the trousers bend gently between fixed hips and ankles.
        const t = Math.min(1, (y - STILL_HEIGHT) / (688 - STILL_HEIGHT));
        const weight = t * t * (3 - 2 * t);
        const xs = leg === 0 ? [112, SPLIT[facing][row]] : [SPLIT[facing][row], 400];
        original.push(xs.map(x => ({ x, y })));
        moved.push(xs.map(x => ({ x: x + shift * weight, y: y - lift * weight })));
      });
      for (let row = 0; row < ROWS.length - 1; row++) {
        const [a, b] = original[row], [c, d] = original[row + 1];
        const [u, v] = moved[row], [w, x] = moved[row + 1];
        triangle(ctx, source, [a, b, c], [u, v, w]);
        triangle(ctx, source, [b, d, c], [v, x, w]);
      }
    }
    ctx.restore();
    // Identical pixels in every frame above the pockets: no head/hand/torso drift.
    ctx.drawImage(source, 0, 0, WIDTH, STILL_HEIGHT, 0, 0, WIDTH, STILL_HEIGHT);
    return canvas;
  });
}

export function createCharacterWalk(character: HTMLElement, signal: AbortSignal) {
  const images = {
    left: character.querySelector<HTMLImageElement>('.character-left')!,
    right: character.querySelector<HTMLImageElement>('.character-right')!,
  };
  const canvas = document.createElement('canvas');
  canvas.className = 'character-walk';
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  canvas.setAttribute('aria-hidden', 'true');
  character.append(canvas);
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const cache = new Map<Facing, HTMLCanvasElement[]>();
  const decoded = new Set<Facing>();
  let facing: Facing = 'right';
  let active = false;
  let started = 0;
  let lastFrame = -1;
  let pending = 0;

  function hide() {
    cancelAnimationFrame(pending);
    pending = 0;
    character.classList.remove('has-walk-frames');
  }
  function paint(now: number) {
    if (!active || signal.aborted || reduced.matches || document.hidden || !ctx) { hide(); return; }
    const image = images[facing];
    if (decoded.has(facing)) {
      if (!cache.has(facing)) {
        const frames = framesFor(image, facing);
        if (!frames) { hide(); return; } // Leave the real sprite visible if canvas preparation fails.
        cache.set(facing, frames);
      }
      // A queued animation timestamp may predate the input event that started this walk.
      const frame = Math.floor(Math.max(0, now - started) / FRAME_MS) % STRIDE.length;
      if (frame !== lastFrame) {
        // Replace the frame in one draw; never expose a clear, empty canvas.
        ctx.globalCompositeOperation = 'copy';
        ctx.drawImage(cache.get(facing)![frame], 0, 0);
        canvas.dataset.frame = String(frame);
        lastFrame = frame;
      }
      character.classList.add('has-walk-frames');
    }
    pending = requestAnimationFrame(paint);
  }
  function resume() {
    hide();
    lastFrame = -1;
    if (active && !reduced.matches && !document.hidden) paint(performance.now());
  }
  reduced.addEventListener('change', resume, { signal });
  document.addEventListener('visibilitychange', resume, { signal });
  signal.addEventListener('abort', () => { active = false; hide(); cache.clear(); }, { once: true });
  for (const direction of ['left', 'right'] as const) {
    void images[direction].decode().then(() => {
      if (signal.aborted) return;
      decoded.add(direction);
      character.classList.add(`${direction}-sprite-ready`);
      if (active && facing === direction) resume();
    }).catch(() => { /* A failed image must not hide the available idle sprite. */ });
  }
  return {
    start(left: boolean) {
      const next = left ? 'left' : 'right';
      if (!active) started = performance.now();
      if (facing !== next) lastFrame = -1;
      facing = next;
      active = true;
      cancelAnimationFrame(pending);
      paint(performance.now());
    },
    stop() { active = false; hide(); },
  };
}
