# Requisitos no funcionales

## Plataforma web para el aprendizaje del idioma kaqchikel

**Institución:** Dirección General de Educación Bilingüe Intercultural —DIGEBI—, Ministerio de Educación de Guatemala
**Nombre del proyecto:** Plataforma web para el aprendizaje del idioma kaqchikel
**Versión del documento:** 1.0
**Versión del sistema:** Versión 1
**Estado:** Definición inicial
**Fecha:** Junio de 2026

---

## 1. Introducción

El presente documento define los requisitos no funcionales de la primera versión de la plataforma web para el aprendizaje del idioma kaqchikel.

Los requisitos no funcionales establecen las características de calidad que deberá cumplir el sistema, incluyendo aspectos relacionados con:

- Rendimiento.
- Disponibilidad.
- Seguridad.
- Privacidad.
- Usabilidad.
- Accesibilidad.
- Compatibilidad.
- Mantenimiento.
- Escalabilidad.
- Respaldos.
- Monitoreo.
- Pruebas.
- Despliegue.

A diferencia de los requisitos funcionales, estos requisitos no describen directamente una acción específica del usuario, sino las condiciones bajo las cuales deberá funcionar la plataforma.

Cada requisito será identificado mediante el formato:

```text
RNF-001
RNF-002
RNF-003
```

---

## 2. Objetivo del documento

Definir las características técnicas y de calidad necesarias para garantizar que la plataforma sea:

- Segura.
- Estable.
- Fácil de utilizar.
- Adaptable a diferentes dispositivos.
- Mantenible.
- Recuperable ante fallos.
- Preparada para crecer.
- Adecuada para un entorno institucional.

---

# 3. Requisitos generales de calidad

**RNF-001.** La plataforma deberá ser desarrollada como una aplicación web accesible mediante navegadores modernos.

**RNF-002.** La plataforma deberá mantener una separación clara entre frontend, backend, base de datos, almacenamiento multimedia e infraestructura.

**RNF-003.** La plataforma deberá utilizar tecnologías con soporte activo y documentación disponible.

**RNF-004.** La plataforma deberá permitir la actualización de sus componentes sin requerir una reconstrucción completa del sistema.

**RNF-005.** La arquitectura deberá permitir incorporar nuevas funciones en versiones posteriores.

---

# 4. Requisitos de rendimiento

**RNF-006.** La página principal deberá cargar en un tiempo razonable bajo condiciones normales de conexión.

**RNF-007.** Las páginas internas deberán mostrar una respuesta inicial en un tiempo máximo recomendado de tres segundos bajo condiciones normales.

**RNF-008.** Las solicitudes comunes de la API deberán responder preferentemente en menos de un segundo, sin considerar cargas de archivos grandes.

**RNF-009.** Las consultas de listas deberán utilizar paginación cuando la cantidad de registros pueda ser elevada.

**RNF-010.** El sistema deberá evitar la carga simultánea de todos los registros de usuarios, cursos, archivos o auditoría.

**RNF-011.** Las imágenes deberán mostrarse utilizando tamaños apropiados para cada dispositivo.

**RNF-012.** Los archivos multimedia no deberán bloquear la carga del resto de la interfaz.

**RNF-013.** Los videos y audios deberán reproducirse mediante transmisión progresiva o un mecanismo que evite descargar completamente el archivo antes de iniciar.

**RNF-014.** El sistema deberá evitar consultas innecesarias o repetidas a PostgreSQL.

**RNF-015.** Las consultas frecuentes deberán contar con índices adecuados en la base de datos.

**RNF-016.** La plataforma deberá controlar el tamaño de las respuestas enviadas por la API.

**RNF-017.** El frontend deberá utilizar estados de carga mientras espera una respuesta del backend.

**RNF-018.** Las operaciones de carga de archivos deberán mostrar el progreso cuando sea técnicamente posible.

---

# 5. Requisitos de disponibilidad y confiabilidad

**RNF-019.** La plataforma deberá estar disponible de forma continua mientras el servidor, la conexión eléctrica y el acceso a Internet se encuentren operativos.

**RNF-020.** Los servicios principales deberán configurarse para reiniciarse automáticamente después de una interrupción o reinicio del servidor.

**RNF-021.** Los contenedores deberán utilizar una política de reinicio apropiada.

**RNF-022.** La plataforma deberá conservar la información después del reinicio de los contenedores.

**RNF-023.** La falla temporal de un servicio secundario no deberá provocar la pérdida de información almacenada.

**RNF-024.** La falla del servicio de correo no deberá impedir permanentemente el funcionamiento del resto de la plataforma.

**RNF-025.** El sistema deberá informar de forma comprensible cuando un servicio no esté disponible.

**RNF-026.** Las operaciones críticas deberán evitar registros incompletos mediante transacciones de base de datos cuando corresponda.

**RNF-027.** El sistema deberá evitar que una misma solicitud crítica se procese varias veces accidentalmente.

**RNF-028.** Los archivos cargados deberán validarse antes de considerarse disponibles para su uso.

**RNF-029.** El sistema deberá evitar referencias hacia archivos inexistentes cuando sea posible.

**RNF-030.** La aplicación deberá contar con endpoints de comprobación de estado.

Ejemplos:

```text
GET /api/health
GET /api/status
```

---

# 6. Requisitos de seguridad

## Seguridad de comunicaciones

**RNF-031.** Todo acceso público a la plataforma deberá utilizar HTTPS.

**RNF-032.** Las solicitudes mediante HTTP deberán redirigirse hacia HTTPS.

**RNF-033.** La comunicación externa deberá gestionarse mediante Cloudflare, Cloudflare Tunnel y Nginx.

**RNF-034.** PostgreSQL no deberá exponerse directamente a Internet.

**RNF-035.** MinIO no deberá exponerse públicamente sin controles de acceso.

**RNF-036.** Los servicios internos deberán comunicarse mediante redes privadas de Docker.

---

## Seguridad de autenticación

**RNF-037.** Las contraseñas no deberán almacenarse en texto plano.

**RNF-038.** Las contraseñas deberán almacenarse mediante un algoritmo de hash seguro.

**RNF-039.** El sistema deberá utilizar cookies con el atributo `httpOnly`.

**RNF-040.** En producción, las cookies de autenticación deberán utilizar el atributo `secure`.

**RNF-041.** Las cookies deberán utilizar una política `sameSite` apropiada.

**RNF-042.** Las sesiones deberán contar con una fecha de expiración.

**RNF-043.** El sistema deberá invalidar una sesión después del cierre de sesión.

**RNF-044.** El sistema deberá invalidar las sesiones anteriores cuando se restablezca una contraseña.

**RNF-045.** Los enlaces de confirmación y recuperación deberán utilizar tokens únicos.

**RNF-046.** Los tokens de confirmación y recuperación deberán expirar.

**RNF-047.** Los tokens utilizados no deberán poder reutilizarse.

**RNF-048.** El sistema deberá limitar los intentos repetidos de inicio de sesión.

**RNF-049.** El sistema deberá limitar las solicitudes repetidas de recuperación de contraseña.

---

## Control de acceso

**RNF-050.** Los permisos deberán validarse en el backend.

**RNF-051.** Ocultar una opción en el frontend no deberá considerarse una medida suficiente de seguridad.

**RNF-052.** Las rutas administrativas deberán requerir el rol `ADMIN`.

**RNF-053.** Los usuarios con rol `USER` no deberán ejecutar operaciones administrativas.

**RNF-054.** Cada usuario deberá consultar únicamente su propia información privada y progreso.

**RNF-055.** El sistema deberá verificar la propiedad de los recursos antes de permitir su modificación.

---

## Validación y protección de datos

**RNF-056.** Todos los datos enviados al backend deberán validarse.

**RNF-057.** La validación deberá realizarse nuevamente en el servidor, aunque el frontend ya haya validado los datos.

**RNF-058.** El sistema deberá utilizar consultas parametrizadas o las funciones seguras proporcionadas por Prisma.

**RNF-059.** La plataforma deberá protegerse contra inyección SQL.

**RNF-060.** La plataforma deberá reducir el riesgo de ataques de tipo Cross-Site Scripting.

**RNF-061.** La plataforma deberá contar con protección contra solicitudes no autorizadas entre sitios cuando corresponda.

**RNF-062.** El backend deberá configurar correctamente CORS.

**RNF-063.** El sistema deberá utilizar encabezados de seguridad apropiados.

**RNF-064.** Los mensajes de error públicos no deberán exponer contraseñas, tokens, consultas SQL ni rutas internas sensibles.

---

## Seguridad de archivos

**RNF-065.** La plataforma deberá validar la extensión y el tipo MIME de los archivos.

**RNF-066.** La plataforma deberá establecer límites de tamaño para imágenes, audios, videos y documentos.

**RNF-067.** El nombre original de un archivo no deberá utilizarse directamente como nombre interno de almacenamiento.

**RNF-068.** El sistema deberá generar identificadores o nombres únicos para los archivos almacenados.

**RNF-069.** Los archivos no permitidos deberán ser rechazados.

**RNF-070.** Los usuarios normales no deberán acceder directamente al panel de administración de MinIO.

**RNF-071.** Los archivos privados deberán entregarse mediante mecanismos controlados cuando corresponda.

---

## Seguridad de secretos y configuración

**RNF-072.** Las contraseñas de PostgreSQL, MinIO, SMTP y otros servicios deberán almacenarse en variables de entorno.

**RNF-073.** Los archivos `.env` con información real no deberán almacenarse en GitHub.

**RNF-074.** El repositorio deberá incluir un archivo `.env.example` sin credenciales reales.

**RNF-075.** Los secretos utilizados en producción deberán ser diferentes de los empleados durante el desarrollo.

**RNF-076.** Las credenciales predeterminadas de todos los servicios deberán modificarse antes del despliegue.

**RNF-077.** Los permisos del sistema operativo y del volumen externo deberán limitar el acceso no autorizado.

---

# 7. Requisitos de privacidad y protección de información

**RNF-078.** La plataforma deberá recopilar únicamente la información necesaria para su funcionamiento.

**RNF-079.** La plataforma deberá informar al usuario qué información personal será almacenada.

**RNF-080.** Los datos personales no deberán mostrarse públicamente sin autorización.

**RNF-081.** Los correos electrónicos de los usuarios no deberán ser visibles para otros usuarios.

**RNF-082.** El administrador deberá acceder únicamente a la información necesaria para gestionar la plataforma.

**RNF-083.** Los registros de auditoría deberán limitarse a información relevante para seguridad y administración.

**RNF-084.** Las contraseñas nunca deberán aparecer en registros del sistema.

**RNF-085.** Los tokens de recuperación o confirmación no deberán aparecer completos en los registros públicos.

**RNF-086.** La información de los usuarios deberá eliminarse, anonimizarse o conservarse según las políticas institucionales que se definan.

**RNF-087.** La plataforma deberá considerar políticas especiales cuando sea utilizada por menores de edad.

**RNF-088.** Antes de la publicación oficial deberá definirse una política de privacidad.

**RNF-089.** Antes de la publicación oficial deberán definirse los términos de uso de la plataforma.

---

# 8. Requisitos de usabilidad

**RNF-090.** La interfaz deberá ser clara y consistente.

**RNF-091.** Los elementos de navegación deberán mantenerse en ubicaciones similares entre las diferentes pantallas.

**RNF-092.** Los botones deberán utilizar textos comprensibles.

**RNF-093.** Las acciones peligrosas deberán distinguirse claramente de las acciones normales.

**RNF-094.** Las operaciones de eliminación deberán solicitar confirmación.

**RNF-095.** Los formularios deberán indicar cuáles campos son obligatorios.

**RNF-096.** Los errores de validación deberán mostrarse cerca del campo correspondiente.

**RNF-097.** Los mensajes de error deberán explicar de forma sencilla qué ocurrió.

**RNF-098.** Los mensajes de éxito deberán confirmar que una operación fue realizada.

**RNF-099.** La plataforma deberá mostrar indicadores de carga durante operaciones que tomen tiempo.

**RNF-100.** La plataforma deberá evitar que el usuario envíe varias veces el mismo formulario accidentalmente.

**RNF-101.** El usuario deberá poder identificar fácilmente la lección, unidad o curso en el que se encuentra.

**RNF-102.** El progreso deberá representarse mediante indicadores visuales y valores comprensibles.

**RNF-103.** Los controles de audio y video deberán ser fáciles de localizar y utilizar.

**RNF-104.** La interfaz administrativa deberá mantener separados los módulos principales.

**RNF-105.** La plataforma deberá ofrecer una navegación adecuada para usuarios con conocimientos tecnológicos básicos.

---

# 9. Requisitos de accesibilidad

**RNF-106.** La plataforma deberá utilizar elementos HTML semánticos cuando sea posible.

**RNF-107.** Los campos de formulario deberán contar con etiquetas identificables.

**RNF-108.** Las imágenes educativas deberán permitir texto alternativo.

**RNF-109.** Los iconos importantes deberán acompañarse de texto o etiquetas accesibles.

**RNF-110.** La plataforma deberá mantener un contraste adecuado entre texto y fondo.

**RNF-111.** La información no deberá comunicarse únicamente mediante colores.

**RNF-112.** Los elementos interactivos deberán poder utilizarse mediante teclado cuando sea posible.

**RNF-113.** El foco del teclado deberá ser visible.

**RNF-114.** Los botones y enlaces deberán contar con un tamaño adecuado para dispositivos táctiles.

**RNF-115.** Los textos deberán conservar su legibilidad al aumentar el nivel de zoom.

**RNF-116.** Los audios importantes deberán contar con una transcripción o contenido textual equivalente cuando sea posible.

**RNF-117.** Los videos educativos deberán considerar subtítulos o transcripciones cuando estén disponibles.

**RNF-118.** La estructura de encabezados deberá mantener un orden lógico.

---

# 10. Requisitos de compatibilidad

**RNF-119.** La plataforma deberá funcionar en versiones modernas de Google Chrome.

**RNF-120.** La plataforma deberá funcionar en versiones modernas de Mozilla Firefox.

**RNF-121.** La plataforma deberá funcionar en versiones modernas de Microsoft Edge.

**RNF-122.** La plataforma deberá funcionar en navegadores móviles basados en Chrome.

**RNF-123.** La plataforma deberá funcionar en Safari móvil cuando las características utilizadas sean compatibles.

**RNF-124.** La plataforma deberá adaptarse a computadoras de escritorio.

**RNF-125.** La plataforma deberá adaptarse a tabletas.

**RNF-126.** La plataforma deberá adaptarse a teléfonos móviles.

**RNF-127.** La interfaz no deberá depender exclusivamente de un tamaño de pantalla fijo.

**RNF-128.** Los archivos multimedia deberán utilizar formatos ampliamente compatibles.

---

# 11. Requisitos de diseño adaptable

**RNF-129.** La interfaz deberá utilizar un enfoque responsive.

**RNF-130.** El contenido no deberá producir desplazamiento horizontal innecesario en dispositivos móviles.

**RNF-131.** Los menús laterales deberán adaptarse o poder ocultarse en pantallas pequeñas.

**RNF-132.** Las tablas administrativas deberán ofrecer una presentación adaptable o desplazamiento controlado.

**RNF-133.** Los formularios deberán reorganizarse correctamente en pantallas pequeñas.

**RNF-134.** Los videos e imágenes deberán ajustarse al ancho disponible.

**RNF-135.** El tamaño del texto deberá mantenerse legible en dispositivos móviles.

---

# 12. Requisitos de mantenimiento

**RNF-136.** El código deberá organizarse por módulos y responsabilidades.

**RNF-137.** El frontend y el backend deberán mantenerse en directorios separados.

**RNF-138.** El backend deberá separar rutas, controladores, servicios, repositorios y validaciones.

**RNF-139.** La lógica de negocio no deberá concentrarse únicamente en los controladores.

**RNF-140.** Las consultas de base de datos deberán centralizarse mediante Prisma y repositorios cuando corresponda.

**RNF-141.** El código compartido deberá ubicarse en paquetes o directorios comunes.

**RNF-142.** Las constantes importantes no deberán repetirse manualmente en múltiples archivos.

**RNF-143.** Las funciones y módulos complejos deberán documentarse.

**RNF-144.** El proyecto deberá utilizar TypeScript.

**RNF-145.** El proyecto deberá contar con reglas de formato y análisis de código.

**RNF-146.** Los nombres de variables, funciones y archivos deberán seguir una convención consistente.

**RNF-147.** Las modificaciones de la base de datos deberán gestionarse mediante migraciones de Prisma.

**RNF-148.** Las migraciones aplicadas no deberán modificarse manualmente después de ser utilizadas en producción.

**RNF-149.** El repositorio deberá incluir instrucciones de instalación y ejecución.

**RNF-150.** Las dependencias deberán actualizarse periódicamente después de verificar su compatibilidad.

---

# 13. Requisitos de escalabilidad

**RNF-151.** La arquitectura deberá permitir aumentar la capacidad de almacenamiento.

**RNF-152.** La arquitectura deberá permitir trasladar PostgreSQL a otro servidor en el futuro.

**RNF-153.** La arquitectura deberá permitir trasladar MinIO a otro servidor o servicio compatible con S3.

**RNF-154.** La plataforma deberá utilizar paginación para manejar el crecimiento de registros.

**RNF-155.** Los identificadores de base de datos deberán permitir el crecimiento de las tablas.

**RNF-156.** La estructura de cursos, unidades y lecciones deberá permitir agregar nuevos niveles sin modificar la arquitectura principal.

**RNF-157.** La estructura de contenido deberá permitir incorporar nuevos tipos de bloques en versiones posteriores.

**RNF-158.** La arquitectura deberá permitir agregar nuevos roles en el futuro.

**RNF-159.** La infraestructura deberá permitir separar servicios en diferentes equipos si el uso aumenta.

**RNF-160.** La versión 1 no requerirá Kubernetes ni balanceo de carga avanzado.

---

# 14. Requisitos de base de datos

**RNF-161.** PostgreSQL deberá utilizar almacenamiento persistente.

**RNF-162.** Las relaciones entre tablas deberán mantener integridad referencial.

**RNF-163.** Los campos obligatorios deberán definirse como no nulos cuando corresponda.

**RNF-164.** Los campos únicos deberán contar con restricciones de unicidad.

**RNF-165.** El correo electrónico de los usuarios deberá almacenarse de forma normalizada.

**RNF-166.** Las fechas deberán almacenarse utilizando una convención consistente.

**RNF-167.** La aplicación deberá manejar correctamente la zona horaria.

**RNF-168.** Las eliminaciones deberán analizarse para evitar pérdida accidental de información relacionada.

**RNF-169.** Las tablas de gran crecimiento deberán contar con índices según las consultas utilizadas.

**RNF-170.** Las migraciones deberán probarse en un entorno de desarrollo antes de aplicarse en producción.

---

# 15. Requisitos de almacenamiento multimedia

**RNF-171.** MinIO deberá utilizar almacenamiento persistente en el volumen externo.

**RNF-172.** Los archivos deberán organizarse mediante buckets o rutas internas.

**RNF-173.** La organización de archivos deberá diferenciar imágenes, audios, videos, documentos y fotografías de perfil.

**RNF-174.** Los archivos físicos no deberán mezclarse con los archivos internos del código fuente.

**RNF-175.** La eliminación de un archivo deberá considerar si se encuentra relacionado con contenido educativo.

**RNF-176.** La base de datos deberá almacenar la referencia del objeto almacenado en MinIO.

**RNF-177.** Los enlaces temporales de acceso a archivos deberán tener una duración limitada cuando se utilicen.

**RNF-178.** El sistema deberá controlar el espacio disponible en el volumen externo.

**RNF-179.** La plataforma deberá advertir al administrador cuando el almacenamiento alcance un límite crítico definido.

---

# 16. Requisitos de respaldo y recuperación

**RNF-180.** La plataforma deberá realizar respaldos periódicos de PostgreSQL.

**RNF-181.** La plataforma deberá respaldar los archivos almacenados en MinIO.

**RNF-182.** La plataforma deberá respaldar la configuración necesaria para reconstruir los servicios.

**RNF-183.** La plataforma deberá conservar al menos siete respaldos diarios.

**RNF-184.** La plataforma deberá conservar al menos cuatro respaldos semanales.

**RNF-185.** La plataforma deberá conservar al menos seis respaldos mensuales.

**RNF-186.** Los respaldos deberán incluir la fecha y hora de creación.

**RNF-187.** Los respaldos deberán verificar si el proceso terminó correctamente.

**RNF-188.** Los errores durante un respaldo deberán registrarse.

**RNF-189.** Deberá existir una copia de respaldo adicional fuera del almacenamiento principal cuando sea posible.

**RNF-190.** El procedimiento de restauración deberá documentarse.

**RNF-191.** La restauración de PostgreSQL deberá probarse periódicamente.

**RNF-192.** La restauración de archivos de MinIO deberá probarse periódicamente.

**RNF-193.** Los respaldos no deberán incluirse dentro del repositorio Git.

**RNF-194.** Las credenciales incluidas en respaldos deberán protegerse adecuadamente.

---

# 17. Requisitos de monitoreo y registros

**RNF-195.** La disponibilidad de los servicios principales deberá monitorearse mediante Uptime Kuma.

**RNF-196.** Los registros de los contenedores deberán poder consultarse mediante Dozzle.

**RNF-197.** El backend deberá registrar errores internos.

**RNF-198.** Los registros deberán incluir fecha, hora, servicio y nivel de gravedad.

**RNF-199.** Los registros deberán diferenciar mensajes informativos, advertencias y errores.

**RNF-200.** Los registros no deberán incluir contraseñas.

**RNF-201.** Los registros no deberán exponer tokens completos.

**RNF-202.** Las solicitudes deberán poder relacionarse mediante un identificador cuando sea necesario.

**RNF-203.** El uso del espacio de almacenamiento deberá supervisarse.

**RNF-204.** El estado de PostgreSQL deberá supervisarse.

**RNF-205.** El estado de MinIO deberá supervisarse.

**RNF-206.** El estado del backend y frontend deberá comprobarse mediante endpoints de salud.

**RNF-207.** Los registros antiguos deberán rotarse o eliminarse según una política definida.

**RNF-208.** Los fallos críticos deberán generar una notificación al administrador cuando se implemente el mecanismo correspondiente.

---

# 18. Requisitos de pruebas y calidad

**RNF-209.** Las funciones principales deberán contar con pruebas.

**RNF-210.** La lógica de negocio crítica deberá contar con pruebas unitarias.

**RNF-211.** Las rutas principales de la API deberán contar con pruebas de integración.

**RNF-212.** Los flujos principales de usuario deberán probarse mediante Playwright.

**RNF-213.** El proceso de registro deberá incluirse en las pruebas funcionales.

**RNF-214.** El proceso de inicio de sesión deberá incluirse en las pruebas funcionales.

**RNF-215.** El proceso de recuperación de contraseña deberá incluirse en las pruebas funcionales.

**RNF-216.** La administración de cursos y lecciones deberá probarse.

**RNF-217.** La carga y reproducción de archivos deberá probarse.

**RNF-218.** Las evaluaciones y el cálculo de progreso deberán probarse.

**RNF-219.** El control de roles deberá incluir pruebas que verifiquen accesos permitidos y rechazados.

**RNF-220.** Las migraciones deberán probarse antes de aplicarse en producción.

**RNF-221.** La plataforma deberá revisarse en diferentes tamaños de pantalla.

**RNF-222.** Los errores encontrados deberán registrarse y clasificarse.

**RNF-223.** No deberá publicarse una versión con errores críticos conocidos.

---

# 19. Requisitos de despliegue e infraestructura

**RNF-224.** Los servicios deberán administrarse mediante Docker Compose.

**RNF-225.** Cada servicio principal deberá contar con su propio contenedor cuando corresponda.

**RNF-226.** El proyecto deberá incluir un archivo `compose.yaml`.

**RNF-227.** El frontend deberá contar con un Dockerfile.

**RNF-228.** El backend deberá contar con un Dockerfile.

**RNF-229.** PostgreSQL deberá utilizar un volumen persistente.

**RNF-230.** MinIO deberá utilizar un volumen persistente.

**RNF-231.** Nginx deberá actuar como proxy inverso.

**RNF-232.** Cloudflare Tunnel deberá utilizarse para evitar la exposición directa de puertos públicos del servidor.

**RNF-233.** Los servicios internos deberán utilizar nombres de red de Docker y no direcciones IP fijas.

**RNF-234.** Las configuraciones de desarrollo y producción deberán mantenerse separadas.

**RNF-235.** El despliegue deberá poder repetirse mediante instrucciones documentadas.

**RNF-236.** Los datos persistentes no deberán eliminarse al reconstruir los contenedores.

**RNF-237.** El sistema deberá poder reiniciarse sin requerir levantar manualmente cada servicio.

**RNF-238.** Las versiones de las imágenes de Docker deberán definirse explícitamente cuando sea posible.

---

# 20. Requisitos de control de versiones

**RNF-239.** El código fuente deberá almacenarse en GitHub.

**RNF-240.** El proyecto deberá utilizar Git para controlar los cambios.

**RNF-241.** Los cambios deberán registrarse mediante commits descriptivos.

**RNF-242.** El repositorio no deberá incluir archivos con credenciales.

**RNF-243.** El repositorio no deberá incluir archivos multimedia de gran tamaño utilizados en producción.

**RNF-244.** El repositorio deberá incluir un archivo `.gitignore`.

**RNF-245.** Las nuevas funciones importantes deberán desarrollarse en ramas separadas cuando sea conveniente.

**RNF-246.** La rama principal deberá contener únicamente versiones estables o validadas.

**RNF-247.** Las versiones importantes deberán poder identificarse mediante etiquetas o lanzamientos.

---

# 21. Requisitos lingüísticos y de contenido

**RNF-248.** La plataforma deberá mostrar correctamente caracteres utilizados en el idioma kaqchikel.

**RNF-249.** La base de datos deberá utilizar codificación Unicode.

**RNF-250.** El frontend deberá utilizar codificación UTF-8.

**RNF-251.** El sistema deberá conservar apóstrofos, tildes y caracteres especiales dentro del contenido.

**RNF-252.** Los textos en kaqchikel no deberán modificarse automáticamente sin validación.

**RNF-253.** Los contenidos lingüísticos deberán identificar la variante cuando corresponda.

**RNF-254.** Los audios deberán relacionarse claramente con la palabra, expresión o lección correspondiente.

**RNF-255.** Los materiales deberán ser revisados o validados por personal con conocimiento del idioma.

**RNF-256.** La plataforma deberá permitir presentar contenido en kaqchikel y español.

**RNF-257.** La interfaz principal podrá mostrarse inicialmente en español, incorporando contenido educativo en kaqchikel.

**RNF-258.** La arquitectura deberá permitir traducir la interfaz a otros idiomas en versiones futuras.

---

# 22. Requisitos de documentación

**RNF-259.** El proyecto deberá contar con documentación funcional.

**RNF-260.** El proyecto deberá contar con documentación técnica.

**RNF-261.** El proyecto deberá incluir instrucciones para instalar el entorno de desarrollo.

**RNF-262.** El proyecto deberá incluir instrucciones para ejecutar los servicios con Docker Compose.

**RNF-263.** El proyecto deberá documentar las variables de entorno.

**RNF-264.** El proyecto deberá documentar la estructura de carpetas.

**RNF-265.** El proyecto deberá documentar los modelos principales de la base de datos.

**RNF-266.** El proyecto deberá documentar las rutas principales de la API.

**RNF-267.** El proyecto deberá documentar los procedimientos de respaldo y restauración.

**RNF-268.** El proyecto deberá incluir un manual básico para el administrador.

**RNF-269.** El proyecto deberá incluir un manual básico para los usuarios.

**RNF-270.** La documentación deberá actualizarse cuando cambien funciones importantes.

---

# 23. Matriz resumida de requisitos no funcionales

| Categoría                      | Rango             |
| ------------------------------ | ----------------- |
| Calidad general                | RNF-001 a RNF-005 |
| Rendimiento                    | RNF-006 a RNF-018 |
| Disponibilidad y confiabilidad | RNF-019 a RNF-030 |
| Seguridad                      | RNF-031 a RNF-077 |
| Privacidad                     | RNF-078 a RNF-089 |
| Usabilidad                     | RNF-090 a RNF-105 |
| Accesibilidad                  | RNF-106 a RNF-118 |
| Compatibilidad                 | RNF-119 a RNF-128 |
| Diseño adaptable               | RNF-129 a RNF-135 |
| Mantenimiento                  | RNF-136 a RNF-150 |
| Escalabilidad                  | RNF-151 a RNF-160 |
| Base de datos                  | RNF-161 a RNF-170 |
| Almacenamiento multimedia      | RNF-171 a RNF-179 |
| Respaldo y recuperación        | RNF-180 a RNF-194 |
| Monitoreo y registros          | RNF-195 a RNF-208 |
| Pruebas y calidad              | RNF-209 a RNF-223 |
| Despliegue e infraestructura   | RNF-224 a RNF-238 |
| Control de versiones           | RNF-239 a RNF-247 |
| Aspectos lingüísticos          | RNF-248 a RNF-258 |
| Documentación                  | RNF-259 a RNF-270 |

---

# 24. Priorización

## Prioridad alta

Los siguientes requisitos deberán cumplirse antes del despliegue de la versión 1:

- Seguridad de contraseñas.
- HTTPS.
- Control de roles.
- Validación de datos.
- Persistencia.
- Diseño responsive.
- Compatibilidad con navegadores modernos.
- Respaldos de PostgreSQL y MinIO.
- Protección de credenciales.
- Monitoreo básico.
- Pruebas de autenticación.
- Documentación de instalación.

## Prioridad media

Podrán completarse durante el desarrollo de la versión 1:

- Accesibilidad ampliada.
- Optimización de archivos.
- Reportes detallados de errores.
- Alertas automáticas.
- Rotación avanzada de registros.
- Pruebas automatizadas adicionales.
- Documentación de usuario.

## Prioridad de mejora continua

Podrán optimizarse progresivamente:

- Rendimiento avanzado.
- Escalabilidad horizontal.
- Alta disponibilidad.
- Réplicas de base de datos.
- Distribución externa de archivos.
- Automatización completa del despliegue.

---

# 25. Criterios generales de aceptación

Los requisitos no funcionales se considerarán cumplidos cuando exista evidencia mediante:

- Pruebas de rendimiento.
- Pruebas de seguridad.
- Pruebas de permisos.
- Pruebas en diferentes navegadores.
- Pruebas en distintos tamaños de pantalla.
- Revisión de configuración.
- Verificación de respaldos.
- Restauración de prueba.
- Consulta de registros.
- Revisión de documentación.
- Pruebas de reinicio de servicios.
- Inspección de PostgreSQL y MinIO.

---

# 26. Observación sobre la cantidad de requisitos

La cantidad de requisitos no representa la misma cantidad de pantallas, módulos o semanas de desarrollo.

Varios requisitos se cumplen mediante una sola implementación.

Por ejemplo, al configurar correctamente una cookie de autenticación pueden cumplirse simultáneamente varios requisitos relacionados con:

- `httpOnly`.
- `secure`.
- `sameSite`.
- Expiración.
- Protección de sesión.

De la misma manera, una sola pantalla de registro puede cubrir múltiples requisitos relacionados con campos, validaciones, mensajes y confirmación.

Los requisitos se encuentran separados para facilitar:

- Su verificación.
- La elaboración de pruebas.
- El seguimiento del avance.
- La presentación de evidencias.
- La documentación de las horas de práctica.

---

# 27. Aprobación del documento

| Responsable | Cargo o función             | Firma | Fecha |
| ----------- | --------------------------- | ----- | ----- |
|             | Responsable del proyecto    |       |       |
|             | Representante institucional |       |       |
|             | Revisor                     |       |       |
