const path = require("node:path");
const { test, expect } = require("./fixtures.cjs");

// PCM mono de 250 ms generado para la prueba.
function wav() {
  const bytes = Buffer.alloc(4044);
  bytes.write("RIFF");
  bytes.writeUInt32LE(bytes.length - 8, 4);
  bytes.write("WAVEfmt ", 8);
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(8000, 24);
  bytes.writeUInt32LE(16000, 28);
  bytes.writeUInt16LE(2, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write("data", 36);
  bytes.writeUInt32LE(4000, 40);
  return bytes;
}
test("Subir, asociar y abrir imagen y pronunciación como estudiante", async ({
  page,
  browser,
  course,
}) => {
  await page.goto("/admin/vocabulario/" + course.word + "/editar");
  for (const [section, name, mimeType, buffer, button] of [
    [
      "Imagen de vocabulario",
      "e2e.png",
      "image/png",
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=",
        "base64",
      ),
      "Subir imagen",
    ],
    ["Audio de pronunciación", "e2e.wav", "audio/wav", wav(), "Subir audio"],
  ]) {
    const group = page.getByRole("group", { name: section });
    await group
      .locator("input[type=file]")
      .setInputFiles({ name, mimeType, buffer });
    await group.getByRole("button", { name: button }).click();
    await expect(group.getByText(/Archivo subido/)).toBeVisible();
  }
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page).toHaveURL(/\/admin\/vocabulario$/);
  const student = await browser.newContext({
    storageState: path.join(process.env.E2E_STATE, "USER.json"),
    baseURL: process.env.E2E_BASE_URL,
  });
  try {
    const reader = await student.newPage();
    await reader.goto("/aprender/vocabulario?q=" + course.word);
    // La palabra temporal lleva su UUID como término de búsqueda.
    await expect
      .poll(() =>
        reader
          .getByAltText("Imagen de vocabulario")
          .evaluate((el) => el.complete && el.naturalWidth > 0),
      )
      .toBe(true);
    const audio = reader.locator("audio");
    await expect(audio).toBeVisible();
    expect(
      await audio.evaluate(async (el) => {
        el.muted = true;
        await el.play();
        return !el.paused;
      }),
    ).toBe(true);
  } finally {
    await student.close();
  }
});
