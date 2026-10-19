import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

test('the recommendation puzzle gates the exit, awards a usable ticket, and remembers completion', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Open', exact: true }).click();
  await page.getByRole('button', { name: 'Door', exact: true }).click();
  await expect(page.locator('#dialogue-text')).toContainText('unlocked door');
  await expect(page.locator('[data-view=chapters]')).toBeHidden();
  await page.getByRole('button', { name: 'Use', exact: true }).click();
  await page.getByRole('button', { name: 'Computer', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Recommend', exact: true }).click();
  await expect(page.locator('#terminal-feedback')).toContainText('Choose three genres');
  for (const label of ['Horror', 'Documentary', 'Romance']) await page.getByLabel(label, { exact: true }).check();
  await page.getByRole('button', { name: 'Recommend', exact: true }).click();
  await expect(page.locator('#terminal-feedback')).toContainText('No match');
  await expect(page.locator('#recommendation')).toBeHidden();
  for (const label of ['Horror', 'Documentary', 'Romance']) await page.getByLabel(label, { exact: true }).uncheck();
  for (const label of ['Adventure', 'Comedy', 'Sci-fi']) await page.getByLabel(label, { exact: true }).check();
  await page.getByRole('button', { name: 'Recommend', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Back to the Future' })).toBeVisible();
  await page.getByRole('button', { name: 'Take the ticket' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('#ticket')).toBeVisible();
  await expect(page.locator('#ticket')).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Door', exact: true }).click();
  await expect(page).toHaveURL(/#chapters$/);
  await expect(page.getByRole('heading', { name: 'A little more agency.' })).toBeVisible();
  await expect(page.locator('.chapter-row').last()).toContainText('learning agentic engineering');
  await expect(page.locator('.chapter-row').last()).toContainText('Planned');
  await page.reload();
  await page.getByRole('link', { name: 'Enter the lab' }).click();
  await expect(page.locator('#ticket')).toBeVisible();
  await page.getByRole('button', { name: 'Open', exact: true }).click();
  await page.getByRole('button', { name: 'Door', exact: true }).click();
  await expect(page).toHaveURL(/#chapters$/);
  expect(errors).toEqual([]);
});

test('the career overview is available without playing and includes only planned future chapters', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'The short version' }).click();
  await expect(page.locator('[data-view=cv]')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Shopify', exact: true })).toBeVisible();
  await expect(page.locator('.bio-timeline')).toContainText('agentic engineering');
  await expect(page.locator('#ticket')).toBeHidden();
  await page.getByRole('link', { name: 'Chapter map' }).click();
  await expect(page.getByRole('link', { name: 'Enter the lab' })).toHaveCount(1);
});

test('keyboard actions, close focus, movement, and restart work without tutorial controls', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('group', { name: 'Playable McGill room' }).focus();
  await page.keyboard.press('u');
  await expect(page.getByRole('button', { name: 'Use', exact: true })).toHaveAttribute('aria-pressed', 'true');
  const computer = page.getByRole('button', { name: 'Computer', exact: true });
  await computer.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(computer).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect.poll(async()=>Number(await page.locator('#character').evaluate(el=>parseFloat(el.style.left)))).toBeGreaterThan(43);
  await expect(page.locator('.character-right')).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.character-left')).toBeVisible();
  await expect(page.locator('.character-right')).toBeHidden();
  expect(await page.locator('.character-left').evaluate(el=>getComputedStyle(el).scale)).not.toBe('-1 1');
  await page.keyboard.press('l');
  await expect(page.getByRole('button', { name: 'Look at', exact: true })).toHaveAttribute('aria-pressed', 'true');
  const papers = page.getByRole('button', { name: 'Research papers', exact: true });
  await papers.focus();
  await expect(page.locator('#command-text')).toHaveText('Look at research papers');
  await page.keyboard.press('Enter');
  await expect(page.locator('#dialogue-text')).toContainText('An MSc earned');
  await page.getByRole('link', { name: 'Chapter map' }).click();
  page.once('dialog', dialog=>dialog.accept());
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await expect(page).toHaveURL(/#adventure$/);
  await expect(page.locator('#ticket')).toBeHidden();
  await expect(page.locator('#dialogue-text')).toBeEmpty();
  await expect(page.locator('#command-text')).toBeEmpty();
});

test('optional sound and unavailable storage do not block play', async ({ page }) => {
  await page.addInitScript(()=>{ Storage.prototype.setItem = () => { throw new DOMException('Disabled'); }; });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Turn on ambient sound' })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Turn on ambient sound' }).click();
  await expect(page.getByRole('button', { name: 'Turn off ambient sound' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Turn off ambient sound' }).click();
  await page.getByRole('button', { name: 'Look at', exact: true }).click();
  await page.getByRole('button', { name: 'Research papers', exact: true }).click();
  await expect(page.locator('#save-status')).toContainText('storage is unavailable');
  await expect(page.locator('#dialogue-text')).toContainText('MSc earned');
});

test('desktop and mobile layouts fit, load artwork, and expose objects', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.room-art')).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);
  expect(await page.locator('.room-art').evaluate((el: HTMLImageElement)=>el.complete && el.naturalWidth>0)).toBe(true);
  for (const image of await page.locator('.character img').all()) {
    expect(await image.evaluate((el: HTMLImageElement)=>el.complete && el.naturalWidth>0)).toBe(true);
  }
  await expect(page.getByRole('heading', { name: 'McGill University, 2006' })).toBeVisible();
  await expect(page.locator('#command-text')).toBeEmpty();
  await expect(page.locator('#dialogue-text')).toBeEmpty();
  await expect(page.locator('.reflection')).toHaveCount(0);
  await expect(page.locator('[data-mode]')).toHaveCount(9);
  await expect(page.getByText('A change of scene.', { exact: true })).toHaveCount(0);
  await mkdir('.impeccable/review', { recursive: true });
  await page.screenshot({ path: `.impeccable/review/${testInfo.project.name}.png`, fullPage: true });
  for (const hash of ['adventure','chapters','cv']) {
    await page.goto(`/#${hash}`);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
    if (hash !== 'adventure') await page.screenshot({ path: `.impeccable/review/${testInfo.project.name}-${hash}.png`, fullPage: true });
  }
  await page.goto('/');
  await page.getByRole('button', { name: 'Use', exact: true }).click();
  await page.getByRole('button', { name: 'Computer', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.screenshot({ path: `.impeccable/review/${testInfo.project.name}-computer.png` });
});


test('classic verbs give feedback and inventory selection survives switching between use and give', async ({ page }) => {
  await page.goto('/');
  const computer = page.getByRole('button', { name: 'Computer', exact: true });
  await page.getByRole('button', { name: 'Pick up', exact: true }).click();
  await page.getByRole('button', { name: 'Research papers', exact: true }).click();
  await expect(page.locator('#dialogue-text')).toContainText('travelling light');
  await page.getByRole('button', { name: 'Talk to', exact: true }).click();
  await computer.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  for (const label of ['Adventure', 'Comedy', 'Sci-fi']) await page.getByLabel(label, { exact: true }).check();
  await page.getByRole('button', { name: 'Recommend', exact: true }).click();
  await page.getByRole('button', { name: 'Take the ticket' }).click();
  await page.getByRole('button', { name: 'Give', exact: true }).click();
  await expect(page.locator('#ticket')).toHaveAttribute('aria-pressed', 'true');
  await computer.click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('#dialogue-text')).toContainText('ticket reader');
  await page.getByRole('button', { name: 'Look at', exact: true }).click();
  await expect(page.locator('#ticket')).toHaveAttribute('aria-pressed', 'false');
  await page.locator('#ticket').click();
  await expect(page.getByRole('button', { name: 'Use', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Door', exact: true }).click();
  await expect(page).toHaveURL(/#chapters$/);
});

test('inspecting research papers reveals a clickable PDF link and other interactions clear it', async ({ page }, testInfo) => {
  const paperUrl = 'https://cim.mcgill.ca/~mrl/pubs/mgarden/garden-semantic-eee05.pdf';
  // Verify navigation without depending on the external PDF host during tests.
  await page.context().route(paperUrl, route => route.fulfill({ contentType: 'text/html', body: '<title>Research paper destination</title>' }));
  await page.goto('/');
  const paperLink = page.getByRole('link', { name: 'Read the paper' });
  await expect(paperLink).toBeHidden();
  await page.getByRole('button', { name: 'Look at', exact: true }).click();
  await page.getByRole('button', { name: 'Research papers', exact: true }).click();
  await expect(paperLink).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await mkdir('.impeccable/review', { recursive: true });
  await page.screenshot({ path: `.impeccable/review/${testInfo.project.name}-papers.png`, fullPage: true });
  const [paper] = await Promise.all([page.waitForEvent('popup'), paperLink.click()]);
  await expect(paper).toHaveURL(paperUrl);
  await paper.close();
  await page.getByRole('button', { name: 'Noticeboard', exact: true }).click();
  await expect(paperLink).toBeHidden();
  await expect(page.locator('#dialogue-text')).toContainText('high-school CS class');
});

test('the action sentence keeps the verbs in place when empty, hovered, or focused', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const verbs = page.locator('.verbs');
  const command = page.locator('.command-line');
  const initialVerbs = (await verbs.boundingBox())!;
  const initialCommand = (await command.boundingBox())!;
  const expectStableControls = async () => {
    expect((await verbs.boundingBox())!.y).toBeCloseTo(initialVerbs.y, 3);
    expect((await command.boundingBox())!.height).toBeCloseTo(initialCommand.height, 3);
  };
  await expect(page.locator('#command-text')).toBeEmpty();
  const computer = page.getByRole('button', { name: 'Computer', exact: true });
  await computer.hover();
  await expect(page.locator('#command-text')).toHaveText('Walk to computer');
  await expectStableControls();
  await page.mouse.move(0, 0);
  await expect(page.locator('#command-text')).toBeEmpty();
  await expectStableControls();
  await computer.focus();
  await expect(page.locator('#command-text')).toHaveText('Walk to computer');
  await expectStableControls();
  await page.getByRole('button', { name: 'Use', exact: true }).click();
  await page.getByRole('button', { name: 'Research papers', exact: true }).hover();
  await expect(page.locator('#command-text')).toHaveText('Use research papers');
  await expectStableControls();
});
