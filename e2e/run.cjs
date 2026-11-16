const { spawn, spawnSync } = require("node:child_process");
const { randomUUID, randomBytes } = require("node:crypto");
const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "..");
const api = path.join(root, "apps/api");
const web = path.join(root, "apps/web");
const fromApi = createRequire(path.join(api, "package.json"));
const { Client } = fromApi("pg");
const config = fromApi("dotenv").parse(fs.readFileSync(path.join(api, ".env")));
const prefix = "kaqchikel_e2e_" + randomBytes(8).toString("hex");
const work = path.join(web, ".e2e", prefix.slice("kaqchikel_e2e_".length));
const children = [];
let interrupted = false;

function stopChildren() {
  for (const child of [...children].reverse()) {
    if (child.exitCode !== null || child.signalCode || child.killed) continue;
    if (process.platform === "win32") {
      spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
        stdio: "ignore",
      });
    }
    child.kill();
  }
}
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    interrupted = true;
    stopChildren();
  });
}
const local = (url) =>
  ["localhost", "127.0.0.1"].includes(new URL(url).hostname);
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function port() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject).listen(0, "127.0.0.1", () => {
      const number = server.address().port;
      server.close(() => resolve(number));
    });
  });
}
function launch(file, args, cwd, env, quiet = true) {
  if (interrupted) throw new Error("Ejecución interrumpida.");
  const child = spawn(process.execPath, [file, ...args], {
    cwd,
    env,
    stdio: quiet ? "ignore" : "inherit",
    windowsHide: true,
  });
  children.push(child);
  return child;
}
async function ready(url, child) {
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    if (interrupted || child.signalCode || child.exitCode !== null)
      throw new Error("Servicio E2E terminado: " + child.exitCode);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
      await response.body?.cancel();
      if (response.ok) return;
      if (response.status >= 500)
        throw new Error(
          "HTTP " + response.status + " en " + new URL(url).pathname,
        );
    } catch (error) {
      if (error.message.startsWith("HTTP ")) throw error;
    }
    await pause(500);
  }
  throw new Error("Servicio E2E sin respuesta: " + url);
}
function pgTool(name, url, args, input) {
  const dir =
    process.env.PG_BIN ||
    (process.platform === "win32" ? "C:/Program Files/PostgreSQL/18/bin" : "");
  const result = spawnSync(path.join(dir, name), args, {
    input,
    maxBuffer: 32 * 1024 * 1024,
    env: {
      ...process.env,
      PGPASSWORD: decodeURIComponent(url.password),
      PGUSER: decodeURIComponent(url.username),
      PGDATABASE: url.pathname.slice(1),
      PGHOST: url.hostname,
      PGPORT: url.port || "5432",
      PGCLIENTENCODING: "UTF8",
    },
  });
  if (result.status !== 0)
    throw new Error(name + " falló. Verifica PG_BIN y acceso local.");
  return result.stdout;
}

async function main() {
  const source = new URL(config.DATABASE_URL);
  if (
    process.env.NODE_ENV === "production" ||
    config.NODE_ENV !== "development" ||
    !local(source) ||
    source.pathname !== "/kaqchikel" ||
    !local(config.S3_ENDPOINT)
  )
    throw new Error(
      "Las pruebas requieren PostgreSQL y Garage locales de desarrollo.",
    );
  const db = new Client({ connectionString: source.href });
  await db.connect();
  let created = false;
  let ownsDirectory = false;
  let prisma;
  try {
    const schema = pgTool("pg_dump", source, [
      "--schema-only",
      "--no-acl",
      "--no-owner",
    ]);
    await db.query('CREATE DATABASE "' + prefix + '"');
    created = true;
    const isolated = new URL(source);
    isolated.pathname = "/" + prefix;
    pgTool("psql", isolated, ["-X", "-q", "-v", "ON_ERROR_STOP=1"], schema);
    const apiPort = await port();
    const apiURL = "http://127.0.0.1:" + apiPort;
    const webPort = await port();
    const baseURL = "http://127.0.0.1:" + webPort;
    const env = {
      ...process.env,
      ...config,
      DATABASE_URL: isolated.href,
      NODE_ENV: "development",
      PORT: String(apiPort),
      API_INTERNAL_URL: apiURL,
      WEB_ORIGIN: baseURL,
      APP_URL: baseURL,
      MAIL_MODE: "log",
    };
    fromApi("tsx/cjs");
    const { PrismaClient } = fromApi("./src/generated/prisma/client.ts");
    prisma = new PrismaClient({
      adapter: new (fromApi("@prisma/adapter-pg").PrismaPg)({
        connectionString: isolated.href,
      }),
    });
    const accounts = {};
    for (const role of ["ADMIN", "USER"]) {
      const password = randomBytes(32).toString("hex");
      const email = role.toLowerCase() + "-" + prefix + "@example.invalid";
      const user = await prisma.user.create({
        data: {
          role,
          email,
          passwordHash: await fromApi("argon2").hash(password),
          firstName: "E2E",
          lastName: role,
          status: "ACTIVE",
          emailVerifiedAt: new Date(),
        },
      });
      accounts[role] = { email, password, id: user.id };
    }
    const fixtures = {};
    for (const project of [
      "chromium-desktop",
      "firefox-desktop",
      "chromium-mobile",
      "firefox-mobile",
    ]) {
      const data = {
        title: "Curso E2E " + project,
        status: "PUBLISHED",
        publishedAt: new Date(),
      };
      const course = await prisma.course.create({
        data: {
          ...data,
          slug: project,
          description: "Curso temporal",
          createdById: accounts.ADMIN.id,
        },
      });
      const level = await prisma.courseLevel.create({
        data: { ...data, title: "Nivel E2E", courseId: course.id },
      });
      const unit = await prisma.courseUnit.create({
        data: { ...data, title: "Unidad E2E", levelId: level.id },
      });
      const lesson = await prisma.lesson.create({
        data: {
          ...data,
          title: "Lección E2E",
          slug: "leccion",
          unitId: unit.id,
        },
      });
      const word = randomUUID();
      await prisma.vocabularyItem.create({
        data: {
          id: word,
          termKaqchikel: "Multimedia " + word,
          translationSpanish: "Temporal " + project,
          isActive: true,
        },
      });
      fixtures[project] = {
        course: course.id,
        level: level.id,
        unit: unit.id,
        lesson: lesson.id,
        word,
      };
    }
    const category = await prisma.vocabularyCategory.create({
      data: { name: "Categoría E2E", slug: "categoria-e2e" },
    });
    const variant = await prisma.vocabularyVariant.create({
      data: { name: "Variante E2E", code: "e2e" },
    });
    for (const isActive of [true, false])
      await prisma.vocabularyItem.create({
        data: {
          isActive,
          termKaqchikel: isActive ? "K’äy" : "Término inactivo E2E",
          translationSpanish: "Traducción E2E",
          categoryId: category.id,
          variantId: variant.id,
        },
      });
    fs.mkdirSync(path.dirname(work), { recursive: true });
    fs.mkdirSync(work);
    ownsDirectory = true;
    for (const name of [
      "src",
      "public",
      "tsconfig.json",
      "package.json",
      "next.config.ts",
      "postcss.config.mjs",
      "next-env.d.ts",
    ])
      fs.cpSync(path.join(web, name), path.join(work, name), {
        recursive: true,
      });
    console.log(
      "Esquema y registros E2E preparados. Iniciando servicios aislados.",
    );
    const apiChild = launch("--import", ["tsx", "src/server.ts"], api, env);
    await ready(apiURL + "/api/v1/health", apiChild);
    const nextCLI = createRequire(path.join(web, "package.json")).resolve(
      "next/dist/bin/next",
    );
    const webEnv = {
      ...process.env,
      API_INTERNAL_URL: apiURL,
      NEXT_TELEMETRY_DISABLED: "1",
      NODE_ENV: "development",
    };
    console.log(
      "Express, PostgreSQL y Garage disponibles. Compilando Next para E2E.",
    );
    const nextChild = launch(
      nextCLI,
      [
        "dev",
        "--webpack",
        "--hostname",
        "127.0.0.1",
        "--port",
        String(webPort),
      ],
      work,
      webEnv,
    );
    await ready(baseURL + "/login", nextChild);
    const { request } = require("@playwright/test");
    for (const [role, { email, password }] of Object.entries(accounts)) {
      const client = await request.newContext({ baseURL });
      try {
        const response = await client.post("/api/v1/auth/login", {
          data: { email, password },
        });
        if (response.status() !== 200)
          throw new Error("Ingreso E2E fallido: " + response.status());
        await client.storageState({ path: path.join(work, role + ".json") });
        // Compile dynamic routes before timing user interactions on a cold dev server.
        const f = fixtures["chromium-desktop"];
        const routes = role === "USER" ? ["/aprender/cursos/" + f.course] : [];
        for (const route of routes) {
          const page = await client.get(route, {
            timeout: 90000,
            maxRedirects: 0,
          });
          if (page.status() !== 200)
            throw new Error(
              "La preparación de " + route + " devolvió " + page.status(),
            );
        }
      } catch {
        throw new Error(
          "Falló la preparación de la sesión o de las rutas para " + role + ".",
        );
      } finally {
        await client.dispose();
      }
    }
    const resultsRoot = path.join(root, ".cache/e2e-results");
    const results = path.join(resultsRoot, prefix);
    fs.mkdirSync(results, { recursive: true });
    const test = launch(
      require.resolve("@playwright/test/cli"),
      [
        "test",
        "--config",
        "e2e/playwright.config.cjs",
        ...process.argv.slice(2),
      ],
      root,
      {
        ...process.env,
        E2E_RESULTS_DIR: results,
        E2E_BASE_URL: baseURL,
        E2E_STATE: work,
        E2E_FIXTURES: JSON.stringify(fixtures),
        PLAYWRIGHT_BROWSERS_PATH:
          process.env.PLAYWRIGHT_BROWSERS_PATH ||
          path.join(root, ".cache/pw-browsers"),
      },
      false,
    );
    process.exitCode = await new Promise((resolve) =>
      test.once("exit", (code) => resolve(code ?? 1)),
    );
    if (fs.existsSync(path.join(results, "html/index.html"))) {
      const latest = path.join(resultsRoot, prefix + ".latest");
      fs.writeFileSync(latest, prefix);
      fs.renameSync(latest, path.join(resultsRoot, "latest"));
      console.log("Reporte HTML:", path.join(results, "html/index.html"));
    }
  } finally {
    stopChildren();
    try {
      if (prisma) {
        // Esta conexión solo puede ver la base vacía creada por esta ejecución.
        Object.assign(process.env, config);
        const { storageService } = fromApi("./src/services/storage.service.ts");
        try {
          for (const media of await prisma.mediaFile.findMany({
            select: { objectKey: true },
          }))
            await storageService.delete(media.objectKey);
        } finally {
          await prisma.$disconnect();
        }
      }
      if (created)
        await db.query('DROP DATABASE "' + prefix + '" WITH (FORCE)');
    } finally {
      await db.end();
      if (ownsDirectory)
        fs.rmSync(work, {
          force: true,
          recursive: true,
          maxRetries: 6,
          retryDelay: 500,
        });
    }
  }
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
