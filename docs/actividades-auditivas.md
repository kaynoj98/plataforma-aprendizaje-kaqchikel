# Comprensión auditiva en las lecciones

## Instalar el procesador local

**Windows.** Descarga una compilación para Windows desde los enlaces del proyecto FFmpeg, verifica el SHA-256 del archivo contra el publicado por el distribuidor y extrae el paquete en una carpeta permanente. En `apps/api/.env` configura las rutas a los dos ejecutables. Por ejemplo:

```dotenv
FFMPEG_PATH=C:/herramientas/ffmpeg/bin/ffmpeg.exe
FFPROBE_PATH=C:/herramientas/ffmpeg/bin/ffprobe.exe
```

**Ubuntu Server.** Instala el paquete de la distribución y comprueba que ambos ejecutables incluyan el protocolo de entrada `fd`. La cuenta que ejecuta Express necesita permiso de ejecución y un directorio temporal escribible. Usa una versión compatible si el paquete de la distribución carece de ese protocolo.

```sh
sudo apt update
sudo apt install ffmpeg
/usr/bin/ffmpeg -version
/usr/bin/ffprobe -version
/usr/bin/ffmpeg -protocols
/usr/bin/ffprobe -protocols
```

Con el paquete de Ubuntu, usa `FFMPEG_PATH=/usr/bin/ffmpeg` y `FFPROBE_PATH=/usr/bin/ffprobe`. En Windows puedes hacer las mismas comprobaciones con `& "C:/herramientas/ffmpeg/bin/ffmpeg.exe" -protocols` y el comando equivalente para FFprobe. Reinicia Express después de cambiar el entorno. [Descargas de FFmpeg](https://ffmpeg.org/download.html) · [Protocolo fd](https://ffmpeg.org/ffmpeg-protocols.html#fd).

## Formato, límites y privacidad

Express acepta los formatos de pronunciación del catálogo (MPEG, WAV, Ogg y M4A), hasta 30 MiB. Al guardar por primera vez convierte la primera pista de audio en WAV PCM mono, 32 kHz, 16 bits, con un máximo de cinco minutos. FFmpeg recibe únicamente el descriptor del archivo temporal. Los argumentos fijan el demultiplexor y permiten únicamente los protocolos fd y pipe. FFprobe verifica una única pista PCM y la ausencia de etiquetas y capítulos antes de subir el WAV. Un fallo impide guardar la nueva versión y mantiene disponible la edición anterior.

Un bloqueo de PostgreSQL limita la preparación a una grabación simultánea entre instancias de Express. La clave de Garage es determinista y ajena al nombre del archivo. Un segundo guardado de la misma grabación reutiliza el objeto. Si otra grabación está en proceso, el editor puede volver a guardar. El proceso tiene un hilo de decodificación, 60 segundos de conversión, 10 segundos de verificación, asignaciones individuales limitadas a 32 MiB y vigilancia periódica del consumo residente a 256 MiB por proceso. La salida PCM está limitada a 19 200 000 bytes. Los temporales se eliminan al finalizar.

## Probar en Firefox

1. Con PostgreSQL, Garage, Express y Next.js activos, abre `/admin/cursos` como ADMIN y entra al contenido de una lección de prueba publicada con todos sus antecesores publicados.
2. Crea una práctica con **Crear comprensión auditiva**. Añade dos preguntas. En una, sube una grabación autorizada. En la otra, elige la pronunciación de una palabra de vocabulario con la variante regional adecuada. Prueba también reemplazar desde la biblioteca. Introduce transcripciones revisadas y al menos dos opciones por pregunta, marca una correcta y guarda.
3. Recarga, comprueba el orden y abre **Vista previa**. Las grabaciones comienzan en pausa. Comprueba reproducción, pausa, repetición y velocidades 0.75× y 1.0×. La transcripción aparece con la retroalimentación únicamente después de responder. La vista previa no registra intentos. Pulsa **Mostrar**.
4. En una sesión USER separada entra por `/aprender/cursos`. Abre la lección y deja la primera pregunta sin responder. Desde ADMIN reemplaza su audio y transcripción, guarda y vuelve a mostrar la actividad. Al recargar y reabrir la práctica como USER, comprueba la grabación y la transcripción originales. Termina y usa **Repetir práctica** para comprobar la nueva versión.
5. Navega con Tab, activa la reproducción y cambia de pregunta o sal de la lección. El audio anterior debe detenerse. En vista móvil revisa los controles y las opciones. El enlace de estudio por escrito lleva al vocabulario sin puntuar una práctica auditiva. Verifica la claridad de la pronunciación a ambas velocidades con grabaciones revisadas por el equipo lingüístico.
6. Para verificar permisos con dos cuentas USER de prueba, intenta consultar la ruta de acceso a la pregunta de un intento de la otra cuenta (sin copiar cookies ni URLs firmadas). Express debe devolver 404. En una sesión USER, la ruta administrativa de vista previa debe devolver 403.

## Comprobaciones automatizadas

Con los servicios locales activos, desde PowerShell en la raíz:

```powershell
pnpm typecheck
pnpm lint
$env:TEST_ACTIVITIES_DB='1'
pnpm --filter @kaqchikel/api exec vitest run tests/activities.integration.test.ts tests/practice-audio.test.ts
Remove-Item Env:TEST_ACTIVITIES_DB
```

La prueba de integración usa identidades temporales y limpia sus propios registros y archivos. La prueba de formatos reutiliza el silencio técnico del repositorio.
