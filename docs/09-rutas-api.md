# Rutas de la API

## Plataforma web para el aprendizaje del idioma kaqchikel

**Institución:** Dirección General de Educación Bilingüe Intercultural —DIGEBI—, Ministerio de Educación de Guatemala
**Nombre del proyecto:** Plataforma web para el aprendizaje del idioma kaqchikel
**Versión del documento:** 1.0
**Versión del sistema:** Versión 1
**Estado:** Diseño inicial
**Fecha:** Junio de 2026

---

## 1. Introducción

El presente documento define las rutas iniciales de la API REST para la primera versión de la plataforma web para el aprendizaje del idioma kaqchikel.

La API será desarrollada con:

- Node.js.
- Express.
- TypeScript.
- Prisma ORM.
- PostgreSQL.
- Zod.
- Cookies `httpOnly`.
- Control de roles.
- MinIO para archivos multimedia.

Las rutas permitirán la comunicación entre el frontend desarrollado en Next.js y el backend Express.

---

## 2. Objetivo del documento

Definir de forma ordenada:

- Métodos HTTP.
- Direcciones de los endpoints.
- Permisos requeridos.
- Parámetros.
- Cuerpos de solicitud.
- Respuestas.
- Códigos HTTP.
- Reglas de validación.
- Formato de errores.
- Relación con los módulos del sistema.

Este documento servirá como base para:

- Crear los archivos de rutas de Express.
- Implementar controladores.
- Implementar servicios.
- Definir esquemas de validación.
- Desarrollar el cliente de API del frontend.
- Elaborar pruebas de integración.
- Documentar la API.

---

# 3. Dirección base

Durante el desarrollo, la API podrá utilizar una dirección similar a:

```text
http://localhost:4000/api
```

En producción, la API será accesible mediante el dominio principal:

```text
https://dominio-institucional.gt/api
```

Todas las rutas descritas en este documento partirán de:

```text
/api
```

---

# 4. Convenciones generales

## 4.1 Formato de rutas

Las rutas utilizarán nombres en plural.

Ejemplos:

```text
/api/users
/api/courses
/api/lessons
/api/quizzes
```

## 4.2 Identificadores

Los recursos utilizarán UUID.

Ejemplo:

```text
/api/courses/7de05f79-21eb-4a2c-bd75-899a63fbb843
```

## 4.3 Formato de datos

Las solicitudes y respuestas utilizarán principalmente:

```text
application/json
```

Las cargas de archivos utilizarán:

```text
multipart/form-data
```

## 4.4 Fechas

Las fechas serán enviadas en formato ISO 8601.

Ejemplo:

```text
2026-06-29T18:30:00.000Z
```

## 4.5 Zona horaria

La base de datos almacenará las fechas en UTC.

El frontend mostrará las fechas según la zona horaria del usuario o la configuración de la plataforma.

---

# 5. Métodos HTTP

| Método | Uso                                                    |
| ------ | ------------------------------------------------------ |
| GET    | Consultar información                                  |
| POST   | Crear recursos o ejecutar procesos                     |
| PATCH  | Modificar parcialmente un recurso                      |
| PUT    | Reemplazar completamente un recurso cuando corresponda |
| DELETE | Eliminar o desactivar un recurso                       |

Para la mayoría de actualizaciones se utilizará `PATCH`.

---

# 6. Niveles de acceso

Las rutas se clasificarán en tres niveles.

## 6.1 Rutas públicas

No requieren sesión.

Ejemplos:

- Registro.
- Inicio de sesión.
- Confirmación.
- Recuperación de contraseña.
- Información pública.

## 6.2 Rutas autenticadas

Requieren una sesión válida con rol `USER` o `ADMIN`.

Ejemplos:

- Perfil.
- Cursos.
- Progreso.
- Evaluaciones.
- Notificaciones.

## 6.3 Rutas administrativas

Requieren:

```text
role = ADMIN
```

Ejemplos:

- Crear cursos.
- Administrar usuarios.
- Cargar multimedia.
- Publicar contenido.
- Consultar auditoría.

---

# 7. Formato de respuesta exitosa

## Recurso individual

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Ejemplo"
  }
}
```

## Lista

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 100,
    "totalPages": 5
  }
}
```

## Operación sin contenido adicional

```json
{
  "success": true,
  "message": "Operación realizada correctamente."
}
```

---

# 8. Formato de error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Los datos enviados no son válidos.",
    "details": [
      {
        "field": "email",
        "message": "El correo electrónico no es válido."
      }
    ]
  }
}
```

---

# 9. Códigos HTTP

| Código | Significado                                        |
| -----: | -------------------------------------------------- |
|    200 | Operación exitosa                                  |
|    201 | Recurso creado                                     |
|    204 | Operación exitosa sin contenido                    |
|    400 | Datos inválidos                                    |
|    401 | Autenticación requerida                            |
|    403 | Permisos insuficientes                             |
|    404 | Recurso no encontrado                              |
|    409 | Conflicto de datos                                 |
|    413 | Archivo demasiado grande                           |
|    415 | Tipo de archivo no permitido                       |
|    422 | Datos válidos sintácticamente, pero no procesables |
|    429 | Demasiadas solicitudes                             |
|    500 | Error interno                                      |
|    503 | Servicio temporalmente no disponible               |

---

# 10. Paginación

Las listas utilizarán parámetros de consulta.

Ejemplo:

```text
GET /api/courses?page=1&pageSize=20
```

Parámetros:

| Parámetro | Tipo   | Descripción           |
| --------- | ------ | --------------------- |
| page      | Entero | Página solicitada     |
| pageSize  | Entero | Registros por página  |
| search    | Texto  | Búsqueda              |
| sortBy    | Texto  | Campo de ordenamiento |
| sortOrder | Texto  | `asc` o `desc`        |

Valores recomendados:

```text
page = 1
pageSize = 20
pageSize máximo = 100
```

---

# 11. Rutas de estado del sistema

## GET `/api/health`

**Acceso:** Público.

**Propósito:** Comprobar que la API está activa.

Respuesta:

```json
{
  "status": "ok",
  "service": "api",
  "timestamp": "2026-06-29T18:30:00.000Z"
}
```

---

## GET `/api/status`

**Acceso:** Administrador.

**Propósito:** Consultar el estado ampliado de los servicios.

Respuesta conceptual:

```json
{
  "success": true,
  "data": {
    "api": "available",
    "database": "available",
    "storage": "available",
    "email": "available"
  }
}
```

La respuesta no deberá exponer contraseñas, direcciones internas ni secretos.

---

# 12. Rutas de autenticación

Ruta base:

```text
/api/auth
```

---

## POST `/api/auth/register`

**Acceso:** Público.

**Propósito:** Registrar una nueva cuenta.

Cuerpo:

```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@example.com",
  "password": "ContraseñaSegura123!",
  "passwordConfirmation": "ContraseñaSegura123!",
  "profileType": "STUDENT"
}
```

Respuesta:

```text
201 Created
```

Posibles errores:

- `400`: datos inválidos.
- `409`: correo ya registrado.
- `429`: demasiados intentos.

---

## POST `/api/auth/verify-email`

**Acceso:** Público.

**Propósito:** Confirmar el correo mediante un token.

Cuerpo:

```json
{
  "token": "token-recibido-por-correo"
}
```

Respuesta:

```text
200 OK
```

---

## POST `/api/auth/resend-verification`

**Acceso:** Público.

**Propósito:** Solicitar un nuevo correo de confirmación.

Cuerpo:

```json
{
  "email": "juan@example.com"
}
```

Respuesta general:

```json
{
  "success": true,
  "message": "Si la cuenta requiere confirmación, se enviará un nuevo correo."
}
```

---

## POST `/api/auth/login`

**Acceso:** Público.

**Propósito:** Iniciar sesión.

Cuerpo:

```json
{
  "email": "juan@example.com",
  "password": "ContraseñaSegura123!"
}
```

Respuesta:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "juan@example.com",
      "role": "USER",
      "profileType": "STUDENT"
    }
  }
}
```

La cookie de sesión se enviará mediante el encabezado correspondiente.

Posibles errores:

- `401`: credenciales incorrectas.
- `403`: cuenta pendiente, bloqueada o desactivada.
- `429`: demasiados intentos.

---

## POST `/api/auth/logout`

**Acceso:** Autenticado.

**Propósito:** Cerrar la sesión actual.

Respuesta:

```text
200 OK
```

---

## POST `/api/auth/logout-all`

**Acceso:** Autenticado.

**Propósito:** Cerrar todas las sesiones del usuario.

Respuesta:

```text
200 OK
```

---

## GET `/api/auth/session`

**Acceso:** Autenticado.

**Propósito:** Consultar la sesión y el usuario actual.

Respuesta:

```json
{
  "success": true,
  "data": {
    "authenticated": true,
    "user": {
      "id": "uuid",
      "role": "USER"
    }
  }
}
```

---

## POST `/api/auth/forgot-password`

**Acceso:** Público.

**Propósito:** Solicitar recuperación de contraseña.

Cuerpo:

```json
{
  "email": "juan@example.com"
}
```

La respuesta deberá ser general para evitar revelar si una cuenta existe.

---

## POST `/api/auth/reset-password`

**Acceso:** Público.

**Propósito:** Restablecer la contraseña.

Cuerpo:

```json
{
  "token": "token-de-recuperacion",
  "password": "NuevaContraseña123!",
  "passwordConfirmation": "NuevaContraseña123!"
}
```

---

## POST `/api/auth/change-password`

**Acceso:** Autenticado.

**Propósito:** Cambiar la contraseña desde una sesión activa.

Cuerpo:

```json
{
  "currentPassword": "ContraseñaActual123!",
  "newPassword": "NuevaContraseña123!",
  "newPasswordConfirmation": "NuevaContraseña123!"
}
```

---

# 13. Rutas del perfil propio

Ruta base:

```text
/api/users/me
```

---

## GET `/api/users/me`

**Acceso:** Autenticado.

**Propósito:** Consultar el perfil propio.

---

## PATCH `/api/users/me`

**Acceso:** Autenticado.

**Propósito:** Actualizar datos personales.

Cuerpo:

```json
{
  "firstName": "Juan Carlos",
  "lastName": "Pérez López",
  "profileType": "TEACHER"
}
```

El usuario no podrá modificar:

- Rol.
- Estado de cuenta.
- Correo confirmado.
- Fecha de registro.

---

## POST `/api/users/me/avatar`

**Acceso:** Autenticado.

**Tipo:** `multipart/form-data`.

**Propósito:** Cargar o cambiar la fotografía de perfil.

Campo:

```text
file
```

---

## DELETE `/api/users/me/avatar`

**Acceso:** Autenticado.

**Propósito:** Eliminar la fotografía de perfil.

---

## GET `/api/users/me/sessions`

**Acceso:** Autenticado.

**Propósito:** Consultar las sesiones activas propias.

---

## DELETE `/api/users/me/sessions/:sessionId`

**Acceso:** Autenticado.

**Propósito:** Cerrar una sesión específica.

---

# 14. Rutas administrativas de usuarios

Ruta base:

```text
/api/admin/users
```

---

## GET `/api/admin/users`

**Acceso:** Administrador.

**Propósito:** Consultar usuarios.

Parámetros:

```text
page
pageSize
search
role
profileType
status
sortBy
sortOrder
```

---

## GET `/api/admin/users/:userId`

**Acceso:** Administrador.

**Propósito:** Consultar el detalle de un usuario.

---

## PATCH `/api/admin/users/:userId/status`

**Acceso:** Administrador.

**Propósito:** Modificar el estado de una cuenta.

Cuerpo:

```json
{
  "status": "BLOCKED",
  "reason": "Actividad no autorizada."
}
```

Estados permitidos:

```text
ACTIVE
BLOCKED
DISABLED
```

El administrador no deberá poder bloquear o desactivar accidentalmente su propia cuenta.

---

## GET `/api/admin/users/:userId/progress`

**Acceso:** Administrador.

**Propósito:** Consultar el progreso de un usuario.

---

## GET `/api/admin/users/:userId/attempts`

**Acceso:** Administrador.

**Propósito:** Consultar intentos de evaluación.

---

# 15. Rutas públicas de cursos

Ruta base:

```text
/api/public/courses
```

---

## GET `/api/public/courses`

**Acceso:** Público.

**Propósito:** Consultar cursos con vista pública habilitada.

---

## GET `/api/public/courses/:slug`

**Acceso:** Público.

**Propósito:** Consultar información pública de un curso.

No deberá incluir contenido privado ni lecciones no autorizadas.

---

# 16. Rutas de cursos para usuarios

Ruta base:

```text
/api/courses
```

---

## GET `/api/courses`

**Acceso:** Autenticado.

**Propósito:** Consultar cursos publicados.

Parámetros:

```text
page
pageSize
search
difficulty
sortBy
sortOrder
```

---

## GET `/api/courses/:courseId`

**Acceso:** Autenticado.

**Propósito:** Consultar el detalle de un curso publicado.

---

## GET `/api/courses/:courseId/structure`

**Acceso:** Autenticado.

**Propósito:** Consultar niveles, unidades y lecciones publicadas.

---

## POST `/api/courses/:courseId/start`

**Acceso:** Autenticado.

**Propósito:** Iniciar un curso.

Respuesta:

```text
201 Created
```

Si el progreso ya existe, podrá responder:

```text
200 OK
```

---

## GET `/api/courses/:courseId/progress`

**Acceso:** Autenticado.

**Propósito:** Consultar el progreso propio dentro del curso.

---

# 17. Rutas administrativas de cursos

Ruta base:

```text
/api/admin/courses
```

---

## GET `/api/admin/courses`

**Acceso:** Administrador.

**Propósito:** Consultar todos los cursos, incluyendo borradores y archivados.

---

## POST `/api/admin/courses`

**Acceso:** Administrador.

**Propósito:** Crear un curso.

Cuerpo:

```json
{
  "title": "Kaqchikel inicial",
  "description": "Curso introductorio.",
  "objectives": "Desarrollar vocabulario básico.",
  "difficulty": "BEGINNER",
  "position": 1,
  "isPublicPreview": true,
  "coverMediaId": "uuid-opcional"
}
```

---

## GET `/api/admin/courses/:courseId`

**Acceso:** Administrador.

**Propósito:** Consultar un curso sin importar su estado.

---

## PATCH `/api/admin/courses/:courseId`

**Acceso:** Administrador.

**Propósito:** Actualizar un curso.

---

## DELETE `/api/admin/courses/:courseId`

**Acceso:** Administrador.

**Propósito:** Eliminar lógicamente o archivar un curso.

La ruta deberá verificar:

- Progreso relacionado.
- Lecciones.
- Evaluaciones.
- Estado actual.

---

## POST `/api/admin/courses/:courseId/publish`

**Acceso:** Administrador.

**Propósito:** Publicar un curso.

---

## POST `/api/admin/courses/:courseId/unpublish`

**Acceso:** Administrador.

**Propósito:** Despublicar un curso.

---

## POST `/api/admin/courses/:courseId/archive`

**Acceso:** Administrador.

**Propósito:** Archivar un curso.

---

## PATCH `/api/admin/courses/reorder`

**Acceso:** Administrador.

**Propósito:** Cambiar el orden de varios cursos.

Cuerpo:

```json
{
  "items": [
    {
      "id": "uuid-curso-1",
      "position": 1
    },
    {
      "id": "uuid-curso-2",
      "position": 2
    }
  ]
}
```

---

# 18. Rutas administrativas de niveles

Ruta base:

```text
/api/admin/courses/:courseId/levels
```

---

## GET `/api/admin/courses/:courseId/levels`

**Acceso:** Administrador.

**Propósito:** Consultar los niveles de un curso.

---

## POST `/api/admin/courses/:courseId/levels`

**Acceso:** Administrador.

**Propósito:** Crear un nivel.

Cuerpo:

```json
{
  "title": "Nivel principiante",
  "description": "Contenido introductorio.",
  "position": 1
}
```

---

## PATCH `/api/admin/levels/:levelId`

**Acceso:** Administrador.

**Propósito:** Actualizar un nivel.

---

## DELETE `/api/admin/levels/:levelId`

**Acceso:** Administrador.

**Propósito:** Eliminar un nivel cuando sea permitido.

---

## PATCH `/api/admin/courses/:courseId/levels/reorder`

**Acceso:** Administrador.

**Propósito:** Reordenar niveles.

---

# 19. Rutas administrativas de unidades

Ruta base:

```text
/api/admin/levels/:levelId/units
```

---

## GET `/api/admin/levels/:levelId/units`

**Acceso:** Administrador.

**Propósito:** Consultar unidades.

---

## POST `/api/admin/levels/:levelId/units`

**Acceso:** Administrador.

**Propósito:** Crear una unidad.

Cuerpo:

```json
{
  "title": "Saludos y presentaciones",
  "description": "Primera unidad.",
  "position": 1
}
```

---

## PATCH `/api/admin/units/:unitId`

**Acceso:** Administrador.

**Propósito:** Actualizar una unidad.

---

## DELETE `/api/admin/units/:unitId`

**Acceso:** Administrador.

**Propósito:** Eliminar una unidad cuando sea permitido.

---

## PATCH `/api/admin/levels/:levelId/units/reorder`

**Acceso:** Administrador.

**Propósito:** Reordenar unidades.

---

# 20. Rutas de lecciones para usuarios

Ruta base:

```text
/api/lessons
```

---

## GET `/api/lessons/:lessonId`

**Acceso:** Autenticado.

**Propósito:** Consultar una lección publicada.

La respuesta podrá incluir:

- Información de la lección.
- Bloques ordenados.
- Archivos autorizados.
- Vocabulario relacionado.
- Evaluaciones relacionadas.
- Estado de progreso propio.

---

## POST `/api/lessons/:lessonId/access`

**Acceso:** Autenticado.

**Propósito:** Registrar acceso a una lección.

Puede ejecutarse automáticamente al abrir la lección.

---

## POST `/api/lessons/:lessonId/complete`

**Acceso:** Autenticado.

**Propósito:** Marcar una lección como completada.

---

# 21. Rutas administrativas de lecciones

Ruta base:

```text
/api/admin/units/:unitId/lessons
```

---

## GET `/api/admin/units/:unitId/lessons`

**Acceso:** Administrador.

**Propósito:** Consultar lecciones de una unidad.

---

## POST `/api/admin/units/:unitId/lessons`

**Acceso:** Administrador.

**Propósito:** Crear una lección.

Cuerpo:

```json
{
  "title": "Saludos básicos",
  "slug": "saludos-basicos",
  "description": "Introducción a los saludos.",
  "position": 1,
  "estimatedMinutes": 20
}
```

---

## GET `/api/admin/lessons/:lessonId`

**Acceso:** Administrador.

**Propósito:** Consultar una lección, incluyendo borradores.

---

## PATCH `/api/admin/lessons/:lessonId`

**Acceso:** Administrador.

**Propósito:** Actualizar una lección.

---

## DELETE `/api/admin/lessons/:lessonId`

**Acceso:** Administrador.

**Propósito:** Eliminar lógicamente una lección.

---

## POST `/api/admin/lessons/:lessonId/publish`

**Acceso:** Administrador.

**Propósito:** Publicar una lección.

---

## POST `/api/admin/lessons/:lessonId/unpublish`

**Acceso:** Administrador.

**Propósito:** Despublicar una lección.

---

## GET `/api/admin/lessons/:lessonId/preview`

**Acceso:** Administrador.

**Propósito:** Obtener la vista previa completa.

---

## PATCH `/api/admin/units/:unitId/lessons/reorder`

**Acceso:** Administrador.

**Propósito:** Reordenar lecciones.

---

# 22. Rutas de bloques de contenido

Ruta base:

```text
/api/admin/lessons/:lessonId/blocks
```

---

## GET `/api/admin/lessons/:lessonId/blocks`

**Acceso:** Administrador.

**Propósito:** Consultar bloques.

---

## POST `/api/admin/lessons/:lessonId/blocks`

**Acceso:** Administrador.

**Propósito:** Crear un bloque.

Ejemplo de texto:

```json
{
  "type": "TEXT",
  "position": 1,
  "textContent": "Contenido introductorio."
}
```

Ejemplo de audio:

```json
{
  "type": "AUDIO",
  "position": 2,
  "title": "Pronunciación",
  "mediaFileId": "uuid-audio",
  "metadata": {
    "showCaption": true,
    "autoplay": false
  }
}
```

---

## GET `/api/admin/blocks/:blockId`

**Acceso:** Administrador.

**Propósito:** Consultar un bloque.

---

## PATCH `/api/admin/blocks/:blockId`

**Acceso:** Administrador.

**Propósito:** Modificar un bloque.

---

## DELETE `/api/admin/blocks/:blockId`

**Acceso:** Administrador.

**Propósito:** Eliminar un bloque.

---

## PATCH `/api/admin/lessons/:lessonId/blocks/reorder`

**Acceso:** Administrador.

**Propósito:** Cambiar el orden de los bloques.

---

# 23. Rutas de vocabulario para usuarios

Ruta base:

```text
/api/vocabulary
```

---

## GET `/api/vocabulary`

**Acceso:** Autenticado.

**Propósito:** Consultar vocabulario publicado.

Parámetros:

```text
page
pageSize
search
categoryId
variantId
sortBy
sortOrder
```

---

## GET `/api/vocabulary/:vocabularyId`

**Acceso:** Autenticado.

**Propósito:** Consultar una entrada.

---

## GET `/api/vocabulary/categories`

**Acceso:** Autenticado.

**Propósito:** Consultar categorías activas.

---

## GET `/api/vocabulary/variants`

**Acceso:** Autenticado.

**Propósito:** Consultar variantes lingüísticas activas.

---

# 24. Rutas administrativas de vocabulario

Ruta base:

```text
/api/admin/vocabulary
```

---

## GET `/api/admin/vocabulary`

**Acceso:** Administrador.

**Propósito:** Consultar todas las entradas.

---

## POST `/api/admin/vocabulary`

**Acceso:** Administrador.

**Propósito:** Crear una entrada.

Cuerpo:

```json
{
  "termKaqchikel": "Ütz awäch",
  "translationSpanish": "¿Cómo estás?",
  "description": "Expresión de saludo.",
  "exampleKaqchikel": "Ütz awäch, a Juan.",
  "exampleSpanish": "¿Cómo estás, Juan?",
  "categoryId": "uuid-opcional",
  "variantId": "uuid-opcional",
  "pronunciationMediaId": "uuid-opcional",
  "imageMediaId": "uuid-opcional"
}
```

---

## GET `/api/admin/vocabulary/:vocabularyId`

**Acceso:** Administrador.

---

## PATCH `/api/admin/vocabulary/:vocabularyId`

**Acceso:** Administrador.

---

## DELETE `/api/admin/vocabulary/:vocabularyId`

**Acceso:** Administrador.

---

## POST `/api/admin/vocabulary/:vocabularyId/publish`

**Acceso:** Administrador.

---

## POST `/api/admin/vocabulary/:vocabularyId/unpublish`

**Acceso:** Administrador.

---

## POST `/api/admin/vocabulary/:vocabularyId/lessons`

**Acceso:** Administrador.

**Propósito:** Relacionar vocabulario con lecciones.

Cuerpo:

```json
{
  "lessonIds": ["uuid-leccion-1", "uuid-leccion-2"]
}
```

---

## DELETE `/api/admin/vocabulary/:vocabularyId/lessons/:lessonId`

**Acceso:** Administrador.

**Propósito:** Retirar una relación.

---

# 25. Categorías de vocabulario

Ruta base:

```text
/api/admin/vocabulary-categories
```

---

## GET `/api/admin/vocabulary-categories`

**Acceso:** Administrador.

---

## POST `/api/admin/vocabulary-categories`

**Acceso:** Administrador.

Cuerpo:

```json
{
  "name": "Saludos",
  "slug": "saludos",
  "description": "Palabras y expresiones de saludo."
}
```

---

## PATCH `/api/admin/vocabulary-categories/:categoryId`

**Acceso:** Administrador.

---

## DELETE `/api/admin/vocabulary-categories/:categoryId`

**Acceso:** Administrador.

La eliminación deberá impedirse cuando existan entradas relacionadas, salvo reasignación previa.

---

# 26. Variantes lingüísticas

Ruta base:

```text
/api/admin/language-variants
```

---

## GET `/api/admin/language-variants`

**Acceso:** Administrador.

---

## POST `/api/admin/language-variants`

**Acceso:** Administrador.

Cuerpo:

```json
{
  "code": "CENTRAL",
  "name": "Variante central",
  "region": "Chimaltenango",
  "description": "Descripción de la variante."
}
```

---

## PATCH `/api/admin/language-variants/:variantId`

**Acceso:** Administrador.

---

## PATCH `/api/admin/language-variants/:variantId/status`

**Acceso:** Administrador.

Cuerpo:

```json
{
  "isActive": false
}
```

---

# 27. Rutas administrativas de archivos multimedia

Ruta base:

```text
/api/admin/media
```

---

## GET `/api/admin/media`

**Acceso:** Administrador.

**Propósito:** Consultar archivos.

Parámetros:

```text
page
pageSize
search
mediaType
status
uploadedById
dateFrom
dateTo
```

---

## POST `/api/admin/media`

**Acceso:** Administrador.

**Tipo:** `multipart/form-data`.

Campos:

```text
file
category
description
```

Respuesta:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "originalName": "saludo.mp3",
    "mediaType": "AUDIO",
    "status": "AVAILABLE"
  }
}
```

---

## GET `/api/admin/media/:mediaId`

**Acceso:** Administrador.

**Propósito:** Consultar metadatos y relaciones.

---

## PATCH `/api/admin/media/:mediaId`

**Acceso:** Administrador.

**Propósito:** Actualizar metadatos permitidos.

---

## DELETE `/api/admin/media/:mediaId`

**Acceso:** Administrador.

**Propósito:** Eliminar un archivo.

Antes de eliminar deberá verificarse:

- Cursos relacionados.
- Lecciones relacionadas.
- Vocabulario relacionado.
- Evaluaciones relacionadas.
- Fotografías de perfil.

---

## GET `/api/admin/media/:mediaId/usage`

**Acceso:** Administrador.

**Propósito:** Consultar dónde se utiliza el archivo.

---

## GET `/api/admin/media/storage/summary`

**Acceso:** Administrador.

**Propósito:** Consultar espacio utilizado.

---

# 28. Rutas de acceso multimedia

Ruta base:

```text
/api/media
```

---

## GET `/api/media/:mediaId/access`

**Acceso:** Autenticado.

**Propósito:** Obtener acceso autorizado a un archivo.

Respuesta conceptual:

```json
{
  "success": true,
  "data": {
    "url": "enlace-temporal",
    "expiresAt": "2026-06-29T18:45:00.000Z"
  }
}
```

---

## GET `/api/media/:mediaId/download`

**Acceso:** Autenticado.

**Propósito:** Descargar un documento autorizado.

El backend deberá verificar que el recurso pueda descargarse.

---

# 29. Rutas de evaluaciones para usuarios

Ruta base:

```text
/api/quizzes
```

---

## GET `/api/quizzes/:quizId`

**Acceso:** Autenticado.

**Propósito:** Consultar una evaluación publicada.

La respuesta no deberá incluir:

- `isCorrect`.
- Respuestas correctas.
- Explicaciones reservadas.
- Puntuaciones internas no necesarias.

---

## POST `/api/quizzes/:quizId/attempts`

**Acceso:** Autenticado.

**Propósito:** Iniciar un intento.

Respuesta:

```text
201 Created
```

---

## GET `/api/quizzes/:quizId/attempts/me`

**Acceso:** Autenticado.

**Propósito:** Consultar intentos propios.

---

## GET `/api/quiz-attempts/:attemptId`

**Acceso:** Autenticado.

**Propósito:** Consultar un intento propio.

---

## POST `/api/quiz-attempts/:attemptId/answers`

**Acceso:** Autenticado.

**Propósito:** Guardar o actualizar respuestas antes del envío.

Cuerpo conceptual:

```json
{
  "answers": [
    {
      "questionId": "uuid-pregunta",
      "selectedOptionIds": ["uuid-opcion"]
    }
  ]
}
```

---

## POST `/api/quiz-attempts/:attemptId/submit`

**Acceso:** Autenticado.

**Propósito:** Enviar y calificar una evaluación.

Respuesta:

```json
{
  "success": true,
  "data": {
    "attemptId": "uuid",
    "scorePercentage": 85,
    "passed": true
  }
}
```

---

# 30. Rutas administrativas de evaluaciones

Ruta base:

```text
/api/admin/quizzes
```

---

## GET `/api/admin/quizzes`

**Acceso:** Administrador.

---

## POST `/api/admin/quizzes`

**Acceso:** Administrador.

Cuerpo:

```json
{
  "title": "Evaluación de saludos",
  "description": "Evaluación de la unidad.",
  "instructions": "Seleccione la respuesta correcta.",
  "kind": "ASSESSMENT",
  "lessonId": "uuid-opcional",
  "unitId": null,
  "passingScore": 70,
  "maxAttempts": 3
}
```

---

## GET `/api/admin/quizzes/:quizId`

**Acceso:** Administrador.

---

## PATCH `/api/admin/quizzes/:quizId`

**Acceso:** Administrador.

---

## DELETE `/api/admin/quizzes/:quizId`

**Acceso:** Administrador.

La eliminación física deberá impedirse cuando existan intentos.

---

## POST `/api/admin/quizzes/:quizId/publish`

**Acceso:** Administrador.

---

## POST `/api/admin/quizzes/:quizId/unpublish`

**Acceso:** Administrador.

---

## GET `/api/admin/quizzes/:quizId/results`

**Acceso:** Administrador.

**Propósito:** Consultar resultados.

Parámetros:

```text
page
pageSize
userId
passed
dateFrom
dateTo
```

---

# 31. Rutas administrativas de preguntas

Ruta base:

```text
/api/admin/quizzes/:quizId/questions
```

---

## GET `/api/admin/quizzes/:quizId/questions`

**Acceso:** Administrador.

---

## POST `/api/admin/quizzes/:quizId/questions`

**Acceso:** Administrador.

Cuerpo conceptual:

```json
{
  "type": "MULTIPLE_CHOICE",
  "prompt": "¿Cuál es el saludo correcto?",
  "points": 10,
  "position": 1,
  "mediaFileId": null,
  "settings": {
    "allowMultiple": false,
    "shuffleOptions": true
  }
}
```

---

## GET `/api/admin/questions/:questionId`

**Acceso:** Administrador.

---

## PATCH `/api/admin/questions/:questionId`

**Acceso:** Administrador.

---

## DELETE `/api/admin/questions/:questionId`

**Acceso:** Administrador.

---

## PATCH `/api/admin/quizzes/:quizId/questions/reorder`

**Acceso:** Administrador.

---

# 32. Rutas de opciones de respuesta

Ruta base:

```text
/api/admin/questions/:questionId/options
```

---

## GET `/api/admin/questions/:questionId/options`

**Acceso:** Administrador.

---

## POST `/api/admin/questions/:questionId/options`

**Acceso:** Administrador.

Cuerpo:

```json
{
  "text": "Ütz awäch",
  "mediaFileId": null,
  "isCorrect": true,
  "position": 1
}
```

---

## PATCH `/api/admin/options/:optionId`

**Acceso:** Administrador.

---

## DELETE `/api/admin/options/:optionId`

**Acceso:** Administrador.

---

# 33. Rutas de pares de relación

Ruta base:

```text
/api/admin/questions/:questionId/matching-pairs
```

---

## GET `/api/admin/questions/:questionId/matching-pairs`

**Acceso:** Administrador.

---

## POST `/api/admin/questions/:questionId/matching-pairs`

**Acceso:** Administrador.

Cuerpo:

```json
{
  "leftText": "Ütz awäch",
  "rightText": "¿Cómo estás?",
  "position": 1
}
```

---

## PATCH `/api/admin/matching-pairs/:pairId`

**Acceso:** Administrador.

---

## DELETE `/api/admin/matching-pairs/:pairId`

**Acceso:** Administrador.

---

# 34. Rutas de progreso propio

Ruta base:

```text
/api/progress
```

---

## GET `/api/progress/me`

**Acceso:** Autenticado.

**Propósito:** Consultar resumen de progreso.

---

## GET `/api/progress/me/courses`

**Acceso:** Autenticado.

**Propósito:** Consultar cursos iniciados y completados.

Parámetros:

```text
status
page
pageSize
```

---

## GET `/api/progress/me/courses/:courseId`

**Acceso:** Autenticado.

**Propósito:** Consultar detalle del progreso en un curso.

---

## GET `/api/progress/me/lessons/:lessonId`

**Acceso:** Autenticado.

**Propósito:** Consultar progreso de una lección.

---

## GET `/api/progress/me/quiz-attempts`

**Acceso:** Autenticado.

**Propósito:** Consultar resultados propios.

---

# 35. Rutas administrativas de progreso

Ruta base:

```text
/api/admin/progress
```

---

## GET `/api/admin/progress`

**Acceso:** Administrador.

**Propósito:** Consultar progreso general.

Parámetros:

```text
page
pageSize
userId
courseId
status
dateFrom
dateTo
```

---

## GET `/api/admin/progress/summary`

**Acceso:** Administrador.

**Propósito:** Consultar indicadores resumidos.

---

## GET `/api/admin/progress/users/:userId`

**Acceso:** Administrador.

**Propósito:** Consultar progreso detallado de un usuario.

---

## GET `/api/admin/progress/courses/:courseId`

**Acceso:** Administrador.

**Propósito:** Consultar el progreso general de un curso.

---

# 36. Rutas de notificaciones para usuarios

Ruta base:

```text
/api/notifications
```

---

## GET `/api/notifications`

**Acceso:** Autenticado.

Parámetros:

```text
page
pageSize
read
type
```

---

## GET `/api/notifications/unread-count`

**Acceso:** Autenticado.

**Propósito:** Consultar cantidad no leída.

---

## PATCH `/api/notifications/:notificationId/read`

**Acceso:** Autenticado.

**Propósito:** Marcar como leída.

---

## PATCH `/api/notifications/read-all`

**Acceso:** Autenticado.

**Propósito:** Marcar todas como leídas.

---

## DELETE `/api/notifications/:notificationId`

**Acceso:** Autenticado.

**Propósito:** Ocultar la notificación de la vista propia.

---

# 37. Rutas administrativas de notificaciones

Ruta base:

```text
/api/admin/notifications
```

---

## POST `/api/admin/notifications`

**Acceso:** Administrador.

**Propósito:** Enviar una notificación.

Cuerpo:

```json
{
  "title": "Nuevo curso disponible",
  "message": "Ya se encuentra disponible el curso inicial.",
  "type": "COURSE",
  "targetUrl": "/cursos/curso-inicial",
  "channel": "BOTH",
  "recipientType": "ALL_USERS",
  "userIds": []
}
```

Valores conceptuales de `channel`:

```text
INTERNAL
EMAIL
BOTH
```

Valores conceptuales de `recipientType`:

```text
ALL_USERS
PROFILE_TYPE
SELECTED_USERS
```

---

## GET `/api/admin/notifications/history`

**Acceso:** Administrador.

**Propósito:** Consultar notificaciones enviadas.

---

## GET `/api/admin/email-deliveries`

**Acceso:** Administrador.

**Propósito:** Consultar estado de correos.

Parámetros:

```text
page
pageSize
status
recipientEmail
dateFrom
dateTo
```

---

## POST `/api/admin/email-deliveries/:deliveryId/retry`

**Acceso:** Administrador.

**Propósito:** Reintentar un envío fallido cuando corresponda.

---

# 38. Rutas del dashboard administrativo

Ruta base:

```text
/api/admin/dashboard
```

---

## GET `/api/admin/dashboard/summary`

**Acceso:** Administrador.

**Propósito:** Consultar indicadores principales.

Respuesta conceptual:

```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "active": 135,
      "pending": 10,
      "blocked": 5
    },
    "courses": {
      "published": 3,
      "draft": 2
    },
    "lessons": {
      "published": 40
    },
    "storage": {
      "usedBytes": 25000000000
    }
  }
}
```

---

## GET `/api/admin/dashboard/activity`

**Acceso:** Administrador.

**Propósito:** Consultar actividad reciente.

---

## GET `/api/admin/dashboard/storage`

**Acceso:** Administrador.

**Propósito:** Consultar estado del almacenamiento.

---

# 39. Rutas de reportes

Ruta base:

```text
/api/admin/reports
```

---

## GET `/api/admin/reports/users`

**Acceso:** Administrador.

**Propósito:** Reporte de usuarios.

Parámetros:

```text
dateFrom
dateTo
profileType
status
```

---

## GET `/api/admin/reports/courses`

**Acceso:** Administrador.

**Propósito:** Reporte de cursos.

---

## GET `/api/admin/reports/progress`

**Acceso:** Administrador.

**Propósito:** Reporte de avance.

---

## GET `/api/admin/reports/quizzes`

**Acceso:** Administrador.

**Propósito:** Reporte de evaluaciones.

---

## GET `/api/admin/reports/storage`

**Acceso:** Administrador.

**Propósito:** Reporte de uso multimedia.

---

## GET `/api/admin/reports/activity`

**Acceso:** Administrador.

**Propósito:** Reporte de actividad.

En la versión 1, estos endpoints devolverán principalmente datos JSON para tablas y gráficas.

La exportación a PDF o Excel podrá implementarse posteriormente.

---

# 40. Rutas de auditoría

Ruta base:

```text
/api/admin/audit
```

---

## GET `/api/admin/audit`

**Acceso:** Administrador.

Parámetros:

```text
page
pageSize
actorUserId
action
entityType
entityId
dateFrom
dateTo
```

---

## GET `/api/admin/audit/:auditId`

**Acceso:** Administrador.

**Propósito:** Consultar un registro específico.

No existirán rutas públicas para:

- Crear auditoría manualmente.
- Modificar auditoría.
- Eliminar auditoría.

Los registros serán generados por los servicios internos.

---

# 41. Rutas de configuración general

Ruta base:

```text
/api/admin/settings
```

---

## GET `/api/admin/settings`

**Acceso:** Administrador.

**Propósito:** Consultar configuración modificable.

---

## GET `/api/admin/settings/:key`

**Acceso:** Administrador.

---

## PATCH `/api/admin/settings/:key`

**Acceso:** Administrador.

Ejemplo:

```json
{
  "value": true
}
```

Ejemplo de clave:

```text
registration.enabled
```

---

## PATCH `/api/admin/settings`

**Acceso:** Administrador.

**Propósito:** Actualizar múltiples valores.

Cuerpo:

```json
{
  "settings": [
    {
      "key": "platform.name",
      "value": "Aprendamos Kaqchikel"
    },
    {
      "key": "registration.enabled",
      "value": true
    }
  ]
}
```

No se administrarán mediante esta API:

- Contraseña de PostgreSQL.
- Credenciales de MinIO.
- Credenciales SMTP.
- Secretos de sesión.
- Token de Cloudflare.

---

# 42. Rutas administrativas de respaldos

Ruta base:

```text
/api/admin/backups
```

---

## GET `/api/admin/backups`

**Acceso:** Administrador.

**Propósito:** Consultar historial de respaldos.

---

## GET `/api/admin/backups/:backupId`

**Acceso:** Administrador.

**Propósito:** Consultar el resultado de un respaldo.

---

## POST `/api/admin/backups/run`

**Acceso:** Administrador.

**Propósito:** Solicitar manualmente un respaldo.

Cuerpo:

```json
{
  "type": "FULL"
}
```

La restauración no deberá exponerse inicialmente como una operación simple desde la interfaz web.

La restauración se realizará mediante un procedimiento técnico documentado.

---

# 43. Rutas internas de trabajos automáticos

Algunos procesos no deberán estar expuestos al público.

Ejemplos:

```text
Eliminar tokens expirados
Eliminar sesiones antiguas
Procesar correos pendientes
Verificar almacenamiento
Calcular estadísticas
Ejecutar respaldos programados
```

Podrán ejecutarse mediante:

- Trabajos internos.
- Cron.
- Contenedor programado.
- Funciones privadas del backend.

Si se crean endpoints internos, deberán protegerse con una red privada y credenciales específicas.

---

# 44. Middlewares por tipo de ruta

## Ruta pública

```text
rateLimit
validate
controller
```

## Ruta autenticada

```text
authenticate
validate
controller
```

## Ruta administrativa

```text
authenticate
authorize("ADMIN")
validate
controller
```

## Ruta de archivo

```text
authenticate
authorize cuando corresponda
uploadLimit
validateMimeType
controller
```

---

# 45. Ejemplo de definición en Express

Ejemplo conceptual:

```typescript
router.post(
  "/admin/courses",
  authenticate,
  authorize("ADMIN"),
  validate(createCourseSchema),
  courseController.create,
);
```

Ejemplo de usuario:

```typescript
router.get("/progress/me", authenticate, progressController.getMyProgress);
```

---

# 46. Validación de identificadores

Todos los parámetros UUID deberán validarse.

Ejemplo:

```text
/api/courses/:courseId
```

Si `courseId` no es válido:

```text
400 Bad Request
```

Si el identificador es válido, pero no existe:

```text
404 Not Found
```

---

# 47. Validación de propiedad

El backend deberá verificar que un usuario únicamente acceda a recursos propios.

Ejemplos:

- Intentos propios.
- Notificaciones propias.
- Progreso propio.
- Sesiones propias.
- Perfil propio.

No será suficiente recibir un `userId` desde el frontend.

El backend utilizará el usuario identificado por la sesión.

Ejemplo correcto:

```text
GET /api/progress/me
```

En lugar de:

```text
GET /api/progress/:userId
```

para usuarios normales.

---

# 48. Protección de información sensible

Las respuestas de la API nunca deberán incluir:

- `passwordHash`.
- `tokenHash`.
- Contraseñas.
- Secretos de sesión.
- Credenciales.
- Respuestas correctas antes de calificar.
- Rutas internas del servidor.
- Detalles de consultas SQL.
- Variables de entorno.

---

# 49. Rate limiting

Se aplicarán límites especialmente en:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/resend-verification
POST /api/auth/reset-password
```

Cuando se exceda el límite:

```text
429 Too Many Requests
```

Respuesta:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Has realizado demasiadas solicitudes. Intenta nuevamente más tarde."
  }
}
```

---

# 50. CORS y cookies

El backend deberá permitir únicamente los orígenes autorizados.

En desarrollo:

```text
http://localhost:3000
```

En producción:

```text
https://dominio-institucional.gt
```

Las solicitudes del frontend deberán incluir credenciales.

Configuración conceptual:

```text
credentials: true
```

Las cookies de producción utilizarán:

```text
httpOnly: true
secure: true
sameSite: apropiado
```

---

# 51. Idempotencia

Las operaciones críticas deberán evitar duplicados causados por solicitudes repetidas.

Ejemplos:

- Inicio de curso.
- Finalización de lección.
- Envío de evaluación.
- Publicación.
- Carga de archivo.
- Envío de notificación general.

Cuando corresponda, podrán utilizarse:

- Restricciones únicas.
- Transacciones.
- Identificadores de solicitud.
- Verificación de estado previo.

---

# 52. Operaciones transaccionales

Deberán utilizar transacciones en procesos como:

## Registro

```text
Crear usuario
Crear token
Registrar correo
```

## Confirmación

```text
Confirmar usuario
Marcar token utilizado
Crear notificación
```

## Envío de evaluación

```text
Guardar respuestas
Calificar
Actualizar intento
Actualizar progreso
```

## Publicación

```text
Validar contenido
Cambiar estado
Registrar auditoría
```

---

# 53. Registro de auditoría por rutas

Deberán generar auditoría, como mínimo:

- Creación de cursos.
- Modificación de cursos.
- Publicación.
- Despublicación.
- Eliminación.
- Bloqueo de usuarios.
- Desactivación de usuarios.
- Carga de archivos.
- Eliminación de archivos.
- Creación de evaluaciones.
- Modificación de configuración.
- Ejecución manual de respaldos.

Ejemplo:

```text
POST /api/admin/courses
→ COURSE_CREATED
```

---

# 54. Listado resumido de rutas

## Autenticación

```text
POST /api/auth/register
POST /api/auth/verify-email
POST /api/auth/resend-verification
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/logout-all
GET  /api/auth/session
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/change-password
```

## Perfil

```text
GET    /api/users/me
PATCH  /api/users/me
POST   /api/users/me/avatar
DELETE /api/users/me/avatar
GET    /api/users/me/sessions
DELETE /api/users/me/sessions/:sessionId
```

## Cursos

```text
GET  /api/courses
GET  /api/courses/:courseId
GET  /api/courses/:courseId/structure
POST /api/courses/:courseId/start
GET  /api/courses/:courseId/progress
```

## Lecciones

```text
GET  /api/lessons/:lessonId
POST /api/lessons/:lessonId/access
POST /api/lessons/:lessonId/complete
```

## Vocabulario

```text
GET /api/vocabulary
GET /api/vocabulary/:vocabularyId
GET /api/vocabulary/categories
GET /api/vocabulary/variants
```

## Multimedia

```text
GET /api/media/:mediaId/access
GET /api/media/:mediaId/download
```

## Evaluaciones

```text
GET  /api/quizzes/:quizId
POST /api/quizzes/:quizId/attempts
GET  /api/quizzes/:quizId/attempts/me
GET  /api/quiz-attempts/:attemptId
POST /api/quiz-attempts/:attemptId/answers
POST /api/quiz-attempts/:attemptId/submit
```

## Progreso

```text
GET /api/progress/me
GET /api/progress/me/courses
GET /api/progress/me/courses/:courseId
GET /api/progress/me/lessons/:lessonId
GET /api/progress/me/quiz-attempts
```

## Notificaciones

```text
GET    /api/notifications
GET    /api/notifications/unread-count
PATCH  /api/notifications/:notificationId/read
PATCH  /api/notifications/read-all
DELETE /api/notifications/:notificationId
```

---

# 55. Organización del backend por rutas

```text
apps/api/src/modules/
├── auth/
│   └── auth.routes.ts
├── users/
│   └── user.routes.ts
├── courses/
│   └── course.routes.ts
├── levels/
│   └── level.routes.ts
├── units/
│   └── unit.routes.ts
├── lessons/
│   └── lesson.routes.ts
├── content/
│   └── content.routes.ts
├── vocabulary/
│   └── vocabulary.routes.ts
├── media/
│   └── media.routes.ts
├── quizzes/
│   └── quiz.routes.ts
├── progress/
│   └── progress.routes.ts
├── notifications/
│   └── notification.routes.ts
├── reports/
│   └── report.routes.ts
├── audit/
│   └── audit.routes.ts
└── settings/
    └── setting.routes.ts
```

---

# 56. Versionado futuro

La primera versión podrá utilizar:

```text
/api
```

Cuando existan cambios incompatibles, podrá implementarse:

```text
/api/v1
/api/v2
```

La decisión de agregar el prefijo `v1` puede adoptarse desde el inicio para facilitar futuras versiones.

Recomendación:

```text
/api/v1
```

Ejemplo:

```text
/api/v1/auth/login
/api/v1/courses
```

Si se adopta esta convención, deberá aplicarse de forma uniforme.

---

# 57. Documentación automática

En una etapa posterior podrá incorporarse:

- OpenAPI.
- Swagger UI.
- Generación de documentación.
- Colección de Postman o Insomnia.

La documentación automática no sustituirá este documento funcional, pero facilitará probar los endpoints.

---

# 58. Pruebas de rutas

Cada grupo deberá contar con pruebas.

## Autenticación

- Registro válido.
- Correo duplicado.
- Inicio correcto.
- Inicio incorrecto.
- Cuenta pendiente.
- Cuenta bloqueada.
- Recuperación.
- Cierre de sesión.

## Permisos

- Usuario accede a ruta permitida.
- Usuario intenta acceder a ruta administrativa.
- Visitante intenta acceder a ruta privada.
- Administrador ejecuta acción autorizada.

## Contenido

- Crear curso.
- Publicar curso.
- Crear estructura.
- Crear lección.
- Cargar archivo.
- Relacionar archivo.

## Evaluaciones

- Iniciar intento.
- Guardar respuestas.
- Enviar.
- Calificar.
- Respetar límite de intentos.

## Progreso

- Iniciar curso.
- Completar lección.
- Calcular porcentaje.
- Completar curso.

---

# 59. Criterios de aceptación

El diseño de rutas se considerará aprobado cuando:

1. Cada módulo cuente con rutas identificadas.

2. Las rutas públicas, privadas y administrativas estén diferenciadas.

3. Los métodos HTTP correspondan con la operación.

4. Las rutas utilicen nombres consistentes.

5. Los identificadores sean validados.

6. Las listas utilicen paginación.

7. Los permisos se validen en el backend.

8. Los usuarios no puedan consultar recursos privados de otras personas.

9. Las respuestas utilicen un formato uniforme.

10. Los errores utilicen códigos HTTP apropiados.

11. Las rutas de archivos validen tipo y tamaño.

12. Las rutas administrativas generen auditoría cuando corresponda.

13. Las respuestas no expongan información sensible.

14. Las evaluaciones no revelen respuestas correctas antes del envío.

15. Las rutas puedan relacionarse con casos de uso y pruebas.

---

# 60. Decisiones adoptadas

Para la versión 1 se establecen las siguientes decisiones:

- La API utilizará estilo REST.
- Express será el responsable de todas las rutas privadas.
- Las rutas administrativas utilizarán el prefijo `/admin`.
- Las rutas del usuario utilizarán `/me` cuando consulten información propia.
- Se utilizará `PATCH` para actualizaciones parciales.
- Los archivos utilizarán `multipart/form-data`.
- Las listas utilizarán paginación.
- Los errores utilizarán un formato uniforme.
- Las rutas estarán protegidas mediante sesiones.
- Los permisos se validarán mediante middlewares.
- La auditoría se generará desde la lógica de negocio.
- La restauración de respaldos no se expondrá inicialmente como ruta web.
- Se recomienda utilizar el prefijo `/api/v1`.

---

# 61. Próximos pasos

Después de aprobar este documento se deberá:

1. Definir el plan de pruebas.

2. Relacionar requisitos con rutas.

3. Crear los esquemas Zod.

4. Crear los archivos de rutas de Express.

5. Crear los controladores iniciales.

6. Implementar los endpoints de salud.

7. Implementar autenticación.

8. Crear una colección de pruebas para la API.

---

# 62. Aprobación del documento

| Responsable | Cargo o función             | Firma | Fecha |
| ----------- | --------------------------- | ----- | ----- |
|             | Responsable del proyecto    |       |       |
|             | Representante institucional |       |       |
|             | Revisor                     |       |       |
