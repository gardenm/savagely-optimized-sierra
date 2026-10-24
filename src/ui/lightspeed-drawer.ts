type Point = readonly [number, number];
type Quad = readonly [Point, Point, Point, Point];

/** Reproject the existing drawer's three surfaces into the cabinet's perspective. */
export function paintLightspeedDrawer(canvas: HTMLCanvasElement, image: HTMLImageElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // The original closed front must disappear into a dark opening, not sit behind an open tray.
  ctx.beginPath();
  ctx.moveTo(156, 642); ctx.lineTo(540, 584); ctx.lineTo(538, 722); ctx.lineTo(155, 789);
  ctx.closePath();
  ctx.fillStyle = '#102e36';
  ctx.fill();
  ctx.strokeStyle = '#192c34';
  ctx.lineWidth = 7;
  ctx.stroke();
  // Recessed lip and underside shadow follow the same upward-right cabinet edges.
  ctx.beginPath();
  ctx.moveTo(99, 838); ctx.lineTo(480, 779); ctx.lineTo(514, 800); ctx.lineTo(115, 864);
  ctx.closePath();
  ctx.fillStyle = '#182c3440';
  ctx.fill();

  const front: Quad = [[50, 283], [1480, 462], [1455, 858], [55, 593]];
  const top: Quad = [[892, 71], [1728, 140], [1400, 444], [285, 313]];
  const side: Quad = [[1728, 140], [1735, 340], front[2], front[1]];
  const placedFront: Quad = [[98, 720], [480, 662], [480, 790], [98, 850]];
  const placedTop: Quad = [[158, 642], [540, 584], [468, 664], [112, 717]];
  const placedSide: Quad = [placedTop[1], [538, 722], placedFront[2], placedFront[1]];

  const sample = (quad: Quad, u: number, v: number): Point => [
    quad[0][0] * (1 - u) * (1 - v) + quad[1][0] * u * (1 - v) + quad[2][0] * u * v + quad[3][0] * (1 - u) * v,
    quad[0][1] * (1 - u) * (1 - v) + quad[1][1] * u * (1 - v) + quad[2][1] * u * v + quad[3][1] * (1 - u) * v,
  ];
  function projection(source: Quad, target: Quad) {
    const rows: number[][] = [];
    source.forEach(([x, y], index) => {
      const [u, v] = target[index];
      rows.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u], [0, 0, 0, x, y, 1, -v * x, -v * y, v]);
    });
    for (let col = 0; col < 8; col++) {
      let pivot = col;
      for (let row = col + 1; row < 8; row++) if (Math.abs(rows[row][col]) > Math.abs(rows[pivot][col])) pivot = row;
      [rows[col], rows[pivot]] = [rows[pivot], rows[col]];
      const divisor = rows[col][col];
      for (let j = col; j < 9; j++) rows[col][j] /= divisor;
      for (let row = 0; row < 8; row++) if (row !== col) {
        const factor = rows[row][col];
        for (let j = col; j < 9; j++) rows[row][j] -= factor * rows[col][j];
      }
    }
    const h = rows.map(row => row[8]);
    return ([x, y]: Point): Point => {
      const denominator = h[6] * x + h[7] * y + 1;
      return [(h[0] * x + h[1] * y + h[2]) / denominator, (h[3] * x + h[4] * y + h[5]) / denominator];
    };
  }
  function triangle(source: readonly [Point, Point, Point], target: readonly [Point, Point, Point]) {
    const [p, q, r] = source, [s, t, u] = target;
    const x1 = q[0] - p[0], y1 = q[1] - p[1], x2 = r[0] - p[0], y2 = r[1] - p[1];
    const dx1 = t[0] - s[0], dy1 = t[1] - s[1], dx2 = u[0] - s[0], dy2 = u[1] - s[1];
    const det = x1 * y2 - x2 * y1;
    const a = (dx1 * y2 - dx2 * y1) / det, c = (dx2 * x1 - dx1 * x2) / det;
    const b = (dy1 * y2 - dy2 * y1) / det, d = (dy2 * x1 - dy1 * x2) / det;
    const centre: Point = [(s[0] + t[0] + u[0]) / 3, (s[1] + t[1] + u[1]) / 3];
    ctx!.save();
    ctx!.beginPath();
    target.forEach(([x, y], index) => {
      const distance = Math.hypot(x - centre[0], y - centre[1]);
      const px = x + (x - centre[0]) / distance * .4;
      const py = y + (y - centre[1]) / distance * .4;
      if (index === 0) ctx!.moveTo(px, py); else ctx!.lineTo(px, py);
    });
    ctx!.closePath();
    ctx!.clip();
    ctx!.setTransform(a, b, c, d, s[0] - a * p[0] - c * p[1], s[1] - b * p[0] - d * p[1]);
    ctx!.drawImage(image, 0, 0);
    ctx!.restore();
  }
  for (const [source, target] of [[top, placedTop], [side, placedSide], [front, placedFront]] as const) {
    const project = projection(source, target);
    const steps = 8;
    for (let row = 0; row < steps; row++) for (let col = 0; col < steps; col++) {
      const uv = [[col, row], [col + 1, row], [col + 1, row + 1], [col, row + 1]];
      const s = uv.map(([u, v]) => sample(source, u / steps, v / steps));
      const t = s.map(project);
      triangle([s[0], s[1], s[2]], [t[0], t[1], t[2]]);
      triangle([s[0], s[2], s[3]], [t[0], t[2], t[3]]);
    }
  }
}
