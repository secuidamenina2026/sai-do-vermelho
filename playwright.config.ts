import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests/browser', fullyParallel: false, workers: 1,
  use: { baseURL: 'http://127.0.0.1:3102', browserName: 'chromium', headless: true },
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3102', url: 'http://127.0.0.1:3102/teste/dicas', reuseExistingServer: false, timeout: 120000,
    env: { NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key', CRON_SECRET: 'local-test-only-secret' },
  },
})
