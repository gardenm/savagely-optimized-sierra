import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const key = 'savagely-optimized:adventure:v1';
async function touch(page: Page, target: string, verb = 'Look at') {
  await page.getByRole('button', { name: verb, exact: true }).click();
  await page.getByRole('button', { name: target, exact: true }).click();
}
async function itemOn(page: Page, item: string, target: string) {
  await page.getByRole('button', { name: 'Pick up', exact: true }).click();
  await page.getByRole('button', { name: item, exact: true }).click();
  await page.getByRole('button', { name: target, exact: true }).click();
}
async function capture(page: Page, name: string) {
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); });
  await mkdir('.impeccable/review', { recursive: true });
  await page.screenshot({ path: `.impeccable/review/${name}.png`, fullPage: true, animations: 'disabled' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test('SMART is an explorable period office, with silent entry, free exit and remembered return links', async ({ page }, info) => {
  await page.goto('/#chapters');
  await page.getByRole('link', { name: 'Enter SMART', exact: true }).click();
  await expect(page).toHaveURL(/#smart$/);
  await expect(page).toHaveTitle('Savagely Optimized — SMART Technologies');
  await expect(page.getByRole('heading', { name: 'SMART Technologies', exact: true })).toBeVisible();
  await expect(page.locator('#dialogue-text')).toBeEmpty();
  await expect(page.locator('#command-text')).toBeEmpty();
  await expect(page.locator('.smart-stylus')).toBeVisible();
  await expect(page.locator('[data-prop=stylus]')).toHaveAccessibleName('Stylus on the ledge');
  await capture(page, `${info.project.name}-smart`);
  await touch(page, 'iMac');
  await expect(page.locator('#dialogue-text')).toContainText('SMART Notebook for Mac');
  await touch(page, 'PC workstation');
  await expect(page.locator('#dialogue-text')).toContainText('PC side');
  await touch(page, 'SMART Board');
  await expect(page.locator('#dialogue-text')).toContainText('SMART Notebook');
  await touch(page, 'Stylus on the ledge', 'Pick up');
  await expect(page.locator('#dialogue-text')).toContainText('Can’t reach');
  await expect(page.locator('#stylus')).toBeHidden();
  await page.getByRole('group', { name: 'Playable SMART room' }).focus();
  await page.keyboard.press('ArrowRight');
  const position = await page.locator('#character').evaluate(element => [element.style.left, element.style.top]);
  await page.getByRole('link', { name: 'The short version' }).click();
  await page.reload();
  await expect(page.getByRole('link', { name: 'The adventure', exact: true })).toHaveAttribute('href', '#smart');
  await page.locator('[data-view=cv] [data-return-adventure]').click();
  await expect(page).toHaveURL(/#smart$/);
  expect(await page.locator('#character').evaluate(element => [element.style.left, element.style.top])).toEqual(position);
  await page.goto('/');
  await expect(page).toHaveURL(/#smart$/);
  await touch(page, 'Door', 'Open');
  await expect(page).toHaveURL(/#chapters$/);
  await expect(page.getByRole('link', { name: 'Enter SMART', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Enter Lightspeed' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Enter Shopify' })).toHaveCount(0);
});

test('the SMART scene reflects its cross-room rules, retains progress and resets the entire adventure', async ({ page }, info) => {
  // Supply future-source items only as test fixtures; the public scene adds no substitute sources.
  await page.addInitScript(key => {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, JSON.stringify({
      version: 2, currentRoom: 'smart', inventory: ['paper-plane', 'faulty-receipt'], completed: false,
      flags: { strapWorn: false, linkRestored: false }, positions: {},
    }));
  }, key);
  await page.goto('/#smart');
  await itemOn(page, 'Paper plane', 'High ledge');
  await expect(page.getByRole('button', { name: 'Stylus on the floor', exact: true })).toBeVisible();
  await expect(page.locator('#paper-plane')).toBeHidden();
  expect(await page.locator('.smart-stylus').evaluate(element => getComputedStyle(element).transitionDuration)).toContain('0.5s');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('.smart-stylus').evaluate(element => getComputedStyle(element).transitionDuration)).toBe('0s');
  await capture(page, `${info.project.name}-smart-stylus-down`);
  await touch(page, 'Stylus on the floor', 'Pick up');
  await expect(page.locator('.smart-stylus')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Whiteboard stylus', exact: true })).toBeVisible();
  await itemOn(page, 'Whiteboard stylus', 'SMART Board');
  await expect(page.locator('#checkout-plan')).toBeHidden();
  await itemOn(page, 'Faulty receipt', 'SMART Board');
  await expect(page.locator('.smart-board-content')).toBeVisible();
  await itemOn(page, 'Whiteboard stylus', 'SMART Board');
  await expect(page.getByRole('button', { name: 'Checkout sketch', exact: true })).toBeVisible();
  await expect(page.locator('.smart-board-equation')).toHaveText('2 × $3 → $6');
  await page.reload();
  await expect(page.locator('.smart-board-equation')).toBeVisible();
  await expect(page.locator('.smart-stylus')).toBeHidden();
  await capture(page, `${info.project.name}-smart-sketch`);
  await page.getByRole('link', { name: 'Chapter map' }).click();
  await page.getByRole('link', { name: 'Enter the lab' }).click();
  await expect(page.locator('#checkout-plan')).toBeVisible();
  await expect(page.locator('#faulty-receipt')).toBeVisible();
  await page.getByRole('link', { name: 'Chapter map' }).click();
  await page.getByRole('link', { name: 'Enter SMART', exact: true }).click();
  page.once('dialog', async dialog => { expect(dialog.message()).toContain('every room'); await dialog.accept(); });
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await expect(page).toHaveURL(/#smart$/);
  await expect(page.locator('.smart-board-content')).toBeHidden();
  await expect(page.locator('.smart-stylus')).toBeVisible();
  await expect(page.locator('#stylus')).toBeHidden();
  await expect(page.locator('#dialogue-text')).toBeEmpty();
  await page.reload();
  await expect(page.locator('[data-prop=stylus]')).toHaveAccessibleName('Stylus on the ledge');
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key);
  expect(saved.inventory).toEqual([]);
  expect(saved.positions.smart).toEqual({ x: 57, y: 88 });
});

test('a deployed two-room save retains inventory, milestones and positions when SMART is added', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(key => {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, JSON.stringify({
      version: 1, currentRoom: 'nortel', inventory: ['ticket', 'strap'], completed: false,
      flags: { strapWorn: true, linkRestored: true }, positions: { mcgill: { x: 65, y: 90 }, nortel: { x: 60, y: 85 } },
    }));
  }, key);
  await page.goto('/#smart');
  await expect(page.locator('#ticket')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Anti-static strap, worn and grounded' })).toBeVisible();
  await page.reload();
  await expect(page.locator('#ticket')).toBeVisible();
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key);
  expect(saved).toMatchObject({ version: 2, currentRoom: 'smart', flags: { strapWorn: true, linkRestored: true },
    positions: { mcgill: { x: 65, y: 90 }, nortel: { x: 60, y: 85 }, smart: { x: 57, y: 88 } } });
});
