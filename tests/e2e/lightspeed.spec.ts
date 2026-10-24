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

test('the Castle-inspired room prints a faulty receipt that can be carried to SMART', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#chapters');
  await page.getByRole('link', { name: 'Enter Lightspeed', exact: true }).click();
  await expect(page).toHaveURL(/#lightspeed$/);
  await expect(page).toHaveTitle('Savagely Optimized — Lightspeed');
  await expect(page.locator('#dialogue-text')).toBeEmpty();
  await expect(page.locator('#command-text')).toBeEmpty();
  await expect(page.locator('.lightspeed-clip')).toBeHidden();
  await capture(page, `${info.project.name}-lightspeed`);
  await touch(page, 'Counter drawer', 'Open');
  await expect(page.locator('#dialogue-text')).toContainText('Jammed');
  await page.getByRole('button', { name: 'Use', exact: true }).click();
  await page.getByRole('button', { name: 'iPad POS', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#faulty-receipt')).toBeVisible();
  await expect(page.locator('.lightspeed-receipt')).toBeVisible();
  await expect(page.locator('#dialogue-text')).toContainText('Two coffees at $3 each. Total: $3.00');
  await touch(page, 'Receipt printer');
  await expect(page.locator('#dialogue-text')).toContainText('2 coffees × $3.00. Total: $3.00');
  await capture(page, `${info.project.name}-lightspeed-receipt`);
  await touch(page, 'iPad POS', 'Use');
  await expect(page.locator('[data-item=faulty-receipt]')).toHaveCount(1);
  await page.getByRole('link', { name: 'Chapter map' }).click();
  await page.getByRole('link', { name: 'Enter SMART', exact: true }).click();
  await itemOn(page, 'Faulty receipt', 'SMART Board');
  await expect(page.locator('.smart-board-example')).toBeVisible();
  await expect(page.locator('.smart-board-equation')).toBeHidden();
  await expect(page.locator('#faulty-receipt')).toBeVisible();
  await page.getByRole('link', { name: 'Chapter map' }).click();
  await page.getByRole('link', { name: 'Enter Lightspeed', exact: true }).click();
  await page.getByRole('group', { name: 'Playable Lightspeed room' }).focus();
  await page.keyboard.press('ArrowRight');
  const position = await page.locator('#character').evaluate(e => [e.style.left, e.style.top]);
  await page.getByRole('link', { name: 'The short version' }).click();
  await page.reload();
  await expect(page.getByRole('link', { name: 'The adventure', exact: true })).toHaveAttribute('href', '#lightspeed');
  await page.locator('[data-view=cv] [data-return-adventure]').click();
  expect(await page.locator('#character').evaluate(e => [e.style.left, e.style.top])).toEqual(position);
  await page.goto('/');
  await expect(page).toHaveURL(/#lightspeed$/);
  await expect(page.locator('#faulty-receipt')).toBeVisible();
  await touch(page, 'Arched passage', 'Open');
  await expect(page).toHaveURL(/#chapters$/);
  await expect(page.getByText('Lightspeed · Ottawa', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Enter Shopify' })).toHaveCount(1);
});

test('a carried pick opens the drawer, and the clip stays collected across travel, reload and reset', async ({ page }, info) => {
  // Keep this deployed v3 fixture to exercise backward compatibility.
  await page.addInitScript(key => {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, JSON.stringify({
      version: 3, currentRoom: 'lightspeed', inventory: ['ticket', 'guitar-pick'], completed: false,
      flags: { strapWorn: false, linkRestored: false }, positions: {},
    }));
  }, key);
  await page.goto('/#lightspeed');
  await itemOn(page, 'Cinema ticket', 'Counter drawer');
  await expect(page.locator('.lightspeed-drawer')).toBeHidden();
  await expect(page.locator('#ticket')).toBeVisible();
  await itemOn(page, 'Guitar pick', 'Counter drawer');
  await expect(page.locator('.lightspeed-drawer')).toBeVisible();
  await expect(page.locator('.lightspeed-clip')).toBeVisible();
  await capture(page, `${info.project.name}-lightspeed-drawer`);
  await touch(page, 'Retaining clip in the drawer', 'Pick up');
  await expect(page.locator('.lightspeed-clip')).toBeHidden();
  await expect(page.locator('#retaining-clip')).toBeVisible();
  await expect(page.locator('#guitar-pick')).toBeVisible();
  await page.reload();
  await expect(page.locator('.lightspeed-drawer')).toBeVisible();
  await expect(page.locator('.lightspeed-clip')).toBeHidden();
  await page.getByRole('link', { name: 'Chapter map' }).click();
  await page.getByRole('link', { name: 'Enter Nortel' }).click();
  await expect(page.locator('#retaining-clip')).toBeVisible();
  await page.getByRole('link', { name: 'Chapter map' }).click();
  await page.getByRole('link', { name: 'Enter Lightspeed', exact: true }).click();
  page.once('dialog', async dialog => { expect(dialog.message()).toContain('every room'); await dialog.accept(); });
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await expect(page.locator('.lightspeed-drawer')).toBeHidden();
  await expect(page.locator('#retaining-clip')).toBeHidden();
  await expect(page.locator('#guitar-pick')).toBeHidden();
  await expect(page.locator('#dialogue-text')).toBeEmpty();
  await page.reload();
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key);
  expect(saved.version).toBe(4);
  expect(saved.currentRoom).toBe('lightspeed');
  expect(saved.inventory).toEqual([]);
  expect(Object.keys(saved.positions)).toHaveLength(5);
});

for (const version of [1, 2]) test(`a deployed v${version} world retains its progress when Lightspeed is added`, async ({ page }) => {
  await page.addInitScript(({ key, version }) => {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, JSON.stringify({
      version, currentRoom: 'nortel', inventory: ['ticket', 'strap'], completed: false,
      flags: { strapWorn: true, linkRestored: true },
      positions: { mcgill: { x: 65, y: 90 }, nortel: { x: 60, y: 85 }, smart: { x: 62, y: 86 } },
    }));
  }, { key, version });
  await page.goto('/#lightspeed');
  await expect(page.locator('#ticket')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Anti-static strap, worn and grounded' })).toBeVisible();
  await page.reload();
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key);
  expect(saved).toMatchObject({ version: 4, currentRoom: 'lightspeed', inventory: ['ticket', 'strap'],
    flags: { strapWorn: true, linkRestored: true },
    positions: { mcgill: { x: 65, y: 90 }, nortel: { x: 60, y: 85 }, smart: { x: 62, y: 86 }, lightspeed: { x: 58, y: 89 } } });
});
