# Ordenamiento de oraciones en Kaqchikel

Cada pregunta admite de 2 a 32 segmentos definidos por el responsable académico y hasta 16 órdenes alternativos. La oración principal conserva los espacios y la puntuación escritos por el autor. Cada segmento puede contener varias palabras. Express compara las grafías en NFC y conserva los textos originales, las diéresis, las mayúsculas y los signos glotales. Dos fichas con la misma grafía son intercambiables en la corrección. Cada ficha se debe usar exactamente una vez.

Las actividades reutilizan las rutas de edición, publicación, vista previa, intentos y respuestas. Cada versión conserva la oración, las opciones en su orden principal y las alternativas como permutaciones de sus posiciones. Express identifica cada ficha pública con una clave derivada del intento y del identificador privado del segmento. Ordenar las claves produce la misma mezcla al reabrir el intento. La respuesta inicial entrega las fichas y la indicación. La oración principal se entrega después de comprobar la respuesta.

La comprobación es definitiva por pregunta. La transacción del intento guarda la secuencia de identificadores, la versión, el resultado y el identificador de solicitud. Repetir la misma solicitud devuelve la respuesta original. Reutilizar su identificador para otra secuencia o pregunta devuelve HTTP 409.

## Verificación en Firefox

1. Como ADMIN, abre Cursos en el panel y navega hasta una lección publicada de prueba. En Actividades formativas elige **Crear ordenamiento de oraciones**. Introduce el título, las instrucciones y dos preguntas. Utiliza material revisado por el responsable académico.
2. Para la primera pregunta, incluye una palabra repetida, una unidad de varias palabras y puntuación. Introduce los segmentos en su orden principal. Agrega una alternativa y coloca todas las fichas en otro orden autorizado. Escribe la retroalimentación. En la segunda pregunta deja únicamente la respuesta principal.
3. Guarda y abre la vista previa. Selecciona la alternativa con el teclado y comprueba la respuesta. Verifica que se acepta. Sal de la vista previa y muestra la actividad. Anota el avance de una cuenta USER de prueba en el curso.
4. Con esa cuenta en otra sesión de Firefox, abre la lección y selecciona **Abrir práctica**. Anota el orden de las fichas. Recarga y vuelve a abrir la práctica. La mezcla inicial debe coincidir. La selección provisional se puede reconstruir antes de enviarla.
5. Con Tab y la barra espaciadora, selecciona varias fichas. Quita una desde **Tu orden**, usa **Reiniciar orden** y completa la alternativa. Intercambia las dos fichas idénticas. **Comprobar respuesta** debe habilitarse al colocar todas. Verifica la retroalimentación y avanza.
6. Antes de contestar la segunda pregunta, modifica su contenido como ADMIN, guarda y vuelve a mostrar la actividad. En la sesión USER, reabre el intento y comprueba que conserva la pregunta anterior. Envía una secuencia incorrecta. El resultado de dos preguntas debe ser un acierto, un error y 50 %. Usa **Repetir práctica** y verifica que aparece el contenido actualizado.
7. En la vista adaptable de Firefox, comprueba a 360 px que las fichas se distribuyen en varias líneas y que puedes quitarlas, reiniciar y enviar con el teclado. Verifica que resolver la práctica y usar la vista previa mantienen el avance académico previamente anotado.
