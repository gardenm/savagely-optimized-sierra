import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

test('walking keeps the original upper body fixed and never presents an empty frame', async ({ page }, info) => {
  await page.goto('/#shopify');
  await page.evaluate(async () => { await Promise.all([...document.images].map(image => image.decode())); });
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 60_000));
  const stage = page.locator('#stage');
  const box = (await stage.boundingBox())!;
  await stage.click({ position: { x: box.width * .89, y: box.height * .93 } });
  await expect(page.locator('#character')).toHaveClass(/walking/);
  const lowerHashes: number[] = [];
  const captures: string[] = [];
  for (let frame = 0; frame < 8; frame++) {
    await page.clock.runFor(90);
    const pixels = await page.locator('#character').evaluate(element => {
      const canvas = element.querySelector('canvas')!;
      const context = canvas.getContext('2d')!;
      const actual = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const original = document.createElement('canvas');
      original.width = canvas.width;
      original.height = canvas.height;
      const source = original.getContext('2d')!;
      source.drawImage(element.querySelector<HTMLImageElement>('.character-right')!, 0, 0, canvas.width, canvas.height);
      const expected = source.getImageData(0, 0, canvas.width, 528).data;
      let different = 0, opaque = 0, hash = 0;
      for (let i = 0; i < actual.length; i++) {
        if (i < expected.length && actual[i] !== expected[i]) different++;
        if (i % 4 === 3 && actual[i] > 0) opaque++;
        if (i >= expected.length) hash = (Math.imul(hash, 31) + actual[i]) | 0;
      }
      return { different, opaque, hash, image: canvas.toDataURL('image/png'), transform: getComputedStyle(canvas).transform };
    });
    expect(pixels.opaque).toBeGreaterThan(50_000);
    expect(pixels.different).toBe(0);
    expect(pixels.transform).toBe('none');
    lowerHashes.push(pixels.hash);
    captures.push(pixels.image);
  }
  expect(new Set(lowerHashes).size).toBeGreaterThan(4);
  await mkdir('.impeccable/review', { recursive: true });
  for (const [index, capture] of captures.entries()) {
    await writeFile(`.impeccable/review/${info.project.name}-walk-${index}.png`, Buffer.from(capture.split(',')[1], 'base64'));
  }
  await page.clock.runFor(1800);
  await expect(page.locator('#character')).not.toHaveClass(/walking|has-walk-frames/);
  await expect(page.locator('.character-right')).toBeVisible();
  // Start again and reverse direction immediately; no old stop callback may hide the new walk.
  await stage.click({ position: { x: box.width * .4, y: box.height * .88 } });
  await page.clock.runFor(100);
  await expect(page.locator('#character')).toHaveClass(/facing-left.*walking|walking.*facing-left/);
  await expect(page.locator('.character-walk')).toBeVisible();
  await stage.click({ position: { x: box.width * .84, y: box.height * .89 } });
  await page.clock.runFor(100);
  await expect(page.locator('#character')).not.toHaveClass(/facing-left/);
  await expect(page.locator('.character-walk')).toBeVisible();
  await page.getByRole('link', { name: 'Chapter map', exact: true }).click();
  await page.getByRole('link', { name: 'Enter Lightspeed', exact: true }).click();
  await expect(page.locator('#character')).not.toHaveClass(/walking|has-walk-frames/);
});

test('a first step with a delayed directional sprite keeps a visible idle character', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/art/adventurer-left.webp', async route => { await gate; await route.continue(); });
  await page.goto('/#shopify', { waitUntil: 'domcontentloaded' });
  await page.locator('.character-right').evaluate(async (image: HTMLImageElement) => image.decode());
  const stage = page.locator('#stage'), box = (await stage.boundingBox())!;
  try {
    // Turn towards the not-yet-loaded sprite on the very first click.
    await stage.click({ position: { x: box.width * .4, y: box.height * .88 } });
    await expect(page.locator('#character')).toHaveClass(/walking/);
    await expect(page.locator('.character-right')).toBeVisible();
    await expect(page.locator('.character-walk')).toBeHidden();
  } finally { release(); }
  await page.locator('.character-left').evaluate(async (image: HTMLImageElement) => image.decode());
  await stage.click({ position: { x: box.width * .4, y: box.height * .93 } });
  await expect(page.locator('.character-walk')).toBeVisible();
  await expect(page.locator('#character')).toHaveClass(/facing-left/);
});

test('reduced motion and a stationary target keep the original idle sprite', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#shopify');
  const stage = page.locator('#stage'), box = (await stage.boundingBox())!;
  await stage.click({ position: { x: box.width * .8, y: box.height * .9 } });
  await expect(page.locator('.character-walk')).toBeHidden();
  await expect(page.locator('.character-right')).toBeVisible();
  await expect(page.locator('#character')).toHaveCSS('transition-duration', '0s');
  await stage.click({ position: { x: box.width * .8, y: box.height * .9 } });
  await expect(page.locator('#character')).not.toHaveClass(/walking/);
});
