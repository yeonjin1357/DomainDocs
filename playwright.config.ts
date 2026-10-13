import { defineConfig, devices } from '@playwright/test';

const PORT = 4329;
const BASE_URL = `http://localhost:${PORT}/DomainDocs/`;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: BASE_URL, trace: 'retain-on-failure' },
  webServer: {
    // 테스트 전용 글로 빌드한 뒤 base 경로 아래에서만 응답하는 서버를 띄운다.
    command: `npm run build && node scripts/serve-dist.mjs ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 300_000,
    env: { ...(process.env as Record<string, string>), DOCS_CONTENT_DIR: './tests/fixtures/docs' },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 360, height: 740 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 3,
      },
    },
  ],
});
