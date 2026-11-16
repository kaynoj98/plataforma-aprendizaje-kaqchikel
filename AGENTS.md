# Desarrollo de la Plataforma de Aprendizaje del Idioma Maya Kaqchikel — DIGEBI/MINEDUC

## Metodología de desarrollo

Codex es responsable del desarrollo y la implementación de las funcionalidades. Respeta la arquitectura del monorepo, la separación de roles ADMIN y USER y las reglas de seguridad y calidad del proyecto. Solicita autorización al propietario antes de crear o aplicar migraciones. No realices commit ni push sin su autorización.

Después de cada implementación, ejecuta `pnpm typecheck` y `pnpm lint` desde la raíz del monorepo. Ejecuta pruebas unitarias específicas cuando sean necesarias para verificar la lógica modificada o prevenir una regresión. Informa los resultados reales y señala cualquier comprobación que haya quedado pendiente.

El propietario del proyecto realiza personalmente las pruebas funcionales y visuales desde el navegador. Codex entrega un procedimiento manual adaptado al cambio. Indica los servicios que deben estar activos, el rol y los datos de prueba necesarios, la ruta de entrada, las acciones en orden y el resultado esperado de cada paso. Cuando corresponda, incluye cómo comprobar los permisos, la persistencia tras recargar y la presentación en escritorio y móvil. Identifica las pruebas manuales pendientes hasta que el propietario comunique su resultado.

## Entrega al finalizar cada implementación

1. Resumen de las funcionalidades implementadas.
2. Archivos creados y modificados.
3. Cambios en el backend y en el frontend.
4. Resultados de TypeScript y ESLint, junto con los de las pruebas específicas ejecutadas.
5. Procedimiento detallado de pruebas manuales para el propietario.
6. Limitaciones, problemas y verificaciones pendientes.

## Playwright y regresiones

Conserva la infraestructura de Playwright para futuras pruebas de regresión y aseguramiento de la calidad. No ejecutes automáticamente toda la matriz E2E después de cada implementación o corrección.

Para una regresión con Playwright, instala las dependencias desde la raíz con `pnpm install --frozen-lockfile` y los navegadores administrados con `pnpm e2e:install`. Utiliza Node y pnpm compatibles con el proyecto. Playwright usa sus propios navegadores.

Con PostgreSQL y Garage locales iniciados, puedes ejecutar un escenario concreto con `pnpm e2e --project=chromium-desktop editor.spec.cjs`. El comando `pnpm e2e` ejecuta la matriz completa. Cada invocación prepara datos nuevos. Abre el reporte con `pnpm e2e:report` e informa los casos aprobados, fallidos y omitidos por navegador. Distingue los errores de arranque de los fallos observados en una página. Conserva las aserciones de permisos, Unicode, persistencia y conflictos al depurar.

Cuando sea pertinente ejecutar la integración PostgreSQL existente, en PowerShell configura `$env:TEST_ENROLLMENTS_DB='1'`, ejecuta `pnpm --filter @kaqchikel/api test` y quita la variable al terminar. Esta prueba comprueba el destino local de desarrollo y limpia sus propias filas.

## Entorno y datos temporales

El ejecutor lee la configuración de desarrollo de `apps/api/.env`. Requiere el cliente PostgreSQL (`pg_dump` y `psql`), una cuenta local con permiso para crear bases y el cliente Prisma generado (`pnpm db:generate`). En Windows busca las utilidades en la instalación de PostgreSQL 18. Configura `PG_BIN` para otra ubicación.

El ejecutor comprueba el destino de desarrollo, copia únicamente su esquema a una base `kaqchikel_e2e_*` recién creada y prepara usuarios ADMIN y USER de prueba. Las contraseñas son aleatorias por ejecución. Express y Next se ejecutan en puertos privados contra esa base. PostgreSQL y Garage se reutilizan. La copia temporal de Next permite probar los archivos actuales con independencia de la compilación que esté sirviendo el desarrollador.

Cada proyecto de navegador dispone de un curso, una lección y una palabra multimedia propios. Firefox móvil prueba un viewport táctil de 390 × 844 en el motor de escritorio. Chromium móvil aplica además emulación móvil. Los archivos de autenticación se crean en la carpeta ignorada de la ejecución. Al finalizar se eliminan los objetos multimedia registrados en esa base, la base creada y la copia temporal. Ante un cierre forzado, identifica el nombre exacto de la ejecución antes de recuperar residuos. Evita limpiezas por comodín.

## Evidencias

Los resultados locales están en `.cache/e2e-results`. El reporte HTML enlaza evidencias por caso. El archivo `results.json` permite procesar los estados. El editor adjunta una captura para cada viewport que alcanza la verificación visual. Playwright toma capturas ante fallos de página. Un error previo al arranque del navegador puede carecer de captura.

Las trazas exportadas conservan cronología de acciones y resultados HTTP. El exportador usa una lista explícita de campos. Mantén las cabeceras, cuerpos, URLs, estados de sesión y trazas crudas fuera de los reportes. Usa únicamente archivos sintéticos para nuevas pruebas multimedia. Evita imprimir peticiones autenticadas y limita las capturas a las cuentas de prueba.
