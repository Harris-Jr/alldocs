import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config. By default Playwright starts the production server itself.
 * In CI set PW_BASE_URL to reuse a running server, and PW_CHROMIUM_PATH to
 * point at a preinstalled chromium (e.g. when the download CDN is blocked).
 */
const BASE_URL = process.env.PW_BASE_URL ?? 'http://localhost:3000';
const CHROMIUM_PATH = process.env.PW_CHROMIUM_PATH;

export default defineConfig({
  testDir: './tests-e2e',
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    acceptDownloads: true,
    ...(CHROMIUM_PATH ? { launchOptions: { executablePath: CHROMIUM_PATH } } : {}),
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Start the server unless we're told to reuse one.
  ...(process.env.PW_BASE_URL
    ? {}
    : {
        webServer: {
          command: 'pnpm --filter @alldocs/web start',
          url: 'http://localhost:3000',
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          cwd: '../../',
        },
      }),
});
