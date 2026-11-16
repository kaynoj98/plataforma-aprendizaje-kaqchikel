const { test, expect, editor } = require("./fixtures.cjs");
test.use({ role: "USER" });

test("USER · autorización de interfaz y API", async ({ page, course }) => {
  await page.goto(editor(course));
  await expect(page).toHaveURL(/\/aprender\/?$/);
  const result = await page.request.get(
    "/api/v1/admin/lessons/" + course.lesson + "/blocks",
  );
  expect(result.status()).toBe(403);
});
test("Vocabulario activo · búsqueda, categoría y variante", async ({
  page,
}) => {
  await page.goto("/aprender/vocabulario");
  await expect(
    page.getByRole("heading", { name: "K’äy", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Término inactivo E2E")).toHaveCount(0);
  await page.getByLabel("Buscar palabra o traducción").fill("K’äy");
  await page.getByLabel("Categoría").selectOption({ label: "Categoría E2E" });
  await page
    .getByLabel("Variante regional")
    .selectOption({ label: "Variante E2E" });
  await page.getByRole("button", { name: "Buscar" }).click();
  await expect(page).toHaveURL(/variantId=/);
  await expect(
    page.getByRole("heading", { name: "K’äy", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Buscar palabra o traducción").fill("ausente");
  await page.getByRole("button", { name: "Buscar" }).click();
  await expect(
    page.getByText("No hay palabras que coincidan con estos filtros."),
  ).toBeVisible();
});
test("Catálogo, jerarquía publicada, inscripción y progreso persistente", async ({
  page,
}, info) => {
  await page.goto("/aprender/cursos");
  await page
    .getByRole("link", {
      name: "Ver curso: Curso E2E " + info.project.name,
      exact: true,
    })
    .click();
  await expect(page.getByText("Nivel E2E", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Unidad E2E" })).toBeVisible();
  await page.getByRole("button", { name: "Inscribirme al curso" }).click();
  await expect(page.getByText(/0 de 1 lecciones completadas/)).toBeVisible();
  await page.getByRole("link", { name: /Lección E2E/ }).click();
  await page.getByRole("button", { name: "Marcar como completada" }).click();
  await expect(
    page.getByText("Lección completada", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText(/1 de 1 lecciones completadas \(100%\)/),
  ).toBeVisible();
});
