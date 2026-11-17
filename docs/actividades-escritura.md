# Prácticas de escritura en Kaqchikel

## Corrección

Express compara el texto de la pregunta en su versión original con el envío. Para cada cadena usa `normalize("NFC").trim()` y exige igualdad exacta con la respuesta principal o una alternativa aprobada por ADMIN. Las mayúsculas, los espacios internos y su cantidad, la puntuación, las diéresis y los signos glotales son significativos. Por ejemplo, la secuencia `a` + U+0308 coincide con `ä`. El apóstrofo ASCII U+0027, el tipográfico U+2019 y la letra modificadora U+02BC son distintos. Un docente puede autorizar grafías concretas para una pregunta. La calificación indica si hubo coincidencia con las formas aprobadas para esa versión.

Cada pregunta admite una respuesta principal y hasta nueve alternativas distintas tras la normalización. El texto enviado admite hasta 500 unidades UTF-16, incluidos sus espacios exteriores. Express rechaza las respuestas en blanco, NUL y sustitutos Unicode aislados. PostgreSQL guarda el envío original, el veredicto y los identificadores de pregunta, versión, intento y solicitud.

## Versión y envío

Se reutilizan las rutas de administración, vista previa, apertura de intentos y respuestas. Para WRITING, `POST /api/v1/activity-attempts/:id/answers` recibe `questionId`, `requestId` y `responseText`. La sesión identifica al estudiante. La transacción bloquea su intento y evalúa solo la pregunta pendiente de la versión correspondiente. Un reenvío idéntico reproduce la respuesta de esa operación. Cambiar el texto original o la pregunta con el mismo identificador produce 409, incluso si los dos textos darían la misma nota. Un segundo identificador tampoco permite volver a puntuar una pregunta ya contestada. La vista previa aplica la misma comparación sin persistir intentos.

Las formas autorizadas se almacenan en orden como opciones privadas de la pregunta. La primera es la principal. La variante regional y el término vinculado se copian al crear la versión. En la pantalla de estudio se devuelve únicamente el enunciado de la pregunta pendiente, su identificador y la modalidad. Las formas aceptadas y el comentario educativo se entregan al corregir esa pregunta.

## Comprobación en Firefox

1. Con PostgreSQL, Garage, Express y Next.js de desarrollo activos, entra como ADMIN por `/admin/cursos` y abre el editor de contenido de una lección publicada con sus antecesores publicados.
2. En **Actividades formativas**, elige **Crear práctica de escritura**. Usa dos indicaciones en español. Vincula un término de una variante regional, revisa su respuesta principal y agrega una alternativa aprobada. Guarda y recarga. Comprueba el orden y abre **Vista previa** antes de pulsar **Mostrar**.
3. En una sesión USER entra por `/aprender/cursos`. Abre la lección y la práctica. Usa Tab y los botones de caracteres, sitúa el cursor en medio del texto y reemplaza una selección. Comprueba el resultado en escritorio y en el modo adaptable de Firefox.
4. En la primera pregunta escribe una alternativa aprobada con espacios exteriores. Debe aceptarse y mostrar la forma principal y la alternativa. En la segunda, cambia una diéresis o un apóstrofo por una forma que no figure entre las aceptadas. El resultado esperado es un acierto, un error y 50 %.
5. Para comprobar el historial, inicia un nuevo intento y déjalo abierto. Como ADMIN cambia la respuesta de una pregunta, guarda y vuelve a mostrar la práctica. Como USER recarga y continúa el intento con la respuesta anterior. Después de terminar, **Repetir práctica** debe usar la versión nueva.
