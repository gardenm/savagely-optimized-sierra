import { test, expect, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

async function walkTo(page: Page, x: number, y: number) {
  // Drive the same floor pointer event on desktop and touch layouts.
  const stage = page.locator('#stage');
  const box = (await stage.boundingBox())!;
  await stage.click({ position: { x: box.width * x / 100, y: box.height * y / 100 } });
}

for (const chapter of ['adventure', 'nortel']) {
  test(`${chapter}: a drawn gait moves in both directions and settles back to idle`, async ({ page }, info) => {
    await page.goto(`/#${chapter}`);
    await page.evaluate(() => document.fonts.ready);
    const character = page.locator('#character');
    const cycle = page.locator('.character-walk');
    await expect(character).toHaveClass(/walk-ready/);
    await page.addStyleTag({ content: '.character { transition: none !important; }' });
    await page.clock.install();
    await page.clock.pauseAt(new Date());
    await walkTo(page, 83, 91);
    await expect(cycle).toBeVisible();
    await expect(page.locator('.character-right')).toBeHidden();
    await expect(character).not.toHaveClass(/facing-left/);
    // Freeze the drawn poses; distinct pixels prove frames change, without body jiggling.
    await cycle.evaluate(element => { const animation = element.getAnimations()[0]; animation.pause(); animation.currentTime = 0; });
    const clip = (await cycle.boundingBox())!;
    const first = await page.screenshot({ clip, animations: 'allow' });
    await cycle.evaluate(element => { element.getAnimations()[0].currentTime = 200; });
    const passing = await page.screenshot({ clip, animations: 'allow' });
    expect(passing.equals(first)).toBe(false);
    await mkdir('.impeccable/review', { recursive: true });
    await page.screenshot({ path: `.impeccable/review/${info.project.name}-${chapter}-walk-right.png`, fullPage: true, animations: 'allow' });
    await page.clock.runFor(2000);
    await expect(character).not.toHaveClass(/walking/);
    await expect(cycle).toBeHidden();
    await expect(page.locator('.character-right')).toBeVisible();
    await walkTo(page, 40, 89);
    await expect(cycle).toBeVisible();
    await expect(character).toHaveClass(/facing-left/);
    await expect(cycle).toHaveCSS('background-image', /adventurer-walk-left\.webp/);
    expect(await cycle.evaluate(element => getComputedStyle(element).scale)).not.toBe('-1 1');
    await cycle.evaluate(element => { const animation = element.getAnimations()[0]; animation.pause(); animation.currentTime = 400; });
    await page.screenshot({ path: `.impeccable/review/${info.project.name}-${chapter}-walk-left.png`, fullPage: true, animations: 'allow' });
    await page.clock.runFor(2000);
    await expect(character).not.toHaveClass(/walking/);
    await expect(page.locator('.character-left')).toBeVisible();
    await expect(cycle).toBeHidden();
  });
}

test('retargeting, vertical keyboard steps, restart and reduced motion keep a consistent character state', async ({ page }) => {
  await page.goto('/#nortel');
  const character = page.locator('#character');
  const cycle = page.locator('.character-walk');
  await expect(character).toHaveClass(/walk-ready/);
  await walkTo(page, 40, 90);
  await expect(cycle).toBeVisible();
  await walkTo(page, 84, 90);
  await expect(cycle).toBeVisible();
  await expect(character).not.toHaveClass(/facing-left/);
  await page.getByRole('group', { name: 'Playable Nortel room' }).focus();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowUp');
  await expect(character).toHaveClass(/facing-left/);
  await expect(character).not.toHaveClass(/walking/);
  page.once('dialog', dialog => dialog.accept());
  await walkTo(page, 84, 90);
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await expect(character).not.toHaveClass(/walking/);
  await expect(cycle).toBeHidden();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await walkTo(page, 42, 89);
  await expect(cycle).toBeHidden();
  await expect(page.locator('.character-left')).toBeVisible();
  await expect(character).toHaveCSS('transition-duration', '0s');
});

test('missing walk artwork keeps the original character visible and the room playable', async ({ page }) => {
  await page.route('**/art/adventurer-walk-*.webp', route => route.abort());
  await page.goto('/#nortel');
  await walkTo(page, 40, 90);
  await expect(page.locator('.character-left')).toBeVisible();
  await expect(page.locator('.character-walk')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Use', exact: true })).toBeVisible();
});
