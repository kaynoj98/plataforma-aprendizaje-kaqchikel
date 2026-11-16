const { test, expect, editor } = require("./fixtures.cjs");
const alphabet = "ä, ë, ï, ö, ü, tz’, ch’, k’, q’, b’, t’";
const button = (page, name) => page.getByRole("button", { name, exact: true });

test("Editor ADMIN · teclado, Unicode, publicación, orden y conflicto 409", async ({
  page,
  context,
  course,
}, info) => {
  await page.goto(editor(course));
  const rows = page
    .locator("ol > li")
    .filter({ has: page.getByRole("button", { name: "Editar", exact: true }) });
  const add = button(page, "Agregar bloque");
  const save = async () => {
    await button(page, "Guardar bloque").click();
    await expect(button(page, "Guardar bloque")).toHaveCount(0);
  };
  const text = page.getByRole("textbox", { name: /^Texto/ });
  await test.step("Crear y editar encabezado y párrafo", async () => {
    await add.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByLabel("Tipo")).toBeVisible();
    await page.getByLabel("Tipo").selectOption("HEADING");
    await page.getByLabel("Tipo").focus();
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Título opcional")).toBeFocused();
    await text.fill("Encabezado inicial");
    await page.getByLabel("Visible en la lección publicada").check();
    await save();
    await button(rows.first(), "Editar").click();
    await text.fill("Saludos básicos");
    await save();
    await add.click();
    await text.fill("Párrafo inicial");
    await save();
    await button(rows.nth(1), "Editar").click();
    await text.fill("Párrafo revisado");
    await save();
  });
  await test.step("Publicar ejemplo bilingüe y comprobar ambos movimientos", async () => {
    await add.click();
    await page.getByLabel("Tipo").selectOption("EXAMPLE");
    await page.getByLabel("Ejemplo en Kaqchikel").fill(alphabet);
    await page.getByLabel("Traducción al español").fill("Ejemplo bilingüe");
    await page.getByLabel("Visible en la lección publicada").check();
    await save();
    await button(rows.nth(2), "Subir").click();
    await expect(rows.nth(1)).toContainText(alphabet);
    await button(rows.nth(1), "Bajar").click();
    await expect(rows.nth(2)).toContainText(alphabet);
    await page.reload();
    await expect(rows.nth(0)).toContainText("Saludos básicos");
    await expect(rows.nth(1)).toContainText("Párrafo revisado");
    await expect(rows.nth(2)).toContainText(alphabet);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await info.attach("editor.png", {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  });
  await test.step("Rechazar edición simultánea sin sobrescribir", async () => {
    const other = await context.newPage();
    await other.goto(editor(course));
    const oldRow = other
      .locator("ol > li")
      .filter({ hasText: "Saludos básicos" });
    await expect(button(oldRow, "Ocultar")).toBeVisible();
    await button(rows.first(), "Ocultar").click();
    await expect(button(rows.first(), "Mostrar")).toBeVisible();
    const conflict = other.waitForResponse(
      (r) =>
        r.request().method() === "PATCH" && r.url().includes("/admin/blocks/"),
    );
    await button(oldRow, "Ocultar").click();
    expect((await conflict).status()).toBe(409);
    await button(other, "Recargar bloques").click();
    await expect(button(oldRow, "Mostrar")).toBeVisible();
    await other.close();
    await button(rows.first(), "Mostrar").click();
    await expect(button(rows.first(), "Ocultar")).toBeVisible();
  });
  await test.step("Verificar vista previa y retirar únicamente el párrafo temporal", async () => {
    const preview = page;
    await page.getByRole("link", { name: "Vista previa", exact: true }).click();
    await expect(
      preview.getByRole("heading", { name: "Saludos básicos" }),
    ).toBeVisible();
    await expect(preview.getByText(alphabet, { exact: true })).toBeVisible();
    await expect(
      preview.getByText("Ejemplo bilingüe", { exact: true }),
    ).toBeVisible();
    await expect(preview.getByText("Párrafo revisado")).toHaveCount(0);
    await expect(
      preview.getByRole("button", { name: /completada/i }),
    ).toHaveCount(0);
    await page.goto(editor(course));
    await expect(rows.nth(1)).toContainText("Párrafo revisado");
    const confirmation = page.waitForEvent("dialog").then(async (dialog) => {
      expect(dialog.type()).toBe("confirm");
      await dialog.accept();
    });
    const removal = page.waitForResponse(
      (r) =>
        r.request().method() === "DELETE" && r.url().includes("/admin/blocks/"),
    );
    await Promise.all([
      confirmation,
      removal.then((response) => expect(response.status()).toBe(200)),
      button(rows.nth(1), "Retirar").click(),
    ]);
    await expect(rows).toHaveCount(2);
    await page.reload();
    await expect(rows).toHaveCount(2);
    await expect(rows.filter({ hasText: "Párrafo revisado" })).toHaveCount(0);
  });
});
