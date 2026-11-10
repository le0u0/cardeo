import { defineConfig } from "vitest/config";
export default defineConfig({
  root: process.cwd(),
  test: {
    include: ["src/**/*.test.{ts,tsx}", "tests/integration/**/*.test.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
    pool: "forks",
    maxWorkers: 1,
  },
});
