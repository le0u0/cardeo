import { defineConfig } from "@playwright/test";
import { tmpdir } from "node:os";
import { join } from "node:path";
export default defineConfig({
  testDir: "../tests/e2e",
  outputDir: "../.artifacts/playwright/results",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 45000,
  expect: { timeout: 10000 },
  use: {
    baseURL: "http://127.0.0.1:3100",
    headless: Boolean(process.env.CI),
    channel: process.env.PW_CHANNEL || (process.env.CI ? undefined : "chrome"),
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run start -- --port 3100",
    cwd: process.cwd(),
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
    timeout: 60000,
    env: {
      CARDEO_DATABASE_DIR: join(tmpdir(), `cardeo-e2e-${process.pid}`),
      SUPABASE_URL: "",
      SUPABASE_SERVICE_ROLE_KEY: "",
      HOSTED: "",
    },
  },
});
