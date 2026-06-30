# Alcance de la versión 1

## Plataforma web para el aprendizaje del idioma kaqchikel

**Institución:** Dirección General de Educación Bilingüe Intercultural —DIGEBI—, Ministerio de Educación de Guatemala
**Nombre del proyecto:** Plataforma web para el aprendizaje del idioma kaqchikel
**Versión del documento:** 1.0
**Versión del sistema:** Versión 1
**Estado:** Definición inicial
**Fecha:** Junio de 2026

---

## 1. Introducción

El presente documento define el alcance funcional y técnico de la primera versión de la plataforma web para el aprendizaje del idioma kaqchikel.

La plataforma será desarrollada como parte de un proyecto tecnológico orientado al fortalecimiento de los procesos de enseñanza y aprendizaje del idioma kaqchikel mediante recursos digitales accesibles desde computadoras, tabletas y teléfonos móviles.

Esta primera versión estará enfocada en proporcionar una base funcional, segura y administrable que permita publicar contenido educativo, reproducir recursos audiovisuales, realizar actividades de aprendizaje y registrar el progreso de los usuarios.

El documento establece las funciones que estarán incluidas en la versión 1, las funciones que serán consideradas para versiones posteriores, los tipos de usuario, los módulos principales y los criterios que deberán cumplirse para considerar terminada esta primera etapa del sistema.

---

## 2. Descripción general del proyecto

La plataforma será una aplicación web educativa destinada al aprendizaje del idioma kaqchikel.

Permitirá organizar contenido mediante cursos, niveles, unidades y lecciones. Cada lección podrá incluir textos, vocabulario, imágenes, audios, videos, diálogos, ejemplos y ejercicios interactivos.

Los usuarios podrán registrarse utilizando un correo electrónico personal, confirmar su cuenta, iniciar sesión, consultar los cursos disponibles, completar lecciones, resolver evaluaciones y revisar su progreso.

La administración del contenido y de los usuarios será realizada por un administrador general, quien tendrá control completo sobre la plataforma.

La plataforma será alojada en un servidor dedicado y utilizará contenedores Docker para administrar sus diferentes servicios. Los archivos audiovisuales serán almacenados mediante MinIO en un volumen externo, mientras que la información estructurada será almacenada en PostgreSQL.

---

## 3. Problema que busca resolver

Actualmente, parte del contenido educativo para el aprendizaje del idioma kaqchikel se encuentra distribuido en documentos, grabaciones, materiales físicos o recursos digitales independientes.

Esta situación puede dificultar:

- El acceso organizado a los contenidos.
- La consulta de materiales desde diferentes dispositivos.
- La reproducción de audios de pronunciación.
- El seguimiento del progreso de los estudiantes.
- La actualización y administración de los recursos.
- La incorporación de ejercicios interactivos.
- La disponibilidad permanente del contenido educativo.
- La centralización de materiales lingüísticos y audiovisuales.

La plataforma busca proporcionar un espacio digital centralizado donde los usuarios puedan acceder a recursos educativos organizados y avanzar de forma progresiva en el aprendizaje del idioma kaqchikel.

---

## 4. Objetivo general

Desarrollar una plataforma web para apoyar el aprendizaje del idioma kaqchikel mediante cursos, lecciones, recursos audiovisuales, ejercicios interactivos y mecanismos de seguimiento del progreso de los usuarios.

---

## 5. Objetivos específicos

1. Organizar el contenido educativo en cursos, niveles, unidades y lecciones.

2. Proporcionar recursos de texto, imagen, audio y video relacionados con el aprendizaje del idioma kaqchikel.

3. Facilitar el aprendizaje de vocabulario y pronunciación mediante materiales audiovisuales.

4. Permitir que los usuarios realicen ejercicios y evaluaciones relacionadas con las lecciones.

5. Registrar el avance individual de cada usuario dentro de los cursos.

6. Proporcionar un panel administrativo para gestionar usuarios, contenido educativo y archivos multimedia.

7. Proteger el acceso a la plataforma mediante autenticación, sesiones seguras y control de permisos.

8. Garantizar la persistencia de la información mediante PostgreSQL, MinIO, volúmenes de almacenamiento y respaldos periódicos.

9. Diseñar una interfaz adaptable a computadoras, tabletas y dispositivos móviles.

10. Establecer una arquitectura técnica que permita ampliar la plataforma en futuras versiones.

---

## 6. Usuarios objetivo

La plataforma estará dirigida principalmente a:

- Estudiantes interesados en aprender el idioma kaqchikel.
- Docentes que deseen utilizar los recursos disponibles como apoyo educativo.
- Personal relacionado con procesos de educación bilingüe e intercultural.
- Personas interesadas en fortalecer sus conocimientos del idioma kaqchikel.
- Administradores responsables de publicar y gestionar el contenido educativo.

En la versión 1, los docentes y estudiantes tendrán los mismos permisos generales dentro de la plataforma. La diferencia entre ambos se almacenará únicamente como información de perfil.

---

## 7. Tipos de usuario

La versión 1 contará con dos roles principales.

### 7.1 Administrador

El administrador tendrá acceso total a la plataforma.

Será el responsable de:

- Administrar usuarios.
- Crear, modificar y eliminar cursos.
- Crear niveles, unidades y lecciones.
- Cargar archivos multimedia.
- Administrar vocabulario.
- Crear ejercicios y evaluaciones.
- Publicar o despublicar contenido.
- Consultar el progreso de los usuarios.
- Enviar notificaciones.
- Consultar registros de auditoría.
- Configurar aspectos generales del sistema.
- Bloquear, activar o desactivar cuentas.
- Consultar reportes básicos de uso.

En la versión 1 existirá un único administrador general.

### 7.2 Usuario

El rol de usuario incluirá estudiantes, docentes y otras personas registradas.

Los usuarios podrán:

- Registrarse en la plataforma.
- Confirmar su correo electrónico.
- Iniciar y cerrar sesión.
- Recuperar su contraseña.
- Actualizar sus datos personales.
- Consultar cursos publicados.
- Acceder a unidades y lecciones.
- Reproducir audios y videos.
- Consultar vocabulario.
- Resolver ejercicios y evaluaciones.
- Consultar su propio progreso.
- Recibir notificaciones.
- Cambiar su contraseña.

Como información adicional, cada usuario podrá identificarse con uno de los siguientes tipos de perfil:

- Estudiante.
- Docente.
- Otro.

El tipo de perfil no modificará los permisos del usuario durante la versión 1.

### 7.3 Visitante

Un visitante será una persona que todavía no haya iniciado sesión.

Podrá consultar únicamente:

- Página principal.
- Información general de la plataforma.
- Información institucional disponible públicamente.
- Formulario de registro.
- Formulario de inicio de sesión.
- Recuperación de contraseña.
- Cursos o información que el administrador determine como pública.

El visitante no será almacenado como un rol dentro de la base de datos.

---

## 8. Alcance funcional de la versión 1

La primera versión incluirá los siguientes módulos.

### 8.1 Módulo de autenticación

Permitirá administrar el acceso de los usuarios a la plataforma.

Incluirá:

- Registro mediante correo electrónico personal.
- Inicio de sesión.
- Cierre de sesión.
- Confirmación de correo electrónico.
- Recuperación de contraseña.
- Restablecimiento de contraseña.
- Cambio de contraseña.
- Manejo de sesiones.
- Cookies seguras de tipo `httpOnly`.
- Control de acceso basado en roles.
- Protección de rutas privadas.
- Validación de credenciales.
- Control básico de intentos de acceso.

---

### 8.2 Módulo de usuarios y perfiles

Permitirá almacenar y administrar la información de los usuarios.

Incluirá:

- Nombre.
- Apellidos.
- Correo electrónico.
- Contraseña cifrada.
- Rol.
- Tipo de perfil.
- Fotografía opcional.
- Estado de la cuenta.
- Estado de confirmación del correo.
- Fecha de registro.
- Fecha del último acceso.
- Actualización de datos personales.
- Activación, bloqueo o desactivación de cuentas.
- Consulta de usuarios desde el panel administrativo.

---

### 8.3 Módulo de cursos

Permitirá crear y administrar los cursos disponibles.

Cada curso podrá contener:

- Nombre.
- Descripción.
- Imagen de portada.
- Objetivos.
- Nivel de dificultad.
- Estado de publicación.
- Orden de presentación.
- Fecha de creación.
- Fecha de actualización.
- Fecha de publicación.

Los cursos podrán mantenerse como borrador antes de ser publicados.

---

### 8.4 Módulo de niveles, unidades y lecciones

El contenido educativo se organizará mediante la siguiente estructura:

```text
Curso
└── Nivel
    └── Unidad
        └── Lección
```

Cada nivel podrá contener varias unidades y cada unidad podrá contener varias lecciones.

El administrador podrá:

- Crear niveles.
- Crear unidades.
- Crear lecciones.
- Definir el orden del contenido.
- Modificar el contenido.
- Publicar o despublicar lecciones.
- Eliminar contenido cuando sea necesario.

---

### 8.5 Módulo de contenido educativo

Las lecciones podrán construirse mediante diferentes bloques de contenido.

Los tipos de bloque considerados para la versión 1 serán:

- Texto.
- Título o subtítulo.
- Vocabulario.
- Imagen.
- Audio.
- Video.
- Diálogo.
- Ejemplo.
- Nota informativa.
- Ejercicio.
- Documento descargable.

Los bloques podrán organizarse en un orden específico dentro de cada lección.

Esta estructura permitirá combinar diferentes recursos sin limitar todas las lecciones a un único formato.

---

### 8.6 Módulo de vocabulario y pronunciación

Permitirá registrar palabras y expresiones en idioma kaqchikel.

Cada registro podrá incluir:

- Palabra o expresión en kaqchikel.
- Traducción al español.
- Descripción.
- Ejemplo de uso.
- Audio de pronunciación.
- Imagen opcional.
- Categoría.
- Variante lingüística, cuando corresponda.
- Lección relacionada.
- Estado de publicación.

Las palabras podrán ser utilizadas dentro de las lecciones y también consultadas desde un glosario general.

---

### 8.7 Módulo de archivos multimedia

Permitirá gestionar los recursos audiovisuales de la plataforma.

Incluirá:

- Audios.
- Imágenes.
- Videos.
- Documentos PDF.
- Fotografías de perfil.
- Portadas de cursos.
- Materiales complementarios.

Los archivos serán almacenados mediante MinIO dentro de un volumen externo.

PostgreSQL almacenará únicamente la información descriptiva del archivo, incluyendo:

- Nombre original.
- Nombre interno.
- Tipo de archivo.
- Tamaño.
- Ubicación dentro del almacenamiento.
- Usuario responsable de la carga.
- Fecha de carga.
- Relación con cursos, lecciones o vocabulario.

El sistema deberá validar:

- Tipo de archivo permitido.
- Tamaño máximo.
- Extensión.
- Usuario responsable.
- Ubicación de almacenamiento.

---

### 8.8 Módulo de ejercicios y evaluaciones

Permitirá crear actividades relacionadas con las lecciones.

La versión 1 podrá incluir:

- Selección múltiple.
- Verdadero o falso.
- Relación entre palabra y traducción.
- Escuchar un audio y seleccionar una respuesta.
- Completar una palabra o expresión.
- Ordenar palabras para formar una oración.

Cada evaluación podrá incluir:

- Nombre.
- Descripción.
- Instrucciones.
- Preguntas.
- Opciones de respuesta.
- Respuesta correcta.
- Puntuación.
- Número máximo de intentos, cuando corresponda.
- Estado de publicación.

El sistema registrará:

- Usuario.
- Evaluación realizada.
- Respuestas proporcionadas.
- Puntuación obtenida.
- Fecha y hora.
- Número de intento.
- Estado de aprobación.

---

### 8.9 Módulo de progreso

Permitirá registrar el avance individual de los usuarios.

Incluirá:

- Cursos iniciados.
- Unidades consultadas.
- Lecciones iniciadas.
- Lecciones completadas.
- Evaluaciones realizadas.
- Puntuaciones obtenidas.
- Porcentaje de avance.
- Última actividad.
- Fecha de finalización de un curso.

Cada usuario podrá consultar únicamente su propio progreso.

El administrador podrá consultar el progreso general de los usuarios.

---

### 8.10 Módulo de notificaciones

Permitirá enviar avisos a los usuarios.

La versión 1 incluirá:

- Notificaciones internas.
- Correos electrónicos.
- Mensaje de bienvenida.
- Confirmación de cuenta.
- Recuperación de contraseña.
- Aviso de publicación de contenido.
- Avisos generales del administrador.
- Notificación de curso completado.

El envío de correos utilizará un servicio SMTP configurado en el servidor.

---

### 8.11 Panel administrativo

El administrador contará con un panel privado.

El panel incluirá acceso a:

- Dashboard general.
- Usuarios.
- Cursos.
- Niveles.
- Unidades.
- Lecciones.
- Vocabulario.
- Multimedia.
- Ejercicios.
- Evaluaciones.
- Progreso.
- Notificaciones.
- Reportes básicos.
- Auditoría.
- Configuración general.

El dashboard podrá mostrar:

- Total de usuarios.
- Usuarios activos.
- Usuarios registrados recientemente.
- Cursos publicados.
- Lecciones disponibles.
- Evaluaciones realizadas.
- Cursos completados.
- Actividad reciente.
- Cantidad de archivos almacenados.
- Espacio de almacenamiento utilizado.

---

### 8.12 Módulo de auditoría

Permitirá registrar acciones importantes realizadas dentro de la plataforma.

Se podrán registrar eventos como:

- Inicio de sesión administrativo.
- Creación de cursos.
- Modificación de lecciones.
- Eliminación de contenido.
- Publicación o despublicación.
- Carga o eliminación de archivos.
- Bloqueo de usuarios.
- Cambios en la configuración.
- Creación de evaluaciones.

Cada registro podrá almacenar:

- Usuario responsable.
- Acción realizada.
- Tipo de elemento afectado.
- Identificador del elemento.
- Fecha y hora.
- Dirección IP.
- Información adicional del evento.

---

## 9. Alcance técnico de la versión 1

La plataforma será desarrollada utilizando las siguientes tecnologías.

### 9.1 Frontend

- Next.js.
- React.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Zod.
- Diseño adaptable o responsive.

### 9.2 Backend

- Node.js.
- Express.
- TypeScript.
- Prisma ORM.
- API REST.
- Autenticación propia.
- Cookies `httpOnly`.
- Control de roles.
- Validación de datos.
- Registro de errores.

### 9.3 Base de datos

- PostgreSQL.
- Migraciones mediante Prisma.
- Datos persistentes.
- Respaldos periódicos.
- Base de datos alojada dentro de una red privada de Docker.

### 9.4 Archivos multimedia

- MinIO.
- Volumen externo de 1 TB.
- Separación entre archivos y registros de base de datos.
- Organización mediante buckets y rutas internas.
- Control de tipos y tamaños de archivo.

### 9.5 Infraestructura

- Servidor dedicado.
- Docker.
- Docker Compose.
- Nginx.
- Cloudflare.
- Cloudflare Tunnel.
- Dominio propio.
- Certificados HTTPS.
- Red privada de contenedores.
- Variables de entorno.
- Sistema de respaldos.

### 9.6 Monitoreo

- Uptime Kuma.
- Dozzle.
- Consulta del estado de servicios.
- Visualización de registros de contenedores.
- Verificación de disponibilidad de la plataforma.

### 9.7 Control de versiones

- Git.
- GitHub.
- Repositorio único para frontend, backend, infraestructura y documentación.
- Uso de ramas durante el desarrollo.
- Registro de cambios mediante commits.

---

## 10. Requisitos generales de seguridad

La versión 1 deberá considerar como mínimo:

- Contraseñas almacenadas mediante algoritmos de hash seguros.
- Cookies `httpOnly`.
- Uso obligatorio de HTTPS.
- Validación de datos recibidos.
- Control de roles en el backend.
- Protección de rutas administrativas.
- Restricción de acceso directo a PostgreSQL.
- Restricción de acceso directo a MinIO.
- Control de carga de archivos.
- Límite de solicitudes.
- Protección básica contra intentos repetidos de inicio de sesión.
- Uso de variables de entorno.
- Registro de acciones administrativas.
- Copias de respaldo.
- Actualización periódica de dependencias y contenedores.
- Configuración adecuada de CORS.
- Manejo seguro de sesiones.
- Expiración de tokens de confirmación y recuperación.

La interfaz no será considerada un mecanismo de seguridad. Todos los permisos deberán validarse en el backend.

---

## 11. Requisitos generales de usabilidad

La plataforma deberá:

- Adaptarse a computadoras, tabletas y teléfonos móviles.
- Utilizar una navegación clara.
- Mantener una interfaz visual uniforme.
- Presentar mensajes de error comprensibles.
- Mostrar estados de carga.
- Permitir regresar fácilmente al contenido anterior.
- Utilizar botones y controles accesibles.
- Identificar claramente las lecciones completadas.
- Facilitar la reproducción de audios.
- Presentar el progreso de forma visual.
- Evitar interfaces excesivamente complejas.

---

## 12. Funciones no incluidas en la versión 1

Las siguientes funciones quedan fuera del alcance inicial:

- Aplicación móvil nativa.
- Reconocimiento automático de voz.
- Evaluación automática de pronunciación.
- Inteligencia artificial generativa.
- Chat entre usuarios.
- Foros.
- Videollamadas.
- Clases en vivo.
- Sistema de mensajería privada.
- Administración independiente para docentes.
- Creación de contenido por parte de usuarios.
- Múltiples administradores con permisos diferentes.
- Certificados digitales avanzados.
- Insignias y sistema de recompensas.
- Competencias entre usuarios.
- Tabla de posiciones.
- Integración con redes sociales.
- Inicio de sesión mediante Google, Facebook u otros proveedores.
- Pagos o suscripciones.
- Modo completamente sin conexión.
- Traducción automática.
- Generación automática de contenido.
- Integración con sistemas externos del Ministerio de Educación.
- Analítica avanzada.
- Aplicación de escritorio.

Estas funciones podrán evaluarse para versiones posteriores.

---

## 13. Supuestos del proyecto

Para la definición de la versión 1 se consideran los siguientes supuestos:

- Existirá un servidor dedicado disponible para alojar la plataforma.
- El servidor contará con conexión estable a Internet.
- Se dispondrá de un dominio propio.
- Cloudflare será utilizado para DNS, HTTPS y acceso mediante túnel.
- El almacenamiento externo estará conectado permanentemente al servidor.
- Los materiales educativos serán proporcionados o validados por personal autorizado.
- Los audios, imágenes y videos tendrán autorización para ser utilizados.
- El administrador será responsable de revisar el contenido antes de publicarlo.
- Los usuarios utilizarán correos personales válidos.
- El sistema SMTP estará correctamente configurado.
- La primera versión será administrada por una única persona.
- El acceso principal será mediante navegador web.
- Los usuarios contarán con conexión a Internet para utilizar la plataforma.

---

## 14. Restricciones

La versión 1 tendrá las siguientes restricciones:

- Existirá un único administrador general.
- Los docentes no podrán crear contenido.
- Los estudiantes y docentes compartirán el mismo rol de usuario.
- El almacenamiento dependerá de la capacidad disponible en el volumen externo.
- La disponibilidad dependerá de la conexión eléctrica y de Internet del servidor.
- Los videos de gran tamaño podrán requerir optimización antes de ser cargados.
- No se implementará reconocimiento de voz.
- No se implementará una aplicación móvil nativa.
- No se permitirá el registro de usuarios menores sin considerar posteriormente las políticas institucionales correspondientes.
- La plataforma no sustituirá completamente la orientación de un docente.
- Las variantes lingüísticas deberán ser identificadas correctamente en los materiales.

---

## 15. Respaldo y recuperación

La plataforma deberá contar con mecanismos de respaldo para:

- Base de datos PostgreSQL.
- Archivos de MinIO.
- Variables de configuración.
- Archivos de infraestructura.
- Documentación del proyecto.

Como política inicial se propone conservar:

- Siete respaldos diarios.
- Cuatro respaldos semanales.
- Seis respaldos mensuales.

Los respaldos deberán almacenarse en el volumen externo y, cuando sea posible, mantener una copia adicional fuera del servidor principal.

La base de datos activa deberá permanecer preferentemente en el almacenamiento interno del servidor.

---

## 16. Resultados esperados

Al finalizar la versión 1 se espera contar con:

- Plataforma accesible mediante dominio propio.
- Conexión segura mediante HTTPS.
- Sistema de registro e inicio de sesión.
- Confirmación de correo.
- Recuperación de contraseña.
- Panel administrativo.
- Administración de usuarios.
- Creación de cursos.
- Organización por niveles, unidades y lecciones.
- Publicación de contenido educativo.
- Reproducción de audios y videos.
- Glosario de vocabulario.
- Ejercicios y evaluaciones.
- Registro de progreso.
- Notificaciones internas y por correo.
- Almacenamiento de archivos mediante MinIO.
- Base de datos PostgreSQL.
- Servicios administrados mediante Docker Compose.
- Monitoreo básico.
- Respaldos automáticos.
- Documentación técnica y funcional.

---

## 17. Criterios de aceptación de la versión 1

La versión 1 se considerará terminada cuando se cumplan los siguientes criterios:

1. La plataforma puede abrirse desde el dominio configurado.

2. La conexión utiliza HTTPS.

3. Un usuario puede registrarse con un correo personal.

4. El usuario recibe y puede utilizar el enlace de confirmación de cuenta.

5. Un usuario confirmado puede iniciar y cerrar sesión.

6. El usuario puede recuperar su contraseña.

7. Las sesiones se manejan mediante cookies seguras.

8. El administrador puede ingresar al panel administrativo.

9. Un usuario normal no puede acceder al panel administrativo.

10. El administrador puede crear, modificar, publicar y eliminar cursos.

11. El administrador puede organizar niveles, unidades y lecciones.

12. Las lecciones pueden incluir texto, imágenes, audios y videos.

13. Los archivos multimedia se almacenan en MinIO.

14. PostgreSQL almacena correctamente la información relacionada con los archivos.

15. Los usuarios pueden consultar cursos publicados.

16. Los usuarios pueden completar lecciones.

17. Los usuarios pueden realizar ejercicios y evaluaciones.

18. El sistema registra los resultados de las evaluaciones.

19. El sistema calcula y muestra el progreso de cada usuario.

20. El administrador puede consultar el progreso general.

21. Las acciones administrativas principales quedan registradas en la auditoría.

22. El sistema genera respaldos de la base de datos.

23. Los servicios pueden levantarse mediante Docker Compose.

24. PostgreSQL y MinIO no se encuentran expuestos directamente a Internet.

25. La plataforma funciona correctamente en computadoras y dispositivos móviles.

26. Los errores principales se muestran mediante mensajes comprensibles.

27. Los datos permanecen almacenados después de reiniciar los contenedores.

28. Uptime Kuma puede verificar el estado de los servicios principales.

29. Dozzle permite consultar los registros de los contenedores.

30. La documentación de instalación, configuración y uso se encuentra disponible.

---

## 18. Posibles mejoras para versiones posteriores

En versiones futuras se podrá considerar:

- Administración de contenido por parte de docentes.
- Nuevos roles institucionales.
- Aplicación móvil.
- Modo sin conexión.
- Reconocimiento de voz.
- Evaluación de pronunciación.
- Inteligencia artificial educativa.
- Recomendaciones personalizadas.
- Certificados.
- Insignias.
- Seguimiento por grupos o establecimientos.
- Reportes avanzados.
- Integración con sistemas institucionales.
- Foros.
- Clases en vivo.
- Gamificación.
- Estadísticas lingüísticas.
- Soporte para otros idiomas mayas.
- Integración con almacenamiento en la nube.
- Balanceo de carga.
- Alta disponibilidad.
- Réplica de base de datos.

---

## 19. Resumen del alcance

La versión 1 estará centrada en cinco funciones principales:

1. Administrar usuarios de forma segura.
2. Publicar contenido educativo organizado.
3. Proporcionar materiales audiovisuales para el aprendizaje.
4. Evaluar conocimientos mediante ejercicios.
5. Registrar el progreso individual de los usuarios.

La prioridad será construir una plataforma funcional, segura, fácil de administrar y preparada para crecer en futuras versiones, evitando agregar inicialmente funciones que aumenten innecesariamente la complejidad del proyecto.

---

## 20. Aprobación del alcance

El presente documento servirá como referencia para el diseño, desarrollo, pruebas y validación de la versión 1.

Cualquier función que no se encuentre definida dentro de este documento deberá considerarse fuera del alcance inicial y evaluarse mediante una modificación formal o como parte de una versión posterior.

| Responsable | Cargo o función             | Firma | Fecha |
| ----------- | --------------------------- | ----- | ----- |
|             | Responsable del proyecto    |       |       |
|             | Representante institucional |       |       |
|             | Revisor                     |       |       |
