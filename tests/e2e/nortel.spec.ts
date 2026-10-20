import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

async function touch(page: import('@playwright/test').Page, prop: string, verb = 'Use') {
  await page.getByRole('button', { name: verb, exact: true }).click();
  await page.getByRole('button', { name: prop, exact: true }).click();
}

test('Nortel needs only a grounded strap and one loose cable, and remembers progress', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#nortel');
  await expect(page.getByRole('heading', { name: 'Nortel', exact: true })).toBeVisible();
  await expect(page.locator('#dialogue-text')).toBeEmpty();
  await expect(page.locator('#command-text')).toBeEmpty();
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); });
  await expect(page.locator('.nortel-strap')).toBeVisible();
  await expect(page.locator('.nortel-cable')).toBeVisible();
  await mkdir('.impeccable/review', { recursive: true });
  await page.screenshot({ path: `.impeccable/review/${testInfo.project.name}-nortel.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await touch(page, 'Door', 'Open');
  await expect(page).toHaveURL(/#nortel$/);
  await expect(page.locator('#dialogue-text')).toContainText('alarm');
  await touch(page, 'OME A', 'Look at');
  await expect(page.locator('#stage')).not.toHaveClass(/is-tripped/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await touch(page, 'Anti-static strap', 'Pick up');
  await expect(page.locator('.nortel-strap')).toBeHidden();
  await page.getByRole('button', { name: 'Use', exact: true }).click();
  await page.getByRole('button', { name: 'Anti-static strap in inventory', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Anti-static strap, worn and grounded' })).toBeVisible();
  await expect(page.locator('.worn-marker')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Anti-static strap, worn and grounded' })).toBeVisible();
  await touch(page, 'Loose cable');
  await expect(page.locator('.nortel-cable')).toBeHidden();
  await expect(page.locator('.nortel-link-lamp')).toHaveClass(/is-connected/);
  await page.screenshot({ path: `.impeccable/review/${testInfo.project.name}-nortel-connected.png`, fullPage: true });
  await touch(page, 'Door', 'Open');
  await expect(page).toHaveURL(/#chapters$/);
  await page.getByRole('link', { name: 'Enter Nortel' }).click();
  await expect(page.locator('#room-host')).not.toHaveAttribute('aria-busy', 'true');
  await page.reload();
  await expect(page.locator('.nortel-link-lamp')).toHaveClass(/is-connected/);
  await expect(page.getByRole('button', { name: 'Connected cable', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('a static shock jolts the character and the equipment recovers automatically', async ({ page }, testInfo) => {
  await page.goto('/#nortel');
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); });
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await touch(page, 'Loose cable');
  await expect(page.locator('#stage')).toHaveClass(/is-tripped/);
  await expect(page.locator('#character')).toHaveClass(/is-shocked/);
  await expect(page.locator('.static-spark')).toBeVisible();
  await expect(page.locator('#character .character-left')).toHaveCSS('animation-name', 'static-jolt');
  await page.screenshot({ path: `.impeccable/review/${testInfo.project.name}-nortel-shock.png`, fullPage: true });
  await page.clock.runFor(700);
  await expect(page.locator('.static-spark')).toBeHidden();
  await expect(page.locator('#character')).not.toHaveClass(/is-shocked/);
  await expect(page.locator('#stage')).toHaveClass(/is-tripped/);
  await page.clock.runFor(1200);
  await expect(page.locator('#stage')).not.toHaveClass(/is-tripped/);
  await expect(page.locator('#dialogue-text')).toContainText('Nothing permanently fried');
  await touch(page, 'Anti-static strap');
  await touch(page, 'Loose cable');
  await expect(page.locator('.nortel-link-lamp')).toHaveClass(/is-connected/);
});

test('manual reset, reduced motion, reload and restart all recover safely from a shock', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#nortel');
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await touch(page, 'OME A');
  await expect(page.locator('.static-spark')).toBeVisible();
  await expect(page.locator('#character .character-left')).toHaveCSS('animation-name', 'none');
  await touch(page, 'Lab console');
  await expect(page.locator('#stage')).not.toHaveClass(/is-tripped/);
  await expect(page.locator('#dialogue-text')).toContainText('Reset.');
  await page.clock.runFor(2000);
  await expect(page.locator('#dialogue-text')).toContainText('Reset.');
  await touch(page, 'Loose cable');
  await page.reload();
  await expect(page.locator('#stage')).not.toHaveClass(/is-tripped/);
  await touch(page, 'OME B');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await page.clock.runFor(2000);
  await expect(page.locator('#stage')).not.toHaveClass(/is-tripped/);
  await expect(page.locator('#dialogue-text')).toBeEmpty();
});

test('legacy saves migrate, reading pages resume the room, and restart affects only that chapter', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('savagely-optimized:mcgill:v1', JSON.stringify({ ticket: true, completed: true, x: 65, y: 90 }));
    localStorage.setItem('savagely-optimized:nortel:v1', JSON.stringify({ version: 1, linkRestored: true, configured: true, completed: true, x: 60, y: 85 }));
  });
  await page.goto('/#nortel');
  await expect(page.locator('.nortel-link-lamp')).toHaveClass(/is-connected/);
  await expect(page.getByRole('button', { name: 'Anti-static strap, worn and grounded' })).toBeVisible();
  await page.getByRole('link', { name: 'The short version' }).click();
  await expect(page.getByRole('link', { name: 'The adventure', exact: true })).toHaveAttribute('href', /#nortel$/);
  await page.getByRole('link', { name: 'The adventure', exact: true }).click();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await expect(page).toHaveURL(/#nortel$/);
  await expect(page.locator('#dialogue-text')).toBeEmpty();
  await expect(page.locator('.nortel-link-lamp')).not.toHaveClass(/is-connected/);
  await expect(page.locator('.nortel-strap')).toBeVisible();
  const mcgill = await page.evaluate(() => JSON.parse(localStorage.getItem('savagely-optimized:mcgill:v1')!));
  expect(mcgill).toMatchObject({ ticket: true, completed: true });
  await page.getByRole('link', { name: 'Chapter map' }).click();
  await page.getByRole('link', { name: 'Enter the lab' }).click();
  await expect(page.locator('#ticket')).toBeVisible();
  await page.getByRole('link', { name: 'Chapter map' }).click();
  await page.getByRole('link', { name: 'Enter Nortel' }).click();
  await page.getByRole('group', { name: 'Playable Nortel room' }).focus();
  const before = await page.locator('#character').evaluate(element => parseFloat(element.style.left));
  await page.keyboard.press('ArrowRight');
  expect(await page.locator('#character').evaluate(element => parseFloat(element.style.left))).toBe(before + 3);
  await expect(page.locator('[data-mode]')).toHaveCount(9);
});

test('navigating away during the McGill exit cancels its delayed scene change', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('savagely-optimized:mcgill:v1', JSON.stringify({ ticket: true, completed: true, x: 57, y: 86 }));
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open', exact: true }).click();
  await page.getByRole('button', { name: 'Door', exact: true }).click();
  await page.getByRole('link', { name: 'The short version' }).click();
  await expect(page.locator('#room-host')).not.toHaveAttribute('aria-busy', 'true');
  await expect(page).toHaveURL(/#cv$/);
  await expect(page.getByRole('heading', { name: 'Matt Garden' })).toBeVisible();
});
