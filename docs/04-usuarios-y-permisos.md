# Usuarios, roles y permisos

## Plataforma web para el aprendizaje del idioma kaqchikel

**Institución:** Dirección General de Educación Bilingüe Intercultural —DIGEBI—, Ministerio de Educación de Guatemala
**Nombre del proyecto:** Plataforma web para el aprendizaje del idioma kaqchikel
**Versión del documento:** 1.0
**Versión del sistema:** Versión 1
**Estado:** Definición inicial
**Fecha:** Junio de 2026

---

## 1. Introducción

El presente documento define los actores, roles, perfiles y permisos de la primera versión de la plataforma web para el aprendizaje del idioma kaqchikel.

Su propósito es establecer de forma clara:

- Qué tipos de personas utilizarán la plataforma.
- Qué acciones puede realizar cada tipo de usuario.
- Qué recursos puede consultar o modificar cada actor.
- Qué rutas deberán protegerse.
- Qué validaciones deberán realizarse en el backend.
- Qué diferencias existen entre un rol y un tipo de perfil.

La versión 1 contará con dos roles almacenados en la base de datos:

```text
ADMIN
USER
```

También se considerará al visitante como un actor externo, aunque no será almacenado como un rol.

---

## 2. Objetivo del documento

Definir la estructura de autorización de la plataforma para garantizar que cada persona acceda únicamente a las funciones y datos que le correspondan.

Este documento servirá como referencia para:

- Diseño de la base de datos.
- Implementación de autenticación.
- Protección de rutas de Express.
- Protección de páginas de Next.js.
- Diseño del menú de navegación.
- Elaboración de casos de uso.
- Implementación de pruebas de permisos.
- Registro de auditoría.

---

## 3. Conceptos principales

### 3.1 Actor

Persona o sistema externo que interactúa con la plataforma.

Los actores principales serán:

- Visitante.
- Usuario.
- Administrador.

### 3.2 Rol

Nivel de autorización asignado a una cuenta.

Los roles de la versión 1 serán:

```text
ADMIN
USER
```

### 3.3 Tipo de perfil

Clasificación informativa del usuario según su relación con la plataforma.

Los tipos de perfil serán:

```text
STUDENT
TEACHER
OTHER
```

El tipo de perfil no otorgará permisos adicionales durante la versión 1.

### 3.4 Permiso

Autorización para realizar una acción determinada sobre un recurso.

Ejemplos:

```text
Crear cursos
Consultar progreso propio
Bloquear usuarios
Publicar lecciones
Resolver evaluaciones
```

### 3.5 Recurso

Elemento del sistema sobre el cual se ejecuta una acción.

Ejemplos:

- Usuario.
- Curso.
- Nivel.
- Unidad.
- Lección.
- Archivo.
- Evaluación.
- Progreso.
- Notificación.
- Registro de auditoría.

---

# 4. Actores del sistema

## 4.1 Visitante

El visitante es una persona que accede a la plataforma sin una sesión autenticada.

Podrá:

- Consultar la página principal.
- Consultar información pública.
- Acceder al formulario de registro.
- Acceder al formulario de inicio de sesión.
- Solicitar recuperación de contraseña.
- Confirmar una cuenta mediante un enlace válido.
- Consultar cursos definidos como públicos, cuando corresponda.

No podrá:

- Acceder a cursos privados.
- Completar lecciones.
- Resolver evaluaciones.
- Guardar progreso.
- Consultar perfiles.
- Acceder al panel administrativo.
- Administrar contenido.

El visitante no será almacenado como un rol en PostgreSQL.

---

## 4.2 Usuario

El usuario será una persona registrada con el rol:

```text
USER
```

Podrá identificarse mediante uno de los siguientes tipos de perfil:

```text
STUDENT
TEACHER
OTHER
```

El usuario podrá:

- Iniciar y cerrar sesión.
- Consultar y modificar su perfil.
- Cambiar su contraseña.
- Consultar cursos publicados.
- Acceder a unidades y lecciones publicadas.
- Reproducir audios y videos.
- Consultar vocabulario.
- Resolver ejercicios y evaluaciones.
- Consultar sus propios resultados.
- Consultar su propio progreso.
- Consultar sus notificaciones.

El usuario no podrá:

- Crear o modificar cursos.
- Crear o modificar lecciones.
- Administrar archivos multimedia.
- Consultar información privada de otros usuarios.
- Consultar el progreso de otras personas.
- Acceder al panel administrativo.
- Consultar registros de auditoría.
- Modificar la configuración general.
- Cambiar su propio rol.

---

## 4.3 Administrador

El administrador tendrá el rol:

```text
ADMIN
```

En la versión 1 existirá un único administrador general.

El administrador tendrá acceso a todas las funciones administrativas, incluyendo:

- Administración de usuarios.
- Administración de cursos.
- Administración de niveles, unidades y lecciones.
- Gestión de contenido educativo.
- Administración de vocabulario.
- Gestión de archivos multimedia.
- Creación de ejercicios y evaluaciones.
- Consulta del progreso de los usuarios.
- Envío de notificaciones.
- Consulta de reportes.
- Consulta de auditoría.
- Configuración general de la plataforma.

El administrador también podrá acceder a las funciones disponibles para un usuario normal.

---

# 5. Diferencia entre rol y tipo de perfil

El rol y el tipo de perfil tendrán funciones distintas.

## Rol

Determina los permisos reales dentro del sistema.

```text
ADMIN → Acceso administrativo
USER  → Acceso educativo
```

## Tipo de perfil

Describe el tipo de usuario, pero no modifica sus permisos.

```text
STUDENT → Estudiante
TEACHER → Docente
OTHER   → Otro tipo de participante
```

Ejemplo:

| Persona               | Rol   | Tipo de perfil | Permisos                |
| --------------------- | ----- | -------------- | ----------------------- |
| Administrador general | ADMIN | OTHER          | Administración completa |
| Estudiante            | USER  | STUDENT        | Acceso educativo        |
| Docente               | USER  | TEACHER        | Acceso educativo        |
| Persona interesada    | USER  | OTHER          | Acceso educativo        |

En la versión 1, un docente no podrá crear cursos únicamente por tener el tipo de perfil `TEACHER`.

---

# 6. Estados de una cuenta

Las cuentas podrán utilizar los siguientes estados:

```text
PENDING
ACTIVE
BLOCKED
DISABLED
```

## 6.1 PENDING

Cuenta creada, pero con el correo todavía sin confirmar.

Permitido:

- Confirmar correo.
- Solicitar reenvío de confirmación.

No permitido:

- Iniciar sesión.
- Acceder a contenido privado.

## 6.2 ACTIVE

Cuenta confirmada y habilitada.

Permitido:

- Iniciar sesión.
- Utilizar las funciones correspondientes a su rol.

## 6.3 BLOCKED

Cuenta bloqueada por el administrador, generalmente por una situación de seguridad o incumplimiento.

No permitido:

- Iniciar sesión.
- Acceder a funciones privadas.

## 6.4 DISABLED

Cuenta desactivada administrativamente.

No permitido:

- Iniciar sesión.
- Acceder a funciones privadas.

La desactivación no deberá eliminar automáticamente los datos históricos del usuario.

---

# 7. Operaciones de permisos

La matriz utilizará las siguientes operaciones:

| Operación   | Descripción                                     |
| ----------- | ----------------------------------------------- |
| Ver         | Consultar información                           |
| Crear       | Registrar un nuevo recurso                      |
| Editar      | Modificar un recurso existente                  |
| Eliminar    | Retirar un recurso                              |
| Publicar    | Hacer visible el contenido                      |
| Administrar | Ejecutar todas las operaciones autorizadas      |
| Propio      | Acceso limitado a datos del usuario autenticado |
| Todos       | Acceso a información de cualquier usuario       |

---

# 8. Matriz general de permisos

| Función                     | Visitante |      USER |     ADMIN |
| --------------------------- | --------: | --------: | --------: |
| Ver página principal        |        Sí |        Sí |        Sí |
| Registrarse                 |        Sí | No aplica | No aplica |
| Confirmar correo            |        Sí |        Sí |        Sí |
| Iniciar sesión              |        Sí |        Sí |        Sí |
| Recuperar contraseña        |        Sí |        Sí |        Sí |
| Cerrar sesión               |        No |        Sí |        Sí |
| Ver perfil propio           |        No |        Sí |        Sí |
| Editar perfil propio        |        No |        Sí |        Sí |
| Cambiar contraseña propia   |        No |        Sí |        Sí |
| Ver cursos públicos         |        Sí |        Sí |        Sí |
| Ver cursos publicados       |  Limitado |        Sí |        Sí |
| Completar lecciones         |        No |        Sí |        Sí |
| Resolver evaluaciones       |        No |        Sí |        Sí |
| Consultar progreso propio   |        No |        Sí |        Sí |
| Consultar progreso de otros |        No |        No |        Sí |
| Administrar usuarios        |        No |        No |        Sí |
| Administrar cursos          |        No |        No |        Sí |
| Administrar lecciones       |        No |        No |        Sí |
| Administrar multimedia      |        No |        No |        Sí |
| Administrar evaluaciones    |        No |        No |        Sí |
| Enviar avisos generales     |        No |        No |        Sí |
| Consultar auditoría         |        No |        No |        Sí |
| Modificar configuración     |        No |        No |        Sí |

---

# 9. Permisos de autenticación

| Acción                         |     Visitante |          USER |             ADMIN |
| ------------------------------ | ------------: | ------------: | ----------------: |
| Acceder al registro            |            Sí |  No necesario |      No necesario |
| Crear cuenta USER              |            Sí |            No |                No |
| Crear cuenta ADMIN             |            No |            No | No desde interfaz |
| Confirmar correo propio        |            Sí |            Sí |                Sí |
| Reenviar confirmación          |            Sí |            Sí |                Sí |
| Iniciar sesión                 |            Sí |            Sí |                Sí |
| Cerrar sesión                  |            No |            Sí |                Sí |
| Solicitar recuperación         |            Sí |            Sí |                Sí |
| Restablecer contraseña         | Sí, con token | Sí, con token |     Sí, con token |
| Cambiar contraseña autenticado |            No |            Sí |                Sí |

La creación del administrador inicial deberá realizarse mediante:

- Script de inicialización.
- Archivo `seed`.
- Comando administrativo seguro.

No deberá existir un formulario público para registrar administradores.

---

# 10. Permisos de usuarios y perfiles

| Acción                           |                       USER |           ADMIN |
| -------------------------------- | -------------------------: | --------------: |
| Consultar perfil propio          |                         Sí |              Sí |
| Editar perfil propio             |                         Sí |              Sí |
| Cambiar fotografía propia        |                         Sí |              Sí |
| Cambiar tipo de perfil propio    |                         Sí |              Sí |
| Cambiar rol propio               |                         No | No desde perfil |
| Consultar lista de usuarios      |                         No |              Sí |
| Consultar perfil de otro usuario |                         No |              Sí |
| Buscar usuarios                  |                         No |              Sí |
| Filtrar usuarios                 |                         No |              Sí |
| Activar cuentas                  |                         No |              Sí |
| Bloquear cuentas                 |                         No |              Sí |
| Desactivar cuentas               |                         No |              Sí |
| Consultar último acceso          | Solo propio, si se muestra |              Sí |
| Eliminar cuentas                 |                         No |     Restringido |
| Consultar progreso de otros      |                         No |              Sí |

La eliminación definitiva de usuarios deberá manejarse con precaución debido a sus relaciones con:

- Progreso.
- Evaluaciones.
- Auditoría.
- Notificaciones.
- Actividad histórica.

Para la versión 1 se recomienda utilizar desactivación en lugar de eliminación definitiva.

---

# 11. Permisos de cursos

| Acción                       |           Visitante | USER | ADMIN |
| ---------------------------- | ------------------: | ---: | ----: |
| Consultar cursos públicos    |                  Sí |   Sí |    Sí |
| Consultar cursos publicados  | Según configuración |   Sí |    Sí |
| Consultar cursos en borrador |                  No |   No |    Sí |
| Crear cursos                 |                  No |   No |    Sí |
| Editar cursos                |                  No |   No |    Sí |
| Publicar cursos              |                  No |   No |    Sí |
| Despublicar cursos           |                  No |   No |    Sí |
| Eliminar cursos              |                  No |   No |    Sí |
| Ordenar cursos               |                  No |   No |    Sí |
| Agregar portada              |                  No |   No |    Sí |

---

# 12. Permisos de niveles, unidades y lecciones

| Acción                    | Visitante | USER | ADMIN |
| ------------------------- | --------: | ---: | ----: |
| Ver contenido publicado   |  Limitado |   Sí |    Sí |
| Ver contenido en borrador |        No |   No |    Sí |
| Crear niveles             |        No |   No |    Sí |
| Editar niveles            |        No |   No |    Sí |
| Eliminar niveles          |        No |   No |    Sí |
| Crear unidades            |        No |   No |    Sí |
| Editar unidades           |        No |   No |    Sí |
| Eliminar unidades         |        No |   No |    Sí |
| Crear lecciones           |        No |   No |    Sí |
| Editar lecciones          |        No |   No |    Sí |
| Publicar lecciones        |        No |   No |    Sí |
| Despublicar lecciones     |        No |   No |    Sí |
| Eliminar lecciones        |        No |   No |    Sí |
| Ordenar contenido         |        No |   No |    Sí |
| Marcar lección completada |        No |   Sí |    Sí |

---

# 13. Permisos de contenido educativo

| Acción                        | USER | ADMIN |
| ----------------------------- | ---: | ----: |
| Ver bloques publicados        |   Sí |    Sí |
| Crear bloques                 |   No |    Sí |
| Editar bloques                |   No |    Sí |
| Eliminar bloques              |   No |    Sí |
| Cambiar orden de bloques      |   No |    Sí |
| Previsualizar borradores      |   No |    Sí |
| Reproducir audio              |   Sí |    Sí |
| Reproducir video              |   Sí |    Sí |
| Descargar material autorizado |   Sí |    Sí |

---

# 14. Permisos de vocabulario

| Acción                               |           Visitante | USER | ADMIN |
| ------------------------------------ | ------------------: | ---: | ----: |
| Consultar vocabulario público        | Según configuración |   Sí |    Sí |
| Buscar vocabulario                   |            Limitado |   Sí |    Sí |
| Reproducir pronunciación             |            Limitado |   Sí |    Sí |
| Crear vocabulario                    |                  No |   No |    Sí |
| Editar vocabulario                   |                  No |   No |    Sí |
| Eliminar vocabulario                 |                  No |   No |    Sí |
| Publicar vocabulario                 |                  No |   No |    Sí |
| Relacionar vocabulario con lecciones |                  No |   No |    Sí |

---

# 15. Permisos de multimedia

| Acción                              | Visitante | USER |       ADMIN |
| ----------------------------------- | --------: | ---: | ----------: |
| Ver archivos públicos autorizados   |        Sí |   Sí |          Sí |
| Reproducir multimedia educativa     |  Limitado |   Sí |          Sí |
| Descargar documentos autorizados    |  Limitado |   Sí |          Sí |
| Consultar biblioteca administrativa |        No |   No |          Sí |
| Cargar archivos                     |        No |   No |          Sí |
| Editar metadatos                    |        No |   No |          Sí |
| Eliminar archivos                   |        No |   No |          Sí |
| Consultar espacio utilizado         |        No |   No |          Sí |
| Acceder a consola de MinIO          |        No |   No | Restringido |

El acceso del administrador a la consola de MinIO deberá utilizarse únicamente para mantenimiento técnico.

Las operaciones normales deberán realizarse desde el panel administrativo de la plataforma.

---

# 16. Permisos de ejercicios y evaluaciones

| Acción                            | USER | ADMIN |
| --------------------------------- | ---: | ----: |
| Consultar evaluaciones publicadas |   Sí |    Sí |
| Resolver evaluaciones             |   Sí |    Sí |
| Consultar resultados propios      |   Sí |    Sí |
| Consultar resultados de otros     |   No |    Sí |
| Crear evaluaciones                |   No |    Sí |
| Editar evaluaciones               |   No |    Sí |
| Eliminar evaluaciones             |   No |    Sí |
| Publicar evaluaciones             |   No |    Sí |
| Crear preguntas                   |   No |    Sí |
| Definir respuestas correctas      |   No |    Sí |
| Definir puntuaciones              |   No |    Sí |
| Configurar intentos               |   No |    Sí |

El usuario no deberá recibir las respuestas correctas antes de enviar una evaluación.

---

# 17. Permisos de progreso

| Acción                                |        USER |       ADMIN |
| ------------------------------------- | ----------: | ----------: |
| Iniciar un curso                      |          Sí |          Sí |
| Marcar lección propia como completada |          Sí |          Sí |
| Ver progreso propio                   |          Sí |          Sí |
| Ver progreso de otro usuario          |          No |          Sí |
| Filtrar progreso por curso            | Solo propio |          Sí |
| Consultar cursos completados propios  |          Sí |          Sí |
| Modificar manualmente progreso        |          No | Restringido |
| Eliminar progreso                     |          No | Restringido |

La modificación manual del progreso deberá evitarse en la versión 1, salvo que se establezca una función administrativa específica.

---

# 18. Permisos de notificaciones

| Acción                                   | USER |                    ADMIN |
| ---------------------------------------- | ---: | -----------------------: |
| Ver notificaciones propias               |   Sí |                       Sí |
| Marcar notificación propia como leída    |   Sí |                       Sí |
| Eliminar notificación de su vista        |   Sí |                       Sí |
| Enviar aviso general                     |   No |                       Sí |
| Enviar aviso individual                  |   No |                       Sí |
| Consultar estado de envíos               |   No |                       Sí |
| Consultar notificaciones de otro usuario |   No | Sí, cuando sea necesario |

---

# 19. Permisos del panel administrativo

| Sección                  | USER | ADMIN |
| ------------------------ | ---: | ----: |
| Dashboard administrativo |   No |    Sí |
| Usuarios                 |   No |    Sí |
| Cursos                   |   No |    Sí |
| Niveles                  |   No |    Sí |
| Unidades                 |   No |    Sí |
| Lecciones                |   No |    Sí |
| Vocabulario              |   No |    Sí |
| Multimedia               |   No |    Sí |
| Evaluaciones             |   No |    Sí |
| Progreso general         |   No |    Sí |
| Notificaciones generales |   No |    Sí |
| Reportes                 |   No |    Sí |
| Auditoría                |   No |    Sí |
| Configuración            |   No |    Sí |

---

# 20. Permisos de auditoría

| Acción                            | USER | ADMIN |
| --------------------------------- | ---: | ----: |
| Consultar auditoría               |   No |    Sí |
| Buscar registros                  |   No |    Sí |
| Filtrar por fecha                 |   No |    Sí |
| Filtrar por acción                |   No |    Sí |
| Filtrar por usuario               |   No |    Sí |
| Crear registros manualmente       |   No |    No |
| Modificar registros               |   No |    No |
| Eliminar registros desde interfaz |   No |    No |

Los registros de auditoría deberán generarse automáticamente.

No deberán poder modificarse desde el panel administrativo.

---

# 21. Permisos de configuración

| Acción                              |     USER |             ADMIN |
| ----------------------------------- | -------: | ----------------: |
| Ver configuración pública           | Limitado |                Sí |
| Modificar nombre de plataforma      |       No |                Sí |
| Modificar información institucional |       No |                Sí |
| Configurar registro de usuarios     |       No |                Sí |
| Configurar límites de archivos      |       No |                Sí |
| Configurar expiración de tokens     |       No |                Sí |
| Configurar contenido público        |       No |                Sí |
| Modificar credenciales técnicas     |       No | Fuera de interfaz |

Las credenciales de PostgreSQL, MinIO, SMTP y Cloudflare no deberán modificarse desde el panel web.

Estas credenciales deberán administrarse mediante variables de entorno y configuración del servidor.

---

# 22. Reglas de autorización

## 22.1 Validación en el backend

Todos los permisos deberán verificarse en Express.

Ejemplo:

```text
Solicitud
   ↓
Autenticación
   ↓
Verificación de sesión
   ↓
Verificación de rol
   ↓
Verificación de propiedad
   ↓
Ejecución de la operación
```

El frontend podrá ocultar botones o páginas, pero esto no sustituirá la validación del backend.

## 22.2 Principio de menor privilegio

Cada usuario deberá recibir únicamente los permisos necesarios para utilizar la plataforma.

## 22.3 Denegación por defecto

Cuando no exista un permiso definido, el acceso deberá rechazarse.

## 22.4 Verificación de propiedad

Un usuario podrá consultar o modificar únicamente sus propios datos cuando el recurso sea personal.

Ejemplos:

- Perfil propio.
- Progreso propio.
- Evaluaciones propias.
- Notificaciones propias.
- Sesiones propias.

## 22.5 Separación administrativa

Las funciones de administración deberán mantenerse separadas de las rutas educativas normales.

---

# 23. Protección de rutas del backend

Las rutas públicas no requerirán sesión.

Ejemplos:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/public/courses
```

Las rutas de usuario requerirán una sesión válida.

Ejemplos:

```text
GET   /api/users/me
PATCH /api/users/me
GET   /api/progress/me
GET   /api/notifications/me
POST  /api/quizzes/:id/attempts
```

Las rutas administrativas requerirán el rol `ADMIN`.

Ejemplos:

```text
GET    /api/admin/users
POST   /api/admin/courses
PATCH  /api/admin/courses/:id
DELETE /api/admin/courses/:id
POST   /api/admin/media
GET    /api/admin/audit
```

---

# 24. Middlewares recomendados

El backend deberá contar con middlewares equivalentes a:

```text
authenticate
authorize
validate
rateLimit
errorHandler
```

## authenticate

Verifica que exista una sesión válida.

## authorize

Verifica que el usuario posea el rol requerido.

Ejemplo conceptual:

```typescript
authorize("ADMIN");
```

## validate

Valida parámetros, cuerpo y consultas de la solicitud.

## rateLimit

Limita solicitudes repetidas en rutas sensibles.

## errorHandler

Controla y normaliza los errores enviados al cliente.

---

# 25. Protección del frontend

Next.js deberá proteger las áreas privadas.

Grupos principales:

```text
(public)
(platform)
(admin)
```

## Área pública

Disponible sin sesión:

- Inicio.
- Acerca de.
- Registro.
- Inicio de sesión.
- Recuperación de contraseña.

## Área de plataforma

Disponible para `USER` y `ADMIN`:

- Dashboard personal.
- Cursos.
- Lecciones.
- Vocabulario.
- Evaluaciones.
- Progreso.
- Notificaciones.
- Perfil.

## Área administrativa

Disponible únicamente para `ADMIN`:

- Usuarios.
- Cursos.
- Contenido.
- Multimedia.
- Evaluaciones.
- Reportes.
- Auditoría.
- Configuración.

Aunque Next.js rechace una navegación, Express deberá validar nuevamente los permisos.

---

# 26. Sesiones

Cada sesión deberá estar asociada con:

- Usuario.
- Identificador de sesión.
- Fecha de creación.
- Fecha de expiración.
- Estado.
- Información básica del dispositivo, cuando sea necesaria.
- Dirección IP, cuando corresponda.

El sistema deberá permitir:

- Crear una sesión al iniciar correctamente.
- Validar la sesión en cada solicitud protegida.
- Expirar automáticamente una sesión.
- Cerrar la sesión solicitada.
- Invalidar sesiones después de restablecer una contraseña.
- Rechazar sesiones de cuentas bloqueadas o desactivadas.

---

# 27. Reglas especiales del administrador

Debido a que existirá un único administrador, deberán considerarse las siguientes reglas:

1. El administrador inicial no podrá registrarse mediante el formulario público.

2. La cuenta administrativa deberá crearse mediante un proceso seguro.

3. La cuenta administrativa deberá utilizar una contraseña fuerte.

4. El administrador no deberá poder bloquear accidentalmente su propia cuenta desde la interfaz.

5. El administrador no deberá poder desactivar accidentalmente su propia cuenta.

6. El rol del único administrador no deberá poder cambiarse desde el perfil.

7. Las acciones críticas deberán solicitar confirmación.

8. Las acciones administrativas deberán registrarse en auditoría.

9. El correo del administrador deberá mantenerse actualizado.

10. La recuperación de la cuenta administrativa deberá protegerse especialmente.

---

# 28. Acciones críticas

Se considerarán acciones críticas:

- Bloquear una cuenta.
- Desactivar una cuenta.
- Eliminar un curso.
- Eliminar una unidad.
- Eliminar una lección.
- Eliminar una evaluación.
- Eliminar un archivo.
- Despublicar contenido.
- Cambiar la configuración.
- Eliminar información relacionada con progreso.

Estas acciones deberán:

- Requerir sesión válida.
- Requerir rol `ADMIN`.
- Solicitar confirmación.
- Validarse en el backend.
- Registrar auditoría.
- Mostrar un resultado comprensible.

---

# 29. Respuestas de acceso

Cuando una solicitud no esté autorizada, el backend deberá responder de forma apropiada.

## Sin sesión válida

```text
401 Unauthorized
```

Ejemplo de mensaje:

```json
{
  "error": "AUTHENTICATION_REQUIRED",
  "message": "Debes iniciar sesión para acceder a este recurso."
}
```

## Sin permisos suficientes

```text
403 Forbidden
```

Ejemplo de mensaje:

```json
{
  "error": "INSUFFICIENT_PERMISSIONS",
  "message": "No tienes permisos para realizar esta acción."
}
```

## Recurso no encontrado

```text
404 Not Found
```

## Datos inválidos

```text
400 Bad Request
```

Los mensajes no deberán revelar información interna sensible.

---

# 30. Representación inicial en Prisma

Los roles y perfiles podrán representarse mediante enumeraciones.

```prisma
enum Role {
  ADMIN
  USER
}

enum ProfileType {
  STUDENT
  TEACHER
  OTHER
}

enum AccountStatus {
  PENDING
  ACTIVE
  BLOCKED
  DISABLED
}
```

Ejemplo conceptual del modelo de usuario:

```prisma
model User {
  id            String        @id @default(uuid())
  firstName     String
  lastName      String
  email         String        @unique
  passwordHash  String
  role          Role          @default(USER)
  profileType   ProfileType   @default(STUDENT)
  status        AccountStatus @default(PENDING)
  emailVerified Boolean       @default(false)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  lastLoginAt   DateTime?
}
```

Este modelo es únicamente una referencia inicial y podrá ampliarse durante el diseño de la base de datos.

---

# 31. Casos de validación de permisos

## Caso 1: usuario intenta acceder al panel administrativo

Resultado esperado:

- La interfaz no muestra el acceso.
- Next.js bloquea la navegación.
- Express rechaza la solicitud con código `403`.
- No se ejecuta ninguna operación administrativa.

## Caso 2: visitante intenta consultar progreso

Resultado esperado:

- Express responde con código `401`.
- Se solicita iniciar sesión.

## Caso 3: usuario intenta consultar el progreso de otra persona

Resultado esperado:

- Express verifica la propiedad del recurso.
- La solicitud es rechazada con código `403`.

## Caso 4: administrador crea un curso

Resultado esperado:

- La sesión es validada.
- El rol `ADMIN` es confirmado.
- El curso se crea en estado borrador.
- La acción se registra en auditoría.

## Caso 5: cuenta bloqueada intenta iniciar sesión

Resultado esperado:

- El sistema valida las credenciales.
- Detecta el estado `BLOCKED`.
- Rechaza el acceso.
- No crea una sesión.

---

# 32. Criterios de aceptación

El control de usuarios y permisos se considerará correctamente implementado cuando:

1. Los visitantes accedan únicamente a funciones públicas.

2. Los usuarios puedan acceder únicamente a las funciones educativas autorizadas.

3. Los usuarios no puedan acceder al panel administrativo.

4. El administrador pueda acceder a todas las funciones administrativas.

5. Los permisos sean validados en Express.

6. Las páginas privadas sean protegidas en Next.js.

7. Un usuario no pueda consultar datos privados de otro usuario.

8. Una cuenta bloqueada no pueda iniciar sesión.

9. Una cuenta desactivada no pueda iniciar sesión.

10. Una cuenta pendiente no pueda acceder hasta confirmar el correo.

11. Los usuarios no puedan modificar su propio rol.

12. No exista registro público para administradores.

13. Las operaciones críticas soliciten confirmación.

14. Las operaciones administrativas se registren en auditoría.

15. Los errores de acceso utilicen respuestas `401` o `403` según corresponda.

16. Las pruebas de autorización confirmen accesos permitidos y rechazados.

---

# 33. Resumen de roles

| Actor o rol | Descripción                                             |
| ----------- | ------------------------------------------------------- |
| Visitante   | Acceso únicamente a información y procesos públicos     |
| USER        | Acceso educativo y administración de información propia |
| ADMIN       | Control completo de usuarios, contenido y configuración |

---

# 34. Decisiones para la versión 1

Para la primera versión se establecen las siguientes decisiones:

- Existirán únicamente los roles `ADMIN` y `USER`.
- Existirá un único administrador.
- Estudiantes y docentes compartirán los mismos permisos.
- El tipo de perfil será únicamente informativo.
- Los usuarios no podrán crear contenido educativo.
- Las cuentas se desactivarán en lugar de eliminarse cuando sea posible.
- Todos los permisos deberán validarse en el backend.
- La administración se realizará desde un panel privado.
- La arquitectura quedará preparada para incorporar nuevos roles en versiones futuras.

---

# 35. Aprobación del documento

| Responsable | Cargo o función             | Firma | Fecha |
| ----------- | --------------------------- | ----- | ----- |
|             | Responsable del proyecto    |       |       |
|             | Representante institucional |       |       |
|             | Revisor                     |       |       |
