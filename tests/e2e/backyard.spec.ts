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

test('the backyard walks and postpones real object interactions without touching the normal save', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const key = adventureSave.key, original = '{"version":99,"futurePrivateProgress":"keep byte-for-byte"}';
  await page.addInitScript(({ key, original }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, original); }, { key, original });
  await page.goto('/?scene=hotdogs');
  await expect(page).toHaveTitle('Savagely Optimized — Backyard');
  await expect(page.locator('#dialogue-text')).toHaveText(HOT_DOG_LINE);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); });
  await mkdir('.impeccable/review', { recursive: true });
  await page.screenshot({ path: '.impeccable/review/' + info.project.name + '-backyard.png', fullPage: true, animations: 'disabled' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  const character = page.locator('#character');
  const stage = page.locator('#stage'), box = (await stage.boundingBox())!;
  await stage.click({ position: { x: box.width * .32, y: box.height * .9 } });
  await expect(character).toHaveClass(/walking/);
  await expect(page.locator('.character-walk')).toBeVisible();
  expect(await character.evaluate(element => parseFloat(element.style.left))).toBeCloseTo(32, 0);
  await expect(page.locator('#dialogue-text')).toBeEmpty();
  await expect(character).not.toHaveClass(/walking/);

  // Default clicks approach props and answer, without needing a selected verb.
  await page.getByRole('button', { name: 'Barbecue', exact: true }).click();
  await expect(page.locator('#dialogue-text')).toHaveText("I'll cook the hot dogs a little later.");
  expect(await character.evaluate(element => parseFloat(element.style.left))).toBeGreaterThan(60);
  await page.getByRole('button', { name: 'Barbecue', exact: true }).click();
  await expect(page.locator('#dialogue-text')).toHaveText("I don't want to.");
  await page.getByRole('button', { name: 'Barbecue', exact: true }).click();
  await expect(page.locator('#dialogue-text')).toHaveText('After I play some Street Fighter.');
  await page.getByRole('button', { name: 'Open', exact: true }).click();
  await expect(page.locator('#dialogue-text')).toHaveText('After I play some Street Fighter.');
  await page.getByRole('button', { name: 'Garden gate', exact: true }).click();
  await expect(page.locator('#dialogue-text')).toHaveText("I'll do that later.");

  for (const verb of ['Give', 'Pick up', 'Use', 'Open', 'Look at', 'Push', 'Close', 'Talk to', 'Pull']) {
    await page.getByRole('button', { name: verb, exact: true }).click();
    for (const object of ['Barbecue', 'Package of hot dogs', 'Garden gate', 'Picnic table', 'Fence']) {
      await page.getByRole('button', { name: object, exact: true }).click();
      await expect(page.locator('#dialogue-text')).toHaveText(/later|don't want|Street Fighter/);
    }
  }
  await expect(character).not.toHaveClass(/walking/);
  await page.screenshot({ path: '.impeccable/review/' + info.project.name + '-backyard-interaction.png', fullPage: true, animations: 'disabled' });

  await stage.click({ position: { x: box.width * .7, y: box.height * .9 } });
  await expect(character).toHaveClass(/walking/);
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await expect(character).not.toHaveClass(/walking|has-walk-frames/);
  expect(await character.evaluate(element => [element.style.left, element.style.top])).toEqual(['52%', '90%']);
  await expect(page.locator('#dialogue-text')).toHaveText(HOT_DOG_LINE);
  await page.locator('#domain-joke').click();
  await page.locator('#domain-joke').click();
  await expect(page.locator('#dialogue-text')).toHaveText("I don't want to.");
  await expect(page.locator('#toast')).toBeHidden();
  await expect(page.locator('.inventory [data-item]')).toHaveCount(0);
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(original);
  expect(errors).toEqual([]);
  await page.reload();
  await expect(page.locator('#dialogue-text')).toHaveText(HOT_DOG_LINE);
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(original);
});

test('keyboard walking and object actions work with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?scene=hotdogs');
  await page.getByRole('group', { name: 'Backyard scene', exact: true }).focus();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowUp');
  expect(await page.locator('#character').evaluate(element => [element.style.left, element.style.top])).toEqual(['49%', '88%']);
  await expect(page.locator('.character-walk')).toBeHidden();
  await expect(page.locator('#character')).toHaveCSS('transition-duration', '0s');
  await page.keyboard.press('u');
  await expect(page.getByRole('button', { name: 'Use', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Package of hot dogs', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#dialogue-text')).toHaveText("I don't want to open those yet.");
  await expect(page.locator('.character-walk')).toBeHidden();
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  expect(await page.locator('#character').evaluate(element => [element.style.left, element.style.top])).toEqual(['52%', '90%']);
});

test('leaving the hidden scene resumes the real adventure and keeps it undiscoverable', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const progress = { ...freshAdventure('shopify'), inventory: ['guitar-pick'] };
  const original = JSON.stringify(adventureSave.encode(progress));
  await page.addInitScript(({ key, original }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, original); }, { key: adventureSave.key, original });
  await page.goto('/?scene=hotdogs');
  const stage = page.locator('#stage'), box = (await stage.boundingBox())!;
  await stage.click({ position: { x: box.width * .75, y: box.height * .9 } });
  await expect(page.locator('#character')).toHaveClass(/walking/);
  await expect(page.getByRole('link', { name: 'The adventure', exact: true })).not.toHaveAttribute('href', /scene=hotdogs/);
  await page.getByRole('link', { name: 'The adventure', exact: true }).click();
  await expect(page).toHaveURL(/\/#shopify$/);
  await expect(page.getByRole('button', { name: 'Guitar pick', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Chapter map', exact: true }).click();
  await expect(page.locator('a[href*="scene=hotdogs"]')).toHaveCount(0);
  await expect(page.getByText('Backyard', { exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});
