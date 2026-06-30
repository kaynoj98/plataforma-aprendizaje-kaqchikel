# Casos de uso

## Plataforma web para el aprendizaje del idioma kaqchikel

**Institución:** Dirección General de Educación Bilingüe Intercultural —DIGEBI—, Ministerio de Educación de Guatemala
**Nombre del proyecto:** Plataforma web para el aprendizaje del idioma kaqchikel
**Versión del documento:** 1.0
**Versión del sistema:** Versión 1
**Estado:** Definición inicial
**Fecha:** Junio de 2026

---

## 1. Introducción

El presente documento describe los casos de uso principales de la primera versión de la plataforma web para el aprendizaje del idioma kaqchikel.

Un caso de uso representa una interacción entre un actor y el sistema para alcanzar un objetivo específico.

Cada caso de uso será identificado mediante el formato:

```text
CU-001
CU-002
CU-003
```

Los casos de uso servirán como referencia para:

- Diseñar pantallas.
- Definir rutas de la API.
- Diseñar la base de datos.
- Elaborar diagramas UML.
- Implementar pruebas.
- Validar requisitos funcionales.
- Organizar el desarrollo.

---

## 2. Objetivo del documento

Definir las principales interacciones entre los actores y la plataforma, indicando:

- Actor principal.
- Objetivo.
- Condiciones previas.
- Flujo principal.
- Flujos alternativos.
- Excepciones.
- Resultado esperado.
- Requisitos relacionados.

---

## 3. Actores

### 3.1 Visitante

Persona que accede a la plataforma sin iniciar sesión.

### 3.2 Usuario

Persona registrada con rol `USER`.

Puede tener como tipo de perfil:

- Estudiante.
- Docente.
- Otro.

### 3.3 Administrador

Persona con rol `ADMIN` y acceso completo a las funciones administrativas.

### 3.4 Sistema

Procesos automáticos ejecutados por la plataforma.

Ejemplos:

- Envío de correos.
- Cálculo de progreso.
- Calificación de evaluaciones.
- Registro de auditoría.
- Generación de respaldos.

### 3.5 Servicio de correo

Servicio externo utilizado para enviar:

- Confirmaciones de cuenta.
- Recuperaciones de contraseña.
- Avisos.
- Notificaciones.

### 3.6 MinIO

Servicio encargado del almacenamiento de archivos multimedia.

### 3.7 PostgreSQL

Servicio encargado de almacenar información estructurada.

---

## 4. Relación general de casos de uso

| Código | Caso de uso                      | Actor principal         |
| ------ | -------------------------------- | ----------------------- |
| CU-001 | Registrar usuario                | Visitante               |
| CU-002 | Confirmar correo electrónico     | Visitante               |
| CU-003 | Reenviar confirmación            | Visitante               |
| CU-004 | Iniciar sesión                   | Usuario o administrador |
| CU-005 | Cerrar sesión                    | Usuario o administrador |
| CU-006 | Recuperar contraseña             | Visitante               |
| CU-007 | Restablecer contraseña           | Visitante               |
| CU-008 | Consultar perfil                 | Usuario                 |
| CU-009 | Actualizar perfil                | Usuario                 |
| CU-010 | Cambiar contraseña               | Usuario                 |
| CU-011 | Consultar cursos                 | Usuario                 |
| CU-012 | Iniciar curso                    | Usuario                 |
| CU-013 | Consultar estructura del curso   | Usuario                 |
| CU-014 | Consultar lección                | Usuario                 |
| CU-015 | Reproducir contenido multimedia  | Usuario                 |
| CU-016 | Consultar vocabulario            | Usuario                 |
| CU-017 | Realizar evaluación              | Usuario                 |
| CU-018 | Consultar resultados             | Usuario                 |
| CU-019 | Marcar lección como completada   | Usuario                 |
| CU-020 | Consultar progreso               | Usuario                 |
| CU-021 | Consultar notificaciones         | Usuario                 |
| CU-022 | Administrar usuarios             | Administrador           |
| CU-023 | Crear curso                      | Administrador           |
| CU-024 | Administrar estructura educativa | Administrador           |
| CU-025 | Crear y editar lección           | Administrador           |
| CU-026 | Administrar vocabulario          | Administrador           |
| CU-027 | Cargar archivo multimedia        | Administrador           |
| CU-028 | Administrar evaluaciones         | Administrador           |
| CU-029 | Publicar contenido               | Administrador           |
| CU-030 | Consultar progreso general       | Administrador           |
| CU-031 | Enviar notificación              | Administrador           |
| CU-032 | Consultar reportes               | Administrador           |
| CU-033 | Consultar auditoría              | Administrador           |
| CU-034 | Modificar configuración          | Administrador           |
| CU-035 | Registrar auditoría              | Sistema                 |
| CU-036 | Ejecutar respaldo                | Sistema                 |

---

# 5. CU-001: Registrar usuario

## Actor principal

Visitante.

## Objetivo

Crear una nueva cuenta de usuario.

## Precondiciones

- El visitante no debe tener una sesión activa.
- El registro de usuarios debe estar habilitado.
- El correo no debe estar registrado previamente.

## Flujo principal

1. El visitante accede al formulario de registro.
2. El sistema muestra los campos requeridos.
3. El visitante ingresa:
   - Nombre.
   - Apellidos.
   - Correo electrónico.
   - Contraseña.
   - Confirmación de contraseña.
   - Tipo de perfil.

4. El visitante envía el formulario.
5. El sistema valida los datos.
6. El sistema verifica que el correo no esté registrado.
7. El sistema cifra la contraseña.
8. El sistema crea la cuenta con rol `USER`.
9. El sistema establece el estado `PENDING`.
10. El sistema genera un token de confirmación.
11. El sistema envía el correo de confirmación.
12. El sistema muestra un mensaje de registro exitoso.

## Flujo alternativo

- El correo ya está registrado.
- La contraseña no cumple las condiciones.
- Las contraseñas no coinciden.
- El tipo de perfil no es válido.
- El servicio de correo no responde.

## Resultado esperado

La cuenta queda registrada y pendiente de confirmación.

## Requisitos relacionados

RF-001 a RF-013.

---

# 6. CU-002: Confirmar correo electrónico

## Actor principal

Visitante.

## Objetivo

Activar una cuenta mediante el enlace enviado al correo.

## Precondiciones

- Debe existir una cuenta pendiente.
- El token debe ser válido.
- El token no debe haber expirado.

## Flujo principal

1. El visitante abre el enlace de confirmación.
2. El sistema recibe el token.
3. El sistema busca el token en la base de datos.
4. El sistema verifica que no haya expirado.
5. El sistema verifica que no haya sido utilizado.
6. El sistema marca el correo como confirmado.
7. El sistema cambia el estado de la cuenta a `ACTIVE`.
8. El sistema invalida el token.
9. El sistema envía un correo de bienvenida.
10. El sistema muestra un mensaje de confirmación exitosa.

## Flujos alternativos

- El token no existe.
- El token expiró.
- El token ya fue utilizado.
- La cuenta ya estaba confirmada.

## Resultado esperado

La cuenta queda activa y habilitada para iniciar sesión.

## Requisitos relacionados

RF-014 a RF-022.

---

# 7. CU-003: Reenviar correo de confirmación

## Actor principal

Visitante.

## Objetivo

Solicitar un nuevo enlace de confirmación.

## Precondiciones

- La cuenta debe existir.
- El correo no debe estar confirmado.
- La cuenta no debe estar bloqueada.

## Flujo principal

1. El visitante accede a la opción de reenvío.
2. Ingresa su correo electrónico.
3. El sistema verifica la cuenta.
4. El sistema invalida tokens anteriores.
5. El sistema genera un nuevo token.
6. El sistema envía un nuevo correo.
7. El sistema muestra un mensaje de confirmación.

## Flujo alternativo

- La cuenta no existe.
- La cuenta ya está confirmada.
- Se supera el límite de solicitudes.
- El servicio de correo no está disponible.

## Resultado esperado

El usuario recibe un nuevo enlace de confirmación.

---

# 8. CU-004: Iniciar sesión

## Actor principal

Usuario o administrador.

## Objetivo

Acceder a la plataforma mediante credenciales válidas.

## Precondiciones

- La cuenta debe existir.
- El correo debe estar confirmado.
- La cuenta debe estar activa.

## Flujo principal

1. El actor abre el formulario de inicio de sesión.
2. Ingresa correo y contraseña.
3. El sistema valida el formato.
4. El sistema busca la cuenta.
5. El sistema verifica la contraseña.
6. El sistema comprueba el estado de la cuenta.
7. El sistema crea una sesión.
8. El sistema establece una cookie `httpOnly`.
9. El sistema registra el último acceso.
10. El sistema redirige al área correspondiente.

## Flujos alternativos

- Credenciales incorrectas.
- Cuenta pendiente.
- Cuenta bloqueada.
- Cuenta desactivada.
- Demasiados intentos fallidos.

## Resultado esperado

El usuario accede a la plataforma con una sesión válida.

## Requisitos relacionados

RF-023 a RF-032.

---

# 9. CU-005: Cerrar sesión

## Actor principal

Usuario o administrador.

## Objetivo

Finalizar la sesión activa.

## Precondiciones

- Debe existir una sesión válida.

## Flujo principal

1. El actor selecciona cerrar sesión.
2. El sistema identifica la sesión.
3. El sistema invalida la sesión.
4. El sistema elimina o invalida la cookie.
5. El sistema redirige a la página pública.

## Resultado esperado

La sesión deja de ser válida.

## Requisitos relacionados

RF-033 a RF-035.

---

# 10. CU-006: Recuperar contraseña

## Actor principal

Visitante.

## Objetivo

Solicitar un enlace para restablecer la contraseña.

## Precondiciones

- La cuenta debe existir.
- La cuenta no debe estar desactivada definitivamente.

## Flujo principal

1. El visitante abre el formulario de recuperación.
2. Ingresa su correo.
3. El sistema valida el correo.
4. El sistema busca la cuenta.
5. El sistema genera un token.
6. El sistema define su expiración.
7. El sistema envía el correo de recuperación.
8. El sistema muestra un mensaje general.

## Flujo alternativo

- La cuenta no existe.
- Se supera el límite de solicitudes.
- El servicio de correo falla.

## Resultado esperado

Se envía un enlace de recuperación cuando la cuenta es válida.

## Requisitos relacionados

RF-036 a RF-040.

---

# 11. CU-007: Restablecer contraseña

## Actor principal

Visitante.

## Objetivo

Crear una nueva contraseña mediante un enlace válido.

## Precondiciones

- El token debe existir.
- El token no debe estar expirado.
- El token no debe haber sido utilizado.

## Flujo principal

1. El visitante abre el enlace.
2. El sistema valida el token.
3. El visitante ingresa la nueva contraseña.
4. Confirma la nueva contraseña.
5. El sistema valida ambas contraseñas.
6. El sistema cifra la nueva contraseña.
7. El sistema actualiza la cuenta.
8. El sistema invalida el token.
9. El sistema invalida las sesiones anteriores.
10. El sistema envía una notificación.
11. El sistema muestra el resultado.

## Resultado esperado

La contraseña queda actualizada.

## Requisitos relacionados

RF-041 a RF-047.

---

# 12. CU-008: Consultar perfil

## Actor principal

Usuario.

## Objetivo

Visualizar la información de su cuenta.

## Precondiciones

- Debe existir una sesión válida.

## Flujo principal

1. El usuario accede a su perfil.
2. El sistema identifica al usuario autenticado.
3. El sistema consulta la información.
4. El sistema muestra:
   - Nombre.
   - Apellidos.
   - Correo.
   - Tipo de perfil.
   - Fotografía.
   - Fecha de registro.

## Resultado esperado

El usuario consulta únicamente su propia información.

---

# 13. CU-009: Actualizar perfil

## Actor principal

Usuario.

## Objetivo

Modificar los datos personales permitidos.

## Precondiciones

- El usuario debe estar autenticado.

## Flujo principal

1. El usuario abre la edición de perfil.
2. Modifica sus datos.
3. El sistema valida la información.
4. El sistema actualiza el registro.
5. El sistema muestra un mensaje de éxito.

## Flujos alternativos

- Datos inválidos.
- Fotografía no permitida.
- Error al almacenar el archivo.

## Resultado esperado

El perfil queda actualizado.

## Requisitos relacionados

RF-048 a RF-057.

---

# 14. CU-010: Cambiar contraseña

## Actor principal

Usuario.

## Objetivo

Modificar la contraseña desde una sesión autenticada.

## Precondiciones

- Debe existir una sesión válida.

## Flujo principal

1. El usuario abre la opción de seguridad.
2. Ingresa la contraseña actual.
3. Ingresa y confirma la nueva contraseña.
4. El sistema verifica la contraseña actual.
5. El sistema valida la nueva contraseña.
6. El sistema cifra la nueva contraseña.
7. El sistema actualiza la cuenta.
8. El sistema notifica el cambio.

## Resultado esperado

La contraseña queda modificada.

## Requisitos relacionados

RF-058 a RF-063.

---

# 15. CU-011: Consultar cursos

## Actor principal

Usuario.

## Objetivo

Consultar el catálogo de cursos publicados.

## Precondiciones

- El usuario debe estar autenticado.
- Deben existir cursos publicados.

## Flujo principal

1. El usuario accede a cursos.
2. El sistema consulta los cursos publicados.
3. El sistema ordena los resultados.
4. El sistema muestra:
   - Nombre.
   - Portada.
   - Descripción.
   - Nivel.
   - Progreso, cuando exista.

5. El usuario selecciona un curso.

## Resultado esperado

El usuario visualiza únicamente cursos disponibles.

---

# 16. CU-012: Iniciar curso

## Actor principal

Usuario.

## Objetivo

Comenzar el contenido de un curso.

## Precondiciones

- El usuario debe estar autenticado.
- El curso debe estar publicado.

## Flujo principal

1. El usuario consulta el curso.
2. Selecciona iniciar curso.
3. El sistema verifica si ya existe progreso.
4. Si no existe, crea el registro de progreso.
5. El sistema registra la fecha de inicio.
6. El sistema muestra la primera unidad o lección.

## Resultado esperado

El curso aparece dentro de los cursos iniciados del usuario.

---

# 17. CU-013: Consultar estructura del curso

## Actor principal

Usuario.

## Objetivo

Visualizar niveles, unidades y lecciones disponibles.

## Precondiciones

- El curso debe estar publicado.
- El usuario debe tener acceso.

## Flujo principal

1. El usuario accede al curso.
2. El sistema consulta la estructura.
3. El sistema muestra niveles.
4. El sistema muestra unidades dentro de cada nivel.
5. El sistema muestra las lecciones publicadas.
6. El sistema identifica lecciones completadas.

## Resultado esperado

El usuario visualiza la organización completa del curso.

---

# 18. CU-014: Consultar lección

## Actor principal

Usuario.

## Objetivo

Acceder al contenido educativo de una lección.

## Precondiciones

- La lección debe estar publicada.
- El usuario debe tener acceso al curso.

## Flujo principal

1. El usuario selecciona una lección.
2. El sistema registra el primer acceso si corresponde.
3. El sistema consulta los bloques de contenido.
4. El sistema ordena los bloques.
5. El sistema muestra textos, imágenes, audios, videos y actividades.
6. El usuario interactúa con el contenido.

## Resultado esperado

La lección se muestra de forma ordenada.

---

# 19. CU-015: Reproducir contenido multimedia

## Actor principal

Usuario.

## Objetivo

Escuchar un audio o reproducir un video educativo.

## Precondiciones

- El archivo debe existir.
- El usuario debe tener permiso.
- El contenido debe estar publicado.

## Flujo principal

1. El usuario selecciona reproducir.
2. El frontend solicita acceso al backend.
3. El backend valida la sesión y el recurso.
4. El backend obtiene el archivo o enlace autorizado.
5. MinIO entrega el contenido.
6. El navegador inicia la reproducción.

## Flujos alternativos

- Archivo no encontrado.
- Formato no compatible.
- Fallo de conexión.
- Permiso insuficiente.

## Resultado esperado

El usuario puede reproducir el contenido autorizado.

---

# 20. CU-016: Consultar vocabulario

## Actor principal

Usuario.

## Objetivo

Buscar palabras y escuchar su pronunciación.

## Precondiciones

- Debe existir vocabulario publicado.

## Flujo principal

1. El usuario accede al glosario.
2. El sistema muestra palabras publicadas.
3. El usuario busca o filtra.
4. El sistema muestra los resultados.
5. El usuario selecciona una palabra.
6. El sistema muestra:
   - Palabra en kaqchikel.
   - Traducción.
   - Descripción.
   - Ejemplo.
   - Variante.
   - Imagen.
   - Audio.

7. El usuario reproduce la pronunciación.

## Resultado esperado

El usuario consulta el vocabulario disponible.

---

# 21. CU-017: Realizar evaluación

## Actor principal

Usuario.

## Objetivo

Responder una evaluación y obtener una calificación.

## Precondiciones

- La evaluación debe estar publicada.
- El usuario debe estar autenticado.
- El usuario no debe haber superado el límite de intentos.

## Flujo principal

1. El usuario abre la evaluación.
2. El sistema muestra las instrucciones.
3. El usuario inicia el intento.
4. El sistema registra el inicio.
5. El sistema muestra las preguntas.
6. El usuario responde.
7. El usuario envía la evaluación.
8. El sistema valida las respuestas.
9. El sistema calcula la puntuación.
10. El sistema determina la aprobación.
11. El sistema guarda el intento.
12. El sistema actualiza el progreso.
13. El sistema muestra el resultado.

## Flujos alternativos

- El usuario no responde todas las preguntas.
- El límite de intentos fue alcanzado.
- Se pierde temporalmente la conexión.
- La evaluación fue despublicada.

## Resultado esperado

El intento y la puntuación quedan registrados.

---

# 22. CU-018: Consultar resultados

## Actor principal

Usuario.

## Objetivo

Consultar los resultados de evaluaciones realizadas.

## Precondiciones

- El usuario debe estar autenticado.
- Debe existir al menos un intento.

## Flujo principal

1. El usuario accede a resultados.
2. El sistema consulta sus intentos.
3. El sistema muestra:
   - Evaluación.
   - Fecha.
   - Intento.
   - Puntuación.
   - Estado de aprobación.

4. El usuario selecciona un resultado.

## Resultado esperado

El usuario consulta únicamente sus propios resultados.

---

# 23. CU-019: Marcar lección como completada

## Actor principal

Usuario.

## Objetivo

Registrar que terminó una lección.

## Precondiciones

- El usuario debe estar autenticado.
- La lección debe estar publicada.

## Flujo principal

1. El usuario completa el contenido.
2. Selecciona finalizar lección.
3. El sistema verifica el progreso.
4. El sistema marca la lección como completada.
5. El sistema registra la fecha.
6. El sistema recalcula el progreso.
7. El sistema muestra la siguiente lección disponible.

## Resultado esperado

La lección queda registrada como completada.

---

# 24. CU-020: Consultar progreso

## Actor principal

Usuario.

## Objetivo

Consultar su avance de aprendizaje.

## Precondiciones

- El usuario debe estar autenticado.

## Flujo principal

1. El usuario abre la sección de progreso.
2. El sistema consulta cursos iniciados.
3. El sistema calcula el avance.
4. El sistema muestra:
   - Cursos iniciados.
   - Lecciones completadas.
   - Total de lecciones.
   - Porcentaje.
   - Evaluaciones.
   - Última actividad.
   - Cursos completados.

## Resultado esperado

El usuario visualiza su progreso actualizado.

---

# 25. CU-021: Consultar notificaciones

## Actor principal

Usuario.

## Objetivo

Visualizar avisos recibidos.

## Precondiciones

- El usuario debe estar autenticado.

## Flujo principal

1. El usuario abre notificaciones.
2. El sistema consulta sus notificaciones.
3. El sistema diferencia leídas y no leídas.
4. El usuario selecciona una notificación.
5. El sistema la marca como leída.
6. El usuario puede marcar todas como leídas.

## Resultado esperado

El usuario consulta y administra sus notificaciones.

---

# 26. CU-022: Administrar usuarios

## Actor principal

Administrador.

## Objetivo

Consultar y controlar las cuentas registradas.

## Precondiciones

- El administrador debe estar autenticado.
- Debe poseer rol `ADMIN`.

## Flujo principal

1. El administrador abre el módulo de usuarios.
2. El sistema muestra la lista paginada.
3. El administrador busca o filtra.
4. Selecciona un usuario.
5. El sistema muestra su detalle.
6. El administrador puede:
   - Activar.
   - Bloquear.
   - Desactivar.

7. El sistema solicita confirmación.
8. El sistema ejecuta la acción.
9. El sistema registra auditoría.

## Restricciones

- El administrador no podrá bloquearse accidentalmente.
- Se preferirá desactivar en lugar de eliminar.

## Resultado esperado

El estado de la cuenta queda actualizado.

---

# 27. CU-023: Crear curso

## Actor principal

Administrador.

## Objetivo

Registrar un nuevo curso.

## Precondiciones

- El administrador debe estar autenticado.

## Flujo principal

1. El administrador abre cursos.
2. Selecciona crear curso.
3. Ingresa:
   - Nombre.
   - Descripción.
   - Objetivos.
   - Nivel.
   - Orden.
   - Portada.

4. El sistema valida los datos.
5. El sistema crea el curso como borrador.
6. El sistema registra auditoría.
7. El sistema muestra el curso creado.

## Resultado esperado

El curso queda disponible para continuar su configuración.

---

# 28. CU-024: Administrar estructura educativa

## Actor principal

Administrador.

## Objetivo

Crear niveles, unidades y lecciones dentro de un curso.

## Precondiciones

- El curso debe existir.
- El administrador debe estar autenticado.

## Flujo principal

1. El administrador abre un curso.
2. Crea un nivel.
3. Ingresa nombre, descripción y orden.
4. Crea una unidad dentro del nivel.
5. Ingresa nombre, descripción y orden.
6. Crea una lección dentro de la unidad.
7. Define título, descripción y orden.
8. El sistema guarda la estructura.
9. El sistema registra auditoría.

## Resultado esperado

El curso cuenta con una estructura pedagógica organizada.

---

# 29. CU-025: Crear y editar lección

## Actor principal

Administrador.

## Objetivo

Construir una lección utilizando bloques de contenido.

## Precondiciones

- Debe existir una unidad.
- El administrador debe estar autenticado.

## Flujo principal

1. El administrador selecciona una lección.
2. Abre el editor de contenido.
3. Agrega bloques.
4. Selecciona el tipo de bloque.
5. Introduce texto o relaciona un archivo.
6. Define el orden.
7. Repite el proceso según sea necesario.
8. Guarda los cambios.
9. Previsualiza la lección.
10. El sistema registra auditoría.

## Resultado esperado

La lección queda guardada en estado borrador o actualizada.

---

# 30. CU-026: Administrar vocabulario

## Actor principal

Administrador.

## Objetivo

Crear y mantener el glosario.

## Precondiciones

- El administrador debe estar autenticado.

## Flujo principal

1. El administrador abre vocabulario.
2. Selecciona crear entrada.
3. Ingresa:
   - Palabra.
   - Traducción.
   - Descripción.
   - Ejemplo.
   - Categoría.
   - Variante.

4. Relaciona imagen y audio.
5. Relaciona lecciones.
6. Guarda la entrada.
7. Publica cuando esté revisada.
8. El sistema registra auditoría.

## Resultado esperado

La palabra queda disponible según su estado de publicación.

---

# 31. CU-027: Cargar archivo multimedia

## Actor principal

Administrador.

## Objetivo

Guardar un archivo audiovisual o documento.

## Precondiciones

- El administrador debe estar autenticado.
- MinIO debe estar disponible.

## Flujo principal

1. El administrador abre multimedia.
2. Selecciona cargar archivo.
3. Selecciona el archivo.
4. El sistema valida:
   - Tipo.
   - Extensión.
   - Tamaño.

5. El sistema genera un nombre interno.
6. El sistema carga el archivo en MinIO.
7. El sistema guarda los metadatos en PostgreSQL.
8. El sistema muestra el archivo.
9. El sistema registra auditoría.

## Flujos alternativos

- Tipo no permitido.
- Tamaño excedido.
- Error de MinIO.
- Error al guardar los metadatos.

## Resultado esperado

El archivo queda disponible para relacionarse con contenido.

---

# 32. CU-028: Administrar evaluaciones

## Actor principal

Administrador.

## Objetivo

Crear, editar y publicar evaluaciones.

## Precondiciones

- El administrador debe estar autenticado.
- Debe existir una lección o unidad.

## Flujo principal

1. El administrador crea una evaluación.
2. Define nombre e instrucciones.
3. Define puntuación mínima.
4. Define límite de intentos.
5. Agrega preguntas.
6. Define opciones y respuestas correctas.
7. Asigna puntuaciones.
8. Ordena las preguntas.
9. Guarda la evaluación.
10. Previsualiza el contenido.
11. Publica la evaluación.
12. El sistema registra auditoría.

## Resultado esperado

La evaluación queda disponible para los usuarios.

---

# 33. CU-029: Publicar contenido

## Actor principal

Administrador.

## Objetivo

Hacer visible un curso, lección, vocabulario o evaluación.

## Precondiciones

- El contenido debe existir.
- El administrador debe estar autenticado.
- El contenido debe cumplir las condiciones mínimas.

## Flujo principal

1. El administrador selecciona el contenido.
2. Selecciona publicar.
3. El sistema valida campos requeridos.
4. El sistema solicita confirmación.
5. El sistema cambia el estado.
6. El sistema registra la fecha de publicación.
7. El sistema registra auditoría.
8. El sistema puede generar una notificación.

## Flujo alternativo

- Faltan datos obligatorios.
- Existen archivos faltantes.
- El contenido relacionado no está publicado.

## Resultado esperado

El contenido queda visible para los usuarios autorizados.

---

# 34. CU-030: Consultar progreso general

## Actor principal

Administrador.

## Objetivo

Consultar el avance de los usuarios.

## Precondiciones

- El administrador debe estar autenticado.

## Flujo principal

1. El administrador abre progreso.
2. El sistema muestra indicadores generales.
3. El administrador filtra por curso o usuario.
4. El sistema consulta los registros.
5. El sistema muestra:
   - Cursos iniciados.
   - Lecciones completadas.
   - Evaluaciones.
   - Porcentaje.
   - Última actividad.

## Resultado esperado

El administrador consulta el progreso de la plataforma.

---

# 35. CU-031: Enviar notificación

## Actor principal

Administrador.

## Objetivo

Enviar un aviso a uno o varios usuarios.

## Precondiciones

- El administrador debe estar autenticado.

## Flujo principal

1. El administrador abre notificaciones.
2. Selecciona el destinatario o grupo.
3. Ingresa asunto y mensaje.
4. Selecciona el canal:
   - Interno.
   - Correo.
   - Ambos.

5. El sistema valida los datos.
6. El sistema crea la notificación.
7. El sistema procesa el correo.
8. El sistema registra el estado del envío.
9. El sistema registra auditoría.

## Resultado esperado

Los destinatarios reciben el aviso.

---

# 36. CU-032: Consultar reportes

## Actor principal

Administrador.

## Objetivo

Consultar información resumida de uso.

## Precondiciones

- El administrador debe estar autenticado.

## Flujo principal

1. El administrador abre reportes.
2. Selecciona un período.
3. Selecciona filtros.
4. El sistema consulta los datos.
5. El sistema genera indicadores.
6. El sistema muestra tablas o gráficas.

## Resultado esperado

El administrador obtiene información resumida del sistema.

---

# 37. CU-033: Consultar auditoría

## Actor principal

Administrador.

## Objetivo

Revisar acciones administrativas.

## Precondiciones

- El administrador debe estar autenticado.

## Flujo principal

1. El administrador abre auditoría.
2. El sistema muestra registros paginados.
3. El administrador filtra por:
   - Fecha.
   - Acción.
   - Usuario.
   - Tipo de recurso.

4. El sistema muestra los resultados.
5. El administrador consulta el detalle.

## Resultado esperado

El administrador puede revisar el historial de acciones.

---

# 38. CU-034: Modificar configuración

## Actor principal

Administrador.

## Objetivo

Actualizar parámetros generales de la plataforma.

## Precondiciones

- El administrador debe estar autenticado.

## Flujo principal

1. El administrador abre configuración.
2. El sistema muestra los valores actuales.
3. El administrador modifica los campos permitidos.
4. El sistema valida los valores.
5. El sistema guarda los cambios.
6. El sistema registra auditoría.
7. El sistema muestra confirmación.

## Resultado esperado

La configuración general queda actualizada.

---

# 39. CU-035: Registrar auditoría

## Actor principal

Sistema.

## Objetivo

Guardar evidencia de una acción administrativa.

## Evento disparador

Una operación relevante es ejecutada.

## Flujo principal

1. El sistema identifica al usuario responsable.
2. Identifica la acción.
3. Identifica el recurso afectado.
4. Registra fecha y hora.
5. Registra dirección IP cuando corresponda.
6. Guarda datos adicionales.
7. Conserva el registro.

## Resultado esperado

La acción queda registrada de forma automática.

---

# 40. CU-036: Ejecutar respaldo

## Actor principal

Sistema.

## Objetivo

Crear copias de seguridad de la información.

## Precondiciones

- Los servicios deben estar disponibles.
- Debe existir espacio suficiente.
- El sistema debe contar con permisos.

## Flujo principal

1. El sistema inicia la tarea programada.
2. Genera el respaldo de PostgreSQL.
3. Genera o sincroniza el respaldo de MinIO.
4. Guarda la configuración necesaria.
5. Asigna fecha y hora.
6. Verifica el resultado.
7. Aplica la política de retención.
8. Registra el estado.

## Flujos alternativos

- Falta espacio.
- PostgreSQL no responde.
- MinIO no responde.
- El respaldo queda incompleto.
- Fallan los permisos del volumen.

## Resultado esperado

Se crea una copia válida y verificable.

---

# 41. Relaciones de inclusión

Algunos casos de uso dependen de otros.

```text
Registrar usuario
└── Enviar confirmación

Iniciar sesión
├── Validar credenciales
├── Validar estado
└── Crear sesión

Realizar evaluación
├── Registrar intento
├── Calificar respuestas
└── Actualizar progreso

Crear lección
├── Agregar bloques
├── Relacionar multimedia
└── Previsualizar

Publicar contenido
├── Validar contenido
├── Registrar auditoría
└── Generar notificación opcional
```

---

# 42. Relaciones de extensión

Algunas funciones se ejecutan únicamente bajo determinadas condiciones.

```text
Actualizar perfil
└── Cargar fotografía, opcional

Crear curso
└── Cargar portada, opcional

Crear vocabulario
├── Asociar imagen, opcional
├── Asociar audio, opcional
└── Registrar variante, opcional

Publicar contenido
└── Enviar notificación, opcional
```

---

# 43. Reglas generales de los casos de uso

1. Las funciones privadas requerirán una sesión válida.

2. Las funciones administrativas requerirán el rol `ADMIN`.

3. Los permisos deberán validarse en el backend.

4. Los datos recibidos deberán validarse antes de ser procesados.

5. Las operaciones críticas deberán solicitar confirmación.

6. Las acciones administrativas deberán registrarse en auditoría.

7. Las respuestas no deberán revelar información sensible.

8. Los usuarios solo podrán consultar información propia cuando corresponda.

9. El contenido en borrador no deberá mostrarse a usuarios normales.

10. Las funciones deberán manejar errores sin perder datos previamente almacenados.

---

# 44. Casos de error generales

## Sesión inexistente

El sistema responderá con:

```text
401 Unauthorized
```

## Permisos insuficientes

El sistema responderá con:

```text
403 Forbidden
```

## Recurso inexistente

El sistema responderá con:

```text
404 Not Found
```

## Datos inválidos

El sistema responderá con:

```text
400 Bad Request
```

## Conflicto de datos

El sistema responderá con:

```text
409 Conflict
```

Ejemplo:

- Correo ya registrado.
- Orden duplicado no permitido.
- Recurso relacionado que impide eliminación.

## Error interno

El sistema responderá con:

```text
500 Internal Server Error
```

El mensaje público no deberá revelar información sensible.

---

# 45. Casos de uso prioritarios

## Prioridad alta

- CU-001 Registrar usuario.
- CU-002 Confirmar correo.
- CU-004 Iniciar sesión.
- CU-005 Cerrar sesión.
- CU-006 Recuperar contraseña.
- CU-007 Restablecer contraseña.
- CU-011 Consultar cursos.
- CU-014 Consultar lección.
- CU-017 Realizar evaluación.
- CU-020 Consultar progreso.
- CU-022 Administrar usuarios.
- CU-023 Crear curso.
- CU-024 Administrar estructura.
- CU-025 Crear lección.
- CU-027 Cargar multimedia.
- CU-028 Administrar evaluaciones.
- CU-029 Publicar contenido.

## Prioridad media

- CU-009 Actualizar perfil.
- CU-016 Consultar vocabulario.
- CU-021 Consultar notificaciones.
- CU-030 Consultar progreso general.
- CU-031 Enviar notificación.
- CU-033 Consultar auditoría.

## Prioridad baja dentro de la versión 1

- CU-032 Consultar reportes.
- CU-034 Modificar configuración.
- Filtros avanzados.
- Estadísticas detalladas.

---

# 46. Matriz de casos de uso y módulos

| Caso de uso     | Módulo principal               |
| --------------- | ------------------------------ |
| CU-001 a CU-007 | Autenticación                  |
| CU-008 a CU-010 | Usuarios y perfiles            |
| CU-011 a CU-014 | Cursos y lecciones             |
| CU-015          | Multimedia                     |
| CU-016          | Vocabulario                    |
| CU-017 y CU-018 | Evaluaciones                   |
| CU-019 y CU-020 | Progreso                       |
| CU-021          | Notificaciones                 |
| CU-022          | Administración de usuarios     |
| CU-023 a CU-025 | Administración de contenido    |
| CU-026          | Administración de vocabulario  |
| CU-027          | Administración multimedia      |
| CU-028          | Administración de evaluaciones |
| CU-029          | Publicación                    |
| CU-030          | Progreso administrativo        |
| CU-031          | Notificaciones administrativas |
| CU-032          | Reportes                       |
| CU-033          | Auditoría                      |
| CU-034          | Configuración                  |
| CU-035          | Auditoría automática           |
| CU-036          | Respaldos                      |

---

# 47. Matriz de actores y casos de uso

| Actor              | Casos de uso principales                       |
| ------------------ | ---------------------------------------------- |
| Visitante          | CU-001, CU-002, CU-003, CU-004, CU-006, CU-007 |
| Usuario            | CU-004, CU-005, CU-008 a CU-021                |
| Administrador      | CU-004, CU-005, CU-022 a CU-034                |
| Sistema            | CU-035 y CU-036                                |
| Servicio de correo | Confirmación, recuperación y notificaciones    |
| MinIO              | Carga y entrega de archivos                    |
| PostgreSQL         | Persistencia de información                    |

---

# 48. Criterios de aceptación

Los casos de uso se considerarán correctamente definidos cuando:

1. Cada caso tenga un actor principal.

2. Cada caso tenga un objetivo claro.

3. Las precondiciones estén identificadas.

4. El flujo principal describa el proceso completo.

5. Los errores principales estén contemplados.

6. Los permisos correspondan con el documento de roles.

7. Los casos se relacionen con los módulos definidos.

8. Los casos puedan transformarse en pruebas.

9. Los casos permitan identificar rutas de la API.

10. Los casos permitan identificar pantallas del frontend.

---

# 49. Diagramas que podrán derivarse

A partir de este documento se podrán elaborar:

- Diagrama general de casos de uso.
- Diagrama de autenticación.
- Diagrama del usuario.
- Diagrama del administrador.
- Diagrama de gestión de contenido.
- Diagrama de evaluaciones.
- Diagrama de progreso.
- Diagrama de multimedia.

No es necesario representar los 36 casos dentro de un único diagrama, ya que resultaría difícil de leer.

Se recomienda elaborar varios diagramas por área funcional.

---

# 50. Resumen

La versión 1 contará inicialmente con 36 casos de uso principales.

Estos casos representan los procesos esenciales de:

- Registro.
- Autenticación.
- Aprendizaje.
- Administración de contenido.
- Evaluación.
- Progreso.
- Multimedia.
- Notificaciones.
- Auditoría.
- Respaldos.

Los casos de uso no representan necesariamente una pantalla por cada código. Varias interacciones podrán implementarse dentro de una misma interfaz o módulo.

---

# 51. Aprobación del documento

| Responsable | Cargo o función             | Firma | Fecha |
| ----------- | --------------------------- | ----- | ----- |
|             | Responsable del proyecto    |       |       |
|             | Representante institucional |       |       |
|             | Revisor                     |       |       |
