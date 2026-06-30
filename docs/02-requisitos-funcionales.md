# Requisitos funcionales

## Plataforma web para el aprendizaje del idioma kaqchikel

**Institución:** Dirección General de Educación Bilingüe Intercultural —DIGEBI—, Ministerio de Educación de Guatemala
**Nombre del proyecto:** Plataforma web para el aprendizaje del idioma kaqchikel
**Versión del documento:** 1.0
**Versión del sistema:** Versión 1
**Estado:** Definición inicial
**Fecha:** Junio de 2026

---

## 1. Introducción

El presente documento describe los requisitos funcionales de la primera versión de la plataforma web para el aprendizaje del idioma kaqchikel.

Los requisitos funcionales establecen las acciones, procesos y servicios que el sistema deberá proporcionar a sus diferentes usuarios.

Cada requisito cuenta con un identificador único con el formato:

```text
RF-001
RF-002
RF-003
```

Estos identificadores serán utilizados posteriormente para relacionar los requisitos con:

- Casos de uso.
- Pantallas.
- Rutas de la API.
- Modelos de base de datos.
- Pruebas funcionales.
- Criterios de aceptación.

---

## 2. Objetivo del documento

Definir de forma clara, ordenada y verificable las funciones que deberá cumplir la primera versión de la plataforma.

Este documento servirá como referencia para:

- Diseño del sistema.
- Desarrollo del frontend.
- Desarrollo del backend.
- Diseño de la base de datos.
- Elaboración de pruebas.
- Validación del proyecto.
- Control del alcance.

---

## 3. Actores del sistema

### 3.1 Visitante

Persona que accede a la plataforma sin haber iniciado sesión.

### 3.2 Usuario

Persona registrada en la plataforma con rol `USER`.

El usuario podrá identificarse mediante uno de los siguientes tipos de perfil:

- Estudiante.
- Docente.
- Otro.

### 3.3 Administrador

Persona con rol `ADMIN` y acceso completo a las funciones administrativas.

En la versión 1 existirá un único administrador general.

---

# 4. Requisitos de autenticación

## Registro de usuarios

**RF-001.** El sistema deberá permitir que un visitante acceda al formulario de registro.

**RF-002.** El sistema deberá permitir que un visitante se registre proporcionando como mínimo nombre, apellidos, correo electrónico, contraseña y tipo de perfil.

**RF-003.** El sistema deberá permitir seleccionar como tipo de perfil las opciones estudiante, docente u otro.

**RF-004.** El sistema deberá validar que los campos obligatorios del formulario de registro hayan sido completados.

**RF-005.** El sistema deberá validar que el correo electrónico ingresado posea un formato válido.

**RF-006.** El sistema deberá impedir el registro de dos cuentas con el mismo correo electrónico.

**RF-007.** El sistema deberá validar que la contraseña cumpla con las condiciones mínimas establecidas.

**RF-008.** El sistema deberá solicitar la confirmación de la contraseña durante el registro.

**RF-009.** El sistema deberá verificar que la contraseña y su confirmación coincidan.

**RF-010.** El sistema deberá asignar automáticamente el rol `USER` a las nuevas cuentas registradas.

**RF-011.** El sistema deberá crear las nuevas cuentas inicialmente con el estado de correo no confirmado.

**RF-012.** El sistema deberá enviar un correo de confirmación después de completar correctamente el registro.

**RF-013.** El sistema deberá mostrar un mensaje indicando que la cuenta fue creada y que debe confirmarse el correo electrónico.

---

## Confirmación de correo

**RF-014.** El sistema deberá generar un enlace de confirmación único para cada cuenta registrada.

**RF-015.** El sistema deberá asociar el enlace de confirmación con el usuario correspondiente.

**RF-016.** El sistema deberá establecer un tiempo de expiración para el enlace de confirmación.

**RF-017.** El sistema deberá permitir confirmar la cuenta mediante un enlace válido.

**RF-018.** El sistema deberá marcar el correo del usuario como confirmado después de completar correctamente el proceso.

**RF-019.** El sistema deberá impedir el uso de enlaces de confirmación expirados.

**RF-020.** El sistema deberá impedir la reutilización de un enlace de confirmación ya utilizado.

**RF-021.** El sistema deberá permitir solicitar el reenvío del correo de confirmación.

**RF-022.** El sistema deberá mostrar un mensaje cuando la cuenta ya haya sido confirmada previamente.

---

## Inicio y cierre de sesión

**RF-023.** El sistema deberá permitir que un usuario acceda al formulario de inicio de sesión.

**RF-024.** El sistema deberá permitir iniciar sesión mediante correo electrónico y contraseña.

**RF-025.** El sistema deberá validar que las credenciales ingresadas sean correctas.

**RF-026.** El sistema deberá impedir el inicio de sesión cuando la cuenta no haya confirmado su correo electrónico.

**RF-027.** El sistema deberá impedir el inicio de sesión cuando la cuenta se encuentre bloqueada o desactivada.

**RF-028.** El sistema deberá crear una sesión cuando las credenciales sean válidas.

**RF-029.** El sistema deberá identificar el rol del usuario al iniciar sesión.

**RF-030.** El sistema deberá dirigir al usuario al área correspondiente según su rol.

**RF-031.** El sistema deberá registrar la fecha y hora del último inicio de sesión exitoso.

**RF-032.** El sistema deberá mostrar un mensaje cuando las credenciales sean incorrectas.

**RF-033.** El sistema deberá permitir que un usuario cierre su sesión.

**RF-034.** El sistema deberá finalizar la sesión activa cuando el usuario cierre sesión.

**RF-035.** El sistema deberá impedir el acceso a rutas privadas cuando no exista una sesión válida.

---

## Recuperación de contraseña

**RF-036.** El sistema deberá permitir que un visitante solicite la recuperación de su contraseña.

**RF-037.** El sistema deberá solicitar el correo electrónico asociado a la cuenta.

**RF-038.** El sistema deberá generar un enlace único de recuperación de contraseña.

**RF-039.** El sistema deberá enviar el enlace de recuperación al correo registrado.

**RF-040.** El sistema deberá establecer un tiempo de expiración para el enlace de recuperación.

**RF-041.** El sistema deberá permitir establecer una nueva contraseña mediante un enlace válido.

**RF-042.** El sistema deberá solicitar la confirmación de la nueva contraseña.

**RF-043.** El sistema deberá verificar que la nueva contraseña y su confirmación coincidan.

**RF-044.** El sistema deberá impedir la reutilización de un enlace de recuperación ya utilizado.

**RF-045.** El sistema deberá impedir el uso de enlaces de recuperación expirados.

**RF-046.** El sistema deberá invalidar las sesiones anteriores cuando la contraseña sea restablecida.

**RF-047.** El sistema deberá notificar al usuario cuando su contraseña haya sido modificada correctamente.

---

# 5. Requisitos de usuarios y perfiles

## Perfil de usuario

**RF-048.** El sistema deberá permitir que el usuario consulte su perfil.

**RF-049.** El sistema deberá mostrar en el perfil el nombre, apellidos, correo electrónico, tipo de perfil y fotografía.

**RF-050.** El sistema deberá permitir que el usuario modifique su nombre y apellidos.

**RF-051.** El sistema deberá permitir que el usuario modifique su tipo de perfil.

**RF-052.** El sistema deberá permitir que el usuario cargue o cambie su fotografía de perfil.

**RF-053.** El sistema deberá permitir que el usuario elimine su fotografía de perfil.

**RF-054.** El sistema deberá validar los datos modificados antes de actualizar el perfil.

**RF-055.** El sistema deberá mostrar un mensaje después de actualizar correctamente el perfil.

**RF-056.** El sistema deberá impedir que un usuario cambie directamente su rol.

**RF-057.** El sistema deberá permitir que un usuario consulte la fecha en que creó su cuenta.

---

## Cambio de contraseña

**RF-058.** El sistema deberá permitir que un usuario autenticado cambie su contraseña.

**RF-059.** El sistema deberá solicitar la contraseña actual antes de permitir el cambio.

**RF-060.** El sistema deberá validar que la contraseña actual sea correcta.

**RF-061.** El sistema deberá solicitar la nueva contraseña y su confirmación.

**RF-062.** El sistema deberá validar que la nueva contraseña cumpla las condiciones establecidas.

**RF-063.** El sistema deberá notificar al usuario después de cambiar correctamente su contraseña.

---

## Administración de usuarios

**RF-064.** El sistema deberá permitir que el administrador consulte la lista de usuarios registrados.

**RF-065.** El sistema deberá permitir buscar usuarios por nombre, apellidos o correo electrónico.

**RF-066.** El sistema deberá permitir filtrar usuarios por rol.

**RF-067.** El sistema deberá permitir filtrar usuarios por tipo de perfil.

**RF-068.** El sistema deberá permitir filtrar usuarios por estado de cuenta.

**RF-069.** El sistema deberá permitir que el administrador consulte el detalle de un usuario.

**RF-070.** El sistema deberá permitir que el administrador active una cuenta.

**RF-071.** El sistema deberá permitir que el administrador bloquee una cuenta.

**RF-072.** El sistema deberá permitir que el administrador desactive una cuenta.

**RF-073.** El sistema deberá impedir que un usuario bloqueado acceda a la plataforma.

**RF-074.** El sistema deberá permitir que el administrador consulte la fecha del último acceso de un usuario.

**RF-075.** El sistema deberá registrar las acciones administrativas realizadas sobre las cuentas.

---

# 6. Requisitos de cursos

**RF-076.** El sistema deberá permitir que el administrador consulte la lista de cursos.

**RF-077.** El sistema deberá permitir que el administrador cree un curso.

**RF-078.** El sistema deberá solicitar como mínimo el nombre y la descripción del curso.

**RF-079.** El sistema deberá permitir agregar una imagen de portada al curso.

**RF-080.** El sistema deberá permitir definir los objetivos del curso.

**RF-081.** El sistema deberá permitir asignar un nivel de dificultad al curso.

**RF-082.** El sistema deberá permitir establecer el orden de presentación del curso.

**RF-083.** El sistema deberá crear inicialmente los cursos en estado de borrador.

**RF-084.** El sistema deberá permitir que el administrador modifique la información de un curso.

**RF-085.** El sistema deberá permitir publicar un curso.

**RF-086.** El sistema deberá permitir despublicar un curso.

**RF-087.** El sistema deberá permitir eliminar un curso.

**RF-088.** El sistema deberá solicitar confirmación antes de eliminar un curso.

**RF-089.** El sistema deberá impedir que los usuarios normales modifiquen cursos.

**RF-090.** El sistema deberá mostrar a los usuarios únicamente los cursos publicados.

**RF-091.** El sistema deberá permitir que un usuario consulte el detalle de un curso publicado.

**RF-092.** El sistema deberá mostrar el nombre, descripción, portada, objetivos y nivel del curso.

**RF-093.** El sistema deberá permitir buscar cursos por nombre.

**RF-094.** El sistema deberá permitir ordenar los cursos según el orden definido por el administrador.

---

# 7. Requisitos de niveles, unidades y lecciones

## Niveles

**RF-095.** El sistema deberá permitir que el administrador cree niveles dentro de un curso.

**RF-096.** El sistema deberá permitir asignar un nombre, descripción y orden a cada nivel.

**RF-097.** El sistema deberá permitir modificar un nivel.

**RF-098.** El sistema deberá permitir eliminar un nivel.

**RF-099.** El sistema deberá solicitar confirmación antes de eliminar un nivel.

**RF-100.** El sistema deberá permitir cambiar el orden de los niveles.

---

## Unidades

**RF-101.** El sistema deberá permitir que el administrador cree unidades dentro de un nivel.

**RF-102.** El sistema deberá permitir asignar un nombre, descripción y orden a cada unidad.

**RF-103.** El sistema deberá permitir modificar una unidad.

**RF-104.** El sistema deberá permitir eliminar una unidad.

**RF-105.** El sistema deberá solicitar confirmación antes de eliminar una unidad.

**RF-106.** El sistema deberá permitir cambiar el orden de las unidades.

---

## Lecciones

**RF-107.** El sistema deberá permitir que el administrador cree lecciones dentro de una unidad.

**RF-108.** El sistema deberá permitir asignar un título y descripción a cada lección.

**RF-109.** El sistema deberá permitir establecer el orden de las lecciones.

**RF-110.** El sistema deberá crear inicialmente las lecciones en estado de borrador.

**RF-111.** El sistema deberá permitir modificar una lección.

**RF-112.** El sistema deberá permitir publicar una lección.

**RF-113.** El sistema deberá permitir despublicar una lección.

**RF-114.** El sistema deberá permitir eliminar una lección.

**RF-115.** El sistema deberá solicitar confirmación antes de eliminar una lección.

**RF-116.** El sistema deberá mostrar a los usuarios únicamente las lecciones publicadas.

**RF-117.** El sistema deberá permitir cambiar el orden de las lecciones.

**RF-118.** El sistema deberá mostrar las lecciones agrupadas dentro de su unidad correspondiente.

---

# 8. Requisitos de contenido educativo

**RF-119.** El sistema deberá permitir agregar bloques de contenido dentro de una lección.

**RF-120.** El sistema deberá permitir agregar bloques de texto.

**RF-121.** El sistema deberá permitir agregar bloques de título o subtítulo.

**RF-122.** El sistema deberá permitir agregar bloques de imagen.

**RF-123.** El sistema deberá permitir agregar bloques de audio.

**RF-124.** El sistema deberá permitir agregar bloques de video.

**RF-125.** El sistema deberá permitir agregar bloques de diálogo.

**RF-126.** El sistema deberá permitir agregar bloques de ejemplo.

**RF-127.** El sistema deberá permitir agregar bloques de vocabulario.

**RF-128.** El sistema deberá permitir agregar bloques de notas informativas.

**RF-129.** El sistema deberá permitir agregar bloques de documentos descargables.

**RF-130.** El sistema deberá permitir relacionar ejercicios con una lección.

**RF-131.** El sistema deberá permitir modificar un bloque de contenido.

**RF-132.** El sistema deberá permitir eliminar un bloque de contenido.

**RF-133.** El sistema deberá permitir cambiar el orden de los bloques dentro de una lección.

**RF-134.** El sistema deberá mostrar los bloques de contenido siguiendo el orden definido.

**RF-135.** El sistema deberá permitir previsualizar una lección antes de publicarla.

**RF-136.** El sistema deberá impedir que los usuarios normales modifiquen el contenido educativo.

---

# 9. Requisitos de vocabulario y pronunciación

**RF-137.** El sistema deberá permitir que el administrador consulte la lista de vocabulario.

**RF-138.** El sistema deberá permitir registrar una palabra o expresión en kaqchikel.

**RF-139.** El sistema deberá permitir registrar la traducción al español.

**RF-140.** El sistema deberá permitir agregar una descripción a cada palabra o expresión.

**RF-141.** El sistema deberá permitir agregar un ejemplo de uso.

**RF-142.** El sistema deberá permitir asociar un audio de pronunciación.

**RF-143.** El sistema deberá permitir asociar una imagen.

**RF-144.** El sistema deberá permitir asignar una categoría.

**RF-145.** El sistema deberá permitir registrar la variante lingüística cuando corresponda.

**RF-146.** El sistema deberá permitir relacionar una palabra con una o más lecciones.

**RF-147.** El sistema deberá permitir modificar un registro de vocabulario.

**RF-148.** El sistema deberá permitir eliminar un registro de vocabulario.

**RF-149.** El sistema deberá permitir publicar o despublicar un registro de vocabulario.

**RF-150.** El sistema deberá permitir que un usuario consulte el glosario publicado.

**RF-151.** El sistema deberá permitir buscar palabras en kaqchikel.

**RF-152.** El sistema deberá permitir buscar palabras mediante su traducción al español.

**RF-153.** El sistema deberá permitir filtrar vocabulario por categoría.

**RF-154.** El sistema deberá permitir reproducir el audio de pronunciación.

---

# 10. Requisitos de archivos multimedia

**RF-155.** El sistema deberá permitir que el administrador cargue archivos multimedia.

**RF-156.** El sistema deberá permitir cargar archivos de imagen.

**RF-157.** El sistema deberá permitir cargar archivos de audio.

**RF-158.** El sistema deberá permitir cargar archivos de video.

**RF-159.** El sistema deberá permitir cargar documentos PDF.

**RF-160.** El sistema deberá validar que el tipo de archivo se encuentre permitido.

**RF-161.** El sistema deberá validar que el archivo no supere el tamaño máximo establecido.

**RF-162.** El sistema deberá almacenar los archivos en MinIO.

**RF-163.** El sistema deberá guardar en PostgreSQL la información descriptiva de cada archivo.

**RF-164.** El sistema deberá registrar el nombre original del archivo.

**RF-165.** El sistema deberá registrar el tipo y tamaño del archivo.

**RF-166.** El sistema deberá registrar la ubicación interna del archivo.

**RF-167.** El sistema deberá registrar el usuario que cargó el archivo.

**RF-168.** El sistema deberá registrar la fecha y hora de carga.

**RF-169.** El sistema deberá permitir que el administrador consulte la lista de archivos.

**RF-170.** El sistema deberá permitir buscar archivos por nombre.

**RF-171.** El sistema deberá permitir filtrar archivos por tipo.

**RF-172.** El sistema deberá permitir visualizar una vista previa de las imágenes.

**RF-173.** El sistema deberá permitir reproducir audios almacenados.

**RF-174.** El sistema deberá permitir reproducir videos almacenados.

**RF-175.** El sistema deberá permitir descargar documentos autorizados.

**RF-176.** El sistema deberá permitir que el administrador elimine un archivo.

**RF-177.** El sistema deberá solicitar confirmación antes de eliminar un archivo.

**RF-178.** El sistema deberá advertir cuando un archivo esté relacionado con contenido publicado.

**RF-179.** El sistema deberá impedir que un usuario normal cargue archivos administrativos.

---

# 11. Requisitos de ejercicios y evaluaciones

## Administración de evaluaciones

**RF-180.** El sistema deberá permitir que el administrador cree una evaluación.

**RF-181.** El sistema deberá permitir asignar un nombre a la evaluación.

**RF-182.** El sistema deberá permitir agregar una descripción e instrucciones.

**RF-183.** El sistema deberá permitir relacionar una evaluación con una lección o unidad.

**RF-184.** El sistema deberá permitir definir la puntuación total.

**RF-185.** El sistema deberá permitir definir una puntuación mínima de aprobación.

**RF-186.** El sistema deberá permitir establecer el número máximo de intentos.

**RF-187.** El sistema deberá permitir publicar una evaluación.

**RF-188.** El sistema deberá permitir despublicar una evaluación.

**RF-189.** El sistema deberá permitir modificar una evaluación.

**RF-190.** El sistema deberá permitir eliminar una evaluación.

---

## Preguntas

**RF-191.** El sistema deberá permitir agregar preguntas de selección múltiple.

**RF-192.** El sistema deberá permitir agregar preguntas de verdadero o falso.

**RF-193.** El sistema deberá permitir agregar ejercicios de relación entre palabra y traducción.

**RF-194.** El sistema deberá permitir agregar preguntas basadas en audio.

**RF-195.** El sistema deberá permitir agregar ejercicios para completar palabras o expresiones.

**RF-196.** El sistema deberá permitir agregar ejercicios para ordenar palabras.

**RF-197.** El sistema deberá permitir definir la respuesta correcta de cada pregunta.

**RF-198.** El sistema deberá permitir asignar una puntuación a cada pregunta.

**RF-199.** El sistema deberá permitir modificar una pregunta.

**RF-200.** El sistema deberá permitir eliminar una pregunta.

**RF-201.** El sistema deberá permitir cambiar el orden de las preguntas.

---

## Resolución de evaluaciones

**RF-202.** El sistema deberá permitir que un usuario acceda a una evaluación publicada.

**RF-203.** El sistema deberá mostrar las instrucciones antes de iniciar la evaluación.

**RF-204.** El sistema deberá registrar el inicio de un intento.

**RF-205.** El sistema deberá permitir que el usuario seleccione o ingrese sus respuestas.

**RF-206.** El sistema deberá permitir enviar la evaluación para su calificación.

**RF-207.** El sistema deberá calcular automáticamente la puntuación obtenida.

**RF-208.** El sistema deberá determinar si el usuario aprobó o no la evaluación.

**RF-209.** El sistema deberá registrar las respuestas proporcionadas.

**RF-210.** El sistema deberá registrar la fecha y hora del intento.

**RF-211.** El sistema deberá registrar el número de intento.

**RF-212.** El sistema deberá mostrar al usuario la puntuación obtenida.

**RF-213.** El sistema deberá mostrar si la evaluación fue aprobada o no aprobada.

**RF-214.** El sistema deberá impedir nuevos intentos cuando se alcance el límite establecido.

**RF-215.** El sistema deberá permitir que el usuario consulte sus intentos anteriores.

**RF-216.** El sistema deberá permitir que el administrador consulte los resultados de los usuarios.

---

# 12. Requisitos de progreso

**RF-217.** El sistema deberá registrar cuando un usuario inicia un curso.

**RF-218.** El sistema deberá registrar cuando un usuario accede por primera vez a una lección.

**RF-219.** El sistema deberá permitir que un usuario marque una lección como completada.

**RF-220.** El sistema deberá registrar la fecha en que una lección fue completada.

**RF-221.** El sistema deberá calcular el porcentaje de avance de un curso.

**RF-222.** El sistema deberá calcular el avance con base en las lecciones completadas.

**RF-223.** El sistema deberá mostrar al usuario sus cursos iniciados.

**RF-224.** El sistema deberá mostrar la cantidad de lecciones completadas.

**RF-225.** El sistema deberá mostrar la cantidad total de lecciones.

**RF-226.** El sistema deberá mostrar el porcentaje de progreso.

**RF-227.** El sistema deberá mostrar las puntuaciones obtenidas en las evaluaciones.

**RF-228.** El sistema deberá mostrar la última actividad registrada.

**RF-229.** El sistema deberá registrar cuando un usuario completa un curso.

**RF-230.** El sistema deberá mostrar al usuario los cursos completados.

**RF-231.** El sistema deberá permitir que el administrador consulte el progreso de cualquier usuario.

**RF-232.** El sistema deberá permitir que el administrador filtre el progreso por curso.

**RF-233.** El sistema deberá impedir que un usuario consulte el progreso de otros usuarios.

---

# 13. Requisitos de notificaciones

## Notificaciones internas

**RF-234.** El sistema deberá permitir generar notificaciones internas.

**RF-235.** El sistema deberá mostrar al usuario la lista de sus notificaciones.

**RF-236.** El sistema deberá indicar cuáles notificaciones no han sido leídas.

**RF-237.** El sistema deberá permitir marcar una notificación como leída.

**RF-238.** El sistema deberá permitir marcar todas las notificaciones como leídas.

**RF-239.** El sistema deberá permitir eliminar una notificación de la vista del usuario.

**RF-240.** El sistema deberá generar una notificación cuando se publique contenido relevante.

**RF-241.** El sistema deberá generar una notificación cuando se complete un curso.

**RF-242.** El sistema deberá permitir que el administrador envíe avisos generales.

---

## Correos electrónicos

**RF-243.** El sistema deberá enviar un correo de bienvenida después de confirmar una cuenta.

**RF-244.** El sistema deberá enviar correos de confirmación de cuenta.

**RF-245.** El sistema deberá enviar correos de recuperación de contraseña.

**RF-246.** El sistema deberá enviar una notificación cuando la contraseña sea modificada.

**RF-247.** El sistema deberá permitir enviar avisos generales por correo.

**RF-248.** El sistema deberá registrar el estado básico de envío de los correos.

---

# 14. Requisitos del panel administrativo

**RF-249.** El sistema deberá proporcionar un panel exclusivo para el administrador.

**RF-250.** El sistema deberá impedir que los usuarios normales accedan al panel administrativo.

**RF-251.** El sistema deberá mostrar en el dashboard el total de usuarios registrados.

**RF-252.** El sistema deberá mostrar la cantidad de usuarios activos.

**RF-253.** El sistema deberá mostrar la cantidad de cursos publicados.

**RF-254.** El sistema deberá mostrar la cantidad de cursos en borrador.

**RF-255.** El sistema deberá mostrar la cantidad de lecciones disponibles.

**RF-256.** El sistema deberá mostrar la cantidad de evaluaciones realizadas.

**RF-257.** El sistema deberá mostrar la cantidad de cursos completados.

**RF-258.** El sistema deberá mostrar la actividad administrativa reciente.

**RF-259.** El sistema deberá mostrar la cantidad de archivos almacenados.

**RF-260.** El sistema deberá mostrar el espacio de almacenamiento utilizado.

**RF-261.** El sistema deberá proporcionar accesos directos a usuarios, cursos, lecciones, vocabulario, multimedia y evaluaciones.

**RF-262.** El sistema deberá permitir consultar reportes básicos de uso.

**RF-263.** El sistema deberá permitir filtrar reportes por rango de fechas.

**RF-264.** El sistema deberá permitir consultar la cantidad de registros realizados durante un período.

**RF-265.** El sistema deberá permitir consultar la actividad de aprendizaje durante un período.

---

# 15. Requisitos de auditoría

**RF-266.** El sistema deberá registrar las acciones administrativas importantes.

**RF-267.** El sistema deberá registrar la creación de cursos.

**RF-268.** El sistema deberá registrar la modificación y eliminación de cursos.

**RF-269.** El sistema deberá registrar la creación, modificación y eliminación de lecciones.

**RF-270.** El sistema deberá registrar la publicación y despublicación de contenido.

**RF-271.** El sistema deberá registrar la carga y eliminación de archivos.

**RF-272.** El sistema deberá registrar el bloqueo, activación o desactivación de usuarios.

**RF-273.** El sistema deberá registrar la creación y modificación de evaluaciones.

**RF-274.** El sistema deberá registrar los cambios de configuración general.

**RF-275.** El sistema deberá almacenar el usuario responsable de cada acción.

**RF-276.** El sistema deberá almacenar la fecha y hora de cada acción.

**RF-277.** El sistema deberá almacenar el tipo de elemento afectado.

**RF-278.** El sistema deberá almacenar el identificador del elemento afectado.

**RF-279.** El sistema deberá almacenar la dirección IP cuando sea posible.

**RF-280.** El sistema deberá permitir que el administrador consulte los registros de auditoría.

**RF-281.** El sistema deberá permitir filtrar la auditoría por usuario, acción y fecha.

**RF-282.** El sistema deberá impedir que un usuario normal consulte la auditoría.

---

# 16. Requisitos de navegación pública

**RF-283.** El sistema deberá proporcionar una página principal pública.

**RF-284.** El sistema deberá mostrar información general sobre la plataforma.

**RF-285.** El sistema deberá permitir acceder desde la página principal al registro.

**RF-286.** El sistema deberá permitir acceder desde la página principal al inicio de sesión.

**RF-287.** El sistema deberá permitir acceder a información institucional pública.

**RF-288.** El sistema deberá permitir consultar información pública sobre los cursos cuando el administrador lo autorice.

**RF-289.** El sistema deberá mostrar una página cuando una dirección solicitada no exista.

**RF-290.** El sistema deberá permitir regresar a la página principal desde una página no encontrada.

---

# 17. Requisitos de configuración general

**RF-291.** El sistema deberá permitir que el administrador consulte la configuración general.

**RF-292.** El sistema deberá permitir modificar el nombre visible de la plataforma.

**RF-293.** El sistema deberá permitir modificar la descripción general de la plataforma.

**RF-294.** El sistema deberá permitir configurar información institucional.

**RF-295.** El sistema deberá permitir configurar los tipos y tamaños máximos de archivos.

**RF-296.** El sistema deberá permitir configurar el tiempo de expiración de enlaces de confirmación.

**RF-297.** El sistema deberá permitir configurar el tiempo de expiración de enlaces de recuperación.

**RF-298.** El sistema deberá permitir activar o desactivar temporalmente el registro de nuevos usuarios.

**RF-299.** El sistema deberá registrar los cambios realizados en la configuración.

---

# 18. Requisitos de persistencia funcional

**RF-300.** El sistema deberá conservar la información después de reiniciar los servicios.

**RF-301.** El sistema deberá conservar las cuentas de usuario después de reiniciar los contenedores.

**RF-302.** El sistema deberá conservar los cursos, unidades y lecciones después de reiniciar los contenedores.

**RF-303.** El sistema deberá conservar los archivos multimedia después de reiniciar los servicios.

**RF-304.** El sistema deberá conservar el progreso y las evaluaciones realizadas.

**RF-305.** El sistema deberá conservar los registros de auditoría.

**RF-306.** El sistema deberá permitir relacionar los registros de PostgreSQL con los archivos almacenados en MinIO.

---

# 19. Matriz resumida de módulos

| Módulo                        | Rango de requisitos |
| ----------------------------- | ------------------- |
| Autenticación                 | RF-001 a RF-047     |
| Usuarios y perfiles           | RF-048 a RF-075     |
| Cursos                        | RF-076 a RF-094     |
| Niveles, unidades y lecciones | RF-095 a RF-118     |
| Contenido educativo           | RF-119 a RF-136     |
| Vocabulario y pronunciación   | RF-137 a RF-154     |
| Archivos multimedia           | RF-155 a RF-179     |
| Ejercicios y evaluaciones     | RF-180 a RF-216     |
| Progreso                      | RF-217 a RF-233     |
| Notificaciones                | RF-234 a RF-248     |
| Panel administrativo          | RF-249 a RF-265     |
| Auditoría                     | RF-266 a RF-282     |
| Navegación pública            | RF-283 a RF-290     |
| Configuración general         | RF-291 a RF-299     |
| Persistencia funcional        | RF-300 a RF-306     |

---

# 20. Priorización inicial

Para la construcción de la versión 1 se utilizarán las siguientes prioridades.

## Prioridad alta

Funciones necesarias para que la plataforma pueda utilizarse:

- Registro.
- Confirmación de correo.
- Inicio de sesión.
- Recuperación de contraseña.
- Usuarios y perfiles.
- Cursos.
- Unidades y lecciones.
- Contenido educativo.
- Archivos multimedia.
- Evaluaciones.
- Progreso.
- Panel administrativo.
- Control de permisos.

## Prioridad media

Funciones importantes que complementan la operación:

- Vocabulario general.
- Notificaciones internas.
- Correos de avisos.
- Reportes básicos.
- Auditoría.
- Configuración general.

## Prioridad baja para la primera entrega

Funciones que pueden completarse al final de la versión 1:

- Filtros avanzados.
- Estadísticas detalladas.
- Configuración administrativa de todos los límites.
- Eliminación individual de notificaciones.
- Reportes con múltiples combinaciones de filtros.

---

# 21. Criterios generales de validación

Cada requisito funcional deberá poder validarse mediante al menos uno de los siguientes métodos:

- Prueba manual.
- Prueba automatizada.
- Inspección de la interfaz.
- Consulta de la API.
- Verificación en PostgreSQL.
- Verificación en MinIO.
- Revisión de registros.
- Validación del control de permisos.

Un requisito se considerará cumplido cuando:

1. La función esté implementada.
2. La función pueda ejecutarse sin errores críticos.
3. Los datos sean almacenados correctamente.
4. Los permisos sean respetados.
5. Exista una prueba o evidencia de su funcionamiento.

---

# 22. Control de cambios

Cualquier requisito funcional nuevo deberá:

1. Recibir un identificador único.
2. Ser agregado al módulo correspondiente.
3. Evaluarse contra el alcance de la versión 1.
4. Relacionarse con sus casos de uso.
5. Considerarse en el modelo de datos.
6. Incluirse en el plan de pruebas.

Los requisitos que no se encuentren en este documento deberán considerarse fuera del alcance inicial hasta que sean aprobados formalmente.

---

# 23. Aprobación del documento

| Responsable | Cargo o función             | Firma | Fecha |
| ----------- | --------------------------- | ----- | ----- |
|             | Responsable del proyecto    |       |       |
|             | Representante institucional |       |       |
|             | Revisor                     |       |       |
