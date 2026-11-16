const { defineConfig } = require("@playwright/test");
const path = require("node:path");
const artifacts =
  process.env.E2E_RESULTS_DIR || path.join(__dirname, "../.cache/e2e-results");
module.exports = defineConfig({
  testDir: __dirname,
  testMatch: "*.spec.cjs",
  workers: 1,
  retries: 0,
  timeout: 150000,
  expect: { timeout: 15000 },
  outputDir: path.join(artifacts, "tests"),
  reporter: [
    [require.resolve("./redact.cjs")],
    ["list"],
    ["html", { open: "never", outputFolder: path.join(artifacts, "html") }],
    ["json", { outputFile: path.join(artifacts, "results.json") }],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL,
    actionTimeout: 20000,
    navigationTimeout: 90000,
    screenshot: "only-on-failure",
    trace: "off",
  },
  projects: ["chromium", "firefox"].flatMap((browserName) =>
    ["desktop", "mobile"].map((size) => ({
      name: browserName + "-" + size,
      use: {
        browserName,
        viewport:
          size === "desktop"
            ? { width: 1366, height: 900 }
            : { width: 390, height: 844 },
        hasTouch: size === "mobile",
        isMobile: size === "mobile" && browserName === "chromium",
      },
    })),
  ),
});
