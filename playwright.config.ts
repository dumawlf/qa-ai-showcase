import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,

  // A stray `test.only` must never reach the main branch.
  forbidOnly: isCI,

  // Locally a failure should be loud. On CI, two retries absorb network blips,
  // and the report still marks a test that needed a retry as "flaky".
  retries: isCI ? 2 : 0,

  // The site under test is a free public demo. Keep the load small.
  workers: isCI ? 2 : 3,

  timeout: 30_000,
  expect: { timeout: 5_000 },

  reporter: isCI
    ? [['github'], ['list'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'https://www.saucedemo.com',
    // The site marks elements with `data-test`, so `getByTestId` reads that.
    testIdAttribute: 'data-test',
    // A click or a fill that cannot find its element fails after 10 seconds,
    // instead of using up the whole 30-second test.
    actionTimeout: 10_000,
    // Evidence is kept only for failures: a trace, a screenshot and a video.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
