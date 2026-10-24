import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const key = 'savagely-optimized:adventure:v1';
async function visit(page: Page, name: 'Enter Nortel' | 'Enter the lab') {
  await page.getByRole('link', { name: 'Chapter map' }).click();
  await page.getByRole('link', { name, exact: true }).click();
}
async function touch(page: Page, target: string, verb = 'Use') {
  await page.getByRole('button', { name: verb, exact: true }).click();
  await page.getByRole('button', { name: target, exact: true }).click();
}

test('items, worn state, positions and milestones survive travel and resume after reload', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#nortel');
  await touch(page, 'Anti-static strap', 'Pick up');
  await visit(page, 'Enter the lab');
  await expect(page.getByRole('button', { name: 'Anti-static strap in inventory' })).toBeVisible();
  await touch(page, 'Computer');
  for (const genre of ['Adventure', 'Comedy', 'Sci-fi']) await page.getByLabel(genre, { exact: true }).check();
  await page.getByRole('button', { name: 'Recommend', exact: true }).click();
  await page.getByRole('button', { name: 'Take the ticket' }).click();
  await expect(page.locator('#strap')).toBeVisible();
  await visit(page, 'Enter Nortel');
  await expect(page.locator('#ticket')).toBeVisible();
  await touch(page, 'Anti-static strap in inventory');
  await expect(page.locator('#ticket')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Anti-static strap, worn and grounded' })).toBeVisible();
  await page.locator('#ticket').click();
  await page.getByRole('button', { name: 'Loose cable', exact: true }).click();
  await expect(page.locator('.nortel-link-lamp')).not.toHaveClass(/is-connected/);
  await touch(page, 'Loose cable', 'Look at');
  await touch(page, 'Loose cable');
  await expect(page.locator('.nortel-link-lamp')).toHaveClass(/is-connected/);
  const positions = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).positions, key);
  await visit(page, 'Enter the lab');
  await expect(page.getByRole('button', { name: 'Anti-static strap, worn and grounded' })).toBeVisible();
  await expect(page.locator('.worn-marker')).toBeVisible();
  expect(await page.locator('#character').evaluate(element => [element.style.left, element.style.top])).toEqual([`${positions.mcgill.x}%`, `${positions.mcgill.y}%`]);
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); });
  await mkdir('.impeccable/review', { recursive: true });
  await page.screenshot({ path: `.impeccable/review/${info.project.name}-shared-inventory-mcgill.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await visit(page, 'Enter Nortel');
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); });
  await page.screenshot({ path: `.impeccable/review/${info.project.name}-shared-inventory-nortel.png`, fullPage: true });
  await page.getByRole('link', { name: 'The short version' }).click();
  await page.reload();
  await expect(page.getByRole('link', { name: 'The adventure', exact: true })).toHaveAttribute('href', /#nortel$/);
  await page.getByRole('link', { name: 'The adventure', exact: true }).click();
  await expect(page.locator('#ticket')).toBeVisible();
  await expect(page.locator('.nortel-link-lamp')).toHaveClass(/is-connected/);
  await page.goto('/');
  await expect(page).toHaveURL(/#nortel$/);
  await expect(page.locator('#strap')).toBeVisible();
  await expect(page.locator('#dialogue-text')).toBeEmpty();
});

for (const stored of ['{"version":99,"privateFutureData":"keep"}', '{malformed']) {
  test(`an unreadable world save is preserved until an explicit whole-adventure restart: ${stored}`, async ({ page }) => {
    await page.addInitScript(({ key, stored }) => {
      if (localStorage.getItem(key) === null) localStorage.setItem(key, stored);
      localStorage.setItem('savagely-optimized:mcgill:v1', JSON.stringify({ ticket: true, completed: true }));
    }, { key, stored });
    await page.goto('/');
    await expect(page.locator('#ticket')).toBeHidden();
    await expect(page.locator('#save-status')).toContainText('will not replace it');
    await page.getByRole('group', { name: 'Playable McGill room' }).focus();
    await page.keyboard.press('ArrowRight');
    expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(stored);
    page.once('dialog', dialog => dialog.dismiss());
    await page.getByRole('button', { name: 'Restart', exact: true }).click();
    expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(stored);
    page.once('dialog', async dialog => { expect(dialog.message()).toContain('every room'); await dialog.accept(); });
    await page.getByRole('button', { name: 'Restart', exact: true }).click();
    await expect(page.locator('#save-status')).toBeEmpty();
    await page.reload();
    await expect(page.locator('#ticket')).toBeHidden();
    await expect(page.locator('#save-status')).toBeEmpty();
    const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key);
    expect(saved).toMatchObject({ version: 3, inventory: [], flags: { strapWorn: false, linkRestored: false } });
  });
}

test('unavailable storage still permits shared inventory for the current visit', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('QuotaExceededError'); }; });
  await page.goto('/#nortel');
  await touch(page, 'Anti-static strap');
  await visit(page, 'Enter the lab');
  await expect(page.getByRole('button', { name: 'Anti-static strap, worn and grounded' })).toBeVisible();
  await expect(page.locator('#save-status')).toContainText('will not be saved');
});

test('a static self-test can finish during an exit that is subsequently cancelled', async ({ page }) => {
  await page.goto('/#nortel');
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 60_000));
  await touch(page, 'OME A');
  await page.clock.runFor(1000);
  await touch(page, 'Door', 'Open');
  await expect(page.locator('#room-host')).toHaveAttribute('aria-busy', 'true');
  await page.clock.runFor(850);
  await expect(page.locator('#stage')).not.toHaveClass(/is-tripped/);
  await page.getByRole('link', { name: 'The short version' }).click();
  await page.clock.runFor(2000);
  await expect(page).toHaveURL(/#cv$/);
  await page.getByRole('link', { name: 'The adventure', exact: true }).click();
  await expect(page.locator('#stage')).not.toHaveClass(/is-tripped/);
  await touch(page, 'Anti-static strap');
  await touch(page, 'Loose cable');
  await expect(page.locator('.nortel-link-lamp')).toHaveClass(/is-connected/);
});
