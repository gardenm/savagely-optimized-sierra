import { defineConfig } from '@playwright/test';

const usePreview = process.env.PLAYWRIGHT_USE_PREVIEW === '1';
const baseURL = `http://127.0.0.1:${usePreview ? 4173 : 5173}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  retries: 0,
  use: {
    baseURL,
    launchOptions: { executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] },
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: usePreview ? 'npm run preview -- --port 4173' : 'npm run dev -- --port 5173',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
