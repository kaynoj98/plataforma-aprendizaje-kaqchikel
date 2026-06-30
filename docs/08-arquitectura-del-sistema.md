# Arquitectura del sistema

## Plataforma web para el aprendizaje del idioma kaqchikel

**Institución:** Dirección General de Educación Bilingüe Intercultural —DIGEBI—, Ministerio de Educación de Guatemala
**Nombre del proyecto:** Plataforma web para el aprendizaje del idioma kaqchikel
**Versión del documento:** 1.0
**Versión del sistema:** Versión 1
**Estado:** Diseño inicial
**Fecha:** Junio de 2026

---

## 1. Introducción

El presente documento define la arquitectura técnica de la primera versión de la plataforma web para el aprendizaje del idioma kaqchikel.

La arquitectura describe la forma en que se organizarán y comunicarán los componentes principales del sistema:

- Frontend.
- Backend.
- Base de datos.
- Almacenamiento multimedia.
- Proxy inverso.
- Túnel de acceso.
- Monitoreo.
- Registros.
- Respaldos.
- Servidor dedicado.
- Volumen externo.

La solución será implementada mediante contenedores Docker y administrada mediante Docker Compose.

La plataforma se diseñará con una arquitectura modular y por capas, separando la presentación, la lógica de negocio, el acceso a datos y la infraestructura.

---

## 2. Objetivo del documento

Definir una arquitectura que permita que la plataforma sea:

- Segura.
- Modular.
- Mantenible.
- Desplegable.
- Escalable.
- Recuperable.
- Adaptable a futuras versiones.
- Fácil de supervisar.
- Adecuada para un servidor dedicado.

Este documento servirá como referencia para:

- Crear la estructura del repositorio.
- Configurar Docker Compose.
- Definir las redes y volúmenes.
- Desarrollar el frontend.
- Desarrollar el backend.
- Configurar PostgreSQL.
- Configurar MinIO.
- Configurar Nginx.
- Configurar Cloudflare Tunnel.
- Implementar respaldos.
- Implementar monitoreo.
- Preparar el despliegue de producción.

---

# 3. Principios de arquitectura

La arquitectura seguirá los siguientes principios.

## 3.1 Separación de responsabilidades

Cada componente tendrá una responsabilidad específica.

```text
Frontend
Presentación e interacción con el usuario.

Backend
Reglas de negocio, seguridad, autorización y API.

PostgreSQL
Persistencia de información estructurada.

MinIO
Almacenamiento de archivos multimedia.

Nginx
Proxy inverso y distribución del tráfico.

Cloudflare Tunnel
Acceso externo seguro al servidor.

Docker Compose
Administración conjunta de servicios.
```

## 3.2 Seguridad por capas

La seguridad no dependerá de un único componente.

Se aplicarán controles en:

- Cloudflare.
- Cloudflare Tunnel.
- Nginx.
- Backend Express.
- Cookies.
- Roles.
- Validación de datos.
- PostgreSQL.
- MinIO.
- Sistema operativo.
- Redes Docker.

## 3.3 Servicios desacoplados

Los componentes se ejecutarán como servicios separados para facilitar:

- Mantenimiento.
- Actualización.
- Reinicio.
- Pruebas.
- Supervisión.
- Escalabilidad.

## 3.4 Persistencia independiente

Los datos no deberán depender del ciclo de vida de los contenedores.

Los contenedores podrán eliminarse y reconstruirse sin perder:

- Usuarios.
- Cursos.
- Lecciones.
- Progreso.
- Evaluaciones.
- Archivos.
- Respaldos.
- Registros persistentes.

## 3.5 Acceso controlado

Los usuarios no deberán acceder directamente a:

- PostgreSQL.
- MinIO.
- Dozzle.
- Uptime Kuma.
- Consolas administrativas.
- Servicios internos de Docker.

---

# 4. Estilo arquitectónico

La plataforma utilizará una combinación de:

- Arquitectura cliente-servidor.
- Arquitectura por capas.
- Backend modular.
- API REST.
- Monorepositorio.
- Contenedores independientes.
- Almacenamiento de objetos.
- Proxy inverso.
- Túnel seguro.

La versión 1 no utilizará una arquitectura de microservicios completa.

Aunque los servicios se ejecutarán en contenedores separados, el backend se mantendrá como una aplicación modular única.

Esta decisión reduce la complejidad y facilita el desarrollo por una sola persona.

---

# 5. Vista general de la arquitectura

```text
Usuario
   │
   │ HTTPS
   ▼
Dominio propio
   │
   ▼
Cloudflare
   │
   ▼
Cloudflare Tunnel
   │
   ▼
Nginx
   ├── Frontend Next.js
   └── Backend Express
          ├── PostgreSQL
          ├── MinIO
          ├── Servicio SMTP
          └── Sistema de auditoría

Servicios internos
   ├── Uptime Kuma
   ├── Dozzle
   └── Servicio de respaldos
```

---

# 6. Arquitectura por capas

La plataforma se organizará en cinco capas principales.

## 6.1 Capa de presentación

Tecnologías:

- Next.js.
- React.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.

Responsabilidades:

- Mostrar páginas.
- Presentar formularios.
- Administrar navegación.
- Mostrar cursos y lecciones.
- Reproducir contenido multimedia.
- Presentar evaluaciones.
- Mostrar progreso.
- Mostrar panel administrativo.
- Validar datos básicos en el cliente.
- Consumir la API.

La capa de presentación no deberá:

- Conectarse directamente a PostgreSQL.
- Conectarse directamente a MinIO para operaciones administrativas.
- Decidir por sí sola los permisos definitivos.
- Contener credenciales privadas.
- Ejecutar reglas críticas de negocio.

---

## 6.2 Capa de API

Tecnologías:

- Node.js.
- Express.
- TypeScript.
- Zod.
- Prisma Client.

Responsabilidades:

- Recibir solicitudes HTTP.
- Validar datos.
- Autenticar sesiones.
- Verificar roles.
- Aplicar permisos.
- Ejecutar reglas de negocio.
- Consultar PostgreSQL.
- Administrar archivos en MinIO.
- Enviar correos.
- Crear auditoría.
- Responder al frontend.
- Manejar errores.

La API será el punto central para las operaciones privadas.

---

## 6.3 Capa de lógica de negocio

Estará ubicada dentro del backend.

Responsabilidades:

- Registro de usuarios.
- Confirmación de cuentas.
- Manejo de sesiones.
- Administración de cursos.
- Publicación de contenido.
- Administración de evaluaciones.
- Calificación.
- Cálculo de progreso.
- Envío de notificaciones.
- Validación de relaciones.
- Reglas de eliminación.
- Auditoría.

Ejemplo:

```text
Controller
   ↓
Service
   ↓
Repository
   ↓
Prisma
   ↓
PostgreSQL
```

---

## 6.4 Capa de persistencia

Componentes:

- PostgreSQL.
- Prisma ORM.
- MinIO.
- Volúmenes persistentes.

Responsabilidades:

- Guardar datos estructurados.
- Mantener relaciones.
- Guardar metadatos.
- Almacenar archivos multimedia.
- Conservar información después de reinicios.
- Permitir respaldos y restauración.

---

## 6.5 Capa de infraestructura

Componentes:

- Docker.
- Docker Compose.
- Nginx.
- Cloudflare.
- Cloudflare Tunnel.
- Uptime Kuma.
- Dozzle.
- Servicio de respaldos.
- Servidor dedicado.
- Volumen externo.

Responsabilidades:

- Ejecutar servicios.
- Proteger el acceso.
- Distribuir tráfico.
- Mantener datos persistentes.
- Supervisar disponibilidad.
- Consultar registros.
- Realizar respaldos.
- Reiniciar servicios.

---

# 7. Componentes principales

## 7.1 Frontend web

Nombre del servicio:

```text
web
```

Tecnologías:

- Next.js.
- React.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.

Responsabilidades:

- Página pública.
- Registro.
- Inicio de sesión.
- Dashboard del usuario.
- Catálogo de cursos.
- Reproductor de lecciones.
- Evaluaciones.
- Progreso.
- Notificaciones.
- Panel administrativo.

El frontend se comunicará con el backend mediante solicitudes HTTP o HTTPS.

---

## 7.2 Backend API

Nombre del servicio:

```text
api
```

Tecnologías:

- Node.js.
- Express.
- TypeScript.
- Prisma.
- Zod.

Responsabilidades:

- API REST.
- Autenticación.
- Autorización.
- Usuarios.
- Cursos.
- Lecciones.
- Multimedia.
- Evaluaciones.
- Progreso.
- Notificaciones.
- Auditoría.
- Reportes.
- Configuración.

El backend será el único componente autorizado para acceder directamente a PostgreSQL.

---

## 7.3 Base de datos

Nombre del servicio:

```text
postgres
```

Tecnología:

- PostgreSQL.

Responsabilidades:

- Almacenar usuarios.
- Almacenar sesiones.
- Almacenar cursos.
- Almacenar lecciones.
- Almacenar evaluaciones.
- Almacenar progreso.
- Almacenar metadatos.
- Almacenar auditoría.
- Almacenar configuración.

PostgreSQL no deberá exponer su puerto a Internet.

---

## 7.4 Almacenamiento multimedia

Nombre del servicio:

```text
minio
```

Tecnología:

- MinIO.

Responsabilidades:

- Almacenar imágenes.
- Almacenar audios.
- Almacenar videos.
- Almacenar documentos.
- Almacenar fotografías de perfil.
- Almacenar portadas.

MinIO utilizará el volumen externo para almacenar los archivos.

El acceso deberá realizarse mediante el backend o mediante enlaces temporales autorizados.

---

## 7.5 Proxy inverso

Nombre del servicio:

```text
nginx
```

Tecnología:

- Nginx.

Responsabilidades:

- Recibir el tráfico proveniente del túnel.
- Enviar solicitudes web al frontend.
- Enviar solicitudes `/api` al backend.
- Aplicar límites de tamaño.
- Aplicar encabezados.
- Manejar tiempos de espera.
- Centralizar el acceso interno.

Ejemplo de distribución:

```text
/            → web
/api/        → api
/media/      → api o ruta controlada
```

---

## 7.6 Cloudflare Tunnel

Nombre del servicio:

```text
cloudflared
```

Responsabilidades:

- Conectar el servidor con Cloudflare.
- Evitar la apertura directa de puertos públicos.
- Asociar el dominio con Nginx.
- Mantener un túnel saliente desde el servidor.

El servidor no deberá depender de una dirección IP pública fija para exponer la plataforma.

---

## 7.7 Monitoreo

Nombre del servicio:

```text
uptime-kuma
```

Responsabilidades:

- Comprobar disponibilidad.
- Consultar endpoints de salud.
- Registrar tiempos de respuesta.
- Generar alertas cuando sea posible.

Servicios que podrán supervisarse:

- Página principal.
- API.
- PostgreSQL.
- MinIO.
- Nginx.
- Cloudflare Tunnel.

---

## 7.8 Visualización de registros

Nombre del servicio:

```text
dozzle
```

Responsabilidades:

- Consultar logs de contenedores.
- Facilitar el diagnóstico.
- Revisar errores.
- Observar reinicios.

Dozzle deberá ser accesible únicamente desde una red administrativa controlada.

---

## 7.9 Servicio de respaldos

Nombre del servicio:

```text
backup
```

Responsabilidades:

- Ejecutar `pg_dump`.
- Respaldar archivos de MinIO.
- Guardar configuraciones.
- Aplicar política de retención.
- Registrar errores.
- Generar comprobaciones de integridad.

El servicio podrá ejecutarse mediante:

- Contenedor programado.
- Cron del sistema.
- Script administrativo.

---

# 8. Servicios previstos en Docker Compose

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

## Servicios iniciales de desarrollo

Durante la primera etapa podrán levantarse únicamente:

```text
web
api
postgres
minio
```

## Servicios para producción

En producción se agregarán:

```text
nginx
cloudflared
uptime-kuma
dozzle
backup
```

---

# 9. Redes Docker

Se recomienda utilizar varias redes internas.

## 9.1 Red pública interna

Nombre sugerido:

```text
frontend_net
```

Servicios:

- Nginx.
- Frontend.
- Backend.
- Cloudflared.

Propósito:

Permitir la comunicación relacionada con solicitudes web.

---

## 9.2 Red de datos

Nombre sugerido:

```text
data_net
```

Servicios:

- Backend.
- PostgreSQL.
- MinIO.
- Servicio de respaldos.

Propósito:

Separar la comunicación de datos del tráfico público.

---

## 9.3 Red de monitoreo

Nombre sugerido:

```text
monitoring_net
```

Servicios:

- Uptime Kuma.
- Dozzle.
- Servicios supervisados.

Propósito:

Permitir la supervisión sin exponer herramientas administrativas públicamente.

---

## 9.4 Representación de redes

```text
frontend_net
├── cloudflared
├── nginx
├── web
└── api

data_net
├── api
├── postgres
├── minio
└── backup

monitoring_net
├── uptime-kuma
├── dozzle
├── nginx
├── web
├── api
├── postgres
└── minio
```

PostgreSQL no deberá conectarse directamente a la red pública interna.

---

# 10. Puertos internos

Los puertos definitivos podrán ajustarse durante la implementación.

| Servicio      | Puerto interno sugerido | Exposición pública  |
| ------------- | ----------------------: | ------------------- |
| Next.js       |                    3000 | No directa          |
| Express       |                    4000 | No directa          |
| PostgreSQL    |                    5432 | No                  |
| MinIO API     |                    9000 | No                  |
| MinIO consola |                    9001 | No pública          |
| Nginx         |                      80 | Solo mediante túnel |
| Uptime Kuma   |                    3001 | No pública          |
| Dozzle        |                    8080 | No pública          |

En desarrollo podrán exponerse algunos puertos únicamente en la computadora local.

---

# 11. Flujo de una solicitud pública

Ejemplo: abrir la página principal.

```text
Navegador
   ↓
Dominio
   ↓
Cloudflare
   ↓
Cloudflare Tunnel
   ↓
Nginx
   ↓
Next.js
   ↓
Respuesta HTML
   ↓
Navegador
```

---

# 12. Flujo de una solicitud a la API

Ejemplo: consultar cursos.

```text
Navegador
   ↓
Cloudflare
   ↓
Cloudflare Tunnel
   ↓
Nginx
   ↓
Express
   ↓
Middleware de autenticación
   ↓
Controlador
   ↓
Servicio
   ↓
Repositorio
   ↓
Prisma
   ↓
PostgreSQL
   ↓
Respuesta JSON
```

---

# 13. Flujo de autenticación

```text
Usuario
   ↓
Formulario de inicio de sesión
   ↓
Next.js
   ↓
POST /api/auth/login
   ↓
Express
   ↓
Validación con Zod
   ↓
Consulta de usuario con Prisma
   ↓
Verificación de contraseña
   ↓
Creación de sesión
   ↓
Cookie httpOnly
   ↓
Respuesta autenticada
```

La cookie será enviada automáticamente en las solicitudes posteriores.

---

# 14. Flujo de carga de archivos

```text
Administrador
   ↓
Formulario de carga
   ↓
Frontend
   ↓
Backend
   ↓
Validación de sesión
   ↓
Validación de rol ADMIN
   ↓
Validación de tipo y tamaño
   ↓
Generación de objectKey
   ↓
Carga en MinIO
   ↓
Registro de metadatos en PostgreSQL
   ↓
Registro de auditoría
   ↓
Respuesta al administrador
```

Si la carga en MinIO funciona, pero el registro en PostgreSQL falla, el backend deberá intentar eliminar el objeto cargado para evitar archivos huérfanos.

---

# 15. Flujo de reproducción multimedia

```text
Usuario
   ↓
Solicita audio o video
   ↓
Backend valida acceso
   ↓
Backend obtiene referencia
   ↓
MinIO genera acceso controlado
   ↓
Navegador reproduce el recurso
```

Se podrán utilizar dos estrategias:

## Estrategia A: backend como intermediario

El backend recibe el archivo y lo transmite al usuario.

Ventajas:

- Mayor control.
- Permisos centralizados.

Desventajas:

- Mayor carga para el backend.

## Estrategia B: enlace temporal

El backend genera un enlace temporal de MinIO.

Ventajas:

- Menor carga en el backend.
- Mejor para archivos grandes.

Desventajas:

- Requiere controlar correctamente la expiración.

Para archivos grandes se recomienda utilizar enlaces temporales autorizados.

---

# 16. Flujo de evaluación

```text
Usuario
   ↓
Inicia evaluación
   ↓
Backend crea intento
   ↓
Usuario envía respuestas
   ↓
Backend valida preguntas
   ↓
Backend calcula puntuación
   ↓
Backend guarda respuestas
   ↓
Backend actualiza progreso
   ↓
Backend devuelve resultado
```

Las respuestas correctas no deberán enviarse al navegador antes de finalizar el intento.

---

# 17. Flujo de publicación

```text
Administrador
   ↓
Selecciona publicar
   ↓
Backend valida rol
   ↓
Backend valida contenido
   ↓
Backend verifica relaciones
   ↓
Actualiza estado
   ↓
Registra fecha
   ↓
Registra auditoría
   ↓
Genera notificación opcional
```

---

# 18. Flujo de respaldo

```text
Tarea programada
   ↓
Servicio backup
   ├── pg_dump de PostgreSQL
   ├── Copia o sincronización de MinIO
   ├── Copia de configuración
   └── Verificación
          ↓
Volumen externo
          ↓
Política de retención
          ↓
Registro de resultado
```

---

# 19. Arquitectura del frontend

La aplicación web se organizará mediante Next.js App Router.

```text
apps/web/src/
├── app/
│   ├── (public)/
│   ├── (platform)/
│   ├── (admin)/
│   ├── layout.tsx
│   ├── error.tsx
│   └── not-found.tsx
│
├── components/
├── features/
├── hooks/
├── lib/
├── services/
├── schemas/
└── types/
```

## Área pública

Incluye:

- Inicio.
- Acerca de.
- Registro.
- Inicio de sesión.
- Recuperación.
- Confirmación.

## Área de usuario

Incluye:

- Dashboard personal.
- Cursos.
- Lecciones.
- Vocabulario.
- Evaluaciones.
- Progreso.
- Notificaciones.
- Perfil.

## Área administrativa

Incluye:

- Dashboard administrativo.
- Usuarios.
- Cursos.
- Lecciones.
- Multimedia.
- Vocabulario.
- Evaluaciones.
- Reportes.
- Auditoría.
- Configuración.

---

# 20. Arquitectura del backend

```text
apps/api/src/
├── config/
├── lib/
├── middlewares/
├── modules/
├── services/
├── jobs/
├── utils/
├── app.ts
└── server.ts
```

## Configuración

```text
config/
├── env.ts
├── database.ts
├── minio.ts
├── mail.ts
└── security.ts
```

## Middlewares

```text
middlewares/
├── authenticate.ts
├── authorize.ts
├── validate.ts
├── rateLimit.ts
├── requestId.ts
└── errorHandler.ts
```

## Módulos

```text
modules/
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

## Trabajos automáticos

```text
jobs/
├── cleanupTokens.ts
├── cleanupSessions.ts
├── sendEmails.ts
├── generateNotifications.ts
└── verifyStorage.ts
```

---

# 21. Patrón interno del backend

Cada módulo podrá utilizar la siguiente estructura:

```text
module/
├── module.controller.ts
├── module.service.ts
├── module.repository.ts
├── module.routes.ts
├── module.schemas.ts
├── module.types.ts
└── module.constants.ts
```

## Controller

Responsable de:

- Recibir la solicitud.
- Obtener parámetros.
- Invocar servicios.
- Enviar respuesta.

## Service

Responsable de:

- Reglas de negocio.
- Validaciones de proceso.
- Transacciones.
- Coordinación entre módulos.

## Repository

Responsable de:

- Consultas con Prisma.
- Creación de datos.
- Actualización de datos.
- Eliminación controlada.

## Routes

Responsable de:

- Definir rutas.
- Aplicar middlewares.
- Asociar controladores.

## Schemas

Responsable de:

- Validar entrada con Zod.

---

# 22. Comunicación frontend-backend

El frontend consumirá la API mediante una capa centralizada.

```text
apps/web/src/lib/api.ts
```

Responsabilidades:

- Definir la URL base.
- Enviar cookies.
- Manejar errores.
- Transformar respuestas.
- Añadir encabezados comunes.
- Controlar expiración de sesión.

Ejemplo conceptual:

```text
Frontend
   ↓
apiClient
   ↓
/api/*
   ↓
Backend
```

Los componentes no deberán repetir manualmente la configuración de las solicitudes.

---

# 23. API REST

La API utilizará una estructura inicial como:

```text
/api/auth
/api/users
/api/courses
/api/levels
/api/units
/api/lessons
/api/vocabulary
/api/media
/api/quizzes
/api/progress
/api/notifications
/api/admin
/api/health
```

Ejemplos:

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/users/me
GET    /api/courses
GET    /api/courses/:courseId
POST   /api/admin/courses
PATCH  /api/admin/courses/:courseId
POST   /api/admin/media
GET    /api/progress/me
```

---

# 24. Formato general de respuestas

## Respuesta exitosa

```json
{
  "success": true,
  "data": {}
}
```

## Respuesta con lista

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 120,
    "totalPages": 6
  }
}
```

## Respuesta de error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Los datos enviados no son válidos.",
    "details": []
  }
}
```

---

# 25. Persistencia

## 25.1 PostgreSQL

Ubicación recomendada:

- SSD interno del servidor.

Motivo:

- Mayor velocidad.
- Menor latencia.
- Mejor rendimiento para consultas.

El volumen de PostgreSQL deberá estar separado del código fuente.

## 25.2 MinIO

Ubicación recomendada:

- Volumen externo de 1 TB.

Motivo:

- Mayor capacidad.
- Almacenamiento de archivos grandes.
- Separación de datos audiovisuales.

## 25.3 Respaldos

Ubicación inicial:

- Volumen externo.

Ubicación adicional recomendada:

- Segundo dispositivo.
- Otro servidor.
- Almacenamiento remoto autorizado.

---

# 26. Estructura de almacenamiento del servidor

Ejemplo conceptual:

```text
/srv/kaqchikel/
├── postgres/
│   └── data/
├── minio/
│   └── data/
├── backups/
│   ├── daily/
│   ├── weekly/
│   └── monthly/
├── nginx/
├── cloudflared/
├── uptime-kuma/
├── dozzle/
└── logs/
```

El volumen externo podrá montarse como:

```text
/mnt/kaqchikel-storage/
```

Ejemplo:

```text
/mnt/kaqchikel-storage/
├── minio/
├── backups/
└── exports/
```

La ruta definitiva dependerá de la configuración del servidor.

---

# 27. Volúmenes Docker

Se utilizarán volúmenes persistentes o montajes del host.

Ejemplo conceptual:

```text
postgres_data
minio_data
uptime_data
backup_data
```

## Datos que deben persistir

- PostgreSQL.
- MinIO.
- Uptime Kuma.
- Respaldos.
- Configuración de Cloudflare Tunnel.
- Certificados o archivos necesarios.
- Logs seleccionados.

## Datos que no necesitan persistencia obligatoria

- Contenedores.
- Dependencias instaladas durante el build.
- Archivos temporales.
- Cachés reconstruibles.

---

# 28. Seguridad de red

## Servicios externos

Solo deberán ser accesibles públicamente:

- Plataforma web.
- Rutas necesarias de la API.

## Servicios internos

No deberán exponerse públicamente:

- PostgreSQL.
- MinIO API.
- MinIO Console.
- Dozzle.
- Uptime Kuma.
- Docker daemon.

## Reglas

- Cloudflare Tunnel será el punto de entrada.
- Nginx recibirá el tráfico interno.
- PostgreSQL permanecerá en la red de datos.
- MinIO permanecerá en la red de datos.
- Las herramientas administrativas requerirán acceso restringido.

---

# 29. Seguridad de la aplicación

La arquitectura deberá contemplar:

- HTTPS.
- Cookies `httpOnly`.
- Cookies `secure` en producción.
- Política `sameSite`.
- Hash seguro de contraseñas.
- Sesiones almacenadas en PostgreSQL.
- Validación con Zod.
- Control de roles.
- Rate limiting.
- Encabezados de seguridad.
- CORS restringido.
- Límites de archivos.
- Auditoría.
- Ocultamiento de errores internos.
- Variables de entorno.
- Rotación de credenciales.

---

# 30. Variables de entorno

Cada servicio utilizará variables de entorno.

## Backend

Ejemplos:

```text
NODE_ENV
PORT
DATABASE_URL
SESSION_SECRET
APP_URL
CORS_ORIGIN
MINIO_ENDPOINT
MINIO_PORT
MINIO_ACCESS_KEY
MINIO_SECRET_KEY
MINIO_BUCKET
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASSWORD
SMTP_FROM
```

## Frontend

Ejemplos:

```text
NODE_ENV
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_API_URL
```

## PostgreSQL

Ejemplos:

```text
POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD
```

## MinIO

Ejemplos:

```text
MINIO_ROOT_USER
MINIO_ROOT_PASSWORD
```

Las credenciales reales no deberán guardarse en GitHub.

---

# 31. Entornos

La plataforma utilizará al menos dos entornos.

## 31.1 Desarrollo

Características:

- Ejecución en computadora local.
- Puertos expuestos localmente.
- Datos de prueba.
- Credenciales de desarrollo.
- Logs detallados.
- Recarga automática.
- Prisma Studio disponible.

## 31.2 Producción

Características:

- Servidor dedicado.
- Dominio real.
- Cloudflare Tunnel.
- HTTPS.
- Credenciales de producción.
- Logs controlados.
- Respaldos automáticos.
- Servicios reiniciables.
- Acceso administrativo restringido.

## 31.3 Entorno de pruebas opcional

En una etapa posterior podrá agregarse un entorno de pruebas o `staging`.

---

# 32. Dockerfiles

La plataforma tendrá como mínimo:

```text
apps/web/Dockerfile
apps/api/Dockerfile
```

## Frontend

El Dockerfile deberá:

- Instalar dependencias.
- Compilar Next.js.
- Ejecutar la versión de producción.
- Utilizar una imagen adecuada de Node.js.
- Evitar incluir archivos innecesarios.

## Backend

El Dockerfile deberá:

- Instalar dependencias.
- Generar Prisma Client.
- Compilar TypeScript.
- Ejecutar la API.
- Incluir únicamente archivos necesarios.

---

# 33. Docker Compose

El archivo principal será:

```text
compose.yaml
```

Podrán utilizarse archivos adicionales:

```text
compose.dev.yaml
compose.prod.yaml
```

## Responsabilidades

- Crear servicios.
- Crear redes.
- Crear volúmenes.
- Definir dependencias.
- Aplicar variables de entorno.
- Establecer reinicios.
- Configurar health checks.

---

# 34. Dependencias entre servicios

```text
web
└── api

api
├── postgres
└── minio

nginx
├── web
└── api

cloudflared
└── nginx

backup
├── postgres
└── minio

uptime-kuma
├── web
├── api
├── postgres
├── minio
└── nginx
```

Docker Compose podrá controlar el orden básico de arranque, pero cada aplicación deberá manejar servicios temporalmente no disponibles.

---

# 35. Health checks

## Backend

Ruta:

```text
GET /api/health
```

Respuesta básica:

```json
{
  "status": "ok",
  "service": "api"
}
```

## Estado ampliado

Ruta administrativa:

```text
GET /api/status
```

Podrá comprobar:

- PostgreSQL.
- MinIO.
- Servicio de correo.
- Espacio disponible.
- Versión de la aplicación.

La ruta ampliada no deberá exponer información sensible públicamente.

---

# 36. Reinicio y recuperación

Los servicios deberán utilizar políticas de reinicio apropiadas.

Ejemplo conceptual:

```text
restart: unless-stopped
```

Después de reiniciar el servidor:

1. Docker deberá iniciar.
2. Docker Compose deberá levantar los servicios.
3. PostgreSQL deberá montar sus datos.
4. MinIO deberá montar sus archivos.
5. El backend deberá reconectarse.
6. Nginx deberá reanudar el tráfico.
7. Cloudflare Tunnel deberá reconectarse.

---

# 37. Manejo de fallos

## Fallo del frontend

Resultado:

- La API puede continuar activa.
- Nginx devolverá un error temporal.
- Uptime Kuma detectará la caída.

## Fallo del backend

Resultado:

- El frontend podrá mostrar una página de error.
- PostgreSQL y MinIO conservarán sus datos.
- Los usuarios no podrán ejecutar operaciones privadas.

## Fallo de PostgreSQL

Resultado:

- El backend rechazará operaciones de datos.
- MinIO conservará los archivos.
- El sistema deberá evitar cargas que generen registros incompletos.

## Fallo de MinIO

Resultado:

- Los datos estructurados seguirán disponibles.
- La reproducción y carga multimedia fallarán temporalmente.
- El sistema deberá informar el problema.

## Fallo del correo

Resultado:

- La plataforma podrá continuar funcionando.
- Los correos quedarán como fallidos o pendientes.
- El error deberá registrarse.

## Fallo de Cloudflare Tunnel

Resultado:

- La plataforma no será accesible desde Internet.
- Los servicios internos podrán continuar funcionando.
- El túnel deberá reiniciarse automáticamente.

## Fallo del volumen externo

Resultado:

- Los archivos de MinIO podrían quedar temporalmente inaccesibles.
- Los respaldos no podrán escribirse.
- El sistema deberá alertar al administrador.

---

# 38. Consistencia entre PostgreSQL y MinIO

La plataforma deberá evitar:

- Objetos sin registro.
- Registros sin objeto.
- Archivos eliminados todavía relacionados.
- Metadatos incompletos.

## Carga

Orden recomendado:

1. Validar archivo.
2. Crear identificador.
3. Cargar en MinIO.
4. Guardar metadatos.
5. Marcar como disponible.

## Eliminación

Orden recomendado:

1. Verificar relaciones.
2. Marcar archivo como eliminado.
3. Eliminar objeto de MinIO.
4. Actualizar estado.
5. Registrar auditoría.

## Verificación periódica

Podrá implementarse un proceso para detectar:

- Objetos huérfanos.
- Registros sin archivo.
- Archivos dañados.
- Diferencias de tamaño.

---

# 39. Correo electrónico

El backend se conectará a un servicio SMTP.

Flujo:

```text
Backend
   ↓
Servicio de correo
   ↓
Correo personal del usuario
```

Tipos iniciales:

- Confirmación de cuenta.
- Bienvenida.
- Recuperación de contraseña.
- Cambio de contraseña.
- Avisos generales.
- Curso completado.

La falla del correo deberá registrarse sin exponer credenciales.

---

# 40. Auditoría

La auditoría se ejecutará dentro del backend.

Ejemplo:

```text
Administrador modifica curso
   ↓
Servicio actualiza PostgreSQL
   ↓
Servicio crea AuditLog
   ↓
Operación confirmada
```

La auditoría deberá registrar:

- Actor.
- Acción.
- Recurso.
- Fecha.
- IP.
- Valores relevantes.
- Resultado.

No deberá registrar:

- Contraseñas.
- Tokens.
- Secretos.
- Contenido sensible innecesario.

---

# 41. Registros de aplicación

Los logs deberán clasificarse.

```text
INFO
WARN
ERROR
```

Ejemplos:

```text
INFO  Usuario inició sesión
WARN  Intento de acceso rechazado
ERROR No se pudo conectar con MinIO
```

Los registros deberán incluir cuando sea posible:

- Fecha.
- Hora.
- Servicio.
- Nivel.
- Identificador de solicitud.
- Mensaje.
- Contexto seguro.

---

# 42. Respaldos

## PostgreSQL

Se utilizará:

```text
pg_dump
```

## MinIO

Podrá utilizarse:

- Sincronización.
- Copia incremental.
- Cliente compatible con S3.
- Herramienta de MinIO.

## Configuración

Se respaldarán:

- `compose.yaml`.
- Configuración de Nginx.
- Configuración del túnel.
- Scripts.
- Documentación.
- Lista de variables necesarias sin exponer secretos públicamente.

## Retención

```text
7 copias diarias
4 copias semanales
6 copias mensuales
```

---

# 43. Restauración

La recuperación deberá contemplar:

## Restauración de PostgreSQL

1. Detener escrituras.
2. Crear una base limpia.
3. Restaurar el respaldo.
4. Ejecutar verificaciones.
5. Reiniciar la API.
6. Validar usuarios, cursos y progreso.

## Restauración de MinIO

1. Montar almacenamiento.
2. Restaurar objetos.
3. Verificar estructura.
4. Comparar con metadatos.
5. Probar reproducción.

## Restauración completa

1. Instalar Docker.
2. Recuperar repositorio.
3. Restaurar configuración.
4. Restaurar variables.
5. Restaurar PostgreSQL.
6. Restaurar MinIO.
7. Levantar Docker Compose.
8. Validar dominio.
9. Validar túnel.
10. Ejecutar pruebas.

---

# 44. Monitoreo

Uptime Kuma deberá comprobar al menos:

```text
Página principal
/api/health
PostgreSQL
MinIO
Nginx
```

Indicadores útiles:

- Disponibilidad.
- Tiempo de respuesta.
- Última caída.
- Duración de interrupciones.
- Estado actual.

También deberá supervisarse:

- Espacio del disco interno.
- Espacio del volumen externo.
- Uso de memoria.
- Uso de CPU.
- Estado de contenedores.

---

# 45. Rendimiento

La arquitectura deberá considerar:

- Paginación.
- Índices.
- Caché del navegador.
- Optimización de imágenes.
- Streaming de audio y video.
- Límites de respuesta.
- Compresión.
- Consultas selectivas.
- Evitar cargar relaciones innecesarias.
- Procesamiento asincrónico de tareas no críticas.

Para la versión 1 no será obligatorio utilizar Redis.

Redis podrá evaluarse posteriormente para:

- Caché.
- Colas.
- Sesiones.
- Rate limiting distribuido.

---

# 46. Escalabilidad futura

La arquitectura permitirá en el futuro:

- Separar PostgreSQL a otro servidor.
- Separar MinIO a otro servidor.
- Agregar un CDN.
- Agregar réplicas del backend.
- Agregar balanceo de carga.
- Agregar almacenamiento S3 externo.
- Agregar colas de tareas.
- Agregar Redis.
- Agregar más administradores.
- Agregar nuevos roles.
- Agregar otros idiomas mayas.

La versión 1 se ejecutará inicialmente en un único servidor dedicado.

---

# 47. Arquitectura física inicial

```text
Servidor dedicado
├── Docker
│   ├── web
│   ├── api
│   ├── postgres
│   ├── minio
│   ├── nginx
│   ├── cloudflared
│   ├── uptime-kuma
│   ├── dozzle
│   └── backup
│
├── SSD interno
│   ├── Sistema operativo
│   ├── Código
│   └── PostgreSQL
│
└── Volumen externo de 1 TB
    ├── Archivos MinIO
    ├── Respaldos
    └── Exportaciones
```

---

# 48. Diagrama de despliegue simplificado

```text
┌───────────────────────────────────────────┐
│                Internet                   │
└─────────────────────┬─────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────┐
│               Cloudflare                  │
│       DNS, HTTPS y protección básica      │
└─────────────────────┬─────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────┐
│          Cloudflare Tunnel                │
└─────────────────────┬─────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────┐
│               Servidor                    │
│                                           │
│  ┌──────────┐                             │
│  │  Nginx   │                             │
│  └────┬─────┘                             │
│       │                                   │
│  ┌────┴───────────────┐                   │
│  ▼                    ▼                   │
│ Next.js             Express               │
│                         │                 │
│                 ┌───────┴────────┐        │
│                 ▼                ▼        │
│             PostgreSQL         MinIO      │
│                                           │
│  Uptime Kuma   Dozzle   Backups           │
└───────────────────────────────────────────┘
```

---

# 49. Repositorio

La arquitectura se administrará desde un monorepositorio.

```text
plataforma-kaqchikel/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   └── shared/
├── infrastructure/
│   ├── nginx/
│   ├── cloudflared/
│   ├── backups/
│   └── scripts/
├── docs/
├── compose.yaml
├── .env.example
├── .gitignore
└── README.md
```

---

# 50. Paquete compartido

El paquete compartido podrá contener:

- Tipos.
- Esquemas.
- Constantes.
- Roles.
- Estados.
- Respuestas comunes.
- Validaciones reutilizables.

No deberá contener:

- Credenciales.
- Prisma Client.
- Conexión a PostgreSQL.
- Acceso a MinIO.
- Lógica privada del backend.

---

# 51. Dependencias externas

La plataforma dependerá de:

- Servicio de Internet.
- Cloudflare.
- Servicio SMTP.
- Electricidad.
- Almacenamiento físico.
- Dominio.
- Servidor dedicado.

Estas dependencias deberán documentarse y supervisarse.

---

# 52. Decisiones arquitectónicas

Para la versión 1 se establecen las siguientes decisiones:

1. Se utilizará un monorepositorio.

2. Next.js y Express serán aplicaciones separadas.

3. Express será responsable de la lógica de negocio.

4. PostgreSQL será la base de datos principal.

5. Prisma será el ORM.

6. MinIO almacenará los archivos.

7. Nginx funcionará como proxy inverso.

8. Cloudflare Tunnel será el punto de acceso externo.

9. Docker Compose administrará los servicios.

10. PostgreSQL utilizará preferentemente el SSD interno.

11. MinIO utilizará el volumen externo.

12. Los respaldos se almacenarán inicialmente en el volumen externo.

13. No se utilizará Kubernetes en la versión 1.

14. No se utilizarán microservicios independientes.

15. No se utilizará Redis inicialmente.

16. Los permisos se validarán siempre en Express.

17. Los datos persistentes estarán separados de los contenedores.

18. Las herramientas de monitoreo no se expondrán públicamente.

---

# 53. Riesgos arquitectónicos

## Riesgo: servidor único

Impacto:

Una falla física puede detener toda la plataforma.

Mitigación:

- Respaldos.
- Monitoreo.
- UPS.
- Documentación de restauración.
- Copia externa.

## Riesgo: volumen externo

Impacto:

Pérdida o indisponibilidad de archivos.

Mitigación:

- Verificación de estado.
- Copia secundaria.
- Pruebas de restauración.
- Sistema de archivos estable.

## Riesgo: conexión a Internet

Impacto:

La plataforma deja de estar disponible externamente.

Mitigación:

- Monitoreo.
- Conexión estable.
- Reinicio automático del túnel.

## Riesgo: crecimiento multimedia

Impacto:

Agotamiento del espacio disponible.

Mitigación:

- Límites de carga.
- Compresión.
- Alertas.
- Expansión de almacenamiento.

## Riesgo: pérdida de credenciales

Impacto:

Acceso no autorizado o pérdida de administración.

Mitigación:

- Administrador de contraseñas.
- Copia segura de secretos.
- Rotación.
- Recuperación documentada.

---

# 54. Pruebas arquitectónicas

La arquitectura deberá validarse mediante:

- Prueba de conexión frontend-backend.
- Prueba de conexión backend-PostgreSQL.
- Prueba de conexión backend-MinIO.
- Prueba de carga de archivos.
- Prueba de persistencia.
- Prueba de reinicio.
- Prueba de caída del backend.
- Prueba de caída de MinIO.
- Prueba de restauración.
- Prueba de acceso mediante dominio.
- Prueba de Cloudflare Tunnel.
- Prueba de rutas privadas.
- Prueba de permisos.
- Prueba de monitoreo.
- Prueba de respaldos.

---

# 55. Criterios de aceptación

La arquitectura se considerará correctamente implementada cuando:

1. Todos los servicios puedan levantarse mediante Docker Compose.

2. El frontend pueda comunicarse con el backend.

3. El backend pueda comunicarse con PostgreSQL.

4. El backend pueda comunicarse con MinIO.

5. PostgreSQL conserve sus datos después de reiniciar.

6. MinIO conserve sus archivos después de reiniciar.

7. Nginx distribuya correctamente las solicitudes.

8. Cloudflare Tunnel permita acceder mediante el dominio.

9. PostgreSQL no esté expuesto públicamente.

10. MinIO no esté expuesto públicamente sin autorización.

11. Los usuarios puedan autenticarse mediante cookies seguras.

12. Las rutas administrativas estén protegidas.

13. Los archivos puedan cargarse y reproducirse.

14. Los respaldos puedan generarse.

15. Los respaldos puedan restaurarse.

16. Uptime Kuma detecte el estado de los servicios.

17. Dozzle permita consultar los registros.

18. Los servicios se reinicien automáticamente cuando corresponda.

19. Los contenedores puedan reconstruirse sin perder datos.

20. La documentación permita reinstalar la plataforma.

---

# 56. Orden de implementación

## Etapa 1

- Repositorio.
- Estructura de carpetas.
- Frontend.
- Backend.
- PostgreSQL.
- Prisma.

## Etapa 2

- Docker Compose.
- Redes.
- Volúmenes.
- Variables de entorno.
- Health checks.

## Etapa 3

- MinIO.
- Carga de archivos.
- Persistencia multimedia.

## Etapa 4

- Nginx.
- Cloudflare.
- Cloudflare Tunnel.
- Dominio.

## Etapa 5

- Uptime Kuma.
- Dozzle.
- Respaldos.
- Restauración.

## Etapa 6

- Seguridad final.
- Optimización.
- Pruebas.
- Documentación.

---

# 57. Resumen

La arquitectura de la versión 1 estará compuesta por:

```text
Next.js
Express
Prisma
PostgreSQL
MinIO
Nginx
Cloudflare Tunnel
Docker Compose
Uptime Kuma
Dozzle
Sistema de respaldos
```

La plataforma será desplegada inicialmente en un único servidor dedicado.

Los datos estructurados se almacenarán en PostgreSQL y los archivos audiovisuales en MinIO.

El acceso externo se realizará mediante Cloudflare Tunnel y Nginx.

La arquitectura estará preparada para crecer sin introducir desde el inicio herramientas innecesariamente complejas.

---

# 58. Aprobación del documento

| Responsable | Cargo o función             | Firma | Fecha |
| ----------- | --------------------------- | ----- | ----- |
|             | Responsable del proyecto    |       |       |
|             | Representante institucional |       |       |
|             | Revisor                     |       |       |
