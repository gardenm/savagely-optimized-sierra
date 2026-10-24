import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

async function touch(page: Page, target: string, verb = 'Look at') {
  await page.getByRole('button', { name: verb, exact: true }).click();
  await page.getByRole('button', { name: target, exact: true }).click();
}
async function itemOn(page: Page, item: string, target: string) {
  await page.getByRole('button', { name: 'Pick up', exact: true }).click();
  await page.getByRole('button', { name: item, exact: true }).click();
  await page.getByRole('button', { name: target, exact: true }).click();
}

test('the home office opens silently, has personal details and supplies the real drawer pick', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#chapters');
  await page.getByRole('link', { name: 'Enter Shopify', exact: true }).click();
  await expect(page).toHaveURL(/#shopify$/);
  await expect(page).toHaveTitle('Savagely Optimized — Shopify');
  await expect(page.locator('#dialogue-text')).toBeEmpty();
  await expect(page.locator('#command-text')).toBeEmpty();
  await expect(page.locator('.shopify-pick')).toBeVisible();
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); });
  await mkdir('.impeccable/review', { recursive: true });
  await page.screenshot({ path: `.impeccable/review/${info.project.name}-shopify.png`, fullPage: true, animations: 'disabled' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const [name, response] of [
    ['Portrait of my wife', 'wife'], ['Portrait of my son', 'son'], ['Sheepadoodle portrait', 'sheepadoodle'],
    ['Cabinet', 'cabinet'], ['Birch Green Jazzmaster', 'Jazzmaster'], ['Sears Silvertone turntable console', 'Silvertone'],
  ]) {
    await touch(page, name);
    await expect(page.locator('#dialogue-text')).toContainText(response);
  }
  await touch(page, 'Guitar pick beside the Jazzmaster', 'Pick up');
  await expect(page.locator('.shopify-pick')).toBeHidden();
  await expect(page.locator('[data-prop=pick]')).toBeHidden();
  await expect(page.locator('#guitar-pick')).toBeVisible();
  await page.reload();
  await expect(page.locator('.shopify-pick')).toBeHidden();
  await touch(page, 'Home office doorway', 'Open');
  await expect(page).toHaveURL(/#chapters$/);
  await page.getByRole('link', { name: 'Enter Lightspeed', exact: true }).click();
  await itemOn(page, 'Guitar pick', 'Counter drawer');
  await expect(page.locator('.lightspeed-drawer')).toBeVisible();
  await touch(page, 'Retaining clip in the drawer', 'Pick up');
  await expect(page.locator('#retaining-clip')).toBeVisible();
  await page.getByRole('link', { name: 'Chapter map' }).click();
  await page.getByRole('link', { name: 'Enter Shopify', exact: true }).click();
  await expect(page.locator('#retaining-clip')).toBeVisible();
  await page.getByRole('link', { name: 'The short version' }).click();
  await page.reload();
  await expect(page.getByRole('link', { name: 'The adventure', exact: true })).toHaveAttribute('href', '#shopify');
  await page.goto('/');
  await expect(page).toHaveURL(/#shopify$/);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await expect(page.locator('.shopify-pick')).toBeVisible();
  await expect(page.locator('#guitar-pick')).toBeHidden();
  await expect(page.locator('#dialogue-text')).toBeEmpty();
});

test('a supplied SMART sketch can be briefed, independently tested and reviewed across reloads', async ({ page }) => {
  // SMART's paper-plane source is outside this room extension. Only this test seeds its downstream sketch.
  await page.addInitScript(() => {
    const key = 'savagely-optimized:adventure:v1';
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({
      version: 3, currentRoom: 'lightspeed', inventory: ['faulty-receipt', 'stylus', 'checkout-plan', 'strap'],
      completed: false, positions: {}, flags: { stylusDown: true, exampleOnBoard: true, strapWorn: true, linkRestored: true },
    }));
  });
  await page.goto('/#shopify');
  await itemOn(page, 'Checkout sketch', 'Agent workbench');
  await itemOn(page, 'Faulty receipt', 'Agent workbench');
  await touch(page, 'Agent workbench', 'Look at');
  await touch(page, 'Agent workbench', 'Use');
  await expect(page.locator('#dialogue-text')).toContainText('candidate');
  await page.reload();
  await expect(page.locator('.shopify-screen-result')).toHaveText('CANDIDATE');
  await page.getByRole('link', { name: 'Chapter map' }).click();
  await page.getByRole('link', { name: 'Enter Lightspeed', exact: true }).click();
  await touch(page, 'iPad POS', 'Use');
  await expect(page.locator('#test-receipt')).toBeVisible();
  await expect(page.locator('#dialogue-text')).toContainText('$9.00');
  await page.reload();
  await page.getByRole('link', { name: 'Chapter map' }).click();
  await page.getByRole('link', { name: 'Enter Shopify', exact: true }).click();
  await itemOn(page, 'Test receipt', 'Agent workbench');
  await expect(page.locator('#dialogue-text')).toContainText('reviewed');
  await page.reload();
  await expect(page.locator('.shopify-screen-result')).toHaveText('REVIEWED');
});
