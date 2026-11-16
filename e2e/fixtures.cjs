const { test: base, expect } = require("@playwright/test");
const path = require("node:path");
// Record timings and HTTP outcomes through an allowlist. Network payloads and URLs
// can contain sessions or signed S3 keys and must never be report attachments.
const test = base.extend({
  role: ["ADMIN", { option: true }],
  storageState: async ({ role }, use) =>
    use(path.join(process.env.E2E_STATE, role + ".json")),
  course: async ({}, use, info) =>
    use(JSON.parse(process.env.E2E_FIXTURES)[info.project.name]),
  timeline: [
    async ({ context }, use, info) => {
      const started = Date.now();
      const events = [];
      context.on("response", (response) =>
        events.push({
          ms: Date.now() - started,
          method: response.request().method(),
          resource: response.request().resourceType(),
          status: response.status(),
        }),
      );
      const fs = require("node:fs/promises");
      const raw = path.join(
        process.env.E2E_STATE,
        require("node:crypto").randomUUID() + ".zip",
      );
      await context.tracing.start({
        sources: false,
        screenshots: false,
        snapshots: false,
      });
      try {
        await use();
      } finally {
        try {
          await context.tracing.stop({ path: raw });
          const output = info.outputPath("trace.zip");
          await fs.mkdir(path.dirname(output), { recursive: true });
          await require("./trace.cjs").safeTrace(raw, output);
          await info.attach("trace", {
            path: output,
            contentType: "application/zip",
          });
        } finally {
          await fs.rm(raw, { force: true });
        }
      }
      await info.attach("traza-http.json", {
        contentType: "application/json",
        body: Buffer.from(JSON.stringify(events)),
      });
    },
    { auto: true },
  ],
});
function editor({ course, level, unit, lesson }) {
  return (
    "/admin/cursos/" +
    course +
    "/niveles/" +
    level +
    "/unidades/" +
    unit +
    "/lecciones/" +
    lesson +
    "/contenido"
  );
}
module.exports = { test, expect, editor };
