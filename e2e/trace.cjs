const { createRequire } = require("node:module");
const fs = require("node:fs");
const { pipeline } = require("node:stream/promises");
const { createInterface } = require("node:readline");
const fromTest = createRequire(require.resolve("@playwright/test"));
const fromPlaywright = createRequire(fromTest.resolve("playwright"));
const { yauzl, yazl } = fromPlaywright("playwright-core/lib/utilsBundle");

// Keep the native Trace Viewer action timeline. Only allowlisted fields leave
// the private run folder. Network archives, action arguments, logs, DOM and
// request/response data can all contain cookies or presigned URLs.
async function safeTrace(input, output) {
  const archive = await new Promise((resolve, reject) =>
    yauzl.open(input, { lazyEntries: true }, (err, zip) =>
      err ? reject(err) : resolve(zip),
    ),
  );
  const zip = new yazl.ZipFile();
  const writing = pipeline(zip.outputStream, fs.createWriteStream(output));
  try {
    await new Promise((resolve, reject) => {
      archive.on("error", reject);
      archive.on("end", resolve);
      archive.on("entry", (entry) => {
        if (!/^(?:[\d-]+-)?trace\.trace$/.test(entry.fileName))
          return archive.readEntry();
        archive.openReadStream(entry, (err, stream) => {
          if (err) return reject(err);
          (async () => {
            const lines = [];
            for await (const line of createInterface({ input: stream })) {
              if (!line) continue;
              const event = JSON.parse(line);
              const fields = {
                "context-options": [
                  "version",
                  "origin",
                  "browserName",
                  "platform",
                  "wallTime",
                  "monotonicTime",
                  "contextId",
                ],
                before: [
                  "callId",
                  "startTime",
                  "class",
                  "method",
                  "pageId",
                  "parentId",
                ],
                after: ["callId", "endTime"],
              }[event.type];
              if (!fields) continue;
              const clean = { type: event.type };
              for (const key of fields)
                if (event[key] !== undefined) clean[key] = event[key];
              if (event.type === "context-options") clean.options = {};
              if (event.type === "before") clean.params = {};
              if (event.type === "after" && event.error)
                clean.error = { name: "Error", message: "Acción fallida" };
              lines.push(JSON.stringify(clean));
            }
            zip.addBuffer(Buffer.from(lines.join("\n") + "\n"), entry.fileName);
            zip.addBuffer(
              Buffer.alloc(0),
              entry.fileName.replace(/\.trace$/, ".network"),
            );
            archive.readEntry();
          })().catch(reject);
        });
      });
      archive.readEntry();
    });
  } finally {
    zip.end();
    await writing;
    archive.close();
  }
}
module.exports = { safeTrace };
