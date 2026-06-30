# Modelo de base de datos

## Plataforma web para el aprendizaje del idioma kaqchikel

**Institución:** Dirección General de Educación Bilingüe Intercultural —DIGEBI—, Ministerio de Educación de Guatemala
**Nombre del proyecto:** Plataforma web para el aprendizaje del idioma kaqchikel
**Versión del documento:** 1.0
**Versión del sistema:** Versión 1
**Estado:** Diseño inicial
**Fecha:** Junio de 2026

---

## 1. Introducción

El presente documento define el modelo lógico inicial de la base de datos para la primera versión de la plataforma web para el aprendizaje del idioma kaqchikel.

El modelo establece:

- Entidades principales.
- Atributos.
- Claves primarias.
- Claves foráneas.
- Relaciones.
- Cardinalidades.
- Restricciones.
- Índices.
- Reglas de eliminación.
- Estados de los registros.
- Convenciones de almacenamiento.

La información estructurada será almacenada en PostgreSQL y administrada desde el backend mediante Prisma ORM.

Los archivos audiovisuales no serán almacenados directamente dentro de PostgreSQL. Estos archivos serán guardados en MinIO, mientras que la base de datos conservará únicamente sus metadatos y ubicación dentro del almacenamiento.

---

## 2. Objetivo del documento

Diseñar una estructura de datos que permita:

- Administrar usuarios y sesiones.
- Organizar cursos, niveles, unidades y lecciones.
- Construir lecciones mediante bloques de contenido.
- Registrar vocabulario y pronunciaciones.
- Relacionar archivos multimedia.
- Crear ejercicios y evaluaciones.
- Guardar respuestas e intentos.
- Calcular el progreso de aprendizaje.
- Administrar notificaciones.
- Registrar auditoría.
- Almacenar configuración general.
- Registrar el resultado de los respaldos.

Este documento servirá como base para elaborar posteriormente:

```text
apps/api/prisma/schema.prisma
```

---

# 3. Tecnología de persistencia

## 3.1 Base de datos

Se utilizará:

- PostgreSQL.
- Codificación UTF-8.
- Prisma ORM.
- Prisma Migrate.
- Identificadores UUID.
- Restricciones de integridad referencial.
- Índices para consultas frecuentes.

## 3.2 Almacenamiento multimedia

Se utilizará:

- MinIO.
- Volumen externo de 1 TB.
- Objetos organizados por buckets o prefijos.
- Referencias almacenadas en PostgreSQL.

## 3.3 Principio general

```text
PostgreSQL
├── Usuarios
├── Cursos
├── Lecciones
├── Evaluaciones
├── Progreso
├── Metadatos de archivos
└── Auditoría

MinIO
├── Imágenes
├── Audios
├── Videos
├── Documentos
├── Fotografías de perfil
└── Portadas
```

PostgreSQL no almacenará archivos audiovisuales en formato binario.

---

# 4. Convenciones de diseño

## 4.1 Nombres en Prisma

Los modelos y propiedades utilizarán nombres en inglés y formato `camelCase`.

Ejemplos:

```text
User
Course
CourseLevel
CourseUnit
Lesson
MediaFile
VocabularyEntry
```

## 4.2 Nombres en PostgreSQL

Las tablas y columnas podrán utilizar formato `snake_case` mediante las funciones `@map` y `@@map` de Prisma.

Ejemplos:

```text
users
course_levels
lesson_content_blocks
password_reset_tokens
```

## 4.3 Identificadores

Las entidades principales utilizarán identificadores UUID.

Ejemplo conceptual:

```prisma
id String @id @default(uuid())
```

## 4.4 Fechas

Las entidades principales deberán contar con:

```text
createdAt
updatedAt
```

Cuando corresponda también podrán incluir:

```text
publishedAt
completedAt
deletedAt
expiresAt
revokedAt
```

Las fechas deberán almacenarse en UTC y mostrarse al usuario según la zona horaria configurada.

## 4.5 Eliminación lógica

Las entidades que posean información histórica o relaciones importantes utilizarán preferentemente eliminación lógica.

Ejemplo:

```text
deletedAt = null     → Registro activo
deletedAt = fecha    → Registro eliminado lógicamente
```

La eliminación física se reservará para registros temporales o sin dependencias importantes.

## 4.6 Correos electrónicos

Los correos deberán:

- Convertirse a minúsculas.
- Eliminar espacios innecesarios.
- Poseer una restricción de unicidad.
- Validarse antes de almacenarse.

---

# 5. Enumeraciones principales

## 5.1 Rol

```prisma
enum Role {
  ADMIN
  USER
}
```

## 5.2 Tipo de perfil

```prisma
enum ProfileType {
  STUDENT
  TEACHER
  OTHER
}
```

## 5.3 Estado de cuenta

```prisma
enum AccountStatus {
  PENDING
  ACTIVE
  BLOCKED
  DISABLED
}
```

## 5.4 Estado de publicación

```prisma
enum PublishStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

## 5.5 Dificultad del curso

```prisma
enum CourseDifficulty {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}
```

## 5.6 Tipo de archivo

```prisma
enum MediaType {
  IMAGE
  AUDIO
  VIDEO
  DOCUMENT
}
```

## 5.7 Estado del archivo

```prisma
enum MediaStatus {
  PROCESSING
  AVAILABLE
  FAILED
  DELETED
}
```

## 5.8 Tipo de bloque educativo

```prisma
enum ContentBlockType {
  TEXT
  HEADING
  IMAGE
  AUDIO
  VIDEO
  DIALOGUE
  EXAMPLE
  NOTE
  VOCABULARY
  DOCUMENT
  QUIZ
}
```

## 5.9 Tipo de evaluación

```prisma
enum QuizKind {
  PRACTICE
  ASSESSMENT
}
```

## 5.10 Tipo de pregunta

```prisma
enum QuestionType {
  MULTIPLE_CHOICE
  TRUE_FALSE
  MATCHING
  AUDIO_CHOICE
  FILL_BLANK
  ORDERING
}
```

## 5.11 Estado de intento

```prisma
enum AttemptStatus {
  IN_PROGRESS
  SUBMITTED
  GRADED
  CANCELLED
}
```

## 5.12 Estado de progreso

```prisma
enum ProgressStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
}
```

## 5.13 Tipo de notificación

```prisma
enum NotificationType {
  GENERAL
  COURSE
  CONTENT
  COMPLETION
  SECURITY
  SYSTEM
}
```

## 5.14 Estado de entrega de correo

```prisma
enum DeliveryStatus {
  PENDING
  SENT
  FAILED
}
```

## 5.15 Tipo de respaldo

```prisma
enum BackupType {
  DATABASE
  MEDIA
  CONFIGURATION
  FULL
}
```

## 5.16 Estado de respaldo

```prisma
enum BackupStatus {
  STARTED
  SUCCESS
  FAILED
}
```

---

# 6. Resumen de entidades

| Código | Entidad                | Responsabilidad                        |
| ------ | ---------------------- | -------------------------------------- |
| ENT-01 | User                   | Cuenta y perfil del usuario            |
| ENT-02 | Session                | Sesiones activas y cerradas            |
| ENT-03 | EmailVerificationToken | Confirmación de correo                 |
| ENT-04 | PasswordResetToken     | Recuperación de contraseña             |
| ENT-05 | MediaFile              | Metadatos de archivos de MinIO         |
| ENT-06 | Course                 | Información principal de un curso      |
| ENT-07 | CourseLevel            | Niveles de un curso                    |
| ENT-08 | CourseUnit             | Unidades de un nivel                   |
| ENT-09 | Lesson                 | Lecciones de una unidad                |
| ENT-10 | LessonContentBlock     | Bloques de contenido de una lección    |
| ENT-11 | VocabularyCategory     | Categorías de vocabulario              |
| ENT-12 | LanguageVariant        | Variantes lingüísticas                 |
| ENT-13 | VocabularyEntry        | Palabras y expresiones                 |
| ENT-14 | LessonVocabulary       | Relación entre lecciones y vocabulario |
| ENT-15 | Quiz                   | Ejercicio o evaluación                 |
| ENT-16 | Question               | Preguntas de una evaluación            |
| ENT-17 | AnswerOption           | Opciones de respuesta                  |
| ENT-18 | MatchingPair           | Pares para ejercicios de relación      |
| ENT-19 | QuizAttempt            | Intento realizado por un usuario       |
| ENT-20 | UserAnswer             | Respuesta del usuario                  |
| ENT-21 | UserAnswerOption       | Opciones seleccionadas por el usuario  |
| ENT-22 | CourseProgress         | Progreso general de un curso           |
| ENT-23 | LessonProgress         | Progreso de una lección                |
| ENT-24 | Notification           | Notificaciones internas                |
| ENT-25 | EmailDelivery          | Registro de correos enviados           |
| ENT-26 | AuditLog               | Registro de acciones administrativas   |
| ENT-27 | SystemSetting          | Configuración general                  |
| ENT-28 | BackupRun              | Historial de respaldos                 |

---

# 7. ENT-01: User

## Propósito

Almacenar los datos de identificación, autenticación y perfil de cada cuenta.

## Campos

| Campo           | Tipo           | Restricción | Descripción               |
| --------------- | -------------- | ----------- | ------------------------- |
| id              | UUID           | PK          | Identificador del usuario |
| firstName       | Texto          | Obligatorio | Nombres                   |
| lastName        | Texto          | Obligatorio | Apellidos                 |
| email           | Texto          | Único       | Correo normalizado        |
| passwordHash    | Texto          | Obligatorio | Hash de contraseña        |
| role            | Role           | Obligatorio | `ADMIN` o `USER`          |
| profileType     | ProfileType    | Obligatorio | Tipo de perfil            |
| status          | AccountStatus  | Obligatorio | Estado de cuenta          |
| emailVerifiedAt | Fecha opcional | —           | Fecha de confirmación     |
| avatarMediaId   | UUID opcional  | FK          | Fotografía de perfil      |
| lastLoginAt     | Fecha opcional | —           | Último acceso exitoso     |
| blockedAt       | Fecha opcional | —           | Fecha de bloqueo          |
| blockedReason   | Texto opcional | —           | Motivo de bloqueo         |
| disabledAt      | Fecha opcional | —           | Fecha de desactivación    |
| createdAt       | Fecha          | Obligatorio | Fecha de creación         |
| updatedAt       | Fecha          | Obligatorio | Última modificación       |

## Reglas

- El correo deberá ser único.
- La contraseña nunca se almacenará en texto plano.
- El rol por defecto será `USER`.
- El estado inicial será `PENDING`.
- Una cuenta confirmada tendrá `emailVerifiedAt`.
- El administrador inicial se creará mediante un proceso seguro.
- La cuenta se desactivará en lugar de eliminarse físicamente.

## Relaciones

```text
User 1 ─── N Session
User 1 ─── N QuizAttempt
User 1 ─── N CourseProgress
User 1 ─── N LessonProgress
User 1 ─── N Notification
User 1 ─── N MediaFile
User 1 ─── N AuditLog
```

---

# 8. ENT-02: Session

## Propósito

Registrar las sesiones utilizadas para acceder a la plataforma.

## Campos

| Campo      | Tipo           | Restricción | Descripción                      |
| ---------- | -------------- | ----------- | -------------------------------- |
| id         | UUID           | PK          | Identificador de sesión          |
| userId     | UUID           | FK          | Usuario propietario              |
| tokenHash  | Texto          | Único       | Hash del identificador de sesión |
| ipAddress  | Texto opcional | —           | Dirección IP                     |
| userAgent  | Texto opcional | —           | Navegador o dispositivo          |
| expiresAt  | Fecha          | Obligatorio | Fecha de expiración              |
| revokedAt  | Fecha opcional | —           | Fecha de invalidación            |
| lastUsedAt | Fecha opcional | —           | Último uso                       |
| createdAt  | Fecha          | Obligatorio | Fecha de creación                |

## Reglas

- No se almacenará el token de sesión en texto plano.
- Una sesión será válida cuando:
  - No haya expirado.
  - No tenga `revokedAt`.
  - La cuenta esté activa.

- Las sesiones se invalidarán después de restablecer una contraseña.

---

# 9. ENT-03: EmailVerificationToken

## Propósito

Administrar los enlaces de confirmación de correo.

## Campos

| Campo     | Tipo           | Restricción |
| --------- | -------------- | ----------- |
| id        | UUID           | PK          |
| userId    | UUID           | FK          |
| tokenHash | Texto          | Único       |
| expiresAt | Fecha          | Obligatorio |
| usedAt    | Fecha opcional | —           |
| createdAt | Fecha          | Obligatorio |

## Reglas

- El token real no deberá almacenarse directamente.
- Un token utilizado no podrá reutilizarse.
- Los tokens anteriores podrán invalidarse cuando se genere uno nuevo.
- Los tokens expirados podrán eliminarse periódicamente.

---

# 10. ENT-04: PasswordResetToken

## Propósito

Administrar la recuperación de contraseñas.

## Campos

| Campo     | Tipo           | Restricción |
| --------- | -------------- | ----------- |
| id        | UUID           | PK          |
| userId    | UUID           | FK          |
| tokenHash | Texto          | Único       |
| expiresAt | Fecha          | Obligatorio |
| usedAt    | Fecha opcional | —           |
| createdAt | Fecha          | Obligatorio |

## Reglas

- El token deberá ser único.
- El token tendrá una expiración limitada.
- Después de utilizarlo se registrará `usedAt`.
- Al cambiar la contraseña deberán invalidarse las sesiones anteriores.

---

# 11. ENT-05: MediaFile

## Propósito

Almacenar los metadatos de los archivos guardados físicamente en MinIO.

## Campos

| Campo           | Tipo             | Restricción | Descripción                      |
| --------------- | ---------------- | ----------- | -------------------------------- |
| id              | UUID             | PK          | Identificador                    |
| originalName    | Texto            | Obligatorio | Nombre del archivo cargado       |
| objectKey       | Texto            | Único       | Ruta interna en MinIO            |
| bucket          | Texto            | Obligatorio | Bucket del archivo               |
| mimeType        | Texto            | Obligatorio | Tipo MIME                        |
| extension       | Texto            | Obligatorio | Extensión                        |
| sizeBytes       | Entero grande    | Obligatorio | Tamaño en bytes                  |
| mediaType       | MediaType        | Obligatorio | Imagen, audio, video o documento |
| status          | MediaStatus      | Obligatorio | Estado del archivo               |
| checksum        | Texto opcional   | —           | Verificación de integridad       |
| durationSeconds | Decimal opcional | —           | Duración de audio o video        |
| width           | Entero opcional  | —           | Ancho de imagen o video          |
| height          | Entero opcional  | —           | Alto de imagen o video           |
| uploadedById    | UUID             | FK          | Usuario que cargó el archivo     |
| createdAt       | Fecha            | Obligatorio | Fecha de carga                   |
| deletedAt       | Fecha opcional   | —           | Eliminación lógica               |

## Reglas

- `objectKey` deberá ser único.
- El nombre original no se utilizará como nombre físico.
- El archivo deberá existir en MinIO antes de quedar como `AVAILABLE`.
- Un archivo relacionado con contenido no deberá eliminarse sin validación.
- La base de datos almacenará metadatos, no el contenido binario.

## Ejemplo

```text
bucket: educational-media
objectKey: audio/vocabulary/2026/06/uuid.mp3
```

---

# 12. ENT-06: Course

## Propósito

Almacenar la información general de los cursos.

## Campos

| Campo           | Tipo             | Restricción |
| --------------- | ---------------- | ----------- |
| id              | UUID             | PK          |
| title           | Texto            | Obligatorio |
| slug            | Texto            | Único       |
| description     | Texto            | Obligatorio |
| objectives      | Texto opcional   | —           |
| difficulty      | CourseDifficulty | Obligatorio |
| coverMediaId    | UUID opcional    | FK          |
| status          | PublishStatus    | Obligatorio |
| position        | Entero           | Obligatorio |
| isPublicPreview | Booleano         | Obligatorio |
| createdById     | UUID             | FK          |
| publishedAt     | Fecha opcional   | —           |
| createdAt       | Fecha            | Obligatorio |
| updatedAt       | Fecha            | Obligatorio |
| deletedAt       | Fecha opcional   | —           |

## Reglas

- Los cursos se crearán inicialmente como `DRAFT`.
- El `slug` deberá ser único.
- `position` determinará el orden del catálogo.
- Los cursos con progreso asociado no deberán eliminarse físicamente.
- `isPublicPreview` determinará si un visitante puede ver información básica.

## Relaciones

```text
Course 1 ─── N CourseLevel
Course 1 ─── N CourseProgress
Course N ─── 1 MediaFile
Course N ─── 1 User
```

---

# 13. ENT-07: CourseLevel

## Propósito

Representar los niveles que componen un curso.

## Campos

| Campo       | Tipo           | Restricción |
| ----------- | -------------- | ----------- |
| id          | UUID           | PK          |
| courseId    | UUID           | FK          |
| title       | Texto          | Obligatorio |
| description | Texto opcional | —           |
| position    | Entero         | Obligatorio |
| createdAt   | Fecha          | Obligatorio |
| updatedAt   | Fecha          | Obligatorio |

## Restricción compuesta

```text
courseId + position = único
```

## Relaciones

```text
Course 1 ─── N CourseLevel
CourseLevel 1 ─── N CourseUnit
```

---

# 14. ENT-08: CourseUnit

## Propósito

Representar las unidades educativas dentro de un nivel.

## Campos

| Campo       | Tipo           | Restricción |
| ----------- | -------------- | ----------- |
| id          | UUID           | PK          |
| levelId     | UUID           | FK          |
| title       | Texto          | Obligatorio |
| description | Texto opcional | —           |
| position    | Entero         | Obligatorio |
| createdAt   | Fecha          | Obligatorio |
| updatedAt   | Fecha          | Obligatorio |

## Restricción compuesta

```text
levelId + position = único
```

## Relaciones

```text
CourseLevel 1 ─── N CourseUnit
CourseUnit 1 ─── N Lesson
CourseUnit 1 ─── N Quiz
```

---

# 15. ENT-09: Lesson

## Propósito

Almacenar las lecciones pertenecientes a una unidad.

## Campos

| Campo            | Tipo            | Restricción |
| ---------------- | --------------- | ----------- |
| id               | UUID            | PK          |
| unitId           | UUID            | FK          |
| title            | Texto           | Obligatorio |
| slug             | Texto           | Obligatorio |
| description      | Texto opcional  | —           |
| position         | Entero          | Obligatorio |
| status           | PublishStatus   | Obligatorio |
| estimatedMinutes | Entero opcional | —           |
| publishedAt      | Fecha opcional  | —           |
| createdAt        | Fecha           | Obligatorio |
| updatedAt        | Fecha           | Obligatorio |
| deletedAt        | Fecha opcional  | —           |

## Restricciones compuestas

```text
unitId + position = único
unitId + slug = único
```

## Reglas

- La lección se creará inicialmente como `DRAFT`.
- Únicamente las lecciones publicadas serán visibles para usuarios normales.
- Las lecciones con progreso no deberán eliminarse físicamente.

## Relaciones

```text
CourseUnit 1 ─── N Lesson
Lesson 1 ─── N LessonContentBlock
Lesson 1 ─── N LessonProgress
Lesson N ─── M VocabularyEntry
Lesson 1 ─── N Quiz
```

---

# 16. ENT-10: LessonContentBlock

## Propósito

Construir una lección mediante bloques de contenido ordenados.

## Campos

| Campo             | Tipo             | Restricción | Descripción             |
| ----------------- | ---------------- | ----------- | ----------------------- |
| id                | UUID             | PK          | Identificador           |
| lessonId          | UUID             | FK          | Lección                 |
| type              | ContentBlockType | Obligatorio | Tipo de bloque          |
| position          | Entero           | Obligatorio | Orden                   |
| title             | Texto opcional   | —           | Título interno          |
| textContent       | Texto opcional   | —           | Contenido textual       |
| mediaFileId       | UUID opcional    | FK          | Archivo relacionado     |
| vocabularyEntryId | UUID opcional    | FK          | Entrada de vocabulario  |
| quizId            | UUID opcional    | FK          | Evaluación relacionada  |
| metadata          | JSON opcional    | —           | Configuración adicional |
| createdAt         | Fecha            | Obligatorio | Creación                |
| updatedAt         | Fecha            | Obligatorio | Modificación            |

## Restricción compuesta

```text
lessonId + position = único
```

## Reglas

- Cada bloque deberá contener únicamente la información correspondiente a su tipo.
- Un bloque de audio deberá relacionarse con un archivo de audio.
- Un bloque de imagen deberá relacionarse con una imagen.
- Un bloque de vocabulario podrá relacionarse con una entrada existente.
- `metadata` se utilizará para configuraciones flexibles sin sustituir las relaciones principales.

## Ejemplo de `metadata`

```json
{
  "alignment": "center",
  "showCaption": true,
  "autoplay": false
}
```

---

# 17. ENT-11: VocabularyCategory

## Propósito

Organizar el vocabulario mediante categorías.

## Campos

| Campo       | Tipo           | Restricción |
| ----------- | -------------- | ----------- |
| id          | UUID           | PK          |
| name        | Texto          | Único       |
| slug        | Texto          | Único       |
| description | Texto opcional | —           |
| createdAt   | Fecha          | Obligatorio |
| updatedAt   | Fecha          | Obligatorio |

## Ejemplos

- Saludos.
- Familia.
- Números.
- Colores.
- Alimentos.
- Escuela.
- Comunidad.
- Agricultura.

---

# 18. ENT-12: LanguageVariant

## Propósito

Identificar variantes lingüísticas cuando corresponda.

## Campos

| Campo       | Tipo           | Restricción |
| ----------- | -------------- | ----------- |
| id          | UUID           | PK          |
| code        | Texto          | Único       |
| name        | Texto          | Obligatorio |
| region      | Texto opcional | —           |
| description | Texto opcional | —           |
| isActive    | Booleano       | Obligatorio |
| createdAt   | Fecha          | Obligatorio |
| updatedAt   | Fecha          | Obligatorio |

## Reglas

- La variante será opcional en una entrada de vocabulario.
- Los contenidos lingüísticos deberán ser validados antes de publicarse.

---

# 19. ENT-13: VocabularyEntry

## Propósito

Almacenar palabras y expresiones en kaqchikel.

## Campos

| Campo                | Tipo           | Restricción |
| -------------------- | -------------- | ----------- |
| id                   | UUID           | PK          |
| termKaqchikel        | Texto          | Obligatorio |
| translationSpanish   | Texto          | Obligatorio |
| description          | Texto opcional | —           |
| exampleKaqchikel     | Texto opcional | —           |
| exampleSpanish       | Texto opcional | —           |
| categoryId           | UUID opcional  | FK          |
| variantId            | UUID opcional  | FK          |
| pronunciationMediaId | UUID opcional  | FK          |
| imageMediaId         | UUID opcional  | FK          |
| status               | PublishStatus  | Obligatorio |
| createdById          | UUID           | FK          |
| publishedAt          | Fecha opcional | —           |
| createdAt            | Fecha          | Obligatorio |
| updatedAt            | Fecha          | Obligatorio |
| deletedAt            | Fecha opcional | —           |

## Reglas

- La palabra deberá conservar correctamente apóstrofos y caracteres especiales.
- La traducción al español será obligatoria en la versión 1.
- El audio y la imagen serán opcionales.
- Las entradas se crearán inicialmente como borrador.

## Relaciones

```text
VocabularyCategory 1 ─── N VocabularyEntry
LanguageVariant 1 ─── N VocabularyEntry
VocabularyEntry N ─── M Lesson
VocabularyEntry N ─── 1 MediaFile
```

---

# 20. ENT-14: LessonVocabulary

## Propósito

Resolver la relación de muchos a muchos entre lecciones y vocabulario.

## Campos

| Campo             | Tipo            | Restricción |
| ----------------- | --------------- | ----------- |
| lessonId          | UUID            | PK y FK     |
| vocabularyEntryId | UUID            | PK y FK     |
| position          | Entero opcional | —           |
| createdAt         | Fecha           | Obligatorio |

## Clave primaria compuesta

```text
lessonId + vocabularyEntryId
```

Una palabra podrá aparecer en varias lecciones y una lección podrá contener varias palabras.

---

# 21. ENT-15: Quiz

## Propósito

Representar ejercicios de práctica y evaluaciones.

## Campos

| Campo        | Tipo            | Restricción |
| ------------ | --------------- | ----------- |
| id           | UUID            | PK          |
| title        | Texto           | Obligatorio |
| description  | Texto opcional  | —           |
| instructions | Texto opcional  | —           |
| kind         | QuizKind        | Obligatorio |
| status       | PublishStatus   | Obligatorio |
| lessonId     | UUID opcional   | FK          |
| unitId       | UUID opcional   | FK          |
| passingScore | Entero          | Obligatorio |
| maxAttempts  | Entero opcional | —           |
| position     | Entero opcional | —           |
| publishedAt  | Fecha opcional  | —           |
| createdById  | UUID            | FK          |
| createdAt    | Fecha           | Obligatorio |
| updatedAt    | Fecha           | Obligatorio |
| deletedAt    | Fecha opcional  | —           |

## Reglas

- Una evaluación deberá relacionarse con una lección o una unidad.
- No deberá relacionarse simultáneamente con ambas, salvo decisión futura.
- `passingScore` se expresará como porcentaje entre 0 y 100.
- `maxAttempts` nulo significará intentos ilimitados.
- Se creará inicialmente como borrador.

---

# 22. ENT-16: Question

## Propósito

Almacenar las preguntas de una evaluación.

## Campos

| Campo       | Tipo           | Restricción |
| ----------- | -------------- | ----------- |
| id          | UUID           | PK          |
| quizId      | UUID           | FK          |
| type        | QuestionType   | Obligatorio |
| prompt      | Texto          | Obligatorio |
| explanation | Texto opcional | —           |
| mediaFileId | UUID opcional  | FK          |
| points      | Decimal        | Obligatorio |
| position    | Entero         | Obligatorio |
| settings    | JSON opcional  | —           |
| createdAt   | Fecha          | Obligatorio |
| updatedAt   | Fecha          | Obligatorio |

## Restricción compuesta

```text
quizId + position = único
```

## Ejemplo de `settings`

```json
{
  "caseSensitive": false,
  "allowMultiple": false,
  "shuffleOptions": true
}
```

---

# 23. ENT-17: AnswerOption

## Propósito

Almacenar las opciones disponibles para una pregunta.

## Campos

| Campo           | Tipo            | Restricción |
| --------------- | --------------- | ----------- |
| id              | UUID            | PK          |
| questionId      | UUID            | FK          |
| text            | Texto opcional  | —           |
| mediaFileId     | UUID opcional   | FK          |
| isCorrect       | Booleano        | Obligatorio |
| position        | Entero          | Obligatorio |
| correctPosition | Entero opcional | —           |
| createdAt       | Fecha           | Obligatorio |
| updatedAt       | Fecha           | Obligatorio |

## Reglas

- Una opción deberá tener texto, archivo o ambos.
- `correctPosition` podrá utilizarse para ejercicios de ordenamiento.
- Las respuestas correctas nunca deberán enviarse al frontend antes de calificar.

---

# 24. ENT-18: MatchingPair

## Propósito

Almacenar pares relacionados para ejercicios de asociación.

## Campos

| Campo        | Tipo          | Restricción |
| ------------ | ------------- | ----------- |
| id           | UUID          | PK          |
| questionId   | UUID          | FK          |
| leftText     | Texto         | Obligatorio |
| rightText    | Texto         | Obligatorio |
| leftMediaId  | UUID opcional | FK          |
| rightMediaId | UUID opcional | FK          |
| position     | Entero        | Obligatorio |

## Ejemplo

```text
Kaqchikel:  Utziläj
Español:    Bueno
```

---

# 25. ENT-19: QuizAttempt

## Propósito

Registrar cada intento realizado por un usuario.

## Campos

| Campo           | Tipo              | Restricción |
| --------------- | ----------------- | ----------- |
| id              | UUID              | PK          |
| quizId          | UUID              | FK          |
| userId          | UUID              | FK          |
| attemptNumber   | Entero            | Obligatorio |
| status          | AttemptStatus     | Obligatorio |
| scorePoints     | Decimal opcional  | —           |
| scorePercentage | Decimal opcional  | —           |
| passed          | Booleano opcional | —           |
| startedAt       | Fecha             | Obligatorio |
| submittedAt     | Fecha opcional    | —           |
| gradedAt        | Fecha opcional    | —           |

## Restricción compuesta

```text
quizId + userId + attemptNumber = único
```

## Reglas

- El intento se creará con estado `IN_PROGRESS`.
- Al enviar respuestas cambiará a `SUBMITTED`.
- Después de calificar cambiará a `GRADED`.
- La calificación deberá calcularse en el backend.

---

# 26. ENT-20: UserAnswer

## Propósito

Registrar la respuesta proporcionada a cada pregunta.

## Campos

| Campo         | Tipo              | Restricción |
| ------------- | ----------------- | ----------- |
| id            | UUID              | PK          |
| attemptId     | UUID              | FK          |
| questionId    | UUID              | FK          |
| textAnswer    | Texto opcional    | —           |
| responseData  | JSON opcional     | —           |
| isCorrect     | Booleano opcional | —           |
| awardedPoints | Decimal           | Obligatorio |
| answeredAt    | Fecha             | Obligatorio |

## Restricción compuesta

```text
attemptId + questionId = único
```

## Uso de `responseData`

Podrá utilizarse para:

- Ordenamiento.
- Relación de pares.
- Varias selecciones.
- Estructuras de respuesta futuras.

Ejemplo:

```json
{
  "orderedOptionIds": ["uuid-1", "uuid-3", "uuid-2"]
}
```

---

# 27. ENT-21: UserAnswerOption

## Propósito

Registrar las opciones seleccionadas por el usuario.

## Campos

| Campo          | Tipo | Restricción |
| -------------- | ---- | ----------- |
| userAnswerId   | UUID | PK y FK     |
| answerOptionId | UUID | PK y FK     |

## Clave primaria compuesta

```text
userAnswerId + answerOptionId
```

Esta tabla permitirá almacenar una o varias opciones seleccionadas.

---

# 28. ENT-22: CourseProgress

## Propósito

Representar el inicio y progreso general de un usuario dentro de un curso.

## Campos

| Campo              | Tipo           | Restricción |
| ------------------ | -------------- | ----------- |
| id                 | UUID           | PK          |
| userId             | UUID           | FK          |
| courseId           | UUID           | FK          |
| status             | ProgressStatus | Obligatorio |
| progressPercentage | Decimal        | Obligatorio |
| startedAt          | Fecha          | Obligatorio |
| lastAccessedAt     | Fecha opcional | —           |
| completedAt        | Fecha opcional | —           |
| createdAt          | Fecha          | Obligatorio |
| updatedAt          | Fecha          | Obligatorio |

## Restricción compuesta

```text
userId + courseId = único
```

## Reglas

- El registro se creará cuando el usuario inicie el curso.
- `progressPercentage` deberá mantenerse entre 0 y 100.
- El porcentaje se calculará con base en las lecciones publicadas completadas.
- Al llegar a 100 %, el estado podrá cambiar a `COMPLETED`.

---

# 29. ENT-23: LessonProgress

## Propósito

Registrar el avance del usuario en una lección específica.

## Campos

| Campo           | Tipo           | Restricción |
| --------------- | -------------- | ----------- |
| id              | UUID           | PK          |
| userId          | UUID           | FK          |
| lessonId        | UUID           | FK          |
| status          | ProgressStatus | Obligatorio |
| firstAccessedAt | Fecha opcional | —           |
| lastAccessedAt  | Fecha opcional | —           |
| completedAt     | Fecha opcional | —           |
| createdAt       | Fecha          | Obligatorio |
| updatedAt       | Fecha          | Obligatorio |

## Restricción compuesta

```text
userId + lessonId = único
```

## Reglas

- El primer acceso cambiará el estado a `IN_PROGRESS`.
- La finalización establecerá `COMPLETED`.
- La actualización deberá recalcular el progreso del curso.

---

# 30. ENT-24: Notification

## Propósito

Almacenar las notificaciones internas dirigidas a los usuarios.

## Campos

| Campo     | Tipo             | Restricción |
| --------- | ---------------- | ----------- |
| id        | UUID             | PK          |
| userId    | UUID             | FK          |
| type      | NotificationType | Obligatorio |
| title     | Texto            | Obligatorio |
| message   | Texto            | Obligatorio |
| targetUrl | Texto opcional   | —           |
| metadata  | JSON opcional    | —           |
| readAt    | Fecha opcional   | —           |
| hiddenAt  | Fecha opcional   | —           |
| createdAt | Fecha            | Obligatorio |

## Reglas

- Cada notificación pertenecerá a un usuario.
- Un aviso general podrá generar una notificación para cada destinatario.
- `hiddenAt` permitirá retirarla de la vista sin eliminar el registro inmediatamente.

---

# 31. ENT-25: EmailDelivery

## Propósito

Registrar los intentos de envío de correo electrónico.

## Campos

| Campo             | Tipo           | Restricción |
| ----------------- | -------------- | ----------- |
| id                | UUID           | PK          |
| userId            | UUID opcional  | FK          |
| recipientEmail    | Texto          | Obligatorio |
| templateName      | Texto          | Obligatorio |
| subject           | Texto          | Obligatorio |
| status            | DeliveryStatus | Obligatorio |
| providerMessageId | Texto opcional | —           |
| errorMessage      | Texto opcional | —           |
| sentAt            | Fecha opcional | —           |
| createdAt         | Fecha          | Obligatorio |

## Reglas

- No se almacenará la contraseña ni tokens completos dentro de este registro.
- Los errores de entrega deberán registrarse.
- El contenido completo del correo podrá evitarse para reducir exposición de datos.

---

# 32. ENT-26: AuditLog

## Propósito

Registrar acciones administrativas y eventos importantes.

## Campos

| Campo       | Tipo           | Restricción |
| ----------- | -------------- | ----------- |
| id          | UUID           | PK          |
| actorUserId | UUID opcional  | FK          |
| action      | Texto          | Obligatorio |
| entityType  | Texto          | Obligatorio |
| entityId    | UUID opcional  | —           |
| ipAddress   | Texto opcional | —           |
| userAgent   | Texto opcional | —           |
| oldValues   | JSON opcional  | —           |
| newValues   | JSON opcional  | —           |
| metadata    | JSON opcional  | —           |
| createdAt   | Fecha          | Obligatorio |

## Ejemplos de acción

```text
USER_BLOCKED
COURSE_CREATED
COURSE_PUBLISHED
LESSON_UPDATED
MEDIA_DELETED
SETTINGS_UPDATED
```

## Reglas

- Los registros se crearán automáticamente.
- No podrán modificarse desde el panel administrativo.
- No deberán contener contraseñas ni tokens.
- `actorUserId` podrá ser nulo cuando la acción sea realizada por el sistema.

---

# 33. ENT-27: SystemSetting

## Propósito

Almacenar valores generales modificables desde la plataforma.

## Campos

| Campo       | Tipo           | Restricción |
| ----------- | -------------- | ----------- |
| id          | UUID           | PK          |
| key         | Texto          | Único       |
| value       | JSON           | Obligatorio |
| description | Texto opcional | —           |
| isPublic    | Booleano       | Obligatorio |
| updatedById | UUID opcional  | FK          |
| createdAt   | Fecha          | Obligatorio |
| updatedAt   | Fecha          | Obligatorio |

## Ejemplos

```text
platform.name
platform.description
registration.enabled
media.image.maxSize
media.audio.maxSize
token.verification.expirationMinutes
```

## Restricciones

No se almacenarán aquí:

- Contraseñas de PostgreSQL.
- Credenciales de MinIO.
- Secretos de cookies.
- Credenciales SMTP.
- Tokens de Cloudflare.

Estos valores permanecerán en variables de entorno.

---

# 34. ENT-28: BackupRun

## Propósito

Registrar la ejecución y resultado de los respaldos.

## Campos

| Campo        | Tipo                   | Restricción |
| ------------ | ---------------------- | ----------- |
| id           | UUID                   | PK          |
| type         | BackupType             | Obligatorio |
| status       | BackupStatus           | Obligatorio |
| location     | Texto opcional         | —           |
| sizeBytes    | Entero grande opcional | —           |
| checksum     | Texto opcional         | —           |
| startedAt    | Fecha                  | Obligatorio |
| completedAt  | Fecha opcional         | —           |
| errorMessage | Texto opcional         | —           |
| metadata     | JSON opcional          | —           |

## Reglas

- El registro deberá crearse al iniciar el respaldo.
- El estado cambiará a `SUCCESS` o `FAILED`.
- El error deberá registrarse cuando el proceso falle.
- No se almacenará el respaldo dentro de PostgreSQL.

---

# 35. Relaciones generales

## Autenticación

```text
User
├── Session
├── EmailVerificationToken
└── PasswordResetToken
```

## Contenido educativo

```text
Course
└── CourseLevel
    └── CourseUnit
        └── Lesson
            ├── LessonContentBlock
            ├── Quiz
            ├── LessonProgress
            └── VocabularyEntry
```

## Evaluaciones

```text
Quiz
├── Question
│   ├── AnswerOption
│   └── MatchingPair
└── QuizAttempt
    └── UserAnswer
        └── UserAnswerOption
```

## Progreso

```text
User
├── CourseProgress
└── LessonProgress
```

## Operación

```text
User
├── Notification
├── EmailDelivery
├── MediaFile
└── AuditLog
```

---

# 36. Diagrama lógico simplificado

```text
USER
 ├── SESSION
 ├── EMAIL_VERIFICATION_TOKEN
 ├── PASSWORD_RESET_TOKEN
 ├── COURSE_PROGRESS ───────── COURSE
 ├── LESSON_PROGRESS ──────── LESSON
 ├── QUIZ_ATTEMPT ─────────── QUIZ
 ├── NOTIFICATION
 ├── MEDIA_FILE
 └── AUDIT_LOG

COURSE
 └── COURSE_LEVEL
      └── COURSE_UNIT
           ├── LESSON
           │    ├── LESSON_CONTENT_BLOCK
           │    ├── LESSON_VOCABULARY
           │    └── QUIZ
           └── QUIZ

VOCABULARY_ENTRY
 ├── VOCABULARY_CATEGORY
 ├── LANGUAGE_VARIANT
 ├── MEDIA_FILE
 └── LESSON_VOCABULARY

QUIZ
 └── QUESTION
      ├── ANSWER_OPTION
      └── MATCHING_PAIR

QUIZ_ATTEMPT
 └── USER_ANSWER
      └── USER_ANSWER_OPTION
```

---

# 37. Cardinalidades principales

| Relación                             | Cardinalidad    |
| ------------------------------------ | --------------- |
| User – Session                       | Uno a muchos    |
| User – EmailVerificationToken        | Uno a muchos    |
| User – PasswordResetToken            | Uno a muchos    |
| User – MediaFile                     | Uno a muchos    |
| Course – CourseLevel                 | Uno a muchos    |
| CourseLevel – CourseUnit             | Uno a muchos    |
| CourseUnit – Lesson                  | Uno a muchos    |
| Lesson – LessonContentBlock          | Uno a muchos    |
| Lesson – VocabularyEntry             | Muchos a muchos |
| VocabularyCategory – VocabularyEntry | Uno a muchos    |
| LanguageVariant – VocabularyEntry    | Uno a muchos    |
| Lesson – Quiz                        | Uno a muchos    |
| CourseUnit – Quiz                    | Uno a muchos    |
| Quiz – Question                      | Uno a muchos    |
| Question – AnswerOption              | Uno a muchos    |
| Question – MatchingPair              | Uno a muchos    |
| User – QuizAttempt                   | Uno a muchos    |
| Quiz – QuizAttempt                   | Uno a muchos    |
| QuizAttempt – UserAnswer             | Uno a muchos    |
| UserAnswer – AnswerOption            | Muchos a muchos |
| User – CourseProgress                | Uno a muchos    |
| Course – CourseProgress              | Uno a muchos    |
| User – LessonProgress                | Uno a muchos    |
| Lesson – LessonProgress              | Uno a muchos    |
| User – Notification                  | Uno a muchos    |
| User – AuditLog                      | Uno a muchos    |

---

# 38. Reglas de integridad

## Usuarios

- No se permitirán correos duplicados.
- No se eliminarán físicamente usuarios con historial.
- El rol no podrá ser modificado por el propio usuario.

## Cursos

- No se permitirán posiciones duplicadas dentro del mismo curso.
- Un nivel deberá pertenecer a un curso válido.
- Una unidad deberá pertenecer a un nivel válido.
- Una lección deberá pertenecer a una unidad válida.

## Contenido

- La posición de un bloque será única dentro de la lección.
- Los archivos relacionados deberán existir.
- Los bloques deberán validar que el recurso corresponda con su tipo.

## Evaluaciones

- Una pregunta deberá pertenecer a una evaluación.
- Un intento deberá pertenecer a un usuario y una evaluación.
- Cada número de intento será único por usuario y evaluación.
- Las respuestas deberán pertenecer a preguntas de la evaluación del intento.

## Progreso

- Un usuario tendrá un único registro de progreso por curso.
- Un usuario tendrá un único registro de progreso por lección.
- El porcentaje deberá mantenerse entre 0 y 100.

## Multimedia

- `objectKey` deberá ser único.
- Un archivo relacionado no deberá eliminarse sin verificar dependencias.
- El estado `AVAILABLE` requerirá que el objeto exista en MinIO.

---

# 39. Estrategia de eliminación

## Eliminación lógica

Se recomienda utilizar eliminación lógica en:

- Course.
- Lesson.
- VocabularyEntry.
- Quiz.
- MediaFile.

## Desactivación

Se utilizará en:

- User.

## Eliminación física permitida

Podrá utilizarse en:

- Tokens expirados.
- Sesiones antiguas revocadas.
- Notificaciones antiguas según política.
- Registros temporales sin dependencias.
- Opciones de preguntas de evaluaciones todavía en borrador.

## Restricción

No se deberá eliminar físicamente:

- Intentos de evaluación.
- Respuestas entregadas.
- Progreso.
- Auditoría.
- Usuarios con actividad.
- Cursos con progreso histórico.

---

# 40. Reglas de cascada

Las eliminaciones en cascada deberán utilizarse con precaución.

## Cascada permitida

Podrá aplicarse cuando se elimine físicamente:

- Un token junto con su usuario.
- Una sesión junto con su usuario.
- Una opción de respuesta perteneciente a una pregunta en borrador.
- Un par de relación perteneciente a una pregunta en borrador.

## Eliminación restringida

Deberá utilizarse para:

- Archivos relacionados con contenido.
- Cursos con progreso.
- Lecciones con progreso.
- Evaluaciones con intentos.
- Usuarios con actividad histórica.

La lógica de negocio deberá validar estas condiciones antes de solicitar una eliminación.

---

# 41. Índices recomendados

## User

```text
email
role
status
profileType
createdAt
```

## Session

```text
tokenHash
userId
expiresAt
```

## Course

```text
slug
status
position
createdAt
```

## CourseLevel

```text
courseId
courseId + position
```

## CourseUnit

```text
levelId
levelId + position
```

## Lesson

```text
unitId
status
unitId + position
```

## LessonContentBlock

```text
lessonId
lessonId + position
type
```

## VocabularyEntry

```text
termKaqchikel
translationSpanish
categoryId
variantId
status
```

## MediaFile

```text
objectKey
mediaType
status
uploadedById
createdAt
```

## Quiz

```text
lessonId
unitId
status
```

## QuizAttempt

```text
userId
quizId
userId + quizId
startedAt
```

## CourseProgress

```text
userId
courseId
status
```

## LessonProgress

```text
userId
lessonId
status
```

## Notification

```text
userId
readAt
createdAt
```

## AuditLog

```text
actorUserId
action
entityType
entityId
createdAt
```

---

# 42. Búsqueda de vocabulario

La búsqueda deberá considerar:

- Palabra en kaqchikel.
- Traducción al español.
- Categoría.
- Variante.

Para la primera versión podrán utilizarse índices normales y consultas sin distinción entre mayúsculas y minúsculas.

En una versión posterior podrá evaluarse:

- Extensión `pg_trgm`.
- Búsqueda por similitud.
- Búsqueda de texto completo.
- Normalización lingüística avanzada.

---

# 43. Uso de campos JSON

Los campos JSON se utilizarán únicamente cuando la estructura pueda variar.

Ejemplos:

- Configuración de bloques.
- Configuración de preguntas.
- Respuestas de ordenamiento.
- Metadatos de auditoría.
- Valores de configuración.

No deberán utilizarse para sustituir relaciones importantes.

Ejemplo incorrecto:

```json
{
  "userId": "uuid",
  "courseId": "uuid"
}
```

Estos valores deberán representarse mediante claves foráneas.

---

# 44. Transacciones necesarias

Se recomienda utilizar transacciones en procesos como:

## Registro

```text
Crear usuario
Crear token
Registrar envío
```

## Confirmación

```text
Validar token
Confirmar usuario
Marcar token utilizado
Crear notificación
```

## Carga multimedia

```text
Cargar archivo en MinIO
Guardar metadatos
Registrar auditoría
```

Si PostgreSQL falla después de cargar el archivo, el sistema deberá intentar eliminar el objeto huérfano de MinIO.

## Evaluación

```text
Crear intento
Guardar respuestas
Calcular puntuación
Actualizar progreso
```

## Publicación

```text
Validar contenido
Cambiar estado
Registrar fecha
Crear auditoría
Generar notificaciones
```

---

# 45. Datos sensibles

Se considerarán sensibles:

- PasswordHash.
- TokenHash.
- Dirección IP.
- Información de sesión.
- Direcciones de correo.
- Datos personales.
- Metadatos de seguridad.

Estos datos deberán:

- Restringirse al backend.
- No exponerse en respuestas públicas.
- No incluirse innecesariamente en logs.
- No mostrarse a otros usuarios.
- Protegerse mediante permisos.

---

# 46. Información que no deberá almacenarse

La base de datos no deberá almacenar:

- Contraseñas en texto plano.
- Tokens completos sin protección.
- Archivos audiovisuales binarios.
- Secretos de producción.
- Credenciales de PostgreSQL.
- Credenciales de MinIO.
- Credenciales SMTP.
- Tokens de Cloudflare.
- Información innecesaria de los usuarios.

---

# 47. Organización inicial de MinIO

## Buckets propuestos

```text
educational-images
educational-audio
educational-videos
documents
avatars
course-covers
```

Otra opción será utilizar menos buckets y organizar mediante prefijos:

```text
educational-media/
├── images/
├── audio/
├── videos/
├── documents/
├── avatars/
└── course-covers/
```

Para la versión 1 se recomienda utilizar una cantidad reducida de buckets y separar los recursos mediante prefijos.

## Ejemplo de ruta

```text
educational-media/audio/vocabulary/2026/06/uuid.mp3
```

---

# 48. Orden de implementación del modelo

## Etapa 1: autenticación

- User.
- Session.
- EmailVerificationToken.
- PasswordResetToken.
- AuditLog.
- SystemSetting.

## Etapa 2: contenido principal

- MediaFile.
- Course.
- CourseLevel.
- CourseUnit.
- Lesson.
- LessonContentBlock.

## Etapa 3: vocabulario

- VocabularyCategory.
- LanguageVariant.
- VocabularyEntry.
- LessonVocabulary.

## Etapa 4: evaluaciones

- Quiz.
- Question.
- AnswerOption.
- MatchingPair.
- QuizAttempt.
- UserAnswer.
- UserAnswerOption.

## Etapa 5: progreso y comunicación

- CourseProgress.
- LessonProgress.
- Notification.
- EmailDelivery.

## Etapa 6: operación

- BackupRun.
- Índices adicionales.
- Políticas de retención.
- Optimización.

---

# 49. Modelos mínimos para iniciar el desarrollo

El primer `schema.prisma` no deberá incluir necesariamente las 28 entidades desde el primer día.

La primera migración podrá contener:

```text
User
Session
EmailVerificationToken
PasswordResetToken
AuditLog
```

La segunda migración podrá incluir:

```text
MediaFile
Course
CourseLevel
CourseUnit
Lesson
LessonContentBlock
```

Las demás entidades se agregarán conforme avance el desarrollo.

Esto permitirá trabajar mediante migraciones pequeñas y controladas.

---

# 50. Reglas para las migraciones

1. Cada cambio deberá realizarse mediante Prisma Migrate.

2. Las migraciones deberán tener nombres descriptivos.

Ejemplos:

```text
init_auth_models
add_course_structure
add_media_files
add_vocabulary
add_quizzes
add_progress
```

3. Las migraciones deberán probarse en desarrollo.

4. No deberán modificarse migraciones ya aplicadas en producción.

5. Antes de una migración importante deberá existir respaldo.

6. Los cambios destructivos deberán revisarse manualmente.

7. La base de producción no deberá modificarse directamente desde una herramienta gráfica sin registrar la migración correspondiente.

---

# 51. Herramientas de administración

Durante el desarrollo podrán utilizarse:

- Prisma Studio.
- `psql`.
- Cliente gráfico para PostgreSQL.
- Consola de MinIO.

Estas herramientas deberán utilizarse únicamente con acceso autorizado.

En producción, las operaciones normales deberán realizarse desde la plataforma o mediante procedimientos administrativos documentados.

---

# 52. Criterios de aceptación

El modelo de base de datos se considerará correctamente definido cuando:

1. Cada entidad posea una responsabilidad clara.

2. Las relaciones correspondan con los módulos y casos de uso.

3. Los usuarios puedan relacionarse con sesiones, progreso y evaluaciones.

4. Los cursos puedan organizar niveles, unidades y lecciones.

5. Las lecciones puedan contener bloques ordenados.

6. El vocabulario pueda reutilizarse en varias lecciones.

7. Los archivos se almacenen en MinIO y sus metadatos en PostgreSQL.

8. Las evaluaciones puedan contener diferentes tipos de preguntas.

9. Los intentos y respuestas puedan conservarse históricamente.

10. El progreso sea único por usuario y recurso.

11. Las notificaciones pertenezcan a un destinatario.

12. Las acciones administrativas puedan auditarse.

13. Las configuraciones no almacenen secretos.

14. Los respaldos puedan registrar su resultado.

15. Existan restricciones contra duplicados.

16. Existan índices para consultas frecuentes.

17. Las eliminaciones no provoquen pérdida accidental de información histórica.

18. El diseño pueda transformarse en modelos Prisma.

---

# 53. Decisiones adoptadas

Para la versión 1 se establecen las siguientes decisiones:

- PostgreSQL será la base de datos principal.
- Prisma será el ORM.
- Los identificadores principales utilizarán UUID.
- Los archivos no se almacenarán como BLOB.
- MinIO almacenará el contenido audiovisual.
- Los usuarios se desactivarán en lugar de eliminarse.
- El contenido importante utilizará eliminación lógica.
- Los intentos, progreso y auditoría se conservarán.
- Los bloques de contenido permitirán construir lecciones flexibles.
- Los campos JSON se utilizarán solamente para configuraciones variables.
- La base se implementará progresivamente mediante migraciones.
- La seguridad y los permisos se validarán en el backend.

---

# 54. Próximos pasos

Después de aprobar este documento se deberá:

1. Elaborar el diagrama entidad-relación.

2. Definir la arquitectura general del sistema.

3. Convertir la primera parte del modelo a `schema.prisma`.

4. Crear la primera migración.

5. Crear el usuario administrador inicial mediante `seed`.

6. Configurar PostgreSQL dentro de Docker Compose.

7. Validar la conexión entre Express, Prisma y PostgreSQL.

---

# 55. Aprobación del documento

| Responsable | Cargo o función             | Firma | Fecha |
| ----------- | --------------------------- | ----- | ----- |
|             | Responsable del proyecto    |       |       |
|             | Representante institucional |       |       |
|             | Revisor                     |       |       |
