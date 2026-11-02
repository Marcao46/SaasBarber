import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './test/browser',
  workers: 1,
  timeout: 60000,
  expect: { timeout: 15000 },
  reporter: 'list',
  outputDir: '../artifacts/playwright',
  use: { baseURL: 'http://127.0.0.1:5174', headless: true, actionTimeout: 15000, screenshot: 'only-on-failure', viewport: { width: 1366, height: 900 } },
  webServer: {
    command: 'node ../node_modules/vite/bin/vite.js .. --host 127.0.0.1 --port 5174 --strictPort',
    url: 'http://127.0.0.1:5174',
    env: { VITE_FIREBASE_EMULATORS: 'true' },
    reuseExistingServer: false,
  },
});
