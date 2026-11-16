const path = require("node:path");
const { spawnSync } = require("node:child_process");
const result = spawnSync(
  process.execPath,
  [
    require.resolve("@playwright/test/cli"),
    "install",
    "--only-shell",
    "chromium",
    "firefox",
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      PLAYWRIGHT_BROWSERS_PATH:
        process.env.PLAYWRIGHT_BROWSERS_PATH ||
        path.resolve(__dirname, "../.cache/pw-browsers"),
    },
  },
);
process.exitCode = result.status ?? 1;
