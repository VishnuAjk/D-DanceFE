import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3100);

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'on-first-retry'
  },
  webServer: {
    command: `node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port ${port}`,
    env: {
      NEXT_PUBLIC_API_URL: 'http://127.0.0.1:4010',
      NEXT_PUBLIC_ENABLE_QUERY_DEVTOOLS: 'false'
    },
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } }
    },
    {
      name: 'small-mobile',
      use: { ...devices['Pixel 5'], viewport: { width: 320, height: 568 } }
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] }
    },
    {
      name: 'tablet',
      use: { ...devices['iPad (gen 7)'], viewport: { width: 768, height: 1024 } }
    }
  ]
});
