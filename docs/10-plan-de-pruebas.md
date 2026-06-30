# Plan de pruebas

## Plataforma web para el aprendizaje del idioma kaqchikel

**Institución:** Dirección General de Educación Bilingüe Intercultural —DIGEBI—, Ministerio de Educación de Guatemala
**Nombre del proyecto:** Plataforma web para el aprendizaje del idioma kaqchikel
**Versión del documento:** 1.0
**Versión del sistema:** Versión 1
**Estado:** Planificación inicial
**Fecha:** Junio de 2026

---

## 1. Introducción

El presente documento define el plan de pruebas para la primera versión de la plataforma web para el aprendizaje del idioma kaqchikel.

El objetivo de las pruebas será comprobar que la plataforma:

- Cumpla los requisitos funcionales.
- Cumpla los requisitos no funcionales.
- Respete los roles y permisos definidos.
- Mantenga la integridad de la información.
- Funcione correctamente en diferentes dispositivos.
- Proteja los datos de los usuarios.
- Conserve los archivos multimedia.
- Permita realizar respaldos y restauraciones.
- Pueda desplegarse de forma estable mediante Docker Compose.

Las pruebas se realizarán progresivamente durante el desarrollo, evitando dejar toda la validación para la etapa final.

---

## 2. Objetivo del documento

Definir:

- Alcance de las pruebas.
- Tipos de pruebas.
- Entornos de prueba.
- Herramientas.
- Responsabilidades.
- Datos necesarios.
- Casos prioritarios.
- Criterios de aprobación.
- Gestión de errores.
- Evidencias.
- Procedimientos de aceptación.

Este documento servirá como referencia para verificar requisitos, casos de uso, rutas de API, modelos de base de datos y módulos del sistema.

---

# 3. Objetivos de las pruebas

## 3.1 Objetivo general

Comprobar que la primera versión de la plataforma funcione de manera correcta, segura, estable y conforme con los documentos de análisis y diseño.

## 3.2 Objetivos específicos

1. Verificar el funcionamiento de los módulos principales.

2. Comprobar el registro, confirmación y autenticación de usuarios.

3. Validar que los permisos de `ADMIN` y `USER` se apliquen correctamente.

4. Comprobar la creación y publicación de cursos, unidades y lecciones.

5. Verificar el almacenamiento y reproducción de archivos multimedia.

6. Comprobar la creación y calificación de evaluaciones.

7. Verificar el cálculo del progreso de los usuarios.

8. Validar el envío de notificaciones y correos.

9. Comprobar la persistencia de PostgreSQL y MinIO.

10. Verificar el funcionamiento de respaldos y restauraciones.

11. Comprobar el diseño adaptable en computadoras, tabletas y teléfonos.

12. Identificar errores antes del despliegue en producción.

---

# 4. Alcance de las pruebas

Las pruebas cubrirán los siguientes módulos:

| Código | Módulo                        |
| ------ | ----------------------------- |
| MOD-01 | Autenticación y sesiones      |
| MOD-02 | Usuarios y perfiles           |
| MOD-03 | Cursos                        |
| MOD-04 | Niveles, unidades y lecciones |
| MOD-05 | Contenido educativo           |
| MOD-06 | Vocabulario y pronunciación   |
| MOD-07 | Archivos multimedia           |
| MOD-08 | Ejercicios y evaluaciones     |
| MOD-09 | Progreso                      |
| MOD-10 | Notificaciones y correo       |
| MOD-11 | Panel administrativo          |
| MOD-12 | Reportes                      |
| MOD-13 | Auditoría                     |
| MOD-14 | Configuración                 |
| MOD-15 | Base de datos                 |
| MOD-16 | Almacenamiento                |
| MOD-17 | Validación y errores          |
| MOD-18 | Monitoreo y registros         |
| MOD-19 | Respaldos y recuperación      |
| MOD-20 | Infraestructura y despliegue  |

---

# 5. Elementos fuera del alcance inicial

Las pruebas de la versión 1 no incluirán:

- Aplicación móvil nativa.
- Reconocimiento de voz.
- Evaluación automática de pronunciación.
- Inteligencia artificial.
- Videollamadas.
- Chat entre usuarios.
- Clases en vivo.
- Integración con sistemas externos de MINEDUC.
- Alta disponibilidad con varios servidores.
- Balanceo de carga avanzado.
- Kubernetes.
- Pruebas de millones de usuarios simultáneos.

Estas funciones no forman parte del alcance de la primera versión.

---

# 6. Estrategia general de pruebas

La estrategia se dividirá en varios niveles.

```text
Pruebas unitarias
        ↓
Pruebas de integración
        ↓
Pruebas de API
        ↓
Pruebas funcionales
        ↓
Pruebas de extremo a extremo
        ↓
Pruebas de seguridad y rendimiento
        ↓
Pruebas de aceptación
```

Cada nueva función deberá probarse antes de considerarse terminada.

---

# 7. Tipos de pruebas

## 7.1 Pruebas unitarias

Comprobarán funciones o unidades pequeñas de código de manera aislada.

Ejemplos:

- Validación de contraseña.
- Normalización de correo.
- Cálculo de puntuación.
- Cálculo de porcentaje de progreso.
- Generación de `slug`.
- Validación de tipos de archivo.
- Verificación de expiración de tokens.
- Transformación de respuestas.

Herramienta recomendada:

```text
Vitest
```

---

## 7.2 Pruebas de integración

Comprobarán la comunicación entre varios componentes.

Ejemplos:

- Express y Prisma.
- Prisma y PostgreSQL.
- Backend y MinIO.
- Backend y SMTP.
- Registro de usuario y generación de token.
- Evaluación y actualización de progreso.
- Carga de archivo y creación de metadatos.
- Publicación y auditoría.

Estas pruebas deberán utilizar una base de datos separada de producción.

---

## 7.3 Pruebas de API

Comprobarán las rutas REST.

Se validará:

- Método HTTP.
- Ruta.
- Datos de entrada.
- Respuesta.
- Código HTTP.
- Permisos.
- Persistencia.
- Manejo de errores.

Herramientas recomendadas:

- Supertest.
- Postman o Insomnia.
- Vitest.

---

## 7.4 Pruebas funcionales

Comprobarán que las funciones visibles se comporten conforme con los requisitos.

Ejemplos:

- Registrar usuario.
- Confirmar correo.
- Crear curso.
- Publicar lección.
- Realizar evaluación.
- Consultar progreso.
- Enviar notificación.

Podrán realizarse manualmente y mediante automatización.

---

## 7.5 Pruebas de extremo a extremo

Comprobarán flujos completos desde el navegador.

Herramienta recomendada:

```text
Playwright
```

Ejemplos:

```text
Registro
→ Confirmación
→ Inicio de sesión
→ Inicio de curso
→ Lección
→ Evaluación
→ Progreso
```

También se probará el flujo administrativo:

```text
Inicio de sesión ADMIN
→ Crear curso
→ Crear unidad
→ Crear lección
→ Cargar audio
→ Publicar contenido
→ Verificar acceso USER
```

---

## 7.6 Pruebas de seguridad

Comprobarán:

- Autenticación.
- Autorización.
- Protección de rutas.
- Cookies.
- Validación.
- Restricción de archivos.
- Rate limiting.
- Protección de secretos.
- Respuestas de error.
- Acceso a datos ajenos.
- Exposición de servicios.

---

## 7.7 Pruebas de rendimiento

Comprobarán:

- Tiempo de respuesta.
- Carga de páginas.
- Consultas de listas.
- Carga de archivos.
- Reproducción multimedia.
- Operaciones concurrentes.
- Uso de recursos del servidor.

---

## 7.8 Pruebas de compatibilidad

Comprobarán el funcionamiento en:

- Google Chrome.
- Mozilla Firefox.
- Microsoft Edge.
- Chrome móvil.
- Navegadores basados en Chromium.
- Safari móvil cuando sea posible.

---

## 7.9 Pruebas de diseño adaptable

Se probarán tamaños aproximados de:

```text
Móvil pequeño:      320 px
Móvil estándar:     375 px
Móvil grande:       430 px
Tableta:            768 px
Portátil:          1366 px
Escritorio:        1920 px
```

Se verificará:

- Menús.
- Tablas.
- Formularios.
- Tarjetas.
- Audios.
- Videos.
- Panel administrativo.
- Desplazamiento horizontal.
- Legibilidad.

---

## 7.10 Pruebas de accesibilidad

Se comprobará:

- Navegación mediante teclado.
- Etiquetas en formularios.
- Texto alternativo.
- Contraste.
- Foco visible.
- Uso correcto de encabezados.
- Controles accesibles.
- Tamaño de botones.
- Transcripciones cuando existan.

---

## 7.11 Pruebas de respaldo y recuperación

Se comprobará:

- Creación de respaldos.
- Integridad del archivo generado.
- Retención.
- Restauración de PostgreSQL.
- Restauración de MinIO.
- Recuperación después de eliminar datos de prueba.
- Registro de errores.

---

## 7.12 Pruebas de despliegue

Se comprobará:

- Construcción de imágenes.
- Inicio de contenedores.
- Redes.
- Volúmenes.
- Health checks.
- Nginx.
- Cloudflare Tunnel.
- Dominio.
- HTTPS.
- Reinicio automático.
- Persistencia.

---

# 8. Entornos de prueba

## 8.1 Entorno de desarrollo

Utilizado durante la programación.

Características:

- Ejecución local.
- Datos ficticios.
- Logs detallados.
- Puertos locales.
- Recarga automática.
- Base de datos de desarrollo.

Ejemplo:

```text
kaqchikel_development
```

---

## 8.2 Entorno de pruebas

Se recomienda contar con una base separada:

```text
kaqchikel_test
```

Este entorno deberá:

- Utilizar datos ficticios.
- Poder limpiarse.
- Ejecutar migraciones.
- No contener datos reales.
- No enviar correos reales.
- Utilizar un servicio SMTP de pruebas.

---

## 8.3 Entorno de producción

Características:

- Dominio real.
- HTTPS.
- Servidor dedicado.
- Datos reales.
- Respaldos.
- Monitoreo.
- Acceso restringido.

Las pruebas destructivas no deberán ejecutarse directamente en producción.

---

# 9. Herramientas de prueba

| Herramienta        | Uso                                  |
| ------------------ | ------------------------------------ |
| Vitest             | Pruebas unitarias                    |
| Supertest          | Pruebas de API con Express           |
| Playwright         | Pruebas de extremo a extremo         |
| Postman o Insomnia | Pruebas manuales de API              |
| Prisma Studio      | Verificación de datos                |
| `psql`             | Consultas y validación de PostgreSQL |
| MinIO Console      | Verificación de objetos              |
| Uptime Kuma        | Disponibilidad                       |
| Dozzle             | Logs                                 |
| Navegadores        | Compatibilidad                       |
| DevTools           | Diseño adaptable y rendimiento       |
| Docker Compose     | Pruebas de infraestructura           |

---

# 10. Datos de prueba

Se crearán usuarios ficticios.

## Administrador

```text
Correo: admin.test@example.com
Rol: ADMIN
Estado: ACTIVE
```

## Usuario estudiante

```text
Correo: estudiante.test@example.com
Rol: USER
Perfil: STUDENT
Estado: ACTIVE
```

## Usuario docente

```text
Correo: docente.test@example.com
Rol: USER
Perfil: TEACHER
Estado: ACTIVE
```

## Cuenta pendiente

```text
Correo: pendiente.test@example.com
Estado: PENDING
```

## Cuenta bloqueada

```text
Correo: bloqueado.test@example.com
Estado: BLOCKED
```

## Cuenta desactivada

```text
Correo: desactivado.test@example.com
Estado: DISABLED
```

Estos datos no deberán utilizar contraseñas reales.

---

# 11. Datos educativos de prueba

Se crearán registros ficticios.

## Curso

```text
Kaqchikel inicial
```

## Nivel

```text
Nivel principiante
```

## Unidad

```text
Saludos y presentaciones
```

## Lecciones

```text
Saludos básicos
Presentación personal
Preguntar el nombre
```

## Vocabulario

```text
Ütz awäch
Matyöx
Achike ab'i'
```

## Evaluación

```text
Evaluación de saludos
```

## Archivos

- Una imagen válida.
- Un audio MP3 válido.
- Un video MP4 corto.
- Un documento PDF.
- Un archivo no permitido.
- Un archivo que exceda el límite.

---

# 12. Estados de un caso de prueba

Cada caso podrá tener uno de los siguientes estados:

| Estado       | Descripción                          |
| ------------ | ------------------------------------ |
| Pendiente    | Todavía no se ha ejecutado           |
| En ejecución | Se está probando                     |
| Aprobado     | Resultado esperado obtenido          |
| Fallido      | Resultado diferente al esperado      |
| Bloqueado    | No puede ejecutarse por otra falla   |
| No aplica    | No corresponde a la versión evaluada |

---

# 13. Prioridad de los casos de prueba

## Crítica

Una falla impide utilizar la plataforma o compromete datos.

Ejemplos:

- No se puede iniciar sesión.
- Un usuario accede como administrador.
- Se pierden datos.
- Se exponen contraseñas.
- No se puede restaurar un respaldo.

## Alta

Una función principal no funciona.

Ejemplos:

- No se puede crear curso.
- No se pueden cargar audios.
- No se calcula progreso.
- No se puede enviar una evaluación.

## Media

La función funciona parcialmente.

Ejemplos:

- Un filtro no responde.
- Un mensaje no es claro.
- Una tabla no se adapta bien.

## Baja

Problema visual o mejora menor.

Ejemplos:

- Espacio incorrecto.
- Texto desalineado.
- Icono inconsistente.

---

# 14. Formato de caso de prueba

Cada caso deberá incluir:

```text
Código
Nombre
Módulo
Requisito relacionado
Prioridad
Precondiciones
Datos de entrada
Pasos
Resultado esperado
Resultado obtenido
Estado
Evidencia
Observaciones
```

Ejemplo:

| Campo              | Valor                 |
| ------------------ | --------------------- |
| Código             | CP-AUTH-001           |
| Nombre             | Registro válido       |
| Módulo             | Autenticación         |
| Prioridad          | Crítica               |
| Precondición       | Correo no registrado  |
| Entrada            | Datos válidos         |
| Resultado esperado | Cuenta PENDING creada |
| Estado             | Pendiente             |

---

# 15. Pruebas de autenticación

## CP-AUTH-001: Registro válido

**Precondiciones:**

- Registro habilitado.
- Correo no utilizado.

**Pasos:**

1. Abrir registro.
2. Completar campos válidos.
3. Enviar formulario.

**Resultado esperado:**

- Respuesta `201`.
- Usuario creado como `USER`.
- Estado `PENDING`.
- Contraseña almacenada como hash.
- Token creado.
- Correo de confirmación registrado.

---

## CP-AUTH-002: Registro con correo duplicado

**Resultado esperado:**

- Respuesta `409`.
- No se crea otro usuario.
- Mensaje comprensible.

---

## CP-AUTH-003: Registro con contraseñas diferentes

**Resultado esperado:**

- Respuesta `400`.
- La cuenta no se crea.
- Se identifica el error.

---

## CP-AUTH-004: Confirmación válida

**Resultado esperado:**

- Cuenta cambia a `ACTIVE`.
- `emailVerifiedAt` contiene una fecha.
- Token queda inutilizado.
- Se registra correo de bienvenida.

---

## CP-AUTH-005: Token expirado

**Resultado esperado:**

- Confirmación rechazada.
- Cuenta continúa pendiente.
- Se permite solicitar otro enlace.

---

## CP-AUTH-006: Inicio de sesión válido

**Resultado esperado:**

- Respuesta `200`.
- Se crea una sesión.
- Se establece cookie `httpOnly`.
- Se actualiza `lastLoginAt`.

---

## CP-AUTH-007: Contraseña incorrecta

**Resultado esperado:**

- Respuesta `401`.
- No se crea sesión.
- No se revela cuál dato es incorrecto.

---

## CP-AUTH-008: Cuenta pendiente

**Resultado esperado:**

- Respuesta `403`.
- No se crea sesión.
- Se informa que debe confirmar el correo.

---

## CP-AUTH-009: Cuenta bloqueada

**Resultado esperado:**

- Respuesta `403`.
- No se crea sesión.

---

## CP-AUTH-010: Cierre de sesión

**Resultado esperado:**

- Sesión invalidada.
- Cookie eliminada o expirada.
- Las rutas privadas responden `401`.

---

## CP-AUTH-011: Recuperación válida

**Resultado esperado:**

- Token creado.
- Correo registrado.
- La respuesta no revela información sensible.

---

## CP-AUTH-012: Restablecimiento válido

**Resultado esperado:**

- Contraseña actualizada.
- Token inutilizado.
- Sesiones anteriores revocadas.

---

## CP-AUTH-013: Rate limiting

**Resultado esperado:**

- Después de varios intentos se responde `429`.
- El servidor continúa estable.

---

# 16. Pruebas de permisos

## CP-PERM-001: Visitante accede a ruta privada

**Resultado esperado:**

```text
401 Unauthorized
```

## CP-PERM-002: USER accede al panel administrativo

**Resultado esperado:**

```text
403 Forbidden
```

## CP-PERM-003: ADMIN accede al panel administrativo

**Resultado esperado:**

- Acceso permitido.
- Respuesta `200`.

## CP-PERM-004: USER consulta progreso ajeno

**Resultado esperado:**

- Acceso rechazado.
- No se entrega información.

## CP-PERM-005: USER modifica su rol desde la solicitud

**Resultado esperado:**

- El campo se ignora o rechaza.
- El rol permanece `USER`.

## CP-PERM-006: Cuenta bloqueada utiliza una sesión anterior

**Resultado esperado:**

- La solicitud es rechazada.
- La sesión deja de ser útil.

---

# 17. Pruebas de usuarios y perfiles

Se comprobará:

- Consulta de perfil propio.
- Edición de nombre.
- Edición de apellidos.
- Cambio de tipo de perfil.
- Carga de avatar válido.
- Rechazo de avatar no permitido.
- Eliminación de avatar.
- Cambio de contraseña.
- Consulta administrativa.
- Búsqueda.
- Filtros.
- Activación.
- Bloqueo.
- Desactivación.

Caso importante:

## CP-USER-001: Administrador intenta bloquearse

**Resultado esperado:**

- Operación rechazada.
- Cuenta administrativa permanece activa.
- Se muestra un mensaje de seguridad.

---

# 18. Pruebas de cursos

Se comprobará:

- Crear curso.
- Editar curso.
- Generar `slug`.
- Evitar `slug` duplicado.
- Cargar portada.
- Publicar.
- Despublicar.
- Archivar.
- Eliminar lógicamente.
- Reordenar.
- Mostrar solo publicados al usuario.
- Mostrar borradores al administrador.
- Vista pública autorizada.

## CP-COURSE-001: Crear curso válido

**Resultado esperado:**

- Curso creado en estado `DRAFT`.
- Se registra el creador.
- Se registra auditoría.

## CP-COURSE-002: Publicar curso incompleto

**Resultado esperado:**

- Publicación rechazada.
- Se indican los campos faltantes.

## CP-COURSE-003: Usuario consulta borrador

**Resultado esperado:**

- Respuesta `404` o `403`.
- El contenido no se muestra.

---

# 19. Pruebas de niveles, unidades y lecciones

Se comprobará:

- Crear nivel.
- Crear unidad.
- Crear lección.
- Editar.
- Eliminar.
- Reordenar.
- Restricción de posiciones.
- Publicación.
- Despublicación.
- Vista previa.
- Acceso de usuario.

## CP-LESSON-001: Crear estructura completa

**Resultado esperado:**

```text
Curso
└── Nivel
    └── Unidad
        └── Lección
```

Cada relación deberá quedar correctamente almacenada.

## CP-LESSON-002: Reordenar lecciones

**Resultado esperado:**

- Se actualizan las posiciones.
- No quedan posiciones duplicadas.

---

# 20. Pruebas de bloques educativos

Se comprobarán bloques de:

- Texto.
- Título.
- Imagen.
- Audio.
- Video.
- Diálogo.
- Ejemplo.
- Nota.
- Vocabulario.
- Documento.
- Evaluación.

## CP-CONTENT-001: Bloque de audio con imagen

**Resultado esperado:**

- La validación rechaza el archivo incorrecto.

## CP-CONTENT-002: Reordenar bloques

**Resultado esperado:**

- La lección se muestra con el nuevo orden.
- No se pierde contenido.

## CP-CONTENT-003: Eliminar bloque

**Resultado esperado:**

- El bloque deja de mostrarse.
- Los demás bloques conservan su información.

---

# 21. Pruebas de vocabulario

Se comprobará:

- Creación.
- Edición.
- Traducción.
- Categoría.
- Variante.
- Audio.
- Imagen.
- Publicación.
- Búsqueda en kaqchikel.
- Búsqueda en español.
- Filtro por categoría.
- Asociación con lecciones.
- Caracteres especiales.

## CP-VOC-001: Guardar caracteres del kaqchikel

**Entrada:**

```text
Ütz awäch
```

**Resultado esperado:**

- Se guarda sin pérdida de caracteres.
- Se muestra correctamente en frontend y base de datos.

---

# 22. Pruebas multimedia

Se comprobará:

- Carga de imagen.
- Carga de audio.
- Carga de video.
- Carga de PDF.
- Rechazo de extensión.
- Rechazo de MIME.
- Rechazo por tamaño.
- Creación de `objectKey`.
- Registro de metadatos.
- Reproducción.
- Descarga.
- Eliminación.
- Verificación de uso.
- Persistencia.

## CP-MEDIA-001: Carga válida

**Resultado esperado:**

- Objeto creado en MinIO.
- Registro creado en PostgreSQL.
- Estado `AVAILABLE`.

## CP-MEDIA-002: MinIO falla durante la carga

**Resultado esperado:**

- No se crea registro como disponible.
- Se devuelve error controlado.
- No queda información inconsistente.

## CP-MEDIA-003: PostgreSQL falla después de cargar

**Resultado esperado:**

- Se intenta eliminar el objeto huérfano.
- Se registra el error.

## CP-MEDIA-004: Eliminar archivo utilizado

**Resultado esperado:**

- Operación bloqueada.
- Se muestran las relaciones.

## CP-MEDIA-005: Reiniciar contenedor MinIO

**Resultado esperado:**

- Los archivos siguen disponibles.

---

# 23. Pruebas de evaluaciones

Se comprobará:

- Crear evaluación.
- Crear preguntas.
- Crear opciones.
- Marcar respuestas correctas.
- Preguntas de audio.
- Preguntas de relación.
- Completar texto.
- Ordenamiento.
- Publicar.
- Iniciar intento.
- Guardar respuestas.
- Enviar.
- Calificar.
- Limitar intentos.
- Consultar resultados.

## CP-QUIZ-001: Iniciar intento

**Resultado esperado:**

- Se crea `QuizAttempt`.
- Estado `IN_PROGRESS`.
- Número de intento correcto.

## CP-QUIZ-002: Enviar evaluación

**Resultado esperado:**

- Se guardan respuestas.
- Se calcula puntuación.
- Se determina aprobación.
- Estado cambia a `GRADED`.

## CP-QUIZ-003: Alcanzar límite de intentos

**Resultado esperado:**

- No se crea otro intento.
- Se informa al usuario.

## CP-QUIZ-004: Usuario intenta ver respuestas correctas antes de enviar

**Resultado esperado:**

- La API no incluye `isCorrect`.
- No se entregan soluciones.

## CP-QUIZ-005: Doble envío

**Resultado esperado:**

- El intento no se califica dos veces.
- No se duplican respuestas.

---

# 24. Pruebas de progreso

Se comprobará:

- Inicio de curso.
- Primer acceso a lección.
- Completar lección.
- Recalcular porcentaje.
- Registrar evaluaciones.
- Completar curso.
- Consultar resumen.
- Consulta administrativa.

## CP-PROGRESS-001: Iniciar curso dos veces

**Resultado esperado:**

- Existe un solo `CourseProgress`.
- La segunda solicitud no crea duplicado.

## CP-PROGRESS-002: Completar una de cuatro lecciones

**Resultado esperado:**

```text
25 %
```

## CP-PROGRESS-003: Completar todas las lecciones

**Resultado esperado:**

- Porcentaje `100`.
- Estado `COMPLETED`.
- Se registra `completedAt`.
- Se genera notificación.

## CP-PROGRESS-004: Despublicar una lección

Se deberá definir y verificar el comportamiento esperado del porcentaje.

Recomendación:

- El progreso se recalcula con base en lecciones publicadas activas.
- El historial de la lección permanece almacenado.

---

# 25. Pruebas de notificaciones y correo

Se comprobará:

- Notificación individual.
- Notificación general.
- Marcar como leída.
- Marcar todas.
- Ocultar.
- Contador de no leídas.
- Correo de confirmación.
- Recuperación.
- Cambio de contraseña.
- Avisos generales.
- Fallo SMTP.
- Reintento.

## CP-NOTIF-001: Notificación general

**Resultado esperado:**

- Se crea una notificación para cada destinatario.
- No se duplican destinatarios.

## CP-NOTIF-002: SMTP no disponible

**Resultado esperado:**

- La plataforma continúa funcionando.
- El correo queda como `FAILED`.
- El error se registra.

---

# 26. Pruebas del panel administrativo

Se comprobará:

- Indicadores.
- Total de usuarios.
- Cursos publicados.
- Lecciones.
- Evaluaciones.
- Archivos.
- Almacenamiento.
- Actividad reciente.
- Accesos directos.
- Filtros.

Los datos mostrados deberán compararse con consultas directas a PostgreSQL.

---

# 27. Pruebas de auditoría

Se comprobará que se registren:

- Inicio administrativo.
- Creación de curso.
- Modificación.
- Publicación.
- Despublicación.
- Eliminación.
- Carga de archivos.
- Bloqueo.
- Configuración.
- Respaldo manual.

## CP-AUDIT-001: Modificar curso

**Resultado esperado:**

- Registro con acción.
- Administrador.
- Recurso.
- Fecha.
- Valores relevantes.

## CP-AUDIT-002: Modificar auditoría desde interfaz

**Resultado esperado:**

- No existe ruta para hacerlo.
- Operación no permitida.

## CP-AUDIT-003: Información sensible

**Resultado esperado:**

- No aparecen contraseñas ni tokens en auditoría.

---

# 28. Pruebas de configuración

Se comprobará:

- Nombre de plataforma.
- Descripción.
- Registro habilitado.
- Registro deshabilitado.
- Límites de archivos.
- Expiración de tokens.
- Información pública.
- Auditoría de cambios.

No deberán poder modificarse desde la interfaz:

- Credenciales de PostgreSQL.
- Credenciales de MinIO.
- Secretos de sesión.
- Credenciales SMTP.
- Tokens de Cloudflare.

---

# 29. Pruebas de base de datos

Se comprobará:

- Restricciones únicas.
- Claves foráneas.
- Campos obligatorios.
- Índices.
- Migraciones.
- Transacciones.
- Eliminación lógica.
- Integridad referencial.
- Persistencia.
- Codificación UTF-8.

## CP-DB-001: Correo duplicado

**Resultado esperado:**

- PostgreSQL rechaza el duplicado.
- La API responde `409`.

## CP-DB-002: Posición duplicada

**Resultado esperado:**

- Se respeta la restricción definida.
- La operación se corrige o rechaza.

## CP-DB-003: Migración

**Resultado esperado:**

- Se aplica sin pérdida de datos.
- Prisma Client funciona correctamente.

---

# 30. Pruebas de transacciones

Se comprobarán procesos que involucran varias operaciones.

## Registro

Si falla la creación del token:

- No deberá quedar una cuenta incompleta sin control.

## Evaluación

Si falla la actualización de progreso:

- Se deberá evitar una calificación parcialmente guardada cuando corresponda.

## Publicación

Si falla la auditoría:

- Se deberá definir si se revierte la publicación o se registra el error posteriormente.

## Multimedia

Si falla PostgreSQL:

- Se eliminará el objeto huérfano cuando sea posible.

---

# 31. Pruebas de seguridad

## Autenticación

- Contraseñas cifradas.
- Tokens cifrados o con hash.
- Sesiones expiradas.
- Sesiones revocadas.
- Cierre de todas las sesiones.

## Autorización

- USER no accede a ADMIN.
- Visitante no accede a privado.
- Propiedad de recursos.
- Cuenta bloqueada rechazada.

## Entrada de datos

- Inyección SQL.
- Contenido HTML o scripts.
- Datos excesivamente largos.
- UUID inválidos.
- JSON incorrecto.
- Campos adicionales no permitidos.

## Archivos

- Archivo ejecutable renombrado.
- MIME incorrecto.
- Extensión doble.
- Archivo vacío.
- Archivo demasiado grande.
- Nombre con caracteres peligrosos.

## Información sensible

- Revisar respuestas.
- Revisar logs.
- Revisar auditoría.
- Revisar errores.
- Revisar repositorio Git.

---

# 32. Pruebas de cookies

Se verificará en producción:

```text
httpOnly = true
secure = true
sameSite = configuración apropiada
```

También se comprobará:

- Expiración.
- Eliminación al cerrar sesión.
- Envío únicamente al dominio correspondiente.
- Rechazo de sesión inválida.
- No acceso mediante JavaScript del navegador.

---

# 33. Pruebas de CORS

Se comprobará:

- Frontend autorizado.
- Origen desconocido rechazado.
- Envío de credenciales.
- Métodos permitidos.
- Encabezados permitidos.
- Producción no acepta `*` junto con credenciales.

---

# 34. Pruebas de rate limiting

Se aplicarán sobre:

- Registro.
- Inicio de sesión.
- Recuperación.
- Reenvío de confirmación.
- Restablecimiento.

Se verificará:

- Respuesta `429`.
- Tiempo de bloqueo.
- Mensaje.
- Registro de advertencia.
- Restablecimiento posterior.

---

# 35. Pruebas de rendimiento

## Objetivos iniciales

- API común: preferentemente menos de un segundo.
- Página interna: respuesta visible en menos de tres segundos bajo condiciones normales.
- Listas paginadas: respuesta estable.
- Audio: inicio sin descargar completamente el archivo.
- Video: reproducción progresiva.

## Pruebas sugeridas

- 10 usuarios concurrentes.
- 25 usuarios concurrentes.
- 50 usuarios concurrentes.
- Consulta de cursos.
- Inicio de sesión.
- Consulta de lecciones.
- Acceso multimedia.
- Envío de evaluaciones.

La carga deberá aumentarse progresivamente.

---

# 36. Pruebas de archivos grandes

Se comprobará:

- Tiempo de carga.
- Indicador de progreso.
- Límite de Nginx.
- Límite de Express.
- Límite de MinIO.
- Tiempo de espera.
- Cancelación.
- Limpieza de archivo parcial.

---

# 37. Pruebas de compatibilidad

Matriz inicial:

| Navegador |         Escritorio |                  Móvil |
| --------- | -----------------: | ---------------------: |
| Chrome    |                 Sí |                     Sí |
| Firefox   |                 Sí | Cuando esté disponible |
| Edge      |                 Sí |         No prioritario |
| Safari    | Cuando sea posible |     Cuando sea posible |

Se probarán:

- Formularios.
- Menús.
- Reproductores.
- Evaluaciones.
- Panel administrativo.
- Carga de archivos.

---

# 38. Pruebas responsive

Se verificará:

- Sidebar ocultable.
- Menú móvil.
- Tarjetas adaptables.
- Formularios en una columna.
- Tablas con desplazamiento controlado.
- Botones táctiles.
- Videos responsivos.
- Textos legibles.
- Ausencia de cortes.
- Ausencia de desbordamiento horizontal.

---

# 39. Pruebas de accesibilidad

Lista inicial:

- Navegar con `Tab`.
- Activar botones con teclado.
- Foco visible.
- Etiquetas de formulario.
- Mensajes de error identificables.
- Contraste.
- Texto alternativo.
- Encabezados en orden.
- Controles multimedia.
- Zoom del navegador al 200 %.

---

# 40. Pruebas de infraestructura

Se comprobará:

- Inicio con `docker compose up`.
- Construcción limpia.
- Redes.
- Nombres de servicios.
- Conexión interna.
- Variables.
- Health checks.
- Reinicio.
- Persistencia.
- Uso de volúmenes.
- Ausencia de puertos públicos innecesarios.

## CP-INFRA-001: Reinicio del servidor

**Resultado esperado:**

- Docker inicia.
- Los servicios se levantan.
- La plataforma vuelve a estar disponible.
- Los datos permanecen.

## CP-INFRA-002: Reconstruir contenedores

**Resultado esperado:**

- Los datos de PostgreSQL y MinIO no se eliminan.

---

# 41. Pruebas de Nginx

Se comprobará:

- `/` dirige al frontend.
- `/api` dirige al backend.
- Encabezados correctos.
- Límite de archivo.
- Tiempos de espera.
- Errores `502`.
- Redirección HTTP a HTTPS cuando corresponda.
- Ocultamiento de información innecesaria del servidor.

---

# 42. Pruebas de Cloudflare Tunnel

Se comprobará:

- Resolución del dominio.
- Conexión HTTPS.
- Túnel activo.
- Reconexión automática.
- Acceso sin abrir puertos públicos.
- Comportamiento ante reinicio.
- Acceso externo desde otra red.

---

# 43. Pruebas de monitoreo

Uptime Kuma deberá detectar:

- API activa.
- API caída.
- Frontend activo.
- Frontend caído.
- Nginx.
- MinIO.
- PostgreSQL cuando se configure un método seguro.

Dozzle deberá mostrar:

- Logs de frontend.
- Logs de backend.
- Logs de Nginx.
- Logs de MinIO.
- Errores.

---

# 44. Pruebas de respaldo

## CP-BACKUP-001: Respaldo de PostgreSQL

**Resultado esperado:**

- Se genera archivo.
- Tiene tamaño válido.
- Incluye fecha.
- El proceso se registra como `SUCCESS`.

## CP-BACKUP-002: Respaldo de MinIO

**Resultado esperado:**

- Los objetos se copian.
- Se conserva estructura.
- Se registra el resultado.

## CP-BACKUP-003: Falta de espacio

**Resultado esperado:**

- El respaldo falla de forma controlada.
- Se registra el error.
- Se genera alerta cuando corresponda.

## CP-BACKUP-004: Política de retención

**Resultado esperado:**

- Se conservan las cantidades definidas.
- Se eliminan respaldos antiguos sin afectar los recientes.

---

# 45. Pruebas de restauración

## PostgreSQL

1. Crear datos de prueba.
2. Ejecutar respaldo.
3. Eliminar la base de prueba.
4. Crear una base vacía.
5. Restaurar.
6. Verificar usuarios, cursos y progreso.

## MinIO

1. Cargar archivos de prueba.
2. Ejecutar respaldo.
3. Eliminar los archivos del entorno de prueba.
4. Restaurar.
5. Verificar reproducción y descarga.

## Resultado esperado

- La información restaurada coincide con la original.
- Las relaciones funcionan.
- La plataforma vuelve a operar.

---

# 46. Pruebas de regresión

Después de agregar o modificar una función se deberán repetir pruebas relacionadas.

Ejemplos:

## Cambio en autenticación

Repetir:

- Registro.
- Confirmación.
- Inicio.
- Cierre.
- Recuperación.
- Permisos.

## Cambio en cursos

Repetir:

- Creación.
- Publicación.
- Estructura.
- Progreso.
- Visualización.

## Cambio en evaluaciones

Repetir:

- Preguntas.
- Intentos.
- Calificación.
- Progreso.
- Resultados.

---

# 47. Automatización de pruebas

Se automatizarán prioritariamente:

- Validaciones.
- Servicios críticos.
- Rutas de autenticación.
- Permisos.
- Cursos.
- Evaluaciones.
- Progreso.
- Flujos principales con Playwright.

Comandos conceptuales:

```text
npm run test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:coverage
```

---

# 48. Cobertura de pruebas

No se buscará un porcentaje artificial, sino cubrir la lógica crítica.

Prioridad de cobertura:

1. Autenticación.
2. Permisos.
3. Calificación.
4. Progreso.
5. Transacciones.
6. Multimedia.
7. Publicación.
8. Respaldos.

Como referencia inicial, se podrá establecer una cobertura mínima del 70 % para la lógica de negocio crítica.

---

# 49. Evidencias de pruebas

Las evidencias podrán incluir:

- Capturas de pantalla.
- Resultados de Playwright.
- Reportes de Vitest.
- Respuestas de Postman.
- Logs.
- Consultas de PostgreSQL.
- Capturas de MinIO.
- Historial de Uptime Kuma.
- Archivos de respaldo.
- Videos cortos de funcionamiento.
- Registros de incidencias.

Las evidencias deberán organizarse por módulo o entrega.

Ejemplo:

```text
docs/evidencias/
├── autenticacion/
├── usuarios/
├── cursos/
├── multimedia/
├── evaluaciones/
├── progreso/
├── seguridad/
├── respaldos/
└── despliegue/
```

---

# 50. Registro de errores

Cada error deberá registrar:

| Campo     | Descripción                             |
| --------- | --------------------------------------- |
| Código    | Identificador                           |
| Título    | Descripción breve                       |
| Módulo    | Área afectada                           |
| Prioridad | Crítica, alta, media o baja             |
| Entorno   | Desarrollo, pruebas o producción        |
| Pasos     | Forma de reproducir                     |
| Esperado  | Resultado correcto                      |
| Obtenido  | Resultado observado                     |
| Evidencia | Captura o log                           |
| Estado    | Abierto, en proceso, corregido, cerrado |
| Versión   | Versión afectada                        |

---

# 51. Ciclo de vida de un error

```text
Detectado
   ↓
Registrado
   ↓
Clasificado
   ↓
Asignado
   ↓
Corregido
   ↓
Reprobado
   ↓
Cerrado
```

Si la corrección no funciona:

```text
Reabierto
```

---

# 52. Criterios de entrada para pruebas

Una función podrá entrar a pruebas cuando:

1. El código compile.

2. Las migraciones estén aplicadas.

3. Las dependencias funcionen.

4. Existan datos de prueba.

5. La función esté integrada.

6. No existan errores que impidan iniciar el sistema.

7. El requisito esté definido.

---

# 53. Criterios de salida

Una función se considerará terminada cuando:

1. Cumpla el requisito.

2. Pase las pruebas críticas.

3. Pase las pruebas de permisos.

4. No presente errores críticos o altos abiertos.

5. Los datos se almacenen correctamente.

6. Los errores se manejen de forma comprensible.

7. Exista evidencia.

8. La documentación esté actualizada.

---

# 54. Criterios para liberar la versión 1

La versión 1 podrá publicarse cuando:

- Registro funcione.
- Confirmación funcione.
- Inicio y cierre funcionen.
- Recuperación funcione.
- Roles estén protegidos.
- Usuarios puedan consultar cursos.
- Administrador pueda crear contenido.
- Multimedia funcione.
- Evaluaciones funcionen.
- Progreso funcione.
- Respaldos funcionen.
- Restauración haya sido probada.
- El dominio utilice HTTPS.
- PostgreSQL y MinIO no estén expuestos.
- El diseño móvil sea funcional.
- No existan fallos críticos conocidos.
- La documentación básica esté terminada.

---

# 55. Pruebas de aceptación del usuario

Las pruebas de aceptación deberán demostrar procesos completos.

## PA-001: Registro y acceso

1. Registrar una cuenta.
2. Confirmar correo.
3. Iniciar sesión.
4. Acceder al dashboard.

## PA-002: Aprendizaje

1. Consultar curso.
2. Iniciar curso.
3. Abrir lección.
4. Reproducir audio.
5. Completar lección.
6. Consultar progreso.

## PA-003: Evaluación

1. Abrir evaluación.
2. Responder.
3. Enviar.
4. Ver puntuación.
5. Confirmar progreso.

## PA-004: Administración de contenido

1. Iniciar como administrador.
2. Crear curso.
3. Crear nivel.
4. Crear unidad.
5. Crear lección.
6. Cargar audio.
7. Publicar.
8. Verificar como usuario.

## PA-005: Recuperación

1. Ejecutar respaldo.
2. Restaurar en entorno de pruebas.
3. Verificar datos y archivos.

---

# 56. Matriz resumida de pruebas

| Área            | Tipo principal                          |
| --------------- | --------------------------------------- |
| Autenticación   | Unitarias, API, E2E, seguridad          |
| Usuarios        | API, funcionales, permisos              |
| Cursos          | Integración, funcionales, E2E           |
| Lecciones       | Integración, funcionales                |
| Multimedia      | Integración, rendimiento, persistencia  |
| Vocabulario     | Funcionales, compatibilidad lingüística |
| Evaluaciones    | Unitarias, integración, E2E             |
| Progreso        | Unitarias, integración                  |
| Notificaciones  | Integración, fallos externos            |
| Auditoría       | Integración, seguridad                  |
| Infraestructura | Despliegue, persistencia                |
| Respaldos       | Recuperación                            |
| Frontend        | Responsive, accesibilidad               |
| API             | Seguridad, rendimiento                  |

---

# 57. Relación con requisitos

Cada caso de prueba deberá relacionarse con:

```text
RF
RNF
CU
MOD
Endpoint
```

Ejemplo:

| Elemento       | Relación                   |
| -------------- | -------------------------- |
| Caso de prueba | CP-AUTH-001                |
| Requisito      | RF-001 a RF-013            |
| Caso de uso    | CU-001                     |
| Módulo         | MOD-01                     |
| Endpoint       | POST /api/v1/auth/register |

Esto facilitará la trazabilidad del proyecto.

---

# 58. Trazabilidad

En una etapa posterior se creará una matriz con el formato:

| Requisito | Caso de uso | Endpoint                          | Caso de prueba | Estado    |
| --------- | ----------- | --------------------------------- | -------------- | --------- |
| RF-001    | CU-001      | POST `/auth/register`             | CP-AUTH-001    | Pendiente |
| RF-024    | CU-004      | POST `/auth/login`                | CP-AUTH-006    | Pendiente |
| RF-085    | CU-029      | POST `/admin/courses/:id/publish` | CP-COURSE-002  | Pendiente |

Esta matriz permitirá demostrar el cumplimiento de los requisitos.

---

# 59. Plan progresivo de pruebas

## Fase 1: infraestructura básica

- Docker.
- PostgreSQL.
- Prisma.
- Backend.
- Frontend.
- Health checks.

## Fase 2: autenticación

- Registro.
- Confirmación.
- Inicio.
- Sesiones.
- Recuperación.
- Permisos.

## Fase 3: contenido

- Cursos.
- Niveles.
- Unidades.
- Lecciones.
- Bloques.

## Fase 4: multimedia

- MinIO.
- Cargas.
- Reproducción.
- Persistencia.

## Fase 5: aprendizaje

- Evaluaciones.
- Calificación.
- Progreso.
- Notificaciones.

## Fase 6: operación

- Reportes.
- Auditoría.
- Monitoreo.
- Respaldos.
- Restauración.

## Fase 7: aceptación

- Flujos completos.
- Compatibilidad.
- Responsive.
- Seguridad.
- Despliegue final.

---

# 60. Distribución aproximada durante los diez meses

## Meses 1 y 2

- Infraestructura inicial.
- Base de datos.
- Autenticación.
- Pruebas unitarias y de API.

## Meses 3 y 4

- Usuarios.
- Cursos.
- Niveles.
- Unidades.
- Lecciones.

## Meses 5 y 6

- Multimedia.
- Vocabulario.
- Editor de contenido.

## Meses 7 y 8

- Evaluaciones.
- Progreso.
- Notificaciones.

## Mes 9

- Panel administrativo.
- Auditoría.
- Reportes.
- Respaldos.

## Mes 10

- Seguridad.
- Rendimiento.
- Compatibilidad.
- Correcciones.
- Documentación.
- Aceptación.
- Despliegue.

Esta distribución podrá ajustarse según el avance real.

---

# 61. Responsabilidad de las pruebas

Durante la versión 1, el responsable principal será el desarrollador del proyecto.

También podrán participar:

- Representante institucional.
- Personal de DIGEBI.
- Docentes.
- Usuarios seleccionados.
- Revisor universitario.

El desarrollador realizará:

- Pruebas técnicas.
- Pruebas automatizadas.
- Pruebas de integración.
- Corrección de errores.
- Documentación de evidencias.

Los usuarios institucionales podrán apoyar en:

- Validación de contenido.
- Usabilidad.
- Flujo educativo.
- Comprensión de instrucciones.
- Aceptación final.

---

# 62. Riesgos del proceso de pruebas

## Falta de usuarios de prueba

Mitigación:

- Utilizar cuentas ficticias.
- Solicitar validación institucional en etapas.

## Falta de tiempo

Mitigación:

- Priorizar pruebas críticas.
- Automatizar flujos repetitivos.
- Probar durante el desarrollo.

## Dependencia del correo

Mitigación:

- Utilizar SMTP de pruebas.
- Simular envíos.

## Dependencia del servidor

Mitigación:

- Mantener entorno local.
- Documentar despliegue.

## Archivos multimedia grandes

Mitigación:

- Utilizar muestras pequeñas durante desarrollo.
- Probar archivos grandes en una etapa controlada.

---

# 63. Criterios de aceptación del plan

El plan de pruebas se considerará adecuado cuando:

1. Cubra todos los módulos principales.

2. Incluya pruebas funcionales y no funcionales.

3. Incluya permisos y seguridad.

4. Incluya PostgreSQL y MinIO.

5. Incluya respaldos y restauración.

6. Incluya pruebas responsive.

7. Incluya herramientas definidas.

8. Establezca prioridades.

9. Defina evidencias.

10. Permita relacionar requisitos y resultados.

---

# 64. Decisiones adoptadas

Para la versión 1 se establecen las siguientes decisiones:

- Vitest se utilizará para pruebas unitarias.
- Supertest podrá utilizarse para la API.
- Playwright se utilizará para flujos E2E.
- Las pruebas se ejecutarán durante todo el desarrollo.
- Se utilizará una base de datos separada para pruebas.
- No se utilizarán datos reales en pruebas automatizadas.
- Las pruebas críticas deberán automatizarse.
- Las pruebas visuales y de aceptación podrán ser manuales.
- La restauración deberá probarse antes del despliegue final.
- Los errores críticos impedirán publicar la versión.
- Cada evidencia deberá relacionarse con un requisito o caso de uso.

---

# 65. Próximos pasos

Después de aprobar este documento se deberá:

1. Crear la matriz de trazabilidad.

2. Crear el repositorio de GitHub.

3. Crear la estructura del monorepositorio.

4. Crear los proyectos Next.js y Express.

5. Configurar TypeScript.

6. Configurar Docker Compose.

7. Configurar PostgreSQL.

8. Configurar Prisma.

9. Crear los endpoints `/api/v1/health`.

10. Preparar las primeras pruebas automatizadas.

---

# 66. Aprobación del documento

| Responsable | Cargo o función             | Firma | Fecha |
| ----------- | --------------------------- | ----- | ----- |
|             | Responsable del proyecto    |       |       |
|             | Representante institucional |       |       |
|             | Revisor                     |       |       |
