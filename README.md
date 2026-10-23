# Adriana & Pablo — 15 de mayo de 2027

Invitación de boda. Una sola página, sin dependencias ni build: se abre
`index.html` en cualquier navegador y funciona.

## Cómo se usa

Abre `index.html`. Sale un sobre; al hacer clic se abre y da paso a la
invitación. El scroll está bloqueado hasta entonces.

### Enlace personalizado por invitado

Añade `?n=` con el nombre y aparecerá en la pantalla del sobre, además de
rellenarse solo en el formulario de confirmación:

```
index.html?n=Ana%20María%20López
```

## Qué hay que editar

Todo lo configurable está junto, al principio del `<script>` del final de
`index.html`:

| constante    | qué es                                                   |
|--------------|----------------------------------------------------------|
| `FECHA_BODA` | fecha y hora de la boda. De aquí salen la cuenta atrás, la portada y el cierre |
| `CORREO_RSVP` | correo que recibe las confirmaciones (vía FormSubmit)   |
| `IBAN`       | cuenta para el regalo                                     |
| `CANCION`    | ruta del mp3 de fondo (opcional)                          |
| `RESTRICCIONES`, `TALLAS` | opciones de los desplegables del formulario  |

## Confirmaciones por correo

El formulario manda cada respuesta a `CORREO_RSVP` a través de
[FormSubmit](https://formsubmit.co), sin servidor propio. La primera vez que
alguien envía el formulario desde la web publicada, FormSubmit manda un
correo de activación a esa dirección: hay que abrirlo y confirmar. Hasta
entonces las respuestas no llegan, así que conviene hacer una prueba antes
de mandar la invitación. Desde `file://` no funciona; hay que probarlo en
la web publicada.

El envío espera hasta dos minutos la respuesta de FormSubmit: el correo puede
llegar antes de que el servicio devuelva la confirmación. Durante la espera se
bloquean los envíos repetidos. Solo se muestra «Hemos recibido tu confirmación»
si el servicio responde correctamente con `success: true`. Si se pierde la
respuesta, se conservan los campos y se pide comprobar la recepción con los
novios antes de reenviar; no hay reintentos automáticos.

Para comprobar las regresiones del envío sin mandar correos reales:

```sh
node --test tests/rsvp.test.cjs
```

## Estructura

```
index.html     la página entera: estructura, estilos y lógica
fotos/              pedida.jpg  muro.jpg  calle.jpg  campo.jpg  sagrada.jpg
                    noche.jpg  rojo.jpg  jardin.jpg  logrono.jpg
assets/             piezas del sobre: lacre, texturas de papel y sombras
musica/             cancion.mp3 (opcional, no versionado)
```

Si no existe `musica/cancion.mp3`, el botón de música no aparece. Si falta
alguna foto, su hueco muestra un marco rayado con el nombre del archivo que
falta en vez de romperse.

## Tipografías

Bodoni Moda para los títulos, Inria Serif para el texto y Allura para la
caligrafía. Las tres se cargan desde Google Fonts.
