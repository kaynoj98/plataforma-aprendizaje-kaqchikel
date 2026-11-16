const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const root = path.join(__dirname, "../.cache/e2e-results");
const pointer = path.join(root, "latest");
if (!fs.existsSync(pointer))
  throw new Error("Ejecuta pnpm e2e para generar el primer reporte.");
const id = fs.readFileSync(pointer, "utf8").trim();
if (!/^kaqchikel_e2e_[a-f0-9]{16}$/.test(id))
  throw new Error("Identificador de reporte inválido.");
process.exitCode =
  spawnSync(
    process.execPath,
    [
      require.resolve("@playwright/test/cli"),
      "show-report",
      path.join(root, id, "html"),
    ],
    { stdio: "inherit" },
  ).status ?? 1;
