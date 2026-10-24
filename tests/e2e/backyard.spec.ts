import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { freshAdventure, adventureSave } from '../../src/game/adventure';
import { HOT_DOG_LINE } from '../../src/game/rooms/backyard';

test('the Easter egg requires the exact query and is absent from normal navigation', async ({ page }) => {
  await page.goto('/#chapters');
  await expect(page.locator('a[href*="scene=hotdogs"]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /backyard|hot dogs|barbecue/i })).toHaveCount(0);
  for (const url of ['/#backyard', '/?scene=backyard', '/?scene=other#shopify']) {
    await page.goto(url);
    await expect(page.getByRole('group', { name: 'Backyard scene', exact: true })).toHaveCount(0);
    await expect(page.locator('#dialogue-text')).not.toHaveText(HOT_DOG_LINE);
  }
});

test('every backyard action repeats the exact line without affecting the normal save', async ({ page }, info) => {
  const key = adventureSave.key, original = '{"version":99,"futurePrivateProgress":"keep byte-for-byte"}';
  await page.addInitScript(({ key, original }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, original); }, { key, original });
  await page.goto('/?scene=hotdogs');
  await expect(page).toHaveTitle('Savagely Optimized — Backyard');
  await expect(page.locator('#dialogue-text')).toHaveText(HOT_DOG_LINE);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); });
  await mkdir('.impeccable/review', { recursive: true });
  await page.screenshot({ path: `.impeccable/review/${info.project.name}-backyard.png`, fullPage: true, animations: 'disabled' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const before = await page.locator('#character').getAttribute('style');
  for (const verb of ['Give', 'Pick up', 'Use', 'Open', 'Look at', 'Push', 'Close', 'Talk to', 'Pull']) {
    await page.getByRole('button', { name: verb, exact: true }).click();
    await expect(page.locator('#dialogue-text')).toHaveText(HOT_DOG_LINE);
    for (const object of ['Barbecue', 'Package of hot dogs', 'Garden gate', 'Picnic table', 'Fence']) {
      await page.getByRole('button', { name: object, exact: true }).click();
      await expect(page.locator('#dialogue-text')).toHaveText(HOT_DOG_LINE);
    }
  }
  const stage = page.locator('#stage'), box = (await stage.boundingBox())!;
  await stage.click({ position: { x: box.width * .65, y: box.height * .9 } });
  await page.getByRole('group', { name: 'Backyard scene', exact: true }).focus();
  for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'w', 'l', 'u']) {
    await page.keyboard.press(key);
    await expect(page.locator('#dialogue-text')).toHaveText(HOT_DOG_LINE);
  }
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await page.locator('#domain-joke').click();
  await expect(page.locator('#dialogue-text')).toHaveText(HOT_DOG_LINE);
  await expect(page.locator('#toast')).toBeHidden();
  await expect(page.locator('#character')).not.toHaveClass(/walking/);
  await expect(page.locator('#character')).toHaveAttribute('style', before!);
  await expect(page.locator('.inventory [data-item]')).toHaveCount(0);
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(original);
  await page.reload();
  await expect(page.locator('#dialogue-text')).toHaveText(HOT_DOG_LINE);
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(original);
});

test('leaving the hidden scene resumes the real adventure and keeps it undiscoverable', async ({ page }) => {
  const progress = { ...freshAdventure('shopify'), inventory: ['guitar-pick'] };
  const original = JSON.stringify(adventureSave.encode(progress));
  await page.addInitScript(({ key, original }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, original); }, { key: adventureSave.key, original });
  await page.goto('/?scene=hotdogs');
  await expect(page.getByRole('link', { name: 'The adventure', exact: true })).not.toHaveAttribute('href', /scene=hotdogs/);
  await page.getByRole('link', { name: 'The adventure', exact: true }).click();
  await expect(page).toHaveURL(/\/#shopify$/);
  await expect(page.getByRole('button', { name: 'Guitar pick', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Chapter map', exact: true }).click();
  await expect(page.locator('a[href*="scene=hotdogs"]')).toHaveCount(0);
  await expect(page.getByText('Backyard', { exact: true })).toHaveCount(0);
});
