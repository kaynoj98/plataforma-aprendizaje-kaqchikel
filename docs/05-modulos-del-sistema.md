# Módulos del sistema

## Plataforma web para el aprendizaje del idioma kaqchikel

**Institución:** Dirección General de Educación Bilingüe Intercultural —DIGEBI—, Ministerio de Educación de Guatemala
**Nombre del proyecto:** Plataforma web para el aprendizaje del idioma kaqchikel
**Versión del documento:** 1.0
**Versión del sistema:** Versión 1
**Estado:** Definición inicial
**Fecha:** Junio de 2026

---

## 1. Introducción

El presente documento describe los módulos principales que conformarán la primera versión de la plataforma web para el aprendizaje del idioma kaqchikel.

Un módulo representa un conjunto de funciones relacionadas que cumplen una responsabilidad específica dentro del sistema.

La división modular permitirá:

- Organizar el desarrollo por etapas.
- Separar responsabilidades.
- Facilitar las pruebas.
- Reducir dependencias innecesarias.
- Mejorar el mantenimiento.
- Permitir futuras ampliaciones.
- Relacionar cada módulo con requisitos, rutas, tablas y pantallas.

La plataforma estará compuesta por módulos funcionales, módulos técnicos y módulos de infraestructura.

---

## 2. Objetivo del documento

Definir la responsabilidad, alcance, entradas, procesos, resultados y relaciones de cada módulo de la plataforma.

Este documento servirá como base para:

- Diseño de la arquitectura.
- Diseño de la base de datos.
- Organización del backend.
- Organización del frontend.
- Definición de rutas de la API.
- Elaboración de casos de uso.
- Elaboración del plan de pruebas.
- Distribución del trabajo durante el desarrollo.

---

## 3. Clasificación general de módulos

Los módulos se clasificarán en tres grupos.

### 3.1 Módulos funcionales

Son los módulos que contienen las funciones utilizadas directamente por visitantes, usuarios y administradores.

### 3.2 Módulos técnicos

Son los módulos que proporcionan servicios internos como almacenamiento, validación, correo, auditoría y monitoreo.

### 3.3 Módulos de infraestructura

Son los componentes responsables del despliegue, comunicación, persistencia y disponibilidad de la plataforma.

---

## 4. Lista general de módulos

| Código | Módulo                         | Tipo                |
| ------ | ------------------------------ | ------------------- |
| MOD-01 | Autenticación y sesiones       | Funcional           |
| MOD-02 | Usuarios y perfiles            | Funcional           |
| MOD-03 | Cursos                         | Funcional           |
| MOD-04 | Niveles, unidades y lecciones  | Funcional           |
| MOD-05 | Contenido educativo            | Funcional           |
| MOD-06 | Vocabulario y pronunciación    | Funcional           |
| MOD-07 | Archivos multimedia            | Técnico y funcional |
| MOD-08 | Ejercicios y evaluaciones      | Funcional           |
| MOD-09 | Progreso del aprendizaje       | Funcional           |
| MOD-10 | Notificaciones y correo        | Funcional y técnico |
| MOD-11 | Panel administrativo           | Funcional           |
| MOD-12 | Reportes                       | Funcional           |
| MOD-13 | Auditoría                      | Técnico y funcional |
| MOD-14 | Configuración general          | Funcional y técnico |
| MOD-15 | Base de datos                  | Técnico             |
| MOD-16 | Almacenamiento de archivos     | Técnico             |
| MOD-17 | Validación y manejo de errores | Técnico             |
| MOD-18 | Monitoreo y registros          | Técnico             |
| MOD-19 | Respaldos y recuperación       | Técnico             |
| MOD-20 | Infraestructura y despliegue   | Infraestructura     |

---

# 5. MOD-01: Autenticación y sesiones

## 5.1 Propósito

Controlar la creación de cuentas, confirmación de correo, inicio de sesión, cierre de sesión, recuperación de contraseña y manejo de sesiones.

## 5.2 Actores

- Visitante.
- Usuario.
- Administrador.

## 5.3 Entradas

- Nombre.
- Apellidos.
- Correo electrónico.
- Contraseña.
- Confirmación de contraseña.
- Tipo de perfil.
- Token de confirmación.
- Token de recuperación.
- Identificador de sesión.

## 5.4 Procesos principales

- Registro de nuevos usuarios.
- Validación de correo.
- Validación de contraseña.
- Cifrado de contraseña.
- Generación de token de confirmación.
- Confirmación de correo.
- Inicio de sesión.
- Creación de sesión.
- Validación de sesión.
- Cierre de sesión.
- Recuperación de contraseña.
- Restablecimiento de contraseña.
- Invalidación de sesiones.

## 5.5 Resultados

- Cuenta creada.
- Correo de confirmación enviado.
- Cuenta confirmada.
- Sesión iniciada.
- Sesión cerrada.
- Contraseña restablecida.
- Solicitud rechazada cuando los datos no son válidos.

## 5.6 Dependencias

- Usuarios y perfiles.
- PostgreSQL.
- Servicio de correo.
- Validación.
- Auditoría.
- Configuración general.

## 5.7 Entidades relacionadas

- User.
- Session.
- EmailVerificationToken.
- PasswordResetToken.

---

# 6. MOD-02: Usuarios y perfiles

## 6.1 Propósito

Administrar la información personal y el estado de las cuentas registradas.

## 6.2 Actores

- Usuario.
- Administrador.

## 6.3 Entradas

- Nombre.
- Apellidos.
- Tipo de perfil.
- Fotografía.
- Estado de cuenta.
- Parámetros de búsqueda.
- Parámetros de filtrado.

## 6.4 Procesos principales

- Consulta del perfil propio.
- Actualización del perfil.
- Cambio de fotografía.
- Consulta de usuarios.
- Búsqueda de usuarios.
- Activación de cuentas.
- Bloqueo de cuentas.
- Desactivación de cuentas.
- Consulta del último acceso.

## 6.5 Resultados

- Perfil actualizado.
- Fotografía actualizada.
- Lista de usuarios.
- Estado de cuenta modificado.
- Información de usuario consultada.

## 6.6 Dependencias

- Autenticación.
- Archivos multimedia.
- PostgreSQL.
- Auditoría.
- Panel administrativo.

## 6.7 Entidades relacionadas

- User.
- MediaFile.
- Session.
- AuditLog.

---

# 7. MOD-03: Cursos

## 7.1 Propósito

Administrar la información general de los cursos disponibles dentro de la plataforma.

## 7.2 Actores

- Usuario.
- Administrador.
- Visitante, cuando existan cursos públicos.

## 7.3 Entradas

- Nombre del curso.
- Descripción.
- Objetivos.
- Imagen de portada.
- Nivel de dificultad.
- Orden.
- Estado de publicación.

## 7.4 Procesos principales

- Creación de cursos.
- Modificación de cursos.
- Publicación.
- Despublicación.
- Eliminación.
- Consulta de cursos publicados.
- Consulta de cursos en borrador.
- Ordenamiento.
- Búsqueda.

## 7.5 Resultados

- Curso creado.
- Curso actualizado.
- Curso publicado.
- Curso despublicado.
- Catálogo de cursos.
- Detalle de curso.

## 7.6 Dependencias

- Usuarios y permisos.
- Archivos multimedia.
- Niveles, unidades y lecciones.
- Progreso.
- Auditoría.

## 7.7 Entidades relacionadas

- Course.
- MediaFile.
- CourseProgress.
- Level.

---

# 8. MOD-04: Niveles, unidades y lecciones

## 8.1 Propósito

Organizar la estructura pedagógica de cada curso.

## 8.2 Estructura

```text
Curso
└── Nivel
    └── Unidad
        └── Lección
```

## 8.3 Actores

- Usuario.
- Administrador.

## 8.4 Entradas

- Nombre.
- Título.
- Descripción.
- Orden.
- Estado de publicación.
- Identificador del elemento superior.

## 8.5 Procesos principales

- Creación de niveles.
- Creación de unidades.
- Creación de lecciones.
- Modificación de elementos.
- Ordenamiento.
- Publicación.
- Despublicación.
- Eliminación.
- Consulta de estructura educativa.

## 8.6 Resultados

- Estructura organizada.
- Nivel creado.
- Unidad creada.
- Lección creada.
- Contenido publicado.
- Índice de curso disponible.

## 8.7 Dependencias

- Cursos.
- Contenido educativo.
- Evaluaciones.
- Progreso.
- Auditoría.

## 8.8 Entidades relacionadas

- Level.
- Unit.
- Lesson.
- Course.

---

# 9. MOD-05: Contenido educativo

## 9.1 Propósito

Permitir la creación de lecciones mediante bloques ordenados y reutilizables.

## 9.2 Tipos de contenido

- Texto.
- Título.
- Subtítulo.
- Imagen.
- Audio.
- Video.
- Diálogo.
- Ejemplo.
- Nota.
- Vocabulario.
- Documento.
- Ejercicio.

## 9.3 Actores

- Usuario.
- Administrador.

## 9.4 Entradas

- Tipo de bloque.
- Contenido textual.
- Archivo relacionado.
- Orden.
- Configuración del bloque.
- Lección relacionada.

## 9.5 Procesos principales

- Creación de bloques.
- Edición de bloques.
- Eliminación.
- Reordenamiento.
- Relación con archivos.
- Relación con vocabulario.
- Previsualización.
- Presentación al usuario.

## 9.6 Resultados

- Lección compuesta por bloques.
- Contenido ordenado.
- Previsualización administrativa.
- Presentación educativa para el usuario.

## 9.7 Dependencias

- Lecciones.
- Multimedia.
- Vocabulario.
- Ejercicios.
- Auditoría.

## 9.8 Entidades relacionadas

- LessonContentBlock.
- Lesson.
- MediaFile.
- Vocabulary.
- Quiz.

---

# 10. MOD-06: Vocabulario y pronunciación

## 10.1 Propósito

Registrar y presentar palabras y expresiones en kaqchikel con su traducción, pronunciación y contexto.

## 10.2 Actores

- Usuario.
- Administrador.
- Visitante, cuando el contenido sea público.

## 10.3 Entradas

- Palabra en kaqchikel.
- Traducción.
- Descripción.
- Ejemplo.
- Categoría.
- Variante lingüística.
- Audio.
- Imagen.
- Lecciones relacionadas.

## 10.4 Procesos principales

- Registro de vocabulario.
- Modificación.
- Eliminación.
- Publicación.
- Búsqueda.
- Filtrado.
- Reproducción de audio.
- Asociación con lecciones.
- Consulta de glosario.

## 10.5 Resultados

- Entrada de vocabulario.
- Glosario.
- Audio de pronunciación disponible.
- Palabras organizadas por categoría.
- Vocabulario relacionado con una lección.

## 10.6 Dependencias

- Multimedia.
- Lecciones.
- PostgreSQL.
- Auditoría.

## 10.7 Entidades relacionadas

- Vocabulary.
- VocabularyCategory.
- LanguageVariant.
- MediaFile.
- LessonVocabulary.

---

# 11. MOD-07: Archivos multimedia

## 11.1 Propósito

Gestionar imágenes, audios, videos, documentos y fotografías utilizadas dentro de la plataforma.

## 11.2 Actores

- Administrador.
- Usuario, únicamente para fotografía de perfil.
- Usuario como consumidor de archivos educativos.

## 11.3 Entradas

- Archivo.
- Nombre original.
- Tipo MIME.
- Tamaño.
- Categoría.
- Recurso relacionado.
- Usuario responsable.

## 11.4 Procesos principales

- Validación de archivo.
- Generación de nombre interno.
- Carga en MinIO.
- Registro de metadatos.
- Consulta.
- Reproducción.
- Descarga.
- Eliminación.
- Verificación de relaciones.
- Generación de enlaces temporales.

## 11.5 Resultados

- Archivo almacenado.
- Metadatos registrados.
- URL o enlace autorizado.
- Archivo reproducido.
- Archivo eliminado.
- Error cuando el archivo no cumple las condiciones.

## 11.6 Dependencias

- MinIO.
- PostgreSQL.
- Usuarios.
- Contenido educativo.
- Vocabulario.
- Cursos.
- Auditoría.

## 11.7 Entidades relacionadas

- MediaFile.
- User.
- Course.
- LessonContentBlock.
- Vocabulary.

---

# 12. MOD-08: Ejercicios y evaluaciones

## 12.1 Propósito

Permitir la creación, publicación, resolución y calificación de actividades educativas.

## 12.2 Tipos de ejercicios

- Selección múltiple.
- Verdadero o falso.
- Relacionar palabra y traducción.
- Pregunta basada en audio.
- Completar palabra.
- Completar expresión.
- Ordenar palabras.

## 12.3 Actores

- Usuario.
- Administrador.

## 12.4 Entradas

- Nombre.
- Descripción.
- Instrucciones.
- Preguntas.
- Opciones.
- Respuestas correctas.
- Puntuación.
- Límite de intentos.
- Respuestas del usuario.

## 12.5 Procesos principales

- Creación de evaluación.
- Creación de preguntas.
- Definición de respuestas correctas.
- Publicación.
- Inicio de intento.
- Registro de respuestas.
- Calificación.
- Determinación de aprobación.
- Registro de resultados.
- Consulta de intentos.

## 12.6 Resultados

- Evaluación publicada.
- Intento registrado.
- Puntuación calculada.
- Estado aprobado o no aprobado.
- Historial de intentos.
- Resultados administrativos.

## 12.7 Dependencias

- Lecciones.
- Usuarios.
- Progreso.
- Notificaciones.
- Auditoría.

## 12.8 Entidades relacionadas

- Quiz.
- Question.
- AnswerOption.
- QuizAttempt.
- UserAnswer.

---

# 13. MOD-09: Progreso del aprendizaje

## 13.1 Propósito

Registrar el avance individual de los usuarios en cursos, unidades, lecciones y evaluaciones.

## 13.2 Actores

- Usuario.
- Administrador.

## 13.3 Entradas

- Usuario.
- Curso.
- Lección.
- Evaluación.
- Fecha de actividad.
- Estado de finalización.
- Puntuación.

## 13.4 Procesos principales

- Registro del inicio de curso.
- Registro de acceso a lección.
- Marcación de lección completada.
- Cálculo de porcentaje.
- Registro de evaluaciones.
- Registro de curso completado.
- Consulta de progreso.
- Consulta administrativa.

## 13.5 Resultados

- Porcentaje de avance.
- Lecciones completadas.
- Cursos iniciados.
- Cursos terminados.
- Promedio de evaluaciones.
- Última actividad.

## 13.6 Dependencias

- Usuarios.
- Cursos.
- Lecciones.
- Evaluaciones.
- Notificaciones.

## 13.7 Entidades relacionadas

- CourseProgress.
- LessonProgress.
- QuizAttempt.
- User.
- Course.

---

# 14. MOD-10: Notificaciones y correo

## 14.1 Propósito

Informar a los usuarios sobre eventos importantes mediante mensajes internos y correo electrónico.

## 14.2 Actores

- Usuario.
- Administrador.
- Sistema.

## 14.3 Entradas

- Destinatario.
- Asunto.
- Mensaje.
- Tipo de notificación.
- Canal de envío.
- Evento generador.

## 14.4 Procesos principales

- Creación de notificación interna.
- Envío de correo.
- Marcación como leída.
- Eliminación visual.
- Aviso general.
- Notificación de confirmación.
- Notificación de recuperación.
- Notificación de curso completado.
- Registro del estado de envío.

## 14.5 Resultados

- Notificación interna.
- Correo enviado.
- Estado de lectura.
- Estado de entrega.
- Registro de error de envío.

## 14.6 Dependencias

- Usuarios.
- Autenticación.
- Progreso.
- Cursos.
- SMTP.
- Auditoría.

## 14.7 Entidades relacionadas

- Notification.
- EmailDelivery.
- User.

---

# 15. MOD-11: Panel administrativo

## 15.1 Propósito

Proporcionar al administrador una interfaz centralizada para gestionar la plataforma.

## 15.2 Actores

- Administrador.

## 15.3 Secciones principales

- Dashboard.
- Usuarios.
- Cursos.
- Niveles.
- Unidades.
- Lecciones.
- Vocabulario.
- Multimedia.
- Evaluaciones.
- Progreso.
- Notificaciones.
- Reportes.
- Auditoría.
- Configuración.

## 15.4 Entradas

- Parámetros de búsqueda.
- Filtros.
- Formularios administrativos.
- Acciones de publicación.
- Acciones críticas.

## 15.5 Procesos principales

- Consulta de indicadores.
- Acceso a módulos administrativos.
- Administración de contenido.
- Administración de usuarios.
- Consulta de reportes.
- Consulta de auditoría.
- Modificación de configuración.

## 15.6 Resultados

- Vista general del sistema.
- Información administrativa.
- Acciones ejecutadas.
- Estadísticas básicas.
- Alertas y estados.

## 15.7 Dependencias

El panel administrativo depende de prácticamente todos los módulos funcionales.

---

# 16. MOD-12: Reportes

## 16.1 Propósito

Proporcionar información resumida sobre usuarios, contenido, progreso y actividad de la plataforma.

## 16.2 Actores

- Administrador.

## 16.3 Entradas

- Rango de fechas.
- Curso.
- Tipo de perfil.
- Estado de usuario.
- Tipo de actividad.

## 16.4 Procesos principales

- Conteo de usuarios.
- Conteo de actividad.
- Consulta de cursos iniciados.
- Consulta de cursos completados.
- Consulta de evaluaciones.
- Consulta de uso de almacenamiento.
- Filtrado por fecha.

## 16.5 Resultados

- Indicadores.
- Tablas resumidas.
- Datos para gráficas.
- Estadísticas básicas de uso.

## 16.6 Dependencias

- Usuarios.
- Cursos.
- Progreso.
- Evaluaciones.
- Multimedia.
- PostgreSQL.

## 16.7 Entidades relacionadas

Este módulo consulta entidades existentes y no requiere necesariamente tablas propias en la versión 1.

---

# 17. MOD-13: Auditoría

## 17.1 Propósito

Registrar acciones administrativas y eventos importantes para facilitar el control y seguimiento de la plataforma.

## 17.2 Actores

- Sistema.
- Administrador como usuario consultante.

## 17.3 Entradas

- Usuario responsable.
- Acción.
- Tipo de recurso.
- Identificador.
- Fecha.
- Dirección IP.
- Datos adicionales.

## 17.4 Procesos principales

- Registro automático de acciones.
- Consulta.
- Búsqueda.
- Filtrado.
- Conservación de historial.

## 17.5 Resultados

- Registro de auditoría.
- Historial administrativo.
- Evidencia de cambios.
- Apoyo para investigar errores o accesos.

## 17.6 Dependencias

- Autenticación.
- Usuarios.
- Cursos.
- Lecciones.
- Multimedia.
- Evaluaciones.
- Configuración.

## 17.7 Entidades relacionadas

- AuditLog.

---

# 18. MOD-14: Configuración general

## 18.1 Propósito

Administrar valores generales de la plataforma que no requieren modificar directamente el código.

## 18.2 Actores

- Administrador.

## 18.3 Entradas

- Nombre de plataforma.
- Descripción.
- Información institucional.
- Estado de registro.
- Límites de archivos.
- Expiración de tokens.
- Configuración de contenido público.

## 18.4 Procesos principales

- Consulta de configuración.
- Actualización.
- Validación.
- Registro en auditoría.
- Aplicación de valores.

## 18.5 Resultados

- Configuración actualizada.
- Nuevos límites aplicados.
- Registro habilitado o deshabilitado.
- Información institucional actualizada.

## 18.6 Dependencias

- Autenticación.
- Multimedia.
- Usuarios.
- Auditoría.
- PostgreSQL.

## 18.7 Entidades relacionadas

- SystemSetting.

Las credenciales técnicas no deberán administrarse desde este módulo.

---

# 19. MOD-15: Base de datos

## 19.1 Propósito

Almacenar de forma estructurada la información principal de la plataforma.

## 19.2 Tecnología

- PostgreSQL.
- Prisma ORM.
- Prisma Migrate.

## 19.3 Información almacenada

- Usuarios.
- Sesiones.
- Tokens.
- Cursos.
- Niveles.
- Unidades.
- Lecciones.
- Bloques de contenido.
- Vocabulario.
- Metadatos multimedia.
- Evaluaciones.
- Respuestas.
- Progreso.
- Notificaciones.
- Auditoría.
- Configuración.

## 19.4 Procesos principales

- Creación.
- Lectura.
- Actualización.
- Eliminación controlada.
- Transacciones.
- Migraciones.
- Índices.
- Restricciones.
- Respaldo.
- Restauración.

## 19.5 Dependencias

Este módulo es utilizado por todos los módulos funcionales.

---

# 20. MOD-16: Almacenamiento de archivos

## 20.1 Propósito

Almacenar físicamente los archivos audiovisuales y documentos.

## 20.2 Tecnología

- MinIO.
- Volumen externo de 1 TB.
- API compatible con S3.

## 20.3 Organización inicial

```text
images/
audio/
videos/
documents/
avatars/
course-covers/
backups/
```

La estructura definitiva podrá implementarse mediante buckets o prefijos.

## 20.4 Procesos principales

- Carga.
- Lectura.
- Descarga.
- Eliminación.
- Generación de enlaces.
- Control de acceso.
- Verificación de espacio.
- Respaldo.

## 20.5 Dependencias

- Multimedia.
- Usuarios.
- Cursos.
- Lecciones.
- Vocabulario.
- Respaldos.

---

# 21. MOD-17: Validación y manejo de errores

## 21.1 Propósito

Validar los datos recibidos y presentar respuestas de error consistentes.

## 21.2 Tecnología

- Zod.
- Middlewares de Express.
- Manejo centralizado de errores.

## 21.3 Procesos principales

- Validación de cuerpo.
- Validación de parámetros.
- Validación de consultas.
- Validación de archivos.
- Conversión de errores.
- Registro de errores.
- Respuestas estandarizadas.

## 21.4 Ejemplo de respuesta

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Los datos enviados no son válidos.",
  "details": [
    {
      "field": "email",
      "message": "El correo electrónico no es válido."
    }
  ]
}
```

## 21.5 Dependencias

Este módulo será utilizado por todos los módulos del backend.

---

# 22. MOD-18: Monitoreo y registros

## 22.1 Propósito

Supervisar el estado de los servicios y facilitar la consulta de errores.

## 22.2 Tecnologías

- Uptime Kuma.
- Dozzle.
- Logs de Docker.
- Logs del backend.
- Endpoints de salud.

## 22.3 Procesos principales

- Verificación de disponibilidad.
- Consulta de logs.
- Registro de errores.
- Registro de advertencias.
- Supervisión de almacenamiento.
- Supervisión de servicios.

## 22.4 Servicios supervisados

- Frontend.
- Backend.
- PostgreSQL.
- MinIO.
- Nginx.
- Cloudflare Tunnel.
- Servicio de correo, cuando sea posible.

## 22.5 Resultados

- Estado de servicios.
- Historial de disponibilidad.
- Registros.
- Alertas.
- Información de diagnóstico.

---

# 23. MOD-19: Respaldos y recuperación

## 23.1 Propósito

Proteger la información y permitir la restauración ante fallos.

## 23.2 Información respaldada

- PostgreSQL.
- Archivos de MinIO.
- Configuración.
- Infraestructura.
- Documentación.
- Variables de entorno protegidas.

## 23.3 Procesos principales

- Respaldo diario.
- Respaldo semanal.
- Respaldo mensual.
- Verificación de resultado.
- Eliminación según retención.
- Restauración de prueba.
- Registro de errores.

## 23.4 Política inicial

- Siete copias diarias.
- Cuatro copias semanales.
- Seis copias mensuales.

## 23.5 Dependencias

- PostgreSQL.
- MinIO.
- Volumen externo.
- Scripts de automatización.
- Monitoreo.

---

# 24. MOD-20: Infraestructura y despliegue

## 24.1 Propósito

Administrar el funcionamiento conjunto de todos los servicios de la plataforma.

## 24.2 Tecnologías

- Docker.
- Docker Compose.
- Nginx.
- Cloudflare.
- Cloudflare Tunnel.
- Dominio propio.
- Servidor dedicado.

## 24.3 Servicios iniciales

```text
web
api
postgres
minio
nginx
cloudflared
uptime-kuma
dozzle
backup
```

## 24.4 Procesos principales

- Construcción de imágenes.
- Levantamiento de servicios.
- Reinicio automático.
- Comunicación entre contenedores.
- Publicación mediante dominio.
- Proxy inverso.
- Gestión de redes.
- Gestión de volúmenes.
- Aplicación de variables de entorno.

## 24.5 Resultados

- Plataforma disponible.
- Servicios conectados.
- Datos persistentes.
- Acceso mediante HTTPS.
- Servicios internos no expuestos públicamente.

---

# 25. Relaciones entre módulos

La plataforma utilizará las siguientes relaciones principales:

```text
Autenticación
    └── Usuarios
          ├── Progreso
          ├── Evaluaciones
          ├── Notificaciones
          └── Auditoría

Cursos
    └── Niveles
          └── Unidades
                └── Lecciones
                      ├── Contenido
                      ├── Vocabulario
                      ├── Multimedia
                      └── Evaluaciones

Multimedia
    ├── MinIO
    └── PostgreSQL

Panel administrativo
    ├── Usuarios
    ├── Cursos
    ├── Contenido
    ├── Multimedia
    ├── Evaluaciones
    ├── Reportes
    ├── Auditoría
    └── Configuración
```

---

# 26. Flujo general del usuario

```text
Registro
   ↓
Confirmación de correo
   ↓
Inicio de sesión
   ↓
Consulta de cursos
   ↓
Inicio de curso
   ↓
Acceso a unidades y lecciones
   ↓
Consulta de contenido
   ↓
Resolución de ejercicios
   ↓
Registro de progreso
   ↓
Finalización de curso
```

---

# 27. Flujo general del administrador

```text
Inicio de sesión
   ↓
Panel administrativo
   ↓
Creación de curso
   ↓
Creación de niveles
   ↓
Creación de unidades
   ↓
Creación de lecciones
   ↓
Carga de multimedia
   ↓
Creación de contenido
   ↓
Creación de evaluaciones
   ↓
Previsualización
   ↓
Publicación
   ↓
Consulta de progreso y reportes
```

---

# 28. Organización propuesta en el backend

```text
apps/api/src/modules/
├── auth/
├── users/
├── courses/
├── levels/
├── units/
├── lessons/
├── content/
├── vocabulary/
├── media/
├── quizzes/
├── progress/
├── notifications/
├── reports/
├── audit/
└── settings/
```

Cada módulo podrá contener:

```text
controller
service
repository
routes
schemas
types
```

Ejemplo:

```text
courses/
├── course.controller.ts
├── course.service.ts
├── course.repository.ts
├── course.routes.ts
├── course.schemas.ts
└── course.types.ts
```

---

# 29. Organización propuesta en el frontend

```text
apps/web/src/features/
├── auth/
├── users/
├── courses/
├── lessons/
├── vocabulary/
├── media/
├── quizzes/
├── progress/
├── notifications/
└── admin/
```

Cada característica podrá contener:

```text
components
hooks
services
schemas
types
```

---

# 30. Orden recomendado de implementación

La implementación se realizará en fases.

## Fase 1: base técnica

1. Infraestructura inicial.
2. PostgreSQL.
3. Prisma.
4. Backend Express.
5. Frontend Next.js.
6. Validación.
7. Manejo de errores.

## Fase 2: acceso

1. Autenticación.
2. Sesiones.
3. Usuarios.
4. Perfiles.
5. Permisos.

## Fase 3: contenido principal

1. Cursos.
2. Niveles.
3. Unidades.
4. Lecciones.
5. Bloques de contenido.

## Fase 4: archivos y vocabulario

1. MinIO.
2. Multimedia.
3. Vocabulario.
4. Pronunciación.

## Fase 5: aprendizaje

1. Ejercicios.
2. Evaluaciones.
3. Intentos.
4. Progreso.
5. Notificaciones.

## Fase 6: administración

1. Dashboard.
2. Reportes.
3. Auditoría.
4. Configuración.

## Fase 7: operación

1. Monitoreo.
2. Respaldos.
3. Pruebas.
4. Documentación.
5. Despliegue final.

---

# 31. Prioridad de módulos

## Prioridad alta

- Autenticación.
- Usuarios.
- Cursos.
- Niveles, unidades y lecciones.
- Contenido educativo.
- Multimedia.
- Evaluaciones.
- Progreso.
- Permisos.
- Base de datos.

## Prioridad media

- Vocabulario.
- Notificaciones.
- Panel administrativo.
- Auditoría.
- Respaldos.
- Monitoreo.

## Prioridad baja dentro de la versión 1

- Reportes avanzados.
- Configuración dinámica extensa.
- Estadísticas detalladas.
- Alertas automatizadas complejas.

---

# 32. Dependencias críticas

Las siguientes dependencias deberán respetarse:

1. No se podrá desarrollar progreso sin cursos, lecciones y usuarios.

2. No se podrá desarrollar evaluaciones completas sin usuarios y lecciones.

3. No se podrá publicar contenido multimedia sin MinIO y PostgreSQL.

4. No se podrá proteger el panel administrativo sin autenticación y permisos.

5. No se podrá implementar auditoría completa sin usuarios y módulos administrativos.

6. No se podrá configurar el despliegue final sin Docker, Nginx y Cloudflare Tunnel.

7. No se podrá garantizar recuperación sin respaldos probados.

---

# 33. Límites entre módulos

Para mantener una arquitectura ordenada:

- Autenticación no deberá contener lógica de cursos.
- Cursos no deberá controlar directamente las sesiones.
- Multimedia no deberá decidir permisos administrativos.
- Progreso no deberá modificar contenido educativo.
- Evaluaciones no deberán modificar directamente el perfil del usuario.
- Auditoría no deberá ejecutar acciones administrativas.
- Reportes no deberán alterar registros.
- El frontend no deberá consultar PostgreSQL directamente.
- El frontend no deberá conectarse directamente a MinIO.
- Todas las operaciones deberán pasar por el backend cuando requieran autorización.

---

# 34. Criterios de aceptación

La división modular se considerará correctamente aplicada cuando:

1. Cada función pertenezca a un módulo claramente identificado.

2. Los módulos estén separados en el backend.

3. Los módulos estén organizados por características en el frontend.

4. Las dependencias entre módulos sean conocidas.

5. La lógica de negocio no se encuentre mezclada con la interfaz.

6. La base de datos sea accedida mediante Prisma.

7. Los archivos sean administrados mediante el módulo multimedia.

8. Los permisos sean aplicados antes de ejecutar operaciones privadas.

9. Los errores sean controlados de forma centralizada.

10. Los módulos puedan probarse individualmente.

11. La estructura permita agregar nuevas funciones sin reorganizar todo el sistema.

---

# 35. Resumen

La versión 1 estará compuesta por veinte módulos principales.

Los módulos más importantes para iniciar el desarrollo serán:

```text
Autenticación
Usuarios
Cursos
Niveles
Unidades
Lecciones
Contenido
Multimedia
Evaluaciones
Progreso
```

Los demás módulos proporcionarán administración, seguridad, monitoreo, respaldo y soporte técnico.

Esta organización permitirá desarrollar la plataforma de forma progresiva durante el período de práctica, reduciendo la complejidad y facilitando la presentación de avances parciales.

---

# 36. Aprobación del documento

| Responsable | Cargo o función             | Firma | Fecha |
| ----------- | --------------------------- | ----- | ----- |
|             | Responsable del proyecto    |       |       |
|             | Representante institucional |       |       |
|             | Revisor                     |       |       |
