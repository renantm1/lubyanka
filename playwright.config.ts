import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
const basePath = (process.env.SITE_BASE_PATH || "").replace(/\/$/, "");
const baseURL = `http://127.0.0.1:3000${basePath}/`;
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  use: {
    baseURL,
    headless: true,
    viewport: { width: 1440, height: 1000 },
    launchOptions: {
      executablePath:
        process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
        (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
      args: ["--no-sandbox"],
    },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm start",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 30000,
  },
});
